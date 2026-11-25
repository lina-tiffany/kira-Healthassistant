import { useCallback, useEffect, useState } from "react";
import {
  Activity, Droplets, HeartPulse, Moon, Pencil, Plus,
  Smile, Sparkles, Trash2, X, Zap
} from "lucide-react";
import api from "./api";
import { useLanguage } from "./i18n";

const moods = [
  { value: "very_good", label: "Very good", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "low", label: "Low", emoji: "😔" },
  { value: "very_low", label: "Very low", emoji: "😞" },
];

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const blankForm = () => ({
  entry_date: today(),
  mood: "good",
  sleep_hours: "",
  water_intake_liters: "",
  physical_activity_minutes: "0",
  energy_level: "5",
  stress_level: "5",
  notes: "",
});

function listFrom(response) {
  const value = response.data;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function displayDate(value, language, t) {
  if (!value) return t("Date unavailable");
  const locale = { en: "en-GB", fr: "fr-FR", rw: "rw-RW" }[language] || "en-GB";
  return new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Wellness() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [entriesResult, summaryResult] = await Promise.allSettled([
      api.get("/wellness/"),
      api.get("/wellness/summary/"),
    ]);

    if (entriesResult.status === "fulfilled") {
      setEntries(listFrom(entriesResult.value));
    } else {
      setError(t("Unable to load your wellness history. Please try again."));
    }

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openNewForm() {
    setEditingId(null);
    setForm(blankForm());
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(entry) {
    setEditingId(entry.id);
    setForm({
      entry_date: entry.entry_date || today(),
      mood: entry.mood || "good",
      sleep_hours: entry.sleep_hours ?? "",
      water_intake_liters: entry.water_intake_liters ?? "",
      physical_activity_minutes: entry.physical_activity_minutes ?? 0,
      energy_level: entry.energy_level ?? 5,
      stress_level: entry.stress_level ?? 5,
      notes: entry.notes || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function saveEntry(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      sleep_hours: form.sleep_hours === "" ? null : Number(form.sleep_hours),
      water_intake_liters: form.water_intake_liters === "" ? null : Number(form.water_intake_liters),
      physical_activity_minutes: Number(form.physical_activity_minutes || 0),
      energy_level: form.energy_level === "" ? null : Number(form.energy_level),
      stress_level: form.stress_level === "" ? null : Number(form.stress_level),
    };

    try {
      if (editingId) {
        await api.patch(`/wellness/${editingId}/`, payload);
        setSuccess(t("Wellness entry updated successfully."));
      } else {
        await api.post("/wellness/", payload);
        setSuccess(t("Your wellness entry has been saved."));
      }

      setShowForm(false);
      setEditingId(null);
      setForm(blankForm());
      await loadData();
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail ||
        Object.entries(data || {}).map(([key, value]) =>
          `${key.replaceAll("_", " ")}: ${Array.isArray(value) ? value.join(", ") : value}`
        ).join(" ");
      setError(message || t("Could not save this entry. Please check your information."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id) {
    if (!window.confirm(t("Delete this wellness entry? This cannot be undone."))) return;

    setError("");
    try {
      await api.delete(`/wellness/${id}/`);
      setSuccess(t("Wellness entry deleted."));
      await loadData();
    } catch {
      setError(t("Could not delete this entry. Please try again."));
    }
  }

  function moodLabel(value) {
    const label = moods.find((mood) => mood.value === value)?.label || value;
    return t(label);
  }

  function moodEmoji(value) {
    return moods.find((mood) => mood.value === value)?.emoji || "💚";
  }

  const statCards = [
    {
      label: t("Days tracked"),
      value: summary?.days_tracked ?? 0,
      suffix: "/ 7",
      icon: HeartPulse,
    },
    {
      label: t("Average sleep"),
      value: summary?.average_sleep_hours ?? "—",
      suffix: " hrs",
      icon: Moon,
    },
    {
      label: t("Average water"),
      value: summary?.average_water_intake_liters ?? "—",
      suffix: " L",
      icon: Droplets,
    },
    {
      label: t("Daily activity"),
      value: summary?.average_activity_minutes == null
        ? "—"
        : Math.round(summary.average_activity_minutes),
      suffix: " min",
      icon: Activity,
    },
  ];

  const moodDistribution = summary?.mood_distribution || [];
  const maxMoodCount = Math.max(1, ...moodDistribution.map((item) => item.count));

  return (
    <section className="wellness-page">
      <div className="wellness-intro">
        <div>
          <span className="wellness-eyebrow"><Sparkles size={14} /> {t("YOUR WELLBEING MATTERS")}</span>
          <h2>{t("Take care of yourself, one day at a time.")}</h2>
          <p>{t("Track how you feel, understand your habits, and follow your wellness journey.")}</p>
        </div>
        <button className="wellness-primary-btn" onClick={openNewForm}>
          <Plus size={18} /> {t("Log today's wellness")}
        </button>
      </div>

      {error && <div className="wellness-alert error">{error}</div>}
      {success && <div className="wellness-alert success">{success}</div>}

      <div className="wellness-section-heading">
        <div>
          <h3>{t("Your seven-day overview")}</h3>
          <p>{t("A look at your recent wellness activity")}</p>
        </div>
      </div>

      <div className="wellness-stats">
        {statCards.map(({ label, value, suffix, icon: Icon }) => (
          <article className="wellness-stat" key={label}>
            <div className="wellness-stat-icon"><Icon size={20} /></div>
            <div>
              <span>{label}</span>
              <strong>{loading ? "—" : value}<small>{suffix}</small></strong>
            </div>
          </article>
        ))}
      </div>

      <div className="wellness-insights">
        <article className="wellness-panel">
          <div className="wellness-panel-heading">
            <div>
              <h3>{t("Mood distribution")}</h3>
              <p>{t("How you've been feeling over the last seven days")}</p>
            </div>
            <Smile size={21} />
          </div>

          {loading ? (
            <p className="wellness-muted">{t("Loading your mood summary...")}</p>
          ) : moodDistribution.length ? (
            <div className="mood-bars">
              {moods.map((mood) => {
                const item = moodDistribution.find((entry) => entry.mood === mood.value);
                const count = item?.count || 0;
                return (
                  <div className="mood-bar-row" key={mood.value}>
                    <span>{mood.emoji} {mood.label}</span>
                    <div className="mood-bar-track">
                      <div className="mood-bar-fill" style={{ width: `${(count / maxMoodCount) * 100}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="wellness-muted">{t("Start logging your mood to see your progress here.")}</p>
          )}
        </article>

        <article className="wellness-panel wellness-levels">
          <div className="wellness-panel-heading">
            <div>
              <h3>{t("How you're doing")}</h3>
              <p>{t("Average levels from your recent entries")}</p>
            </div>
            <Zap size={21} />
          </div>
          {[
            { label: "Energy level", value: summary?.average_energy_level, color: "energy" },
            { label: "Stress level", value: summary?.average_stress_level, color: "stress" },
          ].map((item) => (
            <div className="level-item" key={item.label}>
              <div><span>{item.label}</span><strong>{item.value == null ? "—" : `${Number(item.value).toFixed(1)} / 10`}</strong></div>
              <div className="level-track">
                <div className={`level-fill ${item.color}`} style={{ width: `${Math.min(100, Math.max(0, Number(item.value) * 10 || 0))}%` }} />
              </div>
            </div>
          ))}
          <p className="wellness-disclaimer">{t("These are personal tracking indicators, not medical assessments.")}</p>
        </article>
      </div>

      <div className="wellness-history-heading">
        <div>
          <h3>{t("Wellness history")}</h3>
          <p>{t("Your daily check-ins and personal notes")}</p>
        </div>
        <button className="wellness-secondary-btn" onClick={openNewForm}>
          <Plus size={16} /> Add entry
        </button>
      </div>

      {loading ? (
        <div className="wellness-empty">{t("Loading your wellness history...")}</div>
      ) : entries.length ? (
        <div className="wellness-history">
          {entries.map((entry) => (
            <article className="wellness-entry" key={entry.id}>
              <div className="wellness-entry-mood">{moodEmoji(entry.mood)}</div>
              <div className="wellness-entry-content">
                <div className="wellness-entry-title">
                  <div>
                    <strong>{moodLabel(entry.mood)}</strong>
                    <span>{displayDate(entry.entry_date, language, t)}</span>
                  </div>
                  <div className="wellness-entry-actions">
                    <button onClick={() => openEditForm(entry)} aria-label={t("Edit wellness entry")}><Pencil size={16} /></button>
                    <button onClick={() => deleteEntry(entry.id)} aria-label={t("Delete wellness entry")}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="wellness-entry-metrics">
                  {entry.sleep_hours != null && <span><Moon size={14} /> {entry.sleep_hours} {t("hrs sleep")}</span>}
                  {entry.water_intake_liters != null && <span><Droplets size={14} /> {entry.water_intake_liters} {t("L water")}</span>}
                  <span><Activity size={14} /> {entry.physical_activity_minutes} {t("min activity")}</span>
                  {entry.energy_level != null && <span><Zap size={14} /> {t("Energy")} {entry.energy_level}/10</span>}
                  {entry.stress_level != null && <span>{t("Stress")} {entry.stress_level}/10</span>}
                </div>
                {entry.notes && <p className="wellness-entry-notes">{entry.notes}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="wellness-empty">
          <div>💚</div>
          <strong>{t("Your wellness journey starts here")}</strong>
          <p>Log your mood, sleep, water intake, and activity to begin seeing your progress.</p>
          <button className="wellness-primary-btn" onClick={openNewForm}><Plus size={17} /> {t("Create first entry")}</button>
        </div>
      )}

      {showForm && (
        <div className="wellness-modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="wellness-form" onSubmit={saveEntry} onClick={(event) => event.stopPropagation()}>
            <div className="wellness-form-heading">
              <div>
                <span className="wellness-eyebrow">{t("DAILY CHECK-IN")}</span>
                <h3>{editingId ? t("Edit wellness entry") : t("How are you feeling today?")}</h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} aria-label={t("Close form")}><X size={21} /></button>
            </div>

            <div className="wellness-form-grid">
              <label className="wellness-field wellness-field-wide">
                {t("Entry date")}
                <input type="date" name="entry_date" value={form.entry_date} max={today()} onChange={updateField} required />
              </label>

              <div className="wellness-field wellness-field-wide">
                <span>{t("How is your mood?")}</span>
                <div className="mood-options">
                  {moods.map((mood) => (
                    <button
                      type="button"
                      key={mood.value}
                      className={form.mood === mood.value ? "selected" : ""}
                      onClick={() => setForm((current) => ({ ...current, mood: mood.value }))}
                    >
                      <span>{mood.emoji}</span>
                      <small>{t(mood.label)}</small>
                    </button>
                  ))}
                </div>
              </div>

              <label className="wellness-field">
                {t("Sleep (hours)")}
                <input type="number" name="sleep_hours" min="0" max="24" step="0.25" placeholder="e.g. 7.5" value={form.sleep_hours} onChange={updateField} />
              </label>

              <label className="wellness-field">
                {t("Water intake (litres)")}
                <input type="number" name="water_intake_liters" min="0" step="0.1" placeholder="e.g. 2" value={form.water_intake_liters} onChange={updateField} />
              </label>

              <label className="wellness-field">
                {t("Physical activity (minutes)")}
                <input type="number" name="physical_activity_minutes" min="0" step="1" value={form.physical_activity_minutes} onChange={updateField} />
              </label>

              <label className="wellness-field">
                {t("Energy level (1–10)")}
                <input type="number" name="energy_level" min="1" max="10" value={form.energy_level} onChange={updateField} />
              </label>

              <label className="wellness-field">
                {t("Stress level (1–10)")}
                <input type="number" name="stress_level" min="1" max="10" value={form.stress_level} onChange={updateField} />
              </label>

              <label className="wellness-field wellness-field-wide">
                {t("Notes about your day")}
                <textarea name="notes" rows="3" placeholder={t("How was your day? Anything you'd like to remember?")} value={form.notes} onChange={updateField} />
              </label>
            </div>

            <div className="wellness-form-actions">
              <button type="button" className="wellness-cancel-btn" onClick={() => setShowForm(false)}>{t("Cancel")}</button>
              <button type="submit" className="wellness-primary-btn" disabled={saving}>
                {saving ? t("Saving...") : editingId ? t("Update entry") : t("Save wellness entry")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Wellness;
