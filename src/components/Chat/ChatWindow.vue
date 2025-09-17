<template>
  <div class="chat-window" ref="chatWindowRef">
    <MessageItem
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
      :show-resources="show_resources"
    />
    <!-- FeedbackForm juste après la dernière réponse du bot -->
    <FeedbackForm v-if="showFeedbackForm" :onSend="onSendFeedback" />
    <div v-if="isLoading" class="loading-indicator">
      <div class="typing-animation" aria-label="Le bot écrit">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <p>Le bot est en train d’écrire…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import MessageItem from "./MessageItem.vue";
import FeedbackForm from "./FeedbackForm.vue";
import { useChatStore } from "@/stores/chat";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  onSendFeedback: {
    type: Function,
    required: true,
  },
  show_resources: {
    // <-- AJOUTE CETTE PROP
    type: Boolean,
    default: true, // Toujours afficher les ressources quand elles existent
  },
});

const chatStore = useChatStore();
const chatWindowRef = ref(null);

// Trouver le dernier message du bot
const lastBotMessage = computed(() => {
  return [...props.messages].reverse().find((m) => m.sender === "bot");
});

// Afficher le feedback seulement si c'est la dernière réponse du bot, et pas déjà envoyé
const showFeedbackForm = computed(
  () =>
    lastBotMessage.value &&
    lastBotMessage.value.chat_id === chatStore.lastChatId &&
    !chatStore.feedbackSentForLastResponse
);

// Scroll automatique désactivé si FeedbackForm affiché
watch(
  () => props.messages,
  async () => {
    await nextTick();
    if (chatWindowRef.value && !showFeedbackForm.value) {
      chatWindowRef.value.scrollTop = chatWindowRef.value.scrollHeight;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.chat-window {
  flex-grow: 1;
  padding: 24px 20px 18px 20px;
  width: 100%;
  height: 440px;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin-bottom: 18px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  scroll-behavior: smooth;
  transition: all 0.3s ease;
  overflow-y: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chat-window:hover {
  box-shadow: var(--shadow-medium);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

@media (max-width: 800px) {
  .chat-window {
    padding: 10px 4px 8px 4px;
    height: 320px;
    border-radius: 10px;
  }
}
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 22px;
  background: rgba(227, 242, 253, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  width: fit-content;
  margin: 12px 0;
  box-shadow: 0 4px 15px rgba(13, 71, 161, 0.1);
  border: 1px solid rgba(13, 71, 161, 0.05);
}
.typing-animation {
  display: flex;
  align-items: center;
  height: 24px;
}
.typing-dot {
  width: 10px;
  height: 10px;
  background: var(--button-primary);
  border-radius: 50%;
  margin: 0 3px;
  animation: typingAnimation 1.4s infinite ease-in-out;
}
.typing-dot:nth-child(1) {
  animation-delay: 0s;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typingAnimation {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-7px);
    opacity: 1;
  }
}
.loading-indicator p {
  margin: 0;
  color: var(--text-primary);
  font-size: 1em;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.2px;
}
@media (max-width: 800px) {
  .chat-window {
    padding: 10px 4px 8px 4px;
    height: 320px;
    border-radius: 10px;
  }
  .loading-indicator {
    padding: 8px 10px;
    font-size: 0.95em;
  }
}
</style>