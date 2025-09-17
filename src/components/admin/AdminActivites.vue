<template>
  <div class="admin-page">
    <h3>Gestion des Activités</h3>

    <!-- Zone de notification -->
    <div v-if="notification.message" :class="['alert', notification.type === 'success' ? 'alert-success' : 'alert-danger', 'mt-3']" role="alert">
      {{ notification.message }}
      <button type="button" class="btn-close" @click="clearNotification" aria-label="Close"></button>
    </div>

    <button @click="openAddModal" class="btn btn-primary mb-3 mt-3" :disabled="isLoadingInitialData">
      <span v-if="isLoadingInitialData" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Ajouter une Activité
    </button>

    <div v-if="dataStore.isLoading && activites.length === 0" class="text-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement des données...</span>
      </div>
      <p class="mt-2">Chargement des activités...</p>
    </div>

    <div v-else-if="activites.length === 0 && !dataStore.isLoading" class="alert alert-info text-center mt-3">
      Aucune activité trouvée. Vous pouvez en ajouter une en utilisant le bouton ci-dessus.
    </div>

    <table v-else class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <!-- <th>Module Associé</th> -->
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="act in activites" :key="act.id">
          <td>{{ act.id }}</td>
          <td>{{ act.nom }}</td>
          <!-- <td>{{ act.module_id ? getModuleName(act.module_id) : 'Aucun' }}</td> -->
          <td>
            <button @click="editActivite(act)" class="btn btn-sm btn-warning me-2" :disabled="isLoadingAction">
              <i class="bi bi-pencil-fill"></i> Modifier
            </button>
            <button @click="confirmDelete(act.id, 'activité')" class="btn btn-sm btn-danger" :disabled="isLoadingAction">
              <i class="bi bi-trash-fill"></i> Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal pour Ajout/Modification -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <h4>{{ isEditMode ? 'Modifier l\'Activité' : 'Ajouter une Activité' }}</h4>
        <form @submit.prevent="handleSubmit">
          <div v-if="formErrorMessage" class="alert alert-danger">
            {{ formErrorMessage }}
          </div>
          <div class="mb-3">
            <label for="activiteNom" class="form-label">Nom de l'Activité:</label>
            <input type="text" id="activiteNom" v-model="form.nom" class="form-control" :class="{'is-invalid': formErrors.nom}" required>
            <div v-if="formErrors.nom" class="invalid-feedback">{{ formErrors.nom }}</div>
          </div>
          <div class="mb-3">
            <label for="activiteModule" class="form-label">Module (Optionnel):</label>
            <select id="activiteModule" v-model="form.module_id" class="form-control">
              <option value="">Aucun module spécifique</option>
              <option v-for="mod in modulesForSelect" :key="mod.id" :value="mod.id">
                {{ mod.nom }} ({{ getFiliereNameForModule(mod.filiere_id) }})
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-success" :disabled="isLoadingAction">
              <span v-if="isLoadingAction" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {{ isEditMode ? 'Mettre à jour' : 'Ajouter' }}
            </button>
            <button type="button" @click="closeModal" class="btn btn-secondary ms-2" :disabled="isLoadingAction">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useDataStore } from '@/stores/data'; // Assurez-vous que le chemin est correct

const dataStore = useDataStore();

const activites = computed(() => dataStore.adminActivites);
const modulesForSelect = computed(() => dataStore.adminModules);
const filieresForModuleSelect = computed(() => dataStore.adminFilieres);

// États de chargement
const isLoadingInitialData = ref(true); // Pour le chargement initial des données de la page
const isLoadingAction = ref(false); // Pour les actions CRUD (ajout, modif, suppression)

// Notifications
const notification = reactive({ message: '', type: '' }); // type: 'success' ou 'danger'

// Gestion du Modal
const showModal = ref(false);
const isEditMode = ref(false);
const currentActiviteId = ref(null);

// Formulaire et erreurs
const form = reactive({
  nom: '',
  module_id: '',
});
const formErrors = reactive({});
const formErrorMessage = ref(''); // Message d'erreur général pour le formulaire

const clearNotification = () => {
  notification.message = '';
  notification.type = '';
};

const showNotification = (message, type = 'success', duration = 5000) => {
  notification.message = message;
  notification.type = type;
  if (duration > 0) {
    setTimeout(clearNotification, duration);
  }
};

onMounted(async () => {
  console.log("AdminActivites.vue: Component Mounted.");
  isLoadingInitialData.value = true;
  try {
    // Charger les données nécessaires en parallèle si possible
    await Promise.all([
      dataStore.adminFilieres.length === 0 ? dataStore.fetchAdminAllFilieres() : Promise.resolve(),
      dataStore.adminModules.length === 0 ? dataStore.fetchAdminAllModules() : Promise.resolve()
    ]);
    await dataStore.fetchAdminAllActivites(true); // Charger les activités après les dépendances
    console.log("AdminActivites.vue: After fetchAdminAllActivites, adminActivites in store:", dataStore.adminActivites);
  } catch (error) {
    console.error("Erreur lors du chargement initial des données:", error);
    showNotification("Erreur lors du chargement des données initiales. Veuillez réessayer.", "danger", 0);
  } finally {
    isLoadingInitialData.value = false;
  }
});

const getModuleName = (moduleId) => {
  if (!moduleId) return 'N/A';
  const mod = modulesForSelect.value.find(m => m.id === moduleId); // Utiliser modulesForSelect qui est déjà chargé
  return mod ? mod.nom : 'Module inconnu';
};

const getFiliereNameForModule = (filiereId) => {
  const filiere = filieresForModuleSelect.value.find(f => f.id === filiereId);
  return filiere ? filiere.nom : 'Filière N/A';
};

const resetForm = () => {
  form.nom = '';
  form.module_id = '';
  currentActiviteId.value = null;
  formErrorMessage.value = '';
  for (const key in formErrors) {
    delete formErrors[key];
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
  showModal.value = true;
};

const editActivite = (act) => {
  isEditMode.value = true;
  resetForm(); // S'assurer que les erreurs précédentes sont effacées
  currentActiviteId.value = act.id;
  form.nom = act.nom;
  form.module_id = act.module_id || '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const validateForm = () => {
  let isValid = true;
  formErrorMessage.value = '';
  for (const key in formErrors) {
    delete formErrors[key];
  }

  if (!form.nom.trim()) {
    formErrors.nom = "Le nom de l'activité est requis.";
    isValid = false;
  }
  // Ajoutez d'autres validations si nécessaire
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoadingAction.value = true;
  formErrorMessage.value = ''; // Clear previous general errors

  try {
    const payload = {
      nom: form.nom.trim(),
      module_id: form.module_id ? parseInt(form.module_id, 10) : null,
    };

    if (isEditMode.value && currentActiviteId.value) {
      await dataStore.updateActivite(currentActiviteId.value, payload);
      showNotification('Activité mise à jour avec succès!', 'success');
    } else {
      await dataStore.createActivite(payload);
      showNotification('Activité ajoutée avec succès!', 'success');
    }
    closeModal();
  } catch (error) {
    console.error("Erreur lors de la soumission de l'activité:", error);
    const detail = error.response?.data?.detail || error.message || "Une erreur inconnue s'est produite.";
    formErrorMessage.value = `Erreur: ${detail}`; // Afficher l'erreur dans le modal
    showNotification(`Erreur lors de la soumission: ${detail}`, 'danger', 0); // Aussi en notification globale si besoin
  } finally {
    isLoadingAction.value = false;
  }
};

const confirmDelete = async (id, type) => {
  if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette ${type} (ID: ${id}) ? Cette action est irréversible.`)) {
    isLoadingAction.value = true;
    try {
      if (type === 'activité') {
        await dataStore.deleteActivite(id);
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} supprimée avec succès!`, 'success');
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'${type}:`, error);
      const detail = error.response?.data?.detail || error.message || "Une erreur inconnue s'est produite.";
      showNotification(`Erreur lors de la suppression: ${detail}`, 'danger', 0);
    } finally {
      isLoadingAction.value = false;
    }
  }
};

</script>

<style scoped>
.admin-page {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-secondary);
  background-image: url('@/assets/admin-background.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

.admin-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg-glass);
  border-radius: 24px;
  z-index: 1;
}

.admin-page > * {
  position: relative;
  z-index: 2;
}

.admin-page h3 {
  color: var(--text-primary);
  font-size: 1.8em;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
  letter-spacing: 0.5px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(13, 71, 161, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  padding: 35px;
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  width: 90%;
  max-width: 550px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.modal-content h4 {
  color: var(--text-primary);
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
  letter-spacing: 0.5px;
}

.modal-actions {
  margin-top: 25px; /* Plus d'espace avant les boutons */
  text-align: right;
}

.table {
  margin-top: 25px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-light);
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  font-size: 1rem;
  border: 1px solid var(--border-color);
}

.table th,
.table td {
  text-align: center; /* Centrer le texte dans les en-têtes et les cellules */
  vertical-align: middle; /* Optionnel: pour mieux centrer verticalement si les cellules ont des hauteurs variables */
  padding: 0.75rem; /* Ajuster le padding si nécessaire avec la nouvelle taille de police */
}

.table th {
  background: var(--table-header-bg);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95em;
  letter-spacing: 0.3px;
  border: none;
}

.btn {
  display: inline-flex; /* Pour aligner le spinner et le texte */
  align-items: center;
  gap: 0.5rem; /* Espace entre l'icône/spinner et le texte */
}

.btn {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  padding: 10px 18px;
  font-size: 0.9em;
}

.btn-primary {
  background: var(--button-primary);
  color: white;
  box-shadow: var(--shadow-light);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.btn-warning {
  background: var(--button-secondary);
  color: white;
  box-shadow: var(--shadow-light);
}

.btn-warning:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.btn-danger {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 4px 15px rgba(211, 47, 47, 0.2);
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #388e3c, #2e7d32);
  color: white;
  box-shadow: 0 4px 15px rgba(56, 142, 60, 0.2);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(56, 142, 60, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #757575, #616161);
  color: white;
  box-shadow: 0 4px 15px rgba(117, 117, 117, 0.2);
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(117, 117, 117, 0.3);
}

.mb-3 { margin-bottom: 1rem !important; }
.mt-3 { margin-top: 1rem !important; }
.me-2 { margin-right: 0.5rem !important; }
.ms-2 { margin-left: 0.5rem !important; }

.form-label {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-control {
  display: block;
  width: 100%;
  padding: 14px 16px;
  font-size: 1em;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--bg-glass);
  backdrop-filter: blur(5px);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--text-accent);
  outline: none;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}
.form-control.is-invalid {
  border-color: #dc3545; /* Couleur de bordure pour erreur Bootstrap */
}
.invalid-feedback {
  display: block; /* S'assurer que le message d'erreur est visible */
  width: 100%;
  margin-top: 0.25rem;
  font-size: .875em;
  color: #dc3545; /* Couleur de texte pour erreur Bootstrap */
}

.text-center { text-align: center; }

/* Styles pour la notification */
.alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-close {
  padding: 0.5rem; /* Augmenter la zone cliquable */
}

/* Pour les icônes Bootstrap (si vous les utilisez) */
/* @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"); */
/* Si vous n'utilisez pas Bootstrap Icons globalement, vous pouvez les omettre ou les ajouter */
/* J'ai ajouté des classes bi-* pour l'exemple, vous aurez besoin de la librairie d'icônes */

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: .2em;
}
</style>