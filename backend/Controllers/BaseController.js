import jwt from "jsonwebtoken";
import { sendResponse, sendError, sendNotFound } from "../Utils/Response.js";
import LogDataModel from "../models/System/LogDataModel.js";

/**
 * Middleware Autentikasi Token JWT
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return sendError(res, 401, "Akses Ditolak, token kosong");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return sendError(res, 401, "Sesi Berakhir (Token Expired)", error);
    }
};

/**
 * Template Method Pattern
 * Base class untuk standarisasi alur kerja semua Controller di Backend.
 */
export default class BaseController {
    /**
     * @param {Object} model - Instance model utama yang dikendalikan (misal: SiswaModel)
     */
    constructor(model = null) {
        this.model = model;
    }

    /**
     * Template Method: Eksekutor Kueri & Logika Utama yang Aman
     * Membungkus logika fungsi di dalam try-catch secara otomatis agar server tidak pernah crash.
     * * @param {Object} res - Express Response Object
     * @param {Function} businessLogicFn - Fungsi anonim berisi logika bisnis yang akan dieksekusi
     */
    async execute(res, businessLogicFn) {
        try {
            await businessLogicFn();
        } catch (error) {
            console.error(`[Controller Error]:`, error);
            return sendError(res, 500, "Terjadi kesalahan internal pada server", error);
        }
    }

    /**
     * Mendapatkan IP Address Client untuk Keperluan Audit Log
     */
    getIpAddress(req) { return req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1"; }

    /**
     * Mendapatkan Semua Data (Dengan Auto-Paginasi & Whitelist Input)
     */
    index = async (req, res) => {
        await this.execute(res, async () => {
            if (!this.model) return sendError(res, 500, "Model pendukung tidak didefinisikan.");

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const data = await this.model.query()
                .limit(limit)
                .offset(offset)
                .get();

            return sendResponse(res, 200, "Data berhasil diambil", {
                page,
                limit,
                results: data
            });
        });
    }

    /**
     * Mendapatkan Data Tunggal Berdasarkan Primary Key
     */
    show = async (req, res) => {
        await this.execute(res, async () => {
            if (!this.model) return sendError(res, 500, "Model pendukung tidak didefinisikan.");
            
            const { id } = req.params;
            const data = await this.model.query()
                .where(this.model.primaryKey, '=', id)
                .first();

            if (!data) { return sendNotFound(res, `Data dengan ID ${id} tidak ditemukan`); }

            return sendResponse(res, 200, "Data berhasil ditemukan", data);
        });
    }

    /**
     * Menyimpan Data Baru (Otomatis Tersaring Keamanan Whitelist)
     */
    store = async (req, res) => {
        await this.execute(res, async () => {
            if (!this.model) return sendError(res, 500, "Model pendukung tidak didefinisikan.");

            const dataBaru = await this.model.create(req.body);
            await LogDataModel.create({
                idGuru: req.user?.role === 'guru' ? req.user.id : null,
                idSiswa: req.user?.role === 'siswa' ? req.user.id : null,
                ipAddress: this.getIpAddress(req).substring(0, 16),
                keterangan: `Menambahkan data baru pada tabel ${this.model.tableName} dengan ID ${dataBaru[this.model.primaryKey]}`
            }).catch(err => console.error("Gagal mencatat log_data:", err.message)); // Jangan block response utama jika log gagal

            return sendResponse(res, 201, "Data berhasil disimpan", dataBaru);
        });
    }

    /**
     * Mengubah Data (Otomatis Tersaring Keamanan Whitelist)
     */
    update = async (req, res) => {
        await this.execute(res, async () => {
            if (!this.model) return sendError(res, 500, "Model pendukung tidak didefinisikan.");

            const { id } = req.params;
            const dataUpdated = await this.model.update(id, req.body);

            if (!dataUpdated) { return sendNotFound(res, `Gagal memperbarui, data tidak ditemukan`); }

            return sendResponse(res, 200, "Data berhasil diperbarui", dataUpdated);
        });
    }

    /**
     * Menghapus Data
     */
    destroy = async (req, res) => {
        await this.execute(res, async () => {
            if (!this.model) return sendError(res, 500, "Model pendukung tidak didefinisikan.");

            const { id } = req.params;
            const isDeleted = await this.model.delete(id);

            if (!isDeleted) { return sendNotFound(res, `Gagal menghapus, data tidak ditemukan`); }

            return sendResponse(res, 200, "Data berhasil dihapus");
        });
    }
}