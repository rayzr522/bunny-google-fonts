import { fetchFontInformation, generateBunnyFontSpec } from "../src/font-spec";

export const config = {
  runtime: "edge",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const font = url.searchParams.get("font");
  if (!font) {
    return new Response(
      "You must specify a font with the 'font' query param in the URL",
      { status: 400 },
    );
  }
  try {
    const fontData = await fetchFontInformation(font);
    const spec = generateBunnyFontSpec(fontData);
    return new Response(JSON.stringify(spec, null, 2), {
      headers: {
        "content-type": "application/json",
        // cache locally for 1 day, and on the server for 1 month
        "cache-control": "public, max-age=86400, s-maxage=2592000",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      `There was an error generating a Bunny font spec for '${font}'`,
      { status: 500 },
    );
  }
}
