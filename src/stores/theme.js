import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // Initialiser le thème depuis localStorage
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Détecter la préférence système si pas de sauvegarde
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // Appliquer le thème à la racine
  const applyTheme = () => {
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  // Basculer le thème
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Sauvegarder dans localStorage quand le thème change
  watch(isDark, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
    applyTheme()
  })

  // Variables CSS pour les thèmes
  const getThemeVars = () => {
    if (isDark.value) {
      return {
        // Mode sombre
        '--bg-primary': 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)',
        '--bg-secondary': 'rgba(45, 55, 72, 0.95)',
        '--bg-card': 'rgba(45, 55, 72, 0.95)',
        '--bg-glass': 'rgba(45, 55, 72, 0.8)',
        '--text-primary': '#f7fafc',
        '--text-secondary': '#e2e8f0',
        '--text-accent': '#90cdf4',
        '--border-color': 'rgba(113, 128, 150, 0.2)',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
        '--button-primary': 'linear-gradient(135deg, #4299e1, #2b77c7)',
        '--button-secondary': 'linear-gradient(135deg, #ed8936, #dd6b20)',
        '--success-bg': 'linear-gradient(135deg, #38a169, #2f855a)',
        '--error-bg': 'linear-gradient(135deg, #e53e3e, #c53030)',
        '--input-bg': 'rgba(74, 85, 104, 0.8)',
        '--hover-bg': 'rgba(113, 128, 150, 0.1)'
      }
    } else {
      return {
        // Mode clair (existant)
        '--bg-primary': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        '--bg-secondary': 'rgba(255, 255, 255, 0.95)',
        '--bg-card': 'rgba(255, 255, 255, 0.95)',
        '--bg-glass': 'rgba(255, 255, 255, 0.8)',
        '--text-primary': '#0D47A1',
        '--text-secondary': '#34495e',
        '--text-accent': '#1976D2',
        '--border-color': 'rgba(13, 71, 161, 0.1)',
        '--shadow-color': 'rgba(13, 71, 161, 0.15)',
        '--button-primary': 'linear-gradient(135deg, #1976D2, #0D47A1)',
        '--button-secondary': 'linear-gradient(135deg, #FFC107, #FF8F00)',
        '--success-bg': 'linear-gradient(135deg, #d1edcc, #c3e6cb)',
        '--error-bg': 'linear-gradient(135deg, #ffebee, #ffc1cc)',
        '--input-bg': 'rgba(255, 255, 255, 0.8)',
        '--hover-bg': 'rgba(25, 118, 210, 0.1)'
      }
    }
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
    getThemeVars
  }
})