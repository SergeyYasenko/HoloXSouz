export function useHouseOutlineCanvas() {
   const getImageCoverInfo = () => {
      const videos = document.querySelectorAll(".home-video");
      let video = null;

      for (const v of videos) {
         const style = window.getComputedStyle(v);
         if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
         ) {
            video = v;
            break;
         }
      }

      if (!video && videos.length > 0) {
         for (const v of videos) {
            if (v.videoWidth > 0 || v.naturalWidth > 0) {
               video = v;
               break;
            }
         }
         if (!video) {
            video = videos[0];
         }
      }

      if (video) {
         const videoWidth = video.videoWidth || video.naturalWidth || 0;
         const videoHeight = video.videoHeight || video.naturalHeight || 0;

         let containerWidth = video.offsetWidth;
         let containerHeight = video.offsetHeight;

         if (containerWidth <= 0 || containerHeight <= 0) {
            containerWidth = window.innerWidth;
            containerHeight = window.innerHeight;
         }

         const finalVideoWidth = videoWidth > 0 ? videoWidth : containerWidth;
         const finalVideoHeight = videoHeight > 0 ? videoHeight : containerHeight;

         const scaleX = containerWidth / finalVideoWidth;
         const scaleY = containerHeight / finalVideoHeight;
         const scale = Math.max(scaleX, scaleY);

         const displayWidth = finalVideoWidth * scale;
         const displayHeight = finalVideoHeight * scale;

         const offsetX = (containerWidth - displayWidth) / 2;
         const offsetY = (containerHeight - displayHeight) / 2;

         const finalOffsetX = isNaN(offsetX) ? 0 : offsetX;
         const finalOffsetY = isNaN(offsetY) ? 0 : offsetY;

         return {
            containerWidth,
            containerHeight,
            imageWidth: finalVideoWidth,
            imageHeight: finalVideoHeight,
            displayWidth,
            displayHeight,
            scale,
            offsetX: finalOffsetX,
            offsetY: finalOffsetY,
         };
      }

      const images = document.querySelectorAll(".home-image");
      let image = null;

      for (const img of images) {
         const style = window.getComputedStyle(img);
         if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
         ) {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
               image = img;
               break;
            }
         }
      }

      if (!image) {
         for (const img of images) {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
               image = img;
               break;
            }
         }
      }

      if (!image && images.length > 0) {
         image = images[0];
      }

      if (image) {
         const naturalWidth = image.naturalWidth || image.width || 0;
         const naturalHeight = image.naturalHeight || image.height || 0;

         const wrapper =
            image.closest(".home-image-wrapper") ||
            image.closest(".home-image-content");

         let containerWidth = 0;
         let containerHeight = 0;

         if (wrapper) {
            containerWidth = wrapper.offsetWidth;
            containerHeight = wrapper.offsetHeight;
         }

         if (containerWidth <= 0 || containerHeight <= 0) {
            if (wrapper) {
               const computedStyle = window.getComputedStyle(wrapper);
               containerWidth =
                  parseFloat(computedStyle.width) || window.innerWidth;
               containerHeight =
                  parseFloat(computedStyle.height) || window.innerHeight;
            } else {
               containerWidth = window.innerWidth;
               containerHeight = window.innerHeight;
            }
         }

         if (containerWidth <= 0 || containerHeight <= 0) {
            containerWidth = window.innerWidth;
            containerHeight = window.innerHeight;
         }

         const finalNaturalWidth =
            naturalWidth > 0 ? naturalWidth : containerWidth;
         const finalNaturalHeight =
            naturalHeight > 0 ? naturalHeight : containerHeight;

         const scaleX = containerWidth / finalNaturalWidth;
         const scaleY = containerHeight / finalNaturalHeight;
         const scale = Math.max(scaleX, scaleY);

         const scaledDisplayWidth = finalNaturalWidth * scale;
         const scaledDisplayHeight = finalNaturalHeight * scale;

         const offsetX = (containerWidth - scaledDisplayWidth) / 2;
         const offsetY = (containerHeight - scaledDisplayHeight) / 2;

         return {
            containerWidth,
            containerHeight,
            imageWidth: finalNaturalWidth,
            imageHeight: finalNaturalHeight,
            displayWidth: scaledDisplayWidth,
            displayHeight: scaledDisplayHeight,
            scale,
            offsetX,
            offsetY,
         };
      }

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

   const getVideoSize = () => {
      const info = getImageCoverInfo();
      return {
         width: info.displayWidth,
         height: info.displayHeight,
         offsetX: info.offsetX,
         offsetY: info.offsetY,
      };
   };

   const findVisibleElement = () => {
      const videos = document.querySelectorAll(".home-video");
      const images = document.querySelectorAll(".home-image");
      let element = null;

      for (const v of videos) {
         const style = window.getComputedStyle(v);
         if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
         ) {
            element = v;
            break;
         }
      }
      if (!element) {
         for (const img of images) {
            const style = window.getComputedStyle(img);
            if (
               style.display !== "none" &&
               style.visibility !== "hidden" &&
               style.opacity !== "0"
            ) {
               element = img;
               break;
            }
         }
      }
      return element;
   };

   const isPointInPath = (points, x, y, offsetX = 0, offsetY = 0) => {
      if (points.length < 3) return false;

      const imageInfo = getImageCoverInfo();
      if (!imageInfo || !imageInfo.imageWidth || !imageInfo.imageHeight) {
         return false;
      }

      const relativeX = x - offsetX;
      const relativeY = y - offsetY;

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
         return false;
      }

      if (
         relativeX < 0 ||
         relativeY < 0 ||
         relativeX > actualDisplayWidth ||
         relativeY > actualDisplayHeight
      ) {
         return false;
      }

      const naturalX = relativeX / scaleX;
      const naturalY = relativeY / scaleY;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = naturalWidth;
      tempCanvas.height = naturalHeight;
      const ctx = tempCanvas.getContext("2d");

      ctx.beginPath();
      ctx.moveTo(
         (points[0].x / 100) * naturalWidth,
         (points[0].y / 100) * naturalHeight
      );
      for (let i = 1; i < points.length; i++) {
         ctx.lineTo(
            (points[i].x / 100) * naturalWidth,
            (points[i].y / 100) * naturalHeight
         );
      }
      ctx.closePath();

      return ctx.isPointInPath(naturalX, naturalY);
   };

   const drawOutline = (
      ctx,
      props,
      isVisible,
      width,
      height,
      progress = 0,
      forceDraw = false,
      offsetX = 0,
      offsetY = 0,
      scaleX = 1,
      scaleY = 1
   ) => {
      const canvasWidth = ctx.canvas.width || width;
      const canvasHeight = ctx.canvas.height || height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (props.points.length === 0 && !props.path) {
         return;
      }

      if (props.alwaysVisible) {
         isVisible.value = true;
      } else {
         if (!isVisible.value && !forceDraw) {
            return;
         }
      }

      const opacity = props.animated
         ? 0.5 + 0.5 * Math.sin((progress / props.animationSpeed) * Math.PI * 2)
         : 1;
      const currentGlowBlur =
         props.glowBlur * (props.animated ? 0.5 + 0.5 * opacity : 1);

      ctx.save();

      if (props.glowColor) {
         ctx.beginPath();
         ctx.shadowColor = props.glowColor;
         ctx.shadowBlur = currentGlowBlur;
         ctx.fillStyle = props.glowColor;
         const baseAlpha = props.alwaysVisible ? 0.8 : 0.7;
         ctx.globalAlpha = Math.max(
            opacity * baseAlpha,
            props.alwaysVisible ? 0.8 : 0.5
         );

         ctx.shadowOffsetX = 0;
         ctx.shadowOffsetY = 0;

         ctx.shadowBlur = currentGlowBlur > 0 ? currentGlowBlur : 20;

         if (props.path) {
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scaleX, scaleY);
            const path2d = new Path2D(props.path);
            ctx.fill(path2d);
            ctx.restore();
         } else if (props.points.length > 0) {
            ctx.beginPath();
            const x0 = (props.points[0].x / 100) * width * scaleX + offsetX;
            const y0 = (props.points[0].y / 100) * height * scaleY + offsetY;
            ctx.moveTo(x0, y0);
            for (let i = 1; i < props.points.length; i++) {
               const xi = (props.points[i].x / 100) * width * scaleX + offsetX;
               const yi = (props.points[i].y / 100) * height * scaleY + offsetY;
               ctx.lineTo(xi, yi);
            }
            ctx.closePath();
            ctx.fill();
         }
      }

      ctx.restore();
      ctx.save();

      ctx.beginPath();
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = props.strokeWidth;
      ctx.shadowColor = props.strokeColor;
      ctx.shadowBlur = currentGlowBlur * 0.5;
      ctx.globalAlpha = props.alwaysVisible ? 1.0 : Math.max(opacity, 0.8);

      if (props.path) {
         ctx.save();
         ctx.translate(offsetX, offsetY);
         ctx.scale(scaleX, scaleY);
         const path2d = new Path2D(props.path);
         ctx.stroke(path2d);
         ctx.restore();
      } else if (props.points.length > 0) {
         ctx.beginPath();
         const x0 = (props.points[0].x / 100) * width * scaleX + offsetX;
         const y0 = (props.points[0].y / 100) * height * scaleY + offsetY;
         ctx.moveTo(x0, y0);
         for (let i = 1; i < props.points.length; i++) {
            const xi = (props.points[i].x / 100) * width * scaleX + offsetX;
            const yi = (props.points[i].y / 100) * height * scaleY + offsetY;
            ctx.lineTo(xi, yi);
         }
         ctx.closePath();
         ctx.stroke();
      }

      ctx.restore();
   };

   const getClipPath = (points) => {
      if (points.length < 3) return "";

      const imageInfo = getImageCoverInfo();
      const size = getVideoSize();

      if (size.offsetX !== 0 || size.offsetY !== 0) {
         const pointsStr = points
            .map((p) => {
               const xPx = (p.x / 100) * size.width + (size.offsetX || 0);
               const yPx = (p.y / 100) * size.height + (size.offsetY || 0);
               const xPercent = (xPx / imageInfo.containerWidth) * 100;
               const yPercent = (yPx / imageInfo.containerHeight) * 100;
               return `${xPercent}% ${yPercent}%`;
            })
            .join(", ");
         return `polygon(${pointsStr})`;
      }

      const pointsStr = points.map((p) => `${p.x}% ${p.y}%`).join(", ");
      return `polygon(${pointsStr})`;
   };

   return {
      getImageCoverInfo,
      getVideoSize,
      isPointInPath,
      drawOutline,
      getClipPath,
      findVisibleElement,
   };
}

