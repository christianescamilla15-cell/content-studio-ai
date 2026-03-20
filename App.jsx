import { useState } from "react";

// ─── PLATAFORMAS ──────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", dims: "1080×1080", ratio: "1:1" },
  { id: "twitter",   label: "Twitter/X",  icon: "𝕏",  dims: "1200×675",  ratio: "16:9" },
  { id: "linkedin",  label: "LinkedIn",   icon: "💼", dims: "1200×627",  ratio: "1.91:1" },
  { id: "facebook",  label: "Facebook",   icon: "👥", dims: "1200×630",  ratio: "1.91:1" },
];

const TONES = ["Profesional", "Inspirador", "Urgente", "Divertido", "Minimalista"];
const FORMATS = ["Producto", "Servicio", "Evento", "Oferta", "Branding"];

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (platform, tone, format) => `
Eres un experto en marketing digital y copywriting. Generas contenido de alta conversión para redes sociales.

Plataforma objetivo: ${platform}
Tono deseado: ${tone}
Tipo de contenido: ${format}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin texto extra):
{
  "headline": "Título principal impactante (máx 10 palabras)",
  "subheadline": "Subtítulo que complementa (máx 15 palabras)",
  "body": "Cuerpo del mensaje persuasivo (2-3 oraciones)",
  "cta": "Llamada a la acción (máx 5 palabras)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "emoji_set": ["emoji1", "emoji2", "emoji3"],
  "dalle_prompt": "Detailed image generation prompt in English for DALL-E 3, describing a professional marketing visual for this content. Include style, lighting, composition. Minimum 50 words.",
  "color_palette": ["#hexcode1", "#hexcode2", "#hexcode3"],
  "posting_time": "Mejor hora para publicar y por qué (1 oración)"
}
`;

// ─── MOCK VISUAL (simula imagen DALL-E con gradiente basado en colores) ────────
function MockVisual({ colors, headline, platform, loading }) {
  const ratio = PLATFORMS.find(p => p.id === platform)?.ratio || "1:1";
  const [w, h] = ratio === "1:1" ? [1, 1] : ratio === "16:9" ? [16, 9] : [1.91, 1];
  const paddingBottom = `${(h / w) * 100}%`;

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom, borderRadius: 12, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: loading
          ? "linear-gradient(135deg, #1a1a2e, #16213e)"
          : `linear-gradient(135deg, ${colors?.[0] || "#1a1a2e"}, ${colors?.[1] || "#16213e"}, ${colors?.[2] || "#0f3460"})`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transition: "background 1s ease",
      }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTop: "3px solid #E8C547",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "sans-serif", margin: 0 }}>
              Generando visual...
            </p>
          </div>
        ) : (
          <>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)",
            }} />
            <div style={{ textAlign: "center", padding: 24, zIndex: 1 }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(14px, 3vw, 22px)",
                fontWeight: 700, color: "#fff",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                margin: "0 0 8px", lineHeight: 1.3,
              }}>
                {headline || "Tu contenido aquí"}
              </p>
              <div style={{
                fontSize: 10, color: "rgba(255,255,255,0.4)",
                fontFamily: "monospace", letterSpacing: "0.1em",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 4, padding: "3px 8px", display: "inline-block",
              }}>
                DALL-E 3 PREVIEW
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── COPY CARD ────────────────────────────────────────────────────────────────
function CopyCard({ label, content, accent }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(Array.isArray(content) ? content.join(" ") : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, padding: "14px 16px",
      marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: accent,
          fontFamily: "'DM Mono', monospace",
        }}>{label}</span>
        <button onClick={copy} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: copied ? "#4ADE80" : "rgba(255,255,255,0.3)",
          fontFamily: "sans-serif", transition: "color 0.2s",
        }}>
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.65,
        color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif",
      }}>
        {Array.isArray(content) ? content.map(t => `#${t}`).join(" ") : content}
      </p>
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function ContentGenerator() {
  const [brand, setBrand] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("Profesional");
  const [format, setFormat] = useState("Producto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("copy");

  const generate = async () => {
    if (!brand.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(platform, tone, format),
          messages: [{ role: "user", content: `Genera contenido de marketing para: ${brand}` }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setActiveTab("copy");
    } catch (e) {
      setError("Error generando contenido. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);
  const accent = "#E8C547";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0C0C14",
      fontFamily: "'DM Sans', sans-serif",
      padding: "20px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.85; }
        textarea:focus, input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32, paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
            <h1 style={{
              margin: 0, fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900,
              color: "#F8F4E8", letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              Content<span style={{ color: accent }}>Studio</span>
            </h1>
            <span style={{
              fontSize: 10, fontFamily: "'DM Mono', monospace",
              color: accent, border: `1px solid ${accent}40`,
              borderRadius: 4, padding: "3px 8px", letterSpacing: "0.1em",
            }}>AI-POWERED</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>
            Genera copy + visual para redes sociales en segundos · Claude API + DALL-E 3
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* PANEL IZQUIERDO — INPUTS */}
          <div>
            {/* Brand Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace",
                marginBottom: 8,
              }}>
                Producto o Servicio
              </label>
              <textarea
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Ej: App de meditación para profesionales con IA adaptativa, reduce el estrés en 10 minutos al día..."
                rows={4}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "12px 14px",
                  color: "#F8F4E8", fontSize: 13, lineHeight: 1.6,
                  fontFamily: "'DM Sans', sans-serif",
                  resize: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = `${accent}60`}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Plataforma */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace",
                marginBottom: 8,
              }}>Plataforma</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setPlatform(p.id)} style={{
                    background: platform === p.id ? `${accent}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${platform === p.id ? accent : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8, padding: "8px 10px",
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: platform === p.id ? accent : "#9CA3AF" }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>
                        {p.dims}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tono y Formato */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Tono", options: TONES, value: tone, setter: setTone },
                { label: "Formato", options: FORMATS, value: format, setter: setFormat },
              ].map(({ label, options, value, setter }) => (
                <div key={label}>
                  <label style={{
                    display: "block", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace",
                    marginBottom: 8,
                  }}>{label}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {options.map(o => (
                      <button key={o} onClick={() => setter(o)} style={{
                        background: value === o ? `${accent}15` : "none",
                        border: `1px solid ${value === o ? accent : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 6, padding: "6px 10px",
                        fontSize: 12, color: value === o ? accent : "#6B7280",
                        cursor: "pointer", textAlign: "left",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botón Generar */}
            <button
              onClick={generate}
              disabled={!brand.trim() || loading}
              style={{
                width: "100%", padding: "14px",
                background: brand.trim() && !loading
                  ? `linear-gradient(135deg, ${accent}, #D4A017)`
                  : "rgba(255,255,255,0.06)",
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                color: brand.trim() && !loading ? "#0C0C14" : "#4B5563",
                cursor: brand.trim() && !loading ? "pointer" : "default",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
                boxShadow: brand.trim() && !loading ? `0 0 24px ${accent}40` : "none",
              }}
            >
              {loading ? "⚡ Generando contenido..." : "⚡ Generar Contenido"}
            </button>

            {error && (
              <p style={{ color: "#F87171", fontSize: 12, marginTop: 10, textAlign: "center" }}>{error}</p>
            )}
          </div>

          {/* PANEL DERECHO — RESULTADO */}
          <div>
            {/* Vista previa visual */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  Vista Previa · {selectedPlatform?.label}
                </label>
                {result && (
                  <span style={{ fontSize: 10, color: accent, fontFamily: "'DM Mono', monospace" }}>
                    {selectedPlatform?.dims}
                  </span>
                )}
              </div>
              <MockVisual
                colors={result?.color_palette}
                headline={result?.headline}
                platform={platform}
                loading={loading}
              />
              {result && (
                <div style={{
                  marginTop: 8, padding: "8px 12px",
                  background: "rgba(232,197,71,0.06)",
                  border: "1px solid rgba(232,197,71,0.15)",
                  borderRadius: 8,
                }}>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    <span style={{ color: accent }}>DALL-E prompt:</span>{" "}
                    {result.dalle_prompt?.substring(0, 100)}...
                  </p>
                </div>
              )}
            </div>

            {/* Tabs de contenido */}
            {result && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {["copy", "visual", "schedule"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      flex: 1, padding: "7px 4px",
                      background: activeTab === tab ? `${accent}15` : "none",
                      border: `1px solid ${activeTab === tab ? accent : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 7, fontSize: 11, fontWeight: 600,
                      color: activeTab === tab ? accent : "#6B7280",
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      textTransform: "capitalize", transition: "all 0.15s",
                    }}>
                      {tab === "copy" ? "Copy" : tab === "visual" ? "Visual" : "Timing"}
                    </button>
                  ))}
                </div>

                {activeTab === "copy" && (
                  <div>
                    <CopyCard label="Headline" content={result.headline} accent={accent} />
                    <CopyCard label="Subheadline" content={result.subheadline} accent={accent} />
                    <CopyCard label="Cuerpo" content={result.body} accent={accent} />
                    <CopyCard label="CTA" content={result.cta} accent={accent} />
                    <CopyCard label="Hashtags" content={result.hashtags} accent={accent} />
                  </div>
                )}

                {activeTab === "visual" && (
                  <div>
                    <div style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "14px 16px", marginBottom: 10,
                    }}>
                      <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, fontFamily: "'DM Mono', monospace" }}>
                        Paleta de Colores
                      </p>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        {result.color_palette?.map((c, i) => (
                          <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ height: 40, borderRadius: 6, background: c, marginBottom: 4 }} />
                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{c}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {result.emoji_set?.map((e, i) => (
                          <span key={i} style={{ fontSize: 24 }}>{e}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10, padding: "14px 16px",
                    }}>
                      <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, fontFamily: "'DM Mono', monospace" }}>
                        Prompt DALL-E 3
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                        {result.dalle_prompt}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, padding: "16px",
                  }}>
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, fontFamily: "'DM Mono', monospace" }}>
                      Mejor Momento para Publicar
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#E2E8F0", lineHeight: 1.65 }}>
                      {result.posting_time}
                    </p>
                    <div style={{ marginTop: 16, padding: "12px", background: "rgba(232,197,71,0.06)", borderRadius: 8, border: "1px solid rgba(232,197,71,0.12)" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                        💡 <strong style={{ color: accent }}>Tip:</strong> Integra este generador con Make.com para programar publicaciones automáticas en Buffer o Hootsuite directamente desde el flujo de trabajo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!result && !loading && (
              <div style={{
                height: 200, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 10,
              }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>✦</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                  EL CONTENIDO APARECERÁ AQUÍ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            CLAUDE API · DALL-E 3 · MAKE.COM INTEGRATION READY
          </p>
        </div>
      </div>
    </div>
  );
}
