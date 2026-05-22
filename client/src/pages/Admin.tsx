import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Copy,
  Download,
  Loader2,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";
import { type RsvpResponse, type SafeUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  defaultPhoneCountry,
  formatInternationalPhone,
  getPhoneCountryFromValue,
} from "@/lib/phoneCountries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import PhoneField from "@/components/PhoneField";

type GuestStatus = "pending" | "confirmed" | "declined";
type InvitationStatus = "all" | "draft" | "sent";
type StatusFilter = "all" | GuestStatus;
type PageSize = 10 | 20 | 50;

type GuestRecord = RsvpResponse & {
  invitationUrl: string;
  invitationStatus: "draft" | "sent";
};

type GuestFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: GuestStatus;
  guestCount: 0 | 1 | 2;
  message: string;
};

const emptyGuestForm: GuestFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "pending",
  guestCount: 1,
  message: "",
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

function formatGuestStatus(status: GuestStatus) {
  if (status === "confirmed") return "Confirmé";
  if (status === "declined") return "Décliné";
  return "En attente";
}

function formatSeatLabel(guestCount: number) {
  if (guestCount === 2) return "En couple";
  if (guestCount === 1) return "Seul(e)";
  return "Aucune place";
}

function getInvitationUrl(guest: GuestRecord) {
  return guest.invitationUrl || `${window.location.origin}/invitation/${guest.token}`;
}

function guestShareMessage(guest: GuestRecord, invitationUrl: string) {
  return [
    `Bonjour ${guest.firstName},`,
    "",
    "Ketsia & Chad seraient honorés de vous compter parmi leurs invités.",
    `Votre invitation personnelle: ${invitationUrl}`,
    "",
    "Vous pouvez confirmer votre présence directement depuis ce lien.",
  ].join("\n");
}

function buildGuestPayload(
  guestForm: GuestFormState,
  phoneDialCode: string,
  phoneNumber: string,
) {
  const normalizedStatus = guestForm.status;
  const normalizedGuestCount =
    normalizedStatus === "declined" ? 0 : guestForm.guestCount === 2 ? 2 : 1;

  return {
    firstName: guestForm.firstName.trim(),
    lastName: guestForm.lastName.trim(),
    email: guestForm.email.trim(),
    phone: formatInternationalPhone(phoneDialCode, phoneNumber),
    status: normalizedStatus,
    guestCount: normalizedGuestCount,
    message: guestForm.message.trim(),
  };
}

function PaginationControls({
  currentPage,
  pageCount,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-5">
      <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/45">
        Page {currentPage} / {pageCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-none border-primary/15 text-[10px] uppercase tracking-[0.25em] text-primary"
        >
          Précédent
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-none border-primary/15 text-[10px] uppercase tracking-[0.25em] text-primary"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [invitationFilter, setInvitationFilter] = useState<InvitationStatus>("all");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [guestForm, setGuestForm] = useState<GuestFormState>(emptyGuestForm);
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);
  const [phoneDialCode, setPhoneDialCode] = useState(defaultPhoneCountry.dialCode);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: user, isLoading: isCheckingSession } = useQuery<SafeUser | null>({
    queryKey: ["/api/user"],
    queryFn: getCurrentUser,
  });

  const { data: guests = [], isLoading: isLoadingGuests } = useQuery<GuestRecord[]>({
    queryKey: ["/api/admin/guests"],
    enabled: Boolean(user),
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, invitationFilter, pageSize]);

  useEffect(() => {
    setMessagePage(1);
  }, [searchTerm]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return (await response.json()) as SafeUser;
    },
    onSuccess: (loggedUser) => {
      queryClient.setQueryData(["/api/user"], loggedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'espace administrateur.",
      });
      setCredentials((current) => ({ ...current, password: "" }));
    },
    onError: (error: Error) => {
      toast({
        title: "Connexion impossible",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.removeQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Déconnecté",
        description: "La session administrateur est maintenant fermée.",
      });
    },
  });

  const saveGuestMutation = useMutation({
    mutationFn: async () => {
      const endpoint = editingGuestId
        ? `/api/admin/guests/${editingGuestId}`
        : "/api/admin/guests";
      const method = editingGuestId ? "PATCH" : "POST";
      const payload = buildGuestPayload(guestForm, phoneDialCode, phoneNumber);
      const response = await apiRequest(method, endpoint, payload);
      return (await response.json()) as GuestRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: editingGuestId ? "Invité mis à jour" : "Invité ajouté",
        description: editingGuestId
          ? "Les informations de l'invité ont bien été actualisées."
          : "Le lien d'invitation personnalisé est prêt à être partagé.",
      });
      resetGuestForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Impossible d'enregistrer l'invité",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: number) => {
      await apiRequest("DELETE", `/api/admin/guests/${guestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Invité supprimé",
        description: "L'invité a été retiré de la liste.",
      });
      resetGuestForm();
    },
  });

  const regenerateLinkMutation = useMutation({
    mutationFn: async (guestId: number) => {
      const response = await apiRequest("POST", `/api/admin/guests/${guestId}/regenerate-link`);
      return (await response.json()) as GuestRecord;
    },
    onSuccess: async (guest) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      await navigator.clipboard.writeText(getInvitationUrl(guest));
      toast({
        title: "Lien régénéré",
        description: "Le nouveau lien d'invitation a été copié.",
      });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/rsvp/${id}/check-in`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Présence enregistrée",
        description: "Le check-in de l'invité a été validé.",
      });
    },
  });

  const markUnavailableMutation = useMutation({
    mutationFn: async (guest: GuestRecord) => {
      const response = await apiRequest("PATCH", `/api/admin/guests/${guest.id}`, {
        status: "declined",
        guestCount: 0,
      });
      return (await response.json()) as GuestRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Invité marqué indisponible",
        description: "Son RSVP a été passé en décliné.",
      });
    },
  });

  const stats = {
    totalInvites: guests.length,
    pendingInvites: guests.filter((guest) => guest.status === "pending").length,
    confirmedInvites: guests.filter((guest) => guest.status === "confirmed").length,
    declinedInvites: guests.filter((guest) => guest.status === "declined").length,
    sentInvitations: guests.filter((guest) => guest.invitationStatus === "sent").length,
  };

  const filteredGuests = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesStatus = statusFilter === "all" || guest.status === statusFilter;
      const matchesInvitation =
        invitationFilter === "all" || guest.invitationStatus === invitationFilter;

      if (!matchesStatus || !matchesInvitation) {
        return false;
      }

      if (!normalizedTerm) {
        return true;
      }

      return [
        guest.firstName,
        guest.lastName,
        guest.email || "",
        guest.phone || "",
        guest.status,
        guest.invitationStatus,
        guest.message || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedTerm);
    });
  }, [guests, invitationFilter, searchTerm, statusFilter]);

  const guestPageCount = Math.max(1, Math.ceil(filteredGuests.length / pageSize));
  const safeGuestPage = Math.min(currentPage, guestPageCount);
  const paginatedGuests = filteredGuests.slice(
    (safeGuestPage - 1) * pageSize,
    safeGuestPage * pageSize,
  );

  const messageGuests = useMemo(
    () =>
      filteredGuests.filter((guest) => guest.message && guest.message.trim().length > 0),
    [filteredGuests],
  );
  const messagePageSize = 6;
  const messagePageCount = Math.max(1, Math.ceil(messageGuests.length / messagePageSize));
  const safeMessagePage = Math.min(messagePage, messagePageCount);
  const paginatedMessages = messageGuests.slice(
    (safeMessagePage - 1) * messagePageSize,
    safeMessagePage * messagePageSize,
  );

  function resetGuestForm() {
    setGuestForm(emptyGuestForm);
    setEditingGuestId(null);
    setPhoneDialCode(defaultPhoneCountry.dialCode);
    setPhoneNumber("");
  }

  function startEditingGuest(guest: GuestRecord) {
    const parsedPhone = getPhoneCountryFromValue(guest.phone);

    setEditingGuestId(guest.id);
    setGuestForm({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || "",
      phone: guest.phone || "",
      status: guest.status as GuestStatus,
      guestCount: guest.guestCount === 2 ? 2 : guest.guestCount === 0 ? 0 : 1,
      message: guest.message || "",
    });
    setPhoneDialCode(parsedPhone.country.dialCode);
    setPhoneNumber(parsedPhone.phoneNumber);
  }

  async function markInvitationSent(guestId: number) {
    await apiRequest("POST", `/api/admin/guests/${guestId}/mark-sent`);
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
  }

  async function copyInvitationLink(guest: GuestRecord) {
    const invitationUrl = getInvitationUrl(guest);
    await navigator.clipboard.writeText(invitationUrl);
    await markInvitationSent(guest.id);
    toast({
      title: "Lien copié",
      description: "Le lien d'invitation est prêt à être partagé et l'envoi a été enregistré.",
    });
  }

  async function shareOnWhatsApp(guest: GuestRecord) {
    const invitationUrl = getInvitationUrl(guest);
    await markInvitationSent(guest.id);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        guestShareMessage(guest, invitationUrl),
      )}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast({
      title: "Partage WhatsApp prêt",
      description: "Le lien a été préparé dans WhatsApp et l'envoi a été marqué.",
    });
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.5} />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f5efe8] px-6 py-10 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="overflow-hidden bg-[#1d1713] p-8 text-white md:p-12">
            <p className="text-[11px] uppercase tracking-[0.45em] text-white/55">
              Espace admin
            </p>
            <h1 className="mt-6 font-serif text-4xl leading-tight md:text-6xl">
              Gérer les invités de Ketsia & Chad avec précision.
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-8 text-white/72">
              Créez les invités, générez leurs liens d'invitation individuels,
              suivez les réponses RSVP, pilotez l'envoi et organisez le check-in
              depuis un tableau de bord privé.
            </p>
          </section>

          <section className="border border-primary/10 bg-white p-8 editorial-shadow md:p-12">
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-3 text-primary">
                <LockKeyhole className="h-5 w-5" strokeWidth={1.6} />
                <p className="text-[11px] uppercase tracking-[0.45em] text-primary/65">
                  Connexion
                </p>
              </div>
              <h2 className="font-serif text-3xl text-foreground md:text-4xl">
                Accès administrateur
              </h2>
            </div>

            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                loginMutation.mutate();
              }}
            >
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Identifiant
                </label>
                <Input
                  value={credentials.username}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                  placeholder="Nom d'utilisateur"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Code d'accès
                </label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                  placeholder="Mot de passe"
                />
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full rounded-none bg-primary py-7 text-[10px] uppercase tracking-[0.4em] text-primary-foreground hover:bg-foreground"
              >
                {loginMutation.isPending ? "Connexion..." : "Entrer dans l'admin"}
              </Button>
            </form>

            <div className="mt-10 border-t border-primary/10 pt-6">
              <Button
                asChild
                variant="ghost"
                className="rounded-none px-0 text-[10px] uppercase tracking-[0.35em] text-primary/70 hover:bg-transparent hover:text-primary"
              >
                <Link href="/">Retour au site invitation</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-6 border border-primary/10 bg-white p-8 editorial-shadow md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
              <p className="text-[11px] uppercase tracking-[0.45em] text-primary/65">
                Session active
              </p>
            </div>
            <div>
              <h1 className="font-serif text-4xl text-foreground md:text-6xl">
                Invités & invitations
              </h1>
              <p className="mt-3 text-sm leading-7 text-foreground/70">
                Connecté en tant que {user.username}. Gérez toute la liste,
                partagez les invitations, suivez les RSVP et préparez l'accueil.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              type="button"
              variant="outline"
              className="rounded-none border-primary/15 px-5 text-[10px] uppercase tracking-[0.35em] text-primary"
            >
              <Link href="/check-in">
                <UserCheck className="mr-2 h-4 w-4" strokeWidth={1.6} />
                Ouvrir le check-in
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open("/api/admin/guests/export", "_blank")}
              className="rounded-none border-primary/15 px-5 text-[10px] uppercase tracking-[0.35em] text-primary"
            >
              <Download className="mr-2 h-4 w-4" strokeWidth={1.6} />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              className="rounded-none border-primary/15 px-5 text-[10px] uppercase tracking-[0.35em] text-primary"
            >
              <LogOut className="mr-2 h-4 w-4" strokeWidth={1.6} />
              Déconnexion
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Invités", value: stats.totalInvites, icon: Users },
            { label: "En attente", value: stats.pendingInvites, icon: RefreshCw },
            { label: "Confirmés", value: stats.confirmedInvites, icon: ShieldCheck },
            { label: "Déclinés", value: stats.declinedInvites, icon: XCircle },
            { label: "Invitations envoyées", value: stats.sentInvitations, icon: UserPlus },
          ].map((item) => (
            <article
              key={item.label}
              className="border border-primary/10 bg-white p-6 editorial-shadow"
            >
              <item.icon className="h-5 w-5 text-primary/50" strokeWidth={1.5} />
              <p className="mt-5 text-[10px] uppercase tracking-[0.35em] text-foreground/45">
                {item.label}
              </p>
              <p className="mt-3 font-serif text-4xl text-foreground">
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <article className="border border-primary/10 bg-white p-6 editorial-shadow md:p-8">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.45em] text-primary/60">
                {editingGuestId ? "Modifier l'invité" : "Ajouter un invité"}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
                {editingGuestId
                  ? "Mettez à jour les informations de l'invité"
                  : "Créer une invitation personnalisée"}
              </h2>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                saveGuestMutation.mutate();
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Prénom
                  </label>
                  <Input
                    value={guestForm.firstName}
                    onChange={(event) =>
                      setGuestForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Nom
                  </label>
                  <Input
                    value={guestForm.lastName}
                    onChange={(event) =>
                      setGuestForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Email
                </label>
                <Input
                  type="email"
                  value={guestForm.email}
                  onChange={(event) =>
                    setGuestForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Téléphone
                </label>
                <PhoneField
                  countryDialCode={phoneDialCode}
                  onCountryDialCodeChange={setPhoneDialCode}
                  phoneNumber={phoneNumber}
                  onPhoneNumberChange={setPhoneNumber}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Statut RSVP
                  </label>
                  <select
                    value={guestForm.status}
                    onChange={(event) => {
                      const status = event.target.value as GuestStatus;
                      setGuestForm((current) => ({
                        ...current,
                        status,
                        guestCount: status === "declined" ? 0 : current.guestCount === 2 ? 2 : 1,
                      }));
                    }}
                    className="h-12 w-full rounded-none border border-primary/15 bg-transparent px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="declined">Décliné</option>
                  </select>
                </div>

                {guestForm.status !== "declined" ? (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                      Nombre de places
                    </label>
                    <select
                      value={guestForm.guestCount === 2 ? 2 : 1}
                      onChange={(event) =>
                        setGuestForm((current) => ({
                          ...current,
                          guestCount: event.target.value === "2" ? 2 : 1,
                        }))
                      }
                      className="h-12 w-full rounded-none border border-primary/15 bg-transparent px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="1">Seul(e)</option>
                      <option value="2">En couple</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                      Nombre de places
                    </label>
                    <div className="flex h-12 items-center border border-primary/15 px-3 text-sm text-foreground/55">
                      Aucune place
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Note / message
                </label>
                <Textarea
                  value={guestForm.message}
                  onChange={(event) =>
                    setGuestForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  className="min-h-[140px] rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <Button
                  type="submit"
                  disabled={saveGuestMutation.isPending}
                  className="rounded-none bg-primary px-7 py-6 text-[10px] uppercase tracking-[0.35em] text-primary-foreground hover:bg-foreground"
                >
                  {saveGuestMutation.isPending
                    ? "Enregistrement..."
                    : editingGuestId
                      ? "Mettre à jour"
                      : "Créer l'invité"}
                </Button>
                {(editingGuestId || guestForm.firstName || guestForm.lastName) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetGuestForm}
                    className="rounded-none border-primary/15 px-7 py-6 text-[10px] uppercase tracking-[0.35em] text-primary"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </form>
          </article>

          <article className="border border-primary/10 bg-white p-6 editorial-shadow md:p-8">
            <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.45em] text-primary/60">
                  Liste invités
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground/70">
                  Recherchez, filtrez, partagez, régénérez les liens et gérez
                  le RSVP invité par invité.
                </p>
              </div>

              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/35" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nom, email, téléphone..."
                  className="h-12 rounded-none border-primary/15 bg-transparent pl-11 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-[1fr_1fr_150px]">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-12 rounded-none border border-primary/15 bg-transparent px-3 text-sm outline-none focus:border-primary"
              >
                <option value="all">Tous les RSVP</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmés</option>
                <option value="declined">Déclinés</option>
              </select>

              <select
                value={invitationFilter}
                onChange={(event) =>
                  setInvitationFilter(event.target.value as InvitationStatus)
                }
                className="h-12 rounded-none border border-primary/15 bg-transparent px-3 text-sm outline-none focus:border-primary"
              >
                <option value="all">Toutes les invitations</option>
                <option value="draft">Brouillons</option>
                <option value="sent">Envoyées</option>
              </select>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number.parseInt(event.target.value, 10) as PageSize)
                }
                className="h-12 rounded-none border border-primary/15 bg-transparent px-3 text-sm outline-none focus:border-primary"
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>

            {isLoadingGuests ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/10">
                        <TableHead className="text-[10px] uppercase tracking-[0.3em] text-primary/70">
                          Invité
                        </TableHead>
                        <TableHead className="text-[10px] uppercase tracking-[0.3em] text-primary/70">
                          RSVP
                        </TableHead>
                        <TableHead className="text-[10px] uppercase tracking-[0.3em] text-primary/70">
                          Invitation
                        </TableHead>
                        <TableHead className="text-right text-[10px] uppercase tracking-[0.3em] text-primary/70">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedGuests.map((guest) => (
                        <TableRow key={guest.id} className="border-primary/10 align-top">
                          <TableCell className="min-w-[250px] py-6">
                            <p className="font-serif text-xl text-foreground">
                              {guest.firstName} {guest.lastName}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-foreground/65">
                              {guest.email || "Aucun email"} · {guest.phone || "Aucun téléphone"}
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-foreground/40">
                              Créé le{" "}
                              {guest.createdAt
                                ? format(new Date(guest.createdAt), "d MMM yyyy", { locale: fr })
                                : "-"}
                            </p>
                          </TableCell>

                          <TableCell className="min-w-[200px] py-6">
                            <Badge
                              variant="outline"
                              className={`rounded-none border-0 px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                                guest.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : guest.status === "declined"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {formatGuestStatus(guest.status as GuestStatus)}
                            </Badge>
                            <p className="mt-3 text-sm leading-7 text-foreground/65">
                              {formatSeatLabel(guest.guestCount)}
                            </p>
                            {guest.checkedInAt ? (
                              <Badge
                                variant="outline"
                                className="mt-3 rounded-none border-0 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-primary"
                              >
                                Check-in
                              </Badge>
                            ) : null}
                          </TableCell>

                          <TableCell className="min-w-[260px] py-6">
                            <Badge
                              variant="outline"
                              className={`rounded-none border-0 px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                                guest.invitationStatus === "sent"
                                  ? "bg-stone-100 text-stone-700"
                                  : "bg-[#f3e7d8] text-[#8e6b3a]"
                              }`}
                            >
                              {guest.invitationStatus === "sent" ? "Envoyée" : "Brouillon"}
                            </Badge>
                            <p className="mt-3 break-all text-sm leading-7 text-foreground/65">
                              {getInvitationUrl(guest)}
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-foreground/40">
                              {guest.invitationSentAt
                                ? format(new Date(guest.invitationSentAt), "d MMM yyyy, HH:mm", {
                                    locale: fr,
                                  })
                                : "Pas encore partagée"}
                            </p>
                          </TableCell>

                          <TableCell className="min-w-[290px] py-6 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => copyInvitationLink(guest)}
                                className="rounded-none border-primary/15 text-[10px] uppercase tracking-[0.25em] text-primary"
                              >
                                <Copy className="mr-2 h-3.5 w-3.5" strokeWidth={1.6} />
                                Copier
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => shareOnWhatsApp(guest)}
                                className="rounded-none border-primary/15 text-[10px] uppercase tracking-[0.25em] text-primary"
                              >
                                <MessageCircle className="mr-2 h-3.5 w-3.5" strokeWidth={1.6} />
                                WhatsApp
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => regenerateLinkMutation.mutate(guest.id)}
                                className="rounded-none border-primary/15 text-[10px] uppercase tracking-[0.25em] text-primary"
                              >
                                <RefreshCw className="mr-2 h-3.5 w-3.5" strokeWidth={1.6} />
                                Régénérer
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => startEditingGuest(guest)}
                                className="rounded-none border-primary/15 text-[10px] uppercase tracking-[0.25em] text-primary"
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.6} />
                                Modifier
                              </Button>
                              {!guest.checkedInAt && guest.status === "confirmed" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => checkInMutation.mutate(guest.id)}
                                  className="rounded-none bg-primary text-[10px] uppercase tracking-[0.25em] text-primary-foreground hover:bg-foreground"
                                >
                                  Check-in
                                </Button>
                              ) : null}
                              {guest.status !== "declined" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markUnavailableMutation.mutate(guest)}
                                  className="rounded-none border-amber-200 text-[10px] uppercase tracking-[0.25em] text-amber-700 hover:bg-amber-50"
                                >
                                  Indisponible
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => deleteGuestMutation.mutate(guest.id)}
                                className="rounded-none border-rose-200 text-[10px] uppercase tracking-[0.25em] text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" strokeWidth={1.6} />
                                Supprimer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {paginatedGuests.length === 0 ? (
                        <TableRow className="border-primary/10">
                          <TableCell colSpan={4} className="py-16 text-center">
                            <p className="font-serif text-2xl text-foreground/55">
                              Aucun invité ne correspond à cette recherche.
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>

                <PaginationControls
                  currentPage={safeGuestPage}
                  pageCount={guestPageCount}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </article>
        </section>

        <section className="border border-primary/10 bg-white p-6 editorial-shadow md:p-8">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.45em] text-primary/60">
              Messages des invités
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground">
              Les mots laissés avec les RSVP
            </h2>
          </div>

          {paginatedMessages.length === 0 ? (
            <p className="text-sm leading-7 text-foreground/60">
              Aucun message invité pour les filtres actuels.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {paginatedMessages.map((guest) => (
                <article
                  key={`message-${guest.id}`}
                  className="border border-primary/10 bg-[#fcfaf6] p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-2xl text-foreground">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-foreground/45">
                        {formatGuestStatus(guest.status as GuestStatus)} · {formatSeatLabel(guest.guestCount)}
                      </p>
                    </div>
                    {guest.checkedInAt ? (
                      <Badge
                        variant="outline"
                        className="rounded-none border-0 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-primary"
                      >
                        Check-in
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-5 text-sm leading-8 text-foreground/72">
                    {guest.message}
                  </p>
                </article>
              ))}
            </div>
          )}

          <div className="mt-6">
            <PaginationControls
              currentPage={safeMessagePage}
              pageCount={messagePageCount}
              onPageChange={setMessagePage}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
