import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronDown, ExternalLink, Plus, Minus, Gift, Camera } from "lucide-react";
import { kecha2026 } from "@shared/kecha2026";
import RsvpForm from "@/components/RsvpForm";
import Countdown from "@/components/Countdown";

import heroImg from "../../images/hero.jpeg";
import kecha1Img from "../../images/kecha1.jpeg";
import kecha2Img from "../../images/kecha2.jpeg";
import heroVideo from "../../images/hero-kecha.mp4";

const IMAGES = { hero: heroImg, kecha1: kecha1Img, kecha2: kecha2Img } as Record<string, string>;
const rv = { duration: 1.05, ease: [0.22, 1, 0.36, 1] as const };

/* ─── Ornamental rule ─────────────────────────────────────── */
function Rule({ color = "#C4AA80", opacity = 0.28 }: { color?: string; opacity?: number }) {
  return (
    <div className="flex items-center justify-center gap-4" style={{ opacity }}>
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,transparent,${color})` }} />
      <span className="text-sm" style={{ color }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
    </div>
  );
}

/* ─── Section label ───────────────────────────────────────── */
function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.68em]" style={{ color: dark ? "rgba(196,146,90,0.65)" : "#A89070" }}>
      {children}
    </p>
  );
}


/* ─── FAQ item ────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(196,170,128,0.18)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-serif text-lg pr-8" style={{ color: "#2C2118" }}>{q}</span>
        <span className="shrink-0 transition-transform duration-300" style={{ transform: open ? "rotate(45deg)" : "none" }}>
          {open
            ? <Minus className="h-4 w-4" style={{ color: "#B09878" }} strokeWidth={1.4} />
            : <Plus className="h-4 w-4" style={{ color: "#B09878" }} strokeWidth={1.4} />
          }
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-base leading-8" style={{ color: "#6A5D50" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "18%"]);

  const weddingDate = new Date("2026-06-20T15:00:00+02:00");

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#FAF6EE" }}>

      {/* ══════════════════════════════════════════════════════
          1 · HÉROS — Contenu à gauche · Vidéo 9:16 à droite
      ══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: "100svh", background: "#EDE8DA" }}>

        {/* ── MOBILE : vidéo en fond plein écran ── */}
        <div className="absolute inset-0 pointer-events-none md:hidden overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", minWidth: "100%", minHeight: "100%", width: "auto", height: "auto", objectFit: "cover" }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(15,16,9,0.28) 0%,rgba(15,16,9,0.04) 35%,rgba(15,16,9,0.88) 100%)" }} />
        </div>

        {/* ── DESKTOP : layout côte à côte ── */}
        <div className="hidden md:flex h-full">

          {/* Gauche — contenu */}
          <motion.div
            style={{
              y: heroY,
              opacity: heroOpacity,
              background: [
                /* Cœur blanc rosé — centre lumineux des fleurs */
                "radial-gradient(ellipse at 75% 48%, #FEFEFB 0%, rgba(250,247,240,0.85) 28%, transparent 62%)",
                /* Gypsophile — nuage crème en haut */
                "radial-gradient(ellipse at 90% 12%, rgba(248,244,234,0.7) 0%, transparent 50%)",
                /* Hydrangées — ivoire chaud en bas */
                "radial-gradient(ellipse at 60% 90%, rgba(238,228,208,0.55) 0%, transparent 52%)",
                /* Fond ivoire ambré — base chaude, pas blanche froide */
                "#EDE8DA",
              ].join(", "),
            }}
            className="flex flex-1 flex-col justify-center px-14 lg:px-20"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-[10px] uppercase tracking-[0.68em]"
              style={{ color: "rgba(100,80,55,0.55)" }}
            >
              Invitation officielle · Kinshasa
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-script leading-none"
              style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)", color: "#2C2118" }}
            >
              Ketsia &amp; Chad
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="mt-4 font-serif text-xl"
              style={{ color: "rgba(60,40,22,0.62)" }}
            >
              vous invitent à leur bénédiction
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-2 text-[11px] uppercase tracking-[0.5em]"
              style={{ color: "rgba(100,80,55,0.48)" }}
            >
              {kecha2026.date.display}
            </motion.p>

            {/* Separator */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.75 }}
              className="mt-8 h-px w-16 origin-left"
              style={{ background: "rgba(160,128,80,0.4)" }}
            />

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.85 }}
              className="mt-8"
            >
              <Countdown target={weddingDate} />
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.05 }}
              className="mt-10"
            >
              <a
                href="#rsvp"
                className="inline-flex items-center px-8 py-4 text-[10px] uppercase tracking-[0.45em] transition-all"
                style={{ border: "1px solid rgba(120,90,50,0.28)", color: "#3C2A14", background: "rgba(120,90,50,0.06)" }}
              >
                Confirmer ma présence
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9 }}
              className="mt-14"
            >
              <ChevronDown className="h-5 w-5 animate-bounce" strokeWidth={1.3} style={{ color: "rgba(120,90,50,0.35)" }} />
            </motion.div>
          </motion.div>

          {/* Droite — vidéo 9:16 pleine hauteur */}
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{ width: "calc(100svh * 9 / 16)" }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
            {/* Fondu gauche — même teinte ivoire que le panneau */}
            <div
              className="absolute inset-y-0 left-0 w-28 pointer-events-none"
              style={{ background: "linear-gradient(90deg, #EDE8DA 0%, rgba(237,232,218,0.55) 55%, transparent 100%)" }}
            />
          </div>
        </div>

        {/* ── MOBILE : contenu en bas ── */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center text-white md:hidden"
        >
          <p className="text-[10px] uppercase tracking-[0.68em] text-white/50">
            Invitation officielle · Kinshasa
          </p>
          <p className="mt-5 font-script text-white leading-none" style={{ fontSize: "clamp(3.5rem,14vw,5.5rem)" }}>
            Ketsia &amp; Chad
          </p>
          <p className="mt-3 font-serif text-base text-white/68">
            {kecha2026.date.display}
          </p>
          <div className="mt-6">
            <Countdown target={weddingDate} dark />
          </div>
          <a
            href="#rsvp"
            className="mt-7 inline-flex items-center px-7 py-4 text-[10px] uppercase tracking-[0.45em] text-white"
            style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}
          >
            Confirmer ma présence
          </a>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2 · NOTRE HISTOIRE — Timeline
      ══════════════════════════════════════════════════════ */}
      <section id="histoire" style={{ background: "linear-gradient(160deg,#FAF6EE 0%,#EEE4D2 100%)" }} className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(196,170,128,0.28),transparent)" }} />

        <div className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv} className="mb-20 text-center">
            <Label>Notre histoire</Label>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem,5vw,3.5rem)" }}>
              Un conte écrit à deux mains
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block" style={{ background: "linear-gradient(180deg,transparent,rgba(196,170,128,0.35) 10%,rgba(196,170,128,0.35) 90%,transparent)" }} />

            <div className="space-y-16 md:space-y-24">
              {kecha2026.story.map((chapter, i) => (
                <motion.div
                  key={chapter.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ ...rv, delay: i * 0.06 }}
                  className={`grid gap-8 md:grid-cols-2 md:gap-14 md:items-center ${i % 2 !== 0 ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  {/* Text side */}
                  <div className={`space-y-4 ${i % 2 !== 0 ? "md:text-right" : ""}`}>
                    <div className={`flex items-center gap-3 ${i % 2 !== 0 ? "md:justify-end" : ""}`}>
                      <div className="h-px w-8" style={{ background: "rgba(196,170,128,0.5)" }} />
                      <p className="text-[9px] uppercase tracking-[0.52em]" style={{ color: "#A89070" }}>{chapter.period}</p>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl" style={{ color: "#2C2118" }}>{chapter.title}</h3>
                    <p className="text-base leading-8" style={{ color: "#6A5D50" }}>{chapter.body}</p>
                  </div>

                  {/* Image side */}
                  {chapter.image ? (
                    <div className="overflow-hidden editorial-shadow">
                      <motion.img
                        src={IMAGES[chapter.image]}
                        alt={chapter.title}
                        className="w-full object-cover"
                        style={{ height: "clamp(280px,40vw,440px)" }}
                        initial={{ scale: 1.08 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  ) : (
                    /* Decorative placeholder for chapters without image */
                    <div
                      className="flex items-center justify-center editorial-shadow"
                      style={{ height: "clamp(200px,30vw,320px)", background: "linear-gradient(135deg,#F5EDE0,#EDE3D5)" }}
                    >
                      <p className="font-script text-6xl" style={{ color: "rgba(122,101,80,0.25)" }}>Kecha</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3 · PROGRAMME — Timeline du jour
      ══════════════════════════════════════════════════════ */}
      <section id="programme" style={{ background: "#F2EAE0" }} className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(196,170,128,0.3),transparent)" }} />

        <div className="mx-auto max-w-3xl px-6 py-24 md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv} className="mb-16 text-center">
            <Label>20 Juin 2026</Label>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem,5vw,3.25rem)" }}>
              Programme de la journée
            </h2>
          </motion.div>

          <div className="relative pl-8 md:pl-12">
            {/* Vertical line */}
            <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: "linear-gradient(180deg,rgba(196,170,128,0.4),rgba(196,170,128,0.15))" }} />

            <div className="space-y-10">
              {kecha2026.programme.map((event, i) => (
                <motion.div
                  key={event.time}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ ...rv, delay: i * 0.07 }}
                  className="relative flex gap-6"
                >
                  {/* Dot */}
                  <div
                    className="absolute -left-[2.1rem] md:-left-[3.1rem] top-1.5 h-3 w-3 rounded-full border-2"
                    style={
                      event.theme === "blessing"
                        ? { borderColor: "rgba(196,170,128,0.7)", background: "#F5EDE0" }
                        : { borderColor: "rgba(196,146,90,0.8)", background: "#8B5E3C" }
                    }
                  />
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <p
                        className="font-serif text-lg"
                        style={{ color: event.theme === "blessing" ? "#2C2118" : "#8B5E3C" }}
                      >
                        {event.time}
                      </p>
                      <span
                        className="text-[8px] uppercase tracking-[0.5em] px-2 py-0.5"
                        style={
                          event.theme === "blessing"
                            ? { color: "#A89070", border: "1px solid rgba(196,170,128,0.3)" }
                            : { color: "#C4925A", border: "1px solid rgba(196,146,90,0.35)" }
                        }
                      >
                        {event.theme === "blessing" ? "Bénédiction" : "Soirée"}
                      </span>
                    </div>
                    <p className="font-serif text-2xl" style={{ color: "#2C2118" }}>{event.title}</p>
                    <p className="text-sm leading-7" style={{ color: "#7A6D5E" }}>{event.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4 · RSVP — Ultra important
      ══════════════════════════════════════════════════════ */}
      <section id="rsvp" style={{ background: "#1A1008" }} className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(196,170,128,0.07) 0%,transparent 55%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-24 md:px-10 md:py-28 lg:grid-cols-[1fr_1.5fr]">

          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={rv} className="space-y-8 text-white">
            <div>
              <Label dark>RSVP</Label>
              <h2 className="mt-5 font-serif leading-tight text-white" style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>
                Confirmez votre présence.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/65">{kecha2026.couple.narrative}</p>
            </div>

            <div className="space-y-5">
              {kecha2026.programme.filter((e) => ["15h00", "19h00"].includes(e.time)).map((e) => (
                <div key={e.time} className="border-l-2 pl-5" style={{ borderColor: "rgba(196,170,128,0.25)" }}>
                  <p className="text-[9px] uppercase tracking-[0.45em] text-white/38">{e.title}</p>
                  <p className="mt-1 font-serif text-lg text-white/85">{e.time} · Kinshasa</p>
                  <p className="text-[10px] italic text-white/40">{e.theme === "blessing" ? kecha2026.ceremony.blessing.theme : kecha2026.ceremony.evening.theme}</p>
                </div>
              ))}
            </div>

            <blockquote className="border-t border-white/10 pt-6">
              <p className="font-serif text-sm italic leading-7 text-white/55">« {kecha2026.scripture[0].text} »</p>
              <p className="mt-3 text-[9px] uppercase tracking-[0.45em] text-white/30">— {kecha2026.scripture[0].reference}</p>
            </blockquote>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ ...rv, delay: 0.1 }}>
            <RsvpForm
              variant="invitation"
              title="Répondre à l'invitation"
              description="Confirmer votre présence, indiquer le nombre de places et vos préférences alimentaires."
              successDescription="Merci. Votre réponse a bien été enregistrée. Nous avons hâte de vous accueillir."
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5 · LIEUX & ACCÈS
      ══════════════════════════════════════════════════════ */}
      <section id="lieux" style={{ background: "#F8F3EA" }} className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(196,170,128,0.28),transparent)" }} />

        <div className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv} className="mb-14 text-center">
            <Label>Kinshasa, RDC</Label>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem,5vw,3.25rem)" }}>
              Lieux &amp; Accès
            </h2>
            <p className="mt-4 text-sm italic" style={{ color: "#9A8A76" }}>
              L'adresse précise est communiquée avec votre invitation personnelle.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2">
            {kecha2026.venues.map((venue, i) => (
              <motion.article
                key={venue.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ ...rv, delay: i * 0.08 }}
                className="border p-8 editorial-shadow"
                style={
                  venue.theme === "blessing"
                    ? { background: "#FAF6EE", borderColor: "rgba(196,170,128,0.28)" }
                    : { background: "#1C1208", borderColor: "rgba(196,146,90,0.15)" }
                }
              >
                <p className="text-[9px] uppercase tracking-[0.52em]" style={{ color: venue.theme === "blessing" ? "#A89070" : "rgba(196,146,90,0.65)" }}>
                  {venue.label}
                </p>
                <h3 className="mt-3 font-serif text-2xl" style={{ color: venue.theme === "blessing" ? "#2C2118" : "#F0E4D0" }}>{venue.name}</h3>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.4} style={{ color: venue.theme === "blessing" ? "#B09878" : "rgba(196,146,90,0.7)" }} />
                    <p className="text-sm leading-6" style={{ color: venue.theme === "blessing" ? "#6A5D50" : "rgba(240,228,208,0.7)" }}>
                      {venue.city}, République Démocratique du Congo
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.4} style={{ color: venue.theme === "blessing" ? "#B09878" : "rgba(196,146,90,0.7)" }} />
                    <p className="text-sm leading-6" style={{ color: venue.theme === "blessing" ? "#6A5D50" : "rgba(240,228,208,0.7)" }}>
                      {venue.theme === "blessing" ? kecha2026.ceremony.blessing.time : kecha2026.ceremony.evening.time} · {kecha2026.date.display}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm italic" style={{ color: venue.theme === "blessing" ? "#8A7A68" : "rgba(196,168,128,0.55)" }}>
                  {venue.note}
                </p>

                <a
                  href={venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] transition-opacity hover:opacity-70"
                  style={{ color: venue.theme === "blessing" ? "#B09878" : "#C4925A" }}
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  Voir sur Google Maps
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6 · DRESS CODE — Thèmes & couleurs
      ══════════════════════════════════════════════════════ */}
      <section id="dresscode" style={{ background: "linear-gradient(160deg,#F2EAD8 0%,#E8DCCA 100%)" }} className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(160,130,95,0.28),transparent)" }} />

        <div className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv} className="mb-14 text-center">
            <Label>Tenue requise</Label>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem,5vw,3.25rem)" }}>
              Dress Code
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Blessing */}
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={rv}
              className="p-8 editorial-shadow"
              style={{ background: "#FAF6EE", border: "1px solid rgba(196,170,128,0.28)" }}
            >
              <p className="text-[9px] uppercase tracking-[0.58em]" style={{ color: "#A89070" }}>Cérémonie · 15h00</p>
              <h3 className="mt-3 font-serif text-2xl" style={{ color: "#2C2118" }}>{kecha2026.dresscode.blessing.theme}</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "#6A5D50" }}>{kecha2026.dresscode.blessing.description}</p>

              {/* Color swatches */}
              <div className="mt-6 flex gap-2 flex-wrap">
                {kecha2026.dresscode.blessing.colors.map((color, i) => (
                  <div key={color} className="group relative">
                    <div
                      className="h-9 w-9 border"
                      style={{ background: color, borderColor: "rgba(196,170,128,0.25)" }}
                      title={kecha2026.dresscode.blessing.colorNames[i]}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(196,170,128,0.18)" }}>
                <p className="text-[10px] text-red-800/50 italic">{kecha2026.dresscode.blessing.forbidden}</p>
              </div>
            </motion.article>

            {/* Evening */}
            <motion.article
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...rv, delay: 0.1 }}
              className="p-8"
              style={{ background: "#1C1208", border: "1px solid rgba(196,146,90,0.15)" }}
            >
              <p className="text-[9px] uppercase tracking-[0.58em]" style={{ color: "rgba(196,146,90,0.65)" }}>Soirée · 19h00</p>
              <h3 className="mt-3 font-serif text-2xl" style={{ color: "#F0E4D0" }}>{kecha2026.dresscode.evening.theme}</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "rgba(240,228,208,0.68)" }}>{kecha2026.dresscode.evening.description}</p>

              <div className="mt-6 flex gap-2 flex-wrap">
                {kecha2026.dresscode.evening.colors.map((color, i) => (
                  <div key={color} className="group relative">
                    <div
                      className="h-9 w-9 border"
                      style={{ background: color, borderColor: "rgba(196,146,90,0.2)" }}
                      title={kecha2026.dresscode.evening.colorNames[i]}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(196,146,90,0.12)" }}>
                <p className="text-[10px] italic" style={{ color: "rgba(196,146,90,0.45)" }}>{kecha2026.dresscode.evening.forbidden}</p>
              </div>
            </motion.article>
          </div>

          {/* Versets */}
          <div className="mt-16 space-y-10">
            {kecha2026.scripture.slice(1).map((verse, i) => (
              <motion.blockquote
                key={verse.reference}
                initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ ...rv, delay: i * 0.08 }}
                className={`scripture-blockquote py-2 ${i % 2 !== 0 ? "border-r-2 pr-8 md:ml-16 md:text-right" : "border-l-2 pl-8 md:mr-16"}`}
                style={{ borderColor: "rgba(196,168,128,0.45)" }}
              >
                <p className="font-serif text-lg italic leading-9" style={{ color: "#3C3026" }}>« {verse.text} »</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.5em]" style={{ color: "#8A7860" }}>— {verse.reference}</p>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7 · CAGNOTTE — Liste de mariage
      ══════════════════════════════════════════════════════ */}
      <section id="cagnotte" style={{ background: "#1A1008" }} className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%,rgba(180,110,40,0.12) 0%,transparent 55%)" }} />

        <div className="relative mx-auto max-w-2xl px-6 py-24 text-center md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv}>
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center" style={{ border: "1px solid rgba(196,146,90,0.2)" }}>
                <Gift className="h-7 w-7" style={{ color: "#C4925A" }} strokeWidth={1.3} />
              </div>
            </div>

            <Label dark>Liste de mariage</Label>
            <h2 className="mt-5 font-serif leading-tight text-white" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
              {kecha2026.cagnotte.title}
            </h2>
            <p className="mt-6 text-base leading-8" style={{ color: "rgba(240,228,208,0.68)" }}>
              {kecha2026.cagnotte.message}
            </p>

            {/* IBAN */}
            <div className="mt-10 border p-8 text-left" style={{ borderColor: "rgba(196,146,90,0.16)", background: "rgba(255,220,170,0.04)" }}>
              <p className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(196,146,90,0.6)" }}>Virement bancaire</p>
              <p className="mt-3 font-serif text-lg" style={{ color: "#F0E4D0" }}>{kecha2026.cagnotte.ibanName}</p>
              <p className="mt-1 font-mono text-sm" style={{ color: "rgba(196,146,90,0.7)" }}>{kecha2026.cagnotte.iban}</p>
              <p className="mt-4 text-sm italic" style={{ color: "rgba(196,146,90,0.45)" }}>{kecha2026.cagnotte.note}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          8 · GALERIE — Photos du couple
      ══════════════════════════════════════════════════════ */}
      <section id="galerie" style={{ background: "#F2EAD8" }} className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(196,170,128,0.28),transparent)" }} />

        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv} className="mb-14 text-center">
            <Camera className="mx-auto h-6 w-6 mb-5" strokeWidth={1.3} style={{ color: "#B09878" }} />
            <Label>Galerie</Label>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem,5vw,3.25rem)" }}>
              Un instant suspendu
            </h2>
          </motion.div>

          {/* 3-col grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { img: kecha1Img, alt: "Ketsia & Chad", caption: "La joie.", tall: false },
              { img: heroImg, alt: "La demande", caption: "La promesse.", tall: true },
              { img: kecha2Img, alt: "Kinshasa", caption: "Le chemin.", tall: false },
            ].map((item, i) => (
              <motion.div
                key={item.caption}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...rv, delay: i * 0.08 }}
                className={`relative overflow-hidden editorial-shadow group ${item.tall ? "md:row-span-2" : ""}`}
                style={{ height: item.tall ? "clamp(500px,70vw,720px)" : "clamp(240px,30vw,340px)" }}
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 pb-5 pt-14">
                  <p className="font-serif text-lg italic text-white/88">{item.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          9 · FAQ
      ══════════════════════════════════════════════════════ */}
      <section id="faq" style={{ background: "#FAF6EE" }} className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(196,170,128,0.25),transparent)" }} />

        <div className="mx-auto max-w-2xl px-6 py-24 md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={rv} className="mb-14 text-center">
            <Label>Questions fréquentes</Label>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem,5vw,3.25rem)" }}>
              FAQ
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={rv}>
            <div className="border-t" style={{ borderColor: "rgba(196,170,128,0.18)" }}>
              {kecha2026.faq.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ÉPILOGUE — Closing
      ══════════════════════════════════════════════════════ */}
      <footer style={{ background: "#EDE4D4", borderTop: "1px solid rgba(196,170,128,0.2)" }} className="px-6 py-16 text-center">
        <Rule color="#9C8A72" opacity={0.25} />
        <div className="my-10">
          <p className="font-script leading-none" style={{ color: "#7A6550", fontSize: "5rem" }}>Kecha</p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.55em]" style={{ color: "#9A8A76" }}>
            Ketsia &amp; Chad · 20 Juin 2026 · Kinshasa
          </p>
          <p className="mt-7 mx-auto max-w-sm font-serif text-sm italic leading-7" style={{ color: "#6A5D50" }}>
            {kecha2026.couple.statement}
          </p>
        </div>
        <Rule color="#9C8A72" opacity={0.25} />
      </footer>
    </main>
  );
}
