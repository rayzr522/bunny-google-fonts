import "react-toastify/dist/ReactToastify.css";

import ky from "ky";
import { useContext, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useDebounce } from "react-use";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import { button, input, link } from "../styles";
import { FontLoaderContext, FontLoaderProvider } from "./FontLoaderProvider";
import { Loader } from "./Loader";
import { Navbar } from "./Navbar";

const ITEM_SIZE = 150;

function App() {
  return (
    <main className="max-w-3xl mx-auto">
      <ToastContainer theme="colored" position="top-center" />
      <Navbar />
      <div className="p-4 grid gap-8">
        <About />
        <FontLoaderProvider>
          <FontList />
        </FontLoaderProvider>
      </div>
    </main>
  );
}

function About() {
  return (
    <div className="leading-loose">
      <p>
        a simple site for using fonts from{" "}
        <a
          className={link()}
          href="https://fonts.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Fonts
        </a>{" "}
        in{" "}
        <a
          className={link()}
          href="http://github.com/pyoncord/Bunny"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bunny
        </a>
      </p>
      <p>
        need help using this? here's a{" "}
        <a
          className={link()}
          href="http://github.com/rayzr522/bunny-google-fonts#how-to-use"
          target="_blank"
          rel="noopener noreferrer"
        >
          how-to guide
        </a>
      </p>
    </div>
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
      return (
        <pre className="text-red-500 text-lg">
          There was an error loading fonts: {state.error}
        </pre>
      );
    }
    case "loaded": {
      return (
        <div className="grid gap-4">
          <input
            className={input()}
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter fonts..."
          />
          <FixedSizeList
            className="scrollbar rounded border border-neutral-200 dark:border-neutral-700"
            height={ITEM_SIZE * 5 + 40}
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
    <div className="p-4" style={style}>
      <div
        className="p-4 h-full grid items-center rounded border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
        style={{ gridTemplateColumns: "1fr auto" }}
      >
        {isLoaded ? (
          <>
            <h2
              className="col-span-2 text-2xl"
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </h2>
            <p style={{ fontFamily: font.name }}>{font.category}</p>
            <button
              className={button()}
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
                    success: `Copied spec link for ${font.name}!`,
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
