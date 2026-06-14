import bcrypt from 'bcrypt';

export default class HashCrypt {
    #hash;
    #salt = 10;
    #isHashed = false;

    /**
     * @param {string} [initialHash] - Opsional, diisi jika ingin melakukan komparasi/login
     */
    constructor(initialHash = null) {
        this.#hash = initialHash;
        if (initialHash) { this.#isHashed = true; }
    }

    /**
     * Meng-hash password mentah baru (Dipakai saat Registrasi)
     * @param {string} rawPassword 
     */
    async generate(rawPassword) {
        if (this.#isHashed) throw new Error('Objek ini sudah mengunci sebuah data hash!');
        this.#hash = await bcrypt.hash(rawPassword, this.#salt);
        this.#isHashed = true;
        return true;
    }

    #getHash() { return this.#hash; }

    /**
     * Membandingkan password mentah dari form dengan hash dari database
     * @param {string} rawPassword - Password asli dari form login frontend
     * @returns {Promise<boolean>} - True jika cocok, False jika salah
     */
    async comparing(rawPassword) {
        try {
            const isMatch = await bcrypt.compare(rawPassword, this.#getHash());
            return isMatch;
        } catch (error) {
            console.error("Gagal melakukan komparasi Bcrypt:", error.message);
            return false;
        }
    }
}