import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "../Components/DashboardLayout";
import { ProfileDataResponse } from "../API/HakimResponse/ProfileDataResponse";

const HappyHuesTheme = {
  stroke: "#000000",
  paragraph: "#1a202c",
  background: "#f7fafc",
  highlight: "#ffea79",
};

const LocalStyledCard = ({ children, style }) => (
  <div style={{
    backgroundColor: "#ffffff",
    border: `3px solid ${HappyHuesTheme.stroke}`,
    boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    transition: "all 0.2s ease-in-out",
    ...style
  }}>
    {children}
  </div>
);

const LocalStyledButton = ({ children, type, style, onClick, disabled }) => (
  <button 
    type={type} 
    onClick={onClick}
    disabled={disabled}
    style={{
      backgroundColor: disabled ? "#cbd5e1" : "#e2e8f0", 
      color: disabled ? "#94a3b8" : HappyHuesTheme.paragraph,
      border: `3px solid ${HappyHuesTheme.stroke}`,
      boxShadow: disabled ? "none" : `3px 3px 0px ${HappyHuesTheme.stroke}`,
      borderRadius: "8px",
      padding: "10px 20px",
      fontWeight: "700",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      ...style
    }}
  >
    {children}
  </button>
);

export default function ProfileData() {
  const { role } = useParams();
  const currentRole = role || "guru"; 
  const [currentView, setCurrentView] = useState("display"); 
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "",
    alamat: "",
    ttl: "",
    email: "",
  });

  const [tempProfile, setTempProfile] = useState({
    fullName: "",
    alamat: "",
    ttl: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setCurrentView("display"); 
        
        const response = await ProfileDataResponse.getProfile(currentRole);
        
        if (response && response.data) {
          const fetchedData = {
            fullName: response.data.fullName || "",
            alamat: response.data.alamat || "",
            ttl: response.data.ttl || "",
            email: response.data.email || "",
          };
          setProfile(fetchedData);
          setTempProfile(fetchedData);
        } else {
          const emptyData = { fullName: "", alamat: "", ttl: "", email: "" };
          setProfile(emptyData);
          setTempProfile(emptyData);
        }
      } catch (error) {
        console.error(`Gagal memuat data profil ${currentRole}:`, error);
        const fallbackData = { fullName: "", alamat: "", ttl: "", email: "" };
        setProfile(fallbackData);
        setTempProfile(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }, [currentRole]);

  const handleProfileChange = (e) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await ProfileDataResponse.updateProfile(currentRole, tempProfile);
      setProfile({ ...tempProfile });
      alert(`Data profil ${currentRole.toUpperCase()} berhasil diperbarui!`);
      setCurrentView("display");
    } catch (error) {
      alert("Gagal memperbarui profil: " + (error.response?.data?.message || error.message));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }
    try {
      await ProfileDataResponse.updatePassword(passwordData);
      alert("Password berhasil diubah!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setCurrentView("display");
    } catch (error) {
      alert("Gagal mengubah password: " + (error.response?.data?.message || error.message));
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    margin: "8px 0 16px 0",
    border: `3px solid ${HappyHuesTheme.stroke}`,
    boxShadow: `3px 3px 0px ${HappyHuesTheme.stroke}`,
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#ffffff"
  };

  const labelStyle = {
    fontWeight: "700",
    color: HappyHuesTheme.paragraph,
    display: "block",
  };

  const resultItemStyle = {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: `2px dashed ${HappyHuesTheme.stroke}`
  };

  const BackButton = () => (
    <button
      type="button"
      onClick={() => setCurrentView("display")}
      style={{
        backgroundColor: "#ffffff",
        color: HappyHuesTheme.paragraph,
        border: `2px solid ${HappyHuesTheme.stroke}`,
        boxShadow: `2px 2px 0px ${HappyHuesTheme.stroke}`,
        borderRadius: "6px",
        padding: "6px 12px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "13px",
        marginBottom: "20px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      ⬅️ Kembali
    </button>
  );

  return (
    <DashboardLayout role={currentRole} activeMenu="Profil Saya">
      <div style={{ padding: "8px", maxWidth: "600px", margin: "0 auto" }}>
        
        {loading ? (
          <div style={{ textAlign: "center", fontWeight: "bold", padding: "40px", color: HappyHuesTheme.paragraph }}>
            ⏳ Memuat Data Profil {currentRole === "guru" ? "Guru" : "Siswa"}...
          </div>
        ) : (
          <>
            {currentView === "display" && (
              <LocalStyledCard>
                <div style={{ backgroundColor: HappyHuesTheme.highlight, padding: "12px", border: `3px solid ${HappyHuesTheme.stroke}`, boxShadow: `3px 3px 0px ${HappyHuesTheme.stroke}`, fontWeight: "900", marginBottom: "24px", borderRadius: "6px", textAlign: "center", textTransform: "uppercase" }}>
                  ✅ Profil {currentRole} Terdaftar
                </div>

                <div style={resultItemStyle}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", letterSpacing: "1px" }}>NAMA LENGKAP</span>
                  <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "4px" }}>{profile.fullName || "-"}</div>
                </div>

                <div style={resultItemStyle}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", letterSpacing: "1px" }}>ALAMAT TEMPAT TINGGAL</span>
                  <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "4px" }}>{profile.alamat || "-"}</div>
                </div>

                <div style={resultItemStyle}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", letterSpacing: "1px" }}>TEMPAT, TANGGAL LAHIR</span>
                  <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "4px" }}>{profile.ttl || "-"}</div>
                </div>

                <div style={{ ...resultItemStyle, borderBottom: "none", marginBottom: "24px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", letterSpacing: "1px" }}>EMAIL AKTIF</span>
                  <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "4px" }}>{profile.email || "-"}</div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <LocalStyledButton 
                    onClick={() => {
                      setTempProfile({ ...profile });
                      setCurrentView("edit-profile");
                    }}
                    style={{ backgroundColor: "#38bdf8", flex: 1 }}
                  >
                    ✏️ Edit Profil
                  </LocalStyledButton>
                  
                  <LocalStyledButton 
                    onClick={() => setCurrentView("change-password")}
                    style={{ backgroundColor: "#ec4899", color: "#fff", flex: 1 }}
                  >
                    🔑 Ubah Password
                  </LocalStyledButton>
                </div>
              </LocalStyledCard>
            )}

            {/* ==================== 2. MODE FORM EDIT DATA PROFIL ==================== */}
            {currentView === "edit-profile" && (
              <div>
                <BackButton />
                <LocalStyledCard>
                  <h3 style={{ color: HappyHuesTheme.paragraph, marginBottom: "20px", fontWeight: "900", fontSize: "20px" }}>
                    Form Edit Profil {currentRole === "guru" ? "Guru" : "Siswa"}
                  </h3>
                  <form onSubmit={handleProfileSubmit}>
                    <label style={labelStyle}>Nama Lengkap</label>
                    <input
                      type="text"
                      name="fullName"
                      value={tempProfile.fullName}
                      onChange={handleProfileChange}
                      style={inputStyle}
                      required
                    />

                    <label style={labelStyle}>Alamat Tempat Tinggal</label>
                    <input
                      type="text"
                      name="alamat"
                      value={tempProfile.alamat}
                      onChange={handleProfileChange}
                      style={inputStyle}
                      required
                    />

                    <label style={labelStyle}>Tempat, Tanggal Lahir</label>
                    <input
                      type="text"
                      name="ttl"
                      value={tempProfile.ttl}
                      onChange={handleProfileChange}
                      style={inputStyle}
                      required
                    />

                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={tempProfile.email}
                      onChange={handleProfileChange}
                      style={inputStyle}
                      required
                    />

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <LocalStyledButton type="submit" style={{ backgroundColor: "#4ade80", flex: 1 }}>
                        Simpan Perubahan
                      </LocalStyledButton>
                    </div>
                  </form>
                </LocalStyledCard>
              </div>
            )}

            {/* ==================== 3. MODE FORM UBAH PASSWORD ==================== */}
            {currentView === "change-password" && (
              <div>
                <BackButton />
                <LocalStyledCard>
                  <h3 style={{ color: HappyHuesTheme.paragraph, marginBottom: "20px", fontWeight: "900", fontSize: "20px" }}>
                    🔑 Form Perbarui Password
                  </h3>
                  <form onSubmit={handlePasswordSubmit}>
                    <label style={labelStyle}>Password Saat Ini</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      style={inputStyle}
                      placeholder="Masukkan password lama"
                      required
                    />

                    <label style={labelStyle}>Password Baru</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      style={inputStyle}
                      placeholder="Buat password baru"
                      required
                    />

                    <label style={labelStyle}>Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      style={inputStyle}
                      placeholder="Ulangi password baru"
                      required
                    />

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <LocalStyledButton type="submit" style={{ backgroundColor: "#ec4899", color: "#fff", flex: 1 }}>
                        Update Password
                      </LocalStyledButton>
                    </div>
                  </form>
                </LocalStyledCard>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}