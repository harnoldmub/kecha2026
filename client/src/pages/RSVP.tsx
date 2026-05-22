import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type RsvpResponse } from "@shared/schema";
import RsvpForm from "@/components/RsvpForm";

type InvitationGuest = RsvpResponse & {
  invitationUrl: string;
};

export default function RSVP() {
  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token")
      : null;

  const { data: guest, isLoading, isError } = useQuery<InvitationGuest>({
    queryKey: token ? [`/api/invitation/${token}`] : ["rsvp-public"],
    enabled: Boolean(token),
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href={token ? `/invitation/${token}` : "/"}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-primary/70 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
          Retour à l'invitation
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="space-y-6">
            <p className="text-[11px] uppercase tracking-[0.45em] text-primary/60">
              RSVP
            </p>
            <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
              Une réponse simple, claire et intime.
            </h1>
            <p className="max-w-xl text-base leading-8 text-foreground/72">
              {token && guest
                ? `Cette réponse sera rattachée à l'invitation de ${guest.firstName} ${guest.lastName}.`
                : "Merci de confirmer votre présence à la bénédiction de Ketsia & Chad."}
            </p>
          </section>

          {token && isLoading ? (
            <div className="border border-primary/10 bg-white p-8 editorial-shadow">
              <p className="text-sm text-foreground/60">Chargement de votre invitation...</p>
            </div>
          ) : token && isError ? (
            <div className="border border-primary/10 bg-white p-8 editorial-shadow">
              <p className="font-serif text-2xl text-foreground">
                Invitation introuvable
              </p>
              <p className="mt-4 text-sm leading-7 text-foreground/65">
                Ce lien RSVP n'est plus valide. Merci de contacter directement
                Ketsia & Chad pour recevoir une nouvelle invitation.
              </p>
            </div>
          ) : (
            <RsvpForm
              variant="page"
              submitEndpoint={token ? `/api/invitation/${token}/rsvp` : "/api/rsvp"}
              initialValues={guest}
              title={token ? "Répondre à votre invitation" : "Répondre à l'invitation"}
              description="Choisissez votre présence, puis indiquez si vous venez seul(e) ou en couple."
              successDescription="Merci. Votre réponse a bien été enregistrée pour Ketsia & Chad."
            />
          )}
        </div>
      </div>
    </main>
  );
}
