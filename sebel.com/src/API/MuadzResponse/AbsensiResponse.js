import { AxiosConfig } from "../AxiosConfig";

const STATUS_TO_CHAR = {
    hadir: "H", h: "H",
    izin:  "I", i: "I",
    sakit: "S", s: "S",
    alpha: "A", alpa: "A", a: "A", 
    H: "H", I: "I", S: "S", A: "A",
};

export const toStatusChar = (status) =>
    STATUS_TO_CHAR[(status ?? "").trim().toLowerCase()] ??
    STATUS_TO_CHAR[(status ?? "").trim()] ??
    null;

const CHAR_TO_LABEL = { H: "Hadir", I: "Izin", S: "Sakit", A: "Alpha" };

export const normalizeAbsensiItem = (item) => {
    const rawStatus = item.statusKehadiran ?? item.status_kehadiran ?? "";
    const charStatus = rawStatus.trim().toUpperCase();          // "H" / "I" / "S" / "A"
    const labelStatus = CHAR_TO_LABEL[charStatus] ?? rawStatus; // "Hadir" / "Izin" / ...

    return {
        idPresensi:       item.idPresensi       ?? item.id_presensi,
        idAnggota:        item.idAnggota        ?? item.id_anggota,
        namaSiswa:        item.namaSiswa        ?? item.nama_siswa        ?? "-",
        nisSiswa:         item.nisSiswa         ?? item.nis_siswa         ?? "-",
        tugasKe:          item.tugasKe          ?? item.tugas_ke,
        tanggalPenilaian: item.tanggalPenilaian ?? item.tanggal_penilaian,
        statusKehadiran:  labelStatus, 
        statusChar:       charStatus,  
    };
};

export const AbsensiResponse = {

    getAll: async () => {
        try {
            const response = await AxiosConfig.get("/presensi");
            return response.data;
        } catch (error) {
            console.error("Gagal mengambil data presensi:", error);
            return {
                status: "success",
                data: [
                    { id_presensi: 1, id_anggota: 10, tugas_ke: 1, tanggal_penilaian: "2026-05-20", status_kehadiran: "H", nama_siswa: "Budi Santoso",  nis_siswa: "0012345" },
                    { id_presensi: 2, id_anggota: 11, tugas_ke: 1, tanggal_penilaian: "2026-05-20", status_kehadiran: "I", nama_siswa: "Siti Rahayu",   nis_siswa: "0012346" },
                    { id_presensi: 3, id_anggota: 12, tugas_ke: 2, tanggal_penilaian: "2026-05-21", status_kehadiran: "S", nama_siswa: "Ahmad Fauzi",   nis_siswa: "0012347" },
                    { id_presensi: 4, id_anggota: 13, tugas_ke: 2, tanggal_penilaian: "2026-05-21", status_kehadiran: "H", nama_siswa: "Dewi Lestari",  nis_siswa: "0012348" },
                    { id_presensi: 5, id_anggota: 14, tugas_ke: 3, tanggal_penilaian: "2026-05-22", status_kehadiran: "I", nama_siswa: "Rizky Pratama", nis_siswa: "0012349" },
                ],
            };
        }
    },

    getByRombel: async (idRombel) => {
        try {
            const response = await AxiosConfig.get(`/presensi/rombel/${idRombel}`);
            return response.data;
        } catch (error) {
            console.error(`Gagal mengambil data rombel ${idRombel}:`, error);
            throw error;
        }
    },

    create: async (payload) => {
        const charStatus = toStatusChar(payload.status_kehadiran);
        if (!charStatus) {
            throw new Error(`Status tidak valid: "${payload.status_kehadiran}". Gunakan: Hadir / Izin / Sakit / Alpha`);
        }

        const finalPayload = { ...payload, status_kehadiran: charStatus };
        console.log("[AbsensiResponse.create] Payload →", finalPayload);

        try {
            const response = await AxiosConfig.post("/presensi", finalPayload);
            return response.data;
        } catch (error) {
            console.error("[AbsensiResponse.create] GAGAL:", {
                status:       error?.response?.status,
                backendMsg:   error?.response?.data?.message,
                backendDetail: error?.response?.data?.detail,
                payload:      finalPayload,
            });
            throw error;
        }
    },

    delete: async (idPresensi) => {
        try {
            const response = await AxiosConfig.delete(`/presensi/${idPresensi}`);
            return response.data;
        } catch (error) {
            console.error(`Gagal menghapus presensi ${idPresensi}:`, error);
            throw error;
        }
    },
};