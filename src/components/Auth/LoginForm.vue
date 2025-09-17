<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-wrapper">
          <div class="logo-svg">
            <svg width="70" height="70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <!-- Livre ouvert -->
              <path d="M20 25 L50 20 L80 25 L80 75 L50 70 L20 75 Z" fill="#0D47A1" stroke="#1565C0" stroke-width="2"/>
              <path d="M50 20 L50 70" stroke="#1565C0" stroke-width="2"/>
              <!-- Pages du livre -->
              <line x1="30" y1="35" x2="45" y2="33" stroke="white" stroke-width="1.5"/>
              <line x1="55" y1="33" x2="70" y2="35" stroke="white" stroke-width="1.5"/>
              <line x1="30" y1="45" x2="45" y2="43" stroke="white" stroke-width="1.5"/>
              <line x1="55" y1="43" x2="70" y2="45" stroke="white" stroke-width="1.5"/>
              <line x1="30" y1="55" x2="45" y2="53" stroke="white" stroke-width="1.5"/>
              <line x1="55" y1="53" x2="70" y2="55" stroke="white" stroke-width="1.5"/>
              <!-- Circuit IA (cerveau technologique) -->
              <circle cx="50" cy="85" r="12" fill="#FFC107" stroke="#FF8F00" stroke-width="2"/>
              <circle cx="45" cy="82" r="2" fill="#0D47A1"/>
              <circle cx="55" cy="82" r="2" fill="#0D47A1"/>
              <circle cx="50" cy="88" r="2" fill="#0D47A1"/>
              <!-- Connexions IA -->
              <line x1="45" y1="82" x2="50" y2="88" stroke="#0D47A1" stroke-width="1"/>
              <line x1="55" y1="82" x2="50" y2="88" stroke="#0D47A1" stroke-width="1"/>
            </svg>
          </div>
        </div>
        <h2>Connexion - AcademiAI</h2>
        <p class="auth-subtitle">Assistant Académique Intelligent</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">
            <i class="icon user-icon"></i>
            Identifiant
          </label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            autocomplete="username"
            placeholder="Votre nom d'utilisateur" 
          />
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="icon lock-icon"></i>
            Mot de passe
          </label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            autocomplete="current-password"
            placeholder="Votre mot de passe"
          />
        </div>
        
        <div v-if="authStore.loginError" class="message error-message">
          <i class="message-icon error-icon"></i>
          {{ authStore.loginError }}
        </div>
        
        <div v-if="authStore.loginSuccess" class="message success-message">
          <i class="message-icon success-icon"></i>
          {{ authStore.loginSuccess }}
        </div>
        
        <button 
          type="submit" 
          :disabled="authStore.isLoading" 
          @click="disableInviteMode"
          class="auth-btn primary-btn"
        >
          <span v-if="!authStore.isLoading">Se connecter</span>
          <span v-else class="loading-text">
            <i class="loading-spinner"></i>
            Connexion en cours...
          </span>
        </button>
      </form>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const username = ref("");
const password = ref("");
const authStore = useAuthStore();

function disableInviteMode() {
  authStore.setInviteMode(false);
}

const handleLogin = async () => {
  await authStore.login({ username: username.value, password: password.value });
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
}

.auth-card {
  max-width: 420px;
  width: 100%;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  padding: 40px 35px;
  border: 1px solid var(--border-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-wrapper {
  margin-bottom: 15px;
}

.logo-svg {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--bg-card);
  box-shadow: 0 4px 15px rgba(13, 71, 161, 0.1);
  margin: 0 auto;
}

h2 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 1.8em;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 0.95em;
  margin: 0;
  font-style: italic;
  font-weight: 500;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  border-radius: 3px;
}

.user-icon {
  background: linear-gradient(45deg, #FFC107, #FF8F00);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.6 7 14.2 7.1 13.9 7.4L13 8.3C12.4 8.9 11.6 8.9 11 8.3L10.1 7.4C9.8 7.1 9.4 7 9 7L3 7V9C3 9.6 3.4 10 4 10L9 10V16C9 16.6 9.4 17 10 17H14C14.6 17 15 16.6 15 16V10L20 10C20.6 10 21 9.6 21 9Z'/%3E%3C/svg%3E") no-repeat center;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.6 7 14.2 7.1 13.9 7.4L13 8.3C12.4 8.9 11.6 8.9 11 8.3L10.1 7.4C9.8 7.1 9.4 7 9 7L3 7V9C3 9.6 3.4 10 4 10L9 10V16C9 16.6 9.4 17 10 17H14C14.6 17 15 16.6 15 16V10L20 10C20.6 10 21 9.6 21 9Z'/%3E%3C/svg%3E") no-repeat center;
}

.lock-icon {
  background: linear-gradient(45deg, #FFC107, #FF8F00);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3S15 4.34 15 6V8H9V6Z'/%3E%3C/svg%3E") no-repeat center;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3S15 4.34 15 6V8H9V6Z'/%3E%3C/svg%3E") no-repeat center;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1em;
  transition: all 0.3s ease;
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input:focus {
  border-color: var(--text-accent);
  outline: none;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

.form-group input::placeholder {
  color: #95a5a6;
  font-weight: 400;
}

.auth-btn {
  padding: 16px 0;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(13, 71, 161, 0.2);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(13, 71, 161, 0.3);
}

.primary-btn:disabled {
  background: linear-gradient(135deg, #BBDEFB, #E3F2FD);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(13, 71, 161, 0.1);
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.95em;
  font-weight: 500;
  margin: -5px 0;
}

.error-message {
  color: var(--error-text);
  background: var(--error-bg);
  border: 1px solid #D84315;
}

.success-message {
  color: var(--success-text);
  background: var(--success-bg);
  border: 1px solid #c3e6cb;
}

.message-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.error-icon {
  background: #D84315;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z'/%3E%3C/svg%3E") no-repeat center;
}

.success-icon {
  background: #155724;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E") no-repeat center;
}

.auth-footer {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(25, 118, 210, 0.2);
}

.auth-link {
  color: var(--text-accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 6px;
}

.auth-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
  text-decoration: none;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 15px;
  }
  
  .auth-card {
    padding: 30px 25px;
  }
  
  h2 {
    font-size: 1.6em;
  }
  
  .form-group input {
    padding: 12px 14px;
  }
  
  .auth-btn {
    padding: 14px 0;
    font-size: 1em;
  }
}
</style>