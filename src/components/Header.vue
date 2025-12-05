<template>
   <header class="header">
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
      <!-- Mobile Navigation -->
      <nav class="nav nav-mobile" :class="{ 'nav-mobile-open': isMenuOpen }">
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
      </nav>
   </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";

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
   background-color: #fff;
   top: 0;
   left: 0;
   right: 0;
   z-index: 1000;
   padding: 1rem 0;
   opacity: 0;
   transform: translateY(-100%);
   transition: opacity 0.3s ease, transform 0.3s ease;
   pointer-events: none;
   min-height: 92px;
   box-sizing: border-box;
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
   color: #0e0e0e;
   margin: 0;
   max-height: 60px;
   height: 100%;
   display: block;
}

.logo {
   filter: brightness(0) saturate(100%) !important;
}

.header-location {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   color: #a9a9aa;
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
   color: #0e0e0e;
   text-decoration: none;
   transition: color 0.3s ease;
   position: relative;
   display: flex;
   align-items: center;
   gap: 0.5rem;
}

.nav-link:hover {
   opacity: 0.8;
}

.nav-link.router-link-active {
   background-color: #00a5c2;
   color: #fff;
   padding: 1rem 1.2rem;
   border-radius: 1rem;
}

/* Burger Button */
.burger-button {
   display: none;
   flex-direction: column;
   justify-content: space-around;
   width: 30px;
   height: 30px;
   background: transparent;
   border: none;
   cursor: pointer;
   padding: 0;
   z-index: 1001;
   position: relative;
   flex: 0 0 auto;
   margin-left: auto;
}

.burger-line {
   width: 100%;
   height: 3px;
   background-color: #0e0e0e;
   border-radius: 2px;
   transition: opacity 0.3s ease, transform 0.3s ease;
   transform-origin: center;
}

.burger-button-active .burger-line:nth-child(1) {
   transform: translateY(10px) rotate(45deg);
}

.burger-button-active .burger-line:nth-child(2) {
   opacity: 0;
}

.burger-button-active .burger-line:nth-child(3) {
   transform: translateY(-10px) rotate(-45deg);
}

/* Mobile Navigation */
.nav-mobile {
   display: none;
   flex-direction: column;
   position: absolute;
   top: 100%;
   left: 0;
   right: 0;
   background-color: #fff;
   padding: 2rem;
   gap: 1.5rem;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
   transform: translateY(-100%);
   opacity: 0;
   visibility: hidden;
   transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
   z-index: 1000;
}

.nav-mobile-open {
   transform: translateY(0);
   opacity: 1;
   visibility: visible;
}

.nav-mobile .nav-link {
   padding: 1rem;
   border-bottom: 1px solid #f0f0f0;
   font-size: 1.1rem;
}

.nav-mobile .nav-link:last-child {
   border-bottom: none;
}

.nav-mobile .nav-link.router-link-active {
   background-color: #00a5c2;
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
