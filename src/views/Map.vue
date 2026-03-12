<template>
   <div class="map-page">
      <div
         class="map-container"
         ref="mapContainer"
         @wheel.prevent="handleWheel"
         @click="handleContainerClick"
      >
         <transition name="modal-fade">
            <div
               v-if="showModal"
               class="map-container-modal"
               @click="hideModal"
            >
               <div class="map-container-modal-content">
                  <div class="map-container-modal-icons">
                     <div class="map-container-modal-icon">
                        <Icon name="zoom-in" :size="54" color="currentColor" />
                     </div>
                     <div class="map-container-modal-icon">
                        <Icon name="open" :size="54" color="currentColor" />
                     </div>
                  </div>
                  <div class="map-container-modal-text">
                     <p>Zoom and Move to select a location</p>
                  </div>
               </div>
            </div>
         </transition>
         <div
            class="map-content"
            :style="mapStyle"
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
               ref="mapImageRef"
               :src="mapImage"
               alt="Map"
               class="map-image"
            />
         </div>
      </div>

      <div class="map-info-panel">
         <div class="map-info-items">
            <div class="map-info-item">
               <span class="map-info-label">Mon</span>
               <span class="map-info-value">5:07</span>
            </div>
            <div class="map-info-item map-info-item-month">
               <span class="map-info-label">1 Dec</span>
               <span class="map-info-value">PM</span>
            </div>
         </div>
         <div class="map-info-temperature">26°C</div>
      </div>

      <div class="map-bottom-actions">
         <BottomActions :show-labels="true" />
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import BottomActions from "../components/BottomActions.vue";
import mapImage from "../assets/holo/Build-start.jpeg";
import Icon from "../components/Icon.vue";
import { useImageDrag } from "../composables/useImageDrag.js";

const mapContainer = ref(null);
const mapImageRef = ref(null);
const maxZoom = 1.3;

const calculateMinZoom = () => {
   if (!mapContainer.value || !mapImageRef.value) return 0.5;

   const containerRect = mapContainer.value.getBoundingClientRect();
   const containerWidth = containerRect.width;

   const imageWidth =
      mapImageRef.value.naturalWidth ||
      mapImageRef.value.offsetWidth ||
      mapImageRef.value.width ||
      containerWidth;

   const minZoomByWidth = containerWidth / imageWidth;

   return Math.max(0.5, minZoomByWidth);
};

const minZoom = ref(0.5);
const scale = ref(0.5);
const showModal = ref(true);
const lastPosition = ref({ x: 0, y: 0 });

const imageDrag = useImageDrag(mapContainer, mapImageRef, scale, () => {
   if (showModal.value) {
      hideModal();
   }
});

const position = imageDrag.position;
const isDragging = imageDrag.isDragging;

const originalConstrainPosition = imageDrag.constrainPosition;
imageDrag.constrainPosition = (newPosition, currentScale = scale.value) => {
   if (!mapContainer.value || !mapImageRef.value) return newPosition;

   const containerRect = mapContainer.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;

   const imageWidth =
      mapImageRef.value.naturalWidth ||
      mapImageRef.value.offsetWidth ||
      mapImageRef.value.width ||
      containerWidth;
   const imageHeight =
      mapImageRef.value.naturalHeight ||
      mapImageRef.value.offsetHeight ||
      mapImageRef.value.height ||
      containerHeight;

   const scaledWidth = imageWidth * currentScale;
   const scaledHeight = imageHeight * currentScale;

   const minX = containerWidth - scaledWidth;
   const maxX = 0;
   const minY = containerHeight - scaledHeight;
   const maxY = 0;

   const currentMinZoom = calculateMinZoom();
   const isAtMinZoom = Math.abs(currentScale - currentMinZoom) < 0.01;

   if (isAtMinZoom && scaledHeight >= containerHeight) {
      const constrainedY = Math.max(minY, Math.min(maxY, newPosition.y));
      if (scaledWidth > containerWidth) {
         return {
            x: Math.max(minX, Math.min(maxX, newPosition.x)),
            y: constrainedY,
         };
      } else {
         const centerX = (containerWidth - scaledWidth) / 2;
         return {
            x: centerX,
            y: constrainedY,
         };
      }
   }

   if (scaledWidth <= containerWidth) {
      const centerX = (containerWidth - scaledWidth) / 2;
      return {
         x: Math.max(
            minX,
            Math.min(maxX, newPosition.x !== 0 ? newPosition.x : centerX)
         ),
         y: newPosition.y,
      };
   }
   if (scaledHeight <= containerHeight) {
      const centerY = (containerHeight - scaledHeight) / 2;
      return {
         x: newPosition.x,
         y: Math.max(
            minY,
            Math.min(maxY, newPosition.y !== 0 ? newPosition.y : centerY)
         ),
      };
   }

   return {
      x: Math.max(minX, Math.min(maxX, newPosition.x)),
      y: Math.max(minY, Math.min(maxY, newPosition.y)),
   };
};

const originalHandleMouseMove = imageDrag.handleMouseMove;
imageDrag.handleMouseMove = (event) => {
   if (isDragging.value) {
      const newPosition = {
         x: event.clientX - imageDrag.dragStart.value.x,
         y: event.clientY - imageDrag.dragStart.value.y,
      };
      position.value = imageDrag.constrainPosition(newPosition, scale.value);
      lastPosition.value = { ...position.value };
   }
};

const initialPinchDistance = ref(0);
const initialPinchScale = ref(1);
const initialPinchCenter = ref({ x: 0, y: 0 });
const isPinching = ref(false);

const originalHandleTouchStart = imageDrag.handleTouchStart;
imageDrag.handleTouchStart = (event) => {
   if (event.touches.length === 2) {
      event.preventDefault();
      isPinching.value = true;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
         Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      initialPinchDistance.value = distance;
      initialPinchScale.value = scale.value;

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      initialPinchCenter.value = { x: centerX, y: centerY };

      const containerRect = mapContainer.value.getBoundingClientRect();
      initialPinchCenter.value.mapX =
         (centerX - containerRect.left - position.value.x) / scale.value;
      initialPinchCenter.value.mapY =
         (centerY - containerRect.top - position.value.y) / scale.value;
   } else if (event.touches.length === 1) {
      originalHandleTouchStart(event);
   }
};

const originalHandleTouchMove = imageDrag.handleTouchMove;
imageDrag.handleTouchMove = (event) => {
   if (event.touches.length === 2) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
         Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (initialPinchDistance.value > 0) {
         const scaleRatio = distance / initialPinchDistance.value;
         const newScale = Math.max(
            calculateMinZoom(),
            Math.min(maxZoom, initialPinchScale.value * scaleRatio)
         );

         if (newScale !== scale.value) {
            scale.value = newScale;

            const containerRect = mapContainer.value.getBoundingClientRect();
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;

            const newPosition = {
               x:
                  centerX -
                  containerRect.left -
                  initialPinchCenter.value.mapX * newScale,
               y:
                  centerY -
                  containerRect.top -
                  initialPinchCenter.value.mapY * newScale,
            };

            position.value = imageDrag.constrainPosition(newPosition, newScale);
            lastPosition.value = { ...position.value };
         }
      }
   } else if (isDragging.value && event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      const newPosition = {
         x: touch.clientX - imageDrag.dragStart.value.x,
         y: touch.clientY - imageDrag.dragStart.value.y,
      };
      position.value = imageDrag.constrainPosition(newPosition, scale.value);
      lastPosition.value = { ...position.value };
   } else if (event.touches.length === 1) {
      originalHandleTouchMove(event);
   }
};

const originalHandleTouchEnd = imageDrag.handleTouchEnd;
imageDrag.handleTouchEnd = (event) => {
   if (event.touches.length === 0 || event.touches.length === 1) {
      isPinching.value = false;
      initialPinchDistance.value = 0;

      if (event.touches.length === 1) {
         originalHandleTouchStart(event);
      } else {
         originalHandleTouchEnd(event);
      }
   } else {
      originalHandleTouchEnd(event);
   }
};

watch(
   position,
   (newPos) => {
      lastPosition.value = { ...newPos };
   },
   { deep: true }
);

const mapStyle = imageDrag.imageStyle;

const getCenterPosition = (newScale) => {
   if (!mapContainer.value || !mapImageRef.value) return { x: 0, y: 0 };

   const containerRect = mapContainer.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;

   const imageWidth =
      mapImageRef.value.naturalWidth ||
      mapImageRef.value.offsetWidth ||
      mapImageRef.value.width ||
      containerWidth;
   const imageHeight =
      mapImageRef.value.naturalHeight ||
      mapImageRef.value.offsetHeight ||
      mapImageRef.value.height ||
      containerHeight;

   const scaledWidth = imageWidth * newScale;
   const scaledHeight = imageHeight * newScale;

   const centerX = (containerWidth - scaledWidth) / 2;
   const centerY = (containerHeight - scaledHeight) / 2;

   return { x: centerX, y: centerY };
};

const handleWheel = (event) => {
   event.preventDefault();
   const delta = event.deltaY > 0 ? -0.1 : 0.1;
   const currentMinZoom = calculateMinZoom();
   const newScale = Math.max(
      currentMinZoom,
      Math.min(maxZoom, scale.value + delta)
   );

   if (newScale === scale.value) return;

   if (!mapContainer.value || !mapImageRef.value) return;

   const rect = mapContainer.value.getBoundingClientRect();
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
   lastPosition.value = { ...position.value };
};

const hideModal = () => {
   showModal.value = false;
};

const handleContainerClick = (event) => {
   if (showModal.value) {
      hideModal();
   }
};

const handleMouseDown = imageDrag.handleMouseDown;
const handleMouseMove = imageDrag.handleMouseMove;
const handleMouseUp = imageDrag.handleMouseUp;
const handleTouchStart = imageDrag.handleTouchStart;
const handleTouchMove = imageDrag.handleTouchMove;
const handleTouchEnd = imageDrag.handleTouchEnd;

const resetMap = () => {
   const currentMinZoom = calculateMinZoom();
   scale.value = currentMinZoom;
   const centerPos = getCenterPosition(currentMinZoom);
   position.value = imageDrag.constrainPosition(centerPos, currentMinZoom);
   lastPosition.value = { ...position.value };
};

const handleKeyDown = (event) => {
   if (event.key === "r" || event.key === "R") {
      resetMap();
   }
};

const updateCursor = () => {
   if (mapContainer.value) {
      mapContainer.value.style.cursor = "grab";
   }
};

const initializeMap = () => {
   if (mapImageRef.value && mapContainer.value) {
      const calculatedMinZoom = calculateMinZoom();
      minZoom.value = calculatedMinZoom;

      if (mapImageRef.value.complete) {
         scale.value = calculatedMinZoom;
         const centerPos = getCenterPosition(calculatedMinZoom);
         position.value = imageDrag.constrainPosition(
            centerPos,
            calculatedMinZoom
         );
         lastPosition.value = { ...position.value };
      } else {
         mapImageRef.value.onload = () => {
            const calculatedMinZoom = calculateMinZoom();
            minZoom.value = calculatedMinZoom;
            scale.value = calculatedMinZoom;
            const centerPos = getCenterPosition(calculatedMinZoom);
            position.value = imageDrag.constrainPosition(
               centerPos,
               calculatedMinZoom
            );
            lastPosition.value = { ...position.value };
         };
      }
   }
};

const handleResize = () => {
   const calculatedMinZoom = calculateMinZoom();
   minZoom.value = calculatedMinZoom;

   if (scale.value < calculatedMinZoom) {
      scale.value = calculatedMinZoom;
   }

   position.value = imageDrag.constrainPosition(position.value, scale.value);
   lastPosition.value = { ...position.value };
};

onMounted(() => {
   window.addEventListener("keydown", handleKeyDown);
   window.addEventListener("resize", handleResize);
   if (mapContainer.value) {
      mapContainer.value.style.cursor = "grab";
   }
   setTimeout(initializeMap, 100);
});

onUnmounted(() => {
   window.removeEventListener("keydown", handleKeyDown);
   window.removeEventListener("resize", handleResize);
});

watch(scale, (newScale) => {
   updateCursor();
   const currentMinZoom = calculateMinZoom();
   if (newScale < currentMinZoom) {
      scale.value = currentMinZoom;
      return;
   }
   position.value = imageDrag.constrainPosition(position.value, newScale);
   lastPosition.value = { ...position.value };
});
</script>

<style scoped>
.map-page {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   overflow: hidden;
}

.map-container {
   width: 100%;
   height: 100%;
   overflow: hidden;
   position: relative;
   background: #000;
   user-select: none;
   touch-action: pan-x pan-y pinch-zoom;
}

.map-content {
   position: relative;
   will-change: transform;
   transition: transform 0.1s ease-out;
   display: inline-block;
}

.map-container-modal {
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   color: #fff;
   padding: 1rem;
   border-radius: 1rem;
   font-size: 1.2rem;
   z-index: 10;
   text-align: center;
}

.map-container-modal-content {
   max-width: 200px;
   width: 100%;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 1rem;
}

.map-container-modal-icons {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 1rem;
   color: #fff;
}

/* Modal fade animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
   transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from {
   opacity: 0;
   transform: translate(-50%, -50%) scale(0.9);
}

.modal-fade-leave-to {
   opacity: 0;
   transform: translate(-50%, -50%) scale(0.9);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
   opacity: 1;
   transform: translate(-50%, -50%) scale(1);
}

.map-image {
   width: auto;
   height: auto;
   max-width: none;
   max-height: none;
   pointer-events: none;
   display: block;
}

.map-info-panel {
   position: absolute;
   top: 60px;
   left: 60px;
   max-width: 250px;
   width: 100%;
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   padding: 32px 0px;
   border-radius: 12px;
   color: #fff;
   pointer-events: all;
   z-index: 10;
   transition: transform 0.3s ease;
}

.map-info-items {
   border-bottom: 1px solid #a9a9aa;
   margin-bottom: 12px;
   padding: 0 32px;
}

.map-info-item-month {
   color: #a9a9aa;
}

.map-info-item {
   display: flex;
   justify-content: space-between;
   gap: 4px;
   margin-bottom: 0;
   padding-bottom: 16px;
}

.map-info-item:last-of-type {
   border-bottom: none;
   margin-bottom: 12px;
}

.map-info-label {
   font-size: 12px;
   opacity: 0.7;
   text-transform: uppercase;
   letter-spacing: 0.5px;
   font-weight: 600;
   color: inherit;
}

.map-info-value {
   font-size: 14px;
   opacity: 0.9;
   color: inherit;
}

.map-info-temperature {
   font-size: 2rem;
   font-weight: 600;
   color: #fff;
   padding: 0 32px;
}

.map-bottom-actions {
   position: absolute;
   bottom: 60px;
   right: 60px;
   z-index: 10;
}

@media (max-width: 1024px) {
   .map-info-panel {
      top: 20px;
      right: auto;
      left: auto;
      max-width: none;
      padding: 16px 10px;
   }

   .map-info-items {
      padding: 0 20px;
      margin-bottom: 10px;
   }

   .map-info-item {
      padding-bottom: 10px;
      font-size: 0.9em;
   }

   .map-info-item:last-of-type {
      margin-bottom: 0;
   }

   .map-info-label {
      font-size: 10px;
   }

   .map-info-value {
      font-size: 12px;
   }

   .map-info-temperature {
      font-size: 1.5rem;
      padding: 0 20px;
   }

   .map-info-title {
      font-size: 1.25rem;
   }
}
</style>
