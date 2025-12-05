<template>
   <div class="bottom-actions">
      <!-- <div
         class="bottom-actions-btn"
         :class="{ 'bottom-actions-btn-disabled': disabled }"
         @click="!disabled && $emit('disclaimer')"
      >
         <Icon name="attention" :size="24" color="currentColor" />
         <p v-if="showLabels">Disclaimer</p>
      </div> -->
      <div
         class="bottom-actions-btn"
         :class="{ 'bottom-actions-btn-disabled': disabled }"
         @click="!disabled && $emit('help')"
      >
         <Icon name="help" :size="24" color="currentColor" />
      </div>
      <div
         class="bottom-actions-btn"
         :class="{ 'bottom-actions-btn-disabled': disabled }"
         @click="!disabled && toggleFullscreen()"
      >
         <Icon name="zoom" :size="24" color="currentColor" />
      </div>
   </div>
</template>

<script setup>
import Icon from "./Icon.vue";
import { useFullscreen } from "../composables/useFullscreen.js";

defineProps({
   showLabels: {
      type: Boolean,
      default: false,
   },
   disabled: {
      type: Boolean,
      default: false,
   },
});

defineEmits(["disclaimer", "help"]);

const { toggleFullscreen } = useFullscreen();
</script>

<style scoped>
.bottom-actions {
   display: flex;
   justify-content: flex-end;
   gap: 1rem;
}

.bottom-actions-btn {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   background-color: #fff;
   color: #0e0e0e;
   padding: 0.5rem 1rem;
   border-radius: 1rem;
   cursor: pointer;
   transition: all 0.3s ease;
}

.bottom-actions-btn:hover:not(.bottom-actions-btn-disabled) {
   opacity: 0.8;
}

.bottom-actions-btn-disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none;
}

.bottom-actions-btn p {
   margin: 0;
}
</style>
