<template>
   <transition name="floor-plan-slide">
      <div
         v-if="modelValue"
         class="floor-plan-panel"
      >
         <div
            ref="containerRef"
            class="floor-plan-panel-container"
            @wheel.prevent="handleWheel"
         >
            <div
               class="floor-plan-panel-content"
               :style="contentStyle"
               @mousedown="handleMouseDown"
               @mousemove="handleMouseMove"
               @mouseup="handleMouseUp"
               @mouseleave="handleMouseUp"
               @touchstart="handleTouchStart"
               @touchmove="handleTouchMove"
               @touchend="handleTouchEnd"
               @touchcancel="handleTouchEnd"
            >
               <img
                  ref="imageRef"
                  :src="image"
                  alt="Floor plan"
                  class="floor-plan-panel-image"
               />
            </div>
         </div>
         <button
            class="floor-plan-panel-close"
            aria-label="Close"
            @click="close"
         >
            <Icon name="arrow" :size="24" color="currentColor" style="transform: rotate(90deg)" />
         </button>
      </div>
   </transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import Icon from "./Icon.vue";
import { useImageDrag } from "../composables/useImageDrag.js";

const props = defineProps({
   modelValue: Boolean,
   image: {
      type: [String, Object],
      default: null,
   },
});

const emit = defineEmits(["update:modelValue"]);

const containerRef = ref(null);
const imageRef = ref(null);
const maxZoom = 1.3;
const scale = ref(0.5);

const calculateMinZoom = () => {
   if (!containerRef.value || !imageRef.value) return 0.35;
   const containerRect = containerRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const imageWidth =
      imageRef.value.naturalWidth ||
      imageRef.value.offsetWidth ||
      containerWidth;
   const minZoomByWidth = containerWidth / imageWidth;
   return Math.max(0.35, minZoomByWidth);
};

const getCenterPosition = (newScale) => {
   if (!containerRef.value || !imageRef.value) return { x: 0, y: 0 };
   const containerRect = containerRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;
   const imageWidth =
      imageRef.value.naturalWidth ||
      imageRef.value.offsetWidth ||
      containerWidth;
   const imageHeight =
      imageRef.value.naturalHeight ||
      imageRef.value.offsetHeight ||
      containerHeight;
   const scaledWidth = imageWidth * newScale;
   const scaledHeight = imageHeight * newScale;
   const centerX = (containerWidth - scaledWidth) / 2;
   const centerY = (containerHeight - scaledHeight) / 2;
   return { x: centerX, y: centerY };
};

const imageDrag = useImageDrag(containerRef, imageRef, scale);

const position = imageDrag.position;

const originalConstrainPosition = imageDrag.constrainPosition;
imageDrag.constrainPosition = (newPosition, currentScale = scale.value) => {
   if (!containerRef.value || !imageRef.value) return newPosition;
   const containerRect = containerRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;
   const imageWidth =
      imageRef.value.naturalWidth ||
      imageRef.value.offsetWidth ||
      containerWidth;
   const imageHeight =
      imageRef.value.naturalHeight ||
      imageRef.value.offsetHeight ||
      containerHeight;
   const scaledWidth = imageWidth * currentScale;
   const scaledHeight = imageHeight * currentScale;
   const minX = containerWidth - scaledWidth;
   const maxX = 0;
   const minY = containerHeight - scaledHeight;
   const maxY = 0;
   if (scaledWidth <= containerWidth) {
      const centerX = (containerWidth - scaledWidth) / 2;
      return {
         x: centerX,
         y: Math.max(
            minY,
            Math.min(maxY, newPosition.y !== 0 ? newPosition.y : (containerHeight - scaledHeight) / 2)
         ),
      };
   }
   if (scaledHeight <= containerHeight) {
      const centerY = (containerHeight - scaledHeight) / 2;
      return {
         x: Math.max(
            minX,
            Math.min(maxX, newPosition.x !== 0 ? newPosition.x : (containerWidth - scaledWidth) / 2)
         ),
         y: centerY,
      };
   }
   return {
      x: Math.max(minX, Math.min(maxX, newPosition.x)),
      y: Math.max(minY, Math.min(maxY, newPosition.y)),
   };
};

const contentStyle = imageDrag.imageStyle;

const handleWheel = (event) => {
   event.preventDefault();
   const delta = event.deltaY > 0 ? -0.1 : 0.1;
   const currentMinZoom = calculateMinZoom();
   const newScale = Math.max(
      currentMinZoom,
      Math.min(maxZoom, scale.value + delta)
   );
   if (newScale === scale.value) return;
   if (!containerRef.value || !imageRef.value) return;

   const rect = containerRef.value.getBoundingClientRect();
   const mouseX = event.clientX - rect.left;
   const mouseY = event.clientY - rect.top;
   const mapX = (mouseX - position.value.x) / scale.value;
   const mapY = (mouseY - position.value.y) / scale.value;

   scale.value = newScale;
   const newPosition = {
      x: mouseX - mapX * newScale,
      y: mouseY - mapY * newScale,
   };
   position.value = imageDrag.constrainPosition(newPosition, newScale);
};

const handleMouseDown = imageDrag.handleMouseDown;
const handleMouseMove = imageDrag.handleMouseMove;
const handleMouseUp = imageDrag.handleMouseUp;
const handleTouchStart = imageDrag.handleTouchStart;
const handleTouchMove = imageDrag.handleTouchMove;
const handleTouchEnd = imageDrag.handleTouchEnd;

const close = () => {
   emit("update:modelValue", false);
};

const initialize = () => {
   if (!imageRef.value || !containerRef.value) return;
   const calculatedMinZoom = calculateMinZoom();
   scale.value = calculatedMinZoom;
   const centerPos = getCenterPosition(calculatedMinZoom);
   position.value = imageDrag.constrainPosition(centerPos, calculatedMinZoom);
};

watch(
   () => props.modelValue,
   (isOpen) => {
      if (isOpen) {
         setTimeout(initialize, 100);
      }
   }
);

const handleKeyDown = (event) => {
   if (event.key === "Escape") {
      close();
   }
};

onMounted(() => {
   window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
   window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.floor-plan-panel {
   position: fixed;
   top: 0;
   right: 0;
   width: min(90vw, 600px);
   height: 100%;
   background: rgba(14, 14, 14, 0.98);
   z-index: 100;
   display: flex;
   flex-direction: column;
   box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
}

.floor-plan-panel-container {
   flex: 1;
   overflow: hidden;
   position: relative;
   cursor: grab;
   touch-action: pan-x pan-y pinch-zoom;
}

.floor-plan-panel-container:active {
   cursor: grabbing;
}

.floor-plan-panel-content {
   position: relative;
   will-change: transform;
   display: inline-block;
}

.floor-plan-panel-image {
   width: auto;
   height: auto;
   max-width: none;
   max-height: none;
   pointer-events: none;
   display: block;
}

.floor-plan-panel-close {
   position: absolute;
   top: 50%;
   right: 1rem;
   transform: translateY(-50%);
   width: 48px;
   height: 48px;
   border-radius: 50%;
   background: rgba(14, 14, 14, 0.6);
   backdrop-filter: blur(8px);
   border: 1px solid rgba(255, 255, 255, 0.2);
   color: #fff;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 101;
   transition: all 0.2s ease;
}

.floor-plan-panel-close:hover {
   background: rgba(14, 14, 14, 0.8);
   border-color: rgba(255, 255, 255, 0.4);
   transform: translateY(-50%) scale(1.05);
}

.floor-plan-panel-close:active {
   transform: translateY(-50%) scale(0.95);
}

@media (max-width: 768px) {
   .floor-plan-panel {
      width: min(95vw, 100%);
   }

   .floor-plan-panel-close {
      right: 0.75rem;
      width: 44px;
      height: 44px;
   }
}

.floor-plan-slide-enter-active,
.floor-plan-slide-leave-active {
   transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.floor-plan-slide-enter-from,
.floor-plan-slide-leave-to {
   transform: translateX(100%);
}

.floor-plan-slide-enter-to,
.floor-plan-slide-leave-from {
   transform: translateX(0);
}
</style>
