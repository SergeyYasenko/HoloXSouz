<template>
   <div>
      <header class="header" :class="$attrs.class">
         <div class="header-container">
            <div class="header-logo-wrapper">
               <router-link to="/" class="logo-link">
                  <img
                     src="../assets/icons/logo.svg"
                     alt="Palladium logo"
                     class="logo"
                  />
               </router-link>
               <div class="header-location">
                  <div class="header-location-icon">
                     <Icon name="location" :size="24" color="currentColor" />
                  </div>
                  <div class="header-location-text">Dubai</div>
               </div>
            </div>
            <!-- Desktop Navigation -->
            <nav class="nav nav-desktop">
               <router-link to="/map" class="nav-link">Map</router-link>
               <router-link to="/" class="nav-link">Explore Projects</router-link>
               <router-link to="/favorites" class="nav-link"
                  >Favorites</router-link
               >
               <router-link to="/brochures" class="nav-link"
                  >Brochures
                  <Icon name="arrow-chevron" :size="24" color="currentColor" />
               </router-link>
            </nav>
            <!-- Spacer for desktop (balances logo on the left) -->
            <div class="header-spacer"></div>
            <!-- Burger Button -->
            <button
               class="burger-button"
               :class="{ 'burger-button-active': isMenuOpen }"
               @click="toggleMenu"
               aria-label="Toggle menu"
            >
               <span class="burger-line"></span>
               <span class="burger-line"></span>
               <span class="burger-line"></span>
            </button>
         </div>
      </header>
      <!-- Mobile Navigation - вынесено за пределы header для корректной работы backdrop-filter -->
      <nav class="nav nav-mobile" :class="{ 'nav-mobile-open': isMenuOpen }">
         <div class="nav-mobile-background"></div>
         <div class="nav-mobile-content">
            <router-link to="/map" class="nav-link" @click="closeMenu"
               >Map</router-link
            >
            <router-link to="/" class="nav-link" @click="closeMenu"
               >Explore Projects</router-link
            >
            <router-link to="/favorites" class="nav-link" @click="closeMenu"
               >Favorites</router-link
            >
            <router-link to="/brochures" class="nav-link" @click="closeMenu"
               >Brochures
               <Icon name="arrow-chevron" :size="24" color="currentColor" />
            </router-link>
         </div>
      </nav>
   </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";

defineOptions({
   inheritAttrs: false
});

const isMenuOpen = ref(false);
const route = useRoute();

const toggleMenu = () => {
   isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
   isMenuOpen.value = false;
};

// Close menu when route changes
watch(
   () => route.path,
   () => {
      closeMenu();
   }
);
</script>

<style scoped>
.header {
   position: fixed;
   background-color: rgba(255, 255, 255, 0.1);
   backdrop-filter: blur(20px);
   -webkit-backdrop-filter: blur(20px);
   top: 5px;
   left: 5px;
   right: 5px;
   z-index: 1000;
   padding: 1rem 0;
   opacity: 1;
   transform: translateY(0);
   transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
   pointer-events: all;
   min-height: 92px;
   box-sizing: border-box;
   border-radius: 16px;
   border: 1px solid rgba(255, 255, 255, 0.3);
}

.header:not(.header-visible) {
   opacity: 0;
   transform: translateY(-120%);
   pointer-events: none;
}

.header.header-visible {
   opacity: 1;
   transform: translateY(0);
   pointer-events: all;
}

.header-container {
   max-width: 100%;
   margin: 0 auto;
   padding: 0 4rem;
   display: flex;
   align-items: center;
   justify-content: space-between;
   position: relative;
}

.header-logo-wrapper {
   display: flex;
   align-items: center;
   gap: 2rem;
   flex: 0 0 auto;
   z-index: 1;
}

.header-spacer {
   flex: 0 0 auto;
   width: 0;
   visibility: hidden;
}

@media (max-width: 768px) {
   .header-spacer {
      display: none;
   }
}

.header-logo-wrapper a {
   text-decoration: none;
}

.logo-link {
   display: inline-block;
}

.logo {
   color: #fff;
   margin: 0;
   max-height: 60px;
   height: 100%;
   display: block;
   filter: brightness(0) invert(1);
}

.header-location {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   color: rgba(255, 255, 255, 0.8);
}

.header-location-text {
   font-size: 1.3rem;
   margin: 0;
}

.nav {
   display: flex;
   gap: 2rem;
}

.nav-desktop {
   position: absolute;
   left: 50%;
   transform: translateX(-50%);
   z-index: 0;
}

@media (max-width: 1300px) {
   .nav-desktop {
      position: static;
      transform: none;
      left: auto;
   }

   .header-spacer {
      display: none;
   }
}

.nav-link {
   color: #fff;
   text-decoration: none;
   transition: color 0.3s ease, opacity 0.3s ease;
   position: relative;
   display: flex;
   align-items: center;
   gap: 0.5rem;
}

.nav-link:hover {
   opacity: 0.8;
}

.nav-link.router-link-active {
   background-color: rgba(255, 255, 255, 0.2);
   color: #fff;
   padding: 1rem 1.2rem;
   border-radius: 1rem;
}

/* Burger Button */
.burger-button {
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   width: 40px;
   height: 40px;
   background: transparent;
   border: 1px solid rgba(255, 255, 255, 0.5);
   border-radius: 6px;
   cursor: pointer;
   padding: 8px;
   z-index: 1001;
   position: relative;
   flex: 0 0 auto;
   margin-left: auto;
   gap: 4px;
}

.burger-line {
   width: 16px;
   height: 2px;
   background-color: #fff;
   border-radius: 1px;
   transition: opacity 0.3s ease, transform 0.3s ease;
   transform-origin: center;
}

.burger-button-active .burger-line:nth-child(1) {
   transform: translateY(6px) rotate(45deg);
}

.burger-button-active .burger-line:nth-child(2) {
   opacity: 0;
}

.burger-button-active .burger-line:nth-child(3) {
   transform: translateY(-6px) rotate(-45deg);
}

/* Mobile Navigation */
.nav-mobile {
   display: none;
   flex-direction: column;
   position: fixed;
   top: 102px;
   left: 5px;
   right: 5px;
   padding: 0;
   transform: translateY(-100%);
   opacity: 0;
   visibility: hidden;
   transition: transform 0.3s ease, opacity 0.1s ease, visibility 0.1s ease;
   z-index: 1002;
   border-radius: 16px;
   overflow: hidden;
   max-height: calc(100vh - 97px);
   isolation: isolate;
}

.nav-mobile-open {
   transform: translateY(0);
   opacity: 1;
   visibility: visible;
}

.nav-mobile-background {
   opacity: 1 !important;
   transform: none !important;
   transition: none !important;
}

.nav-mobile-background {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(255, 255, 255, 0.1);
   backdrop-filter: blur(20px);
   -webkit-backdrop-filter: blur(20px);
   border: 1px solid rgba(255, 255, 255, 0.3);
   border-top: none;
   border-radius: 16px;
   z-index: 0;
   pointer-events: none;
   opacity: 1;
   transform: none;
   transition: none;
   will-change: auto;
}

.nav-mobile-content {
   position: relative;
   display: flex;
   flex-direction: column;
   padding: 2rem;
   gap: 1.5rem;
   z-index: 1;
   isolation: isolate;
}

.nav-mobile-content .nav-link {
   padding: 1rem;
   border-bottom: 1px solid rgba(255, 255, 255, 0.2);
   font-size: 1.1rem;
}

.nav-mobile-content .nav-link:last-child {
   border-bottom: none;
}

.nav-mobile-content .nav-link.router-link-active {
   background-color: rgba(255, 255, 255, 0.2);
   color: #fff;
   border-radius: 0.5rem;
   border-bottom: none;
}

/* Responsive */
@media (max-width: 1024px) {
   .header-container {
      padding: 0 2rem;
   }

   .nav-desktop {
      gap: 1.5rem;
   }
}

@media (max-width: 860px) {
   .header-container {
      padding: 0 1rem;
   }

   .header-location {
      display: none;
   }

   .nav-desktop {
      display: none;
   }

   .burger-button {
      display: flex;
   }

   .nav-mobile {
      display: flex;
   }

   .logo {
      max-height: 50px;
   }
}
</style>
