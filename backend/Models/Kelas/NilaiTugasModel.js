// src/models/Kelas/NilaiTugasModel.js
import BaseModel from '../BaseModel.js';
import QueryBuilder from '../../Databases/QueryBuilder.js';

class NilaiTugasModel extends BaseModel {
    constructor() {
        super(
            'public.nilai_tugas',
            'id_nilai',
            ['id_anggota', 'id_mapel', 'tugas_ke', 'nilai', 'id_guru', 'tanggal_input', 'catatan']
        );
    }

    /**
     * Join default: nilai_tugas + anggota_rombel + siswa
     */
    withSiswa() {
        return this.query()
            .select([
                'nilai_tugas.*',
                'siswa.nama_siswa',
                'siswa.nis_siswa',
            ])
            .join('public.anggota_rombel', 'nilai_tugas.id_anggota = anggota_rombel.id_anggota')
            .join('public.siswa', 'anggota_rombel.id_siswa = siswa.id_siswa');
    }

    /**
     * Daftar nilai tugas per mapel + rombel, nested relasi siswa
     */
    async listNilaiSiswaPerMapel(idRombel, idMapel) {
        const flatData = await this.withSiswa()
            .where('anggota_rombel.id_rombel', '=', idRombel)
            .where('nilai_tugas.id_mapel', '=', idMapel)
            .get();

        return QueryBuilder.nestRelation(flatData, 'siswa', ['nama_siswa', 'nis_siswa']);
    }

    /**
     * Ambil satu nilai_tugas beserta file-filenya (dari file_tugas)
     * Gunakan setelah create/get untuk mendapatkan info lengkap
     */
    async getWithFiles(idNilai) {
        const [row] = await this.query()
            .select([
                'nilai_tugas.*',
                'siswa.nama_siswa',
                'siswa.nis_siswa',
            ])
            .join('public.anggota_rombel', 'nilai_tugas.id_anggota = anggota_rombel.id_anggota')
            .join('public.siswa', 'anggota_rombel.id_siswa = siswa.id_siswa')
            .where('nilai_tugas.id_nilai', '=', idNilai)
            .get();

        if (!row) return null;

        const files = await QueryBuilder.raw(
            'SELECT * FROM public.file_tugas WHERE id_nilai = $1 ORDER BY tanggal_upload ASC',
            [idNilai]
        );

        return { ...row, files: files.rows ?? [] };
    }
}

export default new NilaiTugasModel();