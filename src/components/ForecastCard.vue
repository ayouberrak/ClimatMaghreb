<template>
  <div v-if="forecast && forecast.length" class="weekly-outlook">
    <div class="outlook-header">
      <h3>Weekly Outlook</h3>
      <a href="#" class="view-extended">View Extended &rsaquo;</a>
    </div>
    
    <div class="forecast-row">
      <div 
        v-for="(day, index) in forecast.slice(0, 7)" 
        :key="day.dateStr" 
        class="day-card glass-panel"
        :class="{ 'is-today': index === 0 }"
      >
        <span class="day-label">{{ index === 0 ? 'TODAY' : day.dayLabel.toUpperCase() }}</span>
        
        <div class="forecast-icon">
          <img 
            :src="getIconUrl(day.icon, '2x')" 
            :alt="day.description"
            crossorigin="anonymous"
          />
        </div>
        
        <div class="forecast-temps">
          <span class="temp-max">{{ day.tempMax }}&deg;</span>
          <span class="temp-min">{{ day.tempMin }}&deg;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getIconUrl } from '../services/api.js'

defineProps({
  forecast: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.weekly-outlook {
  margin-top: 32px;
}

.outlook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.outlook-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.view-extended {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.forecast-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.forecast-row::-webkit-scrollbar {
  height: 0;
}

.day-card {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px;
  background: var(--color-bg-card);
  transition: transform 0.2s;
}

.day-card:hover {
  transform: translateY(-4px);
}

.day-card.is-today {
  background: #1f1f24; /* Slightly lighter/different tint for today */
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.day-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.day-card.is-today .day-label {
  color: #818cf8;
}

.forecast-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}

.forecast-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.forecast-temps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.temp-max {
  font-size: 1.5rem;
  font-weight: 700;
}

.temp-min {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}
</style>
