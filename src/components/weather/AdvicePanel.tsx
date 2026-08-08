/**
 * Soft-content column: alerts, clothing suggestion, travel advice and a
 * rotating weather fact.
 */
import { AlertTriangle, Lightbulb, Plane, Shirt } from "lucide-react";
import type { WeatherBundle } from "@/lib/weather-types";
import { clothingAdvice, travelAdvice, weatherFact } from "@/lib/weather-utils";

function Tip({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="glass glass-hover p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest scene-muted">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed scene-text">{body}</p>
    </article>
  );
}

export function AdvicePanel({ data }: { data: WeatherBundle }) {
  return (
    <section aria-label="Advice and alerts" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.alerts.length > 0 && (
        <div className="glass border-amber-400/60 bg-amber-200/40 p-5 sm:col-span-2 lg:col-span-3 dark:bg-amber-500/15">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Weather alert
          </h3>
          {data.alerts.slice(0, 2).map((a) => (
            <div key={`${a.event}-${a.start}`} className="mt-2">
              <p className="font-medium scene-text">{a.event}</p>
              <p className="mt-1 line-clamp-4 text-sm scene-muted">{a.description}</p>
            </div>
          ))}
        </div>
      )}
      <Tip
        icon={<Shirt className="h-4 w-4" />}
        title="What to wear"
        body={clothingAdvice(data.current.feelsLike, data.current.condition)}
      />
      <Tip
        icon={<Plane className="h-4 w-4" />}
        title="Travel advice"
        body={travelAdvice(data)}
      />
      <Tip
        icon={<Lightbulb className="h-4 w-4" />}
        title="Did you know"
        body={weatherFact(data.current.dt / 3600)}
      />
    </section>
  );
}