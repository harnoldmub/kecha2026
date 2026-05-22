export type PhoneCountry = {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
};

export const phoneCountries: PhoneCountry[] = [
  { code: "BE", dialCode: "+32", flag: "🇧🇪", name: "Belgique" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷", name: "France" },
  { code: "CD", dialCode: "+243", flag: "🇨🇩", name: "RD Congo" },
  { code: "CG", dialCode: "+242", flag: "🇨🇬", name: "Congo" },
  { code: "AO", dialCode: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "RW", dialCode: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "BI", dialCode: "+257", flag: "🇧🇮", name: "Burundi" },
  { code: "UG", dialCode: "+256", flag: "🇺🇬", name: "Ouganda" },
  { code: "KE", dialCode: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "TZ", dialCode: "+255", flag: "🇹🇿", name: "Tanzanie" },
  { code: "ZA", dialCode: "+27", flag: "🇿🇦", name: "Afrique du Sud" },
  { code: "CM", dialCode: "+237", flag: "🇨🇲", name: "Cameroun" },
  { code: "CI", dialCode: "+225", flag: "🇨🇮", name: "Côte d’Ivoire" },
  { code: "SN", dialCode: "+221", flag: "🇸🇳", name: "Sénégal" },
  { code: "NG", dialCode: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "MA", dialCode: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "TN", dialCode: "+216", flag: "🇹🇳", name: "Tunisie" },
  { code: "DZ", dialCode: "+213", flag: "🇩🇿", name: "Algérie" },
  { code: "ES", dialCode: "+34", flag: "🇪🇸", name: "Espagne" },
  { code: "IT", dialCode: "+39", flag: "🇮🇹", name: "Italie" },
  { code: "CH", dialCode: "+41", flag: "🇨🇭", name: "Suisse" },
  { code: "LU", dialCode: "+352", flag: "🇱🇺", name: "Luxembourg" },
  { code: "NL", dialCode: "+31", flag: "🇳🇱", name: "Pays-Bas" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪", name: "Allemagne" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
  { code: "IE", dialCode: "+353", flag: "🇮🇪", name: "Irlande" },
  { code: "PT", dialCode: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "États-Unis" },
  { code: "CA", dialCode: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brésil" },
  { code: "AE", dialCode: "+971", flag: "🇦🇪", name: "Émirats arabes unis" },
  { code: "QA", dialCode: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "SA", dialCode: "+966", flag: "🇸🇦", name: "Arabie saoudite" },
];

export const defaultPhoneCountry = phoneCountries.find(
  (country) => country.code === "CD",
) || phoneCountries[0];

export function getPhoneCountryFromValue(phone: string | null | undefined) {
  const normalizedPhone = (phone || "").trim();

  if (!normalizedPhone) {
    return {
      country: defaultPhoneCountry,
      phoneNumber: "",
    };
  }

  const matchingCountry = [...phoneCountries]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((country) => normalizedPhone.startsWith(country.dialCode));

  if (!matchingCountry) {
    return {
      country: defaultPhoneCountry,
      phoneNumber: normalizedPhone,
    };
  }

  return {
    country: matchingCountry,
    phoneNumber: normalizedPhone
      .slice(matchingCountry.dialCode.length)
      .trim(),
  };
}

export function formatInternationalPhone(
  dialCode: string,
  phoneNumber: string,
) {
  const normalizedNumber = phoneNumber.trim();

  if (!normalizedNumber) {
    return "";
  }

  return `${dialCode} ${normalizedNumber}`;
}
