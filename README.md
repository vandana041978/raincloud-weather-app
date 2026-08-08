# Skyglass — Weather Forecast Dashboard

A glassmorphic weather app: live conditions, hourly and multi-day forecasts,
air quality, trend charts and an interactive map for any city on earth.

## Features

- City search with debounced autocomplete (OpenWeatherMap geocoding)
- "Use my location" via the browser Geolocation API
- Current conditions: temperature gauge, feels-like, humidity, wind, pressure,
  visibility, UV index, sunrise/sunset and AQI
- 24-hour and multi-day forecasts with icons and min/max bars
- Chart.js trends for temperature, humidity and wind
- Leaflet map centred on the searched location
- Favourites and recent searches in Local Storage
- °C / °F toggle, light & dark mode, auto refresh every 5 minutes
- Weather alerts, clothing suggestions, travel advice and weather facts
- Animated backgrounds per condition: sun, rain, snow, clouds, stars, lightning

## Setup

1. Create a free API key at <https://openweathermap.org/api>.
2. Store it as the `OPENWEATHER_API_KEY` secret (Project Settings → Secrets).
   It is read only inside server functions, so it never reaches the browser.
3. Install and run:

   ```bash
   bun install
   bun run dev
   ```

### One Call 3.0 (optional)

With a One Call 3.0 subscription the app serves an 8-day daily forecast,
48-hour hourly data, UV index and official government alerts. Without it,
it falls back automatically to the free 2.5 endpoints (5-day / 3-hour data,
no UV index or alerts) and says so in the footer.

## Structure

```text
src/
├── routes/index.tsx                  # page composition + state
├── lib/
│   ├── weather.functions.ts          # server RPC (hides the API key)
│   ├── weather.server.ts             # OpenWeatherMap client + normalisation
│   ├── weather-types.ts              # shared DTOs
│   ├── weather-utils.ts              # units, formatting, advice, scenes
│   └── weather-storage.ts            # Local Storage (favourites, recents)
└── components/weather/
    ├── AnimatedBackground.tsx        # condition-driven scene animations
    ├── SearchBar.tsx                 # autocomplete, geolocation, toggles
    ├── CurrentPanel.tsx              # hero card + animated gauge
    ├── MetricsGrid.tsx               # progress-bar detail metrics
    ├── ForecastPanels.tsx            # hourly strip + daily outlook
    ├── TrendCharts.tsx               # Chart.js trends (client only)
    ├── WeatherMap.tsx                # Leaflet map (client only)
    └── AdvicePanel.tsx               # alerts, clothing, travel, facts
```

All colours, glass surfaces and animations are design tokens in
`src/styles.css`; components never hardcode raw colour utilities.

## Accessibility

Semantic landmarks, ARIA combobox/listbox search with arrow-key navigation,
labelled progress bars, alert roles for errors, visible focus styles and
`prefers-reduced-motion` support.