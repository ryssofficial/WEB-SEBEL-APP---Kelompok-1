import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HappyHuesTheme, 
    StyledButton, 
    StyledCard 
} from '../Components/BaseComponents';
import { CookieManager } from "../Services/CookiesFactory/BaseCookies";
import { GoogleCookieFactory } from "../Services/CookiesFactory/GoogleCookieFactory";
import { ModalCustom } from "../Components/Notifications/ModalCustom";

const manager = new CookieManager();
const fetchLocationAndSaveCookie = () => {
    if (!navigator.geolocation) {
        console.log("Geolocation tidak didukung oleh browser Anda.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
                );
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || data.address.county || "Kota Tidak Diketahui";
                
                setCurrentCity(city);

                const locationCookie = GoogleCookieFactory.createCookie("location", "USER_CITY", city);
                manager.save(locationCookie);
                
                console.log(`[Location Saved]: Berhasil menyimpan kota ${city}`);
            } catch (error) {
                console.error("Gagal mendapatkan nama kota dari koordinat:", error);
            }
        },
        (error) => {
            console.error("User menolak akses lokasi atau terjadi error:", error.message);
        }
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentCity, setCurrentCity] = useState("");
    const [showCookieModal, setShowCookieModal] = useState(false);
    const [isManageSettings, setIsManageSettings] = useState(false);
    const [allowAnalytics, setAllowAnalytics] = useState(true);

    useEffect(() => {
        const consentCookie = manager.get("COOKIE_CONSENT");
        if (!consentCookie) {
            setShowCookieModal(true);
        }
    }, []);

    const handleSaveConsent = (type) => {
        let consentValue = type === 'all' ? 'all_granted' : (allowAnalytics ? 'custom_analytics' : 'essential_only');
        
        const newConsentCookie = GoogleCookieFactory.createCookie("preference", "COOKIE_CONSENT", consentValue);
        manager.save(newConsentCookie);
        
        if (type === 'all' || allowAnalytics) { fetchLocationAndSaveCookie(); }
        
        setShowCookieModal(false);
    };

    const containerStyle = {
        backgroundColor: "white", 
        minHeight: '100vh',
        color: HappyHuesTheme.headline,
        fontFamily: 'system-ui, sans-serif',
        padding: '0 20px'
    };

    const heroSectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 0 60px 0',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '40px auto'
    };

    return (
        <div style={containerStyle}>
            <header style={heroSectionStyle}>
                <h1 style={{ 
                    fontSize: '4rem', 
                    marginBottom: '10px', 
                    textTransform: 'uppercase',
                    lineHeight: '0.9',
                    color: HappyHuesTheme.headline
                }}>
                    SEBEL <span style={{ color: HappyHuesTheme.button }}>School</span>
                </h1>
                <p style={{ 
                    fontSize: '1.2rem', 
                    color: HappyHuesTheme.paragraph,
                    maxWidth: '600px',
                    marginBottom: '30px'
                }}>
                    Kelola tabungan, presensi, dan nilai tugas dalam satu platform 
                    dengan desain yang berani dan interaktif.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <StyledButton 
                        label="Mulai Sekarang" 
                        onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
                        padding="15px 40px"
                        fontSize="18px"
                    />
                </div>
            </header>

            <div style={gridStyle}>
                <StyledCard title="Banyak Prestasi" accentColor={HappyHuesTheme.button}>
                    <p style={{color: HappyHuesTheme.stroke}}>Berburu banyak prestasi adalah pencapaian bonus sekolah selain belajar ilmu pengetahuan dan pengembangan potensi diri</p>
                </StyledCard>
                <StyledCard title="Manajemen Transparansi" accentColor={HappyHuesTheme.secondary}>
                    <p style={{color: HappyHuesTheme.stroke}}>Manajemen Sekolah yang menjamin kualitas yang bagus dan menjamin keamanan serta kenyamanan</p>
                </StyledCard>
                <StyledCard title="Fasilitas Lengkap" accentColor={HappyHuesTheme.tertiary}>
                    <p style={{color: HappyHuesTheme.stroke}}>Siswa bisa memantau tugas dan guru bisa memberikan nilai dengan cepat.</p>
                </StyledCard>
            </div>

            <section id="roles" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h2 style={{ 
                    textTransform: 'uppercase', 
                    fontSize: '2.5rem', 
                    marginBottom: '40px' 
                }}>
                    Masuk Sebagai
                </h2>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '40px', 
                    flexWrap: 'wrap' 
                }}>
                    <div style={{ width: '280px' }}>
                        <StyledCard title="GURU" accentColor={HappyHuesTheme.highlight}>
                            <StyledButton 
                                label="Login Guru" 
                                fullWidth={true} 
                                onClick={() => navigate('/login', { state: { role: 'guru' } })} 
                            />
                        </StyledCard>
                    </div>

                    <div style={{ width: '280px' }}>
                        <StyledCard title="SISWA" accentColor={HappyHuesTheme.secondary}>
                            <StyledButton 
                                label="Login Siswa" 
                                type="secondary" 
                                fullWidth={true} 
                                onClick={() => navigate('/login', { state: { role: 'siswa' } })} 
                            />
                        </StyledCard>
                    </div>
                </div>
            </section>

            <footer style={{ 
                textAlign: 'center', 
                padding: '40px', 
                borderTop: `3px solid ${HappyHuesTheme.stroke}`,
                marginTop: '60px',
                color: HappyHuesTheme.paragraph
            }}>
                <p>© 2026 SmartSchool Project. Build with Passion.</p>
            </footer>
            <ModalCustom
                isOpen={showCookieModal}
                onClose={() => setShowCookieModal(false)}
                title={isManageSettings ? "Kelola Preferensi Cookie ⚙️" : "Izin Cookie 🍪"}
                confirmLabel={isManageSettings ? "Simpan Pilihan" : "Terima Semua"}
                cancelLabel={isManageSettings ? "Kembali" : "Tutup"}
                onConfirm={() => handleSaveConsent(isManageSettings ? 'custom' : 'all')}
            >
                {!isManageSettings ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <p style={{ margin: 0, lineHeight: '1.6', fontWeight: 'normal' }}>
                            Kami menggunakan cookie untuk memastikan Anda mendapatkan pengalaman terbaik, 
                            mengingat kunjungan terakhir Anda, dan menyimpan preferensi tema. 
                        </p>
                        <p 
                            onClick={() => setIsManageSettings(true)}
                            style={{ 
                                margin: 0, 
                                color: HappyHuesTheme.highlight, 
                                textDecoration: 'underline', 
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: 'fit-content'
                            }}
                        >
                            Kelola pengaturan cookie
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 'normal' }}>
                        <p style={{ margin: 0, marginBottom: '10px' }}>Pilih jenis cookie yang Anda izinkan:</p>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'not-allowed', opacity: 0.7 }}>
                            <input type="checkbox" checked disabled style={{ width: '18px', height: '18px' }} />
                            <div>
                                <span style={{ fontWeight: 'bold', display: 'block' }}>Cookie Esensial (Wajib)</span>
                                <small style={{ fontSize: '12px' }}>Dibutuhkan agar website berfungsi normal.</small>
                            </div>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={allowAnalytics} 
                                onChange={(e) => setAllowAnalytics(e.target.checked)} 
                                style={{ width: '18px', height: '18px', accentColor: HappyHuesTheme.highlight }} 
                            />
                            <div>
                                <span style={{ fontWeight: 'bold', display: 'block' }}>Preferensi & Analitik</span>
                                <small style={{ fontSize: '12px' }}>Mengingat peran Anda dan mengumpulkan data penggunaan.</small>
                            </div>
                        </label>
                    </div>
                )}
            </ModalCustom>
        </div>
    );
};

export default LandingPage;