<script setup>
import { ref, onMounted, onUnmounted, provide } from "vue";
import Header from "./components/Header.vue";
import Preloader from "./components/Preloader.vue";
import { useFullscreen } from "./composables/useFullscreen.js";
import { usePreloader } from "./composables/usePreloader.js";

const { autoEnterFullscreen, setupFullscreenOnInteraction } = useFullscreen();
const { progress, isLoading, startPreload } = usePreloader();

const showHeader = ref(false);
let headerHoverTimeout = null;

// Hover zone height (top of screen)
const HOVER_ZONE_HEIGHT = 40; // pixels from top

const handleMouseMove = (event) => {
   // Check if mouse is in top zone
   const isInTopZone = event.clientY <= HOVER_ZONE_HEIGHT;

   // Check if mouse is over header element
   const headerElement = document.querySelector(".header");
   let isOverHeader = false;
   if (headerElement && showHeader.value) {
      const rect = headerElement.getBoundingClientRect();
      isOverHeader =
         event.clientX >= rect.left &&
         event.clientX <= rect.right &&
         event.clientY >= rect.top &&
         event.clientY <= rect.bottom;
   }

   if (isInTopZone || isOverHeader) {
      showHeader.value = true;
      // Clear any pending hide timeout
      if (headerHoverTimeout) {
         clearTimeout(headerHoverTimeout);
         headerHoverTimeout = null;
      }
   } else {
      // Delay hiding to allow smooth transition when moving from header to content
      if (headerHoverTimeout) {
         clearTimeout(headerHoverTimeout);
      }
      headerHoverTimeout = setTimeout(() => {
         showHeader.value = false;
      }, 300); // Small delay to allow moving mouse to header
   }
};

const handleMouseLeave = () => {
   // Hide header when mouse leaves the app
   if (headerHoverTimeout) {
      clearTimeout(headerHoverTimeout);
      headerHoverTimeout = null;
   }
   showHeader.value = false;
};

// Provide header visibility state to child components
provide("showHeader", showHeader);

onMounted(async () => {
   // Start preloading all assets
   await startPreload();

   // Setup listeners for first user interaction to enter fullscreen
   // (browsers require user gesture for fullscreen API)
   setupFullscreenOnInteraction();

   // Add mouse move listener for header visibility
   document.addEventListener("mousemove", handleMouseMove);
   document.addEventListener("mouseleave", handleMouseLeave);
});

onUnmounted(() => {
   document.removeEventListener("mousemove", handleMouseMove);
   document.removeEventListener("mouseleave", handleMouseLeave);
   if (headerHoverTimeout) {
      clearTimeout(headerHoverTimeout);
   }
});
</script>

<template>
   <div id="app" @mouseleave="showHeader = false">
      <!-- Preloader -->
      <Preloader :progress="progress" :is-loading="isLoading" />

      <!-- Main App Content -->
      <Header :class="{ 'header-visible': showHeader }" />
      <main :class="{ 'main-with-header': showHeader }">
         <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
               <component :is="Component" />
            </transition>
         </router-view>
      </main>
   </div>
</template>

<style>
#app {
   width: 100%;
   height: 100vh;
   overflow: hidden;
   display: flex;
   flex-direction: column;
}

main {
   flex: 1;
   overflow: hidden;
   position: relative;
}

/* Универсальное решение: сдвигаем верхние элементы вниз при появлении шапки */
main.main-with-header .home-content-top,
main.main-with-header .map-info-panel {
   transform: translateY(92px);
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
   transition: all 0.3s ease;
}

.fade-enter-from {
   opacity: 0;
}

.fade-leave-to {
   opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
   opacity: 1;
}
</style>
