import { useDashboardData } from "./useDashboardData";
import MedicationManager from "./MedicationManager";
import SymptomTracker from "./SymptomTracker";
import HealthRecords from "./HealthRecords";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import "./App.css";

function App() {
  const { data, loading, error } = useDashboardData();
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { label: "Overview", icon: Home },
    { label: "Medications", icon: Pill },
    { label: "Symptoms", icon: Activity },
    { label: "Health records", icon: ClipboardList },
    { label: "Appointments", icon: CalendarDays },
    { label: "Wellness", icon: HeartPulse },
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
    if (!value) return "Date not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  }

  return (
    <div className="kira-app">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={25} />
          </div>
          <div>
            <h2>KIRA</h2>
            <span>HEALTH ASSISTANT</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <div className="nav-heading">MENU</div>
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
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-note">
            <ShieldCheck size={20} />
            <div>
              <strong>Your health matters</strong>
              <span>Your health information is private.</span>
            </div>
          </div>
          <button className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <button className="nav-item" onClick={() => {
            localStorage.removeItem("kira_access_token");
            localStorage.removeItem("kira_refresh_token");
            window.location.reload();
          }}>
            <LogOut size={19} />
            <span>Sign out</span>
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
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className="breadcrumb">Patient portal / {activePage}</div>
          <div className="topbar-user">
            <div className="user-avatar">
              <UserRound size={19} />
            </div>
            <span>My account</span>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="eyebrow">YOUR PERSONAL HEALTH SPACE</span>
              <h1>
                {activePage === "Overview"
                  ? "Welcome to KIRA"
                  : activePage}
              </h1>
              <p>
                Keep track of your health, manage your care, and stay informed.
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

          {activePage === "Overview" && (
            <>
              <section className="stats-grid">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <article className="stat-card" key={label}>
                    <div className={`stat-icon ${color}`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <p>{label}</p>
                      <h2>{loading ? "—" : value}</h2>
                    </div>
                  </article>
                ))}
              </section>

              <section className="content-grid">
                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>My medications</h2>
                      <p>Your medication list</p>
                    </div>
                    <Pill size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">Loading medications...</p>
                  ) : data.medications.length ? (
                    data.medications.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><Pill size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.name || item.medication_name || item.medicine_name || "Medication"}
                          </strong>
                          <span>
                            {item.dosage || item.frequency || "Dosage not specified"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No medications recorded yet.</p>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Upcoming appointments</h2>
                      <p>Your scheduled visits</p>
                    </div>
                    <CalendarDays size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">Loading appointments...</p>
                  ) : data.appointments.length ? (
                    data.appointments.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><CalendarDays size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.title || item.reason || item.doctor_name || "Appointment"}
                          </strong>
                          <span>
                            {formatDate(item.appointment_date || item.date || item.scheduled_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No appointments recorded yet.</p>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Recent symptoms</h2>
                      <p>Your symptom history</p>
                    </div>
                    <Activity size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">Loading symptoms...</p>
                  ) : data.symptoms.length ? (
                    data.symptoms.slice(0, 5).map((item, index) => (
                      <div className="data-row" key={item.id || index}>
                        <div className="row-icon"><Activity size={18} /></div>
                        <div className="row-details">
                          <strong>
                            {item.name || item.symptom_name || item.symptom || "Symptom entry"}
                          </strong>
                          <span>
                            {item.severity || "Severity not specified"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No symptoms recorded yet.</p>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Wellness</h2>
                      <p>Your wellbeing activity</p>
                    </div>
                    <HeartPulse size={21} />
                  </div>
                  {loading ? (
                    <p className="empty-state">Loading wellness data...</p>
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
                    <p className="empty-state">No wellness entries yet.</p>
                  )}
                </article>
              </section>
            </>
          )}

          {activePage !== "Overview" && activePage !== "Medications" && activePage !== "Symptoms" && activePage !== "Health records" && (
            <section className="panel page-panel">
              <div className="panel-heading">
                <div>
                  <h2>{activePage}</h2>
                  <p>Your KIRA health information</p>
                </div>
              </div>
              <p className="empty-state">
                This section is being prepared. Your health information will appear here as we complete this module.
              </p>
            </section>
          )}

          <footer className="dashboard-footer">
            <span>KIRA Health Assistant</span>
            <span>Supporting your health journey, every day.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
