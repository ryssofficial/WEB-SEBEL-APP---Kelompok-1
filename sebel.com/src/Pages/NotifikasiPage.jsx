    import React, { useState, useEffect, useCallback, useMemo } from "react";
    import { DashboardLayout } from "../Components/DashboardLayout";
    import { StyledButton, StyledCard, HappyHuesTheme, PageContainer } from "../Components/BaseComponents";
    import { DeleteButton } from "../Components/Button/DeleteButton";
    import { NotifikasiResponse } from "../API/ArisFitur/NotifikasiResponse";
    import { useParams } from "react-router-dom";
    import { 
        RiNotification4Fill, 
        RiCheckDoubleLine, 
        RiRefreshLine, 
        RiTimeLine,
        RiInboxArchiveLine,
        RiAlertFill,
        RiHistoryLine,
        RiDeleteBinLine 
    } from "react-icons/ri";

    // Helper hitung sisa hari masa recovery (Maksimal 15 Hari)
    const hitungSisaHari = (isoString) => {
        if (!isoString) return 0;
        const tanggalHapus = new Date(isoString);
        const tanggalSekarang = new Date();
        const batasWaktu = tanggalHapus.getTime() + (15 * 24 * 60 * 60 * 1000);
        const selisihMilidetik = batasWaktu - tanggalSekarang.getTime();
        const sisaHari = Math.ceil(selisihMilidetik / (1000 * 60 * 60 * 24));
        return sisaHari > 0 ? sisaHari : 0;
    };

    const formatTanggal = (isoString) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // --- KOMPONEN CUSTOM POP-UP KONFIRMASI ---
    const ConfirmModal = ({ isOpen, title, message, color, onConfirm, onClose }) => {
        if (!isOpen) return null;

        return (
            <div style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px"
            }}>
                <div style={{
                    backgroundColor: HappyHuesTheme.main || "#fff",
                    border: `3px solid ${HappyHuesTheme.stroke || "#000"}`,
                    boxShadow: `8px 8px 0px ${HappyHuesTheme.stroke || "#000"}`,
                    maxWidth: "450px",
                    width: "100%",
                    padding: "24px",
                    position: "relative"
                }}>
                    <h3 style={{
                        margin: "0 0 12px 0",
                        fontWeight: "900",
                        fontSize: "18px",
                        textTransform: "uppercase",
                        color: HappyHuesTheme.stroke
                    }}>
                        {title}
                    </h3>
                    <p style={{
                        margin: "0 0 24px 0",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: HappyHuesTheme.paragraph
                    }}>
                        {message}
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <StyledButton label="Batal" type="secondary" onClick={onClose} />
                        <StyledButton
                            label="Ya, Lanjutkan"
                            color={color}
                            onClick={() => { onConfirm(); onClose(); }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // ✅ FIX 3: React.memo agar tidak re-render jika props tidak berubah
    const NotifItem = React.memo(({ notif, onRead, onDelete, onRestore }) => {
        const isUnread = !notif.isRead;
        const isDeleted = notif.isDeleted;

        const containerStyle = {
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            padding: "18px 20px",
            marginBottom: "12px",
            backgroundColor: isDeleted ? "#f4f4f4" : (isUnread ? "#fff8f0" : HappyHuesTheme.main),
            border: `3px solid ${isDeleted ? "#a0a0a0" : (isUnread ? HappyHuesTheme.highlight : HappyHuesTheme.stroke)}`,
            boxShadow: isDeleted
                ? `4px 4px 0px #a0a0a0`
                : (isUnread ? `6px 6px 0px ${HappyHuesTheme.highlight}` : `4px 4px 0px ${HappyHuesTheme.stroke}`),
            transition: "all 0.15s ease-in-out",
            position: "relative",
            opacity: isDeleted ? 0.85 : 1
        };

        const dotStyle = {
            width: "12px",
            height: "12px",
            minWidth: "12px",
            borderRadius: "50%",
            backgroundColor: isDeleted ? "#a0a0a0" : (isUnread ? HappyHuesTheme.secondary : "transparent"),
            border: `2px solid ${isDeleted ? "#a0a0a0" : (isUnread ? HappyHuesTheme.secondary : HappyHuesTheme.paragraph)}`,
            marginTop: "5px",
        };

        return (
            <div style={containerStyle}>
                <div style={dotStyle} title={isDeleted ? "Terhapus Sementara" : (isUnread ? "Belum dibaca" : "Sudah dibaca")} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <p style={{
                            margin: 0,
                            fontWeight: "900",
                            fontSize: "15px",
                            color: isDeleted ? "#666" : HappyHuesTheme.stroke,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}>
                            {notif.judul} {isDeleted && <span style={{ color: HappyHuesTheme.secondary, fontSize: "11px" }}>(TRASH)</span>}
                        </p>
                        <span style={{
                            fontSize: "11px",
                            color: HappyHuesTheme.paragraph,
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                        }}>
                            <RiTimeLine size={14} style={{ strokeWidth: 0.5 }} />
                            {formatTanggal(notif.tanggalNotif)}
                        </span>
                    </div>
                    <p style={{
                        margin: "8px 0 0 0",
                        color: isDeleted ? "#777" : HappyHuesTheme.stroke,
                        fontSize: "14px",
                        lineHeight: "1.6",
                    }}>
                        {notif.pesan}
                    </p>

                    {isDeleted && (
                        <p style={{
                            margin: "8px 0 0 0",
                            fontSize: "12px",
                            color: HappyHuesTheme.secondary,
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        }}>
                            ⏰ Masih bisa dipulihkan dalam {hitungSisaHari(notif.deletedAt)} hari kedepan
                        </p>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    {isDeleted ? (
                        <StyledButton
                            label={<span style={{ display: "flex", alignItems: "center", gap: "6px" }}><RiHistoryLine size={14} /> Pulihkan</span>}
                            color={HappyHuesTheme.highlight}
                            padding="6px 12px"
                            fontSize="11px"
                            onClick={() => onRestore(notif.idNotif)}
                        />
                    ) : (
                        <>
                            {isUnread && (
                                <StyledButton
                                    label={<span style={{ display: "flex", alignItems: "center", gap: "6px" }}><RiCheckDoubleLine size={14} /> Tandai Dibaca</span>}
                                    color={HappyHuesTheme.tertiary}
                                    padding="6px 12px"
                                    fontSize="11px"
                                    onClick={() => onRead(notif.idNotif)}
                                />
                            )}
                            <DeleteButton id={notif.idNotif} onDelete={onDelete} />
                        </>
                    )}
                </div>
            </div>
        );
    });

    const EmptyState = () => (
        <div style={{ textAlign: "center", padding: "60px 20px", color: HappyHuesTheme.paragraph }}>
            <div style={{ marginBottom: "16px", color: HappyHuesTheme.stroke }}>
                <RiInboxArchiveLine size={72} />
            </div>
            <p style={{ fontWeight: "bold", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Tidak Ada Notifikasi
            </p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Semua notifikasi akan muncul di sini.
            </p>
        </div>
    );

    const LoadingSkeleton = () => (
        <div>
            {[1, 2, 3].map((i) => (
                <div key={i} style={{
                    height: "80px",
                    marginBottom: "12px",
                    backgroundColor: "#f0f0f0",
                    border: `3px solid ${HappyHuesTheme.stroke}`,
                    boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                    animation: "pulse 1.4s ease-in-out infinite",
                    opacity: 1 - i * 0.2,
                }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
        </div>
    );

    // ✅ FIX 4: Kurangi dummy data dari 1000 → 50 item agar tidak berat saat dev/testing
    const generateDummyData = () => {
        return Array.from({ length: 50 }, (_, i) => ({
            idNotif: i + 1,
            judul: `Notifikasi Ke-${i + 1}`,
            pesan: `Ini adalah isi pesan notifikasi nomor ${i + 1} untuk keperluan testing UI.`,
            isRead: i % 3 === 0,
            isDeleted: i % 10 === 0,
            tanggalNotif: new Date(Date.now() - i * 3600000).toISOString(),
            deletedAt: i % 10 === 0 ? new Date().toISOString() : null
        }));
    };

    const NotifikasiPage = () => {
        const { role } = useParams();

        // ✅ FIX 4: Lazy init useState agar generateDummyData() hanya dipanggil sekali
        const [notifikasi, setNotifikasi] = useState(() => generateDummyData());
        const [filter, setFilter] = useState("semua");
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [actionLoading, setActionLoading] = useState(false);
        const [visibleCount, setVisibleCount] = useState(10);

        const currentRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Guru";

        const [confirmConfig, setConfirmConfig] = useState({
            isOpen: false, title: "", message: "", color: "", onConfirm: () => {}
        });

        const closeConfirmation = useCallback(() => {
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }, []);

        const fetchNotifikasi = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await NotifikasiResponse.getAll();
                const finalData = Array.isArray(data) ? data : data?.data ?? [];
                setNotifikasi(finalData.length === 0 ? generateDummyData() : finalData);
            } catch (err) {
                console.warn("API gagal, memuat data dummy untuk pengujian...");
                setNotifikasi(generateDummyData());
            } finally {
                // ✅ FIX 1: Typo "幕Loading" → setLoading yang benar
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            fetchNotifikasi();
        }, [fetchNotifikasi]);

        useEffect(() => {
            setVisibleCount(10);
        }, [filter]);

        // ✅ FIX 3: useCallback pada semua handler agar referensi stabil → NotifItem tidak re-render
        const handleMarkAsRead = useCallback(async (id) => {
            try {
                await NotifikasiResponse.markAsRead(id);
                setNotifikasi((prev) =>
                    prev.map((n) => (n.idNotif === id ? { ...n, isRead: true } : n))
                );
            } catch (err) {
                alert("Gagal menandai notifikasi. Silakan coba lagi.");
                console.error(err);
            }
        }, []);

        // ✅ FIX 2: useMemo untuk kalkulasi berat yang dipakai di dalam handler
        // Diletakkan sebelum handler yang memakainya
        const validNotifikasi = useMemo(() => notifikasi.filter((n) => {
            if (n.isDeleted && n.deletedAt) return hitungSisaHari(n.deletedAt) > 0;
            return true;
        }), [notifikasi]);

        const unreadCount = useMemo(() => validNotifikasi.filter((n) => !n.isRead && !n.isDeleted).length, [validNotifikasi]);
        const readCount   = useMemo(() => validNotifikasi.filter((n) =>  n.isRead && !n.isDeleted).length, [validNotifikasi]);
        const trashCount  = useMemo(() => validNotifikasi.filter((n) =>  n.isDeleted).length, [validNotifikasi]);

        const filtered = useMemo(() => validNotifikasi.filter((n) => {
            if (filter === "belum")    return !n.isRead && !n.isDeleted;
            if (filter === "sudah")    return  n.isRead && !n.isDeleted;
            if (filter === "terhapus") return  n.isDeleted;
            return !n.isDeleted;
        }), [validNotifikasi, filter]);

        const deletableCount = useMemo(() => filtered.filter((n) => !n.isDeleted).length, [filtered]);

        const handleMarkAllAsRead = useCallback(async () => {
            if (unreadCount === 0 || actionLoading) return;
            setActionLoading(true);
            try {
                await NotifikasiResponse.markAllAsRead();
                setNotifikasi((prev) => prev.map((n) => (!n.isDeleted ? { ...n, isRead: true } : n)));
            } catch (err) {
                alert("Gagal menandai semua notifikasi. Silakan coba lagi.");
                console.error(err);
            } finally {
                setActionLoading(false);
            }
        }, [unreadCount, actionLoading]);

        const handleDeleteAll = useCallback(() => {
            const itemsToDelete = filtered.filter((n) => !n.isDeleted);
            if (itemsToDelete.length === 0 || actionLoading) return;

            setConfirmConfig({
                isOpen: true,
                title: "Hapus Semua Notifikasi",
                message: `Apakah Anda yakin ingin memindahkan semua notifikasi yang tertampil (${itemsToDelete.length} item) ke tempat sampah?`,
                color: HappyHuesTheme.secondary,
                onConfirm: async () => {
                    setActionLoading(true);
                    try {
                        if (typeof NotifikasiResponse.deleteAll === "function") {
                            await NotifikasiResponse.deleteAll();
                        }
                        const idsToDelete = new Set(itemsToDelete.map((n) => n.idNotif));
                        setNotifikasi((prev) =>
                            prev.map((n) =>
                                idsToDelete.has(n.idNotif)
                                    ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() }
                                    : n
                            )
                        );
                    } catch (err) {
                        alert("Gagal menghapus semua notifikasi. Silakan coba lagi.");
                        console.error(err);
                    } finally {
                        setActionLoading(false);
                    }
                }
            });
        }, [filtered, actionLoading]);

        const handleDelete = useCallback((id) => {
            setConfirmConfig({
                isOpen: true,
                title: "Hapus Notifikasi",
                message: "Pindahkan notifikasi ini ke tempat sampah? (Bisa dipulihkan kembali dalam waktu 15 hari)",
                color: HappyHuesTheme.secondary,
                onConfirm: async () => {
                    try {
                        await NotifikasiResponse.delete(id);
                        setNotifikasi((prev) =>
                            prev.map((n) =>
                                n.idNotif === id
                                    ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() }
                                    : n
                            )
                        );
                    } catch (err) {
                        alert("Gagal menghapus notifikasi. Silakan coba lagi.");
                        console.error(err);
                    }
                }
            });
        }, []);

        const handleRestore = useCallback((id) => {
            setConfirmConfig({
                isOpen: true,
                title: "Pulihkan Notifikasi",
                message: "Apakah Anda yakin ingin mengembalikan notifikasi ini ke daftar utama?",
                color: HappyHuesTheme.highlight,
                onConfirm: async () => {
                    try {
                        if (typeof NotifikasiResponse.restore === "function") {
                            await NotifikasiResponse.restore(id);
                        }
                        setNotifikasi((prev) =>
                            prev.map((n) =>
                                n.idNotif === id
                                    ? { ...n, isDeleted: false, deletedAt: null }
                                    : n
                            )
                        );
                    } catch (err) {
                        alert("Gagal memulihkan notifikasi. Silakan coba lagi.");
                        console.error(err);
                    }
                }
            });
        }, []);

        const filterTabs = useMemo(() => [
            { key: "semua",    label: `Semua (${unreadCount + readCount})` },
            { key: "belum",    label: `Belum Dibaca (${unreadCount})` },
            { key: "sudah",    label: `Sudah Dibaca (${readCount})` },
            { key: "terhapus", label: `Sampah (${trashCount})` },
        ], [unreadCount, readCount, trashCount]);

        const tabStyle = useCallback((key) => ({
            padding: "10px 20px",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            border: `3px solid ${HappyHuesTheme.stroke}`,
            backgroundColor: filter === key ? HappyHuesTheme.highlight : HappyHuesTheme.main,
            color: filter === key ? HappyHuesTheme.buttonText : HappyHuesTheme.stroke,
            boxShadow: filter === key ? `4px 4px 0px ${HappyHuesTheme.stroke}` : "none",
            transform: filter === key ? "translate(-2px, -2px)" : "none",
            transition: "all 0.1s ease-in-out",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        }), [filter]);

        return (
            <DashboardLayout role={currentRole} activeMenu="Notifikasi">
                <PageContainer>
                    <StyledCard
                        title={
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <RiNotification4Fill size={22} />
                                <span>NOTIFIKASI {unreadCount > 0 ? `(${unreadCount} BARU)` : ""}</span>
                            </div>
                        }
                        accentColor={HappyHuesTheme.highlight}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {filterTabs.map((tab) => (
                                    <button key={tab.key} onClick={() => setFilter(tab.key)} style={tabStyle(tab.key)}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                <StyledButton
                                    label={<span style={{ display: "flex", alignItems: "center", gap: "6px" }}><RiCheckDoubleLine size={16} /> {actionLoading ? "Memproses..." : "Tandai Semua Dibaca"}</span>}
                                    type="primary"
                                    onClick={handleMarkAllAsRead}
                                    disabled={unreadCount === 0 || actionLoading}
                                    style={{ opacity: unreadCount === 0 || actionLoading ? 0.5 : 1 }}
                                />
                                <StyledButton
                                    label={<span style={{ display: "flex", alignItems: "center", gap: "6px" }}><RiDeleteBinLine size={16} /> {actionLoading ? "Memproses..." : "Hapus Semua"}</span>}
                                    color={HappyHuesTheme.secondary}
                                    onClick={handleDeleteAll}
                                    disabled={deletableCount === 0 || actionLoading}
                                    style={{ opacity: deletableCount === 0 || actionLoading ? 0.5 : 1 }}
                                />
                                <StyledButton
                                    label={<span style={{ display: "flex", alignItems: "center", gap: "6px" }}><RiRefreshLine size={16} /> Refresh</span>}
                                    type="secondary"
                                    onClick={fetchNotifikasi}
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.5 : 1 }}
                                />
                            </div>
                        </div>
                    </StyledCard>

                    {error && (
                        <div style={{
                            padding: "16px 20px",
                            marginBottom: "20px",
                            backgroundColor: "#fff0f0",
                            border: `3px solid ${HappyHuesTheme.secondary}`,
                            boxShadow: `4px 4px 0px ${HappyHuesTheme.stroke}`,
                            color: HappyHuesTheme.secondary,
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}>
                            <RiAlertFill size={18} /> {error}
                        </div>
                    )}

                    <StyledCard accentColor={HappyHuesTheme.tertiary}>
                        {loading ? (
                            <LoadingSkeleton />
                        ) : filtered.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                {filtered.slice(0, visibleCount).map((notif, index) => (
                                    <NotifItem
                                        key={`${notif.idNotif || "notif"}-${index}`}
                                        notif={notif}
                                        onRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        onRestore={handleRestore}
                                    />
                                ))}
                                {visibleCount < filtered.length && (
                                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                                        <StyledButton
                                            label="Tampilkan Lainnya (+25)"
                                            type="secondary"
                                            onClick={() => setVisibleCount((prev) => prev + 25)}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </StyledCard>
                </PageContainer>

                <ConfirmModal
                    isOpen={confirmConfig.isOpen}
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    color={confirmConfig.color}
                    onClose={closeConfirmation}
                    onConfirm={confirmConfig.onConfirm}
                />
            </DashboardLayout>
        );
    };

    export default NotifikasiPage;