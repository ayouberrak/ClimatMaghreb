<template>
  <div class="nav-search-container" :class="{ 'is-focused': isFocused }">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>

    <input
      id="city-search-input"
      ref="inputRef"
      type="text"
      :value="modelValue"
      placeholder="Search cities..."
      autocomplete="off"
      @input="onInput"
      @keydown.enter.prevent="onEnter"
      @keydown.escape="closeSuggestions"
      @keydown.arrow-down.prevent="navigateSuggestion(1)"
      @keydown.arrow-up.prevent="navigateSuggestion(-1)"
      @focus="isFocused = true"
      @blur="onBlur"
    />

    <Transition name="suggestions">
      <ul
        v-if="showSuggestions && suggestions.length"
        class="suggestions-list"
        role="listbox"
      >
        <li
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.lat}-${suggestion.lon}`"
          class="suggestion-item"
          :class="{ 'is-active': index === activeIndex }"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          <span class="suggestion-name">{{ suggestion.name }}</span>
          <span class="suggestion-meta">
            {{ suggestion.state ? suggestion.state + ', ' : '' }}{{ suggestion.country }}
          </span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchCitySuggestions } from '../services/api.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'search'])

const inputRef = ref(null)
const isFocused = ref(false)
const suggestions = ref([])
const showSuggestions = ref(false)
const activeIndex = ref(-1)
let debounceTimer = null

function onInput(e) {
  const val = e.target.value
  emit('update:modelValue', val)
  activeIndex.value = -1
  clearTimeout(debounceTimer)
  if (val.length >= 2) {
    debounceTimer = setTimeout(() => loadSuggestions(val), 350)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
}

async function loadSuggestions(query) {
  const results = await fetchCitySuggestions(query, 5)
  suggestions.value = results
  showSuggestions.value = results.length > 0
}

function onEnter() {
  if (activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
    selectSuggestion(suggestions.value[activeIndex.value])
  } else if (props.modelValue.trim()) {
    closeSuggestions()
    emit('search', props.modelValue.trim())
  }
}

function selectSuggestion(suggestion) {
  const name = suggestion.name
  emit('update:modelValue', name)
  closeSuggestions()
  emit('search', name)
}

function navigateSuggestion(direction) {
  if (!showSuggestions.value) return
  activeIndex.value = Math.max(-1, Math.min(suggestions.value.length - 1, activeIndex.value + direction))
}

function closeSuggestions() {
  showSuggestions.value = false
  activeIndex.value = -1
}

function onBlur() {
  isFocused.value = false
  setTimeout(closeSuggestions, 150)
}
</script>

<style scoped>
.nav-search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg-input);
  border-radius: var(--radius-input);
  padding: 8px 16px;
  width: 300px;
  transition: background 0.2s, box-shadow 0.2s;
}

.nav-search-container.is-focused {
  background: #2c2c2e;
  box-shadow: 0 0 0 2px var(--color-accent);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  margin-right: 12px;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-main);
  font-size: 0.9rem;
  font-family: inherit;
}

input::placeholder {
  color: var(--color-text-muted);
}

.suggestions-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: var(--color-bg-input);
  border-radius: 12px;
  list-style: none;
  margin: 0;
  padding: 8px 0;
  z-index: 100;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.suggestion-item:hover,
.suggestion-item.is-active {
  background: rgba(255, 255, 255, 0.05);
}

.suggestion-name {
  color: var(--color-text-main);
  font-weight: 500;
}

.suggestion-meta {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.suggestions-enter-active,
.suggestions-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.suggestions-enter-from,
.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
