<template>
  <div class="documents-view-container">
    <!-- Section des Documents Ingérés -->
    <div class="section-container">
      <h2>Documents Ingérés</h2>
      <div class="buttons-container">
        <button @click="fetchDocuments" :disabled="isLoadingDocuments" class="refresh-button">
          {{ isLoadingDocuments ? '⏳ Chargement...' : '🔄 Rafraîchir les documents' }}
        </button>
        <button @click="confirmResetFaiss" :disabled="isDeletingDocuments || documents.length === 0" class="delete-button">
          {{ isDeletingDocuments ? '⏳ Suppression...' : '🗑️ Tout supprimer' }}
        </button>
      </div>
      <div v-if="isLoadingDocuments" class="loading-indicator">Chargement des documents...</div>
      <div v-if="isDeletingDocuments" class="loading-indicator">Suppression de tous les documents en cours...</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="errorDocuments" class="error-message">{{ errorDocuments }}</div>
      <div v-if="!isLoadingDocuments && documents.length === 0 && !errorDocuments" class="no-documents">
        Aucun document ingéré trouvé.
      </div>
      <div class="table-container">
        <table v-if="documents.length > 0" class="documents-table">
          <thead>
            <tr>
              <th>Nom du Fichier</th>
              <th>Date d'Ingestion</th>
              <th>Département</th>
              <th>Filière</th>
              <th>Module</th>
              <th>Activité</th>
              <th>Taille Estimée (Mo)</th>
              <th>Nombre de Chunks</th>
              <th>Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id_document_reference">
              <td>{{ doc.base_filename }}</td>
              <td>{{ formatDate(doc.date_Ingestion) }}</td>
              <td>{{ doc.departement || 'N/A' }}</td>
              <td>{{ doc.filiere || 'N/A' }}</td>
              <td>{{ doc.module || 'N/A' }}</td>
              <td>{{ doc.activite || 'N/A' }}</td>
              <td>{{ doc.taille_estimee || 'N/A' }}</td>
              <td>{{ doc.nb_chunks || 'N/A' }}</td>
              <td>{{ doc.username || 'N/A' }} </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section Historique des Conversations -->
    <div class="section-container smart-table-history-section">
      <h2>Historique des Conversations</h2>
      <button @click="loadChatHistory" :disabled="chatStore.isLoadingHistory" class="refresh-button">
        {{ chatStore.isLoadingHistory ? '⏳ Chargement de l\'historique...' : '🔄 Rafraîchir l\'historique' }}
      </button>
      <smartTable 
        :history-data="chatStore.chatHistory"
        :is-loading="chatStore.isLoadingHistory"
        :error="chatStore.fetchHistoryError"
      />
      <div v-if="!chatStore.isLoadingHistory && chatStore.fetchHistoryError && (!chatStore.chatHistory || chatStore.chatHistory.length === 0)" class="error-message">
        Erreur lors du chargement de l'historique : {{ chatStore.fetchHistoryError }}
      </div>
      <div v-if="!chatStore.isLoadingHistory && !chatStore.fetchHistoryError && (!chatStore.chatHistory || chatStore.chatHistory.length === 0)" class="no-data">
        Aucun historique trouvé.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useChatStore } from '@/stores/chat'; 
import smartTable from './smartTable.vue';

const documents = ref([]);
const isLoadingDocuments = ref(false);
const isDeletingDocuments = ref(false);
const errorDocuments = ref(null);
const successMessage = ref(null);

const fetchDocuments = async () => {
  isLoadingDocuments.value = true;
  errorDocuments.value = null;
  successMessage.value = null;
  try {
    const response = await api.getIngestedDocuments();
    documents.value = response.data || [];
  } catch (err) {
    errorDocuments.value = "Impossible de charger les documents ingérés. " + (err.response?.data?.detail || err.message);
    documents.value = [];
  } finally {
    isLoadingDocuments.value = false;
  }
};

const resetFaissDatabase = async () => {
  isDeletingDocuments.value = true;
  errorDocuments.value = null;
  successMessage.value = null;
  
  try {
    const response = await api.resetFaissDatabase();
    
    if (response.data && response.data.status === 'success') {
      successMessage.value = '✅ Tous les documents ont été supprimés avec succès !';
      documents.value = [];
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        successMessage.value = null;
      }, 5000);
    } else {
      throw new Error(response.data?.message || 'Erreur inconnue lors de la suppression');
    }
  } catch (err) {
    errorDocuments.value = "Erreur lors de la suppression des documents : " + (err.response?.data?.detail || err.message);
  } finally {
    isDeletingDocuments.value = false;
  }
};

const confirmResetFaiss = () => {
  const confirmed = window.confirm(
    '⚠️ ATTENTION !\n\n' +
    'Cette action va supprimer définitivement TOUS les documents ingérés de la base vectorielle.\n\n' +
    'Cette opération est IRRÉVERSIBLE.\n\n' +
    'Êtes-vous sûr(e) de vouloir continuer ?'
  );
  
  if (confirmed) {
    resetFaissDatabase();
  }
};

const chatStore = useChatStore();

const loadChatHistory = () => {
  chatStore.fetchChatHistory({}); 
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date Invalide';
  return date.toLocaleString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

onMounted(() => {
  fetchDocuments();
  if ((!chatStore.chatHistory || chatStore.chatHistory.length === 0) && !chatStore.isLoadingHistory) {
     loadChatHistory();
  }
});
</script>

<style scoped>
.documents-view-container {
  padding: 30px;
  display: flex;
  flex-direction: column; 
  gap: 25px; 
  background: var(--bg-primary);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.section-container {
  padding: 35px 30px 28px 30px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.section-container:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.section-container h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.6em;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.buttons-container {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.refresh-button {
  padding: 14px 24px;
  background: var(--button-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 180px;
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

.delete-button {
  padding: 14px 24px;
  background: var(--button-danger);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 180px;
  box-shadow: var(--shadow-light);
  letter-spacing: 0.3px;
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.delete-button:disabled {
  background: var(--button-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-light);
}

.success-message {
  color: var(--success-text);
  background: var(--success-bg);
  border: 1px solid var(--success-text);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 1em;
  animation: fadeInUp 0.5s ease-in;
  backdrop-filter: blur(5px);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-indicator, .no-documents, .no-data {
  text-align: center;
  padding: 25px;
  font-size: 1.1em;
  color: var(--text-primary);
  font-weight: 500;
  background: var(--bg-glass);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.error-message {
  color: var(--error-text);
  background: var(--error-bg);
  border: 1px solid var(--error-text);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 1em;
  backdrop-filter: blur(5px);
}

.table-container {
  overflow-x: auto;
  margin-top: 15px;
  background: var(--bg-glass);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  padding: 10px;
}

.documents-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  box-shadow: var(--shadow-light);
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.documents-table th, .documents-table td {
  border: 1px solid var(--border-color);
  padding: 14px 16px;
  text-align: left;
  font-size: 0.95em; 
}
.documents-table th {
  background: var(--table-header-bg);
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9em;
}
.documents-table tbody tr:nth-child(even) {
  background: var(--table-row-even);
}
.documents-table tbody tr:hover {
  background: var(--bg-hover);
  transform: scale(1.01);
  transition: all 0.2s ease;
}
.documents-table td {
  color: var(--text-secondary);
  font-weight: 500;
}

.smart-table-history-section {
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;   
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  padding: 35px 30px 28px 30px;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.smart-table-history-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 70px rgba(13, 71, 161, 0.2);
}

@media (max-width: 768px) {
  .documents-view-container {
    padding: 15px;
  }
  .section-container {
    padding: 20px 15px;
    border-radius: 16px;
  }
  .buttons-container {
    flex-direction: column;
    align-items: center;
  }
  .refresh-button, .delete-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>