<script setup lang="ts">
import { navLink } from "../variants";
import ThemeToggle from "./ThemeToggle.vue";
</script>

<template>
  <nav
    class="mb-8 p-4 flex flex-col sm:flex-row items-center gap-4 border-b border-neutral-300 dark:border-neutral-700"
  >
    <a class="flex items-center gap-4" href="/">
      <img src="/bunny.svg" width="32px" alt="" />
      <h1 class="text-xl md:text-2xl font-light">bunny google fonts</h1>
    </a>
    <div class="mx-auto" />
    <div class="flex gap-4 items-center">
      <a
        :class="navLink()"
        href="http://github.com/rayzr522/bunny-google-fonts"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source
      </a>
      <a
        :class="navLink()"
        href="http://github.com/rayzr522/bunny-google-fonts/issues"
        target="_blank"
        rel="noopener noreferrer"
      >
        Issues
      </a>
      <ThemeToggle />
    </div>
  </nav>
</template>
