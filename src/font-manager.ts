import { ref } from "vue";

const alreadyAddedToHead = new Set<string>();
export function addFontToDocumentHead(fontName: string) {
  if (alreadyAddedToHead.has(fontName)) {
    return false;
  }
  alreadyAddedToHead.add(fontName);
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(cssLink);
  // pre-emptively refresh in case we already have the font cached
  refreshFonts();
  return true;
}

export const loadedFonts = ref(new Set<string>());

export function refreshFonts() {
  if (document.fonts.size === loadedFonts.value.size) {
    return;
  }
  loadedFonts.value = new Set<string>(
    [...document.fonts].map((it) =>
      it.family.startsWith('"') ? it.family.slice(1, -1) : it.family,
    ),
  );
}
