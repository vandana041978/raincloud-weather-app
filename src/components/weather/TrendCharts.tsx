/**
 * Chart.js trends for temperature, humidity and wind over the next hours.
 * Rendered client-side only (canvas), behind a <ClientOnly> gate.
 */

import { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

import type { WeatherBundle } from "@/lib/weather-types";
import { localHour, toUnit, type Unit } from "@/lib/weather-utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

function baseOptions(suffix: string): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) => ` ${context.formattedValue}${suffix}`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: "currentColor",
        },
      },

      y: {
        grid: {
          color: "rgba(127, 127, 127, 0.18)",
        },
        ticks: {
          color: "currentColor",
          callback: (value) => `${value}${suffix}`,
        },
      },
    },

    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },

      point: {
        radius: 0,
        hitRadius: 12,
      },
    },
  };
}

export function TrendCharts({
  data,
  unit,
}: {
  data: WeatherBundle;
  unit: Unit;
}) {
  const timezoneOffset = data.location.timezoneOffset;

  const labels = useMemo(
    () =>
      data.hourly.map((hour) =>
        localHour(hour.dt, timezoneOffset),
      ),
    [data.hourly, timezoneOffset],
  );

  const series = [
    {
      title: `Temperature trend (°${unit})`,
      suffix: "°",
      values: data.hourly.map((hour) =>
        Math.round(toUnit(hour.temp, unit) * 10) / 10,
      ),
      color: "oklch(0.72 0.18 45)",
      fill: "oklch(0.72 0.18 45 / 0.18)",
    },

    {
      title: "Humidity trend (%)",
      suffix: "%",
      values: data.hourly.map((hour) => hour.humidity),
      color: "oklch(0.66 0.15 235)",
      fill: "oklch(0.66 0.15 235 / 0.18)",
    },

    {
      title:
        unit === "C"
          ? "Wind speed trend (km/h)"
          : "Wind speed trend (mph)",
      suffix: "",
      values: data.hourly.map((hour) => {
        const speed =
          unit === "C"
            ? hour.windSpeed * 3.6
            : hour.windSpeed * 2.237;

        return Math.round(speed * 10) / 10;
      }),
      color: "oklch(0.72 0.15 160)",
      fill: "oklch(0.72 0.15 160 / 0.18)",
    },
  ];

  return (
    <section
      aria-label="Weather trend charts"
      className="grid gap-4 lg:grid-cols-3"
    >
      {series.map((seriesItem) => (
        <figure
          key={seriesItem.title}
          className="glass p-5"
        >
          <figcaption className="text-sm font-semibold uppercase tracking-widest scene-muted">
            {seriesItem.title}
          </figcaption>

          <div className="mt-4 h-48 scene-muted">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    data: seriesItem.values,
                    borderColor: seriesItem.color,
                    backgroundColor: seriesItem.fill,
                    fill: true,
                  },
                ],
              }}
              options={baseOptions(seriesItem.suffix)}
            />
          </div>
        </figure>
      ))}
    </section>
  );
}

export default TrendCharts;