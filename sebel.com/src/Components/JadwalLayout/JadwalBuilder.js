// src/Components/JadwalLayout/JadwalBuilder.js
// ================================================
// BUILDER PATTERN  : JadwalBuilder → membangun objek jadwal secara bertahap
// SINGLETON PATTERN: JadwalManager → satu instance global untuk state jadwal
// ================================================

// ──────────────────────────────────────────────
// 1. BUILDER PATTERN – JadwalBuilder
// ──────────────────────────────────────────────
/**
 * JadwalBuilder membangun satu entri jadwal secara bertahap (fluent API).
 *   const jadwal = new JadwalBuilder()
 *     .setHari('Senin')
 *     .setMapel('Matematika')
 *     .setGuru('Pak Budi')
 *     .setJam('07:00', '08:30')
 *     .setRuangan('R-101')
 *     .setKelas('X IPA 1')
 *     .build();
 */
export class JadwalBuilder {
    constructor() {
        this._jadwal = {
            id       : null,
            hari     : '',
            mapel    : '',
            guru     : '',
            jamMulai : '',
            jamSelesai: '',
            ruangan  : '',
            kelas    : '',
        };
    }

    setId(id) {
        this._jadwal.id = id;
        return this;
    }

    setHari(hari) {
        const valid = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        if (!valid.includes(hari)) throw new Error(`Hari tidak valid: ${hari}`);
        this._jadwal.hari = hari;
        return this;
    }

    setMapel(mapel) {
        if (!mapel || mapel.trim() === '') throw new Error('Mata pelajaran wajib diisi');
        this._jadwal.mapel = mapel.trim();
        return this;
    }

    setGuru(guru) {
        if (!guru || guru.trim() === '') throw new Error('Nama guru wajib diisi');
        this._jadwal.guru = guru.trim();
        return this;
    }

    /**
     * @param {string} mulai   - format "HH:MM"
     * @param {string} selesai - format "HH:MM"
     */
    setJam(mulai, selesai) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(mulai) || !timeRegex.test(selesai))
            throw new Error('Format jam harus HH:MM');
        if (mulai >= selesai)
            throw new Error('Jam mulai harus lebih awal dari jam selesai');
        this._jadwal.jamMulai  = mulai;
        this._jadwal.jamSelesai = selesai;
        return this;
    }

    setRuangan(ruangan) {
        if (!ruangan || ruangan.trim() === '') throw new Error('Ruangan wajib diisi');
        this._jadwal.ruangan = ruangan.trim();
        return this;
    }

    setKelas(kelas) {
        if (!kelas || kelas.trim() === '') throw new Error('Kelas wajib diisi');
        this._jadwal.kelas = kelas.trim();
        return this;
    }

    build() {
        const required = ['hari', 'mapel', 'guru', 'jamMulai', 'jamSelesai', 'ruangan', 'kelas'];
        for (const field of required) { if (!this._jadwal[field]) throw new Error(`Field '${field}' belum diisi`); }
        if (!this._jadwal.id) { this._jadwal.id = `jadwal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
        return { ...this._jadwal }; // kembalikan salinan bersih
    }
}

/**
 * Contoh pemakaian:
 *   const mgr = JadwalManager.getInstance();
 *   mgr.tambah(jadwalObj);
 *   mgr.getAll();
 *   mgr.getByHari('Senin');
 *   mgr.hapus(id);
 */
class JadwalManager {
    constructor() {
        if (JadwalManager._instance) {
            return JadwalManager._instance;
        }
        this._data = this._seedData();
        JadwalManager._instance = this;
    }

    static getInstance() {
        if (!JadwalManager._instance) {
            new JadwalManager();
        }
        return JadwalManager._instance;
    }

    static resetInstance() {
        JadwalManager._instance = null;
    }

    tambah(jadwal) {
        this._cekBentrok(jadwal);
        this._data.push({ ...jadwal });
        return this;
    }

    getAll() {
        return [...this._data];
    }

    getByHari(hari) {
        return this._data.filter(j => j.hari === hari);
    }

    getByKelas(kelas) {
        return this._data.filter(j => j.kelas === kelas);
    }

    getByGuru(guru) {
        return this._data.filter(j => j.guru === guru);
    }

    hapus(id) {
        const idx = this._data.findIndex(j => j.id === id);
        if (idx === -1) throw new Error(`Jadwal dengan id '${id}' tidak ditemukan`);
        this._data.splice(idx, 1);
        return this;
    }

    update(jadwalBaru) {
        const idx = this._data.findIndex(j => j.id === jadwalBaru.id);
        if (idx === -1) throw new Error(`Jadwal dengan id '${jadwalBaru.id}' tidak ditemukan`);
        this._data[idx] = { ...jadwalBaru };
        return this;
    }

    _cekBentrok(jadwalBaru) {
        const bentrok = this._data.find(j =>
            j.hari     === jadwalBaru.hari     &&
            j.ruangan  === jadwalBaru.ruangan  &&
            j.id       !== jadwalBaru.id       &&
            jadwalBaru.jamMulai  < j.jamSelesai &&
            jadwalBaru.jamSelesai > j.jamMulai
        );
        if (bentrok) {
            throw new Error(
                `Bentrok! Ruangan ${jadwalBaru.ruangan} sudah dipakai oleh ` +
                `${bentrok.mapel} (${bentrok.jamMulai}–${bentrok.jamSelesai}) pada hari ${bentrok.hari}`
            );
        }
    }

    _seedData() {
        const build = (hari, mapel, guru, mulai, selesai, ruangan, kelas) =>
            new JadwalBuilder()
                .setHari(hari).setMapel(mapel).setGuru(guru)
                .setJam(mulai, selesai).setRuangan(ruangan).setKelas(kelas)
                .build();

        return [
            build('Senin',  'Matematika',         'Pak Budi Santoso',   '07:00','08:30','R-101','X IPA 1'),
            build('Senin',  'Bahasa Indonesia',   'Bu Sari Dewi',       '08:30','10:00','R-102','X IPA 1'),
            build('Senin',  'Fisika',             'Pak Andi Prasetyo',  '10:15','11:45','R-103','X IPA 1'),
            build('Selasa', 'Kimia',              'Bu Lina Marlina',    '07:00','08:30','R-201','X IPA 1'),
            build('Selasa', 'Biologi',            'Pak Dodi Hermawan',  '08:30','10:00','R-202','X IPA 1'),
            build('Rabu',   'Bahasa Inggris',     'Bu Wati Nurhayati',  '07:00','08:30','R-101','X IPA 1'),
            build('Rabu',   'Sejarah',            'Pak Hendra Kusuma',  '08:30','10:00','R-104','X IPA 1'),
            build('Kamis',  'Seni Budaya',        'Bu Rina Anggraini',  '07:00','08:30','R-105','X IPA 1'),
            build('Kamis',  'Pendidikan Agama',   'Pak Imam Sholeh',    '08:30','10:00','R-106','X IPA 1'),
            build('Jumat',  'PJOK',               'Pak Rizal Firmansyah','07:00','08:30','GOR',  'X IPA 1'),
            build('Jumat',  'Prakarya',           'Bu Mega Sartika',    '08:30','10:00','R-107','X IPA 1'),
        ];
    }
}

export const jadwalManager = JadwalManager.getInstance();
export default JadwalManager;