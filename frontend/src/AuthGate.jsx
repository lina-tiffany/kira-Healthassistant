import { useState } from "react";
import api from "./api";
import App from "./App";
import { Heart, LockKeyhole, Mail, User, Phone } from "lucide-react";
import "./AuthGate.css";
import { useLanguage } from "./i18n";

const authText = {
  en: {
    create: "Create account", already: "Already have an account?",
    noAccount: "Don't have an account?", first: "First name",
    last: "Last name", username: "Username", phone: "Phone number",
    confirm: "Confirm password", preferred: "Preferred language",
    creating: "Creating account...", register: "Create my account",
    registering: "Your account was created. Check your email for a verification link.",
    resend: "Resend verification email", resendDone: "If an unverified account exists, a verification email will be sent.",
    mismatch: "Passwords do not match.", failed: "Registration failed.",
    signing: "Signing in...", login: "Sign in", welcome: "Welcome back",
    subtitle: "Sign in to continue your health journey.",
    email: "Email address", password: "Password",
    enterEmail: "Enter your email", enterPassword: "Enter your password",
    security: "Your health information is protected.",
    footer: "Your health. Your journey. Your KIRA.",
    sending: "Sending...", verifyTitle: "Verify your email",
    verifyHelp: "Check your inbox for the verification link. You must verify your email before signing in.",
    back: "Back to sign in", required: "Please complete all required fields."
  },
  fr: {
    create: "Créer un compte", already: "Vous avez déjà un compte ?",
    noAccount: "Vous n'avez pas de compte ?", first: "Prénom",
    last: "Nom", username: "Nom d'utilisateur", phone: "Numéro de téléphone",
    confirm: "Confirmer le mot de passe", preferred: "Langue préférée",
    creating: "Création du compte...", register: "Créer mon compte",
    registering: "Votre compte a été créé. Consultez votre e-mail pour le lien de vérification.",
    resend: "Renvoyer l'e-mail de vérification", resendDone: "Si un compte non vérifié existe, un e-mail de vérification sera envoyé.",
    mismatch: "Les mots de passe ne correspondent pas.", failed: "Échec de l'inscription.",
    signing: "Connexion...", login: "Se connecter", welcome: "Bon retour",
    subtitle: "Connectez-vous pour poursuivre votre parcours de santé.",
    email: "Adresse e-mail", password: "Mot de passe",
    enterEmail: "Saisissez votre e-mail", enterPassword: "Saisissez votre mot de passe",
    security: "Vos informations de santé sont protégées.",
    footer: "Votre santé. Votre parcours. Votre KIRA.",
    sending: "Envoi...", verifyTitle: "Vérifiez votre e-mail",
    verifyHelp: "Consultez votre boîte de réception. Vous devez vérifier votre adresse avant de vous connecter.",
    back: "Retour à la connexion", required: "Veuillez remplir tous les champs obligatoires."
  },
  rw: {
    create: "Fungura konti", already: "Usanzwe ufite konti?",
    noAccount: "Nta konti ufite?", first: "Izina",
    last: "Izina ry'umuryango", username: "Izina ukoresha",
    phone: "Nimero ya telefoni", confirm: "Emeza ijambo ry'ibanga",
    preferred: "Ururimi ukunda", creating: "Konti irimo gukorwa...",
    register: "Fungura konti yanjye",
    registering: "Konti yawe yakozwe. Reba muri imeri yawe urebe ubutumwa bwo kwemeza.",
    resend: "Ongera wohereze ubutumwa bwo kwemeza",
    resendDone: "Niba hari konti itaremezwa kuri iyi imeri, ubutumwa bwo kwemeza buroherezwa.",
    mismatch: "Amagambo y'ibanga ntahura.", failed: "Gufungura konti ntibyashobotse.",
    signing: "Birimo kwinjira...", login: "Injira", welcome: "Murakaza neza",
    subtitle: "Injira ukomeze urugendo rwawe rw'ubuzima.",
    email: "Aderesi ya imeri", password: "Ijambo ry'ibanga",
    enterEmail: "Andika imeri yawe", enterPassword: "Andika ijambo ry'ibanga",
    security: "Amakuru yawe y'ubuzima ararinzwe.",
    footer: "Ubuzima bwawe. Urugendo rwawe. KIRA yawe.",
    sending: "Birimo koherezwa...", verifyTitle: "Emeza imeri yawe",
    verifyHelp: "Reba muri imeri yawe. Ugomba kubanza kwemeza imeri mbere yo kwinjira.",
    back: "Subira ku kwinjira", required: "Uzuza ahantu hose hasabwa."
  }
};

export default function AuthGate() {
  const { language, changeLanguage, t } = useLanguage();
  const words = authText[language] || authText.en;
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("kira_access_token"))
  );
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noticeType, setNoticeType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", username: "", phone_number: "",
    password_confirmation: "", preferred_language: language
  });

  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNoticeType("");

    try {
      const response = await api.post("/accounts/login/", {
        email: email.trim().toLowerCase(), password
      });
      const { access, refresh } = response.data;
      if (!access) throw new Error(t("The server did not return an access token."));
      localStorage.setItem("kira_access_token", access);
      if (refresh) localStorage.setItem("kira_refresh_token", refresh);
      setAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || words.login + ": " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNoticeType("");

    if (password !== form.password_confirmation) {
      setError(words.mismatch);
      setLoading(false);
      return;
    }

    try {
      await api.post("/accounts/register/", {
        username: form.username.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: form.password_confirmation,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
        preferred_language: language
      });
      setMode("verify");
      setNoticeType("registered");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
        (data && Object.entries(data).map(([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
        ).join(" | ")) ||
        words.failed
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");
    setNoticeType("");
    try {
      const response = await api.post("/accounts/email/resend/", { email });
      setNoticeType("resent");
    } catch (err) {
      setError(err.response?.data?.detail || words.failed);
    } finally {
      setLoading(false);
    }
  }

  if (authenticated) return <App />;

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo"><Heart size={27} /></div>
          <h1>KIRA</h1>
          <span>HEALTH ASSISTANT</span>
        </div>

        <div className="login-language">
          <label htmlFor="login-language">{t("Language")}</label>
          <select
            id="login-language"
            value={language}
            onChange={event => {
              changeLanguage(event.target.value);
              update("preferred_language", event.target.value);
            }}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="rw">Kinyarwanda</option>
          </select>
        </div>

        {mode !== "verify" && (
          <div className="auth-tabs">
            <button type="button" className={mode === "login" ? "active" : ""}
              onClick={() => { setMode("login"); setError(""); setNoticeType(""); }}>
              {words.login}
            </button>
            <button type="button" className={mode === "register" ? "active" : ""}
              onClick={() => { setMode("register"); setError(""); setNoticeType(""); }}>
              {words.create}
            </button>
          </div>
        )}

        {mode === "verify" ? (
          <div className="login-heading">
            <h2>{words.verifyTitle}</h2>
            <p>{words.verifyHelp}</p>
            {noticeType && <p className="login-success">{noticeType === "registered" ? words.registering : words.resendDone}</p>}
            <button className="login-submit" type="button" disabled={loading} onClick={handleResend}>
              {loading ? words.sending : words.resend}
            </button>
            {error && <p className="login-error">{error}</p>}
            <button type="button" className="auth-link" onClick={() => setMode("login")}>
              {words.back}
            </button>
          </div>
        ) : mode === "login" ? (
          <>
            <div className="login-heading">
              <h2>{words.welcome}</h2>
              <p>{words.subtitle}</p>
            </div>
            <form onSubmit={handleLogin}>
              <label htmlFor="email">{words.email}</label>
              <div className="login-input"><Mail size={18} />
                <input id="email" type="email" placeholder={words.enterEmail}
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <label htmlFor="password">{words.password}</label>
              <div className="login-input"><LockKeyhole size={18} />
                <input id="password" type="password" placeholder={words.enterPassword}
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <p className="login-error">{error}</p>}
              {noticeType && <p className="login-success">{noticeType === "registered" ? words.registering : words.resendDone}</p>}
              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? words.signing : words.login}
              </button>
            </form>
            <p className="auth-switch">{words.noAccount} <button type="button" onClick={() => setMode("register")}>{words.create}</button></p>
          </>
        ) : (
          <>
            <div className="login-heading">
              <h2>{words.create}</h2>
              <p>{words.registering}</p>
            </div>
            <form onSubmit={handleRegister}>
              {[
                ["first_name", words.first, User, true],
                ["last_name", words.last, User, true],
                ["username", words.username, User, true],
                ["phone_number", words.phone, Phone, false]
              ].map(([key, label, Icon, required]) => (
                <div key={key}>
                  <label htmlFor={key}>{label}</label>
                  <div className="login-input"><Icon size={18} />
                    <input id={key} type="text" value={form[key]}
                      onChange={e => update(key, e.target.value)} required={required} />
                  </div>
                </div>
              ))}
              <label htmlFor="register-email">{words.email}</label>
              <div className="login-input"><Mail size={18} />
                <input id="register-email" type="email" placeholder={words.enterEmail}
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <label htmlFor="register-password">{words.password}</label>
              <div className="login-input"><LockKeyhole size={18} />
                <input id="register-password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
              <label htmlFor="confirm-password">{words.confirm}</label>
              <div className="login-input"><LockKeyhole size={18} />
                <input id="confirm-password" type="password"
                  value={form.password_confirmation}
                  onChange={e => update("password_confirmation", e.target.value)}
                  required minLength={8} />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? words.creating : words.register}
              </button>
            </form>
            <p className="auth-switch">{words.already} <button type="button" onClick={() => setMode("login")}>{words.login}</button></p>
          </>
        )}

        <p className="login-security"><LockKeyhole size={14} /> {words.security}</p>
        <p className="login-footer">{words.footer}</p>
      </section>
    </main>
  );
}
