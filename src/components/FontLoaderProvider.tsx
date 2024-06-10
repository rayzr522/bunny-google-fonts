import { createContext, useEffect, useMemo, useRef, useState } from "react";

const alreadyAddedToHead = new Set<string>();
function addFontToDocumentHead(fontName: string) {
  if (alreadyAddedToHead.has(fontName)) {
    return false;
  }
  alreadyAddedToHead.add(fontName);
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(cssLink);
  return true;
}

export const FontLoaderContext = createContext<{
  loadedFonts: Set<string>;
  loadFont(name: string): void;
}>({
  loadedFonts: new Set(),
  loadFont() {},
});

function getDocumentFontFamilies() {
  return new Set([...document.fonts].map((it) => it.family));
}

export function FontLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loadedFonts, setLoadedFonts] = useState(getDocumentFontFamilies);
  const lastFontSize = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.fonts.size !== lastFontSize.current) {
        setLoadedFonts(getDocumentFontFamilies);
        lastFontSize.current = document.fonts.size;
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);
  const loadFont = useMemo(
    () => (name: string) => {
      if (addFontToDocumentHead(name)) {
        setLoadedFonts(getDocumentFontFamilies);
      }
    },
    [],
  );
  return (
    <FontLoaderContext.Provider value={{ loadedFonts, loadFont }}>
      {children}
    </FontLoaderContext.Provider>
  );
}
