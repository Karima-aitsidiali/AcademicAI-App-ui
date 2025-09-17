<!-- src/components/AnalyseSentiment/DashSentiment.vue -->
<template>
  <div class="sentiment-container">
    
    <!-- État de chargement (inchangé) -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Analyse des sentiments en cours...</p>
    </div>

    <!-- État d'erreur (inchangé) -->
    <div v-else-if="error" class="error-container">
      <h3>Oups ! Une erreur est survenue</h3>
      <p>{{ error }}</p>
      <button @click="runAnalysis" class="launch-button retry-button">
        <span class="icon">🔄</span> Réessayer
      </button>
    </div>

    <!-- État des résultats (SIMPLIFIÉ) -->
    <!-- Ce v-else-if est la seule condition nécessaire. Il affiche tout d'un coup. -->
    <div v-else-if="dashboardData" class="grid-container">
      
      <!-- Section KPIs -->
      <div class="kpi-card">
        <div class="kpi-header"><h3>📊 Feedbacks Totaux</h3></div>
        <p class="kpi-value">{{ dashboardData.kpis.total_feedbacks }}</p>
      </div>
      <div class="kpi-card">
        <div class="kpi-header"><h3>👥 Utilisateurs Uniques</h3></div>
        <p class="kpi-value">{{ dashboardData.kpis.unique_users }}</p>
      </div>
      <div class="kpi-card positive">
        <div class="kpi-header"><h3>👍 Taux de Positivité</h3></div>
        <p class="kpi-value">{{ dashboardData.kpis.positive_pct }}%</p>
      </div>

      <!-- Section Graphiques -->
      <div class="chart-card large-card">
        <h3>Distribution des Sentiments</h3>
        <!-- Le wrapper est la clé. Pas besoin de v-if supplémentaire ici. -->
        <div class="chart-wrapper">
          <PieChart 
            :chartData="dashboardData.charts.polarity_distribution"
            :chartOptions="pieChartOptions" 
          />
        </div>
      </div>
      <div class="chart-card large-card">
        <h3>% Positifs par Département-Filière</h3>
        <!-- Le wrapper est la clé. Pas besoin de v-if supplémentaire ici. -->
        <div class="chart-wrapper">
          <BarChart 
            :chartData="dashboardData.charts.positive_by_dept_filiere"
            :chartOptions="barChartOptions"
          />
        </div>
      </div>
      
      <!-- Section Tableaux -->
      <div class="table-card large-card">
        <h3>🏆 Top 8 Utilisateurs Actifs</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Feedbacks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in dashboardData.tables.top_users" :key="user.User">
                <td>{{ user.User }}</td>
                <td>{{ user.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- État initial (inchangé) -->
    <div v-else class="initial-state-container">
      <h2>Prêt à analyser les feedbacks ?</h2>
      <p>Cliquez sur le bouton pour lancer l'analyse et générer le tableau de bord.</p>
      <button @click="runAnalysis" class="launch-button">
        <span class="icon">🚀</span> Lancer l'analyse des sentiments
      </button>
    </div>

  </div>
</template>

<script setup>
// SIMPLIFIÉ : On retire nextTick
import { ref } from 'vue';
import api from '@/services/api';
import BarChart from '@/components/Charts/BarChart.vue';
import PieChart from '@/components/Charts/PieChart.vue';

const loading = ref(false);
const error = ref(null);
const dashboardData = ref(null);
// SIMPLIFIÉ : On retire la variable renderCharts
// const renderCharts = ref(false); // SUPPRIMÉ

// Les options des graphiques ne changent pas
const pieChartOptions = ref({ /* ... vos options ... */ });
const barChartOptions = ref({ /* ... vos options ... */ });

// SIMPLIFIÉ : La fonction runAnalysis n'a plus besoin de nextTick
async function runAnalysis() {
  loading.value = true;
  error.value = null;
  dashboardData.value = null;

  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const response = await api.getSentimentDashboard();
    dashboardData.value = response.data;
    // Il n'y a plus rien à faire ici. Le template va se mettre à jour
    // automatiquement et correctement.
  } catch (err) {
    error.value = "Impossible de charger les données. " + (err.response?.data?.detail || err.message);
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>


<style scoped>
/* --- Conteneur principal --- */
.sentiment-container {
  width: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* --- Animation de chargement --- */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: 1.5rem;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(25, 118, 210, 0.1);
  border-left-color: var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-container p { 
  font-size: 1.2rem; 
  color: var(--text-primary); 
  font-weight: 600;
  margin: 0;
}

/* --- Conteneur d'erreur --- */
.error-container {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid #D84315;
  border-radius: 20px;
  padding: 35px 30px;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(216, 67, 21, 0.1);
}
.error-container h3 { 
  margin-top: 0; 
  font-size: 1.4em;
  font-weight: 700;
}

/* --- État initial et bouton de lancement --- */
.initial-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50px 30px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  min-height: 50vh;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
}
.initial-state-container h2 { 
  font-size: 2rem; 
  color: var(--text-primary); 
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.initial-state-container p { 
  font-size: 1.1rem; 
  color: var(--text-secondary); 
  max-width: 500px; 
  margin-bottom: 2.5rem;
  line-height: 1.6;
}
.launch-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: var(--button-primary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  letter-spacing: 0.5px;
}
.launch-button .icon { 
  margin-right: 10px; 
  font-size: 1.4rem; 
}
.launch-button:hover { 
  transform: translateY(-1px); 
  box-shadow: var(--shadow-medium); 
}
.retry-button { 
  margin-top: 1.5rem; 
  background: var(--button-secondary);
  color: white;
}

/* --- Grille et Cartes --- */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}
.kpi-card, .chart-card, .table-card {
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}
.kpi-card:hover, .chart-card:hover, .table-card:hover { 
  transform: translateY(-2px); 
  box-shadow: var(--shadow-medium);
  border-color: var(--border-hover);
}

/* --- Cartes KPI --- */
.kpi-card { 
  display: flex; 
  flex-direction: column; 
}
.kpi-header h3 { 
  font-size: 1.1rem; 
  color: var(--text-primary); 
  margin: 0 0 1rem 0;
  font-weight: 600;
}
.kpi-value { 
  font-size: 2.8rem; 
  font-weight: 700; 
  color: var(--text-accent); 
  margin: auto 0 0 0;
}
.kpi-card.positive .kpi-value { 
  background: var(--button-success);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* --- Cartes Graphiques et Tableaux --- */
.chart-card, .table-card { 
  grid-column: span 1; 
}
@media (min-width: 992px) {
  .large-card { grid-column: span 1; }
  .table-card { grid-column: span 1; }
}
.chart-card h3, .table-card h3 { 
  margin-top: 0; 
  margin-bottom: 1.5rem; 
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.3em;
}

/* --- Wrapper pour les graphiques --- */
.chart-wrapper {
  position: relative;
  height: 320px;
  width: 100%;
  background: var(--bg-glass);
  border-radius: 12px;
  padding: 10px;
}

/* --- Style du Tableau --- */
.table-wrapper { 
  width: 100%; 
  overflow-x: auto;
  background: var(--bg-glass);
  border-radius: 12px;
}
table { 
  width: 100%; 
  border-collapse: collapse; 
  text-align: left; 
}
th, td { 
  padding: 14px 16px; 
  border-bottom: 1px solid var(--border-color);
}
thead tr { 
  background: var(--table-header-bg);
}
th { 
  font-size: 0.9rem; 
  font-weight: 700; 
  text-transform: uppercase; 
  color: var(--text-primary);
  letter-spacing: 0.5px;
}
tbody tr:nth-child(even) { 
  background: var(--table-row-even);
}
tbody tr:hover { 
  background: var(--bg-hover);
  transform: scale(1.02);
  transition: all 0.2s ease;
}
td {
  color: var(--text-secondary);
  font-weight: 500;
}
</style>