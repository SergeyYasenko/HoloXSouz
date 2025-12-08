import { ref } from "vue";

export function useEnergySaving() {
   const isEnabled = ref(true);

   const getImageAttributes = (isVisible, isActive) => {
      if (!isEnabled.value) {
         return { loading: "eager", decoding: "sync" };
      }

      if (isVisible && isActive) {
         return { loading: "eager", decoding: "async" };
      }

      return { loading: "lazy", decoding: "async" };
   };

   const getVideoAttributes = (isVisible, isActive) => {
      if (!isEnabled.value) {
         return { preload: "auto" };
      }

      if (isVisible && isActive) {
         return { preload: "auto" };
      }

      return { preload: "metadata" };
   };

   const optimizeImage = (imgElement, isVisible, isActive) => {
      if (!imgElement) return;

      const attrs = getImageAttributes(isVisible, isActive);

      if (attrs.loading) {
         imgElement.loading = attrs.loading;
      }
      if (attrs.decoding) {
         imgElement.decoding = attrs.decoding;
      }

      if (!isVisible && !isActive && isEnabled.value) {
         imgElement.style.willChange = "auto";
         imgElement.style.contentVisibility = "auto";
      } else {
         imgElement.style.willChange = "contents";
         imgElement.style.contentVisibility = "visible";
      }
   };

   const optimizeVideo = (videoElement, isVisible, isActive) => {
      if (!videoElement) return;

      const attrs = getVideoAttributes(isVisible, isActive);

      if (attrs.preload) {
         videoElement.preload = attrs.preload;
      }

      if (!isVisible && !isActive && isEnabled.value) {
         if (!videoElement.paused) {
            videoElement.pause();
         }
         videoElement.load();
         videoElement.style.willChange = "auto";
      } else {
         videoElement.style.willChange = "contents";
      }
   };

   return {
      isEnabled,
      getImageAttributes,
      getVideoAttributes,
      optimizeImage,
      optimizeVideo,
   };
}
