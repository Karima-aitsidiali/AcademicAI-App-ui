// src/views/AdminView.vue
<template>
  <div class="admin-view">
    <h2>Administration</h2>
    <nav class="admin-nav">
      <router-link to="/admin/register">Inscription</router-link>
      <router-link to="/admin/departements">Départements</router-link>
      <router-link to="/admin/filieres">Filières</router-link>
      <router-link to="/admin/modules">Modules</router-link>
      <router-link to="/admin/activites">Activités</router-link>
    </nav>
    <div class="admin-content">
      <router-view></router-view> <!-- Les composants enfants s'afficheront ici -->
    </div>
  </div>
</template>

<script setup>
// Pas de script spécifique nécessaire pour ce layout simple
</script>

<style scoped>
.admin-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.admin-view h2 {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
  letter-spacing: 0.5px;
}
.admin-nav {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(25, 118, 210, 0.2);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}
.admin-nav a {
  margin-right: 0;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--bg-glass);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}
.admin-nav a:hover,
.admin-nav a.router-link-exact-active {
  background: var(--bg-secondary);
  color: var(--text-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}
.admin-content {
  margin-top: 20px;
}
</style>