import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    Bell,
    CheckCheck,
    Trash2,
    X,
    FileText,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    PartyPopper,
    Layers,
    ExternalLink
} from "lucide-react";
import "./NotificationBell.css";

const API_BASE_URL = "http://localhost:5001/api/notifications";

const NotificationBell = ({ size = 20 }) => {
    const { token, user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all"); // 'all' | 'unread'
    const popoverRef = useRef(null);

    // Fetch user notifications
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    // Poll for notifications every 12 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 12000);
        return () => clearInterval(interval);
    }, [token]);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${id}/read`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/read-all`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Error marking all read:", err);
        }
    };

    // Delete single notification
    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const target = notifications.find((n) => n._id === id);
                if (target && !target.isRead) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
                setNotifications((prev) => prev.filter((n) => n._id !== id));
            }
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    // Format relative time string
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const now = new Date();
        const past = new Date(dateStr);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Render type icon
    const renderIcon = (type) => {
        switch (type) {
            case "revision_requested":
                return <AlertCircle size={18} className="notif-icon notif-icon-revision" />;
            case "design_approved":
                return <CheckCircle2 size={18} className="notif-icon notif-icon-approved" />;
            case "quotation_approved":
                return <FileText size={18} className="notif-icon notif-icon-quotation" />;
            case "payment_received":
                return <DollarSign size={18} className="notif-icon notif-icon-payment" />;
            case "project_completed":
                return <PartyPopper size={18} className="notif-icon notif-icon-completed" />;
            default:
                return <Layers size={18} className="notif-icon notif-icon-default" />;
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        return true;
    });

    return (
        <div className="notification-bell-container" ref={popoverRef}>
            <button
                className={`bell-trigger-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    fetchNotifications();
                }}
                title="Notifications"
                aria-label="Notifications"
            >
                <Bell size={size} className="bell-svg" />
                {unreadCount > 0 && (
                    <span className="unread-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notif-dropdown animate-fade-in">
                    <div className="notif-header">
                        <div className="notif-title-row">
                            <div className="title-with-badge">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && (
                                    <span className="count-tag">{unreadCount} unread</span>
                                )}
                            </div>
                            <div className="header-actions-right">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="mark-all-btn"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={14} /> Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="close-popover-btn"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="notif-tabs">
                            <button
                                className={`notif-tab ${filter === "all" ? "active" : ""}`}
                                onClick={() => setFilter("all")}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                className={`notif-tab ${filter === "unread" ? "active" : ""}`}
                                onClick={() => setFilter("unread")}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                    </div>

                    <div className="notif-body">
                        {filteredNotifications.length === 0 ? (
                            <div className="empty-notif-state">
                                <Bell size={32} className="empty-bell-icon" />
                                <p>No {filter === "unread" ? "unread " : ""}notifications</p>
                                <span className="empty-subtext">You're all caught up!</span>
                            </div>
                        ) : (
                            <ul className="notif-list">
                                {filteredNotifications.map((n) => (
                                    <li
                                        key={n._id}
                                        className={`notif-item ${!n.isRead ? "unread" : ""}`}
                                        onClick={() => !n.isRead && markAsRead(n._id)}
                                    >
                                        <div className="notif-icon-col">
                                            {renderIcon(n.type)}
                                        </div>
                                        <div className="notif-content-col">
                                            <div className="notif-item-header">
                                                <span className="notif-item-title">{n.title}</span>
                                                <span className="notif-time">{formatTime(n.createdAt)}</span>
                                            </div>
                                            <p className="notif-message">{n.message}</p>
                                            {n.projectName && (
                                                <div className="notif-project-tag">
                                                    <span>{n.projectName}</span>
                                                    {n.projectId && <small>({n.projectId})</small>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="notif-action-col">
                                            <button
                                                onClick={(e) => deleteNotification(n._id, e)}
                                                className="delete-notif-btn"
                                                title="Delete notification"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="notif-footer">
                        <span>Real-time updates enabled</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
