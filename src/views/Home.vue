<template>
   <div class="home">
      <div
         ref="imageWrapperRef"
         class="home-image-wrapper"
         :class="{ 'home-image-wrapper-floor': isFloorLevel }"
         @touchstart="handleImageTouchStart"
         @touchmove="handleImageTouchMove"
         @touchend="handleImageTouchEnd"
         @touchcancel="handleImageTouchEnd"
         @mousedown="handleImageMouseDown"
         @mousemove="handleImageMouseMove"
         @mouseup="handleImageMouseUp"
         @mouseleave="handleImageMouseUp"
         @wheel.prevent="handleImageWheel"
      >
         <img
            v-show="preloadImage"
            :src="preloadImage"
            :loading="
               energySaving.getImageAttributes(!!preloadImage, false).loading
            "
            :decoding="
               energySaving.getImageAttributes(!!preloadImage, false).decoding
            "
            :class="['home-image-preload', { 'element-hidden': !preloadImage }]"
            alt=""
            @load="onPreloadImageLoaded"
         />
         <div
            ref="homeImageContentRef"
            class="home-image-content"
            :style="homeImageStyle"
         >
            <img
               v-for="levelImage in allLevelImages"
               :key="levelImage.level"
               :ref="
                  getLevelImageZIndex(levelImage.level) === 2
                     ? (el) => {
                          if (el && homeImageRef) {
                             homeImageRef.value = el;
                          }
                       }
                     : null
               "
               :src="levelImage.image"
               :loading="
                  energySaving.getImageAttributes(
                     getLevelImageZIndex(levelImage.level) === 2,
                     getLevelImageZIndex(levelImage.level) === 2
                  ).loading
               "
               :decoding="
                  energySaving.getImageAttributes(
                     getLevelImageZIndex(levelImage.level) === 2,
                     getLevelImageZIndex(levelImage.level) === 2
                  ).decoding
               "
               :class="[
                  'home-image',
                  'home-image-level',
                  {
                     'home-image-active':
                        getLevelImageZIndex(levelImage.level) === 2,
                  },
               ]"
               :data-level="levelImage.level"
               :style="getImageStyle(levelImage.level)"
               alt=""
               @load="
                  levelImage.level === getActiveLevel() ? onImageLoad() : null
               "
            />
            <template v-if="editMode">
               <!-- Overlay с затемнением для map, start и plane в режиме редактирования -->
               <div
                  v-if="currentLevel === 'map' || currentLevel === 'start' || currentLevel === 'plane'"
                  class="home-mask-overlay"
               >
                  <!-- SVG маска для затемнения -->
                  <svg
                     style="position: absolute; width: 0; height: 0; pointer-events: none;"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <defs>
                        <mask id="darkness-mask-edit" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
                           <rect width="1" height="1" fill="white" />
                           <!-- Временно закомментировано для house1 -->
                           <!-- <polygon
                              v-if="currentLevel === 'map' && showHouseOutline1 && mapMaskConfig?.house1?.points"
                              :points="mapMaskConfig.house1.points.map(p => `${p.x/100},${p.y/100}`).join(' ')"
                              fill="black"
                           /> -->
                           <polygon
                              v-if="currentLevel === 'map' && showHouseOutline2 && mapMaskConfig?.house2?.points"
                              :points="mapMaskConfig.house2.points.map(p => `${p.x/100},${p.y/100}`).join(' ')"
                              fill="black"
                           />
                           <!-- Временно закомментировано для TheRoyalYacht -->
                           <!-- <polygon
                              v-if="currentLevel === 'start' && showHouseOutline1 && twoProjectsMaskConfig?.project1?.points"
                              :points="twoProjectsMaskConfig.project1.points.map(p => `${p.x/100},${p.y/100}`).join(' ')"
                              fill="black"
                           /> -->
                           <polygon
                              v-if="currentLevel === 'start' && showHouseOutline2 && twoProjectsMaskConfig?.project2?.points"
                              :points="twoProjectsMaskConfig.project2.points.map(p => `${p.x/100},${p.y/100}`).join(' ')"
                              fill="black"
                           />
                           <polygon
                              v-if="currentLevel === 'plane' && startMaskConfig?.toApartments?.points?.length"
                              :points="startMaskConfig.toApartments.points.map(p => `${p.x/100},${p.y/100}`).join(' ')"
                              fill="black"
                           />
                        </mask>
                     </defs>
                  </svg>
                  <div 
                     class="home-mask-overlay-dark"
                     :style="{ mask: 'url(#darkness-mask-edit)', WebkitMask: 'url(#darkness-mask-edit)' }"
                  ></div>
               </div>
               <template v-if="currentLevel === 'map'">
                  <!-- Временно закомментировано для house1 -->
                  <!-- <HouseOutline
                     :points="mapMaskConfig.house1.points"
                     :path="mapMaskConfig.house1.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleHouse1Click"
                  /> -->
                  <HouseOutline
                     :points="mapMaskConfig.house2.points"
                     :path="mapMaskConfig.house2.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleHouse2Click"
                  />
                  <div
                     v-if="mapMaskConfig?.house2?.points"
                     class="apartment-label"
                     :style="{
                        left: getMaskBottomPosition(mapMaskConfig.house2.points).x + '%',
                        top: getMaskBottomPosition(mapMaskConfig.house2.points).y + '%',
                     }"
                  >
                     {{ mapMasks.house2.name }}
                  </div>
               </template>
               <template v-if="currentLevel === 'plane'">
                  <!-- Временно закомментировано для TheRoyalYacht -->
                  <!-- <HouseOutline
                     :points="twoProjectsMaskConfig.project1.points"
                     :path="twoProjectsMaskConfig.project1.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleProject1Click"
                  /> -->
                  <HouseOutline
                     :points="twoProjectsMaskConfig.project2.points"
                     :path="twoProjectsMaskConfig.project2.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleProject2Click"
                  />
               </template>
               <template v-if="currentLevel === 'plane'">
                  <!-- Невидимые, но кликабельные маски на уровне plane в режиме редактирования -->
                  <HouseOutline
                     v-if="startMaskConfig.toApartments?.points?.length"
                     :points="startMaskConfig.toApartments.points"
                     :path="startMaskConfig.toApartments.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleFacadeStartClick"
                  />
                  <HouseOutline
                     v-if="startMaskConfig.leftFootballField?.points?.length"
                     :points="startMaskConfig.leftFootballField.points"
                     :path="startMaskConfig.leftFootballField.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleLeftFootballFieldClick"
                  />
                  <HouseOutline
                     v-if="startMaskConfig.sportsCourts?.points?.length"
                     :points="startMaskConfig.sportsCourts.points"
                     :path="startMaskConfig.sportsCourts.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleSportsCourtsClick"
                  />
                  <HouseOutline
                     v-if="startMaskConfig.sportsCenter?.points?.length"
                     :points="startMaskConfig.sportsCenter.points"
                     :path="startMaskConfig.sportsCenter.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleSportsCenterClick"
                  />
                  <HouseOutline
                     v-if="startMaskConfig.sportsCenterTop?.points?.length"
                     :points="startMaskConfig.sportsCenterTop.points"
                     :path="startMaskConfig.sportsCenterTop.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleSportsCenterTopClick"
                  />
                  <HouseOutline
                     v-if="startMaskConfig.rightStadium?.points?.length"
                     :points="startMaskConfig.rightStadium.points"
                     :path="startMaskConfig.rightStadium.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleRightStadiumClick"
                  />
                  <HouseOutline
                     v-if="startMaskConfig.innerCourtyard?.points?.length"
                     :points="startMaskConfig.innerCourtyard.points"
                     :path="startMaskConfig.innerCourtyard.path"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="true"
                     :on-click="handleInnerCourtyardClick"
                  />
                  <template
                     v-for="floorId in ['g', '1', '2', '3', '4', '5']"
                     :key="floorId"
                  >
                     <HouseOutline
                        v-if="getFloorMaskConfig(floorId)"
                        :points="getFloorMaskConfig(floorId).points"
                        :path="getFloorMaskConfig(floorId).path"
                        :stroke-width="getFloorMaskConfig(floorId).strokeWidth"
                        :glow-color="getFloorMaskConfig(floorId).glowColor"
                        :glow-blur="getFloorMaskConfig(floorId).glowBlur"
                        :animated="getFloorMaskConfig(floorId).animated"
                        :always-visible="
                           getFloorMaskConfig(floorId).alwaysVisible
                        "
                        :on-click="() => handleFloorClick(floorId)"
                     />
                  </template>
               </template>
               <template v-if="isFloorLevel">
                  <template
                     v-for="apartment in currentFloorApartmentMasks"
                     :key="`floor-apartment-edit-${apartment.id}`"
                  >
                     <HouseOutline
                        :points="apartment.points"
                        :path="apartment.path || ''"
                        :stroke-width="0"
                        :stroke-color="'transparent'"
                        :glow-color="'transparent'"
                        :glow-blur="0"
                        :animated="false"
                        :always-visible="selectedApartmentId === apartment.id"
                        :on-click="() => handleApartmentMaskClick(apartment)"
                     />
                  </template>
               </template>
            </template>
            <template v-else>
               <!-- Временно закомментировано для house1 -->
               <!-- <HouseOutline
                  v-show="currentLevel === 'map' && showHouseOutline1"
                  :points="mapMaskConfig.house1.points"
                  :path="mapMaskConfig.house1.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleHouse1Click"
               />
               <div
                  v-if="currentLevel === 'map' && showHouseOutline1 && mapMaskConfig?.house1?.points"
                  class="apartment-label apartment-label-right"
                  :style="{
                     left: getMaskRightPosition(mapMaskConfig.house1.points).x + '%',
                     top: getMaskRightPosition(mapMaskConfig.house1.points).y + '%',
                  }"
               >
                  {{ mapMasks.house1.name }}
               </div> -->
               <HouseOutline
                  v-show="currentLevel === 'map' && showHouseOutline2"
                  :points="mapMaskConfig.house2.points"
                  :path="mapMaskConfig.house2.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleHouse2Click"
               />
               <div
                  v-if="currentLevel === 'map' && mapMaskConfig?.house2?.points"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(mapMaskConfig.house2.points).x + '%',
                     top: getMaskTopPosition(mapMaskConfig.house2.points).y + '%',
                  }"
               >
                  {{ mapMasks.house2.name }}
               </div>
               <!-- Временно закомментировано для TheRoyalYacht -->
               <!-- <HouseOutline
                  v-show="currentLevel === 'start' && showHouseOutline1"
                  :points="twoProjectsMaskConfig.project1.points"
                  :path="twoProjectsMaskConfig.project1.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleProject1Click"
               />
               <div
                  v-if="currentLevel === 'start' && showHouseOutline1 && twoProjectsMaskConfig?.project1?.points"
                  class="apartment-label apartment-label-right"
                  :style="{
                     left: getMaskRightPosition(twoProjectsMaskConfig.project1.points).x + '%',
                     top: getMaskRightPosition(twoProjectsMaskConfig.project1.points).y + '%',
                  }"
               >
                  {{ twoProjectsMasks.project1.name }}
               </div> -->
               <HouseOutline
                  v-show="currentLevel === 'start' && showHouseOutline2"
                  :points="twoProjectsMaskConfig.project2.points"
                  :path="twoProjectsMaskConfig.project2.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleProject2Click"
               />
               <div
                  v-if="currentLevel === 'start' && twoProjectsMaskConfig?.project2?.points"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(twoProjectsMaskConfig.project2.points).x + '%',
                     top: getMaskTopPosition(twoProjectsMaskConfig.project2.points).y + '%',
                  }"
               >
                  {{ twoProjectsMasks.project2.name }}
               </div>
               <HouseOutline
                  v-if="currentLevel === 'plane' && startMaskConfig.leftFootballField?.points?.length"
                  :points="startMaskConfig.leftFootballField.points"
                  :path="startMaskConfig.leftFootballField.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleLeftFootballFieldClick"
               />
               <HouseOutline
                  v-if="currentLevel === 'plane' && startMaskConfig.sportsCourts?.points?.length"
                  :points="startMaskConfig.sportsCourts.points"
                  :path="startMaskConfig.sportsCourts.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleSportsCourtsClick"
               />
               <HouseOutline
                  v-if="currentLevel === 'plane' && startMaskConfig.sportsCenter?.points?.length"
                  :points="startMaskConfig.sportsCenter.points"
                  :path="startMaskConfig.sportsCenter.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleSportsCenterClick"
               />
               <HouseOutline
                  v-if="currentLevel === 'plane' && startMaskConfig.sportsCenterTop?.points?.length"
                  :points="startMaskConfig.sportsCenterTop.points"
                  :path="startMaskConfig.sportsCenterTop.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleSportsCenterTopClick"
               />
               <HouseOutline
                  v-if="currentLevel === 'plane' && startMaskConfig.rightStadium?.points?.length"
                  :points="startMaskConfig.rightStadium.points"
                  :path="startMaskConfig.rightStadium.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleRightStadiumClick"
               />
               <HouseOutline
                  v-if="currentLevel === 'plane' && startMaskConfig.innerCourtyard?.points?.length"
                  :points="startMaskConfig.innerCourtyard.points"
                  :path="startMaskConfig.innerCourtyard.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleInnerCourtyardClick"
               />
               <!-- Маска на уровне plane: общий контур ЖК для перехода к фасаду (без подсветки) -->
               <HouseOutline
                  v-if="currentLevel === 'plane'"
                  :points="startMaskConfig.toApartments.points"
                  :path="startMaskConfig.toApartments.path"
                  :stroke-width="0"
                  :stroke-color="'transparent'"
                  :glow-color="'transparent'"
                  :glow-blur="0"
                  :animated="false"
                  :always-visible="true"
                  :on-click="handleFacadeStartClick"
               />
               <!-- Подписи зон спорткластера -->
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig?.toApartments?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.toApartments.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.toApartments.points).y + '%',
                  }"
               >
                  ЖК "СОЮЗ"
               </div>
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig.innerCourtyard?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.innerCourtyard.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.innerCourtyard.points).y + '%',
                  }"
                  @click.stop="handleInnerCourtyardClick"
               >
                  {{ startMasks.innerCourtyard.name }}
               </div>
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig.leftFootballField?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.leftFootballField.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.leftFootballField.points).y + '%',
                  }"
                  @click.stop="handleLeftFootballFieldClick"
               >
                  {{ startMasks.leftFootballField.name }}
               </div>
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig.sportsCourts?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.sportsCourts.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.sportsCourts.points).y + '%',
                  }"
                  @click.stop="handleSportsCourtsClick"
               >
                  {{ startMasks.sportsCourts.name }}
               </div>
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig.sportsCenter?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.sportsCenter.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.sportsCenter.points).y + '%',
                  }"
                  @click.stop="handleSportsCenterClick"
               >
                  {{ startMasks.sportsCenter.name }}
               </div>
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig.sportsCenterTop?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.sportsCenterTop.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.sportsCenterTop.points).y + '%',
                  }"
                  @click.stop="handleSportsCenterTopClick"
               >
                  {{ startMasks.sportsCenterTop.name }}
               </div>
               <div
                  v-if="currentLevel === 'plane' && startMaskConfig.rightStadium?.points?.length"
                  class="apartment-label"
                  :style="{
                     left: getMaskTopPosition(startMaskConfig.rightStadium.points).x + '%',
                     top: getMaskTopPosition(startMaskConfig.rightStadium.points).y + '%',
                  }"
                  @click.stop="handleRightStadiumClick"
               >
                  {{ startMasks.rightStadium.name }}
               </div>
               <template
                  v-for="floorId in ['g', '1', '2', '3', '4', '5']"
                  :key="floorId"
               >
                  <HouseOutline
                     v-if="
                        currentLevel === 'plane' && getFloorMaskConfig(floorId)
                     "
                     :points="getFloorMaskConfig(floorId).points"
                     :path="getFloorMaskConfig(floorId).path"
                     :stroke-width="getFloorMaskConfig(floorId).strokeWidth"
                     :glow-color="getFloorMaskConfig(floorId).glowColor"
                     :glow-blur="getFloorMaskConfig(floorId).glowBlur"
                     :animated="getFloorMaskConfig(floorId).animated"
                     :always-visible="getFloorMaskConfig(floorId).alwaysVisible"
                     :on-click="() => handleFloorClick(floorId)"
                  />
               </template>
               <template
                  v-for="apartment in currentFloorApartmentMasks"
                  :key="`floor-apartment-${apartment.id}`"
               >
                  <HouseOutline
                     v-if="isFloorLevel"
                     :points="apartment.points"
                     :path="apartment.path || ''"
                     :stroke-width="0"
                     :stroke-color="'transparent'"
                     :glow-color="'transparent'"
                     :glow-blur="0"
                     :animated="false"
                     :always-visible="selectedApartmentId === apartment.id"
                     :on-click="() => handleApartmentMaskClick(apartment)"
                  />
               </template>
            </template>
         </div>
         <video
            v-show="isTransitioning && transitionVideoSrc"
            ref="transitionVideo"
            :src="transitionVideoSrc"
            :preload="
               energySaving.getVideoAttributes(
                  !!(isTransitioning && transitionVideoSrc),
                  !!(isTransitioning && transitionVideoSrc)
               ).preload
            "
            :class="[
               'home-video',
               'home-video-transition',
               { 'element-hidden': !(isTransitioning && transitionVideoSrc) },
            ]"
            muted
            playsinline
            webkit-playsinline
            x5-playsinline
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-video-orientation="portraint"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            @ended="handleTransitionEnd"
            @loadedmetadata="handleVideoLoaded"
            @canplay="handleVideoCanPlay"
            @canplaythrough="handleVideoCanPlayThrough"
            @waiting="handleVideoWaiting"
            @playing="handleVideoPlaying"
         ></video>
         <div class="home-content-wrapper">
            <div class="home-content-top home-content">
               <div
                  v-if="currentLevel !== 'map'"
                  class="home-content-top-back"
                  :class="{ 'home-content-top-back-disabled': isTransitioning }"
                  @click="handleBackButtonClick"
               >
                  <Icon name="arrow" :size="24" color="currentColor" />
                  <div class="home-content-top-back-text">
                     <p>{{ currentLevel === "start" ? "Map" : "Назад" }}</p>
                  </div>
               </div>
               <div class="home-content-top-actions">
                  <div v-if="editMode" class="home-content-top-edit-mode">
                     <Icon name="help" :size="24" color="currentColor" />
                     <p>Режим редактирования</p>
                  </div>
               </div>
            </div>
            <div v-if="hasNavigationArrows" class="home-navigation-arrows">
               <button
                  class="home-nav-arrow home-nav-arrow-left"
                  :class="{
                     'home-nav-arrow-disabled':
                        disabledArrowLeft || isTransitioning,
                  }"
                  :disabled="disabledArrowLeft || isTransitioning"
                  @click="handleArrowNavigation('left')"
               >
                  <Icon name="arrow" :size="32" color="currentColor" />
               </button>
               <button
                  class="home-nav-arrow home-nav-arrow-right"
                  :class="{
                     'home-nav-arrow-disabled':
                        disabledArrowRight || isTransitioning,
                  }"
                  :disabled="disabledArrowRight || isTransitioning"
                  @click="handleArrowNavigation('right')"
               >
                  <Icon
                     name="arrow"
                     :size="32"
                     color="currentColor"
                     style="transform: rotate(180deg)"
                  />
               </button>
            </div>
            <div class="home-content-bottom home-content">
               <BottomActions :show-labels="true" :disabled="isTransitioning" />
            </div>
            <button
               v-if="isFloorLevel && currentFloorScheme2D && !showFloorPlanModal"
               class="home-floor-plan-btn"
               aria-label="Open floor plan"
               @click="apartmentSchemeImage = null; apartmentPlans = null; showFloorPlanModal = true"
            >
               <Icon name="location" :size="24" color="currentColor" />
            </button>
         </div>
      </div>
      <FloorPlanModal
         v-model="showFloorPlanModal"
         :image="(apartmentSchemeImage || currentFloorScheme2D)"
         :plans="apartmentPlans"
      />
   </div>
</template>

<script setup>
import {
   ref,
   computed,
   onMounted,
   onUnmounted,
   watch,
   nextTick,
   inject,
} from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import BottomActions from "../components/BottomActions.vue";
import HouseOutline from "../components/HouseOutline.vue";
import FloorPlanModal from "../components/FloorPlanModal.vue";
import { floorsConfig, levelImages, levelTransitions } from "../config/navigation.js";
import { floorApartmentMasksByFloor } from "../config/floorApartmentMasks.js";
import { useMasks } from "../composables/useMasks.js";
import { mapMasks, twoProjectsMasks, startMasks } from "../config/navigation.js";
import { useLevelStorage } from "../composables/useLevelStorage.js";
import { useNavigation } from "../composables/useNavigation.js";
import { useTransitions } from "../composables/useTransitions.js";
import { useImageDrag } from "../composables/useImageDrag.js";
import { useEnergySaving } from "../composables/useEnergySaving.js";
import {
   BACK_NAV_ACTIONS,
   decideBackNavigationAction,
} from "../utils/backNavigationDecision.js";

const showHeader = inject("showHeader", ref(false));
const { currentLevel, levelHistory } = useLevelStorage();

const router = useRouter();
const goToMap = () => {
   router.push("/map");
};

const imageWrapperRef = ref(null);
const homeImageRef = ref(null);
const scale = ref(1);
const maxZoom = 1.8;
const lastPosition = ref({ x: 0, y: 0 });

const isFloorLevel = computed(() =>
   typeof currentLevel.value === "string" &&
   currentLevel.value.startsWith("floor-")
);

const currentFloorScheme2D = computed(() => {
   const level = currentLevel.value;
   if (typeof level !== "string" || !level.startsWith("floor-")) return null;
   const floorId = level.replace("floor-", "");
   return floorsConfig[floorId]?.scheme2D ?? floorsConfig[floorId]?.image ?? null;
});

const currentFloorApartmentMasks = computed(() => {
   const level = currentLevel.value;
   if (typeof level !== "string" || !level.startsWith("floor-")) return [];
   const floorId = level.replace("floor-", "");
   return floorApartmentMasksByFloor[floorId] ?? [];
});

const getMaskClipPathStyle = (points) => {
   if (!points || points.length < 3) return {};
   const pointsStr = points.map((p) => `${p.x}% ${p.y}%`).join(", ");
   return {
      clipPath: `polygon(${pointsStr})`,
   };
};

const getMaskCenterPosition = (points) => {
   if (!points || points.length === 0) return { x: 0, y: 0 };
   const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
   const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
   return { x: avgX, y: avgY };
};

const getMaskLeftPosition = (points) => {
   if (!points || points.length === 0) return { x: 0, y: 0 };
   const minX = Math.min(...points.map(p => p.x));
   const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
   // Смещение ближе к маске
   const offset = 9;
   return { x: Math.max(2, minX - offset), y: avgY }; // Минимум 2% от левого края
};

const getMaskRightPosition = (points) => {
   if (!points || points.length === 0) return { x: 0, y: 0 };
   const maxX = Math.max(...points.map(p => p.x));
   const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
   // Смещение ближе к маске
   const offset = 10;
   return { x: Math.min(98, maxX + offset), y: avgY }; // Максимум 98% от левого края
};

const getMaskTopPosition = (points) => {
   if (!points || points.length === 0) return { x: 0, y: 0 };
   const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
   const minY = Math.min(...points.map(p => p.y));
   // Позиционирование над маской (координаты в процентах, отступ будет через margin)
   return { x: avgX, y: minY };
};

const getMaskBottomPosition = (points) => {
   if (!points || points.length === 0) return { x: 0, y: 0 };
   const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
   const maxY = Math.max(...points.map((p) => p.y));
   const offset = 2;
   return { x: avgX, y: Math.min(98, maxY + offset) };
};

const getInvertedMaskStyle = () => {
   // Используем SVG маску для вырезания областей масок из затемнения
   // Маска: белый = затемнение видно, черный = затемнение не видно (вырезано)
   return {
      mask: 'url(#darkness-mask)',
      WebkitMask: 'url(#darkness-mask)',
   };
};



const showFloorPlanModal = ref(false);
const apartmentSchemeImage = ref(null);
const apartmentPlans = ref(null);
const selectedApartmentId = ref(null);

const handleApartmentMaskClick = (apartment) => {
   selectedApartmentId.value = apartment.id;
   apartmentSchemeImage.value = apartment.scheme2D;
   apartmentPlans.value = {
      view3D: apartment.view3D ?? apartment.scheme3DLeft ?? apartment.scheme2D,
      view2D: apartment.scheme2D,
   };
   showFloorPlanModal.value = true;
};

watch(currentLevel, (newLevel) => {
   apartmentSchemeImage.value = null;
   apartmentPlans.value = null;
   selectedApartmentId.value = null;
   // Закрываем модальное окно при уходе с уровня этажа
   const isNewLevelFloor = typeof newLevel === "string" && newLevel.startsWith("floor-");
   if (!isNewLevelFloor) {
      showFloorPlanModal.value = false;
   }
});

const calculateMinZoomForFloor = () => {
   if (!imageWrapperRef.value) return 0.5;
   const containerRect = imageWrapperRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const imageWidth =
      imageDimensions.value.width ||
      homeImageRef.value?.naturalWidth ||
      homeImageRef.value?.offsetWidth ||
      containerWidth;
   const minZoomByWidth = containerWidth / imageWidth;
   return Math.max(0.5, minZoomByWidth);
};

const getCenterPositionForFloor = (newScale) => {
   if (!imageWrapperRef.value) return { x: 0, y: 0 };
   const containerRect = imageWrapperRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;
   const imageWidth =
      imageDimensions.value.width ||
      homeImageRef.value?.naturalWidth ||
      homeImageRef.value?.offsetWidth ||
      containerWidth;
   const imageHeight =
      imageDimensions.value.height ||
      homeImageRef.value?.naturalHeight ||
      homeImageRef.value?.offsetHeight ||
      containerHeight;
   const scaledWidth = imageWidth * newScale;
   const scaledHeight = imageHeight * newScale;
   const centerX = (containerWidth - scaledWidth) / 2;
   const centerY = (containerHeight - scaledHeight) / 2;
   return { x: centerX, y: centerY };
};

const imageDrag = useImageDrag(imageWrapperRef, homeImageRef, scale);

const position = imageDrag.position;
const isDragging = imageDrag.isDragging;

const originalConstrainPosition = imageDrag.constrainPosition;
imageDrag.constrainPosition = (newPosition, currentScale = scale.value) => {
   if (!isFloorLevel.value) {
      return originalConstrainPosition(newPosition, currentScale);
   }
   if (!imageWrapperRef.value || !homeImageRef.value) return newPosition;
   const containerRect = imageWrapperRef.value.getBoundingClientRect();
   const containerWidth = containerRect.width;
   const containerHeight = containerRect.height;
   const imageWidth =
      imageDimensions.value.width ||
      homeImageRef.value.naturalWidth ||
      homeImageRef.value.offsetWidth ||
      containerWidth;
   const imageHeight =
      imageDimensions.value.height ||
      homeImageRef.value.naturalHeight ||
      homeImageRef.value.offsetHeight ||
      containerHeight;
   const scaledWidth = imageWidth * currentScale;
   const scaledHeight = imageHeight * currentScale;
   const minX = containerWidth - scaledWidth;
   const maxX = 0;
   const minY = containerHeight - scaledHeight;
   const maxY = 0;
   if (scaledWidth <= containerWidth) {
      const centerX = (containerWidth - scaledWidth) / 2;
      return {
         x: centerX,
         y: Math.max(
            minY,
            Math.min(maxY, newPosition.y !== 0 ? newPosition.y : (containerHeight - scaledHeight) / 2)
         ),
      };
   }
   if (scaledHeight <= containerHeight) {
      const centerY = (containerHeight - scaledHeight) / 2;
      return {
         x: Math.max(
            minX,
            Math.min(maxX, newPosition.x !== 0 ? newPosition.x : (containerWidth - scaledWidth) / 2)
         ),
         y: centerY,
      };
   }
   return {
      x: Math.max(minX, Math.min(maxX, newPosition.x)),
      y: Math.max(minY, Math.min(maxY, newPosition.y)),
   };
};

const originalHandleMouseMove = imageDrag.handleMouseMove;
imageDrag.handleMouseMove = (event) => {
   if (isFloorLevel.value && isDragging.value) {
      const newPosition = {
         x: event.clientX - imageDrag.dragStart.value.x,
         y: event.clientY - imageDrag.dragStart.value.y,
      };
      position.value = imageDrag.constrainPosition(newPosition, scale.value);
      lastPosition.value = { ...position.value };
   } else {
      originalHandleMouseMove(event);
   }
};

const initialPinchDistance = ref(0);
const initialPinchScale = ref(1);
const initialPinchCenter = ref({ x: 0, y: 0 });

const originalHandleTouchStart = imageDrag.handleTouchStart;
imageDrag.handleTouchStart = (event) => {
   if (isFloorLevel.value && event.touches.length === 2) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
         Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      initialPinchDistance.value = distance;
      initialPinchScale.value = scale.value;
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const containerRect = imageWrapperRef.value.getBoundingClientRect();
      initialPinchCenter.value = {
         x: centerX,
         y: centerY,
         mapX: (centerX - containerRect.left - position.value.x) / scale.value,
         mapY: (centerY - containerRect.top - position.value.y) / scale.value,
      };
   } else if (event.touches.length === 1) {
      originalHandleTouchStart(event);
   }
};

const originalHandleTouchMove = imageDrag.handleTouchMove;
imageDrag.handleTouchMove = (event) => {
   if (isFloorLevel.value && event.touches.length === 2) {
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
            calculateMinZoomForFloor(),
            Math.min(maxZoom, initialPinchScale.value * scaleRatio)
         );
         if (newScale !== scale.value) {
            scale.value = newScale;
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            const containerRect = imageWrapperRef.value.getBoundingClientRect();
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
   } else if (isFloorLevel.value && isDragging.value && event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      const newPosition = {
         x: touch.clientX - imageDrag.dragStart.value.x,
         y: touch.clientY - imageDrag.dragStart.value.y,
      };
      position.value = imageDrag.constrainPosition(newPosition, scale.value);
      lastPosition.value = { ...position.value };
   } else if (event.touches.length === 1) {
      originalHandleTouchMove(event);
   }
};

const originalHandleTouchEnd = imageDrag.handleTouchEnd;
imageDrag.handleTouchEnd = (event) => {
   if (event.touches.length === 0 || event.touches.length === 1) {
      initialPinchDistance.value = 0;
      if (event.touches.length === 1) {
         originalHandleTouchStart(event);
      } else {
         originalHandleTouchEnd(event);
      }
   } else {
      originalHandleTouchEnd(event);
   }
};

const homeImageStyle = computed(() => {
   const dragStyle = imageDrag.imageStyle.value;
   if (imageDimensions.value.width > 0 && imageDimensions.value.height > 0) {
      return {
         ...dragStyle,
         width: `${imageDimensions.value.width}px`,
         height: `${imageDimensions.value.height}px`,
      };
   }
   return dragStyle;
});

let updateActiveImageRef = () => {};
let getActiveLevel = () => currentLevel.value;
let getLevelImageZIndex = () => 1;

const calculateImageDimensions = () => {
   const activeLevel = getActiveLevel();
   const activeImage =
      document.querySelector(
         `.home-image-level[data-level="${activeLevel}"]`
      ) || homeImageRef.value;
   if (!activeImage || !imageWrapperRef.value) return;

   let containerWidth = imageWrapperRef.value.offsetWidth;
   let containerHeight = imageWrapperRef.value.offsetHeight;
   
   // For Telegram mini app, use more reliable dimensions
   if (containerWidth <= 0 || containerHeight <= 0) {
      containerWidth = document.documentElement.clientWidth || 
                      window.visualViewport?.width || 
                      window.innerWidth;
      containerHeight = document.documentElement.clientHeight || 
                       window.visualViewport?.height || 
                       window.innerHeight;
   }
   
   const naturalWidth = activeImage.naturalWidth;
   const naturalHeight = activeImage.naturalHeight;

   if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight)
      return;

   const aspectRatio = naturalWidth / naturalHeight;
   const containerAspectRatio = containerWidth / containerHeight;

   if (aspectRatio > containerAspectRatio) {
      imageDimensions.value = {
         width: containerHeight * aspectRatio,
         height: containerHeight,
      };
   } else {
      imageDimensions.value = {
         width: containerWidth,
         height: containerWidth / aspectRatio,
      };
   }
};

const imageDimensions = ref({ width: 0, height: 0 });
const shouldCenterOnLoad = ref(true);

watch(
   currentLevel,
   (newLevel, oldLevel) => {
      disabledArrowLeft.value = false;
      disabledArrowRight.value = false;

      scale.value = 1;

      shouldCenterOnLoad.value = true;
      updateActiveImageRef();
      nextTick(() => {
         const activeLevel = getActiveLevel();
         const activeImage =
            document.querySelector(
               `.home-image-level[data-level="${activeLevel}"]`
            ) || homeImageRef.value;
         if (activeImage?.complete) {
            calculateImageDimensions();
            setTimeout(() => {
               if (typeof activeLevel === "string" && activeLevel.startsWith("floor-")) {
                  const currentMinZoom = calculateMinZoomForFloor();
                  scale.value = currentMinZoom;
                  const centerPos = getCenterPositionForFloor(currentMinZoom);
                  position.value = imageDrag.constrainPosition(centerPos, currentMinZoom);
                  lastPosition.value = { ...position.value };
               } else {
                  imageDrag.centerPosition();
               }
               shouldCenterOnLoad.value = false;
            }, 100);
         } else {
            imageDrag.resetPosition();
         }
         setTimeout(() => {
            window.dispatchEvent(new CustomEvent("mask-update"));
         }, 100);
      });
   },
   { flush: "post" }
);

const onImageLoad = () => {
   if (imageWrapperRef.value) {
      imageWrapperRef.value.style.cursor = "grab";
   }

   const activeLevel = getActiveLevel();
   if (homeImageRef.value) {
      energySaving.optimizeImage(
         homeImageRef.value,
         getLevelImageZIndex(activeLevel) === 2,
         getLevelImageZIndex(activeLevel) === 2
      );
   }

   setTimeout(() => {
      window.dispatchEvent(new CustomEvent("mask-update"));
   }, 50);

   calculateImageDimensions();

   if (imageDimensions.value.width > 0 && imageDimensions.value.height > 0) {
      setTimeout(() => {
         const activeLevel = getActiveLevel();
         if (typeof activeLevel === "string" && activeLevel.startsWith("floor-")) {
            const currentMinZoom = calculateMinZoomForFloor();
            scale.value = currentMinZoom;
            const centerPos = getCenterPositionForFloor(currentMinZoom);
            position.value = imageDrag.constrainPosition(centerPos, currentMinZoom);
            lastPosition.value = { ...position.value };
         } else {
            imageDrag.centerPosition();
         }
         if (shouldCenterOnLoad.value) {
            shouldCenterOnLoad.value = false;
         }
      }, 50);
   }
};

const homeImageSizeStyle = computed(() => {
   if (imageDimensions.value.width > 0 && imageDimensions.value.height > 0) {
      return {
         width: `${imageDimensions.value.width}px`,
         height: `${imageDimensions.value.height}px`,
      };
   }
   return {
      width: "100%",
      height: "100%",
      objectFit: "cover",
   };
});

let getImageStyle = (level) => {
   const sizeStyle = homeImageSizeStyle.value;
   return {
      ...sizeStyle,
      zIndex: 1,
   };
};

const handleResize = (event) => {
   // Handle window resize and visualViewport changes (for Telegram mini app)
   if (event?.type === "resize" && (event.target === window || event.target === window.visualViewport)) {
      const activeLevel = getActiveLevel();
      const activeImage =
         document.querySelector(
            `.home-image-level[data-level="${activeLevel}"]`
         ) || homeImageRef.value;
      if (activeImage?.complete) {
         calculateImageDimensions();
         if (typeof activeLevel === "string" && activeLevel.startsWith("floor-")) {
            const calculatedMinZoom = calculateMinZoomForFloor();
            if (scale.value < calculatedMinZoom) {
               scale.value = calculatedMinZoom;
            }
            position.value = imageDrag.constrainPosition(position.value, scale.value);
            lastPosition.value = { ...position.value };
         }
         setTimeout(() => {
            window.dispatchEvent(new CustomEvent("mask-update"));
         }, 100);
      }
   }
};

watch(
   position,
   (newPos) => {
      lastPosition.value = { ...newPos };
   },
   { deep: true }
);

watch(scale, (newScale) => {
   if (!isFloorLevel.value) return;
   const currentMinZoom = calculateMinZoomForFloor();
   if (newScale < currentMinZoom) {
      scale.value = currentMinZoom;
      return;
   }
   position.value = imageDrag.constrainPosition(position.value, newScale);
   lastPosition.value = { ...position.value };
});

const {
   editMode,
   showHouseOutline1,
   showHouseOutline2,
   mapMaskConfig,
   twoProjectsMaskConfig,
   getFloorMaskConfig,
   startMaskConfig,
} = useMasks();

const disabledArrowLeft = ref(false);
const disabledArrowRight = ref(false);
const energySaving = useEnergySaving();

const transitions = useTransitions(currentLevel, levelHistory);
const {
   isTransitioning,
   transitionVideoSrc,
   transitionVideo,
   preloadImage,
   preloadImageLoaded,
   isReverseTransition,
   reverseSourceLevel,
   forwardSourceLevel,
   handleVideoLoaded,
   handleTransitionEnd: originalHandleTransitionEnd,
   startLevelTransition,
   goBackToLevel: goBackToLevelTransition,
   onPreloadImageLoaded,
} = transitions;

const handleTransitionEnd = () => {
   originalHandleTransitionEnd();
   setTimeout(() => {
      window.dispatchEvent(new CustomEvent("mask-update"));
   }, 100);
};

const handleVideoCanPlay = () => {
   if (transitionVideo.value && isTransitioning.value) {
      transitionVideo.value.style.willChange = "transform, opacity, contents";
   }
};

const handleVideoCanPlayThrough = () => {
   if (transitionVideo.value && isTransitioning.value) {
      transitionVideo.value.style.willChange = "transform, opacity, contents";
   }
};

const handleVideoWaiting = () => {
   if (transitionVideo.value && isTransitioning.value) {
      try {
         if (transitionVideo.value.buffered.length > 0) {
            const bufferedEnd = transitionVideo.value.buffered.end(0);
            const currentTime = transitionVideo.value.currentTime;
            if (bufferedEnd - currentTime < 1) {
               transitionVideo.value.load();
            }
         }
      } catch (e) {}
   }
};

const handleVideoPlaying = () => {
   if (transitionVideo.value && isTransitioning.value) {
      transitionVideo.value.style.transform = "translate3d(0, 0, 0)";
      transitionVideo.value.style.willChange = "transform, opacity, contents";
   }
};

const goBackToLevel = (targetLevel) => {
   goBackToLevelTransition(targetLevel, disabledArrowLeft, disabledArrowRight);
};

const navigation = useNavigation(
   currentLevel,
   levelHistory,
   isTransitioning,
   disabledArrowLeft,
   disabledArrowRight,
   startLevelTransition,
   goBackToLevel,
   isReverseTransition,
   reverseSourceLevel,
   forwardSourceLevel
);

const {
   currentStaticImage,
   allLevelImages,
   getLevelImageZIndex: getLevelImageZIndexFn,
   getActiveLevel: getActiveLevelFn,
   getLevelImage,
   handleHouse1Click,
   handleHouse2Click,
   handleProject1Click,
   handleProject2Click,
   handleFacadeStartClick,
   handleFacadeStart2Click,
   handleBackToStartFromFacade,
   handleBackToStartFromFacade2,
   handleFloorClick,
   handleBackClick,
   handleBackFromFacade,
   handleLeftFootballFieldClick,
   handleSportsCourtsClick,
   handleSportsCenterClick,
   handleSportsCenterTopClick,
   handleRightStadiumClick,
   handleInnerCourtyardClick,
} = navigation;

/** После build8→builds-2 круг замкнут: «Назад» ведёт на plane (Build2) с Build3-reverse. */
const facadeLoopCompleted = ref(false);
/** Резервный маркер: в текущем заходе по фасаду уже доходили до build8. */
const reachedBuild8InCurrentFacadeRun = ref(false);

watch(currentLevel, (level, oldLevel) => {
   const isFacadeLevel = (value) =>
      value === "builds" ||
      value === "builds-2" ||
      value === "view-4" ||
      value === "view-5" ||
      value === "view-6" ||
      value === "build8";

   if (level === "build8") {
      reachedBuild8InCurrentFacadeRun.value = true;
   }

   // Замкнули круг по часовой: build8 -> builds-2.
   // Также считаем замыканием круга сценарий против часовой: view-4 -> builds-2.
   if (
      level === "builds-2" &&
      (oldLevel === "build8" || oldLevel === "view-4")
   ) {
      facadeLoopCompleted.value = true;
   }
   if (level === "builds" && oldLevel === "plane") {
      facadeLoopCompleted.value = false;
      reachedBuild8InCurrentFacadeRun.value = false;
   }
   if (
      oldLevel === "builds-2" &&
      (level === "view-4" || level === "build8")
   ) {
      facadeLoopCompleted.value = false;
   }

   // Сброс при выходе из фасадного обхода (назад на plane/map/start или в другие режимы).
   if (oldLevel && isFacadeLevel(oldLevel) && !isFacadeLevel(level)) {
      facadeLoopCompleted.value = false;
      reachedBuild8InCurrentFacadeRun.value = false;
   }
});

const triggerFacadeSnapToBuilds = () => {
   if (currentLevel.value === "builds") return;
   currentLevel.value = "builds";
};

const FACADE_PERIPHERAL_LEVELS = [
   "builds-2",
   "view-4",
   "view-5",
   "view-6",
   "build8",
];

getActiveLevel = getActiveLevelFn;
getLevelImageZIndex = getLevelImageZIndexFn;

/**
 * Логика «Назад» только по currentLevel: getActiveLevel() учитывает forward/reverse во время роликов
 * и может расходиться с фактическим уровнем — из‑за этого лишний snap и двойные нажатия.
 */
const handleBackButtonClick = () => {
   const level = currentLevel.value;
   const activeLevel = getActiveLevel();
   const backToPlaneFromTargetBuild3 = () => {
      facadeLoopCompleted.value = false;
      reachedBuild8InCurrentFacadeRun.value = false;
      // Для целевого кадра всегда используем reverse переход builds -> plane (Build3-reverse).
      if (currentLevel.value !== "builds") {
         currentLevel.value = "builds";
      }
      goBackToLevel("plane");
   };

   const action = decideBackNavigationAction({
      level,
      activeLevel,
      isTransitioning: isTransitioning.value,
      facadeLoopCompleted: facadeLoopCompleted.value,
      reachedBuild8InCurrentFacadeRun: reachedBuild8InCurrentFacadeRun.value,
   });

   if (action === BACK_NAV_ACTIONS.TO_MAP) {
      goToMap();
      return;
   }

   if (action === BACK_NAV_ACTIONS.TO_PLANE_VIA_BUILD3) {
      backToPlaneFromTargetBuild3();
      return;
   }

   if (action === BACK_NAV_ACTIONS.NOOP) return;

   if (action === BACK_NAV_ACTIONS.SNAP_TO_BUILDS || FACADE_PERIPHERAL_LEVELS.includes(level)) {
      triggerFacadeSnapToBuilds();
      return;
   }

   handleBackClick();
};

updateActiveImageRef = () => {
   nextTick(() => {
      const activeLevel = getActiveLevel();
      const activeImage = document.querySelector(
         `.home-image-level[data-level="${activeLevel}"]`
      );
      if (activeImage && activeImage !== homeImageRef.value) {
         homeImageRef.value = activeImage;
      }
   });
};

getImageStyle = (level) => {
   const sizeStyle = homeImageSizeStyle.value;
   return {
      ...sizeStyle,
      zIndex: getLevelImageZIndex(level),
   };
};

watch(
   [
      isTransitioning,
      isReverseTransition,
      reverseSourceLevel,
      forwardSourceLevel,
   ],
   () => {
      updateActiveImageRef();
   },
   { flush: "post" }
);

let maskUpdateTimeout = null;
watch(
   [
      currentLevel,
      isTransitioning,
      isReverseTransition,
      reverseSourceLevel,
      forwardSourceLevel,
   ],
   () => {
      updateActiveImageRef();

      const activeLevel = getActiveLevel();
      const activeImage =
         document.querySelector(
            `.home-image-level[data-level="${activeLevel}"]`
         ) || homeImageRef.value;
      if (activeImage) {
         energySaving.optimizeImage(
            activeImage,
            getLevelImageZIndex(activeLevel) === 2,
            getLevelImageZIndex(activeLevel) === 2
         );
      }

      if (maskUpdateTimeout) clearTimeout(maskUpdateTimeout);

      if (activeImage) {
         if (activeImage.complete) {
            maskUpdateTimeout = setTimeout(() => {
               window.dispatchEvent(new CustomEvent("mask-update"));
               maskUpdateTimeout = null;
            }, 150);
         } else {
            activeImage.addEventListener(
               "load",
               () => {
                  if (maskUpdateTimeout) clearTimeout(maskUpdateTimeout);
                  maskUpdateTimeout = setTimeout(() => {
                     window.dispatchEvent(new CustomEvent("mask-update"));
                     maskUpdateTimeout = null;
                  }, 150);
               },
               { once: true }
            );
         }
      }
   },
   { flush: "post" }
);

const arrowLevels = ["builds", "build8", "builds-2", "view-4", "view-5", "view-6"];
const hasNavigationArrows = computed(() => {
   const level = currentLevel.value;
   return typeof level === "string" && arrowLevels.includes(level);
});

const arrowChainRight = {
   plane: { key: "start-to-facade-start", next: "builds" },
   builds: {
      key: "start-to-facade-start-2",
      next: "builds-2",
   },
   "builds-2": {
      key: "facade-start-to-view-4",
      next: "view-4",
   },
   "view-4": { key: "view-4-to-view-5", next: "view-5" },
   "view-5": { key: "view-5-to-view-6", next: "view-6" },
   "view-6": {
      key: "view-6-to-facade-start",
      next: "build8",
   },
   build8: {
      key: "start-to-facade-start-2",
      next: "builds-2",
   },
};

// Обратный просмотр ЖК по зданию (Appartment): только reverse-видео по цепочке
const arrowChainLeft = {
   builds: "view-6",
   build8: "view-6",
   "builds-2": "build8",
   "view-4": "builds-2",
   "view-5": "view-4",
   "view-6": "view-5",
};

const handleArrowNavigation = (direction) => {
   if (isTransitioning.value) return;

   if (direction === "left") {
      const prevLevel = arrowChainLeft[currentLevel.value];
      if (prevLevel) {
         // Замыкание круга против часовой: view-4 -> builds-2.
         if (currentLevel.value === "view-4" && prevLevel === "builds-2") {
            facadeLoopCompleted.value = true;
         }
         goBackToLevel(prevLevel);
      }
      return;
   }

   if (direction !== "right") return;

   const chainStep = arrowChainRight[currentLevel.value];
   if (!chainStep) return;

   // Замыкание круга по часовой: build8 → builds-2 (тот же ключ видео, что builds → builds-2).
   // Ставим флаг до старта перехода — не зависит от порядка срабатывания watch(currentLevel).
   if (currentLevel.value === "build8" && chainStep.next === "builds-2") {
      facadeLoopCompleted.value = true;
   }

   const videoSrc = levelTransitions[chainStep.key];
   if (!videoSrc) {
      currentLevel.value = chainStep.next;
      return;
   }

   startLevelTransition(videoSrc, chainStep.next);
};

const isMaskElement = (target) => {
   if (!target) return false;
   const hitArea = target.closest(".house-outline-hit-area");
   const wrapper = target.closest(".house-outline-wrapper");
   return !!(hitArea || wrapper);
};

const handleImageTouchStart = (event) => {
   if (!event?.touches || event.touches.length === 0) return;
   imageDrag.handleTouchStart(event);
};

const handleImageTouchMove = (event) => {
   if (!event?.touches || event.touches.length === 0) return;
   imageDrag.handleTouchMove(event);
};

const handleImageTouchEnd = (event) => {
   if (!event) return;
   imageDrag.handleTouchEnd(event);
};

const handleImageMouseDown = (event) => {
   if (!event?.target) return;
   imageDrag.handleMouseDown(event);
};

const handleImageMouseMove = (event) => {
   if (!event) return;
   imageDrag.handleMouseMove(event);
};

const handleImageMouseUp = () => {
   imageDrag.handleMouseUp();
};

const handleImageWheel = (event) => {
   event.preventDefault();
   if (!isFloorLevel.value) return;

   const delta = event.deltaY > 0 ? -0.1 : 0.1;
   const currentMinZoom = calculateMinZoomForFloor();
   const newScale = Math.max(
      currentMinZoom,
      Math.min(maxZoom, scale.value + delta)
   );

   if (newScale === scale.value) return;
   if (!imageWrapperRef.value || !homeImageRef.value) return;

   const rect = imageWrapperRef.value.getBoundingClientRect();
   const mouseX = event.clientX - rect.left;
   const mouseY = event.clientY - rect.top;

   const mapX = (mouseX - position.value.x) / scale.value;
   const mapY = (mouseY - position.value.y) / scale.value;

   scale.value = newScale;

   const newPosition = {
      x: mouseX - mapX * newScale,
      y: mouseY - mapY * newScale,
   };

   position.value = imageDrag.constrainPosition(newPosition, newScale);
   lastPosition.value = { ...position.value };
};

watch(
   [() => isTransitioning.value, () => transitionVideoSrc.value],
   ([isTransitioning, videoSrc]) => {
      if (transitionVideo.value) {
         const isVisible = isTransitioning && !!videoSrc;
         energySaving.optimizeVideo(
            transitionVideo.value,
            isVisible,
            isVisible
         );
      }
   },
   { flush: "post" }
);

watch(
   [
      () => allLevelImages.value,
      () => isTransitioning.value,
      () => isReverseTransition.value,
      () => reverseSourceLevel.value,
      () => forwardSourceLevel.value,
      () => currentLevel.value,
   ],
   () => {
      allLevelImages.value.forEach((levelImage) => {
         const imageElement = document.querySelector(
            `.home-image-level[data-level="${levelImage.level}"]`
         );
         if (imageElement) {
            const zIndex = getLevelImageZIndex(levelImage.level);
            energySaving.optimizeImage(
               imageElement,
               zIndex === 2,
               zIndex === 2
            );
         }
      });
   },
   { immediate: true, flush: "post" }
);

watch(
   () => preloadImage.value,
   (newPreloadImage) => {
      const preloadImg = document.querySelector(".home-image-preload");
      if (preloadImg) {
         energySaving.optimizeImage(preloadImg, !!newPreloadImage, false);
      }
   },
   { flush: "post" }
);

onMounted(() => {
   if (imageWrapperRef.value) {
      imageWrapperRef.value.style.cursor = "grab";
   }

   updateActiveImageRef();

   nextTick(() => {
      const activeLevel = getActiveLevel();
      const activeImage =
         document.querySelector(
            `.home-image-level[data-level="${activeLevel}"]`
         ) || homeImageRef.value;
      if (activeImage) {
         energySaving.optimizeImage(
            activeImage,
            getLevelImageZIndex(activeLevel) === 2,
            getLevelImageZIndex(activeLevel) === 2
         );
      }

      allLevelImages.value.forEach((levelImage) => {
         const imageElement = document.querySelector(
            `.home-image-level[data-level="${levelImage.level}"]`
         );
         if (imageElement && imageElement !== activeImage) {
            energySaving.optimizeImage(
               imageElement,
               getLevelImageZIndex(levelImage.level) === 2,
               getLevelImageZIndex(levelImage.level) === 2
            );
         }
      });

      const preloadImg = document.querySelector(".home-image-preload");
      if (preloadImg) {
         energySaving.optimizeImage(preloadImg, !!preloadImage.value, false);
      }

      if (transitionVideo.value) {
         energySaving.optimizeVideo(
            transitionVideo.value,
            !!(isTransitioning.value && transitionVideoSrc.value),
            !!(isTransitioning.value && transitionVideoSrc.value)
         );
      }
   });

   nextTick(() => {
      const activeLevel = getActiveLevel();
      const activeImage =
         document.querySelector(
            `.home-image-level[data-level="${activeLevel}"]`
         ) || homeImageRef.value;
      if (activeImage?.complete && imageWrapperRef.value) {
         setTimeout(() => {
            if (
               imageDimensions.value.width === 0 ||
               imageDimensions.value.height === 0
            ) {
               calculateImageDimensions();
            }
            setTimeout(() => {
               imageDrag.centerPosition();
            }, 50);
         }, 100);
      }
   });

   window.addEventListener("resize", handleResize);
   
   // Also listen to visualViewport changes for Telegram mini app and mobile browsers
   if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
   }
});

onUnmounted(() => {
   transitions.cleanup();
   window.removeEventListener("resize", handleResize);
   
   // Remove visualViewport listeners
   if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", handleResize);
      window.visualViewport.removeEventListener("scroll", handleResize);
   }
});
</script>

<style scoped>
.home {
   width: 100%;
   height: 100dvh;
   overflow: hidden;
   position: relative;
}

@supports (height: 100dvh) {
   .home {
      height: 100dvh;
   }
}

.home-image-wrapper {
   width: 100%;
   height: 100%;
   position: relative;
   overflow: hidden;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   touch-action: none;
   cursor: grab;
}

.home-image-wrapper-floor {
   touch-action: pan-x pan-y pinch-zoom;
}

.home-image-wrapper:active {
   cursor: grabbing;
}

.home-image-content {
   position: absolute;
   top: 0;
   left: 0;
   will-change: transform;
   cursor: grab;
   touch-action: none;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   user-select: none;
}

.home-image-content:active {
   cursor: grabbing;
}

@media (hover: none) and (pointer: coarse) {
   .home-image-content {
      cursor: default;
   }

   .home-image-content:active {
      cursor: default;
   }
}

.home-video {
   width: 100%;
   height: 100%;
   object-fit: cover;
   object-position: center;
   position: absolute;
   top: 0;
   left: 0;
   transform: translate3d(0, 0, 0);
   -webkit-transform: translate3d(0, 0, 0);
   will-change: transform, opacity;
   backface-visibility: hidden;
   -webkit-backface-visibility: hidden;
   perspective: 1000px;
   -webkit-perspective: 1000px;
   image-rendering: -webkit-optimize-contrast;
   image-rendering: crisp-edges;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   isolation: isolate;
   -webkit-tap-highlight-color: transparent;
}

.home-image {
   display: block;
   position: absolute;
   top: 0;
   left: 0;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   pointer-events: none;
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
   backface-visibility: hidden;
   -webkit-backface-visibility: hidden;
   opacity: 0;
   visibility: hidden;
   transition: opacity 0s, visibility 0s;
}

.home-image-level {
   z-index: 1;
}

.home-image-active {
   z-index: 2;
   opacity: 1;
   visibility: visible;
   transition: opacity 0s, visibility 0s;
}

.home-image-preload {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   object-fit: cover;
   z-index: 0;
   pointer-events: none;
}

.home-image-wrapper .element-hidden,
.home-image-wrapper .element-hidden.home-image-preload,
.home-image-wrapper .element-hidden.home-video-transition {
   z-index: -10;
   pointer-events: none;
   opacity: 0;
   visibility: hidden;
   will-change: auto;
   content-visibility: auto;
   contain-intrinsic-size: 0 0;
}

.home-image-wrapper .element-hidden.home-image-level {
   z-index: 0;
   pointer-events: none;
   opacity: 0;
   visibility: hidden;
   will-change: auto;
}

.home-video-transition {
   opacity: 1;
   z-index: 10;
   will-change: transform, opacity, contents;
   transform: translate3d(0, 0, 0);
   -webkit-transform: translate3d(0, 0, 0);
   contain: layout style paint;
   -webkit-tap-highlight-color: transparent;
}

.home-image-wrapper .home-video-transition.element-hidden {
   z-index: -10;
   pointer-events: none;
   opacity: 0;
   visibility: hidden;
}

.home-content-wrapper {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   z-index: 10;
   pointer-events: none;
}

.home-content-wrapper > * {
   pointer-events: all;
}

.home-content {
   display: flex;
   justify-content: space-between;
   padding: 3rem 4rem;
}

@media (max-width: 768px) {
   .home-content {
      padding: 1.5rem 1rem;
   }
}

.home-content-top {
   display: flex;
   justify-content: space-between;
   align-items: center;
   transition: transform 0.3s ease;
}

.home-content-top-actions {
   display: flex;
   align-items: center;
   gap: 0.5rem;
}

.home-content-top-back {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   background-color: #fff;
   color: #0e0e0e;
   padding: 0.5rem 1rem;
   border-radius: 1rem;
   cursor: pointer;
   transition: all 0.3s ease;
   text-decoration: none;
}

.home-content-top-back:hover:not(.home-content-top-back-disabled) {
   opacity: 0.8;
}

.home-content-top-back-disabled {
   opacity: 0.5;
   cursor: not-allowed;
}

.home-content-top-title {
   font-weight: 500;
   font-size: 1.7rem;
}


.home-content-top-edit-mode {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   background-color: #ff6b6b;
   color: #fff;
   padding: 0.5rem 1rem;
   border-radius: 1rem;
   font-weight: 600;
}

.home-content-slider {
   margin: 0 auto;
   max-width: 50%;
   width: 100%;
}

.home-content-slider-arrow {
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   width: 44px;
   height: 44px;
   border-radius: 50%;
   padding: 0.5rem;
   cursor: pointer;
   transition: all 0.3s ease;
}

.home-content-slider-arrow:hover:not(.home-content-slider-arrow-disabled) {
   background-color: rgba(14, 14, 14, 0.8);
}

.home-content-slider-arrow-disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none;
}

.home-content-bottom {
   justify-content: flex-end;
}

.home-content-arrows {
   position: absolute;
   top: 50%;
   left: 0;
   right: 0;
   transform: translateY(-50%);
   display: flex;
   justify-content: space-between;
   padding: 0 4rem;
   z-index: 10;
   pointer-events: none;
}

.home-content-arrows > * {
   pointer-events: all;
}

.home-content-arrow {
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   width: 60px;
   height: 60px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
   transition: all 0.3s ease;
   color: #fff;
}

.home-content-arrow:hover:not(.home-content-arrow-disabled) {
   background-color: rgba(14, 14, 14, 0.8);
   transform: scale(1.1);
}

.home-content-arrow-disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none;
}

.home-content-arrow-right {
   transform: rotate(180deg);
}

.home-content-arrow-right:hover:not(.home-content-arrow-disabled) {
   transform: rotate(180deg) scale(1.1);
}

.home-mask-overlay {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   z-index: 12;
   pointer-events: none;
   animation: fadeInOverlay 0.6s ease-in-out;
}

@keyframes fadeInOverlay {
   from {
      opacity: 0;
   }
   to {
      opacity: 1;
   }
}

.home-mask-overlay-dark {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.6);
   pointer-events: none;
   transition: opacity 0.6s ease-in-out;
}

.apartment-label {
   position: absolute;
   background: rgba(255, 255, 255, 0.95);
   color: #000;
   padding: 0.35rem 0.75rem;
   border-radius: 6px;
   border: none;
   font-size: 16px;
   font-weight: 500;
   white-space: nowrap;
   z-index: 13;
   pointer-events: all;
   cursor: pointer;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
   transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
   transform: translateX(-50%);
   will-change: transform;
   max-width: calc(100% - 20px);
   overflow: hidden;
   text-overflow: ellipsis;
}

.apartment-label:hover {
   opacity: 0.9;
   border-color: transparent;
}

.apartment-label-left {
   margin-right: 0.5rem;
   padding-right: 0.5rem;
}

.apartment-label-right {
   margin-left: 0.5rem;
   padding-left: 0.5rem;
}

.apartment-label-top {
   margin-bottom: 0.5rem;
   padding-bottom: 0.5rem;
}

@media (max-width: 768px) {
   .apartment-label {
      font-size: 14px;
      padding: 0.4rem 0.8rem;
      max-width: calc(50% - 10px);
   }
}


.home-floor-plan-btn {
   position: absolute;
   top: 50%;
   right: 1rem;
   transform: translateY(-50%);
   width: 48px;
   height: 48px;
   border-radius: 50%;
   background: rgba(14, 14, 14, 0.6);
   backdrop-filter: blur(8px);
   border: 1px solid rgba(255, 255, 255, 0.2);
   color: #fff;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 15;
   transition: all 0.2s ease;
}

.home-floor-plan-btn:hover {
   background: rgba(14, 14, 14, 0.8);
   border-color: rgba(255, 255, 255, 0.4);
   transform: translateY(-50%) scale(1.05);
}

.home-floor-plan-btn:active {
   transform: translateY(-50%) scale(0.95);
}

@media (max-width: 768px) {
   .home-floor-plan-btn {
      right: 0.75rem;
      width: 44px;
      height: 44px;
   }
}

.home-navigation-arrows {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 1rem;
   pointer-events: none;
   z-index: 15;
}

.home-nav-arrow {
   display: flex;
   align-items: center;
   justify-content: center;
   width: 56px;
   height: 56px;
   background-color: rgba(14, 14, 14, 0.6);
   backdrop-filter: blur(8px);
   border: 1px solid rgba(255, 255, 255, 0.2);
   border-radius: 50%;
   color: #fff;
   cursor: pointer;
   pointer-events: all;
   transition: all 0.2s ease;
}

.home-nav-arrow:hover {
   background-color: rgba(14, 14, 14, 0.8);
   border-color: rgba(255, 255, 255, 0.4);
   transform: scale(1.05);
}

.home-nav-arrow:active {
   transform: scale(0.95);
}

.home-nav-arrow-disabled {
   opacity: 0.3;
   cursor: not-allowed;
   pointer-events: none;
}

@media (max-width: 768px) {
   .home-navigation-arrows {
      padding: 0 0.5rem;
   }

   .home-nav-arrow {
      width: 44px;
      height: 44px;
   }
}
</style>
