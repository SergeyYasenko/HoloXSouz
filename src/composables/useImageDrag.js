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

   // Constrain position to keep image within bounds (no black background)
   const constrainPosition = (newPosition, currentScale = null) => {
      // Use provided scale or get from ref
      const scaleValue = currentScale !== null ? currentScale : getScaleValue();
      if (!containerRef.value || !imageRef.value) return newPosition;

      const containerRect = containerRef.value.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Get DISPLAYED image dimensions (how the image is actually rendered)
      // Use offsetWidth/Height for rendered size, or naturalWidth/Height as fallback
      const imageWidth = imageRef.value.offsetWidth || imageRef.value.naturalWidth || containerWidth;
      const imageHeight = imageRef.value.offsetHeight || imageRef.value.naturalHeight || containerHeight;

      // Calculate scaled dimensions
      const scaledWidth = imageWidth * scaleValue;
      const scaledHeight = imageHeight * scaleValue;

      // Calculate bounds - prevent showing black areas outside the image
      // minX/minY are the maximum negative offsets (right/bottom edges of image at container edges)
      // maxX/maxY are 0 (left/top edges of image at container edges)
      const minX = Math.min(0, containerWidth - scaledWidth);
      const maxX = 0;
      const minY = Math.min(0, containerHeight - scaledHeight);
      const maxY = 0;

      // If image is smaller than container in a dimension, center it and don't allow movement
      let constrainedX = newPosition.x;
      let constrainedY = newPosition.y;

      if (scaledWidth <= containerWidth) {
         // Image is narrower than container - center it horizontally
         constrainedX = (containerWidth - scaledWidth) / 2;
      } else {
         // Image is wider than container - constrain to bounds
         constrainedX = Math.max(minX, Math.min(maxX, newPosition.x));
      }

      if (scaledHeight <= containerHeight) {
         // Image is shorter than container - center it vertically
         constrainedY = (containerHeight - scaledHeight) / 2;
      } else {
         // Image is taller than container - constrain to bounds
         constrainedY = Math.max(minY, Math.min(maxY, newPosition.y));
      }

      return { x: constrainedX, y: constrainedY };
   };

   // Image style for drag and drop (applied to container, not image)
   const imageStyle = computed(() => {
      const scaleValue = getScaleValue();
      return {
         transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scaleValue})`,
         transformOrigin: "0 0",
         transition: isDragging.value ? "none" : "transform 0.1s ease-out",
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

   // Reset position to center
   const resetPosition = () => {
      position.value = { x: 0, y: 0 };
      lastPosition.value = { x: 0, y: 0 };
   };

   // Center position - calculates centered position for the image
   const centerPosition = () => {
      if (!containerRef.value || !imageRef.value) {
         position.value = { x: 0, y: 0 };
         return;
      }

      const containerRect = containerRef.value.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const imageWidth = imageRef.value.offsetWidth || imageRef.value.naturalWidth || containerWidth;
      const imageHeight = imageRef.value.offsetHeight || imageRef.value.naturalHeight || containerHeight;

      const scaleValue = getScaleValue();
      const scaledWidth = imageWidth * scaleValue;
      const scaledHeight = imageHeight * scaleValue;

      // Center the image
      let centeredX = 0;
      let centeredY = 0;

      if (scaledWidth > containerWidth) {
         // Image is wider than container - center horizontally
         centeredX = (containerWidth - scaledWidth) / 2;
      }

      if (scaledHeight > containerHeight) {
         // Image is taller than container - center vertically
         centeredY = (containerHeight - scaledHeight) / 2;
      }

      position.value = { x: centeredX, y: centeredY };
      lastPosition.value = { ...position.value };
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
      centerPosition,
      constrainPosition,
   };
}

