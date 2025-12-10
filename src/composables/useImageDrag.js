import { ref, computed } from "vue";

const DRAG_THRESHOLD = 10;

export function useImageDrag(containerRef, imageRef, scale = ref(1), onDragStart = null) {
   const position = ref({ x: 0, y: 0 });
   const isDragging = ref(false);
   const dragStart = ref({ x: 0, y: 0 });
   const lastPosition = ref({ x: 0, y: 0 });
   const touchStartPos = ref({ x: 0, y: 0 });
   const touchStartTime = ref(0);

   let rafId = null;
   let touchRafId = null;

   const getScaleValue = () => {
      if (typeof scale === 'object' && scale !== null && 'value' in scale) {
         return scale.value;
      }
      return typeof scale === 'number' ? scale : 1;
   };

   const constrainPosition = (newPosition, currentScale = null) => {
      const scaleValue = currentScale !== null ? currentScale : getScaleValue();
      if (!containerRef.value || !imageRef.value) return newPosition;

      const containerRect = containerRef.value.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const imageWidth = imageRef.value.offsetWidth || imageRef.value.naturalWidth || containerWidth;
      const imageHeight = imageRef.value.offsetHeight || imageRef.value.naturalHeight || containerHeight;

      const scaledWidth = imageWidth * scaleValue;
      const scaledHeight = imageHeight * scaleValue;

      const minX = Math.min(0, containerWidth - scaledWidth);
      const minY = Math.min(0, containerHeight - scaledHeight);

      let constrainedX, constrainedY;

      if (scaledWidth <= containerWidth) {
         constrainedX = (containerWidth - scaledWidth) / 2;
      } else {
         constrainedX = Math.max(minX, Math.min(0, newPosition.x));
      }

      if (scaledHeight <= containerHeight) {
         constrainedY = (containerHeight - scaledHeight) / 2;
      } else {
         constrainedY = Math.max(minY, Math.min(0, newPosition.y));
      }

      return { x: constrainedX, y: constrainedY };
   };

   const imageStyle = computed(() => {
      const scaleValue = getScaleValue();
      return {
         transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0) scale(${scaleValue})`,
         transformOrigin: "0 0",
         transition: isDragging.value ? "none" : "transform 0.15s ease-out",
         willChange: isDragging.value ? "transform" : "auto",
         backfaceVisibility: "hidden",
         WebkitBackfaceVisibility: "hidden",
      };
   });

   const handleMouseDown = (event) => {
      if (!containerRef.value || !imageRef.value || event.button !== 0) return;

      const target = event.target;
      if (target?.closest?.(".house-outline-hit-area") ||
         target?.closest?.(".house-outline-wrapper")) {
         return;
      }

      isDragging.value = true;
      dragStart.value = {
         x: event.clientX - position.value.x,
         y: event.clientY - position.value.y,
      };
      containerRef.value.style.cursor = "grabbing";
      onDragStart?.();
   };

   const handleMouseMove = (event) => {
      if (!isDragging.value) return;

      if (rafId !== null) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
         rafId = null;
         const newPosition = {
            x: event.clientX - dragStart.value.x,
            y: event.clientY - dragStart.value.y,
         };
         position.value = constrainPosition(newPosition, getScaleValue());
         lastPosition.value = { ...position.value };
      });
   };

   const handleMouseUp = () => {
      isDragging.value = false;
      if (containerRef.value) {
         containerRef.value.style.cursor = "grab";
      }
   };

   const handleTouchStart = (event) => {
      if (!containerRef.value || !imageRef.value || event.touches.length !== 1) return;

      const target = event.target || event.touches[0]?.target;
      if (target?.closest?.(".house-outline-hit-area") ||
         target?.closest?.(".house-outline-wrapper")) {
         return;
      }

      const touch = event.touches[0];
      touchStartPos.value = { x: touch.clientX, y: touch.clientY };
      touchStartTime.value = Date.now();
      isDragging.value = false;
   };

   const handleTouchMove = (event) => {
      if (!event?.touches || event.touches.length !== 1) return;
      if (!containerRef.value || !imageRef.value) return;

      const touch = event.touches[0];

      if (touchStartTime.value === 0) {
         touchStartPos.value = { x: touch.clientX, y: touch.clientY };
         touchStartTime.value = Date.now();
         return;
      }

      const deltaX = Math.abs(touch.clientX - touchStartPos.value.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.value.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!isDragging.value) {
         if (distance > DRAG_THRESHOLD) {
            event.preventDefault();
            isDragging.value = true;
            dragStart.value = {
               x: touch.clientX - position.value.x,
               y: touch.clientY - position.value.y,
            };
            onDragStart?.();
         }
         return;
      }

      event.preventDefault();

      if (touchRafId !== null) cancelAnimationFrame(touchRafId);

      touchRafId = requestAnimationFrame(() => {
         touchRafId = null;
         const newPosition = {
            x: touch.clientX - dragStart.value.x,
            y: touch.clientY - dragStart.value.y,
         };
         position.value = constrainPosition(newPosition, getScaleValue());
         lastPosition.value = { ...position.value };
      });
   };

   const handleTouchEnd = () => {
      isDragging.value = false;
      touchStartPos.value = { x: 0, y: 0 };
      touchStartTime.value = 0;
   };

   const resetPosition = () => {
      position.value = { x: 0, y: 0 };
      lastPosition.value = { x: 0, y: 0 };
   };

   const centerPosition = () => {
      if (!containerRef.value || !imageRef.value) {
         position.value = { x: 0, y: 0 };
         return;
      }

      const containerRect = containerRef.value.getBoundingClientRect();
      const imageWidth = imageRef.value.offsetWidth || imageRef.value.naturalWidth || containerRect.width;
      const imageHeight = imageRef.value.offsetHeight || imageRef.value.naturalHeight || containerRect.height;

      const scaleValue = getScaleValue();
      const scaledWidth = imageWidth * scaleValue;
      const scaledHeight = imageHeight * scaleValue;

      const centeredX = scaledWidth > containerRect.width ? (containerRect.width - scaledWidth) / 2 : 0;
      const centeredY = scaledHeight > containerRect.height ? (containerRect.height - scaledHeight) / 2 : 0;

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
