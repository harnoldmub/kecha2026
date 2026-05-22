import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { type SafeUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GuestRecord = {
  id: number;
  firstName: string;
  lastName: string;
  status: string;
  guestCount: number;
  checkedInAt: string | null;
};

async function getCurrentUser() {
  const res = await fetch("/api/user", {
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Impossible de vérifier la session.");
  }

  return (await res.json()) as SafeUser;
}

export default function CheckIn() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: user, isLoading: isCheckingSession } = useQuery<SafeUser | null>({
    queryKey: ["/api/user"],
    queryFn: getCurrentUser,
  });

  const { data: guests = [], isLoading } = useQuery<GuestRecord[]>({
    queryKey: ["/api/admin/guests"],
    enabled: Boolean(user),
  });

  const checkInMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/rsvp/${id}/check-in`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({ title: "Entrée validée" });
    },
  });

  const filteredGuests = useMemo(() => {
    return guests
      .filter((guest) => guest.status === "confirmed")
      .filter((guest) =>
        `${guest.firstName} ${guest.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => Number(Boolean(a.checkedInAt)) - Number(Boolean(b.checkedInAt)));
  }, [guests, searchTerm]);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={1.2} />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1ea] px-6">
        <div className="border border-primary/10 bg-white p-8 text-center editorial-shadow">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60">
            Check-in
          </p>
          <h1 className="mt-4 font-serif text-3xl text-foreground">
            Connexion requise
          </h1>
          <Button asChild className="mt-6 rounded-none bg-primary hover:bg-foreground">
            <Link href="/admin">Ouvrir l'admin</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={1.2} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f2ea] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="border border-primary/10 bg-white px-8 py-10 text-center editorial-shadow">
          <div className="flex items-center justify-center gap-2 text-primary/60">
            <UserCheck className="h-5 w-5" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-[0.5em]">Check-in</p>
          </div>
          <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
            Accueil des invités confirmés
          </h1>
          <Button
            asChild
            variant="outline"
            className="mt-6 rounded-none border-primary/15 text-[10px] uppercase tracking-[0.35em] text-primary"
          >
            <Link href="/admin">Retour à l'admin</Link>
          </Button>
        </header>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30" />
          <Input
            placeholder="Rechercher un convive..."
            className="h-16 rounded-none border-primary/10 bg-white pl-14 text-lg editorial-shadow focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredGuests.map((guest) => (
            <article
              key={guest.id}
              className={`flex items-center justify-between gap-5 border border-primary/10 p-6 editorial-shadow ${
                guest.checkedInAt ? "bg-white/65" : "bg-white"
              }`}
            >
              <div>
                <p className="font-serif text-2xl text-foreground">
                  {guest.firstName} {guest.lastName}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-primary/45">
                  {guest.guestCount === 2 ? "En couple" : "Seul(e)"}
                </p>
                {guest.checkedInAt ? (
                  <Badge
                    variant="outline"
                    className="mt-3 rounded-none border-0 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-primary"
                  >
                    Check-in validé
                  </Badge>
                ) : null}
              </div>

              {!guest.checkedInAt ? (
                <Button
                  onClick={() => checkInMutation.mutate(guest.id)}
                  disabled={checkInMutation.isPending}
                  className="rounded-none bg-primary px-5 py-6 text-[10px] uppercase tracking-[0.35em] text-primary-foreground hover:bg-foreground"
                >
                  <Check className="mr-2 h-4 w-4" strokeWidth={1.8} />
                  Valider
                </Button>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center border border-primary/10">
                  <Check className="h-7 w-7 text-primary" strokeWidth={1.4} />
                </div>
              )}
            </article>
          ))}

          {filteredGuests.length === 0 ? (
            <p className="py-20 text-center font-serif text-2xl text-foreground/40">
              Aucun invité confirmé ne correspond à votre recherche.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
