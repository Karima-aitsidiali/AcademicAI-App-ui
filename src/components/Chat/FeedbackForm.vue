<template>
  <transition name="fade-slide">
    <div class="feedback-form" v-if="!sent">
      <span>Exprime ton ressenti sur cette réponse :</span>
      <textarea
        v-model="feedbackText"
        :disabled="isSending"
        placeholder="Écris ici ton avis, ton ressenti, une suggestion…"
        rows="2"
        class="feedback-textarea"
      ></textarea>
      <button @click="send" :disabled="isSending || !feedbackText">
        Envoyer
      </button>
    </div>
  </transition>
  <transition name="fade-slide">
    <div v-if="sent" class="success-msg">
      Merci pour ton retour !
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  onSend: Function,
});

const feedbackText = ref('');
const isSending = ref(false);
const sent = ref(false);

async function send() {
  if (!feedbackText.value.trim() || isSending.value) return;
  isSending.value = true;
  try {
    await props.onSend(feedbackText.value.trim());
    sent.value = true;
  } finally {
    isSending.value = false;
  }
}
</script>

<style scoped>
.feedback-form {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 450px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 8px 25px rgba(13, 71, 161, 0.1);
  border: 1px solid var(--border-color);
  animation: fadeInUp 0.5s;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.feedback-form span {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95em;
}
.feedback-textarea {
  width: 100%;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  padding: 12px 14px;
  font-size: 1em;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-glass);
  backdrop-filter: blur(5px);
  resize: vertical;
  transition: all 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.feedback-textarea:focus {
  border-color: var(--text-accent);
  outline: none;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

.feedback-textarea::placeholder {
  color: #95a5a6;
  font-weight: 400;
}
.success-msg {
  color: var(--success-text);
  margin-top: 15px;
  background: var(--success-bg);
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95em;
  font-weight: 500;
  text-align: left;
  animation: fadeInUp 0.5s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
button {
  align-self: flex-end;
  border: none;
  background: var(--button-primary);
  color: white;
  border-radius: 12px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(13, 71, 161, 0.1);
}

/* Animation */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(.55,0,.1,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>