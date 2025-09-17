<template>
  <div class="stats-view-container">
    <h2>Statistiques d'Ingestion</h2>
    <button @click="fetchStats" :disabled="isLoading" class="refresh-button">
      {{ isLoading ? 'Chargement...' : 'Rafraîchir les statistiques' }}
    </button>
    <div v-if="isLoading" class="loading-indicator">Chargement des statistiques...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="stats && !isLoading" class="stats-layout">
      <!-- Section des cartes de statistiques -->
      <div class="stats-cards-grid">
        <div class="stat-card">
          <h3>Total Documents Ingérés</h3>
          <p class="stat-value">{{ stats.total_documents }}</p>
        </div>
        <div class="stat-card" v-if="stats.ingested_today !== undefined">
          <h3>Ingestions Aujourd'hui</h3>
          <p class="stat-value">{{ stats.ingested_today }}</p>
        </div>
        <div class="stat-card" v-if="stats.ingested_this_week !== undefined">
          <h3>Ingestions cette Semaine</h3>
          <p class="stat-value">{{ stats.ingested_this_week }}</p>
        </div>
        <div class="stat-card" v-if="stats.ingested_this_month !== undefined">
          <h3>Ingestions ce Mois</h3>
          <p class="stat-value">{{ stats.ingested_this_month }}</p>
        </div>
      </div>

      <!-- Section des graphiques -->
      <div class="charts-grid">
        <div class="chart-container card" v-if="departementChartData.datasets[0]?.data.length > 0">
          <h4>Documents par Département</h4>
          <BarChart :chartData="departementChartData" :chartOptions="barChartOptions" />
        </div>
        
        <div class="chart-container card" v-if="activiteChartData.datasets[0]?.data.length > 0">
          <h4>Documents par Activité</h4>
          <PieChart :chartData="activiteChartData" :chartOptions="pieChartOptions" />
        </div>

        <!-- NOUVEAU: Graphique pour Filières -->
        <div class="chart-container card" v-if="filiereChartData.datasets[0]?.data.length > 0">
          <h4>Documents par Filière</h4>
          <BarChart :chartData="filiereChartData" :chartOptions="barChartOptionsFiliere" />
        </div>

        <!-- NOUVEAU: Graphique pour Modules -->
        <div class="chart-container card" v-if="moduleChartData.datasets[0]?.data.length > 0">
          <h4>Documents par Module</h4>
          <BarChart :chartData="moduleChartData" :chartOptions="barChartOptionsModule" />
        </div>
      </div>
      
      <!-- Section des listes de statistiques (peut être combinée ou stylisée différemment) -->
      <div class="stats-lists-grid">
        <div v-if="stats.documents_par_departement && stats.documents_par_departement.length > 0" class="stats-section card">
          <h4>Détail par Département</h4>
          <ul class="stats-list">
            <li v-for="depStat in stats.documents_par_departement" :key="depStat.departement" class="list-item">
              {{ depStat.departement }}: <span class="count">{{ depStat.count }}</span>
            </li>
          </ul>
        </div>

        <div v-if="stats.documents_par_filiere && stats.documents_par_filiere.length > 0" class="stats-section card">
          <h4>Détail par Filière</h4>
          <ul class="stats-list">
            <li v-for="filStat in stats.documents_par_filiere" :key="filStat.filiere" class="list-item">
              {{ filStat.filiere }}: <span class="count">{{ filStat.count }}</span>
            </li>
          </ul>
        </div>

        <div v-if="stats.documents_par_module && stats.documents_par_module.length > 0" class="stats-section card">
          <h4>Détail par Module</h4>
          <ul class="stats-list">
            <li v-for="modStat in stats.documents_par_module" :key="modStat.module" class="list-item">
              {{ modStat.module }}: <span class="count">{{ modStat.count }}</span>
            </li>
          </ul>
        </div>

        <div v-if="stats.documents_par_activite && stats.documents_par_activite.length > 0" class="stats-section card">
          <h4>Détail par Activité</h4>
          <ul class="stats-list">
            <li v-for="actStat in stats.documents_par_activite" :key="actStat.activite" class="list-item">
              {{ actStat.activite }}: <span class="count">{{ actStat.count }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
     <div v-if="!isLoading && !stats && !error" class="no-stats">
      Aucune statistique disponible.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import BarChart from '@/components/Charts/BarChart.vue';
import PieChart from '@/components/Charts/PieChart.vue';

const stats = ref(null);
const isLoading = ref(false);
const error = ref(null);

const fetchStats = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.getStats();
    stats.value = response.data;
  } catch (err) {
    error.value = "Impossible de charger les statistiques. " + (err.response?.data?.detail || err.message);
    stats.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});

// Options communes pour les graphiques à barres
const commonBarChartOptions = (displayLegend = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  plugins: { legend: { display: displayLegend } }
});

const barChartOptions = ref(commonBarChartOptions(false)); // Pour Département
const barChartOptionsFiliere = ref(commonBarChartOptions(false)); // Pour Filière
const barChartOptionsModule = ref(commonBarChartOptions(false)); // Pour Module


const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } }
});

// Données calculées pour les graphiques
const departementChartData = computed(() => {
  if (!stats.value || !stats.value.documents_par_departement) {
    return { labels: [], datasets: [{ data: [] }] }; // Assurer que datasets existe
  }
  const labels = stats.value.documents_par_departement.map(item => item.departement);
  const data = stats.value.documents_par_departement.map(item => item.count);
  return {
    labels,
    datasets: [
      {
        label: 'Documents par Département',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        borderWidth: 1,
        data,
      },
    ],
  };
});

const activiteChartData = computed(() => {
  if (!stats.value || !stats.value.documents_par_activite) {
    return { labels: [], datasets: [{ data: [] }] }; // Assurer que datasets existe
  }
  const labels = stats.value.documents_par_activite.map(item => item.activite);
  const data = stats.value.documents_par_activite.map(item => item.count);
  return {
    labels,
    datasets: [
      {
        label: 'Documents par Activité',
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8A2BE2', '#A52A2A', '#DEB887', '#5F9EA0', '#7FFF00'],
        data,
      },
    ],
  };
});

// NOUVEAU: Données pour le graphique Filière
const filiereChartData = computed(() => {
  if (!stats.value || !stats.value.documents_par_filiere) {
    return { labels: [], datasets: [{ data: [] }] }; // Assurer que datasets existe
  }
  const labels = stats.value.documents_par_filiere.map(item => item.filiere);
  const data = stats.value.documents_par_filiere.map(item => item.count);
  return {
    labels,
    datasets: [
      {
        label: 'Documents par Filière',
        backgroundColor: '#66BB6A', // Couleur verte
        borderColor: '#388E3C',
        borderWidth: 1,
        data,
      },
    ],
  };
});

// NOUVEAU: Données pour le graphique Module
const moduleChartData = computed(() => {
  if (!stats.value || !stats.value.documents_par_module) {
    return { labels: [], datasets: [{ data: [] }] }; // Assurer que datasets existe
  }
  const labels = stats.value.documents_par_module.map(item => item.module);
  const data = stats.value.documents_par_module.map(item => item.count);
  return {
    labels,
    datasets: [
      {
        label: 'Documents par Module',
        backgroundColor: '#FFA726', // Couleur orange
        borderColor: '#F57C00',
        borderWidth: 1,
        data,
      },
    ],
  };
});

</script>

<style scoped>
.stats-view-container {
  padding: 30px;
  max-width: 1400px;
  margin: auto;
  background: var(--bg-primary);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 40px;
  color: var(--text-primary);
  font-size: 2.2em;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px var(--shadow-light);
}

.refresh-button {
  display: block;
  margin: 0 auto 35px auto;
  padding: 16px 28px;
  background: var(--button-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1em;
  font-weight: 600;
  box-shadow: var(--shadow-light);
  letter-spacing: 0.3px;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.refresh-button:disabled {
  background: var(--button-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-light);
}

.loading-indicator, .no-stats {
  text-align: center;
  padding: 35px;
  font-size: 1.2em;
  color: var(--text-primary);
  font-weight: 600;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

.error-message {
  color: var(--error-text);
  background: var(--error-bg);
  border: 1px solid var(--error-text);
  padding: 18px 24px;
  border-radius: 12px;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
  backdrop-filter: blur(5px);
  box-shadow: var(--shadow-light);
}

.stats-layout {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); 
  gap: 25px;
}

.stats-lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  padding: 25px 20px;
  border-radius: 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-hover);
}

.card h4 {
  margin-top: 0;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 12px;
  margin-bottom: 18px;
  font-size: 1.3em;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: 0.3px;
}

.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  padding: 25px 20px;
  border-radius: 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-hover);
}

.stat-card h3 {
  margin-top: 0;
  font-size: 1.2em;
  color: var(--text-primary);
  margin-bottom: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 2.8em;
  font-weight: 700;
  background: var(--button-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 15px 0 0 0;
  text-shadow: none;
}

.chart-container {
  height: 420px;
  position: relative;
  padding: 25px 15px 15px 15px;
  background: var(--bg-glass);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.chart-container canvas {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.stats-list {
  list-style-type: none;
  padding: 0;
  max-height: 280px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 10px;
}

.list-item {
  padding: 12px 8px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95em;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: var(--bg-hover);
  border-radius: 8px;
  transform: scale(1.02);
}

.count {
  font-weight: 700;
  background: var(--table-header-bg);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  box-shadow: var(--shadow-light);
}

.stats-section {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stats-section:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-hover);
}

@media (max-width: 768px) {
  .stats-view-container {
    padding: 20px;
  }
  
  .stats-cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .chart-container {
    height: 350px;
  }
  
  h2 {
    font-size: 1.8em;
  }
  
  .refresh-button {
    padding: 12px 20px;
    font-size: 1em;
  }
}
</style>