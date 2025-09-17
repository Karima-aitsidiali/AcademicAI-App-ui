<template>
  <div class="register-container">
    <h2>Inscription</h2>
    <RegisterForm />
     <!-- <p>Déjà un compte? <router-link to="/login">Connectez-vous ici</router-link></p> -->
  </div>
</template>

<script setup>
import RegisterForm from '@/components/Auth/RegisterForm.vue';
</script>

<style scoped>
.register-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: center;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
h2 {
  color: var(--text-primary);
  font-size: 1.8em;
  font-weight: 700;
  margin-bottom: 30px;
  letter-spacing: 0.5px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
p {
  color: var(--text-muted);
  font-style: italic;
  font-weight: 500;
  margin-top: 20px;
}
</style>