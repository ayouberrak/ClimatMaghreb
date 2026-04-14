const GEOCODE_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

const WEATHER_CODES = {
  0: { label: 'Ciel degage', icon: '☀️' },
  1: { label: 'Principalement degage', icon: '🌤️' },
  2: { label: 'Partiellement nuageux', icon: '⛅' },
  3: { label: 'Nuageux', icon: '☁️' },
  45: { label: 'Brouillard', icon: '🌫️' },
  48: { label: 'Brouillard givrant', icon: '🌫️' },
  51: { label: 'Bruine legere', icon: '🌦️' },
  53: { label: 'Bruine', icon: '🌦️' },
  55: { label: 'Bruine dense', icon: '🌧️' },
  61: { label: 'Pluie legere', icon: '🌦️' },
  63: { label: 'Pluie', icon: '🌧️' },
  65: { label: 'Forte pluie', icon: '⛈️' },
  71: { label: 'Neige legere', icon: '🌨️' },
  73: { label: 'Neige', icon: '🌨️' },
  75: { label: 'Forte neige', icon: '❄️' },
  80: { label: 'Averses legeres', icon: '🌦️' },
  81: { label: 'Averses', icon: '🌧️' },
  82: { label: 'Forte averse', icon: '⛈️' },
  95: { label: 'Orage', icon: '⛈️' },
}

function getWeatherMeta(code) {
  return WEATHER_CODES[code] ?? { label: 'Conditions variables', icon: '🌈' }
}

function getUvLabel(uvIndex) {
  if (uvIndex < 3) {
    return 'Faible'
  }

  if (uvIndex < 6) {
    return 'Modere'
  }

  if (uvIndex < 8) {
    return 'Eleve'
  }

  return 'Tres eleve'
}

function getAlertMessage(description, windSpeed) {
  if (description.includes('Pluie') || description.includes('averse')) {
    return {
      title: 'Vigilance pluie',
      message: 'Des precipitations sont possibles. Pensez a verifier vos deplacements.',
    }
  }

  if (windSpeed >= 30) {
    return {
      title: 'Vent soutenu',
      message: 'Le vent se renforce. Une veste legere est recommandee a l exterieur.',
    }
  }

  return {
    title: 'Conditions stables',
    message: 'La meteo reste globalement calme pour les prochaines heures.',
  }
}

function getWindDirection(degrees) {
  const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest']
  const index = Math.round(degrees / 45) % directions.length
  return directions[index]
}

function formatDayLabel(dateString, index) {
  if (index === 0) {
    return 'Aujourd hui'
  }

  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(new Date(dateString))
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Le service meteo est temporairement indisponible.')
  }

  return response.json()
}

async function geocodeCity(query, count = 1) {
  const url = new URL(GEOCODE_ENDPOINT)
  url.searchParams.set('name', query)
  url.searchParams.set('count', String(count))
  url.searchParams.set('language', 'fr')
  url.searchParams.set('format', 'json')

  const data = await fetchJson(url)

  if (!data.results?.length) {
    throw new Error('Ville non trouvee. Verifiez l orthographe puis reessayez.')
  }

  return data.results
}

export async function fetchCitySuggestions(query) {
  const results = await geocodeCity(query, 5)

  return results.map((city) => {
    const parts = [city.name, city.admin1, city.country].filter(Boolean)
    return parts.join(', ')
  })
}

export async function fetchWeatherByCity(query) {
  const [city] = await geocodeCity(query, 1)
  const url = new URL(WEATHER_ENDPOINT)

  url.searchParams.set('latitude', city.latitude)
  url.searchParams.set('longitude', city.longitude)
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'visibility',
      'uv_index',
    ].join(','),
  )
  url.searchParams.set(
    'daily',
    ['weather_code', 'temperature_2m_max', 'temperature_2m_min'].join(','),
  )
  url.searchParams.set('forecast_days', '7')
  url.searchParams.set('timezone', 'auto')

  const data = await fetchJson(url)
  const currentMeta = getWeatherMeta(data.current.weather_code)
  const alert = getAlertMessage(currentMeta.label, Math.round(data.current.wind_speed_10m))

  return {
    location: {
      name: city.name,
      region: city.admin1 || city.country,
      country: city.country,
      latitude: Number(city.latitude).toFixed(2),
      longitude: Number(city.longitude).toFixed(2),
    },
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: getWindDirection(data.current.wind_direction_10m),
      visibility: Math.round((data.current.visibility ?? 0) / 1000),
      uvIndex: Math.round(data.current.uv_index ?? 0),
      uvLabel: getUvLabel(data.current.uv_index ?? 0),
      description: currentMeta.label,
      icon: currentMeta.icon,
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
    },
    alert,
    forecast: data.daily.time.map((date, index) => {
      const meta = getWeatherMeta(data.daily.weather_code[index])

      return {
        date,
        label: formatDayLabel(date, index),
        min: Math.round(data.daily.temperature_2m_min[index]),
        max: Math.round(data.daily.temperature_2m_max[index]),
        description: meta.label,
        icon: meta.icon,
      }
    }),
  }
}
