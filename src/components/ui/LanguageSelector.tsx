import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages: Array<{ code: string; label: string }> = [
  { code: "en-us", label: "English (US)" },
  { code: "es", label: "Español" },
  { code: "ha", label: "Hausa" },
  { code: "hi", label: "हिन्दी" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ar-om", label: "العربية (عُمان)" },
  { code: "pt-br", label: "Português (Brasil)" },
  { code: "pl", label: "Polski" },
  { code: "ar-eg", label: "العربية (مصر)" },
  { code: "fr", label: "Français" },
  { code: "en-nz", label: "English (NZ)" },
  { code: "en-za", label: "English (ZA)" }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const current =
    languages.find((l) => l.code.toLowerCase() === (i18n.language || "en").toLowerCase())?.label ||
    "English";

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    try {
      localStorage.setItem("i18nextLng", lng);
    } catch {}
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2 text-sm">
          {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lng) => (
          <DropdownMenuItem key={lng.code} onClick={() => changeLanguage(lng.code)}>
            {lng.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;


