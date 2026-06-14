// backend/Models/System/NotifikasiModel.js
import BaseModel from "../BaseModel.js"; 

class NotifikasiModel extends BaseModel {
    constructor() {
        super('notifikasi', 'id_notif', ['id_notif', 'id_guru', 'id_siswa', 'judul', 'pesan', 'is_read', 'tanggal_notif']);
    }
}

export default new NotifikasiModel();