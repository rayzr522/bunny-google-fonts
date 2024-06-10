const alreadyLoaded = new Set<string>();
export function addFontToDocumentHead(fontName: string) {
  if (alreadyLoaded.has(fontName)) {
    return false;
  }
  alreadyLoaded.add(fontName);
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(cssLink);
  return true;
}
