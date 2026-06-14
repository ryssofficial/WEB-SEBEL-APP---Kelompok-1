import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../Components/DashboardLayout";
import {
    StyledButton,
    StyledCard,
    HappyHuesTheme,
    PageContainer,
} from "../Components/BaseComponents";
import { DeleteButton } from "../Components/Button/DeleteButton";
import { NilaiTugasResponse } from "../API/MuadzResponse/NilaiTugasResponse";

const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const getNilaiBadgeStyle = (nilai) => {
    if (nilai === null || nilai === undefined)
        return { bg: "#f0f0f0", color: HappyHuesTheme.stroke };
    if (nilai >= 85) return { bg: "#d4f5d4", color: "#1a6b1a" };
    if (nilai >= 70) return { bg: "#fff3cd", color: "#856404" };
    return { bg: "#ffd6d6", color: "#8b0000" };
};

const LoadingSkeleton = () => (
    <div>
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                style={{
                    height: "90px",
                    marginBottom: "12px",
                    backgroundColor: "#f0f0f0",
                    border: `3px solid ${HappyHuesTheme.stroke}`,
                    boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                    animation: "pulse 1.4s ease-in-out infinite",
                    opacity: 1 - i * 0.2,
                }}
            />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
    </div>
);

const EmptyState = ({ message = "Tidak ada data." }) => (
    <div
        style={{
            textAlign: "center",
            padding: "60px 20px",
            color: HappyHuesTheme.paragraph,
        }}
    >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📋</div>
        <p
            style={{
                fontWeight: "bold",
                fontSize: "18px",
                textTransform: "uppercase",
                letterSpacing: "1px",
            }}
        >
            {message}
        </p>
    </div>
);

const NilaiTugasItem = ({ item, onDelete, onEditNilai }) => {
    const badge = getNilaiBadgeStyle(item.nilai);
    const namaSiswa = item.siswa?.namaSiswa ?? item.namaSiswa ?? "-";
    const nisSiswa  = item.siswa?.nisSiswa  ?? item.nisSiswa  ?? "-";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                padding: "18px 20px",
                marginBottom: "12px",
                backgroundColor: HappyHuesTheme.main,
                border: `3px solid ${HappyHuesTheme.stroke}`,
                boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                transition: "all 0.15s ease-in-out",
            }}
        >
            <div
                style={{
                    minWidth: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: badge.bg,
                    border: `3px solid ${HappyHuesTheme.stroke}`,
                    boxShadow: `3px 3px 0px ${HappyHuesTheme.stroke}`,
                    fontWeight: "900",
                    fontSize: "20px",
                    color: badge.color,
                    flexShrink: 0,
                }}
            >
                {item.nilai ?? "-"}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "8px",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontWeight: "900",
                            fontSize: "15px",
                            color: HappyHuesTheme.stroke,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Tugas ke-{item.tugasKe}
                    </p>
                    <span
                        style={{
                            fontSize: "11px",
                            color: HappyHuesTheme.paragraph,
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                        }}
                    >
                        📅 {formatTanggal(item.tanggalInput)}
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "8px",
                    }}
                >
                    <span style={{ fontSize: "13px", color: HappyHuesTheme.paragraph }}>
                        👤 <strong>Siswa:</strong> {namaSiswa}
                    </span>
                    <span style={{ fontSize: "13px", color: HappyHuesTheme.paragraph }}>
                        🪪 <strong>NIS:</strong> {nisSiswa}
                    </span>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    alignItems: "flex-end",
                }}
            >
                <button
                    onClick={() => onEditNilai(item)}
                    style={{
                        padding: "6px 14px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: `2px solid ${HappyHuesTheme.stroke}`,
                        backgroundColor: HappyHuesTheme.highlight,
                        color: HappyHuesTheme.buttonText ?? HappyHuesTheme.stroke,
                        boxShadow: `2px 2px 0px ${HappyHuesTheme.stroke}`,
                        textTransform: "uppercase",
                    }}
                >
                    ✏️ Beri Nilai
                </button>
                {/* FIX: pakai idNilai (camelCase dari id_nilai setelah CaseConverter) */}
                <DeleteButton id={item.idNilai} onDelete={onDelete} />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Form Guru: Edit / Input Nilai
// ─────────────────────────────────────────────
const FormEditNilai = ({ item, onSave, onCancel }) => {
    const [nilai, setNilai] = useState(item?.nilai ?? "");
    const [saving, setSaving] = useState(false);

    // FIX: Ambil nama siswa dari nested object
    const namaSiswa = item?.siswa?.namaSiswa ?? item?.namaSiswa ?? "-";

    const handleSave = async () => {
        const parsed = parseInt(nilai, 10);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            alert("Nilai harus antara 0–100.");
            return;
        }
        setSaving(true);
        try {
            // FIX: item.idNilai bukan item.idNilai (sudah benar, tapi pastikan konsisten)
            await NilaiTugasResponse.update(item.idNilai, { nilai: parsed });
            onSave(item.idNilai, parsed);
        } catch {
            alert("Gagal menyimpan nilai.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                padding: "20px",
                marginBottom: "16px",
                backgroundColor: HappyHuesTheme.highlight + "22",
                border: `3px solid ${HappyHuesTheme.highlight}`,
                boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
            }}
        >
            <p
                style={{
                    margin: "0 0 12px 0",
                    fontWeight: "900",
                    fontSize: "14px",
                    textTransform: "uppercase",
                    color: HappyHuesTheme.stroke,
                }}
            >
                {/* FIX: gunakan namaSiswa yang sudah dinormalisasi */}
                ✏️ Edit Nilai — {namaSiswa} (Tugas ke-{item?.tugasKe})
            </p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={nilai}
                    onChange={(e) => setNilai(e.target.value)}
                    placeholder="0 – 100"
                    style={{
                        padding: "10px 14px",
                        width: "100px",
                        fontWeight: "bold",
                        fontSize: "18px",
                        border: `3px solid ${HappyHuesTheme.stroke}`,
                        backgroundColor: HappyHuesTheme.main,
                        color: HappyHuesTheme.stroke,
                        outline: "none",
                        textAlign: "center",
                    }}
                />
                <StyledButton
                    label={saving ? "Menyimpan..." : "💾 Simpan"}
                    type="primary"
                    onClick={handleSave}
                    style={{ opacity: saving ? 0.5 : 1 }}
                />
                <StyledButton
                    label="Batal"
                    type="secondary"
                    onClick={onCancel}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// VIEW GURU — daftar tugas + edit nilai
// ─────────────────────────────────────────────
const ViewGuru = ({ idRombel, idMapel }) => {
    const [nilaiTugas, setNilaiTugas] = useState([]);
    const [filter, setFilter] = useState("semua");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editItem, setEditItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (idRombel && idMapel)
                res = await NilaiTugasResponse.getByRombelAndMapel(idRombel, idMapel);
            else if (idRombel)
                res = await NilaiTugasResponse.getByRombel(idRombel);
            else
                res = await NilaiTugasResponse.getAll();

            let arr = [];
            if (Array.isArray(res))             arr = res;
            else if (Array.isArray(res?.data))  arr = res.data;
            else if (Array.isArray(res?.data?.data)) arr = res.data.data;

            setNilaiTugas(arr);
        } catch {
            setError("Gagal memuat data nilai tugas. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }, [idRombel, idMapel]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data nilai tugas ini?")) return;
        try {
            await NilaiTugasResponse.delete(id);
            // FIX: filter pakai idNilai (camelCase) bukan id_nilai (snake_case)
            setNilaiTugas((prev) => prev.filter((n) => n.idNilai !== id));
        } catch {
            alert("Gagal menghapus data.");
        }
    };

    const handleSaveNilai = (id, nilaiBaru) => {
        // FIX: map pakai idNilai
        setNilaiTugas((prev) =>
            prev.map((n) => (n.idNilai === id ? { ...n, nilai: nilaiBaru } : n))
        );
        setEditItem(null);
    };

    // Statistik
    const tuntasCount     = nilaiTugas.filter((n) => n.nilai !== null && n.nilai >= 70).length;
    const belumTuntasCount = nilaiTugas.filter((n) => n.nilai === null || n.nilai < 70).length;
    const rataRata =
        nilaiTugas.length > 0
            ? (nilaiTugas.reduce((s, n) => s + (n.nilai ?? 0), 0) / nilaiTugas.length).toFixed(1)
            : "-";

    // Filter & Search — FIX: cari nama dari nested siswa object
    const filtered = nilaiTugas.filter((n) => {
        const nama  = (n.siswa?.namaSiswa ?? n.namaSiswa ?? "").toLowerCase();
        const tugas = String(n.tugasKe ?? "");
        const matchSearch =
            searchQuery === "" ||
            nama.includes(searchQuery.toLowerCase()) ||
            tugas.includes(searchQuery);
        if (filter === "tuntas")       return matchSearch && n.nilai !== null && n.nilai >= 70;
        if (filter === "belum_tuntas") return matchSearch && (n.nilai === null || n.nilai < 70);
        return matchSearch;
    });

    const filterTabs = [
        { key: "semua",        label: `Semua (${nilaiTugas.length})` },
        { key: "tuntas",       label: `Tuntas (${tuntasCount})` },
        { key: "belum_tuntas", label: `Belum Tuntas (${belumTuntasCount})` },
    ];

    const tabStyle = (key) => ({
        padding: "10px 20px",
        fontWeight: "bold",
        fontSize: "13px",
        cursor: "pointer",
        border: `3px solid ${HappyHuesTheme.stroke}`,
        backgroundColor: filter === key ? HappyHuesTheme.highlight : HappyHuesTheme.main,
        color: filter === key ? (HappyHuesTheme.buttonText ?? HappyHuesTheme.stroke) : HappyHuesTheme.stroke,
        boxShadow: filter === key ? `4px 4px 0px ${HappyHuesTheme.stroke}` : "none",
        transform: filter === key ? "translate(-2px, -2px)" : "none",
        transition: "all 0.1s ease-in-out",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    });

    return (
        <>
            {/* Statistik */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                {[
                    { label: "Total Tugas",   value: nilaiTugas.length, icon: "📋", color: HappyHuesTheme.tertiary },
                    { label: "Tuntas",        value: tuntasCount,       icon: "✅", color: "#d4f5d4" },
                    { label: "Belum Tuntas",  value: belumTuntasCount,  icon: "❌", color: "#ffd6d6" },
                    { label: "Rata-rata",     value: rataRata,          icon: "📊", color: HappyHuesTheme.highlight },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            flex: "1 1 120px",
                            padding: "16px",
                            backgroundColor: stat.color,
                            border: `3px solid ${HappyHuesTheme.stroke}`,
                            boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "28px" }}>{stat.icon}</div>
                        <div style={{ fontWeight: "900", fontSize: "22px", color: HappyHuesTheme.stroke }}>{stat.value}</div>
                        <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: HappyHuesTheme.paragraph }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <StyledCard title="📋 Nilai Tugas Siswa" accentColor={HappyHuesTheme.highlight}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {filterTabs.map((tab) => (
                            <button key={tab.key} onClick={() => setFilter(tab.key)} style={tabStyle(tab.key)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="🔍 Cari siswa / tugas ke-..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: "10px 14px",
                                border: `3px solid ${HappyHuesTheme.stroke}`,
                                backgroundColor: HappyHuesTheme.main,
                                fontWeight: "bold",
                                fontSize: "13px",
                                color: HappyHuesTheme.stroke,
                                outline: "none",
                                minWidth: "220px",
                            }}
                        />
                        <StyledButton
                            label="🔄 Refresh"
                            type="secondary"
                            onClick={fetchData}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        />
                    </div>
                </div>
            </StyledCard>

            {/* Error */}
            {error && (
                <div style={{ padding: "16px 20px", marginBottom: "20px", backgroundColor: "#fff0f0", border: `3px solid ${HappyHuesTheme.secondary}`, color: HappyHuesTheme.secondary, fontWeight: "bold" }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Form Edit Nilai */}
            {editItem && (
                <FormEditNilai
                    item={editItem}
                    onSave={handleSaveNilai}
                    onCancel={() => setEditItem(null)}
                />
            )}

            {/* Daftar */}
            <StyledCard accentColor={HappyHuesTheme.tertiary}>
                {loading ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState message="Tidak Ada Data Nilai Tugas" />
                ) : (
                    // FIX: key pakai idNilai
                    filtered.map((item) => (
                        <NilaiTugasItem
                            key={item.idNilai}
                            item={item}
                            onDelete={handleDelete}
                            onEditNilai={setEditItem}
                        />
                    ))
                )}
            </StyledCard>
        </>
    );
};

// ─────────────────────────────────────────────
// Form Siswa: Input / Submit Tugas
// ─────────────────────────────────────────────
const FormInputTugas = ({ idAnggota, idMapel, onSuccess }) => {
    const [tugasKe, setTugasKe] = useState("");
    const [catatan, setCatatan] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async () => {
        if (!tugasKe) { alert("Tugas ke- harus diisi."); return; }
        setSubmitting(true);
        try {
            await NilaiTugasResponse.create({
                id_anggota: idAnggota,
                id_mapel: idMapel,
                tugas_ke: parseInt(tugasKe, 10),
                catatan: catatan || null,
                tanggal_input: new Date().toISOString().split("T")[0],
            });
            setSuccessMsg(`✅ Tugas ke-${tugasKe} berhasil dikumpulkan!`);
            setTugasKe("");
            setCatatan("");
            if (onSuccess) onSuccess();
        } catch {
            alert("Gagal mengumpulkan tugas. Silakan coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <StyledCard title="📤 Kumpulkan Tugas" accentColor={HappyHuesTheme.highlight}>
            {successMsg && (
                <div style={{ padding: "12px 16px", marginBottom: "16px", backgroundColor: "#d4f5d4", border: `2px solid #1a6b1a`, fontWeight: "bold", fontSize: "14px", color: "#1a6b1a" }}>
                    {successMsg}
                </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                    <label style={{ display: "block", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", color: HappyHuesTheme.stroke }}>
                        Tugas Ke- *
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={tugasKe}
                        onChange={(e) => setTugasKe(e.target.value)}
                        placeholder="Contoh: 1, 2, 3..."
                        style={{
                            padding: "10px 14px",
                            width: "160px",
                            fontWeight: "bold",
                            fontSize: "16px",
                            border: `3px solid ${HappyHuesTheme.stroke}`,
                            backgroundColor: HappyHuesTheme.main,
                            color: HappyHuesTheme.stroke,
                            outline: "none",
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", color: HappyHuesTheme.stroke }}>
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Tulis catatan pengumpulan jika ada..."
                        rows={3}
                        style={{
                            padding: "10px 14px",
                            width: "100%",
                            maxWidth: "480px",
                            fontWeight: "bold",
                            fontSize: "13px",
                            border: `3px solid ${HappyHuesTheme.stroke}`,
                            backgroundColor: HappyHuesTheme.main,
                            color: HappyHuesTheme.stroke,
                            outline: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                <div>
                    <StyledButton
                        label={submitting ? "Mengumpulkan..." : "📤 Kumpulkan Tugas"}
                        type="primary"
                        onClick={handleSubmit}
                        style={{ opacity: submitting ? 0.5 : 1 }}
                    />
                </div>
            </div>
        </StyledCard>
    );
};

// ─────────────────────────────────────────────
// VIEW SISWA
// ─────────────────────────────────────────────
const ViewSiswa = ({ idAnggota, idMapel }) => {
    const [nilaiSaya, setNilaiSaya] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNilaiSaya = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await NilaiTugasResponse.getAll();
            let arr = [];
            if (Array.isArray(res))             arr = res;
            else if (Array.isArray(res?.data))  arr = res.data;
            else if (Array.isArray(res?.data?.data)) arr = res.data.data;

            // FIX: idAnggota sudah camelCase setelah CaseConverter
            const milikSaya = idAnggota
                ? arr.filter((n) => n.idAnggota === idAnggota)
                : arr;
            setNilaiSaya(milikSaya);
        } catch {
            setError("Gagal memuat nilai. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }, [idAnggota]);

    useEffect(() => { fetchNilaiSaya(); }, [fetchNilaiSaya]);

    const tuntasCount = nilaiSaya.filter((n) => n.nilai !== null && n.nilai >= 70).length;
    const rataRata =
        nilaiSaya.filter((n) => n.nilai !== null).length > 0
            ? (
                nilaiSaya.filter((n) => n.nilai !== null).reduce((s, n) => s + n.nilai, 0) /
                nilaiSaya.filter((n) => n.nilai !== null).length
              ).toFixed(1)
            : "-";

    return (
        <>
            <FormInputTugas idAnggota={idAnggota} idMapel={idMapel} onSuccess={fetchNilaiSaya} />

            <div style={{ display: "flex", gap: "16px", margin: "20px 0 16px", flexWrap: "wrap" }}>
                {[
                    { label: "Tugas Dikumpulkan", value: nilaiSaya.length,                                    icon: "📤", color: HappyHuesTheme.tertiary },
                    { label: "Sudah Dinilai",     value: nilaiSaya.filter((n) => n.nilai !== null).length,   icon: "✅", color: "#d4f5d4" },
                    { label: "Tuntas (≥70)",      value: tuntasCount,                                        icon: "🏆", color: HappyHuesTheme.highlight },
                    { label: "Rata-rata",          value: rataRata,                                           icon: "📊", color: "#fff3cd" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            flex: "1 1 100px",
                            padding: "14px",
                            backgroundColor: stat.color,
                            border: `3px solid ${HappyHuesTheme.stroke}`,
                            boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "24px" }}>{stat.icon}</div>
                        <div style={{ fontWeight: "900", fontSize: "20px", color: HappyHuesTheme.stroke }}>{stat.value}</div>
                        <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: HappyHuesTheme.paragraph, letterSpacing: "0.5px" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <StyledCard title="📊 Nilai Tugas Saya" accentColor={HappyHuesTheme.tertiary}>
                {error && (
                    <div style={{ padding: "12px 16px", marginBottom: "12px", backgroundColor: "#fff0f0", border: `2px solid ${HappyHuesTheme.secondary}`, color: HappyHuesTheme.secondary, fontWeight: "bold", fontSize: "13px" }}>
                        ⚠️ {error}
                    </div>
                )}
                {loading ? (
                    <LoadingSkeleton />
                ) : nilaiSaya.length === 0 ? (
                    <EmptyState message="Belum Ada Tugas Dikumpulkan" />
                ) : (
                    // FIX: key pakai idNilai
                    nilaiSaya.map((item) => {
                        const badge = getNilaiBadgeStyle(item.nilai);
                        return (
                            <div
                                key={item.idNilai}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    padding: "16px 20px",
                                    marginBottom: "10px",
                                    backgroundColor: HappyHuesTheme.main,
                                    border: `3px solid ${HappyHuesTheme.stroke}`,
                                    boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                                }}
                            >
                                <div
                                    style={{
                                        minWidth: "56px",
                                        height: "56px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: badge.bg,
                                        border: `3px solid ${HappyHuesTheme.stroke}`,
                                        fontWeight: "900",
                                        fontSize: "18px",
                                        color: badge.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.nilai ?? "?"}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: "900", fontSize: "14px", color: HappyHuesTheme.stroke, textTransform: "uppercase" }}>
                                        Tugas ke-{item.tugasKe}
                                    </p>
                                    <span style={{ fontSize: "12px", color: HappyHuesTheme.paragraph }}>
                                        📅 {formatTanggal(item.tanggalInput)}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        padding: "4px 12px",
                                        fontWeight: "bold",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        backgroundColor: item.nilai !== null ? badge.bg : "#f0f0f0",
                                        color: item.nilai !== null ? badge.color : HappyHuesTheme.paragraph,
                                        border: `2px solid ${HappyHuesTheme.stroke}`,
                                    }}
                                >
                                    {item.nilai !== null
                                        ? item.nilai >= 70 ? "✅ Tuntas" : "❌ Belum Tuntas"
                                        : "⏳ Menunggu Nilai"}
                                </div>
                            </div>
                        );
                    })
                )}
            </StyledCard>
        </>
    );
};

// ─────────────────────────────────────────────
// Halaman Utama
// ─────────────────────────────────────────────
const NilaiTugasFitur = ({
    role = "Guru",
    idRombel,
    idMapel,
    idAnggota,
}) => {
    const isGuru = role.toLowerCase() === "guru";

    return (
        <DashboardLayout role={role} activeMenu="Nilai Tugas">
            <PageContainer>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 18px",
                        marginBottom: "20px",
                        backgroundColor: isGuru ? HappyHuesTheme.highlight : HappyHuesTheme.tertiary,
                        border: `3px solid ${HappyHuesTheme.stroke}`,
                        boxShadow: `3px 3px 0px ${HappyHuesTheme.stroke}`,
                        fontWeight: "900",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        color: HappyHuesTheme.stroke,
                    }}
                >
                    {isGuru ? "👩‍🏫 Mode Guru — Kelola & Beri Nilai" : "👨‍🎓 Mode Siswa — Kumpulkan & Pantau Nilai"}
                </div>

                {isGuru ? (
                    <ViewGuru idRombel={idRombel} idMapel={idMapel} />
                ) : (
                    <ViewSiswa idAnggota={idAnggota} idMapel={idMapel} />
                )}
            </PageContainer>
        </DashboardLayout>
    );
};

export default NilaiTugasFitur;