import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Clock, MapPin, ChevronDown } from "lucide-react";
import { type RsvpResponse } from "@shared/schema";
import { kecha2026 } from "@shared/kecha2026";
import { Skeleton } from "@/components/ui/skeleton";
import RsvpForm from "@/components/RsvpForm";

type InvitationGuest = RsvpResponse & { invitationUrl: string };

const reveal = { duration: 1.0, ease: [0.22, 1, 0.36, 1] as const };

/* ─── Ornamental horizontal rule ─────────────────────────── */
function OrnamentRule({ color = "#C4AA80", opacity = 0.28 }: { color?: string; opacity?: number }) {
  return (
    <div className="flex items-center justify-center gap-5" style={{ opacity }}>
      <div className="h-px w-16 flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <span className="text-xs" style={{ color }}>✦</span>
      <div className="h-px w-16 flex-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

/* ─── Ceremony info card ──────────────────────────────────── */
function InfoCard({
  icon: Icon,
  label,
  value,
  dark = false,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  dark?: boolean;
  delay?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ ...reveal, delay }}
      className="p-8 text-center editorial-shadow"
      style={
        dark
          ? { background: "rgba(255,230,190,0.05)", border: "1px solid rgba(196,146,90,0.14)" }
          : { background: "#FFFFFF", border: "1px solid rgba(196,170,128,0.22)" }
      }
    >
      <Icon
        className="mx-auto h-5 w-5"
        strokeWidth={1.4}
        style={{ color: dark ? "rgba(196,146,90,0.75)" : "#B09878" }}
      />
      <p
        className="mt-5 text-[9px] uppercase tracking-[0.5em]"
        style={{ color: dark ? "rgba(196,146,90,0.6)" : "#9C8A72" }}
      >
        {label}
      </p>
      <p
        className="mt-3 font-serif text-xl leading-snug"
        style={{ color: dark ? "#F0E4D0" : "#2C2118" }}
      >
        {value}
      </p>
    </motion.article>
  );
}

/* ─── Theme badge ─────────────────────────────────────────── */
function ThemeBadge({ theme, note, dark = false }: { theme: string; note: string; dark?: boolean }) {
  return (
    <div className="mt-7 space-y-2">
      <div
        className="inline-flex items-center gap-3 px-6 py-3"
        style={
          dark
            ? { border: "1px solid rgba(196,146,90,0.18)", background: "rgba(255,220,170,0.04)" }
            : { border: "1px solid rgba(196,170,128,0.3)", background: "rgba(255,255,255,0.6)" }
        }
      >
        <span
          className="text-[9px] uppercase tracking-[0.52em]"
          style={{ color: dark ? "rgba(196,146,90,0.65)" : "#8A7A66" }}
        >
          Thème vestimentaire
        </span>
        <span
          className="h-4 w-px"
          style={{ background: dark ? "rgba(196,146,90,0.2)" : "rgba(196,170,128,0.4)" }}
        />
        <span
          className="font-serif text-sm italic"
          style={{ color: dark ? "#E8C89A" : "#5A4A38" }}
        >
          {theme}
        </span>
      </div>
      <p
        className="text-[10px] tracking-wide"
        style={{ color: dark ? "rgba(196,160,112,0.6)" : "#9A8A76" }}
      >
        {note}
      </p>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function Invitation() {
  const [, params] = useRoute("/invitation/:token");
  const token = params?.token;
  const [guestPreview, setGuestPreview] = useState<InvitationGuest | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  const { data: guest, isLoading, error } = useQuery<InvitationGuest>({
    queryKey: [`/api/invitation/${token}`],
    enabled: !!token,
  });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  const currentGuest = guestPreview || guest;

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-8 p-6"
        style={{ background: "#FEFCF8" }}
      >
        <Skeleton className="h-10 w-64 rounded-none" style={{ background: "#EDE8E0" }} />
        <Skeleton className="h-[480px] w-full max-w-4xl rounded-none" style={{ background: "#EDE8E0" }} />
      </div>
    );
  }

  /* ── Not found ── */
  if (error || !currentGuest || !token) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-7 p-6 text-center"
        style={{ background: "#FEFCF8" }}
      >
        <OrnamentRule opacity={0.2} />
        <p className="font-script text-6xl" style={{ color: "#9A8268" }}>Kecha</p>
        <h1 className="font-serif text-2xl" style={{ color: "#2C2118" }}>Invitation introuvable</h1>
        <p className="text-[10px] uppercase tracking-[0.42em] max-w-xs" style={{ color: "#8A7D70" }}>
          Ce lien semble invalide ou a expiré. Veuillez contacter les mariés directement.
        </p>
        <OrnamentRule opacity={0.2} />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          PRÉLUDE — Blanc & Ivoire · Ouverture du conte
      ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative isolate overflow-hidden"
        style={{ minHeight: "100svh", background: "linear-gradient(150deg, #FEFCF8 0%, #F6EEE3 55%, #EFE5D4 100%)" }}
      >
        {/* Ambient radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 25%, rgba(196,170,128,0.07) 0%, transparent 52%), radial-gradient(ellipse at 75% 70%, rgba(175,150,115,0.05) 0%, transparent 45%)",
          }}
        />

        {/* Corner marks */}
        <span className="absolute top-8 left-8 text-xl select-none pointer-events-none" style={{ color: "rgba(196,170,128,0.2)" }}>✦</span>
        <span className="absolute top-8 right-8 text-xl select-none pointer-events-none" style={{ color: "rgba(196,170,128,0.2)" }}>✦</span>
        <span className="absolute bottom-16 left-8 text-xl select-none pointer-events-none" style={{ color: "rgba(196,170,128,0.15)" }}>✦</span>
        <span className="absolute bottom-16 right-8 text-xl select-none pointer-events-none" style={{ color: "rgba(196,170,128,0.15)" }}>✦</span>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-8 py-20 text-center"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.62em]"
            style={{ color: "#9C8A72" }}
          >
            {kecha2026.hero.eyebrow}
          </motion.p>

          {/* Guest salutation */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <p className="font-serif text-base italic" style={{ color: "#7A6D5E" }}>
              À l'attention de
            </p>
            <h1 className="mt-2 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem, 6vw, 3.75rem)" }}>
              {currentGuest.firstName} {currentGuest.lastName}
            </h1>
          </motion.div>

          {/* Brand + subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <p className="font-script leading-tight" style={{ color: "#7A6550", fontSize: "clamp(3.5rem, 10vw, 6rem)" }}>
              Ketsia &amp; Chad
            </p>
            <p className="mt-3 font-serif text-xl md:text-2xl" style={{ color: "#4A3C2E" }}>
              vous invitent à leur bénédiction
            </p>
          </motion.div>

          {/* Phil 1:6 opening quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 max-w-lg border-l-2 pl-6 text-left"
            style={{ borderColor: "rgba(196,170,128,0.45)" }}
          >
            <p className="font-serif text-base italic leading-8" style={{ color: "#5A4E42" }}>
              « {kecha2026.scripture[0].text} »
            </p>
            <footer className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.48em]" style={{ color: "#9C8A72" }}>
                — {kecha2026.scripture[0].reference}
              </p>
            </footer>
          </motion.blockquote>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <p className="text-[9px] uppercase tracking-[0.58em]" style={{ color: "#9C8A72" }}>
              Découvrir
            </p>
            <ChevronDown className="h-4 w-4 animate-bounce" strokeWidth={1.4} style={{ color: "#B09878" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CÉRÉMONIE DE BÉNÉDICTION — Shades of White
      ══════════════════════════════════════════════════════ */}
      <section className="blessing-section relative overflow-hidden">
        {/* Top fade line */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(196,170,128,0.35), transparent)" }}
        />

        <div className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reveal}
            className="text-center"
          >
            <p className="text-[9px] uppercase tracking-[0.68em]" style={{ color: "#A89070" }}>
              ✦ &nbsp; Première partie &nbsp; ✦
            </p>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              {kecha2026.ceremony.blessing.label}
            </h2>
            <ThemeBadge
              theme={kecha2026.ceremony.blessing.theme}
              note={kecha2026.ceremony.blessing.themeNote}
            />
          </motion.div>

          {/* Info cards */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <InfoCard icon={CalendarDays} label="Date" value={kecha2026.date.display} delay={0} />
            <InfoCard icon={Clock} label="Heure" value={kecha2026.ceremony.blessing.time} delay={0.08} />
            <InfoCard
              icon={MapPin}
              label="Lieu"
              value={`${kecha2026.venues[0].name} · ${kecha2026.venues[0].city}`}
              delay={0.16}
            />
          </div>

          {/* Venue note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.9 }}
            transition={{ ...reveal, delay: 0.28 }}
            className="mt-7 text-center text-sm italic"
            style={{ color: "#8A7A68" }}
          >
            {kecha2026.venues[0].note}
          </motion.p>

          {/* Dress code */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ ...reveal, delay: 0.36 }}
            className="mt-12 border-t pt-10 text-center"
            style={{ borderColor: "rgba(196,170,128,0.2)" }}
          >
            <p className="text-[9px] uppercase tracking-[0.58em]" style={{ color: "#A89070" }}>
              Code vestimentaire
            </p>
            <p className="mt-3 font-serif text-2xl italic" style={{ color: "#3C2E22" }}>
              {kecha2026.ceremony.blessing.dress}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PAROLES D'ÉTERNITÉ — Versets bibliques
      ══════════════════════════════════════════════════════ */}
      <section className="parchment-section relative overflow-hidden">
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(160,130,95,0.32), transparent)" }}
        />

        <div className="mx-auto max-w-3xl px-6 py-24 md:px-10 md:py-28">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={reveal}
            className="mb-16 text-center"
          >
            <p className="font-script text-5xl" style={{ color: "#8A7A62" }}>
              Paroles d'Éternité
            </p>
            <OrnamentRule color="#9A8A70" opacity={0.3} />
          </motion.div>

          {/* Scripture verses */}
          <div className="space-y-14">
            {kecha2026.scripture.map((verse, i) => (
              <motion.blockquote
                key={verse.reference}
                initial={{ opacity: 0, x: i % 2 === 0 ? -18 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ ...reveal, delay: i * 0.1 }}
                className={`scripture-blockquote relative py-2 ${
                  i % 2 !== 0 ? "border-r-2 pr-8 md:ml-12 md:text-right" : "border-l-2 pl-8 md:mr-12"
                }`}
                style={{ borderColor: "rgba(196,168,128,0.5)" }}
              >
                <p className="text-lg italic leading-9" style={{ color: "#3C3026" }}>
                  « {verse.text} »
                </p>
                <footer className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.5em]" style={{ color: "#8A7860" }}>
                    — {verse.reference}
                  </p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SOIRÉE — Shades of Brown
      ══════════════════════════════════════════════════════ */}
      <section className="evening-section relative overflow-hidden">
        {/* Warm ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 110%, rgba(180,110,40,0.14) 0%, transparent 55%), radial-gradient(ellipse at 15% 45%, rgba(140,80,20,0.06) 0%, transparent 38%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reveal}
            className="text-center"
          >
            <p className="text-[9px] uppercase tracking-[0.68em]" style={{ color: "rgba(196,146,90,0.65)" }}>
              ✦ &nbsp; Deuxième partie &nbsp; ✦
            </p>
            <h2 className="mt-5 font-serif leading-tight" style={{ color: "#F0E4D0", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              {kecha2026.ceremony.evening.label}
            </h2>
            <ThemeBadge
              theme={kecha2026.ceremony.evening.theme}
              note={kecha2026.ceremony.evening.themeNote}
              dark
            />
          </motion.div>

          {/* Info cards */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <InfoCard icon={CalendarDays} label="Date" value={kecha2026.date.display} dark delay={0} />
            <InfoCard icon={Clock} label="Heure" value={kecha2026.ceremony.evening.time} dark delay={0.08} />
            <InfoCard
              icon={MapPin}
              label="Lieu"
              value={`${kecha2026.venues[1].name} · ${kecha2026.venues[1].city}`}
              dark
              delay={0.16}
            />
          </div>

          {/* Venue note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.9 }}
            transition={{ ...reveal, delay: 0.28 }}
            className="mt-7 text-center text-sm italic"
            style={{ color: "rgba(196,168,128,0.58)" }}
          >
            {kecha2026.venues[1].note}
          </motion.p>

          {/* Dress code */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ ...reveal, delay: 0.36 }}
            className="mt-12 border-t pt-10 text-center"
            style={{ borderColor: "rgba(196,146,90,0.14)" }}
          >
            <p className="text-[9px] uppercase tracking-[0.58em]" style={{ color: "rgba(196,146,90,0.6)" }}>
              Code vestimentaire
            </p>
            <p className="mt-3 font-serif text-2xl italic" style={{ color: "#E8C49A" }}>
              {kecha2026.ceremony.evening.dress}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          RSVP — Confirmation de présence
      ══════════════════════════════════════════════════════ */}
      <section className="relative" style={{ background: "#F7F1EA" }}>
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(196,170,128,0.28), transparent)" }}
        />

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:px-10 md:py-28 lg:grid-cols-[1fr_1.45fr]">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reveal}
            className="space-y-8"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.55em]" style={{ color: "#9C8A72" }}>
                Votre réponse
              </p>
              <h2 className="mt-5 font-serif leading-tight" style={{ color: "#2C2118", fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Merci de confirmer votre présence.
              </h2>
              <p className="mt-6 text-base leading-8" style={{ color: "#6A5D50" }}>
                {kecha2026.couple.narrative}
              </p>
            </div>

            {/* Venue list */}
            <div className="space-y-7">
              {kecha2026.venues.map((venue) => (
                <article
                  key={venue.label}
                  className="border-l-2 pl-5"
                  style={{ borderColor: "rgba(196,170,128,0.38)" }}
                >
                  <p className="text-[9px] uppercase tracking-[0.44em]" style={{ color: "#9C8A72" }}>
                    {venue.label}
                  </p>
                  <p className="mt-2 font-serif text-xl" style={{ color: "#2C2118" }}>
                    {venue.name}
                  </p>
                  <p className="mt-1 text-sm leading-7" style={{ color: "#7A6D5E" }}>
                    {venue.address}, {venue.city}
                  </p>
                </article>
              ))}
            </div>
          </motion.div>

          {/* RSVP form */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ ...reveal, delay: 0.1 }}
          >
            <RsvpForm
              variant="page"
              submitEndpoint={`/api/invitation/${token}/rsvp`}
              initialValues={{
                firstName: currentGuest.firstName,
                lastName: currentGuest.lastName,
                email: currentGuest.email || "",
                phone: currentGuest.phone || "",
                status: currentGuest.status as "pending" | "confirmed" | "declined",
                guestCount: currentGuest.guestCount || 1,
                message: currentGuest.message || "",
              }}
              title="Répondre à votre invitation"
              description="Vos informations sont pré-remplies. Confirmez ou ajustez votre réponse."
              submitLabel="Confirmer ma présence"
              successTitle="Votre réponse est enregistrée"
              successDescription="Merci. Votre réponse a bien été enregistrée pour la bénédiction de Ketsia & Chad."
              onSubmitted={(updatedGuest) =>
                setGuestPreview({
                  ...currentGuest,
                  ...updatedGuest,
                  invitationUrl: currentGuest.invitationUrl,
                })
              }
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ÉPILOGUE — Clôture
      ══════════════════════════════════════════════════════ */}
      <footer
        className="px-6 py-16 text-center"
        style={{ background: "#F0E8DC", borderTop: "1px solid rgba(196,170,128,0.22)" }}
      >
        <OrnamentRule color="#9C8A72" opacity={0.25} />

        <div className="mt-10 mb-10">
          <p className="font-script text-6xl leading-none" style={{ color: "#7A6550" }}>
            Kecha
          </p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.55em]" style={{ color: "#9A8A76" }}>
            Ketsia &amp; Chad · 20 Juin 2026 · Kinshasa
          </p>
          <p className="mt-7 mx-auto max-w-sm font-serif text-sm italic leading-7" style={{ color: "#6A5D50" }}>
            {kecha2026.couple.statement}
          </p>
        </div>

        <OrnamentRule color="#9C8A72" opacity={0.25} />
      </footer>
    </main>
  );
}
