// src/models/Kelas/FileTugasModel.js
import BaseModel from '../BaseModel.js';

class FileTugasModel extends BaseModel {
    constructor() {
        super(
            'public.file_tugas',
            'id_file',
            ['id_nilai', 'nama_file', 'nama_tersimpan', 'ukuran_file', 'tipe_file', 'path_file', 'tanggal_upload']
        );
    }

    /**
     * Ambil semua file milik satu entri nilai_tugas
     */
    async getByIdNilai(idNilai) {
        return this.query()
            .where('id_nilai', '=', idNilai)
            .orderBy('tanggal_upload', 'ASC')
            .get();
    }

    /**
     * Hapus semua file milik satu entri nilai_tugas
     * (biasanya sudah di-handle CASCADE, tapi bisa dipanggil manual)
     */
    async deleteByIdNilai(idNilai) {
        return this.query()
            .where('id_nilai', '=', idNilai)
            .delete();
    }
}

export default new FileTugasModel();