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

const toggleFullscreen = () => {
   if (!document.fullscreenElement) {
      // Enter fullscreen - try to find the closest parent container
      const bottomActions = document.querySelector(".bottom-actions");
      let targetElement =
         bottomActions?.closest(".map-page") ||
         bottomActions?.closest(".home") ||
         document.documentElement;

      if (targetElement) {
         if (targetElement.requestFullscreen) {
            targetElement.requestFullscreen();
         } else if (targetElement.webkitRequestFullscreen) {
            // Safari
            targetElement.webkitRequestFullscreen();
         } else if (targetElement.msRequestFullscreen) {
            // IE/Edge
            targetElement.msRequestFullscreen();
         }
      }
   } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
         document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
         // Safari
         document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
         // IE/Edge
         document.msExitFullscreen();
      }
   }
};
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
