<template>
  <form @submit.prevent="submitIngestion" class="ingest-form">
    <h3 class="form-title">Indexation d’un Document</h3>
    <div class="form-grid">
      <div class="form-group">
        <label for="base_filename">Nom du fichier de base :</label>
        <input type="text" id="base_filename" v-model="formData.base_filename" required 
               placeholder="Sera rempli par la sélection de fichier" />
      </div>

      <div class="form-group">
        <label for="file_path_display">Fichier sélectionné :</label>
        <div class="file-input-container">
          <input type="text" id="file_path_display" v-model="formData.file_path_display" disabled 
                 placeholder="Aucun fichier sélectionné" />
          <button type="button" @click="triggerLocalFileSelect" class="browse-button">📁 Parcourir…</button>
        </div>
        <input type="file" id="actual_file_input" ref="localFilePicker" @change="handleLocalFileSelected" style="display: none;"
               accept=".pdf,.txt,.docx,.md,.json" />
        <small>Choisissez un fichier local à indexer. Son nom s’affichera ci-dessus.</small>
      </div>
      
      <div class="form-group">
        <label for="ingest_departement_id">Département :</label>
        <select id="ingest_departement_id" v-model.number="formData.departement_id" required>
          <option :value="null">Sélectionner un département</option>
          <option v-for="dep in dataStore.departements" :key="dep.id" :value="dep.id">
            {{ dep.nom }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="ingest_filiere_id">Filière (optionnel) :</label>
        <select id="ingest_filiere_id" v-model.number="formData.filiere_id" :disabled="!formData.departement_id || dataStore.isLoading">
          <option :value="null">Sélectionner une filière</option>
          <option v-for="fil in dataStore.filieres" :key="fil.id" :value="fil.id">
            {{ fil.nom }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="ingest_module_id">Module (optionnel) :</label>
        <select id="ingest_module_id" v-model.number="formData.module_id" :disabled="!formData.filiere_id || dataStore.isLoading">
          <option :value="null">Sélectionner un module</option>
           <option v-for="mod in dataStore.modules" :key="mod.id" :value="mod.id">
            {{ mod.nom }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="ingest_activite_id">Activité (optionnel) :</label>
        <select id="ingest_activite_id" v-model.number="formData.activite_id">
          <option :value="null">Sélectionner une activité</option>
          <option v-for="act in dataStore.activites" :key="act.id" :value="act.id">
            {{ act.nom }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <button type="submit" :disabled="isLoading || !selectedFileObject" class="submit-button">
      {{ isLoading ? '⏳ Indexation en cours…' : '📄 Indexer le Document' }}
    </button>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';

const emit = defineEmits(['document-ingested', 'ingestion-error']);
const authStore = useAuthStore();
const dataStore = useDataStore();

const formData = reactive({
  base_filename: '',
  file_path_display: '',
  departement_id: null,
  filiere_id: null,
  module_id: null,
  activite_id: null,
});

const localFilePicker = ref(null);
const selectedFileObject = ref(null);

const isLoading = ref(false);
const error = ref(null);

onMounted(() => {
  if (dataStore.departements.length === 0) dataStore.fetchDepartementsForDropdown();
  if (dataStore.activites.length === 0) dataStore.fetchActivitesForDropdown();
});

watch(() => formData.departement_id, (newDepId) => {
  formData.filiere_id = null;
  formData.module_id = null;
  if (newDepId) {
    dataStore.fetchFilieresByDepartement(newDepId);
  } else {
    dataStore.filieres = [];
    dataStore.modules = [];
  }
});

watch(() => formData.filiere_id, (newFiliereId) => {
  formData.module_id = null;
  if (newFiliereId) {
    dataStore.fetchModulesByFiliere(newFiliereId);
  } else {
    dataStore.modules = [];
  }
});

const triggerLocalFileSelect = () => {
  if (localFilePicker.value) {
    localFilePicker.value.value = null; 
  }
  localFilePicker.value?.click();
};

const handleLocalFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.base_filename = file.name;
    formData.file_path_display = file.name;
    selectedFileObject.value = file;
    error.value = null;
  } else {
    formData.base_filename = '';
    formData.file_path_display = '';
    selectedFileObject.value = null;
  }
};

const submitIngestion = async () => {
  error.value = null;
  if (!selectedFileObject.value) {
    error.value = "Veuillez sélectionner un fichier à ingérer.";
    return;
  }
  if (!authStore.currentUser || authStore.profileId == null || authStore.userId == null) {
    error.value = "Informations utilisateur manquantes. Veuillez vous reconnecter.";
    return;
  }
  if (formData.departement_id == null) {
    error.value = "Le département est requis.";
    return;
  }
  if (!formData.base_filename) {
    error.value = "Le nom du fichier de base est manquant.";
    return;
  }

  isLoading.value = true;
  const dataPayload = new FormData();
  try {
    dataPayload.append('file_upload', selectedFileObject.value, formData.base_filename);
    dataPayload.append('base_filename', formData.base_filename);
    if (formData.departement_id != null) dataPayload.append('departement_id', formData.departement_id.toString());
    if (formData.filiere_id != null) dataPayload.append('filiere_id', formData.filiere_id.toString());
    if (formData.module_id != null) dataPayload.append('module_id', formData.module_id.toString());
    if (formData.activite_id != null) dataPayload.append('activite_id', formData.activite_id.toString());
    dataPayload.append('profile_id', authStore.profileId.toString());
    dataPayload.append('user_id', authStore.userId.toString());
  } catch (e) {
    error.value = "Erreur interne lors de la préparation des données.";
    isLoading.value = false;
    return;
  }

  try {
    const response = await api.ingestDocument(dataPayload); 
    if (response.data && response.data.status === 'success') {
      emit('document-ingested', response.data.message || 'Document indexé avec succès!');
      formData.base_filename = '';
      formData.file_path_display = '';
      selectedFileObject.value = null;
      if (localFilePicker.value) localFilePicker.value.value = null;
      formData.departement_id = null;
      formData.filiere_id = null;
      formData.module_id = null;
      formData.activite_id = null;
    } else {
      error.value = response.data?.message || response.data?.detail || "Erreur lors de l'indexation.";
      emit('ingestion-error', error.value);
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
            error.value = err.response.data.detail.map(d => `${d.loc.join('.')} - ${d.msg}`).join('; ');
        } else {
            error.value = err.response.data.detail;
        }
    } else {
        error.value = err.message || "Une erreur serveur est survenue.";
    }
    emit('ingestion-error', error.value);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.ingest-form {
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  padding: 35px 30px 28px 30px;
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  max-width: 750px;
  margin: 35px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-title {
  color: var(--text-primary);
  font-size: 1.6em;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
  letter-spacing: 0.5px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group input[type="text"],
.form-group select {
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1em;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-glass);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  border-color: var(--text-accent);
  outline: none;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

.form-group input[type="text"]:disabled {
  background: rgba(233, 236, 239, 0.6);
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.form-group select:disabled {
  background: rgba(233, 236, 239, 0.6);
  opacity: 0.7;
  cursor: not-allowed;
}

.form-group small {
  font-size: 0.85em;
  color: var(--text-muted);
  margin-top: 6px;
  font-style: italic;
  font-weight: 400;
}

.file-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-input-container input[type="text"] {
  flex-grow: 1;
  height: auto;
}

.browse-button {
  padding: 10px 16px;
  background: var(--button-secondary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
  white-space: nowrap;
  height: 46px;
  flex-shrink: 0;
}

.browse-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.3);
}

.submit-button {
  display: block;
  width: 100%;
  padding: 16px 0;
  background: var(--button-primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 700;
  margin-top: 25px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  letter-spacing: 0.5px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.submit-button:disabled {
  background: var(--button-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(149, 165, 166, 0.2);
}

.error-message {
  color: var(--error-text);
  background: var(--error-bg);
  border: 1px solid #D84315;
  margin-bottom: 20px;
  text-align: center;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>