import { ref, computed, watch, onMounted, onUnmounted } from "vue";

/**
 * Композабл для энергосберегающего режима изображений и видео
 * Оптимизирует использование памяти, сохраняя элементы в DOM
 */
export function useEnergySaving() {
   const isEnabled = ref(true); // Включен по умолчанию
   const imageCache = new Map(); // Кэш для отслеживания загруженных изображений
   const videoCache = new Map(); // Кэш для отслеживания загруженных видео

   /**
    * Получить оптимальные атрибуты для изображения в зависимости от видимости
    */
   const getImageAttributes = (isVisible, isActive) => {
      if (!isEnabled.value) {
         return {
            loading: "eager",
            decoding: "sync",
         };
      }

      // Если изображение видимо и активно - загружаем полностью
      if (isVisible && isActive) {
         return {
            loading: "eager",
            decoding: "async", // Асинхронная декодировка для лучшей производительности
         };
      }

      // Если изображение скрыто - используем lazy loading
      return {
         loading: "lazy",
         decoding: "async",
      };
   };

   /**
    * Получить оптимальные атрибуты для видео в зависимости от видимости
    */
   const getVideoAttributes = (isVisible, isActive) => {
      if (!isEnabled.value) {
         return {
            preload: "auto",
         };
      }

      // Если видео видимо и активно - предзагружаем
      if (isVisible && isActive) {
         return {
            preload: "auto",
         };
      }

      // Если видео скрыто - не предзагружаем, только метаданные
      return {
         preload: "metadata",
      };
   };

   /**
    * Оптимизировать изображение для энергосбережения
    */
   const optimizeImage = (imgElement, isVisible, isActive) => {
      if (!imgElement) return;

      const attrs = getImageAttributes(isVisible, isActive);

      // Устанавливаем атрибуты
      if (attrs.loading) {
         imgElement.loading = attrs.loading;
      }
      if (attrs.decoding) {
         imgElement.decoding = attrs.decoding;
      }

      // Если изображение скрыто и не активно - уменьшаем использование памяти
      if (!isVisible && !isActive && isEnabled.value) {
         // Используем CSS для уменьшения использования GPU памяти
         imgElement.style.willChange = "auto";
         imgElement.style.contentVisibility = "auto"; // Современный способ оптимизации
      } else {
         // Если изображение активно - оптимизируем для быстрого отображения
         imgElement.style.willChange = "contents";
         imgElement.style.contentVisibility = "visible";
      }
   };

   /**
    * Оптимизировать видео для энергосбережения
    */
   const optimizeVideo = (videoElement, isVisible, isActive) => {
      if (!videoElement) return;

      const attrs = getVideoAttributes(isVisible, isActive);

      // Устанавливаем атрибут preload
      if (attrs.preload) {
         videoElement.preload = attrs.preload;
      }

      // Если видео скрыто и не активно - приостанавливаем и освобождаем память
      if (!isVisible && !isActive && isEnabled.value) {
         // Приостанавливаем видео, если оно играет
         if (!videoElement.paused) {
            videoElement.pause();
         }
         // Очищаем текущий кадр для освобождения памяти
         videoElement.load(); // Перезагружаем для освобождения буферов
         videoElement.style.willChange = "auto";
      } else {
         // Если видео активно - готовим к воспроизведению
         videoElement.style.willChange = "contents";
      }
   };

   /**
    * Предзагрузить изображение заранее (для плавных переходов)
    */
   const preloadImage = (src) => {
      if (!src || imageCache.has(src)) {
         return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
         const img = new Image();
         img.onload = () => {
            imageCache.set(src, true);
            resolve();
         };
         img.onerror = reject;
         img.src = src;
      });
   };

   /**
    * Предзагрузить видео заранее (только метаданные)
    */
   const preloadVideoMetadata = (src) => {
      if (!src || videoCache.has(src)) {
         return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
         const video = document.createElement("video");
         video.preload = "metadata";
         video.onloadedmetadata = () => {
            videoCache.set(src, true);
            resolve();
         };
         video.onerror = reject;
         video.src = src;
      });
   };

   /**
    * Очистить кэш для освобождения памяти
    */
   const clearCache = () => {
      imageCache.clear();
      videoCache.clear();
   };

   /**
    * Включить/выключить энергосберегающий режим
    */
   const toggleEnergySaving = (enabled) => {
      isEnabled.value = enabled !== undefined ? enabled : !isEnabled.value;
   };

   return {
      isEnabled,
      getImageAttributes,
      getVideoAttributes,
      optimizeImage,
      optimizeVideo,
      preloadImage,
      preloadVideoMetadata,
      clearCache,
      toggleEnergySaving,
   };
}

