/**
 * Search header: debounced city autocomplete, geolocation, unit and theme
 * toggles, plus recent-search and favourite chips.
 */
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LocateFixed, MapPin, Moon, Search, Star, Sun, X } from "lucide-react";
import { searchCities } from "@/lib/weather.functions";
import type { CitySuggestion } from "@/lib/weather-types";
import type { SavedCity } from "@/lib/weather-storage";
import type { Unit } from "@/lib/weather-utils";

interface Props {
  onSelectCity: (city: string) => void;
  onSelectCoords: (lat: number, lon: number) => void;
  onUseLocation: () => void;
  locating: boolean;
  unit: Unit;
  onToggleUnit: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  recents: SavedCity[];
  favorites: SavedCity[];
  onClearRecents: () => void;
}

export function SearchBar({
  onSelectCity,
  onSelectCoords,
  onUseLocation,
  locating,
  unit,
  onToggleUnit,
  theme,
  onToggleTheme,
  recents,
  favorites,
  onClearRecents,
}: Props) {
  const lookup = useServerFn(searchCities);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLFormElement>(null);

  // Debounced autocomplete (300ms) — keeps API usage and re-renders low.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(async () => {
      const rows = await lookup({ data: { query: q } });
      if (!cancelled) {
        setOptions(rows);
        setOpen(true);
        setActive(-1);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query, lookup]);

  // Close the listbox when focus moves outside the combobox.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (c: CitySuggestion) => {
    setQuery("");
    setOpen(false);
    onSelectCoords(c.lat, c.lon);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const picked = active >= 0 ? options[active] : undefined;
    if (picked) return choose(picked);
    if (query.trim()) {
      onSelectCity(query.trim());
      setQuery("");
      setOpen(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
        <form
          role="search"
          onSubmit={submit}
          className="relative min-w-0 flex-1"
          ref={boxRef}
        >
          <div className="glass flex items-center gap-2 px-4 py-2.5">
            <Search className="h-5 w-5 shrink-0 scene-muted" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => options.length && setOpen(true)}
              placeholder="Search any city…"
              aria-label="Search weather by city"
              role="combobox"
              aria-expanded={open}
              aria-controls="city-options"
              aria-autocomplete="list"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-base scene-text outline-none placeholder:opacity-60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="shrink-0 rounded-full p-1 scene-muted transition hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {open && options.length > 0 && (
            <ul
              id="city-options"
              role="listbox"
              className="glass absolute z-30 mt-2 w-full overflow-hidden p-1"
            >
              {options.map((c, i) => (
                <li key={`${c.lat}-${c.lon}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(c)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm scene-text transition ${
                      i === active ? "bg-white/40 dark:bg-white/10" : ""
                    }`}
                  >
                    <MapPin className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                    <span className="truncate">
                      {c.name}
                      {c.state ? `, ${c.state}` : ""} · {c.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onUseLocation}
            aria-label="Use my location"
            className="glass glass-hover flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium scene-text"
          >
            {locating ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <LocateFixed className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">My location</span>
          </button>

          <button
            type="button"
            onClick={onToggleUnit}
            aria-label={`Switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`}
            className="glass glass-hover px-3.5 py-2.5 text-sm font-semibold scene-text"
          >
            °{unit}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="glass glass-hover p-2.5 scene-text"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {(favorites.length > 0 || recents.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {favorites.map((c) => (
            <button
              key={`f-${c.lat}-${c.lon}`}
              type="button"
              onClick={() => onSelectCoords(c.lat, c.lon)}
              className="glass glass-hover flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium scene-text"
            >
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" aria-hidden="true" />
              {c.name}
            </button>
          ))}
          {recents.map((c) => (
            <button
              key={`r-${c.lat}-${c.lon}`}
              type="button"
              onClick={() => onSelectCoords(c.lat, c.lon)}
              className="glass glass-hover px-3 py-1.5 text-xs scene-muted"
            >
              {c.name}
            </button>
          ))}
          {recents.length > 0 && (
            <button
              type="button"
              onClick={onClearRecents}
              className="px-2 py-1.5 text-xs underline-offset-4 scene-muted hover:underline"
            >
              Clear history
            </button>
          )}
        </div>
      )}
    </div>
  );
}