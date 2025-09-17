<template>
  <div class="chat-view-container">
    <div class="chat-header">
      <h3>Chatbot</h3>
    </div>
    <div class="chat-layout">
      <div class="chat-main">
        <ChatWindow
          :messages="chatStore.messages"
          :is-loading="chatStore.isLoadingMessages"
          :onSendFeedback="handleFeedback"
          :show-resources="lastShowResources" 
        />
        <ChatInput @send-message="handleSendMessage" />
        <div v-if="chatStore.sendMessageError" class="error-message">
          {{ chatStore.sendMessageError }}
        </div>
        <div v-if="feedbackError" class="error-message">
          {{ feedbackError }}
        </div>
        <div v-if="feedbackSuccess" class="success-message">
          Merci pour votre retour, il a bien été pris en compte !
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ChatWindow from "@/components/Chat/ChatWindow.vue";
import ChatInput from "@/components/Chat/ChatInput.vue";
import { useChatStore } from "@/stores/chat";
import { useDataStore } from "@/stores/data";
import { useAuthStore } from "@/stores/auth";

const chatStore = useChatStore();
const dataStore = useDataStore();
const authStore = useAuthStore();

const feedbackError = ref(null);
const feedbackSuccess = ref(false);
const lastShowResources = ref(true);

const handleSendMessage = (payload) => {
  chatStore.sendMessage({
    message: payload.message,
    departement_id: payload.selectedDepartement,
    filiere_id: payload.selectedFiliere,
    show_resources: payload.showResources,
    user_id: payload.selectedUser,
    profile_id: payload.selectedProfile
  });
  feedbackError.value = null;
  feedbackSuccess.value = false;
};

async function handleFeedback(feedbackText) {
  feedbackError.value = null;
  feedbackSuccess.value = false;
  const result = await chatStore.sendFeedback(feedbackText);
  if (result) {
    feedbackSuccess.value = true;
  } else {
    feedbackError.value = "Erreur lors de l'envoi du feedback. Veuillez réessayer.";
  }
}
</script>

<style scoped>
.chat-view-container {
  padding: 20px;
  max-width: 1400px;
  overflow: hidden;
  margin: 0 auto;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-secondary);
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(25, 118, 210, 0.2);
  margin-bottom: 20px;
}

.chat-header h3 {
  color: var(--text-primary);
  font-size: 1.8em;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}
.chat-layout {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.error-message {
  color: var(--error-text);
  margin-top: 15px;
  background: var(--error-bg);
  border: 1px solid #D84315;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.success-message {
  color: var(--success-text);
  margin-top: 15px;
  background: var(--success-bg);
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>