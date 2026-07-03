import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f5c542",
            marginBottom: 16,
          }}
        >
          Howdy IRL
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#ccc",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Discover local groups, events, and spots in Huntsville, AL
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
