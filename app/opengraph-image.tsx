import { ImageResponse } from "next/og";

export const alt = "LoudPage — Your internet should feel like you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 76px",
        color: "#111326",
        background:
          "radial-gradient(circle at 88% 15%, rgba(124,92,255,.34), transparent 30%), radial-gradient(circle at 12% 5%, rgba(25,215,255,.25), transparent 25%), #f6f1e7",
        border: "18px solid #111326",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        <span
          style={{
            display: "flex",
            width: 34,
            height: 34,
            borderRadius: 17,
            background: "#7c5cff",
            boxShadow: "7px 7px 0 #19d7ff",
          }}
        />
        LOUDPAGE
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            maxWidth: 960,
            fontSize: 78,
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: -5,
          }}
        >
          Your internet should feel like you.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 25,
            color: "#4d5066",
          }}
        >
          Personal pages · Mutual friendships · Life in order
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 19,
          fontWeight: 700,
        }}
      >
        <span>synalepha.org</span>
        <span>People, not metrics.</span>
      </div>
    </div>,
    size,
  );
}
