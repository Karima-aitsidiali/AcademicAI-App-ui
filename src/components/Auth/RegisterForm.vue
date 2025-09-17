<template>
  <div class="admin-users-page">
    <h3>Gestion des Utilisateurs</h3>
    <button @click="openAddModal" class="btn btn-primary mb-3">
      <span class="btn-emoji">👤➕</span> Ajouter un Utilisateur
    </button>

    <!-- Section de Filtres -->
    <div class="filters-section card mb-3">
      <div class="card-body">
        <h5 class="card-title">Filtres</h5>
        <div class="row g-3">
          <div class="col-md-4">
            <label for="searchQuery" class="form-label">Rechercher (Nom d'utilisateur)</label>
            <input type="text" id="searchQuery" v-model="searchQuery" class="form-control" placeholder="Nom d'utilisateur...">
          </div>
          <div class="col-md-3">
            <label for="filterStatus" class="form-label">Statut du compte</label>
            <select id="filterStatus" v-model="filterStatus" class="form-select">
              <option value="">Tous</option>
              <option :value="true">Actif</option>
              <option :value="false">Inactif</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="filterProfile" class="form-label">Profil</label>
            <select id="filterProfile" v-model="filterProfileId" class="form-select">
              <option value="">Tous</option>
              <option value="1">Admin</option>
              <option value="2">Prof</option>
              <option value="3">Étudiant</option>
              <option value="5">Invité</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom d'utilisateur</th>
            <th>Profil</th>
            <th>Filière</th>
            <th>Année Scolaire</th>
            <th>Statut</th>
            <th>Mdp par défaut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dataStore.isLoading && filteredUsers.length === 0">
            <td colspan="8" class="text-center">Chargement des utilisateurs...</td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0">
            <td colspan="8" class="text-center">Aucun utilisateur trouvé.</td>
          </tr>
          <tr v-for="user in filteredUsers" :key="user.id" >
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ getProfileName(user.profile_id) }}</td>
            <td>{{ getFiliereName(user.filiere_id) }}</td>
            <td>
              {{ user.annee_scolaire !== null && user.annee_scolaire !== undefined ? user.annee_scolaire : 'N/A' }}
              <!-- <span style="color:red; font-size:0.8em;">{{ JSON.stringify(user) }}</span> -->
            </td>
            <td>
              <span :class="['badge', user.is_active ? 'bg-success' : 'bg-secondary']">
                {{ user.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td>
              <span :class="['badge', user.is_default_password ? 'bg-warning text-dark' : 'bg-light text-secondary']">
                {{ user.is_default_password ? 'Oui' : 'Non' }}
              </span>
            </td>
            <td>
              <button @click="openEditModal(user)" class="btn btn-sm btn-warning me-2" title="Modifier">
                <span class="btn-emoji">📝</span>
              </button>
              <button @click="toggleActivation(user)" :class="['btn btn-sm me-2', user.is_active ? 'btn-info' : 'btn-success']" :title="user.is_active ? 'Désactiver' : 'Activer'">
                <span class="btn-emoji">{{ user.is_active ? '⏸️' : '▶️' }}</span>
              </button>
              <button @click="confirmDelete(user.id)" class="btn btn-sm btn-danger" title="Supprimer">
                <span class="btn-emoji">❌</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour Ajout/Modification Utilisateur -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <h4>{{ isEditMode ? 'Modifier l\'Utilisateur' : 'Ajouter un Utilisateur' }}</h4>
        <form @submit.prevent="handleSubmitUser">
          <div class="mb-3">
            <label for="userUsername" class="form-label">Nom d'utilisateur:</label>
            <input type="text" id="userUsername" v-model="form.username" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="userPassword" class="form-label">
              Mot de passe {{ isEditMode ? '(Laissez vide pour ne pas changer)' : '' }}:
            </label>
            <input type="password" id="userPassword" v-model="form.password" class="form-control" :required="!isEditMode">
          </div>
          <div class="mb-3">
            <label for="userProfile" class="form-label">Profil:</label>
            <select id="userProfile" v-model="form.profile_id" class="form-select" required>
              <option :value="null" disabled>Choisissez un profil</option>
              <option value="1">Admin</option>
              <option value="2">Prof</option>
              <option value="3">Étudiant</option>
              <option value="5">Invité</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="userFiliere" class="form-label">Filière:</label>
            <select id="userFiliere" v-model="form.filiere_id" class="form-select">
              <option :value="null">Aucune (ex: pour Admin)</option>
              <option v-for="filiere in filieresForSelect" :key="filiere.id" :value="filiere.id">
                {{ filiere.nom }} {{ filiere.departement_id ? '(' + getDepartementNameForFiliere(filiere.departement_id) + ')' : '' }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label for="userAnneeScolaire" class="form-label">Année Scolaire:</label>
            <input type="text" id="userAnneeScolaire" v-model="form.annee_scolaire" class="form-control" placeholder="Ex: 2024-2025">
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-success">
              <span class="btn-emoji">💾</span>{{ isEditMode ? 'Mettre à jour' : 'Ajouter' }}
            </button>
            <button type="button" @click="closeModal" class="btn btn-secondary ms-2">
              <span class="btn-emoji">↩️</span>Annuler
            </button>
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

const searchQuery = ref('');
const filterStatus = ref('');
const filterProfileId = ref('');

const filieresForSelect = computed(() => dataStore.adminFilieres);
const departementsForFiliereSelect = computed(() => dataStore.adminDepartements);

const filteredUsers = computed(() => {
  let users = dataStore.adminUsers;

  if (filterStatus.value !== '') {
    const isActiveFilter = filterStatus.value === 'true' || filterStatus.value === true;
    users = users.filter(user => user.is_active === isActiveFilter);
  }

  if (filterProfileId.value) {
    const profileId = parseInt(filterProfileId.value);
    users = users.filter(user => user.profile_id === profileId);
  }

  if (searchQuery.value.trim()) {
    const lowerSearchQuery = searchQuery.value.toLowerCase().trim();
    users = users.filter(user =>
      user.username && user.username.toLowerCase().includes(lowerSearchQuery)
    );
  }
  return users;
});

onMounted(async () => {
  if (dataStore.adminDepartements.length === 0) {
      await dataStore.fetchAdminAllDepartements();
  }
  if (dataStore.adminFilieres.length === 0) {
      await dataStore.fetchAdminAllFilieres();
  }
  await dataStore.fetchAdminAllUsers(true);
});

const getProfileName = (profileId) => {
  if (profileId === 1 || profileId === '1') return 'Admin';
  if (profileId === 2 || profileId === '2') return 'Prof';
  if (profileId === 3 || profileId === '3') return 'Étudiant';
  if (profileId === 5 || profileId === '5') return 'Invité';
  return 'N/A';
};

const getFiliereName = (filiereId) => {
  if (!filiereId) return 'N/A';
  const filiere = filieresForSelect.value.find(f => f.id === filiereId);
  return filiere ? filiere.nom : 'Inconnue';
};

const getDepartementNameForFiliere = (departementId) => {
  if (!departementId) return '';
  const dept = departementsForFiliereSelect.value.find(d => d.id === departementId);
  return dept ? dept.nom : 'Dept N/A';
};

const showModal = ref(false);
const isEditMode = ref(false);
const currentUserId = ref(null);

const form = reactive({
  username: '',
  password: '',
  profile_id: null,
  filiere_id: null,
  annee_scolaire: '',
});

const resetForm = () => {
  form.username = '';
  form.password = '';
  form.profile_id = null;
  form.filiere_id = null;
  form.annee_scolaire = '';
  currentUserId.value = null;
};

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditMode.value = true;
  currentUserId.value = user.id;
  form.username = user.username;
  form.password = '';
  form.profile_id = user.profile_id;
  form.filiere_id = user.filiere_id || null;
  form.annee_scolaire = user.annee_scolaire || '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const handleSubmitUser = async () => {
  if (!form.username.trim() || form.profile_id === null) {
    alert("Le nom d'utilisateur et le profil sont requis.");
    return;
  }
  if (!isEditMode.value && !form.password) {
    alert("Le mot de passe est requis pour un nouvel utilisateur.");
    return;
  }
  if ((form.profile_id === 2 || form.profile_id === 3 || form.profile_id === '2' || form.profile_id === '3') && (!form.filiere_id || !form.annee_scolaire.trim())) {
     alert("Pour les profils Professeur et Étudiant, la filière et l'année scolaire sont requises.");
     return;
  }

  try {
    const payload = {
      username: form.username,
      profile_id: parseInt(form.profile_id),
      filiere_id: form.filiere_id ? parseInt(form.filiere_id) : null,
      annee_scolaire: form.annee_scolaire.trim() || null,
    };
    if (form.password) {
      payload.password = form.password;
    }

    if (isEditMode.value && currentUserId.value) {
      await dataStore.updateUser(currentUserId.value, payload);
      alert("Utilisateur mis à jour avec succès !");
    } else {
      await dataStore.createUser(payload);
      alert("Utilisateur ajouté avec succès !");
    }
    closeModal();
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || "Une erreur inconnue s'est produite.";
    alert(`Erreur lors de la soumission: ${errorMessage}`);
  }
};

const confirmDelete = async (userId) => {
  if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet utilisateur (ID: ${userId}) ? Cette action est irréversible.`)) {
    try {
      await dataStore.deleteUser(userId);
      alert("Utilisateur supprimé avec succès.");
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Une erreur inconnue s'est produite.";
      alert(`Erreur lors de la suppression: ${errorMessage}`);
    }
  }
};

const toggleActivation = async (user) => {
  const actionText = user.is_active ? "désactiver" : "activer";
  if (window.confirm(`Êtes-vous sûr de vouloir ${actionText} le compte de ${user.username} ?`)) {
    try {
      if (user.is_active) {
        await dataStore.deactivateUser(user.id);
      } else {
        await dataStore.activateUser(user.id);
      }
      alert(`Compte de ${user.username} ${!user.is_active ? 'activé' : 'désactivé'} avec succès.`);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Une erreur inconnue s'est produite.";
      alert(`Erreur: ${errorMessage}`);
    }
  }
};
</script>

<style scoped>
.admin-users-page {
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

.admin-users-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg-card);
  border-radius: 24px;
  z-index: 1;
}

.admin-users-page > * {
  position: relative;
  z-index: 2;
}

h3 {
  color: var(--text-primary);
  font-size: 1.8em;
  margin-bottom: 30px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
}

.btn {
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9em;
  padding: 10px 18px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
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

.btn-success {
  background: linear-gradient(135deg, #388e3c, #2e7d32);
  color: white;
  box-shadow: 0 4px 15px rgba(56, 142, 60, 0.2);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(56, 142, 60, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #00acc1, #0097a7);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 172, 193, 0.2);
}

.btn-info:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 172, 193, 0.3);
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

.btn-secondary {
  background: linear-gradient(135deg, #757575, #616161);
  color: white;
  box-shadow: 0 4px 15px rgba(117, 117, 117, 0.2);
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(117, 117, 117, 0.3);
}

.btn-emoji { font-size: 1.1em; }

.table-container {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  overflow-x: auto;
  margin-top: 25px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1em;
}
.table th, .table td {
  padding: 0.75rem 1rem;
  text-align: left;
  vertical-align: middle;
}
.table th {
  background: var(--table-header-bg);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95em;
  letter-spacing: 0.3px;
  border: none;
}
.table tr {
  transition: background 0.15s;
}
.table tr:hover {
  background: #f1f8ff;
}
.table td:last-child, .table th:last-child {
  text-align: center;
}

.badge {
  border-radius: 8px;
  font-size: 0.9em;
  padding: 0.4em 0.7em;
  font-weight: 600;
  display: inline-block;
}
.bg-success { background: #27ae60; color: #fff; }
.bg-secondary { background: #b2bec3; color: #fff; }
.bg-warning.text-dark { background: #ffe599; color: #b7950b !important; }
.bg-light.text-secondary { background: #f8f9fa; color: var(--text-muted); border: 1px solid #d6eaff; }

.filters-section {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(13, 71, 161, 0.1);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
}
.filters-section .card-body {
  padding: 1.25rem;
}
.card-title {
  color: var(--text-primary);
  font-size: 1.2em;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: 0.3px;
}

.form-label {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-control, .form-select {
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-glass);
  backdrop-filter: blur(5px);
  font-size: 1em;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 14px 16px;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: var(--text-accent);
  outline: none;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

.mb-3 { margin-bottom: 1rem !important; }
.me-2 { margin-right: 0.5rem !important; }
.ms-2 { margin-left: 0.5rem !important; }
.text-center { text-align: center; }

.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
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
  width: 95%;
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
  margin-top: 22px;
  text-align: right;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>