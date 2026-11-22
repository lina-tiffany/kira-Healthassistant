import { useEffect, useState } from "react";
import {
  CalendarDays, Plus, Pencil, Trash2, X, Clock,
  MapPin, UserRound, CheckCircle, AlertCircle
} from "lucide-react";
import api from "./api";

const emptyForm = {
  provider_name: "",
  healthcare_facility: "",
  appointment_type: "consultation",
  appointment_date: "",
  appointment_time: "",
  reason: "",
  notes: "",
};

const types = [
  ["consultation", "Consultation"],
  ["follow_up", "Follow-up"],
  ["checkup", "General checkup"],
  ["laboratory", "Laboratory"],
  ["emergency", "Emergency"],
  ["other", "Other"],
];

function getList(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAppointments() {
    setLoading(true);
    try {
      const [listResponse, summaryResponse] = await Promise.all([
        api.get("/appointments/", { params: { period } }),
        api.get("/appointments/summary/"),
      ]);
      setAppointments(getList(listResponse));
      setSummary(summaryResponse.data || {});
    } catch (error) {
      setMessage(error.response?.data?.detail || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [period]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function openNewForm() {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(appointment) {
    setEditing(appointment.id);
    setForm({
      provider_name: appointment.provider_name || "",
      healthcare_facility: appointment.healthcare_facility || "",
      appointment_type: appointment.appointment_type || "consultation",
      appointment_date: appointment.appointment_date || "",
      appointment_time: appointment.appointment_time?.slice(0, 5) || "",
      reason: appointment.reason || "",
      notes: appointment.notes || "",
    });
    setMessage("");
    setShowForm(true);
  }

  async function saveAppointment(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (editing) {
        await api.patch(`/appointments/${editing}/`, form);
        setMessage("Appointment updated successfully.");
      } else {
        await api.post("/appointments/", form);
        setMessage("Appointment booked successfully.");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await loadAppointments();
    } catch (error) {
      const data = error.response?.data;
      const details = typeof data === "string"
        ? data
        : data?.detail || Object.entries(data || {})
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" | ");
      setMessage(details || "Unable to save appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(id) {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await api.post(`/appointments/${id}/cancel/`);
      setMessage("Appointment cancelled.");
      await loadAppointments();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Unable to cancel appointment.");
    }
  }

  async function deleteAppointment(id) {
    if (!window.confirm("Permanently delete this appointment?")) return;

    try {
      await api.delete(`/appointments/${id}/`);
      setMessage("Appointment deleted.");
      await loadAppointments();
    } catch {
      setMessage("Unable to delete appointment.");
    }
  }

  return (
    <div className="module-container">
      <section className="stats-grid appointment-stats">
        {[
          ["Total appointments", summary.total ?? 0, CalendarDays],
          ["Upcoming (30 days)", summary.upcoming ?? 0, Clock],
          ["Confirmed", summary.confirmed ?? 0, CheckCircle],
          ["Completed", summary.completed ?? 0, CheckCircle],
        ].map(([label, value, Icon]) => (
          <article className="stat-card" key={label}>
            <div className="stat-icon blue"><Icon size={22} /></div>
            <div><p>{label}</p><h2>{value}</h2></div>
          </article>
        ))}
      </section>

      <section className="panel module-panel">
        <div className="module-toolbar">
          <div>
            <h2>My appointments</h2>
            <p>Organize and manage your healthcare visits.</p>
          </div>
          <button className="primary-button" onClick={openNewForm}>
            <Plus size={18} /> Book appointment
          </button>
        </div>

        {message && (
          <div className="module-message" role="status">{message}</div>
        )}

        <div className="filter-tabs">
          <button className={period === "upcoming" ? "selected" : ""} onClick={() => setPeriod("upcoming")}>Upcoming</button>
          <button className={period === "past" ? "selected" : ""} onClick={() => setPeriod("past")}>Past appointments</button>
          <button className={period === "all" ? "selected" : ""} onClick={() => setPeriod("all")}>All</button>
        </div>

        {loading ? (
          <p className="empty-state">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="appointment-empty">
            <CalendarDays size={38} />
            <h3>No appointments found</h3>
            <p>Your appointments will appear here when you book them.</p>
            <button className="primary-button" onClick={openNewForm}>
              <Plus size={18} /> Book your first appointment
            </button>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <article className="appointment-card" key={appointment.id}>
                <div className="appointment-date">
                  <CalendarDays size={22} />
                  <strong>{formatDate(appointment.appointment_date)}</strong>
                  <span>{appointment.appointment_time?.slice(0, 5)}</span>
                </div>
                <div className="appointment-details">
                  <h3>{appointment.provider_name}</h3>
                  <p><MapPin size={15} /> {appointment.healthcare_facility}</p>
                  <p><UserRound size={15} /> {types.find(([value]) => value === appointment.appointment_type)?.[1] || appointment.appointment_type}</p>
                  {appointment.reason && <p>{appointment.reason}</p>}
                </div>
                <div className="appointment-actions">
                  <span className={`status-pill status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                  {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                    <>
                      <button className="icon-button" title="Edit appointment" onClick={() => openEditForm(appointment)}><Pencil size={17} /></button>
                      <button className="icon-button" title="Cancel appointment" onClick={() => cancelAppointment(appointment.id)}><X size={17} /></button>
                    </>
                  )}
                  <button className="icon-button danger" title="Delete appointment" onClick={() => deleteAppointment(appointment.id)}><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop">
          <section className="module-modal">
            <div className="modal-heading">
              <div>
                <h2>{editing ? "Edit appointment" : "Book an appointment"}</h2>
                <p>Enter your healthcare visit details.</p>
              </div>
              <button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X /></button>
            </div>

            <form onSubmit={saveAppointment}>
              <div className="form-grid">
                <label>
                  Healthcare provider *
                  <input name="provider_name" value={form.provider_name} onChange={updateField} required maxLength={150} placeholder="Doctor or provider name" />
                </label>
                <label>
                  Healthcare facility *
                  <input name="healthcare_facility" value={form.healthcare_facility} onChange={updateField} required maxLength={200} placeholder="Hospital or clinic" />
                </label>
                <label>
                  Appointment type *
                  <select name="appointment_type" value={form.appointment_type} onChange={updateField} required>
                    {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>
                  Date *
                  <input type="date" name="appointment_date" value={form.appointment_date} onChange={updateField} min={new Date().toLocaleDateString("en-CA")} required />
                </label>
                <label>
                  Time *
                  <input type="time" name="appointment_time" value={form.appointment_time} onChange={updateField} required />
                </label>
                <label className="full-width">
                  Reason for visit
                  <textarea name="reason" value={form.reason} onChange={updateField} rows={3} placeholder="What would you like to discuss?" />
                </label>
                <label className="full-width">
                  Additional notes
                  <textarea name="notes" value={form.notes} onChange={updateField} rows={3} placeholder="Any additional information..." />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save changes" : "Book appointment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
