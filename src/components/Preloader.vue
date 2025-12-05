<template>
   <div class="preloader" :class="{ 'preloader-hidden': !isLoading }">
      <div class="preloader-content">
         <div class="preloader-logo">
            <img :src="logoSrc" alt="Logo" class="preloader-logo-img" />
         </div>
         <div class="preloader-progress-container">
            <div class="preloader-progress-bar">
               <div
                  class="preloader-progress-fill"
                  :style="{ width: `${progress}%` }"
               ></div>
            </div>
            <div class="preloader-progress-text">
               <span class="preloader-progress-value">{{ progress }}%</span>
               <span class="preloader-progress-label">Loading assets...</span>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { defineProps } from "vue";
import logoSrc from "../assets/icons/logo.svg";

defineProps({
   progress: {
      type: Number,
      default: 0,
   },
   isLoading: {
      type: Boolean,
      default: true,
   },
});
</script>

<style scoped>
.preloader {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 9999;
   transition: opacity 0.5s ease, visibility 0.5s ease;
}

.preloader-hidden {
   opacity: 0;
   visibility: hidden;
   pointer-events: none;
}

.preloader-content {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 3rem;
   max-width: 400px;
   width: 90%;
}

.preloader-logo {
   animation: pulse 2s ease-in-out infinite;
}

.preloader-logo-img {
   width: 120px;
   height: auto;
   filter: brightness(1.2);
}

@keyframes pulse {
   0%,
   100% {
      transform: scale(1);
      opacity: 1;
   }
   50% {
      transform: scale(1.05);
      opacity: 0.8;
   }
}

.preloader-progress-container {
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: 1rem;
}

.preloader-progress-bar {
   width: 100%;
   height: 6px;
   background: rgba(255, 255, 255, 0.1);
   border-radius: 3px;
   overflow: hidden;
   position: relative;
}

.preloader-progress-fill {
   height: 100%;
   background: linear-gradient(90deg, #4a9eff 0%, #7c3aed 50%, #ec4899 100%);
   border-radius: 3px;
   transition: width 0.3s ease;
   position: relative;
}

.preloader-progress-fill::after {
   content: "";
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
   );
   animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
   0% {
      transform: translateX(-100%);
   }
   100% {
      transform: translateX(100%);
   }
}

.preloader-progress-text {
   display: flex;
   justify-content: space-between;
   align-items: center;
   color: rgba(255, 255, 255, 0.7);
   font-size: 0.875rem;
}

.preloader-progress-value {
   font-weight: 600;
   font-size: 1.25rem;
   color: #fff;
   font-variant-numeric: tabular-nums;
}

.preloader-progress-label {
   opacity: 0.6;
}

/* Mobile adjustments */
@media (max-width: 768px) {
   .preloader-content {
      gap: 2rem;
   }

   .preloader-logo-img {
      width: 80px;
   }

   .preloader-progress-value {
      font-size: 1rem;
   }

   .preloader-progress-label {
      font-size: 0.75rem;
   }
}
</style>
