<template>
   <transition name="floor-plan-slide">
      <div
         v-if="modelValue"
         class="floor-plan-panel"
      >
         <div
            ref="containerRef"
            :class="['floor-plan-panel-container', { 'floor-plan-panel-container-draggable': !hasMultipleViews, 'floor-plan-panel-container-apartment': hasMultipleViews, 'floor-plan-panel-container-floor': !hasMultipleViews }]"
            @wheel.prevent="handleWheel"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
         >
            <div
               :class="['floor-plan-panel-content', { 'floor-plan-panel-content-apartment': hasMultipleViews }]"
               :style="contentStyle"
            >
               <img
                  v-if="currentImage"
                  ref="imageRef"
                  :src="currentImage"
                  alt="Floor plan"
                  :class="['floor-plan-panel-image', { 'floor-plan-panel-image-apartment': hasMultipleViews }]"
                  @load="onImageLoad"
               />
            </div>
         </div>
         <div v-if="hasMultipleViews" class="floor-plan-toggles">
            <button
               type="button"
               class="floor-plan-toggle"
               :class="{ 'floor-plan-toggle-active': viewMode === '3d' }"
               aria-label="3D"
               @click="viewMode = '3d'"
            />
            <button
               type="button"
               class="floor-plan-toggle"
               :class="{ 'floor-plan-toggle-active': viewMode === '2d' }"
               aria-label="2D"
               @click="viewMode = '2d'"
            />
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import Icon from "./Icon.vue";
import { useImageDrag } from "../composables/useImageDrag.js";

const props = defineProps({
   modelValue: Boolean,
   image: {
      type: [String, Object],
      default: null,
   },
   /** { view3D?, view2D? } — одна 3D по типу 2D, переключатель 3D/2D */
   plans: {
      type: Object,
      default: null,
   },
});

const emit = defineEmits(["update:modelValue"]);

const viewMode = ref("3d");

const resolveUrl = (v) => (v == null ? null : typeof v === "string" ? v : v?.default ?? v);

const normalizedPlans = computed(() => {
   if (!props.plans) return null;
   const view2D = resolveUrl(props.plans.view2D) || resolveUrl(props.image);
   const view3D = resolveUrl(props.plans.view3D) || view2D;
   if (!view2D && !view3D) return null;
   return { view3D, view2D: view2D || view3D };
});

const hasMultipleViews = computed(() => !!normalizedPlans.value);

const currentImage = computed(() => {
   if (normalizedPlans.value) {
      return viewMode.value === "2d" ? normalizedPlans.value.view2D : normalizedPlans.value.view3D;
   }
   return resolveUrl(props.image);
});

const containerRef = ref(null);
const imageRef = ref(null);
const maxZoom = 1.3;
const scale = ref(0.5);

const calculateMinZoom = () => {
   if (!containerRef.value || !imageRef.value) return 0.35;
   const containerRect = containerRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;
   const imageWidth = imageRef.value.naturalWidth || imageRef.value.offsetWidth || containerWidth;
   const imageHeight = imageRef.value.naturalHeight || imageRef.value.offsetHeight || containerHeight;
   if (!imageWidth || !imageHeight) return 0.35;
   const minZoomByWidth = containerWidth / imageWidth;
   const minZoomByHeight = containerHeight / imageHeight;
   return Math.max(0.35, Math.min(minZoomByWidth, minZoomByHeight));
};

const getCenterPosition = (newScale) => {
   if (!containerRef.value || !imageRef.value) return { x: 0, y: 0 };
   const containerRect = containerRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;
   // Для квартир используем offsetWidth/offsetHeight (реальный размер с object-fit), для этажей - naturalWidth
   const useOffsetSize = hasMultipleViews.value;
   const imageWidth = useOffsetSize 
      ? (imageRef.value.offsetWidth || imageRef.value.naturalWidth || containerWidth)
      : (imageRef.value.naturalWidth || imageRef.value.offsetWidth || containerWidth);
   const imageHeight = useOffsetSize
      ? (imageRef.value.offsetHeight || imageRef.value.naturalHeight || containerHeight)
      : (imageRef.value.naturalHeight || imageRef.value.offsetHeight || containerHeight);
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
   // Для квартир используем offsetWidth/offsetHeight (реальный размер с object-fit), для этажей - naturalWidth
   const useOffsetSize = hasMultipleViews.value;
   const imageWidth = useOffsetSize
      ? (imageRef.value.offsetWidth || imageRef.value.naturalWidth || containerWidth)
      : (imageRef.value.naturalWidth || imageRef.value.offsetWidth || containerWidth);
   const imageHeight = useOffsetSize
      ? (imageRef.value.offsetHeight || imageRef.value.naturalHeight || containerHeight)
      : (imageRef.value.naturalHeight || imageRef.value.offsetHeight || containerHeight);
   const scaledWidth = imageWidth * currentScale;
   const scaledHeight = imageHeight * currentScale;
   const minX = containerWidth - scaledWidth;
   const maxX = 0;
   const minY = containerHeight - scaledHeight;
   const maxY = 0;
   // Для квартир разрешаем выход за границы для просмотра обрезанных частей
   if (hasMultipleViews.value) {
      return {
         x: newPosition.x,
         y: newPosition.y,
      };
   }
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
   if (hasMultipleViews.value) return;
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
   const img = imageRef.value;
   if (!img.naturalWidth || !img.naturalHeight) return;
   
   // Для квартир (hasMultipleViews) фиксируем scale на 1 и центрируем без ограничений
   if (hasMultipleViews.value) {
      scale.value = 1;
      // Ждем, чтобы offsetWidth/offsetHeight были доступны после применения object-fit
      nextTick(() => {
         setTimeout(() => {
            if (imageRef.value && containerRef.value) {
               const centerPos = getCenterPosition(1);
               position.value = centerPos;
            }
         }, 50);
      });
   } else {
      // Для этажей ждем готовности размеров
      nextTick(() => {
         setTimeout(() => {
            if (!imageRef.value || !containerRef.value) return;
            const img = imageRef.value;
            if (!img.naturalWidth || !img.naturalHeight) return;
            const calculatedMinZoom = calculateMinZoom();
            scale.value = calculatedMinZoom;
            const centerPos = getCenterPosition(calculatedMinZoom);
            position.value = imageDrag.constrainPosition(centerPos, calculatedMinZoom);
         }, 50);
      });
   }
};

const onImageLoad = () => {
   if (props.modelValue) {
      initialize();
   }
};

watch(
   () => props.modelValue,
   (isOpen) => {
      if (isOpen) {
         nextTick(() => {
            if (imageRef.value?.complete && imageRef.value.naturalWidth) {
               initialize();
            } else {
               setTimeout(() => {
                  if (imageRef.value?.complete && imageRef.value.naturalWidth) {
                     initialize();
                  }
               }, 100);
            }
         });
      } else {
         // При закрытии сбрасываем позицию и scale
         if (!hasMultipleViews.value) {
            scale.value = 0.5;
            position.value = { x: 0, y: 0 };
         }
      }
   }
);

watch(
   () => props.image,
   () => {
      if (props.modelValue && !hasMultipleViews.value) {
         nextTick(() => {
            setTimeout(() => {
               if (imageRef.value?.complete && imageRef.value.naturalWidth) {
                  initialize();
               }
            }, 50);
         });
      }
   }
);

watch(
   [() => viewMode.value, currentImage],
   () => {
      if (props.modelValue && hasMultipleViews.value) {
         nextTick(() => {
            setTimeout(() => {
               if (imageRef.value?.complete && imageRef.value.naturalWidth && containerRef.value) {
                  // При смене вида в квартире фиксируем scale на 1 и центрируем
                  scale.value = 1;
                  const centerPos = getCenterPosition(1);
                  position.value = centerPos;
               }
            }, 100);
         });
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
   top: 50%;
   right: 1rem;
   transform: translateY(-50%);
   width: 546px;
   height: 80vh;
   max-height: 80vh;
   background: #fff;
   border-radius: 40px;
   z-index: 100;
   display: flex;
   flex-direction: column;
   overflow: hidden;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
}

.floor-plan-panel-container {
   flex: 1 1 0;
   overflow: hidden;
   position: relative;
   background: #fff;
   min-height: 0;
   border-top-left-radius: 40px;
   border-top-right-radius: 40px;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 0;
   margin: 0;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
}

.floor-plan-panel-container-apartment {
   align-items: flex-start;
   padding-top: 20px;
   padding-bottom: 0;
   cursor: grab;
   touch-action: pan-x pan-y pinch-zoom;
}

.floor-plan-panel-container-floor {
   align-items: flex-start;
   padding-top: 20px;
   padding-bottom: 0;
}

.floor-plan-panel-container-apartment:active {
   cursor: grabbing;
}

.floor-plan-panel-container-draggable {
   cursor: grab;
   touch-action: pan-x pan-y pinch-zoom;
}

.floor-plan-panel-container-draggable:active {
   cursor: grabbing;
}

.floor-plan-panel-content {
   position: relative;
   will-change: transform;
   display: inline-block;
   margin: 0;
   padding: 0;
}

.floor-plan-panel-content-apartment {
   display: flex;
   align-items: center;
   justify-content: center;
   width: auto;
   height: auto;
}

.floor-plan-panel-image {
   width: auto;
   height: auto;
   max-width: none;
   max-height: none;
   position: absolute;
   top: 0;
   left: 0;
   pointer-events: none;
   display: block;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   -webkit-user-drag: none;
   -khtml-user-drag: none;
   -moz-user-drag: none;
   -o-user-drag: none;
   user-drag: none;
}

.floor-plan-panel-image-apartment {
   position: static;
   max-width: 100%;
   max-height: 100%;
   object-fit: contain;
}

.floor-plan-panel-close {
   position: absolute;
   top: 0.5rem;
   right: 0.5rem;
   width: 36px;
   height: 36px;
   border-radius: 50%;
   background: rgba(14, 14, 14, 0.8);
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
   background: rgba(14, 14, 14, 0.9);
   border-color: rgba(255, 255, 255, 0.4);
   transform: scale(1.05);
}

.floor-plan-panel-close:active {
   transform: scale(0.95);
}

.floor-plan-toggles {
   flex: 0 0 auto;
   position: relative;
   z-index: 10;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 12px;
   padding: 12px 0 16px;
   min-height: 44px;
   background: #fff;
   border-bottom-left-radius: 40px;
   border-bottom-right-radius: 40px;
}

.floor-plan-toggle {
   width: 12px;
   height: 12px;
   border-radius: 50%;
   border: 1px solid #000;
   background: #fff;
   cursor: pointer;
   padding: 0;
   transition: background 0.2s ease, border-color 0.2s ease;
}

.floor-plan-toggle-active {
   background: #000;
   border-color: #000;
}

@media (max-width: 768px) {
   .floor-plan-panel {
      width: min(90vw, 546px);
      height: 80vh;
      right: 0.75rem;
   }

   .floor-plan-panel-close {
      right: 0.5rem;
      top: 0.5rem;
      width: 32px;
      height: 32px;
   }
}

.floor-plan-slide-enter-active,
.floor-plan-slide-leave-active {
   transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.floor-plan-slide-enter-from,
.floor-plan-slide-leave-to {
   transform: translateY(-50%) translateX(calc(100% + 1rem));
   opacity: 0;
}

.floor-plan-slide-enter-to,
.floor-plan-slide-leave-from {
   transform: translateY(-50%) translateX(0);
   opacity: 1;
}
</style>
