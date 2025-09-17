<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <div class="logo-container">
        <div class="navbar-logo-svg">
          <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Livre ouvert -->
            <path d="M20 25 L50 20 L80 25 L80 75 L50 70 L20 75 Z" fill="white" stroke="#FFC107" stroke-width="2"/>
            <path d="M50 20 L50 70" stroke="#FFC107" stroke-width="2"/>
            <!-- Pages du livre -->
            <line x1="30" y1="35" x2="45" y2="33" stroke="#0D47A1" stroke-width="1.5"/>
            <line x1="55" y1="33" x2="70" y2="35" stroke="#0D47A1" stroke-width="1.5"/>
            <line x1="30" y1="45" x2="45" y2="43" stroke="#0D47A1" stroke-width="1.5"/>
            <line x1="55" y1="43" x2="70" y2="45" stroke="#0D47A1" stroke-width="1.5"/>
            <line x1="30" y1="55" x2="45" y2="53" stroke="#0D47A1" stroke-width="1.5"/>
            <line x1="55" y1="53" x2="70" y2="55" stroke="#0D47A1" stroke-width="1.5"/>
            <!-- Circuit IA (cerveau technologique) -->
            <circle cx="50" cy="85" r="12" fill="#FFC107" stroke="#FF8F00" stroke-width="2"/>
            <circle cx="45" cy="82" r="2" fill="white"/>
            <circle cx="55" cy="82" r="2" fill="white"/>
            <circle cx="50" cy="88" r="2" fill="white"/>
            <!-- Connexions IA -->
            <line x1="45" y1="82" x2="50" y2="88" stroke="white" stroke-width="1"/>
            <line x1="55" y1="82" x2="50" y2="88" stroke="white" stroke-width="1"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-name">AcademiAI</h1>
          <span class="navbar-slogan">Assistant Académique Intelligent</span>
        </div>
      </div>
    </div>

    <!-- Liens de navigation - Masqués pour les invités -->
    <div
      class="navbar-links"
      v-if="authStore.isAuthenticated && !authStore.isInvite"
    >
      <router-link v-if="isRoleInvite" to="/" class="nav-link">Chat</router-link>
      <router-link v-if="isRoleProf" to="/ingest" class="nav-link">Ingestion</router-link>
      <!-- NOUVEAU LIEN POUR LE DASHBOARD DES SENTIMENTS -->
      <router-link v-if="isRoleProf" to="/dashboard" class="nav-link">Dashboard Sentiments</router-link>
      <router-link v-if="isRoleAdmin" to="/documents" class="nav-link">Documents Ingérés</router-link>
      <router-link v-if="isRoleAdmin" to="/stats" class="nav-link">Statistiques</router-link>
      <router-link v-if="isRoleAdmin" to="/admin" class="nav-link admin-link">Administration</router-link>
    </div>

    <!-- Section utilisateur - Masquée pour les invités -->
    <div
      class="navbar-user"
      v-if="authStore.isAuthenticated && !authStore.isInvite"
    >
      <button @click="themeStore.toggleTheme" class="theme-toggle">
        <svg v-if="!themeStore.isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="m12 1 0 2"/>
          <path d="m12 21 0 2"/>
          <path d="M4.22 4.22l1.42 1.42"/>
          <path d="m18.36 18.36 1.42 1.42"/>
          <path d="M1 12h2"/>
          <path d="M21 12h2"/>
          <path d="m4.22 19.78 1.42-1.42"/>
          <path d="m18.36 5.64 1.42-1.42"/>
        </svg>
      </button>
      <span>Bonjour : {{ authStore.user?.username }}</span>
      <button @click="handleLogout" class="logout-button">Déconnexion</button>
    </div>

    <!-- Affichage spécifique pour les invités -->
    <div class="navbar-guest" v-if="authStore.isInvite">
      <span style="margin-right: 10px">Mode Invité</span>
      <button
        @click="handleLogout"
        class="logout-button guest"
      >
        Connexion
      </button>
    </div>

    <!-- Lien de connexion - Masqué pour les invités -->
    <div
      class="navbar-login"
      v-if="!authStore.isAuthenticated && !authStore.isInvite"
    >
      <router-link to="/login" class="nav-link login-link">Connexion</router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useThemeStore } from "@/stores/theme";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const chatStore = useChatStore();
const themeStore = useThemeStore();
const router = useRouter();

const isRoleAdmin = computed(() => authStore.user?.profile_id === 1);
const isRoleProf = computed(() => authStore.user?.profile_id === 2 || authStore.user?.profile_id === 1);
const isRoleInvite = computed(() => authStore.user?.profile_id);

const handleLogout = () => {
  chatStore.clearChat(); // <-- AJOUTE CETTE LIGNE
  if (authStore.isInvite) {
    authStore.isInvite = false;
    authStore.user = null;
    localStorage.removeItem("is_guest_mode");
    localStorage.clear();
    router.push({ name: "Login" });
  } else {
    authStore.logout();
  }
};
</script>

<style scoped>
.navbar {
  background: var(--navbar-bg);
  color: var(--navbar-text);
  padding: 14px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: var(--shadow-light);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0;
}

.navbar-logo-svg {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg-card);
  box-shadow: 0 2px 10px rgba(13, 71, 161, 0.1);
  margin-right: 12px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.5px;
}

.navbar-logo {
  height: 70px;
  width: auto;
  margin-bottom: 2px;
  display: block;
}

.navbar-slogan {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link,
.login-link {
  color: var(--text-primary);
  text-decoration: none;
  margin-left: 0;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  background: var(--bg-glass);
  border: none;
  outline: none;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.nav-link:hover,
.login-link:hover,
.router-link-exact-active {
  background: var(--bg-secondary);
  color: var(--text-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.admin-link {
  background: var(--button-secondary);
  color: white;
  font-weight: bold;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-user span {
  font-size: 1em;
  color: var(--text-primary);
  font-weight: 500;
}

.logout-button {
  background: var(--button-danger);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;
  box-shadow: var(--shadow-light);
}
.logout-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}
.logout-button.guest {
  background: var(--button-success);
  box-shadow: var(--shadow-light);
}
.logout-button.guest:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.navbar-login .login-link {
  background: var(--button-primary);
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 12px;
  margin-left: 0;
  box-shadow: var(--shadow-light);
}
.navbar-login .login-link:hover {
  background: var(--button-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.theme-toggle {
  background: var(--bg-glass);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-accent);
  backdrop-filter: blur(5px);
  box-shadow: var(--shadow-light);
}

.theme-toggle:hover {
  background: var(--bg-secondary);
  transform: translateY(-1px) rotate(180deg);
  box-shadow: var(--shadow-medium);
}

@media (max-width: 900px) {
  .navbar {
    flex-direction: column;
    align-items: stretch;
    padding: 10px 8px;
    gap: 10px;
  }
  .navbar-brand {
    align-items: center;
    margin-bottom: 8px;
  }
  .navbar-links {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .navbar-user, .navbar-login, .navbar-guest {
    justify-content: center;
    margin-top: 8px;
  }
}
</style>