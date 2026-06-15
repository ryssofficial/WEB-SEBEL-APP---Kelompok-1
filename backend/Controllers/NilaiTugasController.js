// src/controllers/NilaiTugasController.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import NilaiTugasModel from '../models/Kelas/NilaiTugasModel.js';
import FileTugasModel from '../models/Kelas/FileTugasModel.js';
import QueryBuilder from '../Databases/QueryBuilder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Direktori penyimpanan file (sesuaikan dengan config server)
const UPLOAD_DIR = path.join(__dirname, '../storage/uploads/tugas');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Tipe file yang diizinkan
const ALLOWED_MIME = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain',
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

class NilaiTugasController {
    constructor() {
        this.index                = this.index.bind(this);
        this.getByRombel          = this.getByRombel.bind(this);
        this.getByRombelAndMapel  = this.getByRombelAndMapel.bind(this);
        this.create               = this.create.bind(this);
        this.update               = this.update.bind(this);
        this.delete               = this.delete.bind(this);
        this.uploadFile           = this.uploadFile.bind(this);
        this.getFiles             = this.getFiles.bind(this);
        this.deleteFile           = this.deleteFile.bind(this);
        this.downloadFile         = this.downloadFile.bind(this);
        this.getByIdSiswa         = this.getByIdSiswa.bind(this);
        this.getMapelBySiswa      = this.getMapelBySiswa.bind(this);
    }

    // ── GET semua ──────────────────────────────────
    async index(req, res) {
        try {
            const data = await NilaiTugasModel.withSiswa().get();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── GET per rombel ─────────────────────────────
    async getByRombel(req, res) {
        try {
            const { id_rombel } = req.params;
            const data = await NilaiTugasModel.withSiswa()
                .where('anggota_rombel.id_rombel', '=', id_rombel)
                .get();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── GET per rombel + mapel ─────────────────────
    async getByRombelAndMapel(req, res) {
        try {
            const { id_rombel, id_mapel } = req.params;
            const data = await NilaiTugasModel.withSiswa()
                .where('anggota_rombel.id_rombel', '=', id_rombel)
                .where('nilai_tugas.id_mapel', '=', id_mapel)
                .get();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── POST buat entri nilai_tugas baru ───────────
    async create(req, res) {
        try {
            const { id_anggota, id_mapel, tugas_ke, nilai, id_guru, tanggal_input, catatan } = req.body;
            if (!id_anggota || !id_mapel || !tugas_ke) {
                return res.status(400).json({
                    status: 'error',
                    message: 'id_anggota, id_mapel, dan tugas_ke wajib diisi.',
                });
            }
            const data = await NilaiTugasModel.create({
                id_anggota,
                id_mapel,
                tugas_ke,
                nilai:          nilai          ?? null,
                id_guru:        id_guru        ?? null,
                tanggal_input:  tanggal_input  ?? new Date().toISOString().split('T')[0],
                catatan:        catatan        ?? null,
            });
            res.status(201).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── PUT update nilai ───────────────────────────
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nilai, id_guru, catatan } = req.body;
            if (nilai === undefined || nilai === null) {
                return res.status(400).json({ status: 'error', message: 'Field nilai wajib diisi.' });
            }
            const data = await NilaiTugasModel.update(id, {
                nilai,
                ...(id_guru   !== undefined && { id_guru }),
                ...(catatan   !== undefined && { catatan }),
            });
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── DELETE nilai_tugas ────────────────────────
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Hapus file fisik dulu
            const files = await FileTugasModel.getByIdNilai(id);
            for (const f of files) {
                const fullPath = path.join(UPLOAD_DIR, f.nama_tersimpan);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }

            await NilaiTugasModel.delete(id);
            res.status(200).json({ status: 'success', message: 'Data nilai tugas berhasil dihapus.' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getMapelBySiswa(req, res) {
    try {
        const { id_siswa } = req.params;

        // Import pool langsung karena QueryBuilder tidak punya static raw
        const { default: pool } = await import('../db.js');

        // Ambil id_rombel siswa
        const anggotaResult = await pool.query(
            `SELECT id_rombel FROM public.anggota_rombel WHERE id_siswa = $1 LIMIT 1`,
            [id_siswa]
        );

        if (!anggotaResult.rows || anggotaResult.rows.length === 0) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Siswa tidak terdaftar di kelas manapun.' 
            });
        }

        const idRombel = anggotaResult.rows[0].id_rombel;

        const result = await pool.query(
            `SELECT DISTINCT j.id_mapel, mp.mapel AS nama_mapel
             FROM public.jadwal j
             JOIN public.mata_pelajaran mp ON j.id_mapel = mp.id_mapel
             WHERE j.id_rombel = $1
             ORDER BY mp.mapel ASC`,
            [idRombel]
        );

        res.status(200).json({ status: 'success', data: result.rows ?? [] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

    

    // ── POST upload file ke id_nilai tertentu ──────
    // Endpoint: POST /nilai-tugas/:id/files
    // Menggunakan multer (lihat route setup), field name: "file"
    async uploadFile(req, res) {
        try {
            const { id } = req.params;
            console.log("UPLOAD_DIR:", UPLOAD_DIR);
            console.log("req.file:", req.file);

            // Pastikan entri nilai_tugas ada
            const existing = await NilaiTugasModel.query()
    .where('id_nilai', '=', id)
    .first();
            if (!existing) {
                return res.status(404).json({ status: 'error', message: 'Nilai tugas tidak ditemukan.' });
            }

            if (!req.file) {
                return res.status(400).json({ status: 'error', message: 'File tidak ditemukan dalam request.' });
            }

            const { originalname, mimetype, size, filename } = req.file;

            // Validasi MIME
            if (!ALLOWED_MIME.includes(mimetype)) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    status: 'error',
                    message: `Tipe file tidak diizinkan: ${mimetype}`,
                });
            }

            // Validasi ukuran
            if (size > MAX_SIZE_BYTES) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    status: 'error',
                    message: `Ukuran file melebihi batas maksimum 10 MB.`,
                });
            }

            const data = await FileTugasModel.create({
                id_nilai:       parseInt(id),
                nama_file:      originalname,
                nama_tersimpan: filename,
                ukuran_file:    size,
                tipe_file:      mimetype,
                path_file:      `uploads/tugas/${filename}`,
            });

            res.status(201).json({ status: 'success', data });
        } catch (error) {
            if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── GET daftar file milik id_nilai ─────────────
    // Endpoint: GET /nilai-tugas/:id/files
    async getFiles(req, res) {
        try {
            const { id } = req.params;
            const data = await FileTugasModel.getByIdNilai(id);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── DELETE satu file ───────────────────────────
    // Endpoint: DELETE /nilai-tugas/:id/files/:idFile
    async deleteFile(req, res) {
        try {
            const { idFile } = req.params;
            const file = await FileTugasModel.query()
    .where('id_file', '=', idFile)
    .first();
            if (!file) {
                return res.status(404).json({ status: 'error', message: 'File tidak ditemukan.' });
            }

            const fullPath = path.join(UPLOAD_DIR, file.nama_tersimpan);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

            await FileTugasModel.delete(idFile);
            res.status(200).json({ status: 'success', message: 'File berhasil dihapus.' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    // ── GET download / view file ───────────────────
    // Endpoint: GET /nilai-tugas/:id/files/:idFile/download
    async downloadFile(req, res) {
    try {
        const { idFile } = req.params;
        const file = await FileTugasModel.query()
            .where('id_file', '=', idFile)
            .first();
            
        if (!file) {
            return res.status(404).json({ status: 'error', message: 'File tidak ditemukan.' });
        }

        // Gunakan camelCase karena CaseConverter sudah transform
        const namaTersimpan = file.namaTersimpan ?? file.nama_tersimpan;
        const namaFile      = file.namaFile      ?? file.nama_file;
        const tipeFile      = file.tipeFile      ?? file.tipe_file;

        const fullPath = path.join(UPLOAD_DIR, namaTersimpan);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ status: 'error', message: 'File fisik tidak ditemukan di server.' });
        }

        res.setHeader('Content-Type', tipeFile);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(namaFile)}"`);
        fs.createReadStream(fullPath).pipe(res);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

        async getByIdSiswa(req, res) {
        try {
            const { id_siswa } = req.params;
            const data = await NilaiTugasModel.withSiswa()
                .where('anggota_rombel.id_siswa', '=', id_siswa)
                .get();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    
}

export default new NilaiTugasController();