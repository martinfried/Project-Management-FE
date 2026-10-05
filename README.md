# Frontend – Evidence projektů a členů týmů

Frontendová část fullstack aplikace pro evidenci projektů, lidí a týmů. Klientskou aplikaci jsem postavil jako Single Page Application v Reactu a TypeScriptu, pro rychlý dev server a build jsem zvolil Vite a o styling se stará Tailwind CSS s komponentami ze shadcn/ui.

---

## Co aplikace dělá a jak jsem ji navrhl

Aplikace funguje jako webové rozhraní napojené na backendové REST API. Chtěl jsem, aby bylo UI čisté, svižné a responzivní jak na velkém monitoru, tak na displeji mobilního telefonu.

### Přehled funkcionality

- **Správa projektů**:
  - Tabulka s možností řadit data podle jakéhokoliv sloupce – ID, názvu, stavu, termínů i počtu lidí.
  - Filtrování podle stavu `Planned`, `In Progress`, `Completed`, `On Hold` a search input s debounce prodlevou okolo 200 ms, aby se neposílal request na server při každém stisku klávesy.
  - Tlačítko pro rychlý posun projektu do dalšího stavu přímo z řádku v tabulce.
  - Modální dialogy pro založení a editaci projektu s kontrolou termínů.
  - Detail projektu: ukazuje přímo přiřazené osoby, přiřazené týmy a hlavně celkový složený seznam všech participants s rozlišením, jak se na projekt dostali – přímo, přes tým nebo kombinovaně. Lidi i týmy lze navíc přímo v detail dialogu rovnou přiřazovat nebo odebírat.

- **Správa osob**:
  - Seznam lidí s kontaktními údaji, pracovní rolí a zařazením do týmu.
  - Vyhledávání podle jména, e-mailu i pozice.
  - Formulář pro přidání a editaci člověka s výběrem týmu z přehledného selectu.
  - Detail osoby se seznamem všech projektů, na kterých daný člověk zrovna pracuje.

- **Správa týmů**:
  - Evidence pracovních týmů.
  - V detailu týmu jde snadno spravovat jeho složení, tedy přidávat a odebírat členy, i propojovat tým s projekty.

- **Design, responzivita a UX**:
  - **Plně responzivní layout**: Rozvržení jsem navrhl mobile-first tak, aby se pohodlně ovládalo na mobilu, tabletu i desktopu. Tabulky mají horizontal scroll, modály i formuláře se fluidně přizpůsobují šířce displeje a akční tlačítka se na menších obrazovkách logicky stackují.
  - **Dark mode a Light mode**: V headeru je toggle mezi světlým a tmavým motivem. Vybraný režim se automaticky ukládá do `localStorage`, takže preference zůstává zachovaná i po zavření browseru.
  - **Dva jazyky**: Celé UI je kompletně lokalizované do češtiny i angličtiny s možností přepnout jazyk jedním klikem v hlavičce bez nutnosti reloadu stránky.
  - **DB reset button ve footeru**: Přímo do patičky aplikace jsem přidal praktické tlačítko pro reset databáze. Na jeden klik zavolá endpoint `/api/database/init` a vrátí celou databázi do výchozího stavu se seed daty, což je ideální pro testování a demo aplikace.
  - **Toast notifikace**: Feedback po provedených mutacích i chybové hlášky z API se zobrazují přes toast zprávy knihovny Sonner.

---

## OpenAPI a typová bezpečnost

Jako velké plus bych chtěl vypíchnout zapojení **OpenAPI**. Místo toho, abych na frontendu ručně přepisoval TypeScript typy a interfaces z backendu, kde hrozí překlep nebo přehlédnutí změny fieldu, jsem využil specifikaci `openapi.json` přímo ze Symfony backendu.

Pomocí knihovny `openapi-fetch` a vygenerovaných TypeScript definic mám volání API kompletně type-safe:
- TypeScript přesně ví, jaké query parametry a payload který endpoint bere a jaký shape dat vrátí response.
- Autocomplete v IDE napovídá dostupné endpointy i property.
- Jakmile se na backendu změní schéma, frontend mě na breaking change při kompilaci okamžitě upozorní.

---

## E2E testování s Playwrightem

Abych měl jistotu, že aplikace bezchybně šlape v reálném browseru, napsal jsem sadu **E2E testů v Playwrightu**:

- Testy pokrývají kompletní CRUD operace pro projekty, osoby i týmy.
- V souboru `project-lifecycle.spec.ts` je pokročilý test celého lifecycle, který simuluje typický flow z praxe: vytvoření týmu, přidání lidí, start projektu, přiřazení týmu i direct assignment jednotlivce, odebrání týmu a kontrola, že člověk s přímým přiřazením na projektu správně zůstává, a následný cleanup.
- Testují sorting sloupců, debounced search i state transition tlačítek.

### Jak spustit testy v Playwrightu

Před spuštěním testů je potřeba mít na pozadí spuštěný backend na portu 8000 a frontend dev server:

```bash
# 1. Spuštění všech testů v headless režimu
npm run test:e2e
# nebo přímo:
npx playwright test

# 2. Spuštění v interaktivním UI režimu pro krokování a debugging
npx playwright test --ui

# 3. Zobrazení detailního HTML reportu z posledního test runu
npx playwright show-report
```

---

## Tech stack a knihovny

- **React 19**: Moderní základ pro UI komponenty a rendering.
- **TypeScript 5.x**: Striktní typování pro spolehlivý kód bez runtime chyb.
- **Vite 8**: Bleskový vývojový server a produkční bundler.
- **Tailwind CSS 4**: Utility-first stylování s podporou dark mode a responzivity.
- **shadcn/ui & Radix UI primitives**: Přístupné komponenty jako dialogy, selecty, tlačítka nebo badges.
- **TanStack Table v8**: Klientský sorting, stránkování a správa stavu tabulek.
- **openapi-fetch**: Lehký type-safe HTTP klient napojený na vygenerované OpenAPI schéma.
- **Lucide React**: Čistá sada ikon pro celé rozhraní.
- **Sonner**: Toast notifikace pro uživatelský feedback.
- **Playwright**: Framework pro automatizované E2E testy v reálném prohlížeči.
- **Nginx**: Web server v Docker kontejneru pro produkční serving se správným SPA fallbackem.

---

## Struktura projektu

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/              # Header, navigace, footer s tlačítkem resetu DB, theme toggle
│   │   ├── projects/            # Dialogy pro detail, formuláře a toolbary projektů
│   │   ├── persons/             # Dialogy a formuláře pro správu osob
│   │   ├── teams/               # Dialogy a formuláře pro správu týmů
│   │   └── ui/                  # Znovupoužitelné UI prvky jako buttons, dialogs, tables
│   ├── hooks/                   # Vlastní hooky jako useDebouncedEffect
│   ├── i18n/                    # Překlady a lokalizace pro češtinu a angličtinu
│   ├── pages/                   # Stránky ProjectsPage, PersonsPage, TeamsPage
│   ├── services/api.ts          # Type-safe API klient pro komunikaci s backendem
│   ├── types/                   # Datové typy odvozené z OpenAPI
│   ├── App.tsx                  # Klientské routování a app layout
│   └── main.tsx                 # Entrypoint aplikace
├── e2e/                         # Playwright E2E testy
│   ├── fixtures.ts              # Page Object modely a helpery pro testy
│   ├── project-lifecycle.spec.ts# Komplexní test průchodu životním cyklem projektu
│   ├── projects.spec.ts         # Testy projektů
│   ├── persons.spec.ts          # Testy osob
│   └── teams.spec.ts            # Testy týmů
├── Dockerfile                   # Multi-stage Dockerfile pro Node build a Nginx
├── docker-compose.yml           # Compose setup pro lokální běh frontendu v kontejneru
├── nginx.conf                   # Konfigurace Nginxu pro SPA routing
└── package.json                 # Skripty a npm dependencies
```

---

## Jak aplikaci spustit

### Spuštění přes Docker Compose

Pokud máte nainstalovaný Docker, stačí zadat:

```bash
cd frontend
docker compose up --build
```

Aplikace naběhne na adrese:
`http://localhost:3000`

Předpokládá se, že backend běží na `http://localhost:8000/api`.

Vypnutí kontejneru:
```bash
docker compose down
```

### Lokální spuštění bez Dockeru

Požadavky: Node.js 20+ a npm.

1. Instalace závislostí:
   ```bash
   cd frontend
   npm install
   ```

2. Kontrola adresy backendu v `.env` s výchozí hodnotou `http://localhost:8000/api`:
   ```bash
   VITE_API_URL=http://localhost:8000/api
   ```

3. Spuštění vývojového serveru:
   ```bash
   npm run dev
   ```

V terminálu se zobrazí lokální URL, obvykle `http://localhost:5173` nebo `http://localhost:3000`.

---

## Kontrola kódu

```bash
# Spuštění linteru
npm run lint

# Automatická oprava formátování
npm run lint:fix

# Kontrola TypeScript typů a sestavení produkčního buildu
npm run build
```

---

## Poznámka k vývoji

Při vývoji tohoto projektu jsem jako asistenta využíval umělou inteligenci, kterou jsem aktivně promptoval, moderoval a usměrňoval.
