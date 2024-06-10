import got from "got";
import { basename, extname } from "node:path";

const FONTS_TO_OVERRIDE = [
  "ABCGintoNord-ExtraBold",
  "ggsans-Bold",
  "ggsans-BoldItalic",
  "ggsans-ExtraBold",
  "ggsans-ExtraBoldItalic",
  "ggsans-Medium",
  "ggsans-MediumItalic",
  "ggsans-Normal",
  "ggsans-NormalItalic",
  "ggsans-Semibold",
  "ggsans-SemiboldItalic",
  "NotoSans-Bold",
  "NotoSans-ExtraBold",
  "NotoSans-Medium",
  "NotoSans-Normal",
  "NotoSans-NormalItalic",
  "NotoSans-Semibold",
  "SourceCodePro-Semibold",
];

const FALLBACKS: Record<string, string[]> = {
  Normal: ["Regular"],
  NormalItalic: ["RegularItalic", "Normal", "Regular"],
  Medium: ["Normal", "Regular"],
  MediumItalic: [
    "Medium",
    "NormalItalic",
    "RegularItalic",
    "Normal",
    "Regular",
  ],
  Semibold: ["SemiBold", "Medium", "Normal", "Regular"],
  SemiboldItalic: [
    "SemiBold",
    "SemiBoldItalic",
    "Semibold",
    "MediumItalic",
    "Medium",
    "NormalItalic",
    "RegularItalic",
    "Normal",
    "Regular",
  ],
  Bold: ["SemiBold", "Semibold", "Medium", "Normal", "Regular"],
  BoldItalic: [
    "Bold",
    "SemiBoldItalic",
    "SemiBold",
    "SemiboldItalic",
    "Semibold",
    "MediumItalic",
    "Medium",
    "NormalItalic",
    "RegularItalic",
    "Normal",
    "Regular",
  ],
  ExtraBold: ["Bold", "SemiBold", "Semibold", "Medium", "Normal", "Regular"],
  ExtraBoldItalic: [
    "ExtraBold",
    "BoldItalic",
    "Bold",
    "SemiBoldItalic",
    "SemiBold",
    "SemiboldItalic",
    "Semibold",
    "MediumItalic",
    "Medium",
    "NormalItalic",
    "RegularItalic",
    "Normal",
    "Regular",
  ],
};

type GoogleFontsList = {
  zipName: string;
  manifest: {
    files: {
      filename: string;
      contents: string;
    }[];
    fileRefs: {
      filename: string;
      url: string;
      date: {
        seconds: number;
        nanos: number;
      };
    }[];
  };
};

type FontData = {
  name: string;
  styleUrls: {
    [style: string]: string;
  };
};

type BunnyFontSpec = {
  spec: 1;
  name: string;
  previewText: string;
  main: Record<string, string>;
};

async function fetchFontInformation(name: string): Promise<FontData> {
  const res = await got(`https://fonts.google.com/download/list`, {
    searchParams: {
      family: name,
    },
  }).text();
  // for whatever ungodly reason, the response contains some garbage at the start.... to try and stop ppl from programmatically calling it? it's literally just a bunch of brackets & an apostrophe :ded:
  const trimmedRes = res.slice(res.indexOf("{"));
  const parsed = JSON.parse(trimmedRes) as GoogleFontsList;
  return {
    name,
    styleUrls: Object.fromEntries(
      parsed.manifest.fileRefs.map(({ filename, url }) => [
        fontStyleFromId(fontIdFromPath(filename)),
        url,
      ]),
    ),
  };
}

function generateBunnyFontSpec(fontData: FontData): BunnyFontSpec {
  const availableStyles = Object.keys(fontData.styleUrls);
  return {
    spec: 1,
    name: fontData.name,
    previewText: fontData.name,
    main: Object.fromEntries(
      FONTS_TO_OVERRIDE.map((font) => {
        const style = fontStyleFromId(font);
        const replacementStyle = pickClosestStyle(style, availableStyles);
        if (!replacementStyle) {
          console.error(`could not find replacement for ${style}`, fontData);
          throw new Error(`no suitable replacement found for style ${style}`);
        }
        if (replacementStyle !== style) {
          console.warn(`using ${replacementStyle} as replacement for ${style}`);
        }
        return [
          font,
          // replacementStyle is derived from a set of fontData.styleUrl's keys
          fontData.styleUrls[replacementStyle]!,
        ];
      }),
    ),
  };
}

function fontStyleFromId(id: string) {
  const underscoreIdx = id.indexOf("_");
  if (~underscoreIdx) {
    return id.substring(underscoreIdx + 1);
  }
  const dashIdx = id.indexOf("-");
  if (~dashIdx) {
    return id.substring(dashIdx + 1);
  }
  throw new Error(`unknown style for font identifier ${id}`);
}

function fontIdFromPath(path: string) {
  return basename(path, extname(path));
}

function pickClosestStyle(style: string, availableStyles: string[]) {
  if (availableStyles.includes(style)) return style;
  for (const fallback of FALLBACKS[style] ?? []) {
    if (availableStyles.includes(fallback)) return fallback;
  }
  return null;
}

try {
  const fontData = await fetchFontInformation("Open Sans");
  console.log("fontData", fontData);
  const bunnySpec = await generateBunnyFontSpec(fontData);
  console.log("bunnySpec", JSON.stringify(bunnySpec, null, 2));
} catch (e) {
  console.error(e);
  process.exit(1);
}
