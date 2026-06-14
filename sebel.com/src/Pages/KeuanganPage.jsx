import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../Components/DashboardLayout";

// ─── Data Dummy Awal (State Mocking) ─────────────────────────────────────────

const DUMMY_KAS_AWAL = {
    saldoKas: 750000,
    pemasukkan: [
        { idPemasukkanKas: 1, tanggalMasuk: "2026-06-01", jumlahMasuk: 500000, keterangan: "Kas bulanan Mei" },
        { idPemasukkanKas: 2, tanggalMasuk: "2026-06-05", jumlahMasuk: 400000, keterangan: "Sumbangan sukarela" },
    ],
    pengeluaran: [
        { idPengeluaranKas: 1, tanggalKeluar: "2026-06-02", jumlahKeluar: 150000, keterangan: "Beli sapu dan kemoceng" },
    ]
};

const DUMMY_TABUNGAN_AWAL = [
    { idTabungan: 101, namaSiswa: "Ahmad Rifai", saldoTotal: 250000 },
    { idTabungan: 102, namaSiswa: "Citra Lestari", saldoTotal: 500000 },
    { idTabungan: 103, namaSiswa: "Dewi Sartika", saldoTotal: 150000 },
];

const DUMMY_RIWAYAT_TABUNGAN = {
    101: {
        setor: [{ idPemasukkan: 1, tanggalMasuk: "2026-06-01", jumlahMasuk: 250000, keterangan: "Setoran awal" }],
        tarik: []
    },
    102: {
        setor: [{ idPemasukkan: 2, tanggalMasuk: "2026-06-02", jumlahMasuk: 500000, keterangan: "Tabungan beasiswa" }],
        tarik: []
    },
    103: {
        setor: [{ idPemasukkan: 3, tanggalMasuk: "2026-06-03", jumlahMasuk: 200000, keterangan: "Uang saku" }],
        tarik: [{ idPengeluaran: 1, tanggalKeluar: "2026-06-04", jumlahKeluar: 50000, keterangan: "Keperluan mendesak" }]
    }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka ?? 0);

const formatTanggal = (iso) =>
    iso ? new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-";

// ─── Sub-Components ──────────────────────────────────────────────────────────

const DeleteButton = ({ id, onDelete }) => (
    <button
        onClick={() => onDelete(id)}
        style={{
            background: "#fee2e2", color: "#dc2626",
            border: "1px solid #fca5a5", borderRadius: 6,
            padding: "5px 12px", fontSize: 12,
            cursor: "pointer", fontWeight: 600,
        }}
    >
        🗑️ Hapus
    </button>
);

const SaldoCard = ({ label, nominal, warna }) => (
    <div style={{
        background: warna || "#f0fdf4",
        borderRadius: 12,
        padding: "20px 24px",
        minWidth: 180,
        flex: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
    }}>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{label}</p>
        <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{formatRupiah(nominal)}</p>
    </div>
);

const TabelRiwayat = ({ data, kolom, onHapus, isGuru }) => (
    <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
                <tr style={{ background: "#f1f5f9" }}>
                    {kolom.map((k) => (
                        <th key={k.key} style={{ padding: "10px 14px", textAlign: "left", color: "#475569", fontWeight: 600 }}>
                            {k.label}
                        </th>
                    ))}
                    {isGuru && <th style={{ padding: "10px 14px", color: "#475569", textAlign: "left" }}>Aksi</th>}
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={kolom.length + (isGuru ? 1 : 0)}
                            style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                            Belum ada data transaksi.
                        </td>
                    </tr>
                ) : (
                    data.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            {kolom.map((k) => (
                                <td key={k.key} style={{ padding: "10px 14px", color: "#334155" }}>
                                    {k.format ? k.format(row[k.key]) : row[k.key] ?? "-"}
                                </td>
                            ))}
                            {isGuru && (
                                <td style={{ padding: "10px 14px" }}>
                                    <DeleteButton id={row.id} onDelete={onHapus} />
                                </td>
                            )}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const FormTransaksi = ({ onSubmit, loading, tipe }) => {
    const [jumlah, setJumlah] = useState("");
    const [keterangan, setKeterangan] = useState("");

    const handleSubmit = () => {
        if (!jumlah || isNaN(jumlah) || Number(jumlah) <= 0) {
            alert("Jumlah harus angka positif!");
            return;
        }
        onSubmit({ jumlah: Number(jumlah), keterangan });
        setJumlah("");
        setKeterangan("");
    };

    const warna = tipe === "masuk" ? "#16a34a" : "#dc2626";

    return (
        <div style={{
            background: "#f8fafc",
            borderRadius: 10,
            padding: "16px 20px",
            border: `1.5px solid ${tipe === "masuk" ? "#bbf7d0" : "#fecaca"}`,
            marginBottom: 12
        }}>
            <p style={{ margin: "0 0 12px", fontWeight: 600, color: warna, fontSize: 14 }}>
                {tipe === "masuk" ? "➕ Tambah Pemasukkan" : "➖ Tambah Pengeluaran"}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                    type="number"
                    placeholder="Jumlah (Rp)"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="text"
                    placeholder="Keterangan (opsional)"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    style={{ ...inputStyle, flex: 2 }}
                />
                <button onClick={handleSubmit} disabled={loading} style={{
                    background: warna, color: "#fff", border: "none",
                    borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                    fontWeight: 600, fontSize: 13, opacity: loading ? 0.7 : 1
                }}>
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>
            </div>
        </div>
    );
};

const inputStyle = {
    border: "1px solid #cbd5e1", borderRadius: 8,
    padding: "10px 12px", fontSize: 13, flex: 1, minWidth: 140,
    outline: "none", color: "#1e293b", background: "#fff"
};

// ─── Section: Kas Kelas ──────────────────────────────────────────────────────

const SectionKas = ({ isGuru, kasData, setKasData }) => {
    const [loading, setLoading] = useState(false);

    const handleTambahMasuk = ({ jumlah, keterangan }) => {
        setLoading(true);
        const baru = {
            idPemasukkanKas: Date.now(),
            tanggalMasuk: new Date().toISOString().split('T')[0],
            jumlahMasuk: jumlah,
            keterangan: keterangan || "Tanpa keterangan"
        };
        setKasData(prev => ({
            ...prev,
            saldoKas: prev.saldoKas + jumlah,
            pemasukkan: [baru, ...prev.pemasukkan]
        }));
        setLoading(false);
    };

    const handleTambahKeluar = ({ jumlah, keterangan }) => {
        setLoading(true);
        const baru = {
            idPengeluaranKas: Date.now(),
            tanggalKeluar: new Date().toISOString().split('T')[0],
            jumlahKeluar: jumlah,
            keterangan: keterangan || "Tanpa keterangan"
        };
        setKasData(prev => ({
            ...prev,
            saldoKas: prev.saldoKas - jumlah,
            pengeluaran: [baru, ...prev.pengeluaran]
        }));
        setLoading(false);
    };

    const handleHapusMasuk = (id) => {
        if (!window.confirm("Hapus data pemasukkan ini?")) return;
        const target = kasData.pemasukkan.find(p => p.idPemasukkanKas === id);
        const minusSaldo = target ? target.jumlahMasuk : 0;

        setKasData(prev => ({
            ...prev,
            saldoKas: prev.saldoKas - minusSaldo,
            pemasukkan: prev.pemasukkan.filter(p => p.idPemasukkanKas !== id)
        }));
    };

    const handleHapusKeluar = (id) => {
        if (!window.confirm("Hapus data pengeluaran ini?")) return;
        const target = kasData.pengeluaran.find(p => p.idPengeluaranKas === id);
        const plusSaldo = target ? target.jumlahKeluar : 0;

        setKasData(prev => ({
            ...prev,
            saldoKas: prev.saldoKas + plusSaldo,
            pengeluaran: prev.pengeluaran.filter(p => p.idPengeluaranKas !== id)
        }));
    };

    const kolomMasuk = [
        { key: "tanggalMasuk", label: "Tanggal", format: formatTanggal },
        { key: "jumlahMasuk", label: "Jumlah", format: formatRupiah },
        { key: "keterangan", label: "Keterangan" },
    ];
    const kolomKeluar = [
        { key: "tanggalKeluar", label: "Tanggal", format: formatTanggal },
        { key: "jumlahKeluar", label: "Jumlah", format: formatRupiah },
        { key: "keterangan", label: "Keterangan" },
    ];

    return (
        <div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                <SaldoCard label="Saldo Kas Kelas" nominal={kasData.saldoKas} warna="#f0fdf4" />
                <SaldoCard label="Total Pemasukkan"
                    nominal={kasData.pemasukkan.reduce((a, b) => a + Number(b.jumlahMasuk || 0), 0)}
                    warna="#eff6ff" />
                <SaldoCard label="Total Pengeluaran"
                    nominal={kasData.pengeluaran.reduce((a, b) => a + Number(b.jumlahKeluar || 0), 0)}
                    warna="#fff7ed" />
            </div>

            {isGuru && (
                <div style={{ marginBottom: 24 }}>
                    <FormTransaksi onSubmit={handleTambahMasuk} loading={loading} tipe="masuk" />
                    <FormTransaksi onSubmit={handleTambahKeluar} loading={loading} tipe="keluar" />
                </div>
            )}

            <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: "0 0 10px", color: "#16a34a", fontSize: 14 }}>📥 Riwayat Pemasukkan Kas</h4>
                <TabelRiwayat
                    data={kasData.pemasukkan.map((d) => ({ ...d, id: d.idPemasukkanKas }))}
                    kolom={kolomMasuk}
                    onHapus={handleHapusMasuk}
                    isGuru={isGuru}
                />
            </div>

            <div>
                <h4 style={{ margin: "0 0 10px", color: "#dc2626", fontSize: 14 }}>📤 Riwayat Pengeluaran Kas</h4>
                <TabelRiwayat
                    data={kasData.pengeluaran.map((d) => ({ ...d, id: d.idPengeluaranKas }))}
                    kolom={kolomKeluar}
                    onHapus={handleHapusKeluar}
                    isGuru={isGuru}
                />
            </div>
        </div>
    );
};

// ─── Section: Tabungan Siswa ─────────────────────────────────────────────────

const SectionTabungan = ({ isGuru, listTabungan, setListTabungan, riwayatTabungan, setRiwayatTabungan }) => {
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePilihSiswa = (tabungan) => {
        setSelected(tabungan);
    };

    // Ambil riwayat berdasarkan siswa yang dipilih secara real-time dari state parent
    const currentRiwayat = riwayatTabungan[selected?.idTabungan] || { setor: [], tarik: [] };

    const handleSetor = ({ jumlah, keterangan }) => {
        setLoading(true);
        const idSiswa = selected.idTabungan;
        const baru = {
            idPemasukkan: Date.now(),
            tanggalMasuk: new Date().toISOString().split('T')[0],
            jumlahMasuk: jumlah,
            keterangan: keterangan || "Setor Tunai"
        };

        // Update riwayat
        setRiwayatTabungan(prev => ({
            ...prev,
            [idSiswa]: {
                ...prev[idSiswa],
                setor: [baru, ...(prev[idSiswa]?.setor || [])]
            }
        }));

        // Update list siswa (saldo)
        setListTabungan(prev => prev.map(siswa => {
            if (siswa.idTabungan === idSiswa) {
                const updated = { ...siswa, saldoTotal: siswa.saldoTotal + jumlah };
                setSelected(updated); // Sync panel detail
                return updated;
            }
            return siswa;
        }));
        setLoading(false);
    };

    const handleTarik = ({ jumlah, keterangan }) => {
        if (selected.saldoTotal < jumlah) {
            alert("Saldo tidak mencukupi untuk melakukan penarikan!");
            return;
        }
        setLoading(true);
        const idSiswa = selected.idTabungan;
        const baru = {
            idPengeluaran: Date.now(),
            tanggalKeluar: new Date().toISOString().split('T')[0],
            jumlahKeluar: jumlah,
            keterangan: keterangan || "Penarikan Tunai"
        };

        setRiwayatTabungan(prev => ({
            ...prev,
            [idSiswa]: {
                ...prev[idSiswa],
                tarik: [baru, ...(prev[idSiswa]?.tarik || [])]
            }
        }));

        setListTabungan(prev => prev.map(siswa => {
            if (siswa.idTabungan === idSiswa) {
                const updated = { ...siswa, saldoTotal: siswa.saldoTotal - jumlah };
                setSelected(updated);
                return updated;
            }
            return siswa;
        }));
        setLoading(false);
    };

    const handleHapusSetor = (id) => {
        if (!window.confirm("Hapus data setor ini?")) return;
        const idSiswa = selected.idTabungan;
        const target = currentRiwayat.setor.find(s => s.idPemasukkan === id);
        const minusJumlah = target ? target.jumlahMasuk : 0;

        setRiwayatTabungan(prev => ({
            ...prev,
            [idSiswa]: {
                ...prev[idSiswa],
                setor: prev[idSiswa].setor.filter(s => s.idPemasukkan !== id)
            }
        }));

        setListTabungan(prev => prev.map(siswa => {
            if (siswa.idTabungan === idSiswa) {
                const updated = { ...siswa, saldoTotal: siswa.saldoTotal - minusJumlah };
                setSelected(updated);
                return updated;
            }
            return siswa;
        }));
    };

    const handleHapusTarik = (id) => {
        if (!window.confirm("Hapus data tarik ini?")) return;
        const idSiswa = selected.idTabungan;
        const target = currentRiwayat.tarik.find(t => t.idPengeluaran === id);
        const plusJumlah = target ? target.jumlahKeluar : 0;

        setRiwayatTabungan(prev => ({
            ...prev,
            [idSiswa]: {
                ...prev[idSiswa],
                tarik: prev[idSiswa].tarik.filter(t => t.idPengeluaran !== id)
            }
        }));

        setListTabungan(prev => prev.map(siswa => {
            if (siswa.idTabungan === idSiswa) {
                const updated = { ...siswa, saldoTotal: siswa.saldoTotal + plusJumlah };
                setSelected(updated);
                return updated;
            }
            return siswa;
        }));
    };

    const kolomSetor = [
        { key: "tanggalMasuk", label: "Tanggal", format: formatTanggal },
        { key: "jumlahMasuk", label: "Jumlah Setor", format: formatRupiah },
        { key: "keterangan", label: "Keterangan" },
    ];
    const kolomTarik = [
        { key: "tanggalKeluar", label: "Tanggal", format: formatTanggal },
        { key: "jumlahKeluar", label: "Jumlah Tarik", format: formatRupiah },
        { key: "keterangan", label: "Keterangan" },
    ];

    return (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{
                width: 240, flexShrink: 0,
                background: "#f8fafc", borderRadius: 12,
                border: "1px solid #e2e8f0", overflow: "hidden"
            }}>
                <div style={{ padding: "14px 16px", background: "#1e40af", color: "#fff" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>👨‍🎓 Daftar Siswa</p>
                </div>
                {listTabungan.length === 0 ? (
                    <p style={{ padding: 16, color: "#94a3b8", fontSize: 13 }}>Tidak ada siswa.</p>
                ) : (
                    listTabungan.map((t) => (
                        <div
                            key={t.idTabungan}
                            onClick={() => handlePilihSiswa(t)}
                            style={{
                                padding: "12px 16px", cursor: "pointer",
                                borderBottom: "1px solid #e2e8f0",
                                background: selected?.idTabungan === t.idTabungan ? "#dbeafe" : "#fff",
                                transition: "background 0.15s"
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
                                {t.namaSiswa}
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                                {formatRupiah(t.saldoTotal)}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
                {!selected ? (
                    <div style={{
                        textAlign: "center", padding: 40,
                        color: "#94a3b8", background: "#f8fafc",
                        borderRadius: 12, border: "1px dashed #cbd5e1"
                    }}>
                        <p style={{ fontSize: 32 }}>💳</p>
                        <p style={{ margin: 0, fontSize: 14 }}>Pilih siswa untuk melihat detail tabungan</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                            <SaldoCard label={`Saldo — ${selected.namaSiswa}`}
                                nominal={selected.saldoTotal} warna="#eff6ff" />
                        </div>

                        {isGuru && (
                            <div style={{ marginBottom: 20 }}>
                                <FormTransaksi onSubmit={handleSetor} loading={loading} tipe="masuk" />
                                <FormTransaksi onSubmit={handleTarik} loading={loading} tipe="keluar" />
                            </div>
                        )}

                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ margin: "0 0 10px", color: "#16a34a", fontSize: 14 }}>📥 Riwayat Setor</h4>
                            <TabelRiwayat
                                data={currentRiwayat.setor.map((d) => ({ ...d, id: d.idPemasukkan }))}
                                kolom={kolomSetor}
                                onHapus={handleHapusSetor}
                                isGuru={isGuru}
                            />
                        </div>
                        <div>
                            <h4 style={{ margin: "0 0 10px", color: "#dc2626", fontSize: 14 }}>📤 Riwayat Tarik</h4>
                            <TabelRiwayat
                                data={currentRiwayat.tarik.map((d) => ({ ...d, id: d.idPengeluaran }))}
                                kolom={kolomTarik}
                                onHapus={handleHapusTarik}
                                isGuru={isGuru}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const KeuanganPage = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("kas");
    const [kasData, setKasData] = useState(DUMMY_KAS_AWAL);
    const [listTabungan, setListTabungan] = useState(DUMMY_TABUNGAN_AWAL);
    const [riwayatTabungan, setRiwayatTabungan] = useState(DUMMY_RIWAYAT_TABUNGAN);
    const [isGuru, setIsGuru] = useState(false);
    const [loadInit, setLoadInit] = useState(true);

    useEffect(() => {
        if (role !== "guru" && role !== "siswa") {
            navigate("/", { replace: true });
            return;
        }

        setIsGuru(role === "guru");
        setLoadInit(false);
    }, [role, navigate]);

    const tabStyle = (tab) => ({
        padding: "10px 24px",
        border: "none",
        borderBottom: activeTab === tab ? "3px solid #1e40af" : "3px solid transparent",
        background: "transparent",
        color: activeTab === tab ? "#1e40af" : "#64748b",
        fontWeight: activeTab === tab ? 700 : 500,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.15s",
    });

    if (loadInit) return (
        <DashboardLayout role={role || "siswa"} activeMenu="Keuangan">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>⏳ Memuat halaman keuangan...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role={role || "siswa"} activeMenu="Keuangan">
            {/* Tab Navigation */}
            <div style={{
                display: "flex", borderBottom: "1px solid #e2e8f0",
                marginBottom: 24, gap: 4
            }}>
                <button style={tabStyle("kas")} onClick={() => setActiveTab("kas")}>
                    🏦 Kas Kelas
                </button>
                <button style={tabStyle("tabungan")} onClick={() => setActiveTab("tabungan")}>
                    💳 Tabungan Siswa
                </button>
            </div>

            {/* Konten Tab */}
            <div style={{
                background: "#fff", borderRadius: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                padding: "24px"
            }}>
                {activeTab === "kas" && (
                    <SectionKas
                        isGuru={isGuru}
                        kasData={kasData}
                        setKasData={setKasData}
                    />
                )}
                {activeTab === "tabungan" && (
                    <SectionTabungan
                        isGuru={isGuru}
                        listTabungan={listTabungan}
                        setListTabungan={setListTabungan}
                        riwayatTabungan={riwayatTabungan}
                        setRiwayatTabungan={setRiwayatTabungan}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default KeuanganPage;