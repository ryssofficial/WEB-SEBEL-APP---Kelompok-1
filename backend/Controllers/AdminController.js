import BaseController from "./BaseController.js";
import AdminModel from "../Models/SVA/AdminModel.js";
import { sendError, sendNotFound, sendResponse } from "../Utils/Response.js";
import HashCrypt from "../Utils/Bcrypt.js";
import jwt from "jsonwebtoken";

class adminController extends BaseController{
    constructor(){ super(AdminModel) }

    login = async (req, res) => {
        console.log(`[System] Login Attempt => Email: ${req.body.email}, Password: ${req.body.password}`);
        
        await this.execute(res, async () => { 
            const { email, password } = req.body;
            
            if(!email || !password) return sendNotFound(res, "Data Kosong");
            
            try{
                const admin = await this.model.query()
                .where('email_admin', '=', email)
                .first();

                if(!admin) { 
                    console.log(`[System] Email ${email} tidak ditemukan.`); 
                    return sendError(res, 401, "Kredensial Salah! Email tidak terdaftar");
                }

                console.log('[System] Data admin ditemukan, memverifikasi password...');
                const passwordHash = admin.passwordAdmin || admin.password_admin; 

                if (!passwordHash) {
                    console.log('[System] Error: Kolom password di database kosong!');
                    return sendError(res, 401, "Akun belum memiliki password.");
                }

                
                const crypt = new HashCrypt(passwordHash);
                const isPasswordValid = await crypt.comparing(password);
    
                if (!isPasswordValid) {
                    console.log('[System] Verifikasi Gagal: Password Salah.');
                    return sendError(res, 401, "Kredensial salah, password tidak cocok.");
                }
                
                console.log('[System] Verifikasi Berhasil! Membuat token...');
    
                const jwtPayload = {
                    id: admin.idAdmin || admin.id_admin, 
                    nama: admin.namaAdmin || admin.nama_admin,
                    role: "admin"
                };
    
                const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "8h" });
    
                return sendResponse(res, 200, "Login Berhasil.", {
                    token: token,
                    user: jwtPayload
                });
            } catch(err){ 
                console.error(err);
                sendError(res, 500, 'Server Gagal Mengeksekusi Kode'); 
            }
        });
    }

    logout = async (req, res) => {
        console.log(`Data Masuk: ${req.body}`);

        await this.execute(res, async () => {
            const { email, password } = req.body;

            if( !email || !password ){ return sendNotFound(res, "Data Kosong"); }

            try{
                const admin = await this.model.query()
                                    .where('Admin.identity', "=" , email)
                                    .first();

            } catch (error){
                sendError(res, 500, "Terjadi kesalahan pada server");
            }
        })
    }
}

export default new adminController();