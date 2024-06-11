import "react-toastify/dist/ReactToastify.css";

import ky from "ky";
import { useContext, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useDebounce } from "react-use";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import {
  FontLoaderContext,
  FontLoaderProvider,
} from "./components/FontLoaderProvider";
import { Loader } from "./components/Loader";

const ITEM_SIZE = 150;

function App() {
  return (
    <main className="app-layout">
      <div>
        <h1>bunny google fonts</h1>
        <p>
          a simple site for using fonts from{" "}
          <a href="https://fonts.google.com" target="_blank">
            Google Fonts
          </a>{" "}
          in <a href="https://github.com/pyoncord/Bunny">Bunny</a>
        </p>
        <p>
          need help using this? here's a{" "}
          <a href="https://github.com/rayzr522/bunny-google-fonts#how-to-use">
            how-to guide
          </a>
        </p>
      </div>
      <FontLoaderProvider>
        <FontList />
      </FontLoaderProvider>
      <ToastContainer theme="dark" />
    </main>
  );
}

function useFontsLoader() {
  const [fontState, setFontState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | {
        status: "loaded";
        fonts: { name: string; displayName: string | null; category: string }[];
      }
    | { status: "error"; error: string }
  >({ status: "idle" });

  useEffect(
    () =>
      void (async () => {
        setFontState({ status: "loading" });
        try {
          const fonts = await ky("/api/fonts").json<{
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
          setFontState({
            status: "loaded",
            fonts: fonts.familyMetadataList
              .sort((a, b) => a.defaultSort - b.defaultSort)
              .map((it) => ({
                name: it.family,
                displayName: it.displayName,
                category: it.category,
              })),
          });
        } catch (e) {
          setFontState({
            status: "error",
            error: e instanceof Error ? e.message : String(e),
          });
        }
      })(),
    [],
  );

  return [fontState, setFontState] as const;
}

function FontList() {
  const [state] = useFontsLoader();
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  useDebounce(() => setDebouncedFilter(filter), 200, [filter]);

  const filteredFonts = useMemo(() => {
    const lowercaseFilter = debouncedFilter.toLowerCase();
    return state.status === "loaded"
      ? state.fonts.filter((it) =>
          it.name.toLowerCase().includes(lowercaseFilter),
        )
      : [];
  }, [debouncedFilter, state]);

  switch (state.status) {
    case "idle":
    case "loading": {
      return <Loader />;
    }
    case "error": {
      return <pre>There was an error loading fonts: {state.error}</pre>;
    }
    case "loaded": {
      return (
        <div className="fonts-list">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter fonts..."
          />
          <FixedSizeList
            className="virtual-list"
            height={ITEM_SIZE * 5 + 25}
            width="100%"
            itemData={filteredFonts}
            itemCount={filteredFonts.length}
            itemSize={ITEM_SIZE}
          >
            {FontCard}
          </FixedSizeList>
        </div>
      );
    }
  }
}

function FontCard({
  index,
  style,
  data,
}: ListChildComponentProps<
  Extract<ReturnType<typeof useFontsLoader>[0], { status: "loaded" }>["fonts"]
>) {
  const font = data[index];
  const { loadedFonts, loadFont } = useContext(FontLoaderContext);
  useEffect(() => loadFont(font.name), [loadFont, font.name]);
  const isLoaded =
    loadedFonts.has(font.name) || loadedFonts.has(`"${font.name}"`);
  return (
    <div className="font-card" style={style}>
      <div>
        {isLoaded ? (
          <>
            <h2 style={{ fontFamily: font.name }}>{font.name}</h2>
            <p style={{ fontFamily: font.name }}>{font.category}</p>
            <button
              onClick={() =>
                toast.promise(
                  async () => {
                    const url = new URL(
                      `/spec/${encodeURIComponent(font.name)}`,
                      location.origin,
                    );
                    await navigator.clipboard.writeText(url.toString());
                  },
                  {
                    pending: "Copying to clipboard...",
                    success: "Copied!",
                    error:
                      "Failed to copy to clipboard! Please check website permissions in your browser and enable clipboard.",
                  },
                )
              }
            >
              Copy
            </button>
          </>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}

export default App;
