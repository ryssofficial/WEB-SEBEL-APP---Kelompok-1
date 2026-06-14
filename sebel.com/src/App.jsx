import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './Pages/LandingPages';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import NotifikasiPage from './Pages/NotifikasiPage';
import ProfileData from './Pages/ProfileData';
import JadwalPage from './Pages/JadwalPage';
import KeuanganPage from './Pages/KeuanganPage';
import AbsensiFitur from './Pages/AbsensiFitur';
import NilaiTugasFitur from './Pages/NilaiTugasFitur';

const JadwalPageWrapper = () => { const { role } = useParams(); const roleProp = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Siswa'; return <JadwalPage role={roleProp} />; };
const KeuanganPageWrapper = () => { const {role} = useParams(); const roleProp = role.charAt(0).toUpperCase() + role.slice(1); return <KeuanganPage role={roleProp} />; };
const AbsensiFiturWrapper = () => {
    const { role } = useParams();
    const roleProp = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Siswa';
    return <AbsensiFitur role={roleProp} />;
};

const NilaiTugasFiturWrapper = () => {
    const { role } = useParams();
    const roleProp = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Siswa';
    return <NilaiTugasFitur role={roleProp} />;
};


export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/:role/dashboard" element={<DashboardPage />} />
                <Route path="/:role/notifikasi" element={<NotifikasiPage />} />

                <Route path="/:role/profil" element={<ProfileData />} />
                <Route path="/:role/jadwal-mengajar" element={<JadwalPageWrapper />} />
                <Route path="/:role/jadwal-pelajaran" element={<JadwalPageWrapper />} />
                <Route path="/jadwal" element={<JadwalPage role="Guru" />} />
                <Route path="/:role/kas-kelas" element={<KeuanganPageWrapper />} />
                <Route path="/:role/validasi-tabungan" element={<KeuanganPageWrapper />} />
                <Route path="/:role/data-kas" element={<KeuanganPageWrapper />} />
                <Route path="/:role/presensi" element={<AbsensiFiturWrapper />} />
                <Route path="/:role/data-presensi" element={<AbsensiFiturWrapper />} /> 
                <Route path="/:role/tugas-saya" element={<NilaiTugasFiturWrapper />} />
                <Route path="/:role/nilai-tugas" element={<NilaiTugasFiturWrapper />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}