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
            'house-outline-canvas-visible': isVisible,
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

const props = defineProps({
   // Координаты контура дома (массив точек {x, y} в процентах от размера видео)
   // Например: [{x: 20, y: 30}, {x: 80, y: 30}, {x: 80, y: 70}, {x: 20, y: 70}]
   points: {
      type: Array,
      default: () => [],
   },
   // Или SVG path строка (более гибкий вариант)
   path: {
      type: String,
      default: "",
   },
   // Цвет обводки
   strokeColor: {
      type: String,
      default: "transparent",
   },
   // Ширина обводки
   strokeWidth: {
      type: Number,
      default: 3,
   },
   // Цвет подсветки/заливки (с прозрачностью)
   glowColor: {
      type: String,
      default: "rgba(0, 255, 255, 0.2)",
   },
   // Интенсивность свечения (размытие)
   glowBlur: {
      type: Number,
      default: 20,
   },
   // Включить анимацию пульсации
   animated: {
      type: Boolean,
      default: true,
   },
   // Скорость анимации (мс)
   animationSpeed: {
      type: Number,
      default: 2000,
   },
   // Кастомный обработчик клика (если не указан, используется window.location.reload())
   onClick: {
      type: Function,
      default: null,
   },
   // Показывать маску постоянно (не только при наведении)
   alwaysVisible: {
      type: Boolean,
      default: true,
   },
});

const canvasRef = ref(null);
const hitAreaRef = ref(null);
const canvasStyle = ref({});
const wrapperStyle = ref({});
const isVisible = ref(false);
const alwaysVisibleChanging = ref(false);
let animationFrame = null;
let animationStartTime = 0;

// Получить реальные размеры и позицию изображения с учетом object-fit: cover
const getImageCoverInfo = () => {
   // Сначала проверяем видео
   const video = document.querySelector(".home-video");
   if (video) {
      const containerWidth = video.offsetWidth;
      const containerHeight = video.offsetHeight;
      const videoWidth =
         video.videoWidth || video.naturalWidth || containerWidth;
      const videoHeight =
         video.videoHeight || video.naturalHeight || containerHeight;

      // Вычисляем масштаб для object-fit: cover
      const scaleX = containerWidth / videoWidth;
      const scaleY = containerHeight / videoHeight;
      const scale = Math.max(scaleX, scaleY);

      // Вычисляем реальный размер отображаемого изображения
      const displayWidth = videoWidth * scale;
      const displayHeight = videoHeight * scale;

      // Вычисляем смещение (центрирование)
      const offsetX = (containerWidth - displayWidth) / 2;
      const offsetY = (containerHeight - displayHeight) / 2;

      return {
         containerWidth,
         containerHeight,
         imageWidth: videoWidth,
         imageHeight: videoHeight,
         displayWidth,
         displayHeight,
         scale,
         offsetX,
         offsetY,
      };
   }

   // Затем проверяем изображение
   const image = document.querySelector(".home-image");
   if (image) {
      const containerWidth = image.offsetWidth;
      const containerHeight = image.offsetHeight;
      const imageWidth = image.naturalWidth || image.width || containerWidth;
      const imageHeight =
         image.naturalHeight || image.height || containerHeight;

      // Вычисляем масштаб для object-fit: cover
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const scale = Math.max(scaleX, scaleY);

      // Вычисляем реальный размер отображаемого изображения
      const displayWidth = imageWidth * scale;
      const displayHeight = imageHeight * scale;

      // Вычисляем смещение (центрирование)
      const offsetX = (containerWidth - displayWidth) / 2;
      const offsetY = (containerHeight - displayHeight) / 2;

      return {
         containerWidth,
         containerHeight,
         imageWidth,
         imageHeight,
         displayWidth,
         displayHeight,
         scale,
         offsetX,
         offsetY,
      };
   }

   // Fallback на размеры окна
   const width = window.innerWidth;
   const height = window.innerHeight;
   return {
      containerWidth: width,
      containerHeight: height,
      imageWidth: width,
      imageHeight: height,
      displayWidth: width,
      displayHeight: height,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
   };
};

// Получить размеры видео/изображения контейнера (для обратной совместимости)
const getVideoSize = () => {
   const info = getImageCoverInfo();
   // Возвращаем размеры контейнера для координат масок
   // Координаты масок должны быть относительно реального изображения
   return {
      width: info.displayWidth,
      height: info.displayHeight,
      offsetX: info.offsetX,
      offsetY: info.offsetY,
   };
};

// Проверка, находится ли точка внутри контура
// Используем canvas API для более точной проверки
const isPointInPath = (x, y, width, height, offsetX = 0, offsetY = 0) => {
   if (props.points.length < 3) return false;

   // Создаем временный canvas для проверки
   const tempCanvas = document.createElement("canvas");
   tempCanvas.width = width;
   tempCanvas.height = height;
   const ctx = tempCanvas.getContext("2d");

   // Рисуем полигон на canvas с учетом смещения
   ctx.beginPath();
   ctx.moveTo(
      (props.points[0].x / 100) * width + offsetX,
      (props.points[0].y / 100) * height + offsetY
   );
   for (let i = 1; i < props.points.length; i++) {
      ctx.lineTo(
         (props.points[i].x / 100) * width + offsetX,
         (props.points[i].y / 100) * height + offsetY
      );
   }
   ctx.closePath();

   // Используем встроенный метод canvas для проверки точки
   return ctx.isPointInPath(x, y);
};

// Проверка координат относительно контейнера
const checkMousePosition = (clientX, clientY) => {
   if (!hitAreaRef.value) return false;

   const rect = hitAreaRef.value.getBoundingClientRect();
   const x = clientX - rect.left;
   const y = clientY - rect.top;

   // Проверяем, что координаты в пределах области
   if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return false;
   }

   const size = getVideoSize();
   return isPointInPath(
      x,
      y,
      size.width,
      size.height,
      size.offsetX || 0,
      size.offsetY || 0
   );
};

// Рисование контура
const drawOutline = (
   ctx,
   width,
   height,
   progress = 0,
   forceDraw = false,
   offsetX = 0,
   offsetY = 0
) => {
   ctx.clearRect(0, 0, width, height);

   // Не рисуем контур, если не видим
   if (!isVisible.value) {
      return;
   }

   // Вычисляем текущие параметры с учетом анимации
   const opacity = props.animated
      ? 0.5 + 0.5 * Math.sin((progress / props.animationSpeed) * Math.PI * 2)
      : 1;
   const currentGlowBlur =
      props.glowBlur * (props.animated ? 0.5 + 0.5 * opacity : 1);

   ctx.save();

   // Рисуем свечение (подсветку)
   if (props.glowColor) {
      ctx.beginPath();
      ctx.shadowColor = props.glowColor;
      ctx.shadowBlur = currentGlowBlur;
      ctx.fillStyle = props.glowColor;
      ctx.globalAlpha = opacity * 0.5;

      if (props.path) {
         // Используем SVG path с трансформацией
         ctx.translate(offsetX, offsetY);
         const path2d = new Path2D(props.path);
         // Масштабируем path, если нужно
         ctx.fill(path2d);
         ctx.translate(-offsetX, -offsetY);
      } else if (props.points.length > 0) {
         // Используем массив точек с учетом смещения
         ctx.moveTo(
            (props.points[0].x / 100) * width + offsetX,
            (props.points[0].y / 100) * height + offsetY
         );
         for (let i = 1; i < props.points.length; i++) {
            ctx.lineTo(
               (props.points[i].x / 100) * width + offsetX,
               (props.points[i].y / 100) * height + offsetY
            );
         }
         ctx.closePath();
         ctx.fill();
      }
   }

   ctx.restore();
   ctx.save();

   // Рисуем обводку
   ctx.beginPath();
   ctx.strokeStyle = props.strokeColor;
   ctx.lineWidth = props.strokeWidth;
   ctx.shadowColor = props.strokeColor;
   ctx.shadowBlur = currentGlowBlur * 0.5;
   ctx.globalAlpha = opacity;

   if (props.path) {
      ctx.translate(offsetX, offsetY);
      const path2d = new Path2D(props.path);
      ctx.stroke(path2d);
      ctx.translate(-offsetX, -offsetY);
   } else if (props.points.length > 0) {
      ctx.moveTo(
         (props.points[0].x / 100) * width + offsetX,
         (props.points[0].y / 100) * height + offsetY
      );
      for (let i = 1; i < props.points.length; i++) {
         ctx.lineTo(
            (props.points[i].x / 100) * width + offsetX,
            (props.points[i].y / 100) * height + offsetY
         );
      }
      ctx.closePath();
      ctx.stroke();
   }

   ctx.restore();
};

// Создание clip-path из points для CSS с учетом смещения изображения
const getClipPath = () => {
   if (props.points.length < 3) return "";

   const imageInfo = getImageCoverInfo();
   const size = getVideoSize();

   // Если есть смещение, нужно пересчитать координаты
   // Координаты в процентах от исходного изображения нужно преобразовать
   // в проценты от контейнера с учетом смещения
   if (size.offsetX !== 0 || size.offsetY !== 0) {
      const pointsStr = props.points
         .map((p) => {
            // Преобразуем проценты исходного изображения в пиксели
            const xPx = (p.x / 100) * size.width + (size.offsetX || 0);
            const yPx = (p.y / 100) * size.height + (size.offsetY || 0);
            // Преобразуем обратно в проценты контейнера
            const xPercent = (xPx / imageInfo.containerWidth) * 100;
            const yPercent = (yPx / imageInfo.containerHeight) * 100;
            return `${xPercent}% ${yPercent}%`;
         })
         .join(", ");
      return `polygon(${pointsStr})`;
   }

   // Если смещения нет, используем обычные проценты
   const pointsStr = props.points.map((p) => `${p.x}% ${p.y}%`).join(", ");
   return `polygon(${pointsStr})`;
};

// Обновление canvas
const updateCanvas = (forceDraw = false) => {
   if (!canvasRef.value) return;

   const imageInfo = getImageCoverInfo();
   const size = getVideoSize();
   const canvas = canvasRef.value;
   const ctx = canvas.getContext("2d");

   // Устанавливаем размеры canvas равными контейнеру
   canvas.width = imageInfo.containerWidth;
   canvas.height = imageInfo.containerHeight;

   // Устанавливаем стили для правильного отображения
   canvasStyle.value = {
      width: `${imageInfo.containerWidth}px`,
      height: `${imageInfo.containerHeight}px`,
   };

   wrapperStyle.value = {
      width: `${imageInfo.containerWidth}px`,
      height: `${imageInfo.containerHeight}px`,
   };

   // Очищаем и рисуем с учетом смещения
   const currentTime = Date.now() - animationStartTime;
   drawOutline(
      ctx,
      size.width,
      size.height,
      currentTime,
      forceDraw,
      size.offsetX || 0,
      size.offsetY || 0
   );
};

// Текущее состояние курсора (внутри контура или нет)
const isCursorInside = ref(false);

// Глобальный обработчик движения мыши
const handleGlobalMouseMove = (event) => {
   const isInside = checkMousePosition(event.clientX, event.clientY);
   isCursorInside.value = isInside;

   // Меняем курсор на указатель на всем документе, если курсор внутри контура
   // Проверяем, не находимся ли мы на интерактивном элементе (но для курсора это не так важно)
   const target = event.target;
   const isOnInteractiveElement =
      target.closest("a") ||
      target.closest("button") ||
      target.closest(".home-content-top-back") ||
      target.closest(".home-content-top-about") ||
      target.closest(".home-content-slider-arrow") ||
      target.closest("[role='button']") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("router-link");

   // Обновляем isCursorInside для визуальной обратной связи
   // cursor: pointer уже установлен через CSS и handleMouseEnter
   // Здесь мы только обновляем состояние для показа/скрытия маски
   isCursorInside.value = isInside;

   // Если alwaysVisible включен, маска всегда видна
   if (props.alwaysVisible) {
      // Убеждаемся, что маска видна
      if (!isVisible.value) {
         isVisible.value = true;
         updateCanvas(true);
         if (props.animated) {
            animate();
         }
      } else {
         // Обновляем canvas даже если маска уже видна (для анимации)
         updateCanvas(true);
      }
      return; // Не скрываем маску при выходе курсора
   }

   // Обычное поведение: показывать только при наведении
   if (isInside && !isVisible.value) {
      // Курсор вошел в контур - показываем маску
      isVisible.value = true;
      updateCanvas(true);
      if (props.animated) {
         animate();
      }
   } else if (!isInside && isVisible.value) {
      // Курсор вышел за пределы контура - скрываем маску
      isVisible.value = false;
      updateCanvas();
      if (animationFrame) {
         cancelAnimationFrame(animationFrame);
         animationFrame = null;
      }
   }
};

// Обработчики событий мыши
const handleMouseMove = (event) => {
   // Если событие mousemove сработало на hit-area, значит курсор в видимой области clip-path
   // Устанавливаем cursor: pointer и обновляем состояние
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "pointer";
      isCursorInside.value = true;

      // Дополнительно проверяем через более точный алгоритм для обновления состояния маски
      const rect = hitAreaRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = getVideoSize();
      const isInside = isPointInPath(
         x,
         y,
         size.width,
         size.height,
         size.offsetX || 0,
         size.offsetY || 0
      );
      isCursorInside.value = isInside;
   }
   handleGlobalMouseMove(event);
};

// Обработчик входа курсора в область маски (для дополнительной надежности)
const handleMouseEnter = (event) => {
   // Устанавливаем cursor: pointer, так как clip-path уже ограничивает область
   // Если mouseenter сработал, значит курсор точно в видимой области clip-path
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "pointer";
      isCursorInside.value = true;

      // Дополнительно проверяем координаты для точности
      const rect = hitAreaRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = getVideoSize();
      const isInside = isPointInPath(
         x,
         y,
         size.width,
         size.height,
         size.offsetX || 0,
         size.offsetY || 0
      );
      isCursorInside.value = isInside;
   }
};

// Обработчик выхода курсора из области маски
const handleMouseLeave = () => {
   // При выходе из области не сбрасываем cursor, так как CSS уже установил pointer
   // и clip-path ограничивает область, поэтому события срабатывают только в видимой части
   isCursorInside.value = false;
};

// Глобальный обработчик клика
const handleGlobalClick = (event) => {
   // Проверяем, был ли клик по области контура
   const isInside = checkMousePosition(event.clientX, event.clientY);

   if (!isInside) {
      return; // Клик не по контуру, не обрабатываем
   }

   // Проверяем, не был ли клик по другому интерактивному элементу
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

   // Если клик был по интерактивному элементу, не обрабатываем
   if (isInteractiveElement) {
      return;
   }

   // Клик по контуру и не по интерактивному элементу
   event.preventDefault();
   event.stopPropagation();
   event.stopImmediatePropagation();

   // Вызываем кастомный обработчик, если он есть, иначе перезагружаем страницу
   if (props.onClick && typeof props.onClick === "function") {
      props.onClick(event);
   } else {
      window.location.reload();
   }
};

// Обработчик клика на hit-area (для дополнительной надежности)
const handleClick = (event) => {
   // If the click is directly on the hit area (via clip-path),
   // we know it's within the mask shape, so skip the position check
   event.preventDefault();
   event.stopPropagation();

   // Call the click handler directly
   if (props.onClick && typeof props.onClick === "function") {
      props.onClick(event);
   } else {
      window.location.reload();
   }
};

// Touch handling for mobile devices
const touchStartPos = ref({ x: 0, y: 0 });
const touchStartTime = ref(0);

const handleTouchStart = (event) => {
   if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchStartPos.value = { x: touch.clientX, y: touch.clientY };
      touchStartTime.value = Date.now();

      // Show mask on touch
      if (checkMousePosition(touch.clientX, touch.clientY)) {
         isCursorInside.value = true;
         if (!isVisible.value) {
            isVisible.value = true;
            updateCanvas();
            if (props.animated) {
               startAnimation();
            }
         }
      }
   }
};

const handleTouchEnd = (event) => {
   const touch = event.changedTouches[0];
   if (!touch) return;

   const deltaX = Math.abs(touch.clientX - touchStartPos.value.x);
   const deltaY = Math.abs(touch.clientY - touchStartPos.value.y);
   const deltaTime = Date.now() - touchStartTime.value;

   // Only trigger click if it's a tap (not a drag)
   // Max 20px movement and less than 400ms (more forgiving on mobile)
   if (deltaX < 20 && deltaY < 20 && deltaTime < 400) {
      // Prevent the event from bubbling to drag handlers
      event.preventDefault();
      event.stopPropagation();

      // Call the click handler (we already know we're within hit area since touchstart was on this element)
      if (props.onClick) {
         props.onClick();
      }
   }

   // Hide mask after touch
   isCursorInside.value = false;
};

// Анимационный цикл
const animate = () => {
   if (props.animated && isVisible.value) {
      updateCanvas(true);
      animationFrame = requestAnimationFrame(animate);
   }
};

// Инициализация
const init = () => {
   animationStartTime = Date.now();

   // Если alwaysVisible включен, показываем маску сразу
   if (props.alwaysVisible) {
      isVisible.value = true;
      updateCanvas(true);
      if (props.animated) {
         animate();
      }
      // Курсор будет устанавливаться динамически при движении мыши
   } else {
      updateCanvas(true); // Инициализируем, но не показываем
   }

   // Слушаем глобальное движение мыши для точного отслеживания
   document.addEventListener("mousemove", handleGlobalMouseMove, {
      passive: true,
   });

   // Слушаем глобальные клики для надежного отслеживания (bubbling phase)
   document.addEventListener("click", handleGlobalClick);

   // Слушаем изменение размера окна
   const handleResize = () => {
      updateCanvas(true);
   };
   window.addEventListener("resize", handleResize, {
      passive: true,
   });

   // Слушаем загрузку изображения для пересчета масок
   const image = document.querySelector(".home-image");
   const video = document.querySelector(".home-video");

   if (image) {
      if (image.complete) {
         updateCanvas(true);
      } else {
         image.addEventListener("load", () => {
            nextTick(() => {
               updateCanvas(true);
            });
         });
      }
   }

   if (video) {
      video.addEventListener("loadedmetadata", () => {
         nextTick(() => {
            updateCanvas(true);
         });
      });
   }
};

// Очистка
const cleanup = () => {
   if (animationFrame) {
      cancelAnimationFrame(animationFrame);
   }
   // Восстанавливаем курсор по умолчанию
   document.body.style.cursor = "";
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "default";
   }
   document.removeEventListener("mousemove", handleGlobalMouseMove);
   document.removeEventListener("click", handleGlobalClick);
   window.removeEventListener("resize", updateCanvas);
};

// Наблюдаем за изменениями props
watch(
   () => [props.points, props.path, props.strokeColor, props.glowColor],
   () => {
      updateCanvas(isVisible.value);
   },
   { deep: true }
);

// Наблюдаем за изменением alwaysVisible
watch(
   () => props.alwaysVisible,
   (newValue) => {
      // Включаем флаг для мгновенного перехода (убираем CSS transition)
      alwaysVisibleChanging.value = true;

      if (newValue) {
         // Включаем alwaysVisible - показываем маску мгновенно
         isVisible.value = true;
         updateCanvas(true);
         if (props.animated) {
            animate();
         }
      } else {
         // Выключаем alwaysVisible - скрываем маску мгновенно
         isVisible.value = false;
         updateCanvas();
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      }

      // Возвращаем transition после небольшой задержки (чтобы переход успел произойти)
      nextTick(() => {
         setTimeout(() => {
            alwaysVisibleChanging.value = false;
         }, 100);
      });
   },
   { flush: "sync" }
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
   z-index: 6;
   pointer-events: none;
}

.house-outline-wrapper .house-outline-hit-area {
   pointer-events: all;
}

.house-outline-canvas {
   position: absolute;
   top: 0;
   left: 0;
   pointer-events: none;
   mix-blend-mode: screen;
   opacity: 0;
   transition: opacity 0.3s ease;
}

.house-outline-canvas-visible {
   opacity: 1;
}

/* Мгновенное скрытие/показ при изменении alwaysVisible (disclaimer mode) */
.house-outline-canvas-instant {
   transition: opacity 0s !important;
}

.house-outline-hit-area {
   position: absolute;
   top: 0;
   left: 0;
   cursor: pointer;
   background: transparent;
   z-index: 6;
   /* Enable touch on mobile */
   touch-action: manipulation;
   -webkit-tap-highlight-color: transparent;
}

.house-outline-hit-area-pointer {
   cursor: pointer;
}

/* Better touch feedback on mobile */
@media (hover: none) and (pointer: coarse) {
   .house-outline-hit-area {
      /* Increase touch area slightly on mobile */
      min-width: 44px;
      min-height: 44px;
   }
}
</style>
