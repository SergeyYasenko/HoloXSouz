<template>
   <div
      class="tooltip-wrapper"
      :style="{
         left: x + 'px',
         top: y + 'px',
         zIndex: isHovered ? 200 : 100,
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
   >
      <div
         class="tooltip-trigger"
         :class="{ 'tooltip-trigger-hovered': isHovered }"
      >
         <slot name="trigger"></slot>
         <div
            v-if="image"
            class="tooltip-table-container"
            :class="`tooltip-table-container-${position}`"
         >
            <img
               :src="image"
               :alt="title"
               class="tooltip-table-image"
               :style="{
                  width: computedImageSize + 'px',
                  height: 'auto',
               }"
               @error="console.error('Failed to load tooltip image:', image)"
            />
         </div>
      </div>
      <transition name="fade">
         <div v-if="showTooltip && !image" class="tooltip-content">
            <slot name="content">
               <div class="tooltip-title">{{ title }}</div>
               <div v-if="text" class="tooltip-text">{{ text }}</div>
            </slot>
         </div>
      </transition>
   </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
   x: {
      type: Number,
      default: 0,
   },
   y: {
      type: Number,
      default: 0,
   },
   title: {
      type: String,
      default: "",
   },
   text: {
      type: String,
      default: "",
   },
   image: {
      type: String,
      default: null,
   },
   imageSize: {
      type: Number,
      default: 200,
   },
   position: {
      type: String,
      default: "right",
      validator: (value) => ["left", "right"].includes(value),
   },
});

const showTooltip = ref(false);
const isHovered = ref(false);

const handleMouseEnter = () => {
   isHovered.value = true;
   showTooltip.value = true;
};

const handleMouseLeave = () => {
   isHovered.value = false;
   showTooltip.value = false;
};

// Ensure imageSize is always a valid number
const computedImageSize = computed(() => {
   const size = props.imageSize || 200;
   return isNaN(size) || size <= 0 ? 200 : size;
});
</script>

<style scoped>
.tooltip-wrapper {
   position: absolute;
   transition: z-index 0s;
   max-width: 320px;
   max-height: 220px;
   height: fit-content;
   width: 100%;
}

.tooltip-trigger {
   cursor: pointer;
   display: inline-block;
   position: relative;
   z-index: 100;
   transition: z-index 0s;
}

.tooltip-trigger-hovered {
   z-index: 200 !important;
}

.tooltip-trigger > * {
   display: block;
}

.tooltip-table-container {
   position: absolute;
   top: 50%;
   transform: translateY(-50%);
   z-index: 300;
   pointer-events: none;
   display: flex;
   align-items: center;
   justify-content: center;
   white-space: nowrap;
}

.tooltip-table-container-right {
   left: 100%;
   margin-left: 20px;
}

.tooltip-table-container-left {
   right: 100%;
   margin-right: 20px;
}

.tooltip-table-image {
   display: block !important;
   max-width: 300px;
   width: auto;
   height: auto;
   border-radius: 4px;
   object-fit: contain;
   opacity: 1;
   visibility: visible;
   background: transparent;
}

.tooltip-content {
   position: absolute;
   bottom: 100%;
   left: 50%;
   transform: translateX(-50%);
   margin-bottom: 10px;
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   color: #fff;
   padding: 12px 16px;
   border-radius: 8px;
   font-size: 14px;
   width: 100%;
   max-width: 220px;
   pointer-events: none;
}

.tooltip-content::after {
   content: "";
   position: absolute;
   top: 100%;
   left: 50%;
   transform: translateX(-50%);
   border: 6px solid transparent;
   border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-title {
   font-weight: 600;
   margin-bottom: 4px;
}

.tooltip-text {
   font-size: 13px;
   opacity: 0.9;
   line-height: 1.4;
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}
</style>
