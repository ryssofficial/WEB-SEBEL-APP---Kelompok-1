// src/API/MuadzResponse/NilaiTugasResponse.js
import { AxiosConfig, instance } from "../AxiosConfig";

export const NilaiTugasResponse = {

    // ── CRUD Nilai Tugas ───────────────────────────
    getAll: async () => {
        const response = await AxiosConfig.get("/nilai-tugas");
        return response.data;
    },

    getById: async (id) => {
        const response = await AxiosConfig.get(`/nilai-tugas/${id}`);
        return response.data;
    },

    getByRombelAndMapel: async (idRombel, idMapel) => {
        const response = await AxiosConfig.get(`/nilai-tugas/rombel/${idRombel}/mapel/${idMapel}`);
        return response.data;
    },

    getByRombel: async (idRombel) => {
        const response = await AxiosConfig.get(`/nilai-tugas/rombel/${idRombel}`);
        return response.data;
    },

    create: async (payload) => {
        const response = await AxiosConfig.post("/nilai-tugas", payload);
        return response.data;
    },

    update: async (id, payload) => {
        const response = await AxiosConfig.put(`/nilai-tugas/${id}`, payload);
        return response.data;
    },

    delete: async (id) => {
        const response = await AxiosConfig.delete(`/nilai-tugas/${id}`);
        return response.data;
    },

    getBySiswa: async (idSiswa) => {
    const response = await AxiosConfig.get(`/nilai-tugas/siswa/${idSiswa}`);
    return response.data;
    },

    getAnggotaBySiswa: async (idSiswa) => {
        const response = await AxiosConfig.get(`/nilai-tugas/siswa/${idSiswa}/anggota`);
        return response.data;
    },

    getMapelBySiswa: async (idSiswa) => {
    const response = await AxiosConfig.get(`/nilai-tugas/siswa/${idSiswa}/mapel`);
    return response.data;
    },

    

    // ── File Tugas ─────────────────────────────────

    /**
     * Upload file ke entri nilai_tugas tertentu
     * @param {number} idNilai
     * @param {File} file - objek File dari input[type=file]
     * @param {function} onProgress - callback(percent: number)
     */
    // Ganti uploadFile
uploadFile: async (idNilai, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await instance.post(
        `/nilai-tugas/${idNilai}/files`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total));
                }
            },
        }
    );
    return response.data;
},

    /**
     * Ambil daftar file milik id_nilai
     */
    getFiles: async (idNilai) => {
        const response = await AxiosConfig.get(`/nilai-tugas/${idNilai}/files`);
        return response.data;
    },

    /**
     * Hapus satu file
     */
    deleteFile: async (idNilai, idFile) => {
        const response = await AxiosConfig.delete(`/nilai-tugas/${idNilai}/files/${idFile}`);
        return response.data;
    },

    /**
     * Buat URL download/preview file
     * (pakai langsung di <a href> atau window.open)
     */
    getFileUrl: (idNilai, idFile) => {
    return `${instance.defaults.baseURL}/nilai-tugas/${idNilai}/files/${idFile}/download`;
    },
};