<script setup lang="ts">
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import { button, input } from "../styles";

const toast = useToast();

const state = ref<
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "loaded";
      fonts: { name: string; displayName: string | null; category: string }[];
    }
  | { status: "error"; error: string }
>({
  status: "loaded",
  fonts: [
    { name: "Google Sans", displayName: "Google Sans", category: "sans-serif" },
  ],
});

const filter = ref("");
const filteredFonts = computed(() =>
  state.value.status === "loaded"
    ? state.value.fonts.filter((font) =>
        font.name.toLowerCase().includes(filter.value.toLowerCase()),
      )
    : [],
);

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
    <div v-if="state.status === 'loaded'" class="grid gap-4">
      <div v-for="font in filteredFonts" :key="font.name" class="p-4">
        <div
          class="p-4 grid items-center rounded border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
          :style="{ gridTemplateColumns: '1fr auto' }"
        >
          <h2 class="col-span-2 text-2xl" :style="{ fontFamily: font.name }">
            {{ font.name }}
          </h2>
          <p :style="{ fontFamily: font.name }">{{ font.category }}</p>
          <button :class="button()" @click="copySpecLink(font.name)">
            Copy
          </button>
        </div>
      </div>
    </div>
    <Loader v-else-if="state.status === 'loading'" />
    <pre v-else-if="state.status === 'error'" class="text-red-500 text-lg">
      There was an error loading fonts: {{ state.error }}
    </pre>
  </div>
</template>
