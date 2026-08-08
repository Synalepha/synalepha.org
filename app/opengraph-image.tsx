import { ImageResponse } from "next/og";

export const alt = "Roomtone — Your internet should feel like you";
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
        color: "#171522",
        background:
          "radial-gradient(circle at 88% 15%, rgba(104,79,211,.3), transparent 30%), radial-gradient(circle at 12% 5%, rgba(22,131,154,.2), transparent 25%), #f4e8d2",
        border: "18px solid #171522",
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
            background: "#684fd3",
            boxShadow: "7px 7px 0 #e7c84e",
          }}
        />
        ROOMTONE
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
