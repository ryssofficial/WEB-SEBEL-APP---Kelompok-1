// backend/controllers/Middleware/SiswaAuthController.js
import BaseController from "./BaseController.js";
import SiswaModel from "../Models/SVA/SiswaModel.js";
import HashCrypt from "../Utils/Bcrypt.js"; // Memuat utilitas enkripsi password Anda
import jwt from "jsonwebtoken";
import { sendResponse, sendError } from "../Utils/Response.js";
import AnggotaRombelModel from '../Models/Kelas/AnggotaRombelModel.js';



class SiswaAuthController extends BaseController {
    constructor() {
        super(SiswaModel);
    }

    login = async (req, res) => {
        // Log data yang masuk (Hapus password di produksi, ini hanya untuk debug)
        console.log(`[System] Login Attempt => NIS: ${req.body.identifier}`);
        
        await this.execute(res, async () => {
            const { identifier, password } = req.body;

            if (!identifier || !password) { return sendError(res, 400, "NIS dan password wajib diisi."); }

            // Cari siswa (Gunakan identifier langsung tanpa parseInt jika NIS di DB adalah Varchar)
            const siswa = await this.model.query()
                .where('nis_siswa', '=', identifier) 
                .first();

            if (!siswa) {
                console.log(`[System] NIS ${identifier} tidak ditemukan.`);
                return sendError(res, 401, "Kredensial salah, NIS tidak terdaftar.");
            }

            console.log('[System] Data siswa ditemukan, memverifikasi password...');

            // Pastikan mengambil hash dengan benar
            const passwordHash = siswa.passwordSiswa || siswa.password_siswa; 
            
            if (!passwordHash) {
                console.log('[System] Error: Kolom password di database kosong!');
                return sendError(res, 401, "Akun belum memiliki password.");
            }

            // DEBUG: Cek isi hash yang diambil
            console.log(`[Debug] Hash dari DB: ${passwordHash}`);
            console.log(`Hasil dari input yang di hash ${password}`);
            const crypt = new HashCrypt(passwordHash);
            const isPasswordValid = await crypt.comparing(password);

            if (!isPasswordValid) {
                console.log('[System] Verifikasi Gagal: Password tidak cocok dengan Hash.');
                return sendError(res, 401, "Kredensial salah, password tidak cocok.");
            }
            
            console.log('[System] Verifikasi Berhasil! Membuat token...');

            const idSiswa = siswa.idSiswa || siswa.id_siswa;
            const anggota = await AnggotaRombelModel.query()
                .where('id_siswa', '=', idSiswa)
                .first();

            const jwtPayload = {
                id:         idSiswa,
                nis:        siswa.nisSiswa  || siswa.nis_siswa,
                nama:       siswa.namaSiswa || siswa.nama_siswa,
                role:       "siswa",
                idAnggota:  anggota?.idAnggota ?? anggota?.id_anggota ?? null,
            };

            const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "8h" });

            return sendResponse(res, 200, "Login Berhasil.", {
                token: token,
                user: jwtPayload
            });
        }
    );
}

}

export default new SiswaAuthController();