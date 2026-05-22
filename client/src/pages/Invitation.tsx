import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, MoveRight, Phone } from "lucide-react";
import { useRoute } from "wouter";
import { type RsvpResponse } from "@shared/schema";
import { kecha2026 } from "@shared/kecha2026";
import heroImg from "../../images/hero.jpeg";

type InvitationGuest = RsvpResponse & {
  invitationUrl: string;
  invitationStatus: "draft" | "sent";
};

const reveal = { duration: 1, ease: [0.22, 1, 0.36, 1] as const };

function statusLabel(guest: InvitationGuest) {
  if (guest.status === "confirmed") {
    return guest.guestCount === 2 ? "Présence confirmée · En couple" : "Présence confirmée · Seul(e)";
  }

  if (guest.status === "declined") {
    return "Absence enregistrée";
  }

  return "Réponse attendue";
}

export default function Invitation() {
  const [, params] = useRoute("/invitation/:token");
  const token = params?.token;

  const { data: guest, isLoading, error } = useQuery<InvitationGuest>({
    queryKey: token ? [`/api/invitation/${token}`] : ["invitation-missing-token"],
    enabled: Boolean(token),
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fcf7ef] px-6">
        <div className="border border-[#d9c8af]/40 bg-white/70 px-8 py-8 text-center backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#9f8668]">
            Invitation Kecha
          </p>
          <p className="mt-4 font-serif text-2xl text-[#34281f]">
            Préparation de votre invitation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !guest || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fcf7ef] px-6">
        <div className="max-w-xl border border-[#d9c8af]/40 bg-white px-8 py-10 text-center editorial-shadow">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#9f8668]">
            Kecha
          </p>
          <h1 className="mt-5 font-serif text-3xl text-[#34281f]">
            Invitation introuvable
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#6d5c4d]">
            Ce lien ne semble plus valide. Veuillez contacter directement Ketsia
            et Chad pour recevoir une nouvelle invitation.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf7ef] text-[#34281f]">
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,21,16,0.18)_0%,rgba(28,21,16,0.55)_55%,rgba(28,21,16,0.8)_100%)]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl items-center px-6 py-16 md:px-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reveal}
              className="max-w-3xl"
            >
              <p className="text-[10px] uppercase tracking-[0.6em] text-white/55">
                Invitation personnelle
              </p>
              <p className="mt-8 font-script text-[clamp(4rem,11vw,7rem)] leading-none text-[#f1dec1]">
                Kecha
              </p>
              <h1 className="mt-5 font-serif text-[clamp(2.4rem,6vw,5rem)] leading-[1.05] text-white">
                {guest.firstName} {guest.lastName}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/76 md:text-lg">
                Ketsia & Chad seraient honorés de vous compter parmi les
                témoins de leur bénédiction. Cette invitation vous est
                personnellement réservée.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={`/rsvp?token=${token}`}
                  className="inline-flex items-center gap-3 border border-[#f1dec1]/40 bg-[#f1dec1] px-7 py-4 text-[10px] uppercase tracking-[0.42em] text-[#3d2f20] transition-colors hover:bg-[#e8d0a8]"
                >
                  Répondre au RSVP
                  <MoveRight className="h-4 w-4" strokeWidth={1.6} />
                </a>
                <span className="inline-flex items-center border border-white/18 px-6 py-4 text-[10px] uppercase tracking-[0.36em] text-white/72">
                  {statusLabel(guest)}
                </span>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...reveal, delay: 0.12 }}
              className="border border-white/12 bg-white/10 p-7 text-white backdrop-blur-md"
            >
              <p className="text-[10px] uppercase tracking-[0.42em] text-white/55">
                Votre invitation
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
                    Couple
                  </p>
                  <p className="mt-2 font-serif text-2xl">Ketsia & Chad</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
                    Réponse actuelle
                  </p>
                  <p className="mt-2 font-serif text-xl">{statusLabel(guest)}</p>
                </div>
                {guest.phone ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
                      Contact communiqué
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/76">
                      <Phone className="h-4 w-4" strokeWidth={1.5} />
                      {guest.phone}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={reveal}
            className="border border-[#d9c8af]/40 bg-white p-8 editorial-shadow"
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#9f8668]">
              Un moment à vivre ensemble
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight">
              Une célébration pensée comme un souvenir précieux.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#6d5c4d]">
              Kecha est la signature de cette journée. Une invitation intime,
              élégante et profondément émotionnelle, imaginée pour accueillir
              ceux qui comptent le plus dans l’histoire de Ketsia & Chad.
            </p>
            <p className="mt-5 text-base leading-8 text-[#6d5c4d]">
              Votre lien personnel vous permet uniquement de consulter votre
              invitation et de répondre au RSVP. Aucun formulaire n’est affiché
              ici afin de préserver une expérience plus éditoriale et plus
              sereine.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ ...reveal, delay: 0.08 }}
            className="grid gap-5"
          >
            <div className="border border-[#d9c8af]/40 bg-[#f5ede2] p-7">
              <CalendarDays className="h-5 w-5 text-[#a78861]" strokeWidth={1.5} />
              <p className="mt-5 text-[10px] uppercase tracking-[0.38em] text-[#9f8668]">
                Date
              </p>
              <p className="mt-3 font-serif text-2xl">{kecha2026.date.display}</p>
            </div>

            <div className="border border-[#d9c8af]/40 bg-white p-7">
              <MapPin className="h-5 w-5 text-[#a78861]" strokeWidth={1.5} />
              <p className="mt-5 text-[10px] uppercase tracking-[0.38em] text-[#9f8668]">
                Lieu
              </p>
              <p className="mt-3 font-serif text-2xl">
                {kecha2026.venues[0]?.name || "Galerie Palanca"}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#6d5c4d]">
                {kecha2026.venues[0]?.address ||
                  "Numéro 10 avenue de l’avenir Chanic"}
              </p>
            </div>
          </motion.article>
        </div>
      </section>
    </main>
  );
}
