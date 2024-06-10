import consola from "consola";
import ky from "ky";

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

type FontStyle = {
  base: string;
  axes: string[];
  opticalSize?: number;
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
  styleUrls: Map<FontStyle, string>;
  variableFontUrls: {
    regular?: string;
    italic?: string;
  };
};

type BunnyFontSpec = {
  spec: 1;
  name: string;
  previewText: string;
  main: Record<string, string>;
};

export async function fetchFontInformation(name: string): Promise<FontData> {
  const res = await ky(`https://fonts.google.com/download/list`, {
    searchParams: {
      family: name,
    },
  }).text();
  // for whatever ungodly reason, the response contains some garbage at the start.... to try and stop ppl from programmatically calling it? it's literally just a bunch of brackets & an apostrophe :ded:
  const trimmedRes = res.slice(res.indexOf("{"));
  const parsed = JSON.parse(trimmedRes) as GoogleFontsList;

  const fontData: FontData = {
    name,
    styleUrls: new Map(),
    variableFontUrls: {},
  };

  for (const fileRef of parsed.manifest.fileRefs) {
    if (fileRef.filename.includes("VariableFont")) {
      if (fileRef.filename.includes("Italic")) {
        fontData.variableFontUrls.italic = fileRef.url;
      } else {
        fontData.variableFontUrls.regular = fileRef.url;
      }
    } else {
      fontData.styleUrls.set(
        parseFontFromId(fontIdFromPath(fileRef.filename)),
        fileRef.url,
      );
    }
  }

  return fontData;
}

export function generateBunnyFontSpec(fontData: FontData): BunnyFontSpec {
  const availableStyles = sortAvailableStyles([...fontData.styleUrls.keys()]);
  return {
    spec: 1,
    name: fontData.name,
    previewText: fontData.name,
    main: Object.fromEntries(
      FONTS_TO_OVERRIDE.map((font) => {
        const baseStyle = parseFontFromId(font).base;
        // i wanted to use variable fonts here bc i thought they'd be more reliable, but turns out that Discord doesn't support them properly (so you just end up rendering the lightest weight always)
        // if (
        //   fontData.variableFontUrls.regular &&
        //   !baseStyle.includes("Italic")
        // ) {
        //   consola.warn(`using regular variable font for ${font}`);
        //   return [font, fontData.variableFontUrls.regular];
        // } else if (
        //   fontData.variableFontUrls.italic &&
        //   baseStyle.includes("Italic")
        // ) {
        //   consola.warn(`using italic variable font for ${font}`);
        //   return [font, fontData.variableFontUrls.italic];
        // }
        const replacementStyle = pickClosestStyle(baseStyle, availableStyles);
        if (!replacementStyle) {
          consola.error(
            `could not find replacement for ${baseStyle}. available styles:`,
            JSON.stringify(availableStyles, null, 2),
          );
          throw new Error(
            `no suitable replacement found for style ${baseStyle}`,
          );
        }
        consola.debug(`found style for ${font}:`, replacementStyle);
        if (replacementStyle.base !== baseStyle) {
          consola.debug(
            `using ${replacementStyle.base} as replacement for ${baseStyle}`,
          );
        }
        return [
          font,
          // replacementStyle is picked from fontData.styleUrls
          fontData.styleUrls.get(replacementStyle)!,
        ];
      }),
    ),
  };
}

function parseFontFromId(id: string): FontStyle {
  const styleString = ~id.indexOf("_")
    ? id.substring(id.indexOf("_") + 1)
    : ~id.indexOf("-")
      ? id.substring(id.indexOf("-") + 1)
      : null;
  if (!styleString) {
    throw new Error(`unknown style for font identifier ${id}`);
  }
  const [baseStyle, ...axes] = styleString.split(/[_-]/).reverse();
  const style: FontStyle = {
    base: baseStyle!,
    axes: [],
  };
  for (const axis of axes) {
    if (/^\d+pt$/.test(axis)) {
      style.opticalSize = parseInt(axis, 10);
    } else {
      // unshift to re-reverse
      style.axes.unshift(axis);
    }
  }
  return style;
}

function fontIdFromPath(path: string) {
  return path.split("/").pop()!.split(".")[0]!;
}

function sortAvailableStyles(availableStyles: FontStyle[]) {
  return availableStyles.sort((a, b) => {
    return (
      // first we prioritize styles with no axes
      a.axes.length - b.axes.length ||
      // then styles with optical sizes closer to 16
      Math.abs(16 - (a.opticalSize || 0)) - Math.abs(16 - (b.opticalSize || 0))
      // there's no sane way to sort the rest of the axes (probably) so we just leave the rest as we got it
    );
  });
}

function pickClosestStyle(baseStyle: string, availableStyles: FontStyle[]) {
  const baseStylesToCheck = [baseStyle, ...(FALLBACKS[baseStyle] ?? [])];
  for (const toCheck of baseStylesToCheck) {
    const foundStyle = availableStyles.find((it) => it.base === toCheck);
    if (foundStyle) return foundStyle;
  }
  return null;
}
