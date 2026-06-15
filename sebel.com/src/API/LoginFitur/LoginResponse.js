// frontend/services/LoginResponse.js
import { AxiosConfig } from "../AxiosConfig";

const ENDPOINT_PATH = "/auth";

export const LoginResponse = {
    /**
     * Login untuk siswa berdasarkan NIS dan password
     * @param {string|number} nis - Nomor Induk Siswa
     * @param {string} password - Password akun siswa
     * @returns {Promise<Object>} Respons data user dan token dari server
     */
    siswaLogin: async (nis, password) => {
        return await AxiosConfig.post(`${ENDPOINT_PATH}/login/siswa`, { 
            identifier: nis, 
            password: password 
        });
    },

    /**
     * Login untuk guru berdasarkan email dan password
     * @param {string} email - Alamat email aktif guru
     * @param {string} password - Password akun guru
     * @returns {Promise<Object>} Respons data user dan token dari server
     */
    guruLogin: async (email, password) => {
        return await AxiosConfig.post(`${ENDPOINT_PATH}/login/guru`, { 
            identifier: email, 
            password: password 
        });
    },

    /**
     * Login dengan Google untuk Guru, verifikasi token akses google ke backend internal
     * @param {string} googleToken - Access token yang didapat dari implicit flow Google OAuth2
     * @returns {Promise<Object>} Akun guru terverifikasi beserta internal JWT token
     */
    googleLogin: async (googleToken) => {
        return await AxiosConfig.post(`${ENDPOINT_PATH}/login/google`, {
            token: googleToken,
            role: "guru"
        });
    }
};