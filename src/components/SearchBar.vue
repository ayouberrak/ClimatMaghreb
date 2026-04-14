<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'submit', 'select-suggestion'])
const showSuggestions = ref(false)

const hasSuggestions = computed(() => props.suggestions.length > 0 && showSuggestions.value)

function handleInput(event) {
  showSuggestions.value = true
  emit('update:modelValue', event.target.value)
}

function handleChange(event) {
  emit('change', event.target.value)
}

function handleSubmit() {
  showSuggestions.value = false
  emit('submit', props.modelValue)
}

function selectSuggestion(city) {
  showSuggestions.value = false
  emit('update:modelValue', city)
  emit('select-suggestion', city)
}

function hideSuggestions() {
  window.setTimeout(() => {
    showSuggestions.value = false
  }, 120)
}
</script>

<template>
  <form class="search-shell" @submit.prevent="handleSubmit">
    <div class="search-box" :class="{ 'is-invalid': errorMessage }">
      <span class="search-icon">⌕</span>
      <input
        :value="modelValue"
        type="text"
        name="city"
        autocomplete="off"
        placeholder="Search cities..."
        @input="handleInput"
        @change="handleChange"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
      />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Loading...' : 'Search' }}
      </button>
    </div>

    <p v-if="errorMessage" class="input-error">{{ errorMessage }}</p>

    <ul v-if="hasSuggestions" class="suggestions-list">
      <li v-for="city in suggestions" :key="city">
        <button type="button" @mousedown.prevent="selectSuggestion(city)">
          {{ city }}
        </button>
      </li>
    </ul>
  </form>
</template>

<style scoped>
.search-shell {
  position: relative;
  width: min(100%, 430px);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.45rem 0.5rem 0.45rem 1rem;
  border: 1px solid rgba(149, 166, 255, 0.08);
  border-radius: 999px;
  background: rgba(17, 20, 29, 0.95);
  box-shadow: 0 20px 40px rgba(5, 7, 12, 0.35);
}

.search-box.is-invalid {
  border-color: rgba(255, 116, 116, 0.7);
}

.search-icon {
  color: var(--color-text-soft);
  font-size: 1rem;
}

input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  color: var(--color-text);
  background: transparent;
  font: inherit;
}

input::placeholder {
  color: var(--color-text-soft);
}

button {
  border: 0;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #7a8cff, #9db6ff);
  color: #0b1020;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.input-error {
  margin-top: 0.5rem;
  color: #ff8a8a;
  font-size: 0.9rem;
}

.suggestions-list {
  position: absolute;
  top: calc(100% + 0.7rem);
  left: 0;
  right: 0;
  padding: 0.45rem;
  border: 1px solid rgba(149, 166, 255, 0.08);
  border-radius: 1.2rem;
  background: rgba(15, 18, 27, 0.96);
  box-shadow: 0 20px 50px rgba(5, 7, 12, 0.45);
  list-style: none;
}

.suggestions-list button {
  width: 100%;
  padding: 0.85rem 1rem;
  text-align: left;
  border-radius: 0.9rem;
  background: transparent;
  color: var(--color-text);
}

.suggestions-list button:hover {
  background: rgba(122, 140, 255, 0.12);
  transform: none;
}

@media (max-width: 720px) {
  .search-shell {
    width: 100%;
  }

  .search-box {
    padding-left: 0.85rem;
  }

  button {
    padding-inline: 0.9rem;
  }
}
</style>
