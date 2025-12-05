<script setup>
import { ref, onMounted, onUnmounted, provide } from "vue";
import Header from "./components/Header.vue";
import Preloader from "./components/Preloader.vue";
import { usePreloader } from "./composables/usePreloader.js";

const { progress, isLoading, currentAsset, startPreload } = usePreloader();

const showHeader = ref(false);
let headerHoverTimeout = null;

// Check if browser supports dynamic viewport units (dvh)
// If not, we'll use JavaScript to update CSS variables as fallback
const supportsDvh = CSS.supports("height", "100dvh");

// Calculate real viewport height for browsers that don't support dvh
const realViewportHeight = ref(window.innerHeight);

// Update viewport height on resize and orientation change (fallback for older browsers)
const updateViewportHeight = () => {
   // Only update if browser doesn't support dvh
   if (!supportsDvh) {
      // Use innerHeight which accounts for browser UI
      realViewportHeight.value = window.innerHeight;

      // Also use visualViewport API if available (more accurate on mobile)
      if (window.visualViewport) {
         realViewportHeight.value = window.visualViewport.height;
      }

      // Set CSS variable for use in styles (fallback)
      document.documentElement.style.setProperty(
         "--real-vh-fallback",
         `${realViewportHeight.value}px`
      );
   }
};

// Initial calculation (only if needed)
if (!supportsDvh) {
   updateViewportHeight();
}

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
   // Start preloading all assets (with error handling)
   try {
      await startPreload();
   } catch (error) {
      console.error("Preloader error:", error);
      // Continue even if preloader fails
   }

   // Add mouse move listener for header visibility
   document.addEventListener("mousemove", handleMouseMove);
   document.addEventListener("mouseleave", handleMouseLeave);

   // Listen for viewport changes (mobile browser UI show/hide) - only if dvh not supported
   if (!supportsDvh) {
      window.addEventListener("resize", updateViewportHeight);
      window.addEventListener("orientationchange", updateViewportHeight);

      // Use visualViewport API if available (more accurate on mobile)
      if (window.visualViewport) {
         window.visualViewport.addEventListener("resize", updateViewportHeight);
         window.visualViewport.addEventListener("scroll", updateViewportHeight);
      }
   }
});

onUnmounted(() => {
   document.removeEventListener("mousemove", handleMouseMove);
   document.removeEventListener("mouseleave", handleMouseLeave);
   if (headerHoverTimeout) {
      clearTimeout(headerHoverTimeout);
   }
   // Remove viewport listeners (only if they were added)
   if (!supportsDvh) {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
      if (window.visualViewport) {
         window.visualViewport.removeEventListener(
            "resize",
            updateViewportHeight
         );
         window.visualViewport.removeEventListener(
            "scroll",
            updateViewportHeight
         );
      }
   }
});
</script>

<template>
   <div id="app" @mouseleave="showHeader = false">
      <!-- Preloader -->
      <Preloader
         :progress="progress"
         :is-loading="isLoading"
         :current-asset="currentAsset"
      />

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
   height: var(--real-vh, 100vh); /* Use real viewport height */
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
