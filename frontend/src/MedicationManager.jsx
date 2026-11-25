import { useLanguage } from "./i18n";
import { useEffect, useState } from "react";
import { Pill, Plus, Trash2, Pencil, Clock, CheckCircle } from "lucide-react";
import api from "./api";

const emptyForm = {
  name: "",
  dosage: "",
  frequency: "",
  route: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: "",
  instructions: "",
  prescribing_doctor: "",
};

function listOf(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function MedicationManager() {
  const { t } = useLanguage();
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adherence, setAdherence] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [reminderTime, setReminderTime] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get("/medications/"),
        api.get("/medications/reminders/"),
        api.get("/medications/adherence/"),
      ]);
      if (results[0].status === "fulfilled") {
        setMedications(listOf(results[0].value));
      }
      if (results[1].status === "fulfilled") {
        setReminders(listOf(results[1].value));
      }
      if (results[2].status === "fulfilled") {
        setAdherence(results[2].value.data || {});
      }
    } catch {
      setMessage("Unable to load medication information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function startEdit(medication) {
    setEditing(medication.id);
    setForm({
      name: medication.name || "",
      dosage: medication.dosage || "",
      frequency: medication.frequency || "",
      route: medication.route || "",
      start_date: medication.start_date || "",
      end_date: medication.end_date || "",
      instructions: medication.instructions || "",
      prescribing_doctor: medication.prescribing_doctor || "",
    });
    setReminderTime("");
    setShowForm(true);
    setMessage("");
  }

  function resetForm() {
    setForm(emptyForm);
    setReminderTime("");
    setEditing(null);
    setShowForm(false);
  }

  async function saveMedication(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        end_date: form.end_date || null,
      };

      let medicationId = editing;
      if (editing) {
        await api.patch(`/medications/${editing}/`, payload);
      } else {
        const response = await api.post("/medications/", payload);
        medicationId = response.data.id;
      }

      if (reminderTime && medicationId && !editing) {
        await api.post("/medications/reminders/", {
          medication: medicationId,
          reminder_time: reminderTime,
          days_of_week: "daily",
          is_enabled: true,
        });
      }

      resetForm();
      setMessage("Medication saved successfully.");
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Could not save medication. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedication(id) {
    if (!window.confirm("Delete this medication and its reminders?")) return;
    try {
      await api.delete(`/medications/${id}/`);
      setMessage("Medication deleted.");
      await loadData();
    } catch {
      setMessage("Could not delete this medication.");
    }
  }

  async function recordDose(medicationId, status) {
    try {
      await api.post("/medications/logs/", {
        medication: medicationId,
        status,
      });
      setMessage(`Dose marked as ${status}.`);
      const response = await api.get("/medications/adherence/");
      setAdherence(response.data || {});
    } catch {
      setMessage("Could not record this dose.");
    }
  }

  return (
    <section className="medication-page">
      <div className="medication-heading">
        <div>
          <span className="eyebrow">{t('MEDICATION MANAGEMENT')}</span>
          <h2>{t('My medications')}</h2>
          <p>{t('Manage prescriptions and keep track of your doses.')}</p>
        </div>
        <button className="med-primary-button" onClick={() => {
          resetForm();
          setShowForm(true);
        }}>
          <Plus size={17} /> Add medication
        </button>
      </div>

      <div className="medication-summary">
        <div>
          <span>{t("Active medications")}</span>
          <strong>{loading ? "—" : medications.filter(m => m.is_active).length}</strong>
        </div>
        <div>
          <span>{t('Doses recorded')}</span>
          <strong>{adherence.total ?? "—"}</strong>
        </div>
        <div>
          <span>{t('Adherence')}</span>
          <strong>{adherence.adherence_percentage ?? 0}%</strong>
        </div>
      </div>

      {message && <p className="medication-message">{message}</p>}

      {showForm && (
        <form className="medication-form" onSubmit={saveMedication}>
          <h3>{editing ? "Edit medication" : "Add a medication"}</h3>
          <div className="medication-form-grid">
            <label>Medication name *
              <input name="name" value={form.name} onChange={updateField} required />
            </label>
            <label>Dosage *
              <input name="dosage" value={form.dosage} onChange={updateField} placeholder="e.g. 500 mg" required />
            </label>
            <label>Frequency *
              <input name="frequency" value={form.frequency} onChange={updateField} placeholder="e.g. Twice daily" required />
            </label>
            <label>Route
              <input name="route" value={form.route} onChange={updateField} placeholder="e.g. Oral" />
            </label>
            <label>Start date *
              <input type="date" name="start_date" value={form.start_date} onChange={updateField} required />
            </label>
            <label>End date
              <input type="date" name="end_date" value={form.end_date} onChange={updateField} />
            </label>
            <label>Prescribing doctor
              <input name="prescribing_doctor" value={form.prescribing_doctor} onChange={updateField} />
            </label>
            {!editing && (
              <label>Daily reminder time
                <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
              </label>
            )}
            <label className="medication-wide">Instructions
              <textarea name="instructions" value={form.instructions} onChange={updateField} rows="3" placeholder="Special instructions from your healthcare professional" />
            </label>
          </div>
          <div className="medication-form-actions">
            <button type="button" className="med-secondary-button" onClick={resetForm}>{t('Cancel')}</button>
            <button className="med-primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save medication"}
            </button>
          </div>
        </form>
      )}

      <div className="medication-list-heading">
        <h3>{t('Medication list')}</h3>
        <span>{medications.length} records</span>
      </div>

      {loading ? <p className="empty-state">{t('Loading medications...')}</p> :
        medications.length === 0 ? (
          <div className="medication-empty">
            <Pill size={30} />
            <strong>{t('No medications added yet')}</strong>
            <p>{t('Add a medication to begin managing your treatment plan.')}</p>
          </div>
        ) : (
          <div className="medication-cards">
            {medications.map(medication => (
              <article className="medication-card" key={medication.id}>
                <div className="medication-card-top">
                  <div className="medication-card-icon"><Pill /></div>
                  <div className="medication-card-title">
                    <h3>{medication.name}</h3>
                    <span>{medication.dosage} · {medication.frequency}</span>
                  </div>
                  <span className={`med-status ${medication.is_active ? "med-active" : "med-inactive"}`}>
                    {medication.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="medication-details">
                  <span>Route: {medication.route || "Not specified"}</span>
                  <span>Started: {medication.start_date}</span>
                  {medication.end_date && <span>Ends: {medication.end_date}</span>}
                  {medication.prescribing_doctor && <span>Doctor: {medication.prescribing_doctor}</span>}
                </div>
                {medication.instructions && <p className="medication-instructions">{medication.instructions}</p>}
                <div className="medication-reminder-info">
                  <Clock size={15} />
                  {reminders.filter(r => String(r.medication) === String(medication.id)).length
                    ? reminders.filter(r => String(r.medication) === String(medication.id)).map(r => r.reminder_time).join(", ")
                    : "No reminder set"}
                </div>
                <div className="medication-card-actions">
                  <button onClick={() => recordDose(medication.id, "taken")}><CheckCircle size={15} /> {t("Mark taken")}</button>
                  <button onClick={() => startEdit(medication)}><Pencil size={15} /> {t("Edit")}</button>
                  <button onClick={() => deleteMedication(medication.id)} className="med-delete"><Trash2 size={15} /> {t("Delete")}</button>
                </div>
              </article>
            ))}
          </div>
        )
      }
    </section>
  );
}
