import { useDashboardData } from "./useDashboardData";
import MedicationManager from "./MedicationManager";
import SymptomTracker from "./SymptomTracker";
import HealthRecords from "./HealthRecords";
import Appointments from "./Appointments";
import Wellness from "./Wellness";
import NotificationCenter from "./NotificationCenter";
import api from "./api";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Moon,
  Sun,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  Bell,
  UserRound,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { useLanguage } from "./i18n";

function App() {
  const { language, changeLanguage, t } = useLanguage();
  const { data, loading, error } = useDashboardData();
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("kira_theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("kira_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/notifications/unread-count/");
      setUnreadCount(response.data.unread_count || 0);
    } catch {
      // Notifications remain available when the count cannot be loaded.
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 60000);
    return () => window.clearInterval(interval);
  }, [refreshUnreadCount]);

  const navigation = [
    { label: "Overview", icon: Home },
    { label: "Medications", icon: Pill },
    { label: "Symptoms", icon: Activity },
    { label: "Health records", icon: ClipboardList },
    { label: "Appointments", icon: CalendarDays },
    { label: "Wellness", icon: HeartPulse },
    { label: "Notifications", icon: Bell },
  ];

  const stats = [
    {
      label: "Active medications",
      value: data.medications.length,
      icon: Pill,
      color: "teal",
    },
    {
      label: "Symptoms logged",
      value: data.symptoms.length,
      icon: Activity,
      color: "orange",
    },
    {
      label: "Upcoming appointments",
      value: data.appointments.length,
      icon: CalendarDays,
      color: "blue",
    },
    {
      label: "Wellness entries",
      value: data.wellness.length,
      icon: HeartPulse,
      color: "purple",
    },
  ];

  function formatDate(value) {
    if (!value) return t("Date not provided");
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
          ...(language === "fr" ? { localeMatcher: "lookup" } : {}),
        });
  }

  return (
    <div className={`kira-app ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={25} />
          </div>
          <div>
            <h2>KIRA</h2>
            <span>{t("HEALTH ASSISTANT")}</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("Close navigation")}
          >
            <X />
          </button>
        </div>

        <div className="nav-heading">{t("MENU")}</div>
        <nav>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => {
                setActivePage(label);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{t(label)}</span>
              {label === "Notifications" && unreadCount > 0 && (
                <span className="nav-unread-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="language-selector">
            <label htmlFor="kira-language">{t("Language")}</label>
            <select
              id="kira-language"
              value={language}
              onChange={(event) => changeLanguage(event.target.value)}
              aria-label={t("Language")}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="rw">Kinyarwanda</option>
            </select>
          </div>
          <div className="secure-note">
            <ShieldCheck size={20} />
            <div>
              <strong>{t("Your health matters")}</strong>
              <span>{t("Your health information is private.")}</span>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
          <button className="nav-item" onClick={() => {
            localStorage.removeItem("kira_access_token");
            localStorage.removeItem("kira_refresh_token");
            window.location.reload();
          }}>
            <LogOut size={19} />
            <span>{t("Sign out")}</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("Open navigation")}
          >
            <Menu />
          </button>
          <div className="breadcrumb">{t("Patient portal")} / {t(activePage)}</div>
          <div className="topbar-actions">
            <button
              className="topbar-notification"
              onClick={() => setActivePage("Notifications")}
              aria-label={`${unreadCount} unread notifications`}
              title={t("Notifications")}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="topbar-notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <div className="topbar-user">
            <div className="user-avatar">
              <UserRound size={19} />
            </div>
            <span>{t("My account")}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="eyebrow">{t("YOUR PERSONAL HEALTH SPACE")}</span>
              <h1>
                {activePage === "Overview"
                  ? t("Welcome to KIRA")
                  : activePage}
              </h1>
              <p>
                {t("Keep track of your health, manage your care, and stay informed.")}
              </p>
            </div>
            <div className="welcome-icon">
              <Stethoscope size={38} />
            </div>
          </section>

          {error && (
            <div className="dashboard-alert">
              {error}
            </div>
          )}

          {activePage === "Medications" && <MedicationManager />}
          {activePage === "Symptoms" && <SymptomTracker />}
          {activePage === "Health records" && <HealthRecords />}
          {activePage === "Appointments" && <Appointments />}
          {activePage === "Wellness" && <Wellness />}
          {activePage === "Notifications" && (
            <NotificationCenter onUnreadChange={setUnreadCount} />
          )}

          {activePage === "Overview" && (
            <>
              <section className="stats-grid">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <article className="stat-card" key={label}>
                    <div className={`stat-icon ${color}`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <p>{t(label)}</p>
                      <h2>{loading ? "—" : value}</h2>
                    </div>
                  </article>
                ))}
              </section>

              <section className="content-grid">
                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t("My medications")}</h2>
                      <p>{t("Your medication list")}</p>
                    </div>
                    <Pill size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">{t("Loading medications...")}</p>
                  ) : data.medications.length ? (
                    data.medications.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><Pill size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.name || item.medication_name || item.medicine_name || t("Medication")}
                          </strong>
                          <span>
                            {item.dosage || item.frequency || t("Dosage not specified")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">{t("No medications recorded yet.")}</p>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t("Upcoming appointments")}</h2>
                      <p>{t("Your scheduled visits")}</p>
                    </div>
                    <CalendarDays size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">{t("Loading appointments...")}</p>
                  ) : data.appointments.length ? (
                    data.appointments.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><CalendarDays size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.title || item.reason || item.doctor_name || t("Appointment")}
                          </strong>
                          <span>
                            {formatDate(item.appointment_date || item.date || item.scheduled_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">{t("No appointments recorded yet.")}</p>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t("Recent symptoms")}</h2>
                      <p>{t("Your symptom history")}</p>
                    </div>
                    <Activity size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">{t("Loading symptoms...")}</p>
                  ) : data.symptoms.length ? (
                    data.symptoms.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><Activity size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.name || item.symptom_name || item.symptom || t("Symptom entry")}
                          </strong>
                          <span>
                            {item.severity || t("Severity not specified")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">{t("No symptoms recorded yet.")}</p>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t("Wellness")}</h2>
                      <p>{t("Your wellbeing activity")}</p>
                    </div>
                    <HeartPulse size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">{t("Loading wellness data...")}</p>
                  ) : data.wellness.length ? (
                    data.wellness.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><HeartPulse size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.mood || item.activity || item.entry_type || "Wellness entry"}
                          </strong>
                          <span>
                            {formatDate(item.date || item.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">{t("No wellness entries yet.")}</p>
                  )}
                </article>
              </section>
            </>
          )}

          {activePage !== "Overview" && activePage !== "Medications" && activePage !== "Symptoms" && activePage !== "Health records" && activePage !== "Appointments" && activePage !== "Wellness" && activePage !== "Notifications" && (
            <section className="panel page-panel">
              <div className="panel-heading">
                <div>
                  <h2>{activePage}</h2>
                  <p>{t("Your KIRA health information")}</p>
                </div>
              </div>
              <p className="empty-state">
                {t("This section is being prepared. Your health information will appear here as we complete this module.")}
              </p>
            </section>
          )}

          <footer className="dashboard-footer">
            <span>{t("KIRA Health Assistant")}</span>
            <span>{t("Supporting your health journey, every day.")}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
