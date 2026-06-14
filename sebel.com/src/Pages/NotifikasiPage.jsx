import React, { useState, useEffect, useCallback } from "react";
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
    RiAlertFill
} from "react-icons/ri";


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

const NotifItem = ({ notif, onRead, onDelete }) => {
    const isUnread = !notif.isRead;
    const containerStyle = {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        padding: "18px 20px",
        marginBottom: "12px",
        backgroundColor: isUnread ? "#fff8f0" : HappyHuesTheme.main,
        border: `3px solid ${isUnread ? HappyHuesTheme.highlight : HappyHuesTheme.stroke}`,
        boxShadow: isUnread
            ? `6px 6px 0px ${HappyHuesTheme.highlight}`
            : `4px 4px 0px ${HappyHuesTheme.stroke}`,
        transition: "all 0.15s ease-in-out",
        position: "relative",
    };

    const dotStyle = {
        width: "12px",
        height: "12px",
        minWidth: "12px",
        borderRadius: "50%",
        backgroundColor: isUnread ? HappyHuesTheme.secondary : "transparent",
        border: `2px solid ${isUnread ? HappyHuesTheme.secondary : HappyHuesTheme.paragraph}`,
        marginTop: "5px",
    };

    return (
        <div style={containerStyle}>
            <div style={dotStyle} title={isUnread ? "Belum dibaca" : "Sudah dibaca"} />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <p style={{
                        margin: 0,
                        fontWeight: "900",
                        fontSize: "15px",
                        color: HappyHuesTheme.stroke,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}>
                        {notif.judul}
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
                    color: HappyHuesTheme.stroke,
                    fontSize: "14px",
                    lineHeight: "1.6",
                }}>
                    {notif.pesan}
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                {isUnread && (
                    <StyledButton
                        label={
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <RiCheckDoubleLine size={14} /> Tandai Dibaca
                            </span>
                        }
                        color={HappyHuesTheme.tertiary}
                        padding="6px 12px"
                        fontSize="11px"
                        onClick={() => onRead(notif.idNotif)}
                    />
                )}
                <DeleteButton id={notif.idNotif} onDelete={onDelete} />
            </div>
        </div>
    );
};

const EmptyState = () => (
    <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: HappyHuesTheme.paragraph,
    }}>
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

const NotifikasiPage = () => {
    const { role } = useParams();
    const [notifikasi, setNotifikasi] = useState([]);
    const [filter, setFilter] = useState("semua");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const currentRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Guru";
    const fetchNotifikasi = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await NotifikasiResponse.getAll();
            const finalData = Array.isArray(data) ? data : data?.data ?? [];
            setNotifikasi(finalData);
        } catch (err) {
            setError("Gagal memuat notifikasi. Silakan coba lagi.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifikasi();
    }, [fetchNotifikasi]);

    const handleMarkAsRead = async (id) => {
        try {
            await NotifikasiResponse.markAsRead(id);
            setNotifikasi((prev) =>
                prev.map((n) => (n.idNotif === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            alert("Gagal menandai notifikasi. Silakan coba lagi.");
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || actionLoading) return;
        setActionLoading(true);
        try {
            await NotifikasiResponse.markAllAsRead();
            setNotifikasi((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            alert("Gagal menandai semua notifikasi. Silakan coba lagi.");
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus notifikasi ini?")) return;
        try {
            await NotifikasiResponse.delete(id);
            setNotifikasi((prev) => prev.filter((n) => n.idNotif !== id));
        } catch (err) {
            alert("Gagal menghapus notifikasi. Silakan coba lagi.");
            console.error(err);
        }
    };

    const unreadCount = notifikasi.filter((n) => !n.isRead).length;

    const filtered = notifikasi.filter((n) => {
        if (filter === "belum") return !n.isRead;
        if (filter === "sudah") return n.isRead;
        return true;
    });

    const filterTabs = [
        { key: "semua", label: `Semua (${notifikasi.length})` },
        { key: "belum", label: `Belum Dibaca (${unreadCount})` },
        { key: "sudah", label: `Sudah Dibaca (${notifikasi.length - unreadCount})` },
    ];

    const tabStyle = (key) => ({
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
    });

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
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    style={tabStyle(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <StyledButton
                                label={
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <RiCheckDoubleLine size={16} /> {actionLoading ? "Memproses..." : "Tandai Semua Dibaca"}
                                    </span>
                                }
                                type="primary"
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0 || actionLoading}
                                style={{ opacity: unreadCount === 0 || actionLoading ? 0.5 : 1 }}
                            />
                            <StyledButton
                                label={
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <RiRefreshLine size={16} /> Refresh
                                    </span>
                                }
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
                        filtered.map((notif, index) => (
                            <NotifItem
                                key={`${notif.idNotif || "notif"}-${index}`}
                                notif={notif}
                                onRead={handleMarkAsRead}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </StyledCard>
            </PageContainer>
        </DashboardLayout>
    );
};

export default NotifikasiPage;