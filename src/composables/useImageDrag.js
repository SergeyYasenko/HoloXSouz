import { ref, computed, watch } from "vue";

/**
 * Composable for image drag and drop functionality
 * @param {Ref} containerRef - Reference to the container element
 * @param {Ref} imageRef - Reference to the image element
 * @param {Ref} scale - Scale factor (default: 1)
 * @param {Function} onDragStart - Optional callback when drag starts
 */
export function useImageDrag(containerRef, imageRef, scale = ref(1), onDragStart = null) {
   const position = ref({ x: 0, y: 0 });
   const isDragging = ref(false);
   const dragStart = ref({ x: 0, y: 0 });
   const lastPosition = ref({ x: 0, y: 0 });

   // Helper to get scale value
   const getScaleValue = () => {
      if (typeof scale === 'object' && scale !== null && 'value' in scale) {
         return scale.value;
      }
      return typeof scale === 'number' ? scale : 1;
   };

   // Constrain position to keep image within bounds
   const constrainPosition = (newPosition, currentScale = null) => {
      // Use provided scale or get from ref
      const scaleValue = currentScale !== null ? currentScale : getScaleValue();
      if (!containerRef.value || !imageRef.value) return newPosition;

      const containerRect = containerRef.value.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Get actual image dimensions
      const imageWidth =
         imageRef.value.naturalWidth ||
         imageRef.value.offsetWidth ||
         imageRef.value.width ||
         containerWidth;
      const imageHeight =
         imageRef.value.naturalHeight ||
         imageRef.value.offsetHeight ||
         imageRef.value.height ||
         containerHeight;

      // Calculate scaled dimensions
      const scaledWidth = imageWidth * scaleValue;
      const scaledHeight = imageHeight * scaleValue;

      // Calculate bounds
      const minX = containerWidth - scaledWidth;
      const maxX = 0;
      const minY = containerHeight - scaledHeight;
      const maxY = 0;

      // If scaled image is smaller than container, allow centering
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

      // Constrain position - prevent showing areas outside image
      return {
         x: Math.max(minX, Math.min(maxX, newPosition.x)),
         y: Math.max(minY, Math.min(maxY, newPosition.y)),
      };
   };

   // Image style for drag and drop
   const imageStyle = computed(() => {
      const scaleValue = getScaleValue();
      return {
         transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scaleValue})`,
         transformOrigin: "0 0",
         transition: isDragging.value ? "none" : "transform 0.1s ease-out",
         willChange: "transform",
      };
   });

   // Mouse handlers
   const handleMouseDown = (event) => {
      if (!containerRef.value || !imageRef.value) return;

      if (event.button === 0) {
         // Left mouse button
         isDragging.value = true;
         dragStart.value = {
            x: event.clientX - position.value.x,
            y: event.clientY - position.value.y,
         };
         if (containerRef.value) {
            containerRef.value.style.cursor = "grabbing";
         }
         if (onDragStart) {
            onDragStart();
         }
      }
   };

   const handleMouseMove = (event) => {
      if (isDragging.value) {
         const newPosition = {
            x: event.clientX - dragStart.value.x,
            y: event.clientY - dragStart.value.y,
         };
         // Constrain position to bounds
         position.value = constrainPosition(newPosition, getScaleValue());
         lastPosition.value = { ...position.value };
      }
   };

   const handleMouseUp = () => {
      isDragging.value = false;
      if (containerRef.value) {
         containerRef.value.style.cursor = "grab";
      }
   };

   // Touch handlers for mobile
   const handleTouchStart = (event) => {
      if (!containerRef.value || !imageRef.value) return;

      if (event.touches.length === 1) {
         // Single touch - allow dragging
         isDragging.value = true;
         const touch = event.touches[0];
         dragStart.value = {
            x: touch.clientX - position.value.x,
            y: touch.clientY - position.value.y,
         };
         if (onDragStart) {
            onDragStart();
         }
      }
   };

   const handleTouchMove = (event) => {
      if (isDragging.value && event.touches.length === 1) {
         event.preventDefault(); // Prevent scrolling
         const touch = event.touches[0];
         const newPosition = {
            x: touch.clientX - dragStart.value.x,
            y: touch.clientY - dragStart.value.y,
         };
         // Constrain position to bounds
         position.value = constrainPosition(newPosition, getScaleValue());
         lastPosition.value = { ...position.value };
      }
   };

   const handleTouchEnd = () => {
      isDragging.value = false;
   };

   // Reset position
   const resetPosition = () => {
      position.value = { x: 0, y: 0 };
      lastPosition.value = { x: 0, y: 0 };
   };

   return {
      position,
      isDragging,
      dragStart,
      imageStyle,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      resetPosition,
      constrainPosition,
   };
}

