import { ref, computed } from 'vue'
import {
  fetchCurrentWeather,
  fetchWeatherByCoords,
  fetchForecast,
  fetchForecastByCoords,
  processDailyForecast,
  WeatherApiError,
} from '../services/api.js'

/**
 * Composable centralizing all weather data state and actions.
 */
export function useWeather() {
  const currentWeather = ref(null)
  const forecast = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastSearched = ref('')
  const units = ref('metric') // 'metric' | 'imperial'

  const unitLabel = computed(() => (units.value === 'metric' ? '°C' : '°F'))
  const windUnitLabel = computed(() => (units.value === 'metric' ? 'km/h' : 'mph'))

  /**
   * Converts wind speed to km/h if metric.
   * OWM returns m/s in metric — multiply by 3.6 for km/h.
   */
  function formatWindSpeed(speedMs) {
    if (units.value === 'metric') return Math.round(speedMs * 3.6)
    return Math.round(speedMs) // imperial returns mph directly
  }

  async function searchCity(city) {
    if (!city || !city.trim()) return
    isLoading.value = true
    error.value = null
    try {
      const [weather, forecastData] = await Promise.all([
        fetchCurrentWeather(city, units.value),
        fetchForecast(city, units.value),
      ])
      currentWeather.value = weather
      forecast.value = processDailyForecast(forecastData.list)
      lastSearched.value = city
    } catch (err) {
      currentWeather.value = null
      forecast.value = []
      error.value = err instanceof WeatherApiError ? err.userMessage : 'Une erreur inattendue s\'est produite.'
    } finally {
      isLoading.value = false
    }
  }

  async function searchByLocation() {
    if (!navigator.geolocation) {
      error.value = 'La géolocalisation n\'est pas supportée par votre navigateur.'
      return
    }
    isLoading.value = true
    error.value = null
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords
          const [weather, forecastData] = await Promise.all([
            fetchWeatherByCoords(lat, lon, units.value),
            fetchForecastByCoords(lat, lon, units.value),
          ])
          currentWeather.value = weather
          forecast.value = processDailyForecast(forecastData.list)
          lastSearched.value = weather.name
        } catch (err) {
          error.value = err instanceof WeatherApiError ? err.userMessage : 'Impossible d\'obtenir la météo pour votre position.'
        } finally {
          isLoading.value = false
        }
      },
      () => {
        error.value = 'Accès à la géolocalisation refusé. Veuillez chercher une ville manuellement.'
        isLoading.value = false
      }
    )
  }

  async function toggleUnits() {
    units.value = units.value === 'metric' ? 'imperial' : 'metric'
    if (lastSearched.value) {
      await searchCity(lastSearched.value)
    }
  }

  return {
    currentWeather,
    forecast,
    isLoading,
    error,
    lastSearched,
    units,
    unitLabel,
    windUnitLabel,
    formatWindSpeed,
    searchCity,
    searchByLocation,
    toggleUnits,
  }
}
