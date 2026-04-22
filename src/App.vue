<script setup>
import { onMounted } from 'vue'
import { useWeather } from './composables/useWeather.js'
import SearchBar from './components/SearchBar.vue'
import WeatherCard from './components/WeatherCard.vue'
import ForecastCard from './components/ForecastCard.vue'

const {
  currentWeather,
  forecast,
  isLoading,
  error,
  unitLabel,
  windUnitLabel,
  formatWindSpeed,
  searchCity,
} = useWeather()

onMounted(() => {
  searchCity('Paris')
})
</script>

<template>
  <div class="app-container">
    <!-- Navbar -->
    <header class="navbar">
      <div class="nav-brand">
        <h1 class="logo-text">Aether Weather</h1>
      </div>
      
      <nav class="nav-links">
        <a href="#" class="active">Forecast</a>
        <a href="#">Radar</a>
        <a href="#">Saved</a>
        <a href="#">Alerts</a>
      </nav>

      <div class="nav-center">
        <SearchBar @search="searchCity" />
      </div>

      <div class="nav-actions">
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </button>
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </header>

    <main class="main-content">
      <!-- Loading & Error States -->
      <div v-if="isLoading" class="state-msg">Chargement...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <template v-else-if="currentWeather">
        <!-- Hero Banner Section -->
        <section class="hero-section">
          <WeatherCard :weather="currentWeather" :unitLabel="unitLabel" />
        </section>

        <!-- Main Grid Layout -->
        <section class="dashboard-grid">
          
          <!-- Left Column (Metrics + Map) -->
          <div class="grid-left">
            <!-- 4 Metrics Row -->
            <div class="metrics-row">
              <!-- Humidity -->
              <div class="metric-card glass-panel">
                <div class="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  <span>HUMIDITY</span>
                </div>
                <div class="metric-value">{{ currentWeather.main.humidity }}%</div>
                <div class="metric-bar"><div class="bar-fill" :style="{width: currentWeather.main.humidity + '%'}"></div></div>
              </div>

              <!-- Wind -->
              <div class="metric-card glass-panel">
                <div class="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                  <span>WIND</span>
                </div>
                <div class="metric-value">{{ formatWindSpeed(currentWeather.wind.speed) }} <span class="unit">{{ windUnitLabel }}</span></div>
                <div class="metric-desc">Direction: {{ currentWeather.wind.deg }}&deg;</div>
              </div>

              <!-- Visibility (Mocked to 10km if not perfectly available) -->
              <div class="metric-card glass-panel">
                <div class="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span>VISIBILITY</span>
                </div>
                <div class="metric-value">{{ (currentWeather.visibility / 1000).toFixed(0) }} <span class="unit">km</span></div>
                <div class="metric-desc">Clear skies ahead</div>
              </div>

              <!-- UV Index (Mocked as OWM Free doesn't provide it directly in this endpoint) -->
              <div class="metric-card glass-panel">
                <div class="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  <span>UV INDEX</span>
                </div>
                <div class="metric-value">4 <span class="unit" style="font-size: 0.9rem; font-weight: 500; color: var(--color-text-muted)">Moderate</span></div>
                <div class="metric-bar uv-bar"><div class="bar-fill" style="width: 40%; background: #ff9f0a"></div></div>
              </div>
            </div>

            <!-- Map Placeholder -->
            <div class="map-card glass-panel">
              <div class="map-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                PRECIPITATION MAP
              </div>
              <div class="map-placeholder-bg"></div>
            </div>
          </div>

          <!-- Right Column (Alerts & Guides) -->
          <div class="grid-right">
            <!-- Alert Card -->
            <div class="alert-card glass-panel">
              <div class="alert-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <h3>Yellow Alert</h3>
              </div>
              <p>Expect moderate rainfall and occasional wind gusts up to 45 km/h in the evening. Keep an umbrella handy if traveling.</p>
              <button class="action-btn">Full Safety Report &rarr;</button>
            </div>

            <!-- Safety Guide -->
            <div class="safety-card glass-panel">
              <h3>Safety Guide</h3>
              <div class="safety-item">
                <div class="safety-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                <span>Light gear recommended</span>
              </div>
              <div class="safety-item">
                <div class="safety-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a8 8 0 0 1-8 8 8 8 0 0 1-8-8L4.38 3.46a2 2 0 0 1 2.22 1.45L8 9.5l1.4-4.59a2 2 0 0 1 3.8 0L14.6 9.5l1.4-4.59a2 2 0 0 1 2.22-1.45Z"/></svg></div>
                <span>Wear a windbreaker</span>
              </div>
            </div>
          </div>
          
        </section>

        <!-- Weekly Outlook -->
        <section class="forecast-section">
          <ForecastCard :forecast="forecast" />
        </section>

      </template>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  margin-bottom: 16px;
}

.nav-brand {
  flex: 1;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--color-text-main);
}

.nav-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.nav-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.icon-btn:hover {
  color: var(--color-text-main);
  background: rgba(255, 255, 255, 0.05);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

/* Main Layout */
.dashboard-grid {
  display: flex;
  gap: 24px;
  margin-top: 24px;
}

.grid-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.grid-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Metrics Row */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.metric-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.metric-header svg {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1;
  letter-spacing: -1px;
}

.metric-value .unit {
  font-size: 1rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.metric-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: auto;
  margin-bottom: 16px;
}

.metric-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: auto;
  overflow: hidden;
  width: 100%;
}

.bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 2px;
}

/* Map Card */
.map-card {
  height: 280px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  /* Simulating a dark styled radar map */
  background: linear-gradient(rgba(24, 24, 27, 0.4), rgba(24, 24, 27, 0.8)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop&grayscale=true') center/cover;
  position: relative;
}

.map-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(13, 13, 15, 0.8);
  backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  align-self: flex-start;
  color: #fff;
}

.map-label svg {
  width: 14px;
  height: 14px;
  color: var(--color-accent);
}

/* Alert Card */
.alert-card {
  padding: 28px;
  border-left: 4px solid var(--color-warning);
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-warning);
  margin-bottom: 16px;
}

.alert-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.alert-header svg {
  width: 24px;
  height: 24px;
}

.alert-card p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--color-text-main);
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Safety Card */
.safety-card {
  padding: 28px;
  flex: 1;
}

.safety-card h3 {
  margin: 0 0 24px 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.safety-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.safety-icon {
  width: 44px;
  height: 44px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
}

.safety-icon svg {
  width: 20px;
  height: 20px;
}

.safety-item span {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-main);
}

/* Responsive */
@media (max-width: 1200px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .dashboard-grid {
    flex-direction: column;
  }
  .nav-links {
    display: none;
  }
}
</style>
