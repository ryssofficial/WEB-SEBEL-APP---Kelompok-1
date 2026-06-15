import React, { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "../Components/DashboardLayout";
import {
    StyledButton,
    StyledCard,
    HappyHuesTheme,
    PageContainer,
} from "../Components/BaseComponents";
import { DeleteButton } from "../Components/Button/DeleteButton";
import { NilaiTugasResponse } from "../API/MuadzResponse/NilaiTugasResponse";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getNilaiBadgeStyle = (nilai) => {
    if (nilai === null || nilai === undefined)
        return { bg: "#f0f0f0", color: HappyHuesTheme.stroke };
    if (nilai >= 85) return { bg: "#d4f5d4", color: "#1a6b1a" };
    if (nilai >= 70) return { bg: "#fff3cd", color: "#856404" };
    return { bg: "#ffd6d6", color: "#8b0000" };
};

const getFileIcon = (mimeType) => {
    if (!mimeType) return "📎";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
    if (mimeType === "application/zip") return "🗜️";
    return "📎";
};

// ─────────────────────────────────────────────
// Loading & Empty
// ─────────────────────────────────────────────
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
    <div style={{ textAlign: "center", padding: "60px 20px", color: HappyHuesTheme.paragraph }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📋</div>
        <p style={{ fontWeight: "bold", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {message}
        </p>
    </div>
);

// ─────────────────────────────────────────────
// Komponen: Daftar File (dipakai di Guru & Siswa)
// ─────────────────────────────────────────────
const FileTugasList = ({ idNilai, canDelete = false, onFileDeleted }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await NilaiTugasResponse.getFiles(idNilai);
            const arr = Array.isArray(res) ? res : (res?.data ?? []);
            setFiles(arr);
        } catch {
            setFiles([]);
        } finally {
            setLoading(false);
        }
    }, [idNilai]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const handleDelete = async (idFile) => {
        if (!window.confirm("Hapus file ini?")) return;
        try {
            await NilaiTugasResponse.deleteFile(idNilai, idFile);
            setFiles((prev) => prev.filter((f) => f.idFile !== idFile));
            if (onFileDeleted) onFileDeleted();
        } catch {
            alert("Gagal menghapus file.");
        }
    };

    if (loading) return <p style={{ fontSize: "12px", color: HappyHuesTheme.paragraph }}>Memuat file...</p>;
    if (files.length === 0) return null;

    return (
        <div style={{ marginTop: "10px" }}>
            {files.map((f) => (
                <div
                    key={f.idFile}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        marginBottom: "6px",
                        backgroundColor: "#f9f9f9",
                        border: `2px solid ${HappyHuesTheme.stroke}`,
                        fontSize: "12px",
                    }}
                >
                    <span style={{ fontSize: "18px" }}>{getFileIcon(f.tipeFile)}</span>
                    <span style={{ flex: 1, fontWeight: "bold", color: HappyHuesTheme.stroke, wordBreak: "break-all" }}>
                        {f.namaFile}
                    </span>
                    <span style={{ color: HappyHuesTheme.paragraph, whiteSpace: "nowrap" }}>
                        {formatBytes(f.ukuranFile)}
                    </span>
                    <a
                        href={NilaiTugasResponse.getFileUrl(idNilai, f.idFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: "4px 10px",
                            fontWeight: "bold",
                            fontSize: "11px",
                            border: `2px solid ${HappyHuesTheme.stroke}`,
                            backgroundColor: HappyHuesTheme.tertiary,
                            color: HappyHuesTheme.stroke,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                        }}
                    >
                        👁️ Lihat
                    </a>
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(f.idFile)}
                            style={{
                                padding: "4px 10px",
                                fontWeight: "bold",
                                fontSize: "11px",
                                cursor: "pointer",
                                border: `2px solid ${HappyHuesTheme.stroke}`,
                                backgroundColor: "#ffd6d6",
                                color: "#8b0000",
                            }}
                        >
                            🗑️
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────
// Komponen: Upload File Widget (untuk Siswa)
// ─────────────────────────────────────────────
const UploadFileTugas = ({ idNilai, onUploaded }) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState("");

    const doUpload = async (file) => {
        if (!file) return;
        setError("");
        setUploading(true);
        setProgress(0);
        try {
            await NilaiTugasResponse.uploadFile(idNilai, file, setProgress);
            if (onUploaded) onUploaded();
        } catch (e) {
            setError(e?.response?.data?.message ?? "Gagal mengupload file.");
        } finally {
            setUploading(false);
            setProgress(0);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) doUpload(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) doUpload(file);
    };

    return (
        <div style={{ marginTop: "12px" }}>
            {error && (
                <div style={{ padding: "8px 12px", marginBottom: "8px", backgroundColor: "#fff0f0", border: `2px solid #8b0000`, color: "#8b0000", fontSize: "12px", fontWeight: "bold" }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                style={{
                    padding: "20px",
                    border: `3px dashed ${dragOver ? HappyHuesTheme.highlight : HappyHuesTheme.stroke}`,
                    backgroundColor: dragOver ? HappyHuesTheme.highlight + "22" : "#fafafa",
                    textAlign: "center",
                    cursor: uploading ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                }}
            >
                {uploading ? (
                    <div>
                        <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "8px", color: HappyHuesTheme.stroke }}>
                            ⏫ Mengupload... {progress}%
                        </div>
                        <div style={{ height: "8px", backgroundColor: "#e0e0e0", border: `2px solid ${HappyHuesTheme.stroke}` }}>
                            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: HappyHuesTheme.highlight, transition: "width 0.2s ease" }} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: "32px", marginBottom: "6px" }}>📁</div>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px", color: HappyHuesTheme.stroke }}>
                            Klik atau drag & drop file di sini
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: HappyHuesTheme.paragraph }}>
                            PDF, Word, Excel, Gambar, ZIP — maks. 10 MB
                        </p>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.txt"
                onChange={handleChange}
                disabled={uploading}
            />
        </div>
    );
};

// ─────────────────────────────────────────────
// Komponen: Baris nilai tugas (Guru)
// ─────────────────────────────────────────────
const NilaiTugasItem = ({ item, onDelete, onEditNilai }) => {
    const [showFiles, setShowFiles] = useState(false);
    const [fileCount, setFileCount] = useState(null);
    const badge = getNilaiBadgeStyle(item.nilai);
    const namaSiswa = item.siswa?.namaSiswa ?? item.namaSiswa ?? "-";
    const nisSiswa  = item.siswa?.nisSiswa  ?? item.nisSiswa  ?? "-";

    // Ambil jumlah file sekali saat mount
    useEffect(() => {
        NilaiTugasResponse.getFiles(item.idNilai)
            .then((res) => {
                const arr = Array.isArray(res) ? res : (res?.data ?? []);
                setFileCount(arr.length);
            })
            .catch(() => setFileCount(0));
    }, [item.idNilai]);

    return (
        <div
            style={{
                marginBottom: "12px",
                backgroundColor: HappyHuesTheme.main,
                border: `3px solid ${HappyHuesTheme.stroke}`,
                boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
            }}
        >
            {/* Baris utama */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "18px 20px" }}>
                {/* Badge Nilai */}
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

                {/* Konten */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <p style={{ margin: 0, fontWeight: "900", fontSize: "15px", color: HappyHuesTheme.stroke, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Tugas ke-{item.tugasKe}
                        </p>
                        <span style={{ fontSize: "11px", color: HappyHuesTheme.paragraph, fontWeight: "bold", whiteSpace: "nowrap" }}>
                            📅 {formatTanggal(item.tanggalInput)}
                        </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                        <span style={{ fontSize: "13px", color: HappyHuesTheme.paragraph }}>
                            👤 <strong>Siswa:</strong> {namaSiswa}
                        </span>
                        <span style={{ fontSize: "13px", color: HappyHuesTheme.paragraph }}>
                            🪪 <strong>NIS:</strong> {nisSiswa}
                        </span>
                    </div>

                    {/* Tombol lihat file */}
                    {fileCount !== null && fileCount > 0 && (
                        <button
                            onClick={() => setShowFiles((v) => !v)}
                            style={{
                                marginTop: "8px",
                                padding: "4px 12px",
                                fontWeight: "bold",
                                fontSize: "11px",
                                cursor: "pointer",
                                border: `2px solid ${HappyHuesTheme.stroke}`,
                                backgroundColor: showFiles ? HappyHuesTheme.highlight : HappyHuesTheme.tertiary,
                                color: HappyHuesTheme.stroke,
                                textTransform: "uppercase",
                            }}
                        >
                            📎 {fileCount} File {showFiles ? "▲ Sembunyikan" : "▼ Lihat"}
                        </button>
                    )}
                    {fileCount === 0 && (
                        <span style={{ display: "inline-block", marginTop: "8px", fontSize: "11px", color: HappyHuesTheme.paragraph }}>
                            ⚠️ Belum ada file dikirim
                        </span>
                    )}
                </div>

                {/* Aksi Guru */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
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
                    <DeleteButton id={item.idNilai} onDelete={onDelete} />
                </div>
            </div>

            {/* Panel file — muncul ketika showFiles */}
            {showFiles && (
                <div style={{ padding: "0 20px 16px", borderTop: `2px dashed ${HappyHuesTheme.stroke}` }}>
                    <p style={{ margin: "12px 0 6px", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", color: HappyHuesTheme.paragraph }}>
                        📎 File yang Dikumpulkan Siswa
                    </p>
                    <FileTugasList
                        idNilai={item.idNilai}
                        canDelete={true}
                        onFileDeleted={() => setFileCount((c) => Math.max(0, (c ?? 1) - 1))}
                    />
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// Form Guru: Edit / Input Nilai
// ─────────────────────────────────────────────
const FormEditNilai = ({ item, onSave, onCancel }) => {
    const [nilai, setNilai] = useState(item?.nilai ?? "");
    const [saving, setSaving] = useState(false);
    const namaSiswa = item?.siswa?.namaSiswa ?? item?.namaSiswa ?? "-";

    const handleSave = async () => {
        const parsed = parseInt(nilai, 10);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            alert("Nilai harus antara 0–100.");
            return;
        }
        setSaving(true);
        try {
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
            <p style={{ margin: "0 0 12px 0", fontWeight: "900", fontSize: "14px", textTransform: "uppercase", color: HappyHuesTheme.stroke }}>
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
                <StyledButton label={saving ? "Menyimpan..." : "💾 Simpan"} type="primary" onClick={handleSave} style={{ opacity: saving ? 0.5 : 1 }} />
                <StyledButton label="Batal" type="secondary" onClick={onCancel} />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// VIEW GURU
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
            if (idRombel && idMapel)      res = await NilaiTugasResponse.getByRombelAndMapel(idRombel, idMapel);
            else if (idRombel)            res = await NilaiTugasResponse.getByRombel(idRombel);
            else                          res = await NilaiTugasResponse.getAll();

            let arr = [];
            if (Array.isArray(res))                  arr = res;
            else if (Array.isArray(res?.data))        arr = res.data;
            else if (Array.isArray(res?.data?.data))  arr = res.data.data;
            setNilaiTugas(arr);
        } catch {
            setError("Gagal memuat data nilai tugas. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }, [idRombel, idMapel]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data nilai tugas ini? File yang terkait juga akan ikut terhapus.")) return;
        try {
            await NilaiTugasResponse.delete(id);
            setNilaiTugas((prev) => prev.filter((n) => n.idNilai !== id));
        } catch {
            alert("Gagal menghapus data.");
        }
    };

    const handleSaveNilai = (id, nilaiBaru) => {
        setNilaiTugas((prev) => prev.map((n) => (n.idNilai === id ? { ...n, nilai: nilaiBaru } : n)));
        setEditItem(null);
    };

    const tuntasCount      = nilaiTugas.filter((n) => n.nilai !== null && n.nilai >= 70).length;
    const belumTuntasCount = nilaiTugas.filter((n) => n.nilai === null || n.nilai < 70).length;
    const rataRata = nilaiTugas.length > 0
        ? (nilaiTugas.reduce((s, n) => s + (n.nilai ?? 0), 0) / nilaiTugas.length).toFixed(1)
        : "-";

    const filtered = nilaiTugas.filter((n) => {
        const nama  = (n.siswa?.namaSiswa ?? n.namaSiswa ?? "").toLowerCase();
        const tugas = String(n.tugasKe ?? "");
        const matchSearch = searchQuery === "" || nama.includes(searchQuery.toLowerCase()) || tugas.includes(searchQuery);
        if (filter === "tuntas")        return matchSearch && n.nilai !== null && n.nilai >= 70;
        if (filter === "belum_tuntas")  return matchSearch && (n.nilai === null || n.nilai < 70);
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
                    { label: "Total Tugas",  value: nilaiTugas.length, icon: "📋", color: HappyHuesTheme.tertiary },
                    { label: "Tuntas",       value: tuntasCount,       icon: "✅", color: "#d4f5d4" },
                    { label: "Belum Tuntas", value: belumTuntasCount,  icon: "❌", color: "#ffd6d6" },
                    { label: "Rata-rata",    value: rataRata,          icon: "📊", color: HappyHuesTheme.highlight },
                ].map((stat) => (
                    <div key={stat.label} style={{ flex: "1 1 120px", padding: "16px", backgroundColor: stat.color, border: `3px solid ${HappyHuesTheme.stroke}`, boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`, textAlign: "center" }}>
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
                            style={{ padding: "10px 14px", border: `3px solid ${HappyHuesTheme.stroke}`, backgroundColor: HappyHuesTheme.main, fontWeight: "bold", fontSize: "13px", color: HappyHuesTheme.stroke, outline: "none", minWidth: "220px" }}
                        />
                        <StyledButton label="🔄 Refresh" type="secondary" onClick={fetchData} style={{ opacity: loading ? 0.5 : 1 }} />
                    </div>
                </div>
            </StyledCard>

            {error && (
                <div style={{ padding: "16px 20px", marginBottom: "20px", backgroundColor: "#fff0f0", border: `3px solid ${HappyHuesTheme.secondary}`, color: HappyHuesTheme.secondary, fontWeight: "bold" }}>
                    ⚠️ {error}
                </div>
            )}

            {editItem && (
                <FormEditNilai item={editItem} onSave={handleSaveNilai} onCancel={() => setEditItem(null)} />
            )}

            <StyledCard accentColor={HappyHuesTheme.tertiary}>
                {loading ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState message="Tidak Ada Data Nilai Tugas" />
                ) : (
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
// Form Siswa: Input / Submit Tugas + Upload File
// ─────────────────────────────────────────────
const FormInputTugas = ({ idAnggota, idMapel, onSuccess }) => {
    const [tugasKe, setTugasKe]       = useState("");
    const [catatan, setCatatan]       = useState("");
    const [files, setFiles]           = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError]           = useState("");
    const [dragOver, setDragOver]     = useState(false);
    const inputRef                    = useRef(null);

    const addFiles = (incoming) => {
        setFiles((prev) => {
            const existingNames = new Set(prev.map((f) => f.name));
            const fresh = Array.from(incoming).filter((f) => !existingNames.has(f.name));
            console.log("Adding files:", fresh, fresh.map(f => f instanceof File));
            return [...prev, ...fresh];
        });
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    };

    const handleSubmit = async () => {
        if (!tugasKe) { alert("Tugas ke- harus diisi."); return; }
        setSubmitting(true);
        setError("");
        setSuccessMsg("");
        try {
            // 1. Create nilai_tugas
            const res = await NilaiTugasResponse.create({
                id_anggota:    idAnggota,
                id_mapel:      idMapel,
                tugas_ke:      parseInt(tugasKe, 10),
                catatan:       catatan || null,
                tanggal_input: new Date().toISOString().split("T")[0],
            });

            // 2. Ambil idNilai dari response
            const created = res?.data ?? res;
            const idNilai = created?.idNilai ?? created?.id_nilai;

            console.log("Full response:", JSON.stringify(res));
            console.log("Created:", JSON.stringify(created));
            console.log("idNilai:", idNilai);

            if (!idNilai) throw new Error("idNilai tidak ditemukan dari response server.");

            if (!idNilai) throw new Error("idNilai tidak ditemukan dari response server.");

            
            // 3. Upload semua file
            for (let i = 0; i < files.length; i++) {
                const fileObj = files[i]; // pastikan ini File object
                console.log("Uploading file:", fileObj, typeof fileObj, fileObj instanceof File);
                await NilaiTugasResponse.uploadFile(idNilai, fileObj, (pct) => {
                    setUploadProgress((prev) => ({ ...prev, [i]: pct }));
                });
            }

            setSuccessMsg(`✅ Tugas ke-${tugasKe} berhasil dikumpulkan${files.length > 0 ? ` beserta ${files.length} file!` : "!"}`);
            setTugasKe("");
            setCatatan("");
            setFiles([]);
            setUploadProgress({});
            if (onSuccess) onSuccess();
        } catch (e) {
            setError(e?.response?.data?.message ?? e?.message ?? "Gagal mengumpulkan tugas.");
        } finally {
            setSubmitting(false);
        }
    };

    const totalProgress = files.length > 0
        ? Math.round(Object.values(uploadProgress).reduce((s, v) => s + v, 0) / files.length)
        : 0;

    return (
        <StyledCard title="📤 Kumpulkan Tugas" accentColor={HappyHuesTheme.highlight}>
            {successMsg && (
                <div style={{ padding: "12px 16px", marginBottom: "16px", backgroundColor: "#d4f5d4", border: `2px solid #1a6b1a`, fontWeight: "bold", fontSize: "14px", color: "#1a6b1a" }}>
                    {successMsg}
                </div>
            )}
            {error && (
                <div style={{ padding: "12px 16px", marginBottom: "16px", backgroundColor: "#fff0f0", border: `2px solid #8b0000`, fontWeight: "bold", fontSize: "13px", color: "#8b0000" }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Tugas Ke */}
                <div>
                    <label style={{ display: "block", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", color: HappyHuesTheme.stroke }}>
                        Tugas Ke- *
                    </label>
                    <input
                        type="number" min="1" value={tugasKe}
                        onChange={(e) => setTugasKe(e.target.value)}
                        placeholder="Contoh: 1, 2, 3"
                        disabled={submitting}
                        style={{ padding: "10px 14px", width: "160px", fontWeight: "bold", fontSize: "16px", border: `3px solid ${HappyHuesTheme.stroke}`, backgroundColor: HappyHuesTheme.main, color: HappyHuesTheme.stroke, outline: "none" }}
                    />
                </div>

                {/* Catatan */}
                <div>
                    <label style={{ display: "block", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", color: HappyHuesTheme.stroke }}>
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={catatan} onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Tulis catatan pengumpulan jika ada..."
                        rows={3} disabled={submitting}
                        style={{ padding: "10px 14px", width: "100%", maxWidth: "480px", fontWeight: "bold", fontSize: "13px", border: `3px solid ${HappyHuesTheme.stroke}`, backgroundColor: HappyHuesTheme.main, color: HappyHuesTheme.stroke, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                </div>

                {/* Upload File */}
                <div>
                    <label style={{ display: "block", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", color: HappyHuesTheme.stroke }}>
                        📎 Lampiran File (Opsional)
                    </label>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !submitting && inputRef.current?.click()}
                        style={{
                            padding: "20px", textAlign: "center", cursor: submitting ? "not-allowed" : "pointer",
                            border: `3px dashed ${dragOver ? HappyHuesTheme.highlight : HappyHuesTheme.stroke}`,
                            backgroundColor: dragOver ? HappyHuesTheme.highlight + "22" : "#fafafa",
                            transition: "all 0.15s ease",
                        }}
                    >
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>📁</div>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px", color: HappyHuesTheme.stroke }}>
                            Klik atau drag & drop file di sini
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: HappyHuesTheme.paragraph }}>
                            PDF, Word, Excel, Gambar, ZIP — maks. 10 MB per file
                        </p>
                    </div>
                    <input
                        ref={inputRef} type="file" multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.txt"
                        style={{ display: "none" }}
                        onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
                        disabled={submitting}
                    />

                    {/* Daftar file dipilih */}
                    {files.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                            {files.map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", marginBottom: "6px", backgroundColor: "#f9f9f9", border: `2px solid ${HappyHuesTheme.stroke}`, fontSize: "12px" }}>
                                    <span style={{ fontSize: "16px" }}>{getFileIcon(f.type)}</span>
                                    <span style={{ flex: 1, fontWeight: "bold", color: HappyHuesTheme.stroke, wordBreak: "break-all" }}>{f.name}</span>
                                    <span style={{ color: HappyHuesTheme.paragraph, whiteSpace: "nowrap" }}>{formatBytes(f.size)}</span>
                                    {submitting && uploadProgress[i] !== undefined && (
                                        <div style={{ width: "80px", height: "6px", backgroundColor: "#e0e0e0", border: `1px solid ${HappyHuesTheme.stroke}` }}>
                                            <div style={{ height: "100%", width: `${uploadProgress[i]}%`, backgroundColor: HappyHuesTheme.highlight, transition: "width 0.2s" }} />
                                        </div>
                                    )}
                                    {!submitting && (
                                        <button onClick={() => removeFile(i)} style={{ padding: "3px 8px", fontWeight: "bold", fontSize: "11px", cursor: "pointer", border: `2px solid ${HappyHuesTheme.stroke}`, backgroundColor: "#ffd6d6", color: "#8b0000" }}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tombol Submit */}
                <div>
                    {submitting && files.length > 0 && (
                        <div style={{ marginBottom: "10px" }}>
                            <div style={{ fontSize: "12px", fontWeight: "bold", color: HappyHuesTheme.stroke, marginBottom: "4px" }}>
                                ⏫ Mengupload file... {totalProgress}%
                            </div>
                            <div style={{ height: "8px", backgroundColor: "#e0e0e0", border: `2px solid ${HappyHuesTheme.stroke}` }}>
                                <div style={{ height: "100%", width: `${totalProgress}%`, backgroundColor: HappyHuesTheme.highlight, transition: "width 0.2s" }} />
                            </div>
                        </div>
                    )}
                    <StyledButton
                        label={submitting
                            ? (files.length > 0 ? `⏫ Mengupload... ${totalProgress}%` : "Mengumpulkan...")
                            : `📤 Kumpulkan Tugas${files.length > 0 ? ` + ${files.length} File` : ""}`
                        }
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
const ViewSiswa = ({ idSiswa, idAnggota: idAnggotaProp }) => {
    const [semuaNilai, setSemuaNilai]       = useState([]);
    const [idAnggota, setIdAnggota]         = useState(idAnggotaProp ?? null);
    const [mapelList, setMapelList]         = useState([]);
    const [selectedMapel, setSelectedMapel] = useState(null);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [expandedId, setExpandedId]       = useState(null);

    const fetchData = useCallback(async () => {
    if (!idSiswa) return;
    setLoading(true);
    setError(null);
    try {
        // Fetch mapel dari jadwal rombel siswa
        const mapelRes = await NilaiTugasResponse.getMapelBySiswa(idSiswa);
        const mapelArr = Array.isArray(mapelRes?.data) ? mapelRes.data
            : Array.isArray(mapelRes) ? mapelRes : [];
        setMapelList(mapelArr.map(m => ({
            idMapel:   m.id_mapel   ?? m.idMapel,
            namaMapel: m.nama_mapel ?? m.namaMapel ?? `Mapel ${m.id_mapel}`,
        })));

        // Fetch nilai tugas siswa
        const nilaiRes = await NilaiTugasResponse.getBySiswa(idSiswa);
        const nilaiArr = Array.isArray(nilaiRes?.data) ? nilaiRes.data
            : Array.isArray(nilaiRes) ? nilaiRes : [];
        setSemuaNilai(nilaiArr);

    } catch {
        setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
        setLoading(false);
    }
}, [idSiswa]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const nilaiMapelIni = selectedMapel
        ? semuaNilai.filter((n) => (n.idMapel ?? n.id_mapel) === selectedMapel.idMapel)
        : [];

    const tuntasCount = nilaiMapelIni.filter((n) => n.nilai !== null && n.nilai >= 70).length;
    const rataRata = nilaiMapelIni.filter((n) => n.nilai !== null).length > 0
        ? (nilaiMapelIni.filter((n) => n.nilai !== null)
            .reduce((s, n) => s + n.nilai, 0) /
           nilaiMapelIni.filter((n) => n.nilai !== null).length).toFixed(1)
        : "-";

    if (!idSiswa) return (
        <div style={{ padding: "20px", fontWeight: "bold", color: "red" }}>
            ⚠️ Session tidak ditemukan. Silakan login ulang.
        </div>
    );

    return (
        <>
            {/* Pilih Mapel */}
            <StyledCard title="📚 Pilih Mata Pelajaran" accentColor={HappyHuesTheme.tertiary}>
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div style={{ color: "red", fontWeight: "bold" }}>⚠️ {error}</div>
                ) : mapelList.length === 0 ? (
                    <p style={{ color: HappyHuesTheme.paragraph, fontWeight: "bold", margin: 0 }}>
                        Belum ada riwayat tugas di mapel manapun.
                    </p>
                ) : (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {mapelList.map((m) => (
                            <button
                                key={m.idMapel}
                                onClick={() => { setSelectedMapel(m); setExpandedId(null); }}
                                style={{
                                    padding: "10px 18px", fontWeight: "bold", fontSize: "13px",
                                    cursor: "pointer", border: `3px solid ${HappyHuesTheme.stroke}`,
                                    backgroundColor: selectedMapel?.idMapel === m.idMapel
                                        ? HappyHuesTheme.highlight : HappyHuesTheme.main,
                                    color: HappyHuesTheme.stroke,
                                    boxShadow: selectedMapel?.idMapel === m.idMapel
                                        ? `4px 4px 0px ${HappyHuesTheme.stroke}` : "none",
                                    transform: selectedMapel?.idMapel === m.idMapel
                                        ? "translate(-2px,-2px)" : "none",
                                    textTransform: "uppercase", transition: "all 0.1s",
                                }}
                            >
                                {m.namaMapel}
                            </button>
                        ))}
                    </div>
                )}
            </StyledCard>

            {/* Form kumpul tugas */}
            {idAnggota && selectedMapel ? (
                <FormInputTugas
                    idAnggota={idAnggota}
                    idMapel={selectedMapel.idMapel}
                    onSuccess={fetchData}
                />
            ) : (
                <div style={{
                    padding: "16px 20px", margin: "16px 0",
                    backgroundColor: "#fff3cd",
                    border: `3px solid ${HappyHuesTheme.stroke}`,
                    fontWeight: "bold", fontSize: "13px", color: HappyHuesTheme.stroke,
                }}>
                    {loading ? "⏳ Memuat data..." :
                     !idAnggota ? "⚠️ Data keanggotaan kelas tidak ditemukan. Hubungi admin." :
                     "👆 Pilih mata pelajaran di atas untuk mengumpulkan tugas."}
                </div>
            )}

            {/* Statistik */}
            {selectedMapel && !loading && (
                <div style={{ display: "flex", gap: "16px", margin: "16px 0", flexWrap: "wrap" }}>
                    {[
                        { label: "Dikumpulkan", value: nilaiMapelIni.length,                                  icon: "📤", color: HappyHuesTheme.tertiary },
                        { label: "Sudah Dinilai", value: nilaiMapelIni.filter(n => n.nilai !== null).length,  icon: "✅", color: "#d4f5d4" },
                        { label: "Tuntas (≥70)", value: tuntasCount,                                          icon: "🏆", color: HappyHuesTheme.highlight },
                        { label: "Rata-rata",    value: rataRata,                                             icon: "📊", color: "#fff3cd" },
                    ].map((stat) => (
                        <div key={stat.label} style={{ flex: "1 1 100px", padding: "14px", backgroundColor: stat.color, border: `3px solid ${HappyHuesTheme.stroke}`, boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`, textAlign: "center" }}>
                            <div style={{ fontSize: "24px" }}>{stat.icon}</div>
                            <div style={{ fontWeight: "900", fontSize: "20px", color: HappyHuesTheme.stroke }}>{stat.value}</div>
                            <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: HappyHuesTheme.paragraph }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* List nilai tugas */}
            {selectedMapel && (
                <StyledCard title={`📊 Nilai Tugas — ${selectedMapel.namaMapel}`} accentColor={HappyHuesTheme.tertiary}>
                    {nilaiMapelIni.length === 0 ? (
                        <EmptyState message="Belum ada tugas dikumpulkan untuk mapel ini" />
                    ) : (
                        nilaiMapelIni.map((item) => {
                            const badge = getNilaiBadgeStyle(item.nilai);
                            const isExpanded = expandedId === item.idNilai;
                            return (
                                <div key={item.idNilai} style={{ marginBottom: "10px", backgroundColor: HappyHuesTheme.main, border: `3px solid ${HappyHuesTheme.stroke}`, boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}` }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
                                        {/* Badge nilai */}
                                        <div style={{ minWidth: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: badge.bg, border: `3px solid ${HappyHuesTheme.stroke}`, fontWeight: "900", fontSize: "18px", color: badge.color, flexShrink: 0 }}>
                                            {item.nilai ?? "?"}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: "900", fontSize: "14px", color: HappyHuesTheme.stroke, textTransform: "uppercase" }}>
                                                Tugas ke-{item.tugasKe ?? item.tugas_ke}
                                            </p>
                                            <span style={{ fontSize: "12px", color: HappyHuesTheme.paragraph }}>
                                                📅 {formatTanggal(item.tanggalInput ?? item.tanggal_input)}
                                            </span>
                                            {(item.catatan) && (
                                                <p style={{ margin: "4px 0 0", fontSize: "12px", color: HappyHuesTheme.paragraph, fontStyle: "italic" }}>
                                                    💬 {item.catatan}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                            <div style={{ padding: "4px 12px", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase", backgroundColor: item.nilai !== null ? badge.bg : "#f0f0f0", color: item.nilai !== null ? badge.color : HappyHuesTheme.paragraph, border: `2px solid ${HappyHuesTheme.stroke}` }}>
                                                {item.nilai !== null
                                                    ? (item.nilai >= 70 ? "✅ Tuntas" : "❌ Belum Tuntas")
                                                    : "⏳ Menunggu Nilai"}
                                            </div>
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : item.idNilai)}
                                                style={{ padding: "4px 12px", fontWeight: "bold", fontSize: "11px", cursor: "pointer", border: `2px solid ${HappyHuesTheme.stroke}`, backgroundColor: isExpanded ? HappyHuesTheme.highlight : HappyHuesTheme.tertiary, color: HappyHuesTheme.stroke, textTransform: "uppercase" }}
                                            >
                                                📎 {isExpanded ? "▲ Tutup" : "▼ File"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Panel file */}
                                    {isExpanded && (
                                        <div style={{ padding: "0 20px 16px", borderTop: `2px dashed ${HappyHuesTheme.stroke}` }}>
                                            <p style={{ margin: "12px 0 4px", fontWeight: "900", fontSize: "12px", textTransform: "uppercase", color: HappyHuesTheme.stroke }}>
                                                📎 File yang Sudah Dikumpulkan
                                            </p>
                                            <FileTugasList idNilai={item.idNilai} canDelete={true} />
                                            <p style={{ margin: "14px 0 4px", fontWeight: "900", fontSize: "12px", textTransform: "uppercase", color: HappyHuesTheme.stroke }}>
                                                ⬆️ Upload File Tambahan
                                            </p>
                                            <UploadFileTugas
                                                idNilai={item.idNilai}
                                                onUploaded={() => {
                                                    setExpandedId(null);
                                                    setTimeout(() => setExpandedId(item.idNilai), 50);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </StyledCard>
            )}
        </>
    );
};

// ─────────────────────────────────────────────
// Halaman Utama
// ─────────────────────────────────────────────
const NilaiTugasFitur = ({ role = "Guru", idRombel, idMapel, idSiswa, idAnggota }) => {
    const isGuru = role.toLowerCase() === "guru";
    return (
        <DashboardLayout role={role} activeMenu="Nilai Tugas">
            <PageContainer>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "8px 18px", marginBottom: "20px",
                    backgroundColor: isGuru ? HappyHuesTheme.highlight : HappyHuesTheme.tertiary,
                    border: `3px solid ${HappyHuesTheme.stroke}`,
                    boxShadow: `3px 3px 0px ${HappyHuesTheme.stroke}`,
                    fontWeight: "900", fontSize: "13px", textTransform: "uppercase",
                    letterSpacing: "1px", color: HappyHuesTheme.stroke,
                }}>
                    {isGuru ? "👩‍🏫 Mode Guru — Kelola & Beri Nilai" : "👨‍🎓 Mode Siswa — Kumpulkan & Pantau Nilai"}
                </div>

                {isGuru
                    ? <ViewGuru idRombel={idRombel} idMapel={idMapel} />
                    : <ViewSiswa idSiswa={idSiswa} idAnggota={idAnggota} />
                }
            </PageContainer>
        </DashboardLayout>
    );
};

export default NilaiTugasFitur;