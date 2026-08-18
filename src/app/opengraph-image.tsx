import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DRC — Dirt Ride Camp | Off-Road Training & Adventure Rides in Bangalore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "#E8622C",
              letterSpacing: "-2px",
            }}
          >
            DIRT RIDE CAMP
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#F1E9DD",
              opacity: 0.9,
            }}
          >
            Off-Road Training · Adventure Rides · Camping
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#B9A886",
              marginTop: "10px",
            }}
          >
            Bangalore&apos;s Premier Riding Community
          </div>
          <div
            style={{
              display: "flex",
              gap: "30px",
              marginTop: "30px",
              fontSize: "18px",
              color: "#E8622C",
              opacity: 0.8,
            }}
          >
            <span>🏍️ Dirt Bike Rides</span>
            <span>⛰️ Trail Training</span>
            <span>🏕️ Camping Trips</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "18px",
            color: "#666",
          }}
        >
          www.dirtridecamp.com
        </div>
      </div>
    ),
    { ...size }
  );
}
