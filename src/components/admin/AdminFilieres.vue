<template>
  <div class="admin-page">
    <h3>Gestion des Filières</h3>
    <button @click="openAddModal" class="btn btn-primary mb-3">Ajouter une Filière</button>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <th>Département</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="dataStore.isLoading && filieres.length === 0"> <!-- Afficher chargement si la liste est vide et en cours de chargement -->
          <td colspan="4" class="text-center">Chargement...</td>
        </tr>
        <tr v-else-if="filieres.length === 0">
          <td colspan="4" class="text-center">Aucune filière trouvée.</td>
        </tr>
        <tr v-for="filiere in filieres" :key="filiere.id">
          <td>{{ filiere.id }}</td>
          <td>{{ filiere.nom }}</td>
          <td>{{ getDepartementName(filiere.departement_id) }}</td>
          <td>
            <button @click="editFiliere(filiere)" class="btn btn-sm btn-warning me-2">Modifier</button>
            <button @click="confirmDelete(filiere.id, 'filière')" class="btn btn-sm btn-danger">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal pour Ajout/Modification -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <h4>{{ isEditMode ? 'Modifier la Filière' : 'Ajouter une Filière' }}</h4>
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="filiereNom" class="form-label">Nom de la Filière:</label>
            <input type="text" id="filiereNom" v-model="form.nom" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="filiereDepartement" class="form-label">Département:</label>
            <select id="filiereDepartement" v-model="form.departement_id" class="form-control" required>
              <option disabled value="">Choisissez un département</option>
              <option v-for="dept in departementsForSelect" :key="dept.id" :value="dept.id">
                {{ dept.nom }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-success">{{ isEditMode ? 'Mettre à jour' : 'Ajouter' }}</button>
            <button type="button" @click="closeModal" class="btn btn-secondary ms-2">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useDataStore } from '@/stores/data';

const dataStore = useDataStore();

// Utiliser l'état admin pour l'affichage de la liste principale
const filieres = computed(() => dataStore.adminFilieres);
// Pour le select des départements dans le formulaire
const departementsForSelect = computed(() => dataStore.adminDepartements);

const showModal = ref(false);
const isEditMode = ref(false);
const currentFiliereId = ref(null);

const form = reactive({
  nom: '',
  departement_id: '', // Assurez-vous que c'est le nom attendu par l'API
});

onMounted(async () => {
  console.log("AdminFilieres.vue: Component Mounted.");
  // Charger les départements pour le select du formulaire
  if (dataStore.adminDepartements.length === 0) {
      await dataStore.fetchAdminAllDepartements(); // Pas besoin de forcer ici si déjà fait ailleurs ou si le cache est OK
  }
  // Charger TOUTES les filières pour la liste principale
  await dataStore.fetchAdminAllFilieres(true); // true pour forcer pendant le dev
  console.log("AdminFilieres.vue: After fetchAdminAllFilieres, adminFilieres in store:", dataStore.adminFilieres);
});

const getDepartementName = (departementId) => {
  const dept = dataStore.adminDepartements.find(d => d.id === departementId);
  return dept ? dept.nom : 'N/A';
};

const resetForm = () => {
  form.nom = '';
  form.departement_id = '';
  currentFiliereId.value = null;
};

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
  showModal.value = true;
};

const editFiliere = (filiere) => {
  isEditMode.value = true;
  currentFiliereId.value = filiere.id;
  form.nom = filiere.nom;
  form.departement_id = filiere.departement_id;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (!form.nom.trim() || !form.departement_id) {
    alert("Tous les champs sont requis.");
    return;
  }
  try {
    const payload = { nom: form.nom, departement_id: parseInt(form.departement_id) }; // Assurez-vous que l'ID est un nombre si nécessaire
    if (isEditMode.value && currentFiliereId.value) {
      await dataStore.updateFiliere(currentFiliereId.value, payload);
    } else {
      await dataStore.createFiliere(payload);
    }
    closeModal();
  } catch (error) {
    console.error("Erreur lors de la soumission de la filière:", error);
    alert("Erreur lors de la soumission: " + (error.response?.data?.detail || error.message));
  }
};

const confirmDelete = async (id, type) => {
  if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette ${type} (ID: ${id}) ?`)) {
    try {
      if (type === 'filière') {
        await dataStore.deleteFiliere(id);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de la ${type}:`, error);
      alert(`Erreur lors de la suppression: ` + (error.response?.data?.detail || error.message));
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
  background: var(--bg-card);
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
  box-shadow: 0 20px 60px rgba(13, 71, 161, 0.25);
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
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
}

.btn-warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.3);
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