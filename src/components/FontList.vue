<script setup lang="ts">
import {
  useDebounce,
  useDebounceFn,
  useFetch,
  useVirtualList,
} from "@vueuse/core";
import { computed, ref, watch, watchEffect } from "vue";
import { useToast } from "vue-toastification";
import { addFontToDocumentHead, loadedFonts } from "../font-manager";
import { button, input } from "../variants";
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
type Font = (typeof fonts.value)[0];

const filter = ref("");
const debouncedFilter = useDebounce(filter, 200);
const filteredFonts = computed(() =>
  fonts.value.filter((font) =>
    font.name.toLowerCase().includes(debouncedFilter.value.toLowerCase()),
  ),
);

const { list, wrapperProps, containerProps, scrollTo } = useVirtualList(
  filteredFonts,
  {
    itemHeight: 150,
  },
);

watch(filteredFonts, () => scrollTo(0));

const addFonts = useDebounceFn((items: { data: Font }[]) => {
  for (const item of items) {
    addFontToDocumentHead(item.data.name);
  }
}, 200);

watchEffect(() => {
  addFonts(list.value);
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
      autofocus
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
            <template v-if="loadedFonts.has(item.data.name)">
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
            </template>
            <Loader v-else />
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
