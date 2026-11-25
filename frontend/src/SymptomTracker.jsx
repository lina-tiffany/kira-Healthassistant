import { useEffect, useState } from "react";
import { Activity, Plus, Pencil, Trash2, CalendarDays, X } from "lucide-react";
import api from "./api";
import { useLanguage } from "./i18n";

const emptyForm = {
  symptom_name: "",
  severity: 5,
  description: "",
  onset_date: new Date().toISOString().slice(0, 10),
  duration: "",
  triggers: "",
  associated_symptoms: "",
  status: "ongoing",
};

function getList(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function SymptomTracker() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [entryResponse, analyticsResponse] = await Promise.all([
        api.get("/symptoms/"),
        api.get("/symptoms/analytics/"),
      ]);
      setEntries(getList(entryResponse));
      setAnalytics(analyticsResponse.data || {});
    } catch {
      setMessage("Unable to load symptom information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function openNewForm() {
    setEditing(null);
    setForm({ ...emptyForm, onset_date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
    setMessage("");
  }

  function openEditForm(entry) {
    setEditing(entry.id);
    setForm({
      symptom_name: entry.symptom_name || "",
      severity: entry.severity || 5,
      description: entry.description || "",
      onset_date: entry.onset_date || "",
      duration: entry.duration || "",
      triggers: entry.triggers || "",
      associated_symptoms: entry.associated_symptoms || "",
      status: entry.status || "ongoing",
    });
    setShowForm(true);
    setMessage("");
  }

  async function saveEntry(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        severity: Number(form.severity),
      };

      if (editing) {
        await api.patch(`/symptoms/${editing}/`, payload);
        setMessage("Symptom entry updated.");
      } else {
        await api.post("/symptoms/", payload);
        setMessage("Symptom recorded successfully.");
      }

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      const details = error.response?.data;
      setMessage(
        details ? JSON.stringify(details) : "Could not save this symptom entry."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id) {
    if (!window.confirm("Delete this symptom entry?")) return;

    try {
      await api.delete(`/symptoms/${id}/`);
      setMessage("Symptom entry deleted.");
      await loadData();
    } catch {
      setMessage("Could not delete this entry.");
    }
  }

  function severityLabel(value) {
    if (value <= 3) return "Mild";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "Severe";
    return "Very severe";
  }

  return (
    <section className="symptom-page">
      <div className="symptom-heading">
        <div>
          <span className="eyebrow">{t("HEALTH MONITORING")}</span>
          <h2>{t("Symptom tracker")}</h2>
          <p>{t("Record how you feel and follow changes in your symptoms over time.")}</p>
        </div>
        <button className="sym-primary-button" onClick={openNewForm}>
          <Plus size={17} /> Record symptom
        </button>
      </div>

      <div className="symptom-summary">
        <div>
          <span>{t("Total records")}</span>
          <strong>{loading ? "—" : analytics.total_entries ?? 0}</strong>
        </div>
        <div>
          <span>{t("Average severity")}</span>
          <strong>{loading ? "—" : `${analytics.average_severity ?? 0}/10`}</strong>
        </div>
        <div>
          <span>{t("Ongoing")}</span>
          <strong>{loading ? "—" : analytics.ongoing ?? 0}</strong>
        </div>
        <div>
          <span>{t("Resolved")}</span>
          <strong>{loading ? "—" : analytics.resolved ?? 0}</strong>
        </div>
      </div>

      {message && (
        <div className="symptom-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <form className="symptom-form" onSubmit={saveEntry}>
          <div className="symptom-form-heading">
            <h3>{editing ? "Edit symptom entry" : "Record a symptom"}</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form">
              <X size={19} />
            </button>
          </div>

          <div className="symptom-form-grid">
            <label>
              Symptom name *
              <input
                name="symptom_name"
                value={form.symptom_name}
                onChange={updateField}
                placeholder={t("e.g. Headache")}
                required
              />
            </label>

            <label>
              Onset date *
              <input
                type="date"
                name="onset_date"
                value={form.onset_date}
                onChange={updateField}
                required
              />
            </label>

            <label className="symptom-severity-field">
              <span>{t("Severity:")} <strong>{form.severity}/10 — {severityLabel(Number(form.severity))}</strong></span>
              <input
                type="range"
                name="severity"
                min="1"
                max="10"
                value={form.severity}
                onChange={updateField}
              />
              <span className="symptom-range-labels">
                <small>1 · Mild</small>
                <small>10 · Very severe</small>
              </span>
            </label>

            <label>
              Duration
              <input
                name="duration"
                value={form.duration}
                onChange={updateField}
                placeholder={t("e.g. 2 hours, 3 days")}
              />
            </label>

            <label>
              Current status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="ongoing">{t("Ongoing")}</option>
                <option value="improving">{t("Improving")}</option>
                <option value="resolved">{t("Resolved")}</option>
              </select>
            </label>

            <label className="symptom-wide">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows="3"
                placeholder={t("Describe what you are experiencing...")}
              />
            </label>

            <label>
              Possible triggers
              <textarea
                name="triggers"
                value={form.triggers}
                onChange={updateField}
                rows="2"
                placeholder={t("e.g. Certain foods, activity, stress...")}
              />
            </label>

            <label>
              Associated symptoms
              <textarea
                name="associated_symptoms"
                value={form.associated_symptoms}
                onChange={updateField}
                rows="2"
                placeholder={t("Other symptoms experienced at the same time...")}
              />
            </label>
          </div>

          <div className="symptom-form-actions">
            <button
              type="button"
              className="sym-secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="sym-primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save symptom"}
            </button>
          </div>
        </form>
      )}

      <div className="symptom-list-heading">
        <div>
          <h3>{t("Symptom history")}</h3>
          <p>{t("Your previously recorded symptoms")}</p>
        </div>
        <span>{entries.length} records</span>
      </div>

      {loading ? (
        <p className="symptom-empty">{t("Loading symptom history...")}</p>
      ) : entries.length === 0 ? (
        <div className="symptom-empty">
          <Activity size={32} />
          <strong>{t("No symptoms recorded yet")}</strong>
          <p>{t("Start tracking your symptoms to build your health history.")}</p>
          <button className="sym-primary-button" onClick={openNewForm}>
            <Plus size={16} /> Record first symptom
          </button>
        </div>
      ) : (
        <div className="symptom-list">
          {entries.map(entry => (
            <article className="symptom-card" key={entry.id}>
              <div className="symptom-card-top">
                <div className="symptom-card-icon">
                  <Activity size={20} />
                </div>
                <div className="symptom-card-title">
                  <h3>{entry.symptom_name}</h3>
                  <span>
                    <CalendarDays size={14} /> {entry.onset_date}
                  </span>
                </div>
                <span className={`symptom-status status-${entry.status}`}>
                  {entry.status}
                </span>
              </div>

              <div className="symptom-severity-display">
                <span>{t("Severity")}</span>
                <strong>{entry.severity}/10</strong>
                <div className="symptom-severity-track">
                  <div style={{ width: `${entry.severity * 10}%` }} />
                </div>
                <small>{severityLabel(entry.severity)}</small>
              </div>

              {entry.description && <p className="symptom-description">{entry.description}</p>}

              <div className="symptom-details">
                {entry.duration && <span>Duration: {entry.duration}</span>}
                {entry.triggers && <span>Triggers: {entry.triggers}</span>}
                {entry.associated_symptoms && (
                  <span>Associated symptoms: {entry.associated_symptoms}</span>
                )}
              </div>

              <div className="symptom-card-actions">
                <button onClick={() => openEditForm(entry)}>
                  <Pencil size={15} /> Edit
                </button>
                <button className="sym-delete" onClick={() => deleteEntry(entry.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="symptom-disclaimer">
        KIRA helps you keep a record of your health. It does not diagnose conditions
        or replace advice from a qualified healthcare professional.
      </p>
    </section>
  );
}
