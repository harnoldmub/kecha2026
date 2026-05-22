import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  defaultPhoneCountry,
  phoneCountries,
  type PhoneCountry,
} from "@/lib/phoneCountries";

type PhoneFieldProps = {
  countryDialCode: string;
  onCountryDialCodeChange: (dialCode: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  className?: string;
  variant?: "light" | "dark";
};

export default function PhoneField({
  countryDialCode,
  onCountryDialCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  className,
  variant = "light",
}: PhoneFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedCountry =
    phoneCountries.find((country) => country.dialCode === countryDialCode) ||
    defaultPhoneCountry;

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return phoneCountries;
    }

    return phoneCountries.filter((country) =>
      [country.name, country.dialCode, country.code]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  function handleCountrySelect(country: PhoneCountry) {
    onCountryDialCodeChange(country.dialCode);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-3">
        <div className="relative w-[148px] shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-none border px-3 text-left transition-colors",
              variant === "dark"
                ? "border-white/15 bg-white/5 text-white hover:border-white/35"
                : "border-primary/15 bg-transparent text-foreground hover:border-primary/35",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span
                className={cn(
                  "truncate text-sm",
                  variant === "dark" ? "text-white" : "text-foreground",
                )}
              >
                {selectedCountry.dialCode}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4",
                variant === "dark" ? "text-white/50" : "text-foreground/50",
              )}
              strokeWidth={1.6}
            />
          </button>

          {isOpen ? (
            <div className="absolute z-30 mt-2 w-[300px] max-w-[calc(100vw-3rem)] border border-primary/15 bg-white shadow-xl">
              <div className="border-b border-primary/10 p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                  <Input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un pays..."
                    className="h-10 rounded-none border-primary/10 pl-9 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {filteredCountries.map((country) => {
                  const isSelected = country.dialCode === selectedCountry.dialCode;

                  return (
                    <button
                      key={`${country.code}-${country.dialCode}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="flex w-full items-center justify-between px-3 py-3 text-left transition-colors hover:bg-primary/5"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg leading-none">{country.flag}</span>
                        <span>
                          <span className="block text-sm text-foreground">
                            {country.name}
                          </span>
                          <span className="block text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                            {country.dialCode}
                          </span>
                        </span>
                      </span>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" strokeWidth={1.8} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <Input
          value={phoneNumber}
          onChange={(event) =>
            onPhoneNumberChange(event.target.value.replace(/[^\d\s()-]/g, ""))
          }
          className={cn(
            "h-12 rounded-none",
            variant === "dark"
              ? "border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/20"
              : "border-primary/15 bg-transparent focus-visible:ring-primary/20",
          )}
          placeholder="Numéro de téléphone"
        />
      </div>
    </div>
  );
}
