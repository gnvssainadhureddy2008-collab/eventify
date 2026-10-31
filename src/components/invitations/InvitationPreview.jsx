import { forwardRef } from "react";

const fontStack = {
  display: '"Cormorant Garamond", Georgia, serif',
  italic: '"Cormorant Garamond", Georgia, serif',
  sans: '"Jost", system-ui, sans-serif',
};

function CornerBloom({ color, flipX, flipY }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      style={{
        position: "absolute",
        top: flipY ? undefined : 18,
        bottom: flipY ? 18 : undefined,
        left: flipX ? undefined : 18,
        right: flipX ? 18 : undefined,
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
        opacity: 0.75,
      }}
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeWidth="1.2">
        <path d="M2 40 C 26 40, 40 26, 40 2" />
        <path d="M2 58 C 34 58, 58 34, 58 2" opacity="0.6" />
        <circle cx="24" cy="24" r="5" fill={color} opacity="0.35" stroke="none" />
        <circle cx="43" cy="14" r="3" fill={color} opacity="0.28" stroke="none" />
        <circle cx="14" cy="43" r="3" fill={color} opacity="0.28" stroke="none" />
        <ellipse cx="34" cy="34" rx="11" ry="5" transform="rotate(45 34 34)" fill={color} opacity="0.14" stroke="none" />
      </g>
    </svg>
  );
}

function Mandala({ color, top }) {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
      style={{ position: "absolute", left: "50%", [top ? "top" : "bottom"]: -46, transform: "translateX(-50%)", opacity: 0.5 }}
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeWidth="1">
        <circle cx="75" cy="75" r="70" strokeDasharray="2 6" />
        <circle cx="75" cy="75" r="56" />
        <circle cx="75" cy="75" r="34" strokeDasharray="1 5" />
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={i}
            x1="75"
            y1="19"
            x2="75"
            y2="5"
            transform={`rotate(${i * 22.5} 75 75)`}
          />
        ))}
      </g>
    </svg>
  );
}

function Confetti({ color }) {
  const dots = [
    [8, 12], [22, 6], [46, 14], [64, 8], [82, 16], [92, 6],
    [12, 86], [30, 92], [52, 84], [70, 92], [88, 84], [94, 72],
  ];
  return (
    <>
      {dots.map(([x, y], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
            borderRadius: i % 2 ? "999px" : 1,
            background: i % 2 ? color : "#D9A5A0",
            opacity: 0.45,
            transform: `rotate(${i * 24}deg)`,
          }}
        />
      ))}
    </>
  );
}

function Ornament({ template, accent, ink, monogram }) {
  switch (template.ornament) {
    case "minimal":
      return (
        <>
          <span style={{ position: "absolute", inset: 26, border: `1px solid ${accent}55` }} />
          <span style={{ position: "absolute", inset: 32, border: `1px solid ${accent}22` }} />
        </>
      );
    case "floral":
      return (
        <>
          <CornerBloom color={accent} />
          <CornerBloom color={accent} flipX />
          <CornerBloom color={accent} flipY />
          <CornerBloom color={accent} flipX flipY />
        </>
      );
    case "luxe":
      return (
        <>
          <span style={{ position: "absolute", inset: 24, border: `1px solid ${accent}` }} />
          <span style={{ position: "absolute", inset: 31, border: `1px solid ${accent}66` }} />
        </>
      );
    case "confetti":
      return (
        <>
          <Confetti color={accent} />
          <span style={{ position: "absolute", inset: 22, border: `1px dashed ${accent}44`, borderRadius: 2 }} />
        </>
      );
    case "mandala":
      return (
        <>
          <Mandala color={accent} top />
          <Mandala color={accent} />
        </>
      );
    case "monogram":
      return (
        <>
          <span style={{ position: "absolute", inset: 28, border: `1px solid ${accent}44` }} />
          <span
            style={{
              position: "absolute",
              inset: 34,
              border: `1px solid ${accent}22`,
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 74,
              left: "50%",
              transform: "translateX(-50%)",
              width: 62,
              height: 62,
              borderRadius: 999,
              border: `1px solid ${accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fontStack.display,
              fontSize: 26,
              color: accent,
              letterSpacing: "0.04em",
            }}
          >
            {monogram}
          </span>
        </>
      );
    case "bold":
      return (
        <>
          <span style={{ position: "absolute", left: 0, top: 0, width: 10, height: "100%", background: accent }} />
          <span style={{ position: "absolute", left: 40, top: 40, right: 40, height: 3, background: ink, opacity: 0.85 }} />
          <span style={{ position: "absolute", left: 40, bottom: 40, right: 40, height: 1, background: accent }} />
        </>
      );
    case "grid":
      return (
        <>
          <span style={{ position: "absolute", left: 42, right: 42, top: 40, height: 1, background: accent }} />
          <span style={{ position: "absolute", left: 42, right: 42, bottom: 40, height: 1, background: accent }} />
          <span style={{ position: "absolute", left: 42, top: 40, width: 1, height: 26, background: accent }} />
          <span style={{ position: "absolute", right: 42, top: 40, width: 1, height: 26, background: accent }} />
          <span style={{ position: "absolute", left: 42, bottom: 40, width: 1, height: 26, background: accent }} />
          <span style={{ position: "absolute", right: 42, bottom: 40, width: 1, height: 26, background: accent }} />
        </>
      );
    default:
      return (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 22%, ${accent}1f, transparent 62%)`,
          }}
        />
      );
  }
}

const InvitationPreview = forwardRef(function InvitationPreview({ invitation, template, width = 640 }, ref) {
  const ink = invitation.text_color || template.ink;
  const accent = invitation.accent_color || template.accent;
  const background = invitation.background_color || template.background;
  const family = fontStack[invitation.font_style] || fontStack.display;
  const italic = invitation.font_style === "italic";
  const tight = template.ornament === "bold" || template.ornament === "grid";
  const monogram = (invitation.event_name || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const dateLine = invitation.date
    ? new Date(`${invitation.date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date to be announced";

  return (
    <div
      ref={ref}
      style={{
        width: 640,
        height: 900,
        background,
        color: ink,
        position: "relative",
        overflow: "hidden",
        transform: width !== 640 ? `scale(${width / 640})` : undefined,
        transformOrigin: "top left",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Ornament template={template} accent={accent} ink={ink} monogram={monogram} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding:
            template.ornament === "bold"
              ? "84px 64px 76px 84px"
              : template.ornament === "monogram"
                ? "158px 62px 80px"
                : "80px 62px",
        }}
      >
        <p
          style={{
            fontFamily: fontStack.sans,
            fontSize: 11,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: template.sub,
            margin: 0,
          }}
        >
          {invitation.wording ? "You are invited" : "Invitation"}
        </p>

        <span style={{ display: "block", width: 46, height: 1, background: accent, margin: "18px 0" }} />

        <h1
          style={{
            fontFamily: family,
            fontStyle: italic ? "italic" : "normal",
            fontWeight: tight ? 600 : 500,
            fontSize: tight ? 58 : 52,
            lineHeight: 1.05,
            letterSpacing: tight ? "-0.01em" : "0.005em",
            margin: 0,
            maxWidth: 470,
            wordBreak: "break-word",
          }}
        >
          {invitation.headline || invitation.event_name || "Our Celebration"}
        </h1>

        {invitation.host_names && (
          <p
            style={{
              fontFamily: fontStack.sans,
              fontSize: 13,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: template.sub,
              margin: "20px 0 0",
            }}
          >
            {invitation.host_names}
          </p>
        )}

        {invitation.wording && (
          <p
            style={{
              fontFamily: fontStack.sans,
              fontSize: 14,
              lineHeight: 1.7,
              color: template.sub,
              maxWidth: 400,
              margin: "22px 0 0",
            }}
          >
            {invitation.wording}
          </p>
        )}

        <span style={{ display: "block", width: 120, height: 1, background: `${accent}66`, margin: "26px 0 22px" }} />

        <p style={{ fontFamily: family, fontSize: 24, margin: 0, lineHeight: 1.35 }}>{dateLine}</p>
        {(invitation.time || invitation.venue_name) && (
          <p
            style={{
              fontFamily: fontStack.sans,
              fontSize: 13,
              letterSpacing: "0.06em",
              color: template.sub,
              margin: "8px 0 0",
              maxWidth: 420,
              lineHeight: 1.6,
            }}
          >
            {invitation.time ? `${invitation.time}  ·  ` : ""}
            {invitation.venue_name || "Venue to be announced"}
            {invitation.venue_address ? `, ${invitation.venue_address}` : ""}
          </p>
        )}

        {(invitation.dress_code || invitation.rsvp) && (
          <p
            style={{
              fontFamily: fontStack.sans,
              fontSize: 11.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: accent,
              margin: "26px 0 0",
            }}
          >
            {[invitation.dress_code && `Dress code: ${invitation.dress_code}`, invitation.rsvp && `RSVP ${invitation.rsvp}`]
              .filter(Boolean)
              .join("   ·   ")}
          </p>
        )}

        {invitation.extra_note && (
          <p
            style={{
              fontFamily: fontStack.display,
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.6,
              color: template.sub,
              maxWidth: 430,
              margin: "24px 0 0",
            }}
          >
            {invitation.extra_note}
          </p>
        )}
      </div>

      {invitation.show_qr && invitation.qr_data && (
        <div style={{ position: "absolute", right: 34, bottom: 30, zIndex: 3, textAlign: "center" }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(invitation.qr_data)}`}
            alt="QR code with event details"
            crossOrigin="anonymous"
            width={66}
            height={66}
            style={{ display: "block", borderRadius: 4, background: "#fff", padding: 3 }}
          />
          <span style={{ fontFamily: fontStack.sans, fontSize: 8, letterSpacing: "0.14em", color: template.sub }}>
            SCAN
          </span>
        </div>
      )}
    </div>
  );
});

export default InvitationPreview;