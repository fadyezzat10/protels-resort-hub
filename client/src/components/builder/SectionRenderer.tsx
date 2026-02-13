import { type BuilderSection } from "@/lib/builderTypes";
import { type CSSProperties } from "react";

interface SectionRendererProps {
  section: BuilderSection;
  isEditing?: boolean;
  onContentChange?: (key: string, value: any) => void;
}

function getSectionStyle(section: BuilderSection): CSSProperties {
  const s = section.styles;
  const style: CSSProperties = {
    paddingTop: s.paddingTop || "60px",
    paddingBottom: s.paddingBottom || "60px",
    paddingLeft: s.paddingLeft || "24px",
    paddingRight: s.paddingRight || "24px",
    marginTop: s.marginTop,
    marginBottom: s.marginBottom,
    textAlign: (s.textAlign as any) || "left",
    borderRadius: s.borderRadius,
    position: "relative",
    overflow: "hidden",
    minHeight: s.minHeight || undefined,
  };

  if (s.backgroundGradient) {
    style.background = s.backgroundGradient;
  } else {
    style.backgroundColor = s.backgroundColor || "#ffffff";
  }

  if (s.backgroundImage) {
    style.backgroundImage = `url(${s.backgroundImage})`;
    style.backgroundSize = s.backgroundSize || "cover";
    style.backgroundPosition = s.backgroundPosition || "center";
  }

  return style;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const c = hex.replace("#", "");
  if (c.length < 6) return null;
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16),
  };
}

function Overlay({ opacity, color }: { opacity?: number; color?: string }) {
  if (!opacity) return null;
  const rgb = hexToRgb(color || "#000000");
  const bgColor = rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : `rgba(0,0,0,${opacity})`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: bgColor,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

function ContentWrap({ children, maxWidth }: { children: React.ReactNode; maxWidth?: string }) {
  return (
    <div style={{ position: "relative", zIndex: 2, maxWidth: maxWidth || "1200px", margin: "0 auto" }}>
      {children}
    </div>
  );
}

function isLight(hex: string): boolean {
  if (!hex || hex === "transparent") return true;
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function HeroSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#0c1c2c") || section.styles.backgroundImage || section.styles.backgroundOverlay;
  return (
    <div style={getSectionStyle(section)}>
      <Overlay opacity={section.styles.backgroundOverlay} color={section.styles.overlayColor} />
      <ContentWrap maxWidth={section.styles.maxWidth}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            fontFamily: "'Cormorant Garamond', serif",
            color: dark ? "#fff" : "#1a1a2e",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {c.title || "Welcome"}
        </h1>
        {c.subtitle && (
          <p style={{ fontSize: "1.25rem", color: dark ? "rgba(255,255,255,0.8)" : "#666", marginBottom: "24px" }}>
            {c.subtitle}
          </p>
        )}
        {c.buttonText && (
          <a
            href={c.buttonLink || "#"}
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "linear-gradient(135deg, #c9a96e, #b08d4c)",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
            }}
          >
            {c.buttonText}
          </a>
        )}
      </ContentWrap>
    </div>
  );
}

function TextBlockSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "16px",
            }}
          >
            {c.heading}
          </h2>
        )}
        {c.body && (
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: dark ? "rgba(255,255,255,0.85)" : "#444" }}>
            {c.body}
          </p>
        )}
      </ContentWrap>
    </div>
  );
}

function ImageTextSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  const imageLeft = c.imagePosition !== "right";
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        <div style={{ display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap", flexDirection: imageLeft ? "row" : "row-reverse" }}>
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            {c.image ? (
              <img
                src={c.image}
                alt={c.imageAlt || ""}
                style={{ width: "100%", borderRadius: c.imageBorderRadius || "8px", objectFit: "cover", maxHeight: "400px" }}
              />
            ) : (
              <div style={{ width: "100%", height: "280px", background: "#e5e7eb", borderRadius: c.imageBorderRadius || "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                No Image
              </div>
            )}
          </div>
          <div style={{ flex: "1 1 300px" }}>
            {c.heading && (
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: dark ? "#fff" : "#1a1a2e",
                  marginBottom: "16px",
                }}
              >
                {c.heading}
              </h2>
            )}
            {c.body && (
              <p style={{ fontSize: "1rem", lineHeight: 1.7, color: dark ? "rgba(255,255,255,0.85)" : "#444" }}>
                {c.body}
              </p>
            )}
          </div>
        </div>
      </ContentWrap>
    </div>
  );
}

function GallerySection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  const cols = c.columns || 3;
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {c.heading}
          </h2>
        )}
        {c.images && c.images.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px" }}>
            {c.images.map((img: any, i: number) => (
              <img
                key={i}
                src={typeof img === "string" ? img : img.url}
                alt={typeof img === "string" ? "" : img.alt || ""}
                style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "8px" }}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px" }}>
            No images added. Add image URLs in settings.
          </div>
        )}
      </ContentWrap>
    </div>
  );
}

function RoomsSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {c.heading}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {(c.rooms || []).map((room: any, i: number) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
                background: dark ? "rgba(255,255,255,0.05)" : "#fff",
              }}
            >
              {room.image ? (
                <img src={room.image} alt={room.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "200px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                  No Image
                </div>
              )}
              <div style={{ padding: "16px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: dark ? "#fff" : "#1a1a2e", marginBottom: "8px" }}>
                  {room.name}
                </h3>
                <p style={{ fontSize: "0.9rem", color: dark ? "rgba(255,255,255,0.7)" : "#666" }}>
                  {room.description}
                </p>
                {room.price && (
                  <p style={{ marginTop: "8px", fontWeight: 600, color: "#c9a96e" }}>{room.price}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ContentWrap>
    </div>
  );
}

function CTASection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#0c1c2c");
  return (
    <div style={getSectionStyle(section)}>
      <Overlay opacity={section.styles.backgroundOverlay} color={section.styles.overlayColor} />
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: 700,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "16px",
            }}
          >
            {c.heading}
          </h2>
        )}
        {c.body && (
          <p style={{ fontSize: "1.1rem", color: dark ? "rgba(255,255,255,0.8)" : "#666", marginBottom: "24px" }}>
            {c.body}
          </p>
        )}
        {c.buttonText && (
          <a
            href={c.buttonLink || "#"}
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "linear-gradient(135deg, #c9a96e, #b08d4c)",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {c.buttonText}
          </a>
        )}
      </ContentWrap>
    </div>
  );
}

function TestimonialsSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {c.heading}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {(c.testimonials || []).map((t: any, i: number) => (
            <div
              key={i}
              style={{
                padding: "24px",
                background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "12px", color: "#c9a96e", fontSize: "1.2rem" }}>
                {"★".repeat(t.rating || 5)}
              </div>
              <p style={{ fontSize: "0.95rem", fontStyle: "italic", color: dark ? "rgba(255,255,255,0.8)" : "#444", marginBottom: "12px" }}>
                "{t.text}"
              </p>
              <p style={{ fontWeight: 600, color: dark ? "#fff" : "#1a1a2e", fontSize: "0.9rem" }}>
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </ContentWrap>
    </div>
  );
}

function ContactSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "24px",
            }}
          >
            {c.heading}
          </h2>
        )}
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            {c.email && (
              <p style={{ marginBottom: "12px", color: dark ? "rgba(255,255,255,0.8)" : "#444" }}>
                <strong>Email:</strong> {c.email}
              </p>
            )}
            {c.phone && (
              <p style={{ marginBottom: "12px", color: dark ? "rgba(255,255,255,0.8)" : "#444" }}>
                <strong>Phone:</strong> {c.phone}
              </p>
            )}
            {c.address && (
              <p style={{ marginBottom: "12px", color: dark ? "rgba(255,255,255,0.8)" : "#444" }}>
                <strong>Address:</strong> {c.address}
              </p>
            )}
          </div>
          {c.showForm && (
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input placeholder="Your Name" style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }} />
                <input placeholder="Your Email" style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }} />
                <textarea placeholder="Your Message" rows={4} style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", resize: "vertical" }} />
                <button style={{ padding: "12px 24px", background: "linear-gradient(135deg, #c9a96e, #b08d4c)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>
      </ContentWrap>
    </div>
  );
}

function CustomSection({ section }: { section: BuilderSection }) {
  const c = section.content;
  const dark = !isLight(section.styles.backgroundColor || "#ffffff");
  return (
    <div style={getSectionStyle(section)}>
      <ContentWrap maxWidth={section.styles.maxWidth}>
        {c.heading && (
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', serif",
              color: dark ? "#fff" : "#1a1a2e",
              marginBottom: "16px",
            }}
          >
            {c.heading}
          </h2>
        )}
        {c.body && (
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: dark ? "rgba(255,255,255,0.85)" : "#444" }}>
            {c.body}
          </p>
        )}
      </ContentWrap>
    </div>
  );
}

const RENDERERS: Record<string, React.FC<{ section: BuilderSection }>> = {
  hero: HeroSection,
  text_block: TextBlockSection,
  image_text: ImageTextSection,
  gallery: GallerySection,
  rooms: RoomsSection,
  cta: CTASection,
  testimonials: TestimonialsSection,
  contact: ContactSection,
  custom: CustomSection,
};

export default function SectionRenderer({ section, isEditing, onContentChange }: SectionRendererProps) {
  const Renderer = RENDERERS[section.type] || CustomSection;
  const needsOverlay = section.type !== "hero" && section.type !== "cta" && (section.styles.backgroundOverlay || 0) > 0;
  return (
    <div style={{ position: "relative" }}>
      {needsOverlay && <Overlay opacity={section.styles.backgroundOverlay} color={section.styles.overlayColor} />}
      <Renderer section={section} />
    </div>
  );
}

export { RENDERERS };
