<script setup>
import { ref, onMounted, onUnmounted, provide, computed } from "vue";
import Header from "./components/Header.vue";
import Preloader from "./components/Preloader.vue";
import { usePreloader } from "./composables/usePreloader.js";

const { progress, isLoading, currentAsset, startPreload } = usePreloader();

const isFullscreen = ref(false);
const showHeader = ref(true);
let headerHoverTimeout = null;

const supportsDvh = CSS.supports("height", "100dvh");
const realViewportHeight = ref(window.innerHeight);

const updateViewportHeight = () => {
   if (supportsDvh) return;

   realViewportHeight.value =
      window.visualViewport?.height || window.innerHeight;
   document.documentElement.style.setProperty(
      "--real-vh-fallback",
      `${realViewportHeight.value}px`
   );
};

if (!supportsDvh) {
   updateViewportHeight();
}

const HOVER_ZONE_HEIGHT = 40;

const handleMouseMove = (event) => {
   // В полноэкранном режиме показываем шапку по ховеру наверх
   if (!isFullscreen.value) {
      showHeader.value = true;
      return;
   }

   const isInTopZone = event.clientY <= HOVER_ZONE_HEIGHT;
   const headerElement = document.querySelector(".header");
   let isOverHeader = false;

   if (showHeader.value && headerElement) {
      const rect = headerElement.getBoundingClientRect();
      isOverHeader =
         event.clientX >= rect.left &&
         event.clientX <= rect.right &&
         event.clientY >= rect.top &&
         event.clientY <= rect.bottom;
   }

   if (isInTopZone || isOverHeader) {
      showHeader.value = true;
      if (headerHoverTimeout) {
         clearTimeout(headerHoverTimeout);
         headerHoverTimeout = null;
      }
   } else {
      if (headerHoverTimeout) clearTimeout(headerHoverTimeout);
      headerHoverTimeout = setTimeout(() => {
         showHeader.value = false;
      }, 150);
   }
};

const handleMouseLeave = () => {
   // В обычном режиме шапка всегда видима
   if (!isFullscreen.value) {
      return;
   }
   if (headerHoverTimeout) {
      clearTimeout(headerHoverTimeout);
      headerHoverTimeout = null;
   }
   showHeader.value = false;
};

const handleFullscreenChange = () => {
   isFullscreen.value = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
   );
   // В обычном режиме шапка всегда видима
   if (!isFullscreen.value) {
      showHeader.value = true;
      if (headerHoverTimeout) {
         clearTimeout(headerHoverTimeout);
         headerHoverTimeout = null;
      }
   }
};

provide("showHeader", showHeader);

onMounted(async () => {
   try {
      await startPreload();
   } catch (error) {
      console.error("Preloader error:", error);
   }

   // Проверяем начальное состояние полноэкранного режима
   handleFullscreenChange();
   
   // В обычном режиме шапка всегда видима
   if (!isFullscreen.value) {
      showHeader.value = true;
   }

   document.addEventListener("mousemove", handleMouseMove);
   document.addEventListener("mouseleave", handleMouseLeave);
   document.addEventListener("fullscreenchange", handleFullscreenChange);
   document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
   document.addEventListener("msfullscreenchange", handleFullscreenChange);

   if (!supportsDvh) {
      window.addEventListener("resize", updateViewportHeight);
      window.addEventListener("orientationchange", updateViewportHeight);
      if (window.visualViewport) {
         window.visualViewport.addEventListener("resize", updateViewportHeight);
         window.visualViewport.addEventListener("scroll", updateViewportHeight);
      }
   }
});

onUnmounted(() => {
   document.removeEventListener("mousemove", handleMouseMove);
   document.removeEventListener("mouseleave", handleMouseLeave);
   document.removeEventListener("fullscreenchange", handleFullscreenChange);
   document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
   document.removeEventListener("msfullscreenchange", handleFullscreenChange);
   if (headerHoverTimeout) clearTimeout(headerHoverTimeout);

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
   <div id="app" @mouseleave="handleMouseLeave">
      <Preloader
         :progress="progress"
         :is-loading="isLoading"
         :current-asset="currentAsset"
      />

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
   height: var(--real-vh, 100vh);
   overflow: hidden;
   display: flex;
   flex-direction: column;
}

main {
   flex: 1;
   overflow: hidden;
   position: relative;
}

main.main-with-header .home-content-top,
main.main-with-header .map-info-panel {
   transform: translateY(92px);
   transition: transform 0.3s ease;
}

/* В обычном режиме шапка всегда видима, поэтому контент всегда должен быть сдвинут */
main .home-content-top,
main .map-info-panel {
   transform: translateY(92px);
   transition: transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
   transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
   opacity: 1;
}
</style>
