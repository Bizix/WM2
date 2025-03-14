<template>
  <div class="song-card w-full flex flex-col p-4 shadow-lg border-t transition-colors" :data-song-id="song.melon_song_id">
      
    <div class="flex items-center gap-4 w-full">
      <!-- ✅ Rank with Movement -->
      <div class="flex items-center min-w-[50px] justify-center gap-1">
        <span class="font-bold text-lg text-primary-500 pr-1">
          {{ song.rank }}
        </span>
        <span class="flex items-end text-sm gap-0.5" :class="{
          'text-green-500 font-bold uppercase text-xs': song.movement === 'NEW',  // ✅ Style NEW in green & uppercase
          'text-green-500': song.movement.includes('↑'),
          'text-red-500': song.movement.includes('↓'),
          'text-gray-500': song.movement === '-'
        }">
          <span v-if="song.movement === 'NEW'">NEW</span>
          <template v-else>
            <span class="text-base leading-none">{{ song.movement.charAt(0) }}</span>
            <span class="text-xs leading-none">{{ song.movement.slice(1) }}</span>
          </template>
        </span>

      </div>
      <!-- ✅ Album Art -->
      <img 
        :src="song.art" 
        :alt="song.album"
        class="w-16 h-16 rounded-md object-cover border border-surface-400"
      />

      <!-- ✅ Song Info -->
      <div class="flex flex-col flex-grow">
        <p class="text-lg font-semibold text-surface-900">{{ song.title }}</p>
        <p class="text-lg text-surface-800">{{ song.artist }}</p>
        <p class="text-sm italic text-surface-600">{{ song.album }}</p>
      </div>

      <!-- ✅ Action Buttons -->
      <div class="flex items-center gap-3">
        <template v-for="(button, index) in actionButtons" :key="index">
          <a
            v-if="button.url"
            :href="button.url"
            target="_blank"
            class="text-xl"
            :class="button.color"
          >
            <i :class="button.icon"></i>
          </a>
        </template>

        <!-- ✅ Lyrics Button -->
        <button @click="toggleExpand"
          class="px-3 py-1 text-sm font-medium rounded-lg cursor-pointer transition-colors 
                bg-[var(--p-primary-color)] text-white hover:bg-[var(--p-primary-400)]">
          Lyrics
        </button>
      </div>
    </div>

    <!-- ✅ Expanded Lyrics Section -->
    <transition name="fade">
      <div v-if="isExpanded" class="mt-3 p-3 text-center border-t w-full bg-surface-200 border-surface-300">
      
        <!-- ✅ Show Spinner While Loading -->
        <div v-if="isLoading" class="flex flex-grow pt-3 items-center justify-center">
          <LoadingSpinner :isLoading="true" message="Loading lyrics..." size="w-10 h-10" color="fill-green-500" />
        </div>

        <!-- ✅ Display Lyrics -->
        <p v-else-if="lyrics" class="whitespace-pre-line pt-3 text-surface-700">{{ lyrics }}</p>

        <!-- ✅ Error Message -->
        <p v-else class="italic text-surface-700 pt-3">❌ Lyrics not found.</p>

      </div>
    </transition>
  </div>
</template>

<script>
import { ref, watchEffect } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default {
  props: {
    song: {
      type: Object,
      required: true
    }
  },
  components: {
    LoadingSpinner
  },
  setup(props) {
    const isExpanded = ref(false);
    const lyrics = ref(null);
    const isLoading = ref(false);

    async function fetchLyrics() {
      if (lyrics.value || isLoading.value) return;

      console.log("🔄 Fetching Lyrics - Loading Starts");
      isLoading.value = true;

      try {
        const response = await fetch(
          `http://localhost:5000/api/lyrics?title=${encodeURIComponent(props.song.title)}&artist=${encodeURIComponent(props.song.artist)}&songId=${props.song.melon_song_id}`
        );

        const data = await response.json();
        if (response.ok && data.lyrics) {
          lyrics.value = data.lyrics;
        } else {
          console.error("❌ No lyrics found:", data.error);
        }
      } catch (error) {
        console.error("❌ Failed to fetch lyrics:", error);
      } finally {
        console.log("✅ Fetching Lyrics - Loading Ends");
        isLoading.value = false;
      }
    }

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value;
      if (isExpanded.value) fetchLyrics();
    };

    const actionButtons = [
      { url: `https://www.youtube.com/watch?v=${props.song.youtube_url}`, icon: "pi pi-youtube", color: "text-red-500 hover:text-red-600" },
      { url: props.song.apple_music_url, icon: "pi pi-apple", color: "text-gray-300 hover:text-gray-400" },
      { url: `https://open.spotify.com/track/${props.song.spotify_url}`, icon: "fab fa-spotify", color: "text-green-400 hover:text-green-500" }
    ];

    return {
      isExpanded,
      lyrics,
      isLoading,
      toggleExpand,
      actionButtons,
    };
  }
};
</script>
