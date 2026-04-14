<script setup>
import { computed, onMounted, ref } from 'vue'
import SearchBar from './components/SearchBar.vue'
import { fetchWeatherByCity, fetchCitySuggestions } from './services/api'

const query = ref('')
const weather = ref(null)
const loading = ref(false)
const error = ref('')
const inputError = ref('')
const suggestions = ref([])

const statCards = computed(() => {
  if (!weather.value) {
    return []
  }

  return [
    {
      label: 'Humidity',
      value: `${weather.value.current.humidity}%`,
      detail: 'Current humidity',
    },
    {
      label: 'Wind',
      value: `${weather.value.current.windSpeed} km/h`,
      detail: weather.value.current.windDirection,
    },
    {
      label: 'Visibility',
      value: `${weather.value.current.visibility} km`,
      detail: 'Outdoor conditions',
    },
    {
      label: 'UV Index',
      value: `${weather.value.current.uvIndex}`,
      detail: weather.value.current.uvLabel,
    },
  ]
})

function validateQuery(value) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Veuillez saisir une ville.'
  }

  if (trimmedValue.length < 2) {
    return 'Saisissez au moins 2 caractères.'
  }

  if (!/^[\p{L}\s.'-]+$/u.test(trimmedValue)) {
    return 'Utilisez uniquement des lettres, espaces, apostrophes ou tirets.'
  }

  return ''
}

async function loadSuggestions(value) {
  const validationMessage = validateQuery(value)

  if (validationMessage || value.trim().length < 3) {
    suggestions.value = []
    return
  }

  try {
    suggestions.value = await fetchCitySuggestions(value)
  } catch {
    suggestions.value = []
  }
}

function handleInput(value) {
  query.value = value
  inputError.value = value ? validateQuery(value) : ''
  error.value = ''
  loadSuggestions(value)
}

function handleChange(value) {
  query.value = value.trimStart()
  inputError.value = query.value ? validateQuery(query.value) : ''
}

async function handleSearch(submittedValue) {
  const nextQuery = submittedValue.trim()

  query.value = nextQuery
  inputError.value = validateQuery(nextQuery)
  error.value = ''

  if (inputError.value) {
    suggestions.value = []
    return
  }

  loading.value = true
  suggestions.value = []

  try {
    weather.value = await fetchWeatherByCity(nextQuery)
  } catch (searchError) {
    weather.value = null
    error.value = searchError instanceof Error ? searchError.message : 'Recherche impossible.'
  } finally {
    loading.value = false
  }
}

async function handleSuggestionSelect(city) {
  query.value = city
  await handleSearch(city)
}

onMounted(() => {
  handleSearch('Casablanca')
})
</script>

<template>
  <div class="app-shell">
    <div class="background-orb background-orb-left"></div>
    <div class="background-orb background-orb-right"></div>

    <header class="topbar">
      <div>
        <p class="eyebrow">ClimatMaghreb</p>
        <h1 class="brand">Aether Weather</h1>
      </div>

      <SearchBar
        :model-value="query"
        :loading="loading"
        :error-message="inputError"
        :suggestions="suggestions"
        @update:model-value="handleInput"
        @change="handleChange"
        @submit="handleSearch"
        @select-suggestion="handleSuggestionSelect"
      />
    </header>

    <main class="dashboard" v-if="weather">
      <section class="hero-card">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-copy">
            <p class="eyebrow">Live · {{ weather.location.country }}</p>
            <h2>{{ weather.location.name }}</h2>
            <p class="hero-description">{{ weather.current.description }}</p>
          </div>

          <div class="hero-temperature">
            <p class="temperature">{{ weather.current.temperature }}°</p>
            <p class="temperature-meta">
              H: {{ weather.current.tempMax }}° · L: {{ weather.current.tempMin }}° ·
              Ressenti {{ weather.current.feelsLike }}°
            </p>
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <article v-for="card in statCards" :key="card.label" class="panel stat-card">
          <p class="panel-label">{{ card.label }}</p>
          <p class="panel-value">{{ card.value }}</p>
          <p class="panel-detail">{{ card.detail }}</p>
        </article>

        <article class="panel alert-card">
          <p class="panel-label">Weather Alert</p>
          <h3>{{ weather.alert.title }}</h3>
          <p class="panel-detail">{{ weather.alert.message }}</p>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel map-card">
          <div class="map-grid"></div>
          <div class="map-glow"></div>
          <div class="map-labels">
            <p class="panel-label">Precipitation Map</p>
            <p class="panel-detail">Coordonnées : {{ weather.location.latitude }}, {{ weather.location.longitude }}</p>
          </div>
        </article>

        <article class="panel guide-card">
          <p class="panel-label">Safety Guide</p>
          <ul>
            <li>Hydratez-vous régulièrement si l'indice UV reste élevé.</li>
            <li>Prévoyez une couche légère si le vent se renforce.</li>
            <li>Consultez les prévisions des prochains jours avant de sortir.</li>
          </ul>
        </article>
      </section>

      <section class="forecast-section">
        <div class="section-heading">
          <h3>Prévisions sur 7 jours</h3>
          <p>{{ weather.location.region }}</p>
        </div>

        <div class="forecast-grid">
          <article
            v-for="day in weather.forecast"
            :key="day.date"
            class="panel forecast-card"
          >
            <p class="panel-label">{{ day.label }}</p>
            <p class="forecast-icon">{{ day.icon }}</p>
            <p class="forecast-temp">{{ day.max }}°</p>
            <p class="panel-detail">{{ day.min }}° · {{ day.description }}</p>
          </article>
        </div>
      </section>
    </main>

    <section v-else class="empty-state panel">
      <p class="panel-label">Recherche météo</p>
      <h2>{{ loading ? 'Chargement en cours...' : 'Aucune ville sélectionnée' }}</h2>
      <p class="panel-detail">
        Recherchez une ville pour afficher la météo actuelle et les prévisions.
      </p>
    </section>

    <p v-if="error" class="api-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.background-orb {
  position: fixed;
  z-index: 0;
  border-radius: 50%;
  filter: blur(16px);
  pointer-events: none;
}

.background-orb-left {
  top: 12%;
  left: -120px;
  width: 280px;
  height: 280px;
  background:
    radial-gradient(circle at center, rgba(109, 124, 255, 0.4) 0%, rgba(109, 124, 255, 0) 72%);
}

.background-orb-right {
  top: 4%;
  right: -140px;
  width: 440px;
  height: 440px;
  background:
    radial-gradient(circle at center, rgba(111, 155, 255, 0.5) 0%, rgba(111, 155, 255, 0) 70%);
}

.topbar,
.dashboard,
.empty-state,
.api-error {
  position: relative;
  z-index: 1;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.eyebrow {
  color: var(--color-text-soft);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand {
  font-size: clamp(1.7rem, 2vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.04em;
}

.dashboard {
  display: grid;
  gap: 1.2rem;
}

.hero-card {
  position: relative;
  min-height: 340px;
  border-radius: 2rem;
  overflow: hidden;
  padding: 2rem;
  background:
    linear-gradient(180deg, rgba(10, 16, 28, 0.12) 0%, rgba(10, 16, 28, 0.82) 100%),
    linear-gradient(135deg, #9fb1c6 0%, #4e6b8b 34%, #24344a 72%, #111319 100%);
  box-shadow: var(--shadow-panel);
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.42), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 55%);
}

.hero-overlay {
  position: absolute;
  inset: auto 0 0;
  height: 45%;
  background: linear-gradient(180deg, rgba(7, 10, 16, 0) 0%, rgba(7, 10, 16, 0.68) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  height: 100%;
}

.hero-copy h2 {
  font-size: clamp(3rem, 8vw, 5.3rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.06em;
  margin: 0.55rem 0;
}

.hero-description {
  color: #bccdff;
  font-size: 1.2rem;
}

.hero-temperature {
  text-align: right;
}

.temperature {
  font-size: clamp(4rem, 9vw, 6rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.08em;
}

.temperature-meta {
  color: var(--color-text-soft);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
}

.panel {
  border: 1px solid rgba(159, 177, 255, 0.1);
  border-radius: 1.6rem;
  background: var(--panel-bg);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-panel);
}

.stat-card,
.alert-card,
.guide-card,
.forecast-card {
  padding: 1.2rem;
}

.panel-label {
  color: var(--color-text-soft);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.panel-value {
  margin-top: 1rem;
  font-size: 2rem;
  font-weight: 700;
}

.panel-detail {
  margin-top: 0.35rem;
  color: var(--color-text-soft);
}

.alert-card h3 {
  margin-top: 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 1rem;
}

.map-card {
  position: relative;
  min-height: 260px;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(104, 153, 255, 0.2), transparent 30%),
    linear-gradient(rgba(80, 112, 160, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80, 112, 160, 0.16) 1px, transparent 1px),
    linear-gradient(135deg, rgba(16, 23, 36, 0.55), rgba(12, 17, 26, 0.95));
  background-size:
    auto,
    38px 38px,
    38px 38px,
    auto;
}

.map-glow {
  position: absolute;
  top: 34%;
  left: 52%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #9db6ff;
  box-shadow: 0 0 0 10px rgba(157, 182, 255, 0.14), 0 0 32px rgba(157, 182, 255, 0.8);
}

.map-labels {
  position: absolute;
  left: 1.2rem;
  bottom: 1.2rem;
}

.guide-card ul {
  margin-top: 1rem;
  padding-left: 1rem;
  color: var(--color-text-soft);
}

.guide-card li + li {
  margin-top: 0.7rem;
}

.forecast-section {
  display: grid;
  gap: 1rem;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
}

.section-heading h3 {
  font-size: 1.8rem;
  font-weight: 700;
}

.section-heading p {
  color: var(--color-text-soft);
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.9rem;
}

.forecast-icon {
  margin-top: 0.7rem;
  font-size: 1.8rem;
}

.forecast-temp {
  margin-top: 0.7rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.empty-state {
  padding: 2rem;
}

.empty-state h2 {
  margin-top: 0.6rem;
  font-size: 2rem;
  font-weight: 700;
}

.api-error {
  margin-top: 1rem;
  color: #ff8a8a;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid,
  .forecast-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .topbar,
  .hero-content,
  .section-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-card {
    min-height: 300px;
    padding: 1.4rem;
  }

  .hero-temperature {
    text-align: left;
  }

  .stats-grid,
  .content-grid,
  .forecast-grid {
    grid-template-columns: 1fr;
  }
}
</style>
