import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { insertRsvpSchema, type RsvpFormInput, type RsvpResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type RsvpFormProps = {
  variant?: "section" | "page" | "invitation";
  submitEndpoint?: string;
  initialValues?: Partial<RsvpFormInput>;
  title?: string;
  description?: string;
  submitLabel?: string;
  successTitle?: string;
  successDescription?: string;
  onSubmitted?: (guest: RsvpResponse) => void;
};

const defaultValues: RsvpFormInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "confirmed",
  guestCount: 1,
  mealChoice: "",
  message: "",
  escort: "",
};

/* ─── Styled native select ──────────────────────────────────── */
function StyledSelect({
  value,
  onChange,
  children,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-none border border-primary/15 bg-transparent px-4 pr-10 text-sm outline-none transition-colors focus:border-primary/50"
        style={{ color: value ? "inherit" : "rgba(0,0,0,0.35)" }}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35"
        strokeWidth={1.5}
      />
    </div>
  );
}

/* ─── Presence toggle cards ─────────────────────────────────── */
function PresenceToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const opts = [
    { value: "confirmed", emoji: "✓", label: "Oui, je serai là", sub: "Avec plaisir !" },
    { value: "declined", emoji: "✗", label: "Non, je ne peux pas", sub: "Je serai avec vous en pensée" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-start gap-1.5 border p-4 text-left transition-all duration-200"
            style={{
              borderColor: active
                ? opt.value === "confirmed"
                  ? "rgba(16,185,129,0.55)"
                  : "rgba(244,63,94,0.45)"
                : "rgba(0,0,0,0.1)",
              background: active
                ? opt.value === "confirmed"
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(244,63,94,0.04)"
                : "transparent",
            }}
          >
            <span
              className="text-xl font-light"
              style={{
                color: active
                  ? opt.value === "confirmed"
                    ? "rgb(16,185,129)"
                    : "rgb(244,63,94)"
                  : "rgba(0,0,0,0.25)",
              }}
            >
              {opt.emoji}
            </span>
            <span className="text-sm font-medium leading-tight text-foreground">
              {opt.label}
            </span>
            <span className="text-[11px] leading-tight text-foreground/45">{opt.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function RsvpForm({
  variant = "section",
  submitEndpoint = "/api/rsvp",
  initialValues,
  title = "Confirmez votre présence",
  description = "Remplissez ce formulaire pour nous dire si vous serez des nôtres.",
  submitLabel = "Confirmer ma présence",
  successTitle = "Votre réponse est enregistrée",
  successDescription = "Merci, votre réponse a bien été prise en compte.",
  onSubmitted,
}: RsvpFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RsvpFormInput>({
    resolver: zodResolver(insertRsvpSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const statusValue = form.watch("status");

  useEffect(() => {
    form.reset({ ...defaultValues, ...initialValues });
  }, [form, initialValues]);

  const mutation = useMutation({
    mutationFn: async (data: RsvpFormInput) => {
      const response = await apiRequest(
        submitEndpoint === "/api/rsvp" ? "POST" : "PATCH",
        submitEndpoint,
        data,
      );
      return (await response.json()) as RsvpResponse;
    },
    onSuccess: (guest) => {
      setSubmitted(true);
      onSubmitted?.(guest);
      toast({ title: "RSVP enregistré", description: successDescription });
    },
    onError: (error: Error) => {
      toast({
        title: "Impossible d'envoyer le RSVP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cardClassName =
    variant === "page"
      ? "border border-primary/10 bg-white p-8 md:p-12 editorial-shadow"
      : variant === "invitation"
        ? "border border-white/10 bg-white/95 p-8 md:p-10 editorial-shadow"
        : "border border-primary/10 bg-white/90 p-8 md:p-12 backdrop-blur-sm editorial-shadow";

  if (submitted) {
    return (
      <div className={`${cardClassName} text-center`}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
          <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.6} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.45em] text-primary/60">Merci</p>
        <h3 className="mt-4 font-serif text-3xl text-foreground md:text-4xl">{successTitle}</h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground/70">
          {successDescription}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 rounded-none border-primary/20 px-8 py-6 text-[10px] uppercase tracking-[0.35em] text-primary"
          onClick={() => {
            form.reset({ ...defaultValues, ...initialValues });
            setSubmitted(false);
          }}
        >
          Modifier ma réponse
        </Button>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <div className="mb-10 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.45em] text-primary/60">RSVP</p>
        <h3 className="font-serif text-3xl text-foreground md:text-4xl">{title}</h3>
        <p className="max-w-2xl text-sm leading-7 text-foreground/70">{description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-7">

          {/* ── 1. Présence ── */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Serez-vous des nôtres ?
                </FormLabel>
                <FormControl>
                  <PresenceToggle value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── 2. Prénom / Nom ── */}
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Prénom
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                      placeholder="Votre prénom"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Nom
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                      placeholder="Votre nom"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── 3. Email / Téléphone ── */}
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Email{" "}
                    <span className="normal-case tracking-normal opacity-50">(facultatif)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      value={field.value || ""}
                      className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                      placeholder="vous@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                    Téléphone
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                      placeholder="+243 ..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── 4. Nombre de places & Disponibilité — affichés seulement si confirmé ── */}
          {statusValue === "confirmed" && (
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                      Nombre de places
                    </FormLabel>
                    <FormControl>
                      <StyledSelect
                        value={String(field.value ?? 1)}
                        onChange={(v) => field.onChange(Number(v))}
                      >
                        <option value={1}>Seul(e)</option>
                        <option value={2}>Avec un(e) accompagnant(e)</option>
                      </StyledSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mealChoice"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                      Disponibilité
                    </FormLabel>
                    <FormControl>
                      <StyledSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Choisir..."
                      >
                        <option value="journee">Journée uniquement</option>
                        <option value="soiree">Soirée uniquement</option>
                        <option value="les-deux">Journée & soirée</option>
                      </StyledSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ── 5. Message ── */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                  Un mot pour les mariés{" "}
                  <span className="normal-case tracking-normal opacity-50">(facultatif)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    className="min-h-[110px] rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20"
                    placeholder="Une bénédiction, une pensée, un mot doux..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-none bg-primary py-7 text-[10px] uppercase tracking-[0.4em] text-primary-foreground hover:bg-foreground"
          >
            {mutation.isPending ? "Envoi en cours..." : submitLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}
