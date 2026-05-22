import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  publicRsvpSchema,
  type RsvpFormInput,
  type RsvpResponse,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  defaultPhoneCountry,
  formatInternationalPhone,
  getPhoneCountryFromValue,
} from "@/lib/phoneCountries";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import PhoneField from "@/components/PhoneField";

type RsvpFormProps = {
  variant?: "section" | "page" | "invitation";
  submitEndpoint?: string;
  initialValues?: Partial<RsvpResponse>;
  title?: string;
  description?: string;
  submitLabel?: string;
  successTitle?: string;
  successDescription?: string;
  onSubmitted?: (guest: RsvpResponse) => void;
};

function getFormDefaults(initialValues?: Partial<RsvpResponse>): RsvpFormInput {
  const initialStatus =
    initialValues?.status === "declined" ? "declined" : "confirmed";
  const initialGuestCount =
    initialStatus === "declined"
      ? 0
      : initialValues?.guestCount === 2
        ? 2
        : 1;

  return {
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    phone: initialValues?.phone || "",
    status: initialStatus,
    guestCount: initialGuestCount,
    message: initialValues?.message || "",
  };
}

export default function RsvpForm({
  variant = "section",
  submitEndpoint = "/api/rsvp",
  initialValues,
  title = "RSVP",
  description = "Merci de nous confirmer votre présence avec votre téléphone et le nombre de places réservé.",
  submitLabel = "Envoyer ma réponse",
  successTitle = "Réponse enregistrée",
  successDescription = "Merci. Votre réponse a bien été enregistrée.",
  onSubmitted,
}: RsvpFormProps) {
  const { toast } = useToast();
  const [submittedGuest, setSubmittedGuest] = useState<RsvpResponse | null>(null);

  const initialPhone = useMemo(
    () => getPhoneCountryFromValue(initialValues?.phone),
    [initialValues?.phone],
  );
  const [countryDialCode, setCountryDialCode] = useState(
    initialPhone.country.dialCode || defaultPhoneCountry.dialCode,
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.phoneNumber);

  const form = useForm<RsvpFormInput>({
    resolver: zodResolver(publicRsvpSchema),
    defaultValues: getFormDefaults(initialValues),
  });

  const watchedStatus = form.watch("status");

  useEffect(() => {
    const nextDefaults = getFormDefaults(initialValues);
    const nextPhone = getPhoneCountryFromValue(initialValues?.phone);

    form.reset(nextDefaults);
    setCountryDialCode(nextPhone.country.dialCode || defaultPhoneCountry.dialCode);
    setPhoneNumber(nextPhone.phoneNumber);
    setSubmittedGuest(null);
  }, [form, initialValues]);

  useEffect(() => {
    if (watchedStatus === "declined") {
      form.setValue("guestCount", 0, { shouldValidate: true });
    } else if (form.getValues("guestCount") === 0) {
      form.setValue("guestCount", 1, { shouldValidate: true });
    }
  }, [form, watchedStatus]);

  useEffect(() => {
    form.setValue(
      "phone",
      formatInternationalPhone(countryDialCode, phoneNumber),
      { shouldValidate: true },
    );
  }, [countryDialCode, form, phoneNumber]);

  const submitMutation = useMutation({
    mutationFn: async (values: RsvpFormInput) => {
      const payload: RsvpFormInput = {
        ...values,
        phone: formatInternationalPhone(countryDialCode, phoneNumber),
        guestCount: values.status === "declined" ? 0 : values.guestCount,
      };

      const response = await apiRequest(
        submitEndpoint.startsWith("/api/invitation/") ? "PATCH" : "POST",
        submitEndpoint,
        payload,
      );

      return (await response.json()) as RsvpResponse;
    },
    onSuccess: (guest) => {
      setSubmittedGuest(guest);
      onSubmitted?.(guest);
      toast({
        title: successTitle,
        description: successDescription,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Impossible d'enregistrer votre réponse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cardClassName =
    variant === "invitation"
      ? "border border-white/10 bg-white/5 p-6 text-white backdrop-blur-md md:p-8"
      : "border border-primary/10 bg-white p-6 editorial-shadow md:p-8";

  const labelClassName =
    variant === "invitation"
      ? "text-[10px] uppercase tracking-[0.32em] text-white/60"
      : "text-[10px] uppercase tracking-[0.32em] text-foreground/60";

  const titleClassName =
    variant === "invitation"
      ? "font-serif text-3xl text-white md:text-4xl"
      : "font-serif text-3xl text-foreground md:text-4xl";

  const copyClassName =
    variant === "invitation" ? "text-sm leading-7 text-white/72" : "text-sm leading-7 text-foreground/70";

  const inputClassName =
    variant === "invitation"
      ? "h-12 rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/20"
      : "h-12 rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20";

  const textareaClassName =
    variant === "invitation"
      ? "min-h-[140px] rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/20"
      : "min-h-[140px] rounded-none border-primary/15 bg-transparent focus-visible:ring-primary/20";

  if (submittedGuest) {
    return (
      <section className={cardClassName}>
        <div className="flex flex-col items-center text-center">
          <CheckCircle2
            className={variant === "invitation" ? "h-12 w-12 text-[#f0d7a8]" : "h-12 w-12 text-primary"}
            strokeWidth={1.4}
          />
          <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-primary/60">
            Confirmation
          </p>
          <h3 className={variant === "invitation" ? "mt-3 font-serif text-3xl text-white" : "mt-3 font-serif text-3xl text-foreground"}>
            {successTitle}
          </h3>
          <p className={variant === "invitation" ? "mt-4 max-w-md text-sm leading-7 text-white/72" : "mt-4 max-w-md text-sm leading-7 text-foreground/70"}>
            {successDescription}
          </p>
          <p className={variant === "invitation" ? "mt-6 text-[10px] uppercase tracking-[0.35em] text-white/45" : "mt-6 text-[10px] uppercase tracking-[0.35em] text-foreground/45"}>
            {submittedGuest.status === "confirmed"
              ? submittedGuest.guestCount === 2
                ? "Présence confirmée · En couple"
                : "Présence confirmée · Seul(e)"
              : "Absence enregistrée"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cardClassName}>
      <div className="mb-8">
        <p className={labelClassName}>RSVP</p>
        <h3 className={`mt-3 ${titleClassName}`}>{title}</h3>
        <p className={`mt-4 ${copyClassName}`}>{description}</p>
      </div>

      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) => submitMutation.mutate(values))}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClassName} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClassName} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={() => (
              <FormItem>
                <FormLabel className={labelClassName}>Téléphone</FormLabel>
                <FormControl>
                  <PhoneField
                    countryDialCode={countryDialCode}
                    onCountryDialCodeChange={setCountryDialCode}
                    phoneNumber={phoneNumber}
                    onPhoneNumberChange={(value) => {
                      setPhoneNumber(value);
                    }}
                    variant={variant === "invitation" ? "dark" : "light"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Présence</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as RsvpFormInput["status"])
                    }
                    className="grid gap-3 md:grid-cols-2"
                  >
                    {[
                      {
                        value: "confirmed",
                        label: "Je serai là",
                      },
                      {
                        value: "declined",
                        label: "Je ne serai pas là",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 border px-4 py-4 transition-colors ${
                          variant === "invitation"
                            ? "border-white/12 bg-white/5 text-white hover:border-white/30"
                            : "border-primary/12 bg-transparent text-foreground hover:border-primary/35"
                        }`}
                      >
                        <RadioGroupItem value={option.value} />
                        <span className="font-serif text-lg">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedStatus === "confirmed" ? (
            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Places réservées</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={String(field.value)}
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value, 10))
                      }
                      className="grid gap-3 md:grid-cols-2"
                    >
                      {[
                        { value: "1", label: "Seul(e)" },
                        { value: "2", label: "En couple" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center gap-3 border px-4 py-4 transition-colors ${
                            variant === "invitation"
                              ? "border-white/12 bg-white/5 text-white hover:border-white/30"
                              : "border-primary/12 bg-transparent text-foreground hover:border-primary/35"
                          }`}
                        >
                          <RadioGroupItem value={option.value} />
                          <span className="font-serif text-lg">{option.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Un mot pour les mariés</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    className={textareaClassName}
                    placeholder="Si vous souhaitez laisser un message."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className={
              variant === "invitation"
                ? "w-full rounded-none bg-[#f0d7a8] py-6 text-[10px] uppercase tracking-[0.38em] text-[#3d2f20] hover:bg-[#e7cca0]"
                : "w-full rounded-none bg-primary py-6 text-[10px] uppercase tracking-[0.38em] text-primary-foreground hover:bg-foreground"
            }
          >
            {submitMutation.isPending ? "Envoi en cours..." : submitLabel}
          </Button>
        </form>
      </Form>
    </section>
  );
}
