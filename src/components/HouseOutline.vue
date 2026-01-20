<template>
   <div
      class="house-outline-wrapper"
      :style="wrapperStyle"
      :data-always-visible="alwaysVisible"
   >
      <canvas
         ref="canvasRef"
         class="house-outline-canvas"
         :class="{
            'house-outline-canvas-visible': isVisible || props.alwaysVisible,
            'house-outline-canvas-instant': alwaysVisibleChanging,
         }"
         :style="canvasStyle"
      ></canvas>
      <div
         ref="hitAreaRef"
         class="house-outline-hit-area"
         :class="{ 'house-outline-hit-area-pointer': isCursorInside }"
         :style="{ ...wrapperStyle, clipPath: getClipPath() }"
         @mousemove="handleMouseMove"
         @mouseenter="handleMouseEnter"
         @mouseleave="handleMouseLeave"
         @click.stop="handleClick"
         @touchstart.stop="handleTouchStart"
         @touchend.stop="handleTouchEnd"
      ></div>
   </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useHouseOutlineCanvas } from "../composables/useHouseOutlineCanvas.js";

const props = defineProps({
   points: {
      type: Array,
      default: () => [],
   },
   path: {
      type: String,
      default: "",
   },
   strokeColor: {
      type: String,
      default: "transparent",
   },
   strokeWidth: {
      type: Number,
      default: 3,
   },
   glowColor: {
      type: String,
      default: "rgba(0, 255, 255, 0.2)",
   },
   glowBlur: {
      type: Number,
      default: 20,
   },
   animated: {
      type: Boolean,
      default: true,
   },
   animationSpeed: {
      type: Number,
      default: 2000,
   },
   onClick: {
      type: Function,
      default: null,
   },
   alwaysVisible: {
      type: Boolean,
      default: false,
   },
});

const {
   getImageCoverInfo,
   getVideoSize,
   isPointInPath: checkPointInPath,
   drawOutline,
   getClipPath: getClipPathFromPoints,
   findVisibleElement,
} = useHouseOutlineCanvas();

const canvasRef = ref(null);
const hitAreaRef = ref(null);
const canvasStyle = ref({});
const wrapperStyle = ref({});
const isVisible = ref(false);
const alwaysVisibleChanging = ref(false);
let animationFrame = null;
let animationStartTime = 0;

const checkMousePosition = (clientX, clientY) => {
   if (!hitAreaRef.value) return false;

   const rect = hitAreaRef.value.getBoundingClientRect();
   const x = clientX - rect.left;
   const y = clientY - rect.top;

   if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return false;
   }

   const size = getVideoSize();

   if (
      !size ||
      !size.width ||
      !size.height ||
      size.width <= 0 ||
      size.height <= 0
   ) {
      return false;
   }

   return checkPointInPath(
      props.points,
      x,
      y,
      size.offsetX || 0,
      size.offsetY || 0
   );
};

const getClipPath = () => {
   return getClipPathFromPoints(props.points);
};

const updateCanvas = (forceDraw = false) => {
   if (!canvasRef.value) {
      return;
   }

   const imageInfo = getImageCoverInfo();

   if (
      !imageInfo ||
      !imageInfo.containerWidth ||
      !imageInfo.containerHeight ||
      !imageInfo.imageWidth ||
      !imageInfo.imageHeight ||
      imageInfo.containerWidth <= 0 ||
      imageInfo.containerHeight <= 0 ||
      imageInfo.imageWidth <= 0 ||
      imageInfo.imageHeight <= 0 ||
      isNaN(imageInfo.containerWidth) ||
      isNaN(imageInfo.containerHeight) ||
      isNaN(imageInfo.imageWidth) ||
      isNaN(imageInfo.imageHeight)
   ) {
      return;
   }

   const size = getVideoSize();

   if (
      !size ||
      !size.width ||
      !size.height ||
      size.width <= 0 ||
      size.height <= 0 ||
      isNaN(size.width) ||
      isNaN(size.height)
   ) {
      return;
   }

   const canvas = canvasRef.value;
   const ctx = canvas.getContext("2d");

   // For Telegram mini app, ensure we use the actual container size
   // Get the parent container to use its actual dimensions
   const wrapperElement = canvasRef.value?.closest('.house-outline-wrapper');
   const parentContainer = wrapperElement?.parentElement;
   
   let finalWidth = imageInfo.containerWidth;
   let finalHeight = imageInfo.containerHeight;
   
   // Use parent container size if available and valid (more accurate for Telegram mini app)
   if (parentContainer) {
      const parentRect = parentContainer.getBoundingClientRect();
      if (parentRect.width > 0 && parentRect.height > 0) {
         finalWidth = parentRect.width;
         finalHeight = parentRect.height;
      }
   }
   
   // Set canvas dimensions
   canvas.width = finalWidth;
   canvas.height = finalHeight;
   
   // Set canvas style
   canvasStyle.value = {
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
   };
   
   // Set wrapper style (same dimensions)
   wrapperStyle.value = {
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
   };

   const currentTime = Date.now() - animationStartTime;

   const naturalWidth = imageInfo.imageWidth;
   const naturalHeight = imageInfo.imageHeight;

   const element = findVisibleElement();

   let actualDisplayWidth = naturalWidth;
   let actualDisplayHeight = naturalHeight;

   if (element) {
      const rect = element.getBoundingClientRect();
      actualDisplayWidth = rect.width || naturalWidth;
      actualDisplayHeight = rect.height || naturalHeight;
   }

   const scaleX = actualDisplayWidth / naturalWidth;
   const scaleY = actualDisplayHeight / naturalHeight;

   if (
      isNaN(scaleX) ||
      isNaN(scaleY) ||
      scaleX <= 0 ||
      scaleY <= 0 ||
      !isFinite(scaleX) ||
      !isFinite(scaleY)
   ) {
      return;
   }

   if (props.alwaysVisible) {
      isVisible.value = true;
   }

   drawOutline(
      ctx,
      props,
      isVisible,
      naturalWidth,
      naturalHeight,
      currentTime,
      forceDraw || props.alwaysVisible,
      size.offsetX || 0,
      size.offsetY || 0,
      scaleX,
      scaleY
   );
};

const isCursorInside = ref(false);

const handleGlobalMouseMove = (event) => {
   if (props.alwaysVisible) {
      if (!isVisible.value) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      } else {
         if (canvasRef.value) {
            updateCanvas(true);
         }
      }
      return;
   }

   if (!canvasRef.value || !hitAreaRef.value) {
      return;
   }

   const isInside = checkMousePosition(event.clientX, event.clientY);
   isCursorInside.value = isInside;

   if (isInside) {
      if (!isVisible.value) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      } else {
         if (canvasRef.value) {
            updateCanvas(true);
         }
      }
   } else {
      if (isVisible.value) {
         isVisible.value = false;
         if (canvasRef.value) {
            updateCanvas();
         }
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      }
   }
};

const handleMouseMove = (event) => {
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "pointer";

      const rect = hitAreaRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = getVideoSize();

      if (size && size.width > 0 && size.height > 0) {
         const isInside = checkPointInPath(
            props.points,
            x,
            y,
            size.offsetX || 0,
            size.offsetY || 0
         );
         isCursorInside.value = isInside;

         if (isInside && !props.alwaysVisible) {
            if (!isVisible.value) {
               isVisible.value = true;
               nextTick(() => {
                  if (canvasRef.value) {
                     updateCanvas(true);
                     if (props.animated) {
                        animate();
                     }
                  }
               });
            } else if (canvasRef.value) {
               updateCanvas(true);
            }
         }
      }
   }
   handleGlobalMouseMove(event);
};

const handleMouseEnter = (event) => {
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "pointer";
      isCursorInside.value = true;

      const rect = hitAreaRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = getVideoSize();

      if (size && size.width > 0 && size.height > 0) {
         const isInside = checkPointInPath(
            props.points,
            x,
            y,
            size.offsetX || 0,
            size.offsetY || 0
         );
         isCursorInside.value = isInside;

         if (isInside && !props.alwaysVisible) {
            isVisible.value = true;
            nextTick(() => {
               if (canvasRef.value) {
                  updateCanvas(true);
                  if (props.animated) {
                     animate();
                  }
               }
            });
         }
      }
   }
};

const handleMouseLeave = () => {
   isCursorInside.value = false;

   if (!props.alwaysVisible && isVisible.value) {
      isVisible.value = false;
      if (canvasRef.value) {
         updateCanvas();
      }
      if (animationFrame) {
         cancelAnimationFrame(animationFrame);
         animationFrame = null;
      }
   }
};

const handleGlobalClick = (event) => {
   const isInside = checkMousePosition(event.clientX, event.clientY);

   if (!isInside) {
      return;
   }

   const target = event.target;
   const isInteractiveElement =
      target.closest("a") ||
      target.closest("button") ||
      target.closest(".home-content-top-back") ||
      target.closest(".home-content-top-about") ||
      target.closest(".home-content-slider-arrow") ||
      target.closest("[role='button']") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("router-link");

   if (isInteractiveElement) {
      return;
   }

   event.preventDefault();
   event.stopPropagation();
   event.stopImmediatePropagation();

   if (props.onClick && typeof props.onClick === "function") {
      props.onClick(event);
   } else {
      window.location.reload();
   }
};

const handleClick = (event) => {
   try {
      if (!event) return;

      event.preventDefault();
      event.stopPropagation();

      if (!props.alwaysVisible && isVisible.value) {
         isVisible.value = false;
         if (canvasRef.value) {
            updateCanvas();
         }
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      }

      if (props.onClick && typeof props.onClick === "function") {
         props.onClick(event);
      } else {
         window.location.reload();
      }
   } catch (error) {
      console.error("Error in handleClick:", error);
   }
};

const touchStartPos = ref({ x: 0, y: 0 });
const touchStartTime = ref(0);

const handleTouchStart = (event) => {
   try {
      if (!event || !event.touches || event.touches.length === 0) return;

      if (event.touches.length === 1) {
         const touch = event.touches[0];
         touchStartPos.value = { x: touch.clientX, y: touch.clientY };
         touchStartTime.value = Date.now();

         if (
            hitAreaRef.value &&
            checkMousePosition(touch.clientX, touch.clientY)
         ) {
            event.stopPropagation();

            isCursorInside.value = true;
            if (!isVisible.value) {
               isVisible.value = true;
               updateCanvas();
               if (props.animated) {
                  animate();
               }
            }
         }
      }
   } catch (error) {
      console.error("Error in handleTouchStart:", error);
   }
};

const handleTouchEnd = (event) => {
   try {
      if (!event || !event.changedTouches || event.changedTouches.length === 0)
         return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = Math.abs(touch.clientX - touchStartPos.value.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.value.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const deltaTime = Date.now() - touchStartTime.value;

      const TAP_DISTANCE_THRESHOLD = 15;
      const TAP_TIME_THRESHOLD = 500;

      if (distance < TAP_DISTANCE_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
         if (
            hitAreaRef.value &&
            checkMousePosition(touch.clientX, touch.clientY)
         ) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (!props.alwaysVisible && isVisible.value) {
               isVisible.value = false;
               if (canvasRef.value) {
                  updateCanvas();
               }
               if (animationFrame) {
                  cancelAnimationFrame(animationFrame);
                  animationFrame = null;
               }
            }

            setTimeout(() => {
               if (props.onClick && typeof props.onClick === "function") {
                  props.onClick(event);
               }
            }, 10);
         }
      }

      isCursorInside.value = false;
   } catch (error) {
      console.error("Error in handleTouchEnd:", error);
   }
};

const animate = () => {
   if (props.animated && isVisible.value && canvasRef.value) {
      updateCanvas(true);
      animationFrame = requestAnimationFrame(animate);
   }
};

const handleResize = () => {
   // Add a small delay for Telegram mini app to ensure dimensions are updated
   setTimeout(() => {
      if (canvasRef.value) {
         updateCanvas(true);
      }
   }, 50);
};

const handleMaskUpdate = () => {
   if (canvasRef.value) {
      updateCanvas(true);
   }
};

const init = () => {
   animationStartTime = Date.now();

   if (props.alwaysVisible) {
      isVisible.value = true;
   }

   nextTick(() => {
      if (!canvasRef.value) {
         setTimeout(() => {
            init();
         }, 100);
         return;
      }

      updateCanvas(true);

      if (props.alwaysVisible) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      }

      setTimeout(() => {
         if (canvasRef.value) {
            if (props.alwaysVisible) {
               isVisible.value = true;
            }
            updateCanvas(true);
            if (props.alwaysVisible && props.animated) {
               nextTick(() => {
                  if (canvasRef.value) {
                     animate();
                  }
               });
            }
         }
      }, 300);
   });

   document.addEventListener("mousemove", handleGlobalMouseMove, {
      passive: true,
   });

   document.addEventListener("click", handleGlobalClick);

   window.addEventListener("resize", handleResize, {
      passive: true,
   });
   
   // Also listen to visualViewport changes for Telegram mini app and mobile browsers
   if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, {
         passive: true,
      });
      window.visualViewport.addEventListener("scroll", handleResize, {
         passive: true,
      });
   }

   window.addEventListener("mask-update", handleMaskUpdate, {
      passive: true,
   });

   const images = document.querySelectorAll(".home-image");
   const video = document.querySelector(".home-video");

   images.forEach((image) => {
      if (image.complete && image.naturalWidth > 0) {
         if (canvasRef.value) {
            updateCanvas(true);
         }
      } else {
         image.addEventListener("load", () => {
            nextTick(() => {
               if (canvasRef.value) {
                  updateCanvas(true);
               }
            });
         });
      }
   });

   if (images.length === 0 && canvasRef.value) {
      updateCanvas(true);
   }

   if (video) {
      video.addEventListener("loadedmetadata", () => {
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
            }
         });
      });
   }
};

const cleanup = () => {
   if (animationFrame) {
      cancelAnimationFrame(animationFrame);
   }
   document.body.style.cursor = "";
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "default";
   }
   document.removeEventListener("mousemove", handleGlobalMouseMove);
   document.removeEventListener("click", handleGlobalClick);
   window.removeEventListener("resize", handleResize);
   window.removeEventListener("mask-update", handleMaskUpdate);
   
   // Remove visualViewport listeners
   if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", handleResize);
      window.visualViewport.removeEventListener("scroll", handleResize);
   }
};

watch(
   () => [props.points, props.path, props.strokeColor, props.glowColor],
   () => {
      if (canvasRef.value) {
         updateCanvas(isVisible.value);
      }
   },
   { deep: true }
);

watch(
   () => props.alwaysVisible,
   (newValue) => {
      alwaysVisibleChanging.value = true;

      if (newValue) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      } else {
         isVisible.value = false;
         if (canvasRef.value) {
            updateCanvas();
         }
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      }

      nextTick(() => {
         setTimeout(() => {
            alwaysVisibleChanging.value = false;
         }, 100);
      });
   },
   { flush: "sync", immediate: true }
);

onMounted(() => {
   nextTick(() => {
      init();
   });
});

onUnmounted(() => {
   cleanup();
});
</script>

<style scoped>
.house-outline-wrapper {
   position: absolute;
   top: 0;
   left: 0;
   z-index: 14;
   pointer-events: none;
   isolation: isolate;
   width: 100%;
   height: 100%;
   /* Ensure wrapper covers the full container in Telegram mini app */
   min-width: 100%;
   min-height: 100%;
   box-sizing: border-box;
}

.house-outline-wrapper .house-outline-hit-area {
   pointer-events: all;
   z-index: 14;
}

.house-outline-wrapper .house-outline-canvas {
   position: absolute;
   top: 0;
   left: 0;
   pointer-events: none;
   mix-blend-mode: screen;
   opacity: 0;
   transition: opacity 0.3s ease;
   display: block;
   visibility: visible;
   z-index: 15;
   will-change: opacity;
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
}

.house-outline-wrapper .house-outline-canvas.house-outline-canvas-visible {
   opacity: 1;
   visibility: visible;
   display: block;
   z-index: 15;
   pointer-events: none;
   will-change: opacity;
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
}

.house-outline-wrapper .house-outline-canvas.house-outline-canvas-instant {
   transition: opacity 0s;
}

.house-outline-wrapper .house-outline-hit-area {
   position: absolute;
   top: 0;
   left: 0;
   cursor: pointer;
   background: transparent;
   z-index: 14;
   pointer-events: all;
   touch-action: manipulation;
   -webkit-tap-highlight-color: transparent;
}

.house-outline-hit-area-pointer {
   cursor: pointer;
}

@media (hover: none) and (pointer: coarse) {
   .house-outline-hit-area {
      min-width: 44px;
      min-height: 44px;
   }
}
</style>
