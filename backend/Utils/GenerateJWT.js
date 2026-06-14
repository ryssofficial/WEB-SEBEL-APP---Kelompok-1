import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

export function initializeEnv() {
    if (!fs.existsSync(envPath)) {
        console.log('⚠️  File .env tidak ditemukan. Membuat file .env baru...');
        fs.writeFileSync(envPath, 'JWT_SECRET=\n', 'utf-8');
    }

    let envContent = fs.readFileSync(envPath, 'utf-8');
    const secretRegex = /^JWT_SECRET=(?:[ \t]*)$/m;
    const hasSecretKey = envContent.includes('JWT_SECRET=');

    if (!hasSecretKey) {
        const generatedSecret = crypto.randomBytes(32).toString('hex');
        envContent += `\nJWT_SECRET=${generatedSecret}`;
        fs.writeFileSync(envPath, envContent, 'utf-8');
        console.log('✅ Berhasil menambahkan JWT_SECRET otomatis ke .env');
    } else if (secretRegex.test(envContent)) {
        const generatedSecret = crypto.randomBytes(32).toString('hex');
        envContent = envContent.replace(secretRegex, `JWT_SECRET=${generatedSecret}`);
        fs.writeFileSync(envPath, envContent, 'utf-8');
        console.log('✅ JWT_SECRET kosong terdeteksi! Mengisi otomatis ke .env');
    } else {
        console.log('ℹ️  JWT_SECRET sudah terisi di .env, melewati inisialisasi.');
    }
}

initializeEnv();