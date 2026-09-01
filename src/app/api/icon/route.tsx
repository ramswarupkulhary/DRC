import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Generates a square DRC app icon at the requested size (for the PWA manifest). */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const size = Math.min(512, Math.max(48, parseInt(searchParams.get("size") || "512", 10)));

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0D0D0D",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", fontSize: size * 0.4, fontWeight: 800, letterSpacing: -2 }}>
                    <span style={{ color: "#F1E9DD" }}>D</span>
                    <span style={{ color: "#E8622C" }}>R</span>
                    <span style={{ color: "#F1E9DD" }}>C</span>
                </div>
            </div>
        ),
        { width: size, height: size }
    );
}
