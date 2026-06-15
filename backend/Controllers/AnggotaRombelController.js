// backend/Controllers/AnggotaRombelController.js
import AnggotaRombelModel from '../Models/Kelas/AnggotaRombelModel.js';

class AnggotaRombelController {
    constructor() {
        this.getBySiswa = this.getBySiswa.bind(this);
    }

    async getBySiswa(req, res) {
        try {
            const { id_siswa } = req.params;
            const data = await AnggotaRombelModel.query()
                .where('id_siswa', '=', id_siswa)
                .get();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

export default new AnggotaRombelController();