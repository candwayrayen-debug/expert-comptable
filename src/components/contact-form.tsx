"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SERVICES } from "@/lib/services";

const initialState = { name: "", company: "", email: "", phone: "", service: "", message: "", consent: false };

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Une erreur est survenue. Réessayez dans un instant.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="contact-panel contact-success-panel" aria-live="polite">
        <span className="success-icon"><Check size={30} strokeWidth={2.2} /></span>
        <h3>Votre message a bien été envoyé.</h3>
        <p>Merci {form.name.split(" ")[0]}. Notre équipe vous recontacte sous <strong>24 heures ouvrées</strong> au numéro ou à l’adresse indiquée. En attendant, vous pouvez aussi nous appeler au <a href="tel:+21671902345">+216 71 902 345</a>.</p>
      </div>
    );
  }

  return (
    <form className="contact-panel contact-form" onSubmit={submit}>
      <div className="form-grid-two">
        <label>Votre nom <span>*</span><input required maxLength={120} autoComplete="name" placeholder="Ex. Amira Ben Salah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Votre société <small>(facultatif)</small><input maxLength={160} autoComplete="organization" placeholder="Nom de votre entreprise" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
      </div>
      <div className="form-grid-two">
        <label>Votre e-mail <span>*</span><input required type="email" maxLength={180} autoComplete="email" placeholder="vous@entreprise.tn" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Téléphone <span>*</span><input required type="tel" maxLength={40} autoComplete="tel" placeholder="+216 ..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      </div>
      <label>Demandez-vous pour quel service ? <span>*</span>
        <select required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
          <option value="">Choisir un service</option>
          {SERVICES.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </label>
      <label>Votre message <span>*</span><textarea required minLength={15} maxLength={2000} rows={5} placeholder="Parlez-nous de votre activité et de ce dont vous avez besoin..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
      <label className="consent-label">
        <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
        <span>J’accepte que ces informations soient utilisées par le cabinet pour me recontacter. <a href="/confidentialite" target="_blank">Politique de confidentialité</a></span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark form-submit" type="submit" disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer ma demande"} <ArrowRight size={18} />
      </button>
      <p className="form-footnote">Premier rendez-vous offert · Devis écrit et ferme · Réponse sous 24 h ouvrées</p>
    </form>
  );
}
