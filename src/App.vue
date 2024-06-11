<script setup lang="ts">
import { useToast } from "vue-toastification";
import FontList from "./components/FontList.vue";
import Navbar from "./components/Navbar.vue";
import { link } from "./styles";

const toast = useToast();
</script>

<template>
  <main class="max-w-3xl mx-auto">
    <ToastContainer theme="colored" position="top-center" />
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
      <!-- <FontLoaderProvider>
        </FontLoaderProvider> -->
    </div>
  </main>
</template>
