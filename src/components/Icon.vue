<template>
   <svg
      v-if="iconSvg"
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
      :viewBox="viewBox"
      :class="iconClass"
      :style="{ color: color, transform: `rotate(${rotate}deg)` }"
      v-html="iconSvg"
   ></svg>
   <div v-else class="icon-placeholder">?</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
   name: {
      type: String,
      required: true,
   },
   size: {
      type: [String, Number],
      default: 24,
   },
   color: {
      type: String,
      default: "currentColor",
   },
   rotate: {
      type: [String, Number],
      default: 0,
   },
});

// Auto-import all SVG icons
const iconModules = import.meta.glob("../assets/icons/*.svg", {
   as: "raw",
   eager: false,
});

const iconSvg = ref("");
const viewBox = ref("0 -960 960 960");

// Extract icon name from file path
const getIconName = (path) => {
   const match = path.match(/\/([^/]+)\.svg$/);
   return match ? match[1] : null;
};

// Create a map of icon names to their loaders
const iconLoaders = {};
Object.keys(iconModules).forEach((path) => {
   const iconName = getIconName(path);
   if (iconName) {
      iconLoaders[iconName] = iconModules[path];
   }
});

// Load and parse icon
const loadIcon = async (iconName) => {
   const loader = iconLoaders[iconName];

   if (!loader) {
      console.warn(
         `Icon "${iconName}" not found. Available icons:`,
         Object.keys(iconLoaders)
      );
      iconSvg.value = "";
      return;
   }

   try {
      const svgContent = await loader();

      if (svgContent) {
         // Parse SVG to extract content and viewBox
         const parser = new DOMParser();
         const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
         const svgElement = svgDoc.querySelector("svg");

         if (svgElement) {
            // Get viewBox from SVG
            const vb = svgElement.getAttribute("viewBox");
            if (vb) {
               viewBox.value = vb;
            }

            // Get all inner content (paths, circles, etc.)
            iconSvg.value = svgElement.innerHTML;
         } else {
            iconSvg.value = "";
         }
      }
   } catch (error) {
      console.warn(`Error loading icon "${iconName}":`, error);
      iconSvg.value = "";
   }
};

// Watch for name changes
watch(
   () => props.name,
   (newName) => {
      if (newName) {
         loadIcon(newName);
      }
   },
   { immediate: true }
);

onMounted(() => {
   if (props.name) {
      loadIcon(props.name);
   }
});

const iconClass = computed(() => `icon icon-${props.name}`);
</script>

<style scoped>
.icon {
   display: inline-block;
   vertical-align: middle;
}

.icon :deep(path) {
   fill: currentColor;
}

.icon :deep(circle),
.icon :deep(rect),
.icon :deep(line),
.icon :deep(polygon),
.icon :deep(polyline) {
   fill: currentColor;
   stroke: currentColor;
}

.icon-placeholder {
   display: inline-block;
   width: 1em;
   height: 1em;
   background: rgba(255, 0, 0, 0.2);
   border: 1px dashed red;
   text-align: center;
   line-height: 1;
   font-size: 0.8em;
}
</style>
