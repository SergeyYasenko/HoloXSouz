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
            <!-- <div class="map-overlay">
               <Tooltip
                  :x="2150"
                  :y="1750"
                  title="Marasi Drive"
                  :image="marasiDriveTableImage"
                  :image-size="tooltipTableImageSize"
                  position="right"
               >
                  <template #trigger>
                     <img
                        :src="marasiDriveImage"
                        alt="Marasi Drive"
                        class="tooltip-image"
                        :style="{
                           width: tooltipImageSize + 'px',
                           height: tooltipImageSize + 'px',
                           maxWidth: 'none',
                           maxHeight: 'none',
                        }"
                     />
                  </template>
               </Tooltip>

               <Tooltip
                  :x="2200"
                  :y="1800"
                  title="Business Bay"
                  :image="downtownTableImage"
                  :image-size="tooltipTableImageSize"
                  position="left"
               >
                  <template #trigger>
                     <img
                        :src="downtownImage"
                        alt="Business Bay"
                        class="tooltip-image"
                        :style="{
                           width: tooltipImageSize + 'px',
                           height: tooltipImageSize + 'px',
                           maxWidth: 'none',
                           maxHeight: 'none',
                        }"
                     />
                  </template>
               </Tooltip>

               <Tooltip
                  :x="1400"
                  :y="2500"
                  title="Dubai Canal"
                  :image="dubaiMarinaTableImage"
                  :image-size="tooltipTableImageSize"
                  position="right"
               >
                  <template #trigger>
                     <img
                        :src="dubaiMarinaImage"
                        alt="Dubai Canal"
                        class="tooltip-image"
                        :style="{
                           width: tooltipImageSize + 'px',
                           height: tooltipImageSize + 'px',
                           maxWidth: 'none',
                           maxHeight: 'none',
                        }"
                     />
                  </template>
               </Tooltip>
            </div> -->
         </div>
      </div>

      <!-- Информационная панель -->
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

      <!-- Bottom Actions -->
      <div class="map-bottom-actions">
         <BottomActions :show-labels="true" />
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import Tooltip from "../components/Tooltip.vue";
import BottomActions from "../components/BottomActions.vue";
import mapImage from "../assets/img/map-new-desktop.jpg";
import Icon from "../components/Icon.vue";
import marasiDriveImage from "../assets/img/marasi-drive.png";
import downtownImage from "../assets/img/downtown.png";
import dubaiMarinaImage from "../assets/img/dubai-marina.png";
import marasiDriveTableImage from "../assets/img/marasi-drive-table.png";
import downtownTableImage from "../assets/img/downtown-table.png";
import dubaiMarinaTableImage from "../assets/img/dubai-marina-table.png";
import { useImageDrag } from "../composables/useImageDrag.js";

// Map interaction logic
const mapContainer = ref(null);
const mapImageRef = ref(null);
const maxZoom = 1.3;

// Calculate minZoom based on container and image dimensions to prevent black bars
const calculateMinZoom = () => {
   if (!mapContainer.value || !mapImageRef.value) return 0.5;

   const containerRect = mapContainer.value.getBoundingClientRect();
   const containerHeight = containerRect.height;

   // Get actual image dimensions
   const imageHeight =
      mapImageRef.value.naturalHeight ||
      mapImageRef.value.offsetHeight ||
      mapImageRef.value.height ||
      containerHeight;

   // Calculate min zoom to fill container height (prevent black bars top/bottom)
   const minZoomByHeight = containerHeight / imageHeight;

   // Use the larger value to ensure no black bars
   return Math.max(0.5, minZoomByHeight);
};

const minZoom = ref(0.5);
const initialZoom = computed(() => minZoom.value);

const scale = ref(0.5);
const showModal = ref(true);
const lastPosition = ref({ x: 0, y: 0 });

// Use image drag composable
const imageDrag = useImageDrag(mapContainer, mapImageRef, scale, () => {
   // Hide modal on drag start
   if (showModal.value) {
      hideModal();
   }
});

const position = imageDrag.position;
const isDragging = imageDrag.isDragging;

// Override constrainPosition with Map-specific logic
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

// Override handleMouseMove and handleTouchMove to use custom constrainPosition
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

// Track pinch zoom state
const initialPinchDistance = ref(0);
const initialPinchScale = ref(1);
const initialPinchCenter = ref({ x: 0, y: 0 });
const isPinching = ref(false);

const originalHandleTouchStart = imageDrag.handleTouchStart;
imageDrag.handleTouchStart = (event) => {
   if (event.touches.length === 2) {
      // Pinch zoom start
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

      // Calculate center point
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      initialPinchCenter.value = { x: centerX, y: centerY };

      // Calculate the point in the map coordinate system
      const containerRect = mapContainer.value.getBoundingClientRect();
      initialPinchCenter.value.mapX =
         (centerX - containerRect.left - position.value.x) / scale.value;
      initialPinchCenter.value.mapY =
         (centerY - containerRect.top - position.value.y) / scale.value;
   } else if (event.touches.length === 1) {
      // Single touch - use original handler
      originalHandleTouchStart(event);
   }
};

const originalHandleTouchMove = imageDrag.handleTouchMove;
imageDrag.handleTouchMove = (event) => {
   if (event.touches.length === 2) {
      // Pinch zoom
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

            // Adjust position to keep the same point under fingers
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
      // Single touch drag
      event.preventDefault();
      const touch = event.touches[0];
      const newPosition = {
         x: touch.clientX - imageDrag.dragStart.value.x,
         y: touch.clientY - imageDrag.dragStart.value.y,
      };
      position.value = imageDrag.constrainPosition(newPosition, scale.value);
      lastPosition.value = { ...position.value };
   } else if (event.touches.length === 1) {
      // Single touch but not dragging - use original handler
      originalHandleTouchMove(event);
   }
};

const originalHandleTouchEnd = imageDrag.handleTouchEnd;
imageDrag.handleTouchEnd = (event) => {
   if (event.touches.length === 0 || event.touches.length === 1) {
      // Pinch ended
      isPinching.value = false;
      initialPinchDistance.value = 0;

      // If only one touch remains, continue with single touch handling
      if (event.touches.length === 1) {
         originalHandleTouchStart(event);
      } else {
         originalHandleTouchEnd(event);
      }
   } else {
      originalHandleTouchEnd(event);
   }
};

// Watch position changes to update lastPosition
watch(
   position,
   (newPos) => {
      lastPosition.value = { ...newPos };
   },
   { deep: true }
);

const mapStyle = imageDrag.imageStyle;

// Calculate table image size proportionally to main image size
// Table images should scale proportionally with main images
const tooltipTableImageSize = computed(() => {
   // Calculate proportional size based on main image size
   // Main image: 520px (min) to 60px (max)
   // Table image: proportionally smaller
   const mainImageSize = tooltipImageSize.value;
   const mainMinSize = 420;
   const mainMaxSize = 60;

   // Calculate proportion (0 to 1)
   const proportion =
      (mainImageSize - mainMaxSize) / (mainMinSize - mainMaxSize);

   // Table image sizes proportionally
   const tableMinSize = 300; // Size when main is at min (520px)
   const tableMaxSize = 100; // Size when main is at max (60px)

   // Interpolate table size based on main image proportion
   const tableSize = tableMaxSize + (tableMinSize - tableMaxSize) * proportion;

   return Math.max(tableMaxSize, Math.min(tableMinSize, tableSize));
});

// Calculate icon size based on zoom level
// At min zoom: 220px, at max zoom: 60px
const tooltipImageSize = computed(() => {
   const minSize = 320; // Size at minimum zoom (most zoomed out)
   const maxSize = 60; // Size at maximum zoom (most zoomed in)

   try {
      if (!mapContainer.value || !mapImageRef.value) {
         return minSize; // Default size
      }

      const currentMinZoom = calculateMinZoom();
      if (!currentMinZoom || currentMinZoom <= 0) {
         return minSize;
      }

      // Linear interpolation between min and max zoom
      const zoomRange = maxZoom - currentMinZoom;
      if (zoomRange <= 0) return minSize;

      const currentScale = scale.value || currentMinZoom;
      const zoomProgress = Math.max(
         0,
         Math.min(1, (currentScale - currentMinZoom) / zoomRange)
      );
      const size = minSize - (minSize - maxSize) * zoomProgress;

      const calculatedSize = Math.max(maxSize, Math.min(minSize, size));
      return isNaN(calculatedSize) || calculatedSize <= 0
         ? minSize
         : calculatedSize;
   } catch (error) {
      console.warn("Error calculating tooltip image size:", error);
      return minSize;
   }
});

// Get center position for the map
const getCenterPosition = (newScale) => {
   if (!mapContainer.value || !mapImageRef.value) return { x: 0, y: 0 };

   const containerRect = mapContainer.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;

   // Get actual image dimensions
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

   // Calculate scaled dimensions
   const scaledWidth = imageWidth * newScale;
   const scaledHeight = imageHeight * newScale;

   // Calculate center position
   const centerX = (containerWidth - scaledWidth) / 2;
   const centerY = (containerHeight - scaledHeight) / 2;

   return { x: centerX, y: centerY };
};

// constrainPosition is now defined in imageDrag composable and overridden above

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

   // Calculate the point in the map coordinate system (relative to top-left of container)
   const mapX = (mouseX - position.value.x) / scale.value;
   const mapY = (mouseY - position.value.y) / scale.value;

   // Update scale
   scale.value = newScale;

   // Adjust position to keep the same point under the mouse
   const newPosition = {
      x: mouseX - mapX * newScale,
      y: mouseY - mapY * newScale,
   };

   // Constrain position to bounds using custom function
   position.value = imageDrag.constrainPosition(newPosition, newScale);
   lastPosition.value = { ...position.value };
};

const hideModal = () => {
   showModal.value = false;
};

const handleContainerClick = (event) => {
   // Hide modal when clicking anywhere on container or modal
   if (showModal.value) {
      hideModal();
   }
};

// Use handlers from composable
const handleMouseDown = imageDrag.handleMouseDown;
const handleMouseMove = imageDrag.handleMouseMove;
const handleMouseUp = imageDrag.handleMouseUp;
const handleTouchStart = imageDrag.handleTouchStart;
const handleTouchMove = imageDrag.handleTouchMove;
const handleTouchEnd = imageDrag.handleTouchEnd;

const resetMap = () => {
   const currentMinZoom = calculateMinZoom();
   scale.value = currentMinZoom;
   // Reset to center position
   const centerPos = getCenterPosition(currentMinZoom);
   position.value = imageDrag.constrainPosition(centerPos, currentMinZoom);
   lastPosition.value = { ...position.value };
};

// Keyboard controls
const handleKeyDown = (event) => {
   if (event.key === "r" || event.key === "R") {
      resetMap();
   }
};

// Update cursor based on zoom
const updateCursor = () => {
   if (mapContainer.value) {
      mapContainer.value.style.cursor = "grab";
   }
};

const initializeMap = () => {
   if (mapImageRef.value && mapContainer.value) {
      // Calculate min zoom based on actual dimensions
      const calculatedMinZoom = calculateMinZoom();
      minZoom.value = calculatedMinZoom;

      // Wait for image to load
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
   // Recalculate min zoom on window resize
   const calculatedMinZoom = calculateMinZoom();
   minZoom.value = calculatedMinZoom;

   // If current scale is below new min zoom, adjust it
   if (scale.value < calculatedMinZoom) {
      scale.value = calculatedMinZoom;
   }

   // Recalculate position
   position.value = imageDrag.constrainPosition(position.value, scale.value);
   lastPosition.value = { ...position.value };
};

onMounted(() => {
   window.addEventListener("keydown", handleKeyDown);
   window.addEventListener("resize", handleResize);
   if (mapContainer.value) {
      mapContainer.value.style.cursor = "grab";
   }
   // Initialize map position after a short delay to ensure image is loaded
   setTimeout(initializeMap, 100);
});

onUnmounted(() => {
   window.removeEventListener("keydown", handleKeyDown);
   window.removeEventListener("resize", handleResize);
});

// Watch scale changes
watch(scale, (newScale) => {
   updateCursor();
   // Ensure scale doesn't go below calculated min zoom
   const currentMinZoom = calculateMinZoom();
   if (newScale < currentMinZoom) {
      scale.value = currentMinZoom;
      return;
   }
   // Constrain position when scale changes
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

.map-overlay {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   pointer-events: none;
}

.map-overlay > * {
   pointer-events: all;
}

.tooltip-image {
   position: absolute;
   cursor: pointer;
   pointer-events: all;
   transform: translate(-50%, -50%);
   transition: all 0.3s ease;
   object-fit: contain;
   display: block !important;
   min-width: 60px;
   min-height: 60px;
   max-width: none !important;
   max-height: none !important;
   z-index: inherit;
}

.tooltip-image:hover {
   transform: translate(-50%, -50%) scale(1.1);
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
