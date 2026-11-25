import { useEffect, useState } from "react";
import {
  FileText, Upload, Plus, Search, Pencil, Trash2,
  Download, X, FolderOpen
} from "lucide-react";
import api from "./api";
import { useLanguage } from "./i18n";

const emptyForm = {
  record_type: "medical_history",
  title: "",
  description: "",
  diagnosis: "",
  treatment: "",
  doctor_name: "",
  healthcare_facility: "",
  record_date: new Date().toISOString().slice(0, 10),
};

const recordTypes = [
  ["diagnosis", "Diagnosis"],
  ["medical_history", "Medical History"],
  ["allergy", "Allergy"],
  ["doctor_instruction", "Doctor's Instruction"],
  ["lab_result", "Laboratory Result"],
  ["prescription", "Prescription"],
  ["other", "Other"],
];

function getList(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function HealthRecords() {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [attachment, setAttachment] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRecords() {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (filterType) params.record_type = filterType;

      const response = await api.get("/health-records/", { params });
      setRecords(getList(response));
    } catch (error) {
      setMessage(t("Unable to load health records."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [search, filterType]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function openNewForm() {
    setEditing(null);
    setForm(emptyForm);
    setAttachment(null);
    setShowForm(true);
    setMessage("");
  }

  function openEditForm(record) {
    setEditing(record.id);
    setForm({
      record_type: record.record_type || "other",
      title: record.title || "",
      description: record.description || "",
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      doctor_name: record.doctor_name || "",
      healthcare_facility: record.healthcare_facility || "",
      record_date: record.record_date || "",
    });
    setAttachment(null);
    setShowForm(true);
    setMessage("");
  }

  async function saveRecord(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (attachment) {
        payload.append("attachment", attachment);
      }

      if (editing) {
        await api.patch(`/health-records/${editing}/`, payload);
        setMessage(t("Health record updated successfully."));
      } else {
        await api.post("/health-records/", payload);
        setMessage(t("Health record saved successfully."));
      }

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setAttachment(null);
      await loadRecords();
    } catch (error) {
      const details = error.response?.data;
      setMessage(
        details ? JSON.stringify(details) : t("Could not save this health record.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm(t("Delete this health record permanently?"))) return;

    try {
      await api.delete(`/health-records/${id}/`);
      setMessage(t("Health record deleted."));
      await loadRecords();
    } catch {
      setMessage(t("Could not delete this health record."));
    }
  }

  function recordLabel(type) {
    return t(recordTypes.find(item => item[0] === type)?.[1] || "Other");
  }

  function openAttachment(url) {
    if (!url) return;
    const fullUrl = url.startsWith("http")
      ? url
      : `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="health-records-page">
      <div className="health-records-heading">
        <div>
          <span className="eyebrow">{t("PERSONAL HEALTH LIBRARY")}</span>
          <h2>{t("Health records")}</h2>
          <p>{t("Keep your important medical information organized in one place.")}</p>
        </div>
        <button className="hr-primary-button" onClick={openNewForm}>
          <Plus size={17} /> Add health record
        </button>
      </div>

      <div className="health-records-overview">
        <div className="hr-overview-icon"><FolderOpen size={23} /></div>
        <div>
          <strong>{records.length} records displayed</strong>
          <p>{t("Your diagnoses, medical history, prescriptions and documents.")}</p>
        </div>
      </div>

      {message && (
        <div className="hr-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label={t("Dismiss")}>
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <form className="hr-form" onSubmit={saveRecord}>
          <div className="hr-form-heading">
            <div>
              <h3>{editing ? "Edit health record" : "Add a health record"}</h3>
              <p>{t("Enter the information from your medical document or consultation.")}</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} aria-label={t("Close")}>
              <X size={19} />
            </button>
          </div>

          <div className="hr-form-grid">
            <label>
              Record type *
              <select name="record_type" value={form.record_type} onChange={updateField} required>
                {recordTypes.map(([value, label]) => (
                  <option value={value} key={value}>{t(label)}</option>
                ))}
              </select>
            </label>

            <label>
              Record title *
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Blood test results"
                required
              />
            </label>

            <label>
              Record date *
              <input
                type="date"
                name="record_date"
                value={form.record_date}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Doctor's name
              <input
                name="doctor_name"
                value={form.doctor_name}
                onChange={updateField}
                placeholder={t("Healthcare professional")}
              />
            </label>

            <label className="hr-wide">
              Healthcare facility
              <input
                name="healthcare_facility"
                value={form.healthcare_facility}
                onChange={updateField}
                placeholder={t("Hospital, clinic or laboratory")}
              />
            </label>

            <label className="hr-wide">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows="3"
                placeholder={t("Additional information about this record...")}
              />
            </label>

            <label>
              Diagnosis
              <textarea
                name="diagnosis"
                value={form.diagnosis}
                onChange={updateField}
                rows="3"
                placeholder={t("Diagnosis details, if applicable")}
              />
            </label>

            <label>
              Treatment
              <textarea
                name="treatment"
                value={form.treatment}
                onChange={updateField}
                rows="3"
                placeholder={t("Treatment or medication details")}
              />
            </label>

            <label className="hr-wide hr-file-field">
              <span>{t("Attach a document")}</span>
              <div className="hr-upload-area">
                <Upload size={22} />
                <strong>{attachment ? attachment.name : "Choose a file to upload"}</strong>
                <small>{t("PDF, images or other supported document formats")}</small>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={event => setAttachment(event.target.files?.[0] || null)}
                />
              </div>
              {editing && !attachment && (
                <small>{t("Leave empty to keep the existing attachment.")}</small>
              )}
            </label>
          </div>

          <div className="hr-form-actions">
            <button
              type="button"
              className="hr-secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="hr-primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save record"}
            </button>
          </div>
        </form>
      )}

      <div className="hr-toolbar">
        <div className="hr-search">
          <Search size={17} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t("Search health records...")}
          />
        </div>
        <select value={filterType} onChange={event => setFilterType(event.target.value)}>
          <option value="">{t("All record types")}</option>
          {recordTypes.map(([value, label]) => (
            <option value={value} key={value}>{t(label)}</option>
          ))}
        </select>
      </div>

      <div className="hr-list-heading">
        <h3>{t("Medical history")}</h3>
        <span>{records.length} records</span>
      </div>

      {loading ? (
        <div className="hr-empty">{t("Loading health records...")}</div>
      ) : records.length === 0 ? (
        <div className="hr-empty">
          <FileText size={34} />
          <strong>{t("No health records found")}</strong>
          <p>{t("Add a medical record or adjust your search filters.")}</p>
          <button className="hr-primary-button" onClick={openNewForm}>
            <Plus size={16} /> Add first record
          </button>
        </div>
      ) : (
        <div className="hr-record-list">
          {records.map(record => (
            <article className="hr-record-card" key={record.id}>
              <div className="hr-record-icon"><FileText size={21} /></div>
              <div className="hr-record-content">
                <div className="hr-record-title-row">
                  <div>
                    <span className="hr-record-type">{recordLabel(record.record_type)}</span>
                    <h3>{record.title}</h3>
                  </div>
                  <span className="hr-record-date">{record.record_date}</span>
                </div>

                {record.description && <p>{record.description}</p>}

                <div className="hr-record-meta">
                  {record.doctor_name && <span>Doctor: {record.doctor_name}</span>}
                  {record.healthcare_facility && <span>Facility: {record.healthcare_facility}</span>}
                </div>

                {record.diagnosis && (
                  <div className="hr-record-detail"><strong>{t("Diagnosis:")}</strong> {record.diagnosis}</div>
                )}
                {record.treatment && (
                  <div className="hr-record-detail"><strong>{t("Treatment:")}</strong> {record.treatment}</div>
                )}

                <div className="hr-record-actions">
                  {record.attachment && (
                    <button onClick={() => openAttachment(record.attachment)}>
                      <Download size={15} /> View attachment
                    </button>
                  )}
                  <button onClick={() => openEditForm(record)}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button className="hr-delete" onClick={() => deleteRecord(record.id)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="hr-disclaimer">
        {t("Keep your medical documents secure. KIRA organizes your records but does not replace professional medical advice.")}
      </p>
    </section>
  );
}
