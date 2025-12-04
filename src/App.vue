<script setup>
import Header from "./components/Header.vue";
</script>

<template>
   <div id="app">
      <Header />
      <main>
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
