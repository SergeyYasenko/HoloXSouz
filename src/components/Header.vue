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
         <nav class="nav">
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
         <div></div>
      </div>
   </header>
</template>

<script setup>
import Icon from "./Icon.vue";
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
}

.header-container {
   max-width: 100%;
   margin: 0 auto;
   padding: 0 4rem;
   display: flex;
   flex: 0 0 25%;
   align-items: center;
   justify-content: space-between;
}

.header-logo-wrapper {
   display: flex;
   align-items: center;
   gap: 2rem;
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

@media (max-width: 768px) {
   .header-container {
      padding: 0 1rem;
   }

   .logo h1 {
      font-size: 1.2rem;
   }

   .nav {
      gap: 1rem;
   }

   .nav-link {
      font-size: 1.3rem;
   }
}
</style>
