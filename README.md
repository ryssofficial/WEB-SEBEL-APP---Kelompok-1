# SEBEL WEB APP (Sekolah Belajar)
Website Manajemen Sekolah Belajar, jenjang Sekolah Dasar (SD).
---

## Petunjuk Instalasi
> [!IMPORTANT]
> Pastikan Anda sudah menginstal **Git** dan **Node.js** di komputer Anda sebelum memulai.


1. Buat folder baru di komputer Anda dan buka menggunakan VS Code.
2. Buka terminal di VS Code, lalu klon repositori ini:
   ```bash
   git clone [https://www.github.com/ryssofficial/web-kelompok.git](https://www.github.com/ryssofficial/web-kelompok.git)
   cd web-kelompok
   npm install

---

> [!IMPORTANT]
> **PERIZINAN COOKIES TERJAMIN:**
> Proses penyimpanan data cookie telah terjamin keamanannya. Penyimpanan cookie bersifat pribadi dan hanya digunakan sesuai dengan ketentuan pengguna.

# Fitur-Fitur Utama
## 1. Halaman Utama (Landing Page)
   Halaman publik yang dapat diakses oleh semua pengunjung secara umum. Menampilkan informasi profil sekolah, visi-misi, berita terbaru, dan sekilas kegiatan sekolah. Pengunjung yang ingin mengakses sistem manajemen harus masuk melalui tombol Login yang tersedia.

***

## 2. Autentikasi & Login Multi-User
Sistem login yang aman dan terpisah berdasarkan role pengguna:
- Guru: Dapat login secara manual menggunakan Email & Password, atau menggunakan integrasi Sign In with Google untuk kemudahan akses.
- Siswa: Login menggunakan Nomor Induk Siswa (NIS) dan password yang telah didaftarkan oleh admin.

***

## 3. Dashboard Dinamis (Siswa & Guru)
Halaman utama setelah login yang disesuaikan secara otomatis berdasarkan hak akses:
- Dashboard Guru: Menampilkan ringkasan jumlah kelas yang diajar, total siswa, serta grafik presensi hari ini.
- Dashboard Siswa: Menampilkan ringkasan kehadiran pribadi, nilai tugas terakhir, dan pengumuman kelas terbaru.

***

## 4. Presensi dan Nilai Tugas
- Sisi Guru: Fitur untuk melakukan absensi siswa secara harian (Hadir, Izin, Sakit, Alpa) dan menginput nilai tugas/ujian berdasarkan mata pelajaran.
- Sisi Siswa: Grafik rekapitulasi kehadiran dan transparansi nilai tugas yang bisa dipantau langsung oleh siswa (dan orang tua).

***

## 5. Kas dan Tabungan Kelas
Fitur manajemen keuangan mikro di lingkup kelas untuk transparansi dana:
- Kas Kelas: Pencatatan uang kas mingguan siswa, histori uang masuk, dan laporan pengeluaran kebutuhan kelas (misal: beli sapu, spidol).
- Tabungan Siswa: Sistem pencatatan tabungan pribadi siswa yang dikelola oleh wali kelas, di mana siswa dapat melihat total saldo tabungan mereka secara real-time.

***

## 6. Jadwal Pelajaran dan Jadwal Mengajar
- Modul Siswa: Menampilkan kalender jadwal pelajaran harian lengkap dengan nama mata pelajaran, jam, dan guru pengampu.
- Modul Guru: Menampilkan jadwal mengajar pribadi berdasarkan kelas dan jam yang telah dialokasikan, membantu guru mengatur waktu mengajar secara efisien.

***

## 7. Profil dan Pengaturan Akun
- Manajemen Profil: Pengguna (Guru/Siswa) dapat melengkapi data diri seperti nama lengkap, foto profil, tempat tanggal lahir, dan kontak.
- Keamanan Akun: Fitur untuk memperbarui password secara berkala demi menjaga keamanan akun dari akses yang tidak sah.

---
