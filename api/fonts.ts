import ky from "ky";

export const config = {
  runtime: "edge",
};

export async function GET() {
  try {
    return new Response(
      await ky("https://fonts.google.com/metadata/fonts").text(),
      {
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=86400, s-maxage=2592000",
        },
      },
    );
  } catch (e) {
    console.error("failed to load fonts", e);
    return new Response("failed to load fonts", { status: 500 });
  }
}
