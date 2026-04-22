<template>
  <div v-if="weather" class="hero-banner glass-panel">
    <!-- Placeholder city background gradient (dark blue to transparent) -->
    <div class="hero-bg"></div>
    
    <div class="hero-content">
      <div class="hero-left">
        <div class="hero-meta">
          <span class="live-tag">LIVE</span>
          <span class="location-text">{{ weather.name }}, {{ weather.sys.country }}</span>
        </div>
        <h2 class="city-name">{{ weather.name }}</h2>
        <p class="weather-desc">{{ capitalize(weather.weather[0].description) }}</p>
      </div>

      <div class="hero-right">
        <div class="temp-display">
          <span class="temp-value">{{ Math.round(weather.main.temp) }}</span>
          <span class="temp-unit">{{ unitLabel }}</span>
        </div>
        <div class="temp-high-low">
          H: {{ Math.round(weather.main.temp_max) }}&deg; 
          L: {{ Math.round(weather.main.temp_min) }}&deg; 
          &bull; Feels like {{ Math.round(weather.main.feels_like) }}&deg;
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  weather: { type: Object, required: true },
  unitLabel: { type: String, required: true },
})

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.hero-banner {
  width: 100%;
  height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px;
  position: relative;
  background: linear-gradient(to top, rgba(13, 13, 15, 1) 0%, rgba(13, 13, 15, 0.2) 100%), 
              url('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop') center/cover no-repeat;
  border-radius: var(--radius-card);
  overflow: hidden;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 10;
}

.hero-left {
  display: flex;
  flex-direction: column;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.live-tag {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 1px;
}

.location-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.city-name {
  font-size: 5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
}

.weather-desc {
  font-size: 1.25rem;
  color: #818cf8;
  margin: 12px 0 0 0;
  font-weight: 500;
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.temp-display {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.temp-value {
  font-size: 8rem;
  font-weight: 600;
  line-height: 0.8;
  letter-spacing: -4px;
}

.temp-unit {
  font-size: 3rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 4px;
  margin-top: 8px;
}

.temp-high-low {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}
</style>
