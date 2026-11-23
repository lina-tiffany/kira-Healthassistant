import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  Pill,
  Trash2,
  HeartPulse,
  ClipboardList,
  RefreshCw,
  Inbox,
} from "lucide-react";
import api from "./api";

const categories = [
  { value: "all", label: "All" },
  { value: "medication", label: "Medication" },
  { value: "appointment", label: "Appointments" },
  { value: "wellness", label: "Wellness" },
  { value: "health", label: "Health" },
  { value: "general", label: "General" },
];

const categoryIcons = {
  medication: Pill,
  appointment: CalendarDays,
  wellness: HeartPulse,
  health: ClipboardList,
  general: Bell,
};

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NotificationCenter({ onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications/", {
        params: filter === "all" ? {} : { category: filter },
      });

      const results = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setNotifications(results);
    } catch {
      setError("We couldn't load your notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const refreshUnread = useCallback(async () => {
    try {
      const response = await api.get("/notifications/unread-count/");
      onUnreadChange?.(response.data.unread_count || 0);
    } catch {
      // Keep the current badge if the request fails.
    }
  }, [onUnreadChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  async function markAsRead(id) {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      refreshUnread();
    } catch {
      setError("Unable to update this notification.");
    }
  }

  async function markAllAsRead() {
    setWorking(true);

    try {
      await api.post("/notifications/read-all/");
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
      refreshUnread();
    } catch {
      setError("Unable to mark notifications as read.");
    } finally {
      setWorking(false);
    }
  }

  async function deleteNotification(id) {
    setWorking(true);

    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );
      refreshUnread();
    } catch {
      setError("Unable to delete this notification.");
    } finally {
      setWorking(false);
    }
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <section className="notification-center">
      <div className="notification-toolbar">
        <div>
          <span className="notification-eyebrow">STAY INFORMED</span>
          <h2>Your notifications</h2>
          <p>
            {unreadCount
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
        </div>

        <div className="notification-toolbar-actions">
          <button
            className="notification-action"
            onClick={loadNotifications}
            disabled={loading}
            title="Refresh notifications"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="notification-action primary"
            onClick={markAllAsRead}
            disabled={working || unreadCount === 0}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notification-filters">
        {categories.map((category) => (
          <button
            key={category.value}
            className={`notification-filter ${
              filter === category.value ? "active" : ""
            }`}
            onClick={() => setFilter(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {error && <div className="notification-error">{error}</div>}

      {loading ? (
        <div className="notification-empty">
          <RefreshCw size={25} />
          <p>Loading your notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notification-empty">
          <div className="notification-empty-icon">
            <Inbox size={30} />
          </div>
          <h3>No notifications yet</h3>
          <p>
            When you receive medication reminders, appointment updates, or
            health alerts, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((item) => {
            const Icon = categoryIcons[item.category] || Bell;

            return (
              <article
                className={`notification-card ${
                  item.is_read ? "read" : "unread"
                }`}
                key={item.id}
              >
                <div className={`notification-card-icon ${item.category}`}>
                  <Icon size={21} />
                </div>

                <div className="notification-card-content">
                  <div className="notification-card-heading">
                    <h3>{item.title}</h3>
                    {!item.is_read && (
                      <span className="notification-unread-dot" />
                    )}
                  </div>

                  <p>{item.message}</p>

                  <span className="notification-date">
                    <Clock size={13} />
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <div className="notification-card-actions">
                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check size={17} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default NotificationCenter;
