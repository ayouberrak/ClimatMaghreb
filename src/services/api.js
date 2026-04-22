const API_KEY = 'bd5e378503939ddaee76f12ad7a97608' 
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEO_URL = 'https://api.openweathermap.org/geo/1.0'

/**
 * Fetches current weather data for a given city name.
 * @param {string} city
 * @param {string} units - 'metric' | 'imperial' | 'standard'
 * @returns {Promise<object>}
 */
export async function fetchCurrentWeather(city, units = 'metric') {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${units}&lang=fr&appid=${API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new WeatherApiError(response.status, err.message || 'Erreur inconnue')
  }
  return response.json()
}

/**
 * Fetches current weather data by coordinates.
 * @param {number} lat
 * @param {number} lon
 * @param {string} units
 * @returns {Promise<object>}
 */
export async function fetchWeatherByCoords(lat, lon, units = 'metric') {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=fr&appid=${API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new WeatherApiError(response.status, err.message || 'Erreur inconnue')
  }
  return response.json()
}

/**
 * Fetches 5-day / 3-hour forecast for a given city.
 * @param {string} city
 * @param {string} units
 * @returns {Promise<object>}
 */
export async function fetchForecast(city, units = 'metric') {
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${units}&lang=fr&cnt=40&appid=${API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new WeatherApiError(response.status, err.message || 'Erreur inconnue')
  }
  return response.json()
}

/**
 * Fetches 5-day forecast by coordinates.
 * @param {number} lat
 * @param {number} lon
 * @param {string} units
 * @returns {Promise<object>}
 */
export async function fetchForecastByCoords(lat, lon, units = 'metric') {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=fr&cnt=40&appid=${API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new WeatherApiError(response.status, err.message || 'Erreur inconnue')
  }
  return response.json()
}

/**
 * Autocomplete city suggestions using the Geocoding API.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function fetchCitySuggestions(query, limit = 5) {
  if (!query || query.trim().length < 2) return []
  const url = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
  const response = await fetch(url)
  if (!response.ok) return []
  return response.json()
}

/**
 * Processes raw forecast list into daily summaries (one per day).
 * @param {Array} list - raw forecast list from API
 * @returns {Array}
 */
export function processDailyForecast(list) {
  const dayMap = {}

  list.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    const dateStr = date.toISOString().split('T')[0]

    if (!dayMap[dateStr]) {
      dayMap[dateStr] = {
        dateStr,
        dayLabel: dayKey,
        temps: [],
        icons: {},
        descriptions: {},
        humidity: [],
        windSpeed: [],
      }
    }

    dayMap[dateStr].temps.push(item.main.temp)
    dayMap[dateStr].humidity.push(item.main.humidity)
    dayMap[dateStr].windSpeed.push(item.wind.speed)

    const icon = item.weather[0].icon.replace('n', 'd') // prefer daytime icons
    dayMap[dateStr].icons[icon] = (dayMap[dateStr].icons[icon] || 0) + 1
    const desc = item.weather[0].description
    dayMap[dateStr].descriptions[desc] = (dayMap[dateStr].descriptions[desc] || 0) + 1
  })

  return Object.values(dayMap)
    .slice(0, 6)
    .map((day) => ({
      dateStr: day.dateStr,
      dayLabel: day.dayLabel,
      tempMin: Math.round(Math.min(...day.temps)),
      tempMax: Math.round(Math.max(...day.temps)),
      icon: getMostFrequent(day.icons),
      description: getMostFrequent(day.descriptions),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round((day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length) * 10) / 10,
    }))
}

function getMostFrequent(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

/**
 * Returns the OpenWeatherMap icon URL.
 * @param {string} iconCode
 * @param {'1x'|'2x'|'4x'} size
 */
export function getIconUrl(iconCode, size = '2x') {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`
}

/**
 * Custom error class for API errors.
 */
export class WeatherApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'WeatherApiError'
    this.status = status
  }

  get userMessage() {
    if (this.status === 404) return 'Ville introuvable. Vérifiez l\'orthographe et réessayez.'
    if (this.status === 401) return 'Clé API invalide. Contactez l\'administrateur.'
    if (this.status === 429) return 'Trop de requêtes. Veuillez patienter un moment.'
    if (this.status >= 500) return 'Serveur météo indisponible. Réessayez plus tard.'
    return `Erreur: ${this.message}`
  }
}
