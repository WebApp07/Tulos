"use client";
import { useState, useRef, useEffect } from "react";
import { Check, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, routing, type Locale } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const LanguageSwitcher = () => {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLocale = (nextLocale: Locale) => {
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className="relative"
      aria-label={t("ariaLabel")}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-darkColor hoverEffect"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline">{locale}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-9 z-50 min-w-36 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                role="option"
                aria-selected={l === locale}
                onClick={() => selectLocale(l)}
                className={`flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-lightBg ${
                  l === locale ? "text-darkColor" : "text-lightColor"
                }`}
              >
                <span>{localeNames[l]}</span>
                {l === locale && <Check className="w-4 h-4 text-darkBlue" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;