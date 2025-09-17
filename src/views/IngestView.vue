<template>
  <div class="ingest-view-container">
    <div class="header-section">
      <h2>Ingestion de Documents</h2>
      <button @click="refreshDropdowns" :disabled="dataStore.isLoading" class="refresh-button">
        {{ dataStore.isLoading ? '⏳ Actualisation...' : '🔄 Actualiser les listes' }}
      </button>
    </div>
    <p>Utilisez ce formulaire pour indexer de nouveaux documents dans le système.</p>
    <IngestForm @document-ingested="handleIngestionSuccess" />
    <div v-if="ingestionStatus" :class="['status-message', ingestionStatus.type]">
      {{ ingestionStatus.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IngestForm from '@/components/Ingest/IngestForm.vue';
import { useDataStore } from '@/stores/data';

const ingestionStatus = ref(null); // { type: 'success' | 'error', message: '...' }
const dataStore = useDataStore();

const handleIngestionSuccess = (message) => {
  ingestionStatus.value = { type: 'success', message: message };
  setTimeout(() => ingestionStatus.value = null, 5000);
};

const refreshDropdowns = async () => {
  try {
    await dataStore.refreshAllDropdowns();
    ingestionStatus.value = { type: 'success', message: '✅ Listes actualisées avec succès!' };
    setTimeout(() => ingestionStatus.value = null, 3000);
  } catch (err) {
    ingestionStatus.value = { type: 'error', message: 'Erreur lors de l\'actualisation des listes.' };
    setTimeout(() => ingestionStatus.value = null, 5000);
  }
};

onMounted(() => {
  refreshDropdowns();
});
</script>

<style scoped>
.ingest-view-container {
  max-width: 700px;
  margin: 20px auto;
  padding: 30px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

h2 {
  color: var(--text-primary);
  font-size: 1.8em;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.refresh-button {
  padding: 10px 18px;
  background: var(--button-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  white-space: nowrap;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.refresh-button:disabled {
  background: var(--button-disabled);
  cursor: not-allowed;
  transform: none;
}

p {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  font-weight: 500;
  margin-bottom: 25px;
}

.status-message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-message.success {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid #D84315;
}

@media (max-width: 600px) {
  .header-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .refresh-button {
    width: 100%;
    max-width: 250px;
  }
}
</style>