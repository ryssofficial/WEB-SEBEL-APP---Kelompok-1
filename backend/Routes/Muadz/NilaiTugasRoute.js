// src/routes/nilaiTugasRoute.js
// Pasang di app.js: app.use('/nilai-tugas', nilaiTugasRoute)

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import NilaiTugasController from '../../controllers/NilaiTugasController.js';
import AnggotaRombelController from '../../Controllers/AnggotaRombelController.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Multer setup ────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../storage/uploads/tugas'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Nilai Tugas CRUD ─────────────────────────────
router.get('/',                                     NilaiTugasController.index);
router.get('/rombel/:id_rombel',                    NilaiTugasController.getByRombel);
router.get('/rombel/:id_rombel/mapel/:id_mapel',    NilaiTugasController.getByRombelAndMapel);
router.post('/',                                    NilaiTugasController.create);
router.put('/:id',                                  NilaiTugasController.update);
router.delete('/:id',                               NilaiTugasController.delete);
router.get('/siswa/:id_siswa',                      NilaiTugasController.getByIdSiswa);
router.get('/siswa/:id_siswa/anggota',              AnggotaRombelController.getBySiswa);
router.get('/siswa/:id_siswa/mapel',                NilaiTugasController.getMapelBySiswa);

// ── File Tugas ────────────────────────────────────
router.get('/:id/files',                            NilaiTugasController.getFiles);
router.post('/:id/files', upload.single('file'),    NilaiTugasController.uploadFile);
router.delete('/:id/files/:idFile',                 NilaiTugasController.deleteFile);
router.get('/:id/files/:idFile/download',           NilaiTugasController.downloadFile);

export default router;