<script setup lang="ts">
import { useFetch, useVirtualList } from "@vueuse/core";
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import { button, input } from "../styles";
import Loader from "./Loader.vue";

const ITEM_HEIGHT = 150;

const toast = useToast();

const { data, error } = useFetch("/api/fonts").get().json<{
  axisRegistry: unknown[];
  familyMetadataList: {
    category: string;
    family: string;
    displayName: string | null;
    defaultSort: number;
    popularity: number;
    trending: number;
  }[];
  promotedScript: unknown;
}>();

const fonts = computed(
  () =>
    data.value?.familyMetadataList

      .sort((a, b) => a.defaultSort - b.defaultSort)
      .map((it) => ({
        name: it.family,
        displayName: it.displayName,
        category: it.category,
      })) ?? [],
);

const filter = ref("");
const filteredFonts = computed(() =>
  fonts.value.filter((font) =>
    font.name.toLowerCase().includes(filter.value.toLowerCase()),
  ),
);

const { list, wrapperProps, containerProps } = useVirtualList(filteredFonts, {
  itemHeight: 150,
});

async function copySpecLink(fontName: string) {
  const url = new URL(`/spec/${encodeURIComponent(fontName)}`, location.origin);
  try {
    await navigator.clipboard.writeText(url.toString());
    toast.success(`Copied spec link for ${fontName}!`);
  } catch {
    toast.error(
      "Failed to copy to clipboard! Please check website permissions in your browser and enable clipboard.",
    );
  }
}
</script>

<template>
  <div class="grid gap-4">
    <input
      :class="input()"
      type="text"
      v-model="filter"
      placeholder="Filter fonts..."
    />
    <div
      v-bind="containerProps"
      v-if="data"
      class="scrollbar rounded border border-neutral-200 dark:border-neutral-700"
      :style="{ height: `${ITEM_HEIGHT * 5 + 40}px` }"
    >
      <div v-bind="wrapperProps">
        <div
          v-for="item in list"
          :key="item.index"
          class="p-4"
          :style="{ height: `${ITEM_HEIGHT}px` }"
        >
          <div
            class="h-full p-4 grid items-center rounded border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
            :style="{ gridTemplateColumns: '1fr auto' }"
          >
            <h2
              class="col-span-2 text-2xl"
              :style="{ fontFamily: item.data.name }"
            >
              {{ item.data.name }}
            </h2>
            <p :style="{ fontFamily: item.data.name }">
              {{ item.data.category }}
            </p>
            <button :class="button()" @click="copySpecLink(item.data.name)">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
    <pre v-else-if="error" class="text-red-500 text-lg">
      There was an error loading fonts: {{ error }}
    </pre>
    <Loader v-else />
  </div>
</template>
