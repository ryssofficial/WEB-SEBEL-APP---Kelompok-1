import { AxiosConfig } from '../AxiosConfig';

const ENDPOINT = '/api/jadwal'; 
export const JadwalAPI = {
    getAllJadwal: async () => { return await AxiosConfig.get(ENDPOINT); },

    createJadwal: async (data) => { return await AxiosConfig.post(ENDPOINT, data); },

    updateJadwal: async (id, data) => { return await AxiosConfig.put(ENDPOINT, data, id); },
    deleteJadwal: async (id) => { return await AxiosConfig.delete(ENDPOINT, id); }
};