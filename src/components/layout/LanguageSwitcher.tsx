import { useTranslation, type Language } from "@/i18n";
import { cn } from "@/lib/utils";

function UkFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" className={cn("rounded-[2px] overflow-hidden shrink-0 shadow-2xs", className)} aria-hidden="true">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
      <path fill="#C8102E" d="m424 288 216 161v31h-40L380 308l44-20zM640 0v10L440 160h44L640 10V0zM0 480v-10l200-150h-44L0 470v10zM216 192 0 31V0h40l220 164-44 28z" />
      <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z" />
      <path fill="#C8102E" d="M280 0h80v480h-80zM0 200h640v80H0z" />
    </svg>
  );
}

function CzFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" className={cn("rounded-[2px] overflow-hidden shrink-0 shadow-2xs", className)} aria-hidden="true">
      <path fill="#d7141a" d="M0 240h640v240H0z" />
      <path fill="#fff" d="M0 0h640v240H0z" />
      <path fill="#11457e" d="M360 240 0 0v480z" />
    </svg>
  );
}

interface LanguageOption {
  code: Language;
  label: string;
  icon: typeof UkFlagIcon;
  title: string;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const languages: LanguageOption[] = [
    {
      code: "en",
      label: "EN",
      icon: UkFlagIcon,
      title: "English",
    },
    {
      code: "cs",
      label: "CZ",
      icon: CzFlagIcon,
      title: "Čeština",
    },
  ];

  return (
    <div className="flex items-center bg-muted/60 p-0.5 rounded-md border text-xs h-8">
      {languages.map(({ code, label, icon: FlagIcon, title }) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all duration-150 cursor-pointer ${
              isActive ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
            title={title}
          >
            <FlagIcon className="w-3.5 h-2.5 border border-black/10 dark:border-white/20" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
