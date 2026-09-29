import {
  ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, Phone, Quote, ShieldCheck, Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getFaqs, getGallery, getPlans, getServices, getStats, getSteps, getTeam, getTestimonials,
  getValues, readSettingList, readSettings, telHref,
} from "@/lib/content";

// Le contenu est revalidé en arrière-plan et à chaque enregistrement depuis
// l'administration ; la page reste donc servie depuis le cache entre-temps.
export const revalidate = 300;

export default async function HomePage() {
  const [services, values, team, steps, plans, testimonials, faqs, stats, gallery, settings] =
    await Promise.all([
      getServices(),
      getValues(),
      getTeam(),
      getSteps(),
      getPlans(),
      getTestimonials(),
      getFaqs(),
      getStats(),
      getGallery(),
      readSettings(),
    ]);

  const phone = settings.contact_phone;
  const phoneHref = telHref(phone);
  const trust = readSettingList(settings, "hero_trust");
  const mapsQuery = encodeURIComponent(settings.contact_address);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> {settings.hero_eyebrow}</div>
              <h1>{settings.hero_title} <em>{settings.hero_title_em}</em></h1>
              <p className="hero-description">{settings.hero_description}</p>
              <div className="hero-actions">
                <Link href="/#contact" className="button button-dark">{settings.hero_cta_label} <ArrowRight size={18} /></Link>
                <a href={phoneHref} className="hero-phone"><Phone size={18} /> {phone}</a>
              </div>
              <div className="hero-trust">
                {trust.map((item) => <span key={item}><i /> {item}</span>)}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap">
                <Image src="/images/hero-accounting.jpg" alt="Mounir Ben Salem à l’échange avec une dirigeante autour de documents financiers" fill priority sizes="(max-width: 900px) 100vw, 47vw" className="hero-image" />
              </div>
              <div className="hero-floating-card"><span className="hero-floating-icon"><Sparkles size={20} strokeWidth={1.9} /></span><span><strong>Premier rendez-vous offert</strong><small>30 minutes pour parler de votre projet</small></span><span className="hero-floating-check"><Check size={15} strokeWidth={2.6} /></span></div>
              <div className="hero-photo-caption">UN ÉCHANGE QUI FAIT AVANCER <span aria-hidden="true">↗</span></div>
            </div>
          </div>
          {stats.length > 0 && (
            <div className="container stats-band">
              {stats.map((stat) => (
                <div className="stat-item" key={stat.id}><strong>{stat.value}</strong><span>{stat.label}</span></div>
              ))}
            </div>
          )}
        </section>

        {services.length > 0 && (
          <section className="services-section" id="services">
            <div className="container">
              <div className="section-heading">
                <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> NOS EXPERTISES</span><h2>Six expertises,<br /><em>un seul interlocuteur.</em></h2></div>
                <p>De la tenue quotidienne aux opérations sensibles, nous couvrons l’ensemble des besoins de votre entreprise — et vous déchargeons de ce qui ne l’est pas.</p>
              </div>
              <div className="services-grid">
                {services.map((service) => (
                  <article className="service-card" key={service.id}>
                    <span className="service-icon"><service.icon size={26} strokeWidth={1.55} /></span>
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                    <ul>{service.points.map((point) => <li key={point}><Check size={14} strokeWidth={2.4} />{point}</li>)}</ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {(values.length > 0 || team.length > 0) && (
          <section className="about-section" id="cabinet">
            <div className="container about-grid">
              <div className="about-copy">
                <span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> LE CABINET</span>
                <h2>Une équipe à taille humaine, <em>au service de votre croissance.</em></h2>
                <p>{settings.about_copy}</p>
                {values.length > 0 && (
                  <div className="values-grid">
                    {values.map((value) => (
                      <div className="value-item" key={value.id}>
                        <span className="value-icon"><value.icon size={19} strokeWidth={1.7} /></span>
                        <div><strong>{value.title}</strong><p>{value.text}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {team.length > 0 && (
                <div className="about-team">
                  {team.map((member) => (
                    <article className="team-card" key={member.id}>
                      <span className="team-monogram" style={{ backgroundColor: member.color }}>{member.initials}</span>
                      <div className="team-info">
                        <h3>{member.name}</h3>
                        <span className="team-role">{member.role}</span>
                        <p>{member.bio}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {steps.length > 0 && (
          <section className="process-section">
            <div className="container">
              <div className="process-heading">
                <span className="eyebrow process-eyebrow"><span className="eyebrow-line" /> VOTRE PARCOURS</span>
                <h2>Quatre étapes, <em>zéro friction.</em></h2>
              </div>
              <div className="process-grid">
                {steps.map((step) => (
                  <article className="process-card" key={step.id}>
                    <span className="process-num">{step.num}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {plans.length > 0 && (
          <section className="plans-section" id="formules">
            <div className="container">
              <div className="section-heading">
                <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> NOS FORMULES</span><h2>Un accompagnement, <em>à la mesure de votre activité.</em></h2></div>
                <p>Trois formules pensées pour les réalités du terrain tunisien. Chacune fait l’objet d’un devis écrit après analyse de votre situation.</p>
              </div>
              <div className="plans-grid">
                {plans.map((plan) => (
                  <article className={plan.featured ? "plan-card plan-featured" : "plan-card"} key={plan.id}>
                    {plan.featured && <span className="plan-badge">La plus choisie</span>}
                    <h3>{plan.name}</h3>
                    <p className="plan-desc">{plan.desc}</p>
                    <div className="plan-price">{plan.price ? <><strong>{plan.price} DT</strong><span>/ mois, à partir de</span></> : <><strong>Sur devis</strong><span>étude personnalisée</span></>}</div>
                    <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} strokeWidth={2.4} />{feature}</li>)}</ul>
                    <Link href="/#contact" className={plan.featured ? "button button-lime plan-button" : "plan-link"}>
                      {plan.featured ? <>Demander cette formule <ArrowUpRight size={17} /></> : <>Demander un devis <ArrowRight size={16} /></>}
                    </Link>
                  </article>
                ))}
              </div>
              {settings.plans_note && <p className="plans-note">{settings.plans_note}</p>}
            </div>
          </section>
        )}

        {testimonials.length > 0 && (
          <section className="testimonials-section" id="temoignages">
            <div className="container">
              <div className="section-heading">
                <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> TÉMOIGNAGES</span><h2>La preuve par <em>nos clients.</em></h2></div>
                <p>Dirigeants de PME, fondateurs, industriels : ce qu’ils disent de travailler avec nous, en leurs propres mots.</p>
              </div>
              <div className="testimonials-grid">
                {testimonials.map((item) => (
                  <figure className="testimonial-card" key={item.id}>
                    <Quote size={26} strokeWidth={1.6} className="testimonial-mark" />
                    <blockquote>{item.quote}</blockquote>
                    <figcaption><strong>{item.name}</strong><span>{item.company}</span></figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="gallery-section" id="galerie">
            <div className="container">
              <div className="section-heading">
                <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> EN IMAGES</span><h2>Le cabinet, <em>de l’intérieur.</em></h2></div>
                <p>Nos bureaux, nos équipes et les moments qui rythment la vie du cabinet. La confiance se construit aussi en se montrant.</p>
              </div>
              <div className="gallery-grid">
                {gallery.map((image, index) => (
                  <figure className={index === 0 ? "gallery-item gallery-item-featured" : "gallery-item"} key={image.id}>
                    <div className="gallery-frame">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        // La première vignette est affichée en grand sur desktop.
                        sizes={index === 0 ? "(max-width: 900px) 100vw, 47vw" : "(max-width: 900px) 100vw, 24vw"}
                        className="gallery-image"
                      />
                    </div>
                    {image.caption && <figcaption>{image.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="faq-section">
            <div className="container faq-layout">
              <div className="faq-intro">
                <span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> BON À SAVOIR</span>
                <h2>Vos questions, <em>nos réponses.</em></h2>
                <p>Quelques réponses pour démarrer sereinement. Pour le reste, appelez-nous : nous répondons vite.</p>
                <a href={phoneHref} className="faq-oect-link"><Phone size={16} /> {phone}</a>
              </div>
              <div className="faq-list">
                {faqs.map((item) => (
                  <details key={item.id}><summary>{item.q} <span>+</span></summary><p>{item.a}</p></details>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="contact-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-info">
              <span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> PRENDRE RENDEZ-VOUS</span>
              <h2>Parlons de <em>votre projet.</em></h2>
              <p>Décrivez votre besoin, nous revenons vers vous sous 24 heures ouvrées avec une première analyse et, si vous le souhaitez, un rendez-vous au cabinet.</p>
              <div className="contact-rows">
                <a className="contact-row" href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer"><span className="contact-row-icon"><MapPin size={18} /></span><div><strong>Le cabinet</strong><small>{settings.contact_address}</small></div><ArrowUpRight size={16} /></a>
                <a className="contact-row" href={phoneHref}><span className="contact-row-icon"><Phone size={18} /></span><div><strong>Téléphone</strong><small>{phone}</small></div><ArrowUpRight size={16} /></a>
                <a className="contact-row" href={`mailto:${settings.contact_email}`}><span className="contact-row-icon"><Mail size={18} /></span><div><strong>E-mail</strong><small>{settings.contact_email}</small></div><ArrowUpRight size={16} /></a>
                <div className="contact-row contact-row-static"><span className="contact-row-icon"><Clock size={18} /></span><div><strong>Horaires</strong><small>{settings.contact_hours}</small></div></div>
              </div>
              <div className="contact-reassure"><ShieldCheck size={18} /><p>Réponse garantie sous 24 h ouvrées. Vos informations restent confidentielles et ne sont jamais partagées.</p></div>
            </div>
            <ContactForm services={services.map((service) => service.title)} phone={phone} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
