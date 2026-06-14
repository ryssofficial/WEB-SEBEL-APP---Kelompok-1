// frontend/API/AxiosConfig.js
import axios from 'axios';
import { API_URL } from "./API_URL";
import { CookieManager } from "../Services/CookiesFactory/BaseCookies";

const manager = new CookieManager();

export const instance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json', 
        'ngrok-skip-browser-warning': 'true'
    }
});

instance.interceptors.request.use(
    (config) => {
        const token = manager.get('token');
        if (token) { config.headers.Authorization = `Bearer ${token}`; }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Hanya redirect jika belum di halaman login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const AxiosConfig = {
    post: async (url, param, id) => {
        try {
            const targetUrl = id ? `${url}/${id}` : url;
            const response = await instance.post(targetUrl, param);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    get: async (url, param) => {
        try {
            const isId = typeof param === 'string' || typeof param === 'number';
            const targetUrl = isId ? `${url}/${param}` : url;
            const config = !isId ? { params: param } : {};
            const response = await instance.get(targetUrl, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    put: async (url, param, id) => {
        try {
            const targetUrl = id ? `${url}/${id}` : url;
            const response = await instance.put(targetUrl, param);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (url, id) => {
        try {
            const targetUrl = id ? `${url}/${id}` : url;
            const response = await instance.delete(targetUrl);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};