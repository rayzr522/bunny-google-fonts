<script setup lang="ts">
import FontList from "./components/FontList.vue";
import Navbar from "./components/Navbar.vue";
import { link } from "./styles";
</script>

<template>
  <main class="max-w-3xl mx-auto">
    <Navbar />
    <div class="p-4 grid gap-8">
      <!-- about -->
      <div class="leading-loose">
        <p>
          a simple site for using fonts from
          <a
            :class="link()"
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Fonts
          </a>
          in
          <a
            :class="link()"
            href="http://github.com/pyoncord/Bunny"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bunny
          </a>
        </p>
        <p>
          need help using this? here's a
          <a
            :class="link()"
            href="http://github.com/rayzr522/bunny-google-fonts#how-to-use"
            target="_blank"
            rel="noopener noreferrer"
          >
            how-to guide
          </a>
        </p>
      </div>
      <FontList />
    </div>
  </main>
</template>
