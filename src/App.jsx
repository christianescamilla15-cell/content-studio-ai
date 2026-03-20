import { useState, useRef, useEffect } from "react";

// ─── PLATAFORMAS ──────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", dims: "1080×1080", ratio: "1:1" },
  { id: "twitter",   label: "Twitter/X",  icon: "𝕏",  dims: "1200×675",  ratio: "16:9" },
  { id: "linkedin",  label: "LinkedIn",   icon: "💼", dims: "1200×627",  ratio: "1.91:1" },
  { id: "facebook",  label: "Facebook",   icon: "👥", dims: "1200×630",  ratio: "1.91:1" },
];

const TONES = ["Profesional", "Inspirador", "Urgente", "Divertido", "Minimalista"];
const FORMATS = ["Producto", "Servicio", "Evento", "Oferta", "Branding"];

const BRAND_MIN = 10;
const BRAND_MAX = 500;

const LOADING_STEPS = [
  "Analizando tu marca...",
  "Generando copy...",
  "Creando paleta visual...",
];

// ─── HEX VALIDATOR ───────────────────────────────────────────────────────────
const isValidHex = (c) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(c);
const safeHex = (c, fallback) => isValidHex(c) ? c : fallback;

// ─── SYSTEM PROMPT (kept for API mode) ──────────────────────────────────────
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

// ─── SMART CONTENT GENERATOR ────────────────────────────────────────────────

// Helper: seeded pseudo-random for deterministic-but-varying output
function createRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickRandom(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffled(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── BRAND PARSER ────────────────────────────────────────────────────────────
function parseBrand(brand) {
  const text = brand.trim();
  const words = text.split(/\s+/);

  // Product name: quoted text, or first 3-4 meaningful words
  const quotedMatch = text.match(/[""]([^""]+)[""]/) || text.match(/"([^"]+)"/);
  const stopwords = new Set(["de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "e", "a", "en", "con", "por", "para", "que", "es", "su", "se", "al", "lo", "más", "muy", "sin", "ni", "como", "nos", "te", "mi", "tu", "ser", "está", "son"]);
  const meaningfulWords = words.filter(w => !stopwords.has(w.toLowerCase()) && w.length > 2);
  const productName = quotedMatch ? quotedMatch[1] : meaningfulWords.slice(0, 3).join(" ");

  // Benefits: words/phrases after "que", "para", "con", "permite", "ayuda", "logra", "ofrece"
  const benefitPatterns = /(?:que|para|con|permite|ayuda a?|logra|ofrece|brinda|genera|mejora|reduce|aumenta|optimiza|facilita|transforma|elimina|garantiza|asegura)\s+([^,.;]+)/gi;
  const benefits = [];
  let m;
  while ((m = benefitPatterns.exec(text)) !== null) {
    const b = m[1].trim();
    if (b.length > 3 && b.split(/\s+/).length <= 10) benefits.push(b);
  }

  // Target audience keywords
  const audiencePatterns = /(?:para|dirigido a|enfocado en|diseñado para|ideal para|orientado a)\s+([^,.;]+)/gi;
  const audiences = [];
  while ((m = audiencePatterns.exec(text)) !== null) {
    audiences.push(m[1].trim());
  }

  // Industry detection
  const industryKeywords = {
    tech: ["app", "software", "plataforma", "digital", "tecnología", "ia", "inteligencia artificial", "saas", "api", "datos", "cloud", "nube", "startup", "código", "automatización", "algoritmo", "machine learning"],
    food: ["comida", "restaurante", "cocina", "chef", "receta", "alimento", "orgánico", "gourmet", "café", "bebida", "menú", "panadería", "delivery", "snack", "saludable"],
    health: ["salud", "bienestar", "meditación", "fitness", "yoga", "médico", "clínica", "terapia", "nutrición", "ejercicio", "mental", "estrés", "deporte", "gym", "vitamina", "suplemento"],
    finance: ["finanzas", "inversión", "ahorro", "dinero", "banco", "crédito", "capital", "trading", "crypto", "contabilidad", "presupuesto", "fondos", "patrimonio", "financiero"],
    education: ["curso", "educación", "aprendizaje", "clase", "profesor", "estudiante", "universidad", "academia", "capacitación", "formación", "enseñanza", "taller", "diplomado", "certificación"],
    fashion: ["moda", "ropa", "diseño", "estilo", "colección", "tendencia", "boutique", "accesorio", "joyería", "calzado", "textil", "prenda", "outfit"],
    beauty: ["belleza", "skincare", "maquillaje", "cosmético", "cuidado personal", "cabello", "piel", "spa", "tratamiento facial", "crema", "sérum"],
    realestate: ["inmobiliaria", "casa", "departamento", "propiedad", "terreno", "renta", "hipoteca", "condominio", "hogar", "arquitectura", "construcción"],
    travel: ["viaje", "turismo", "hotel", "destino", "aventura", "vacaciones", "vuelo", "hospedaje", "tour", "experiencia"],
    marketing: ["marketing", "publicidad", "marca", "branding", "campaña", "redes sociales", "contenido", "copywriting", "seo", "estrategia digital"],
  };

  const lowerText = text.toLowerCase();
  let detectedIndustry = "general";
  let maxScore = 0;
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const score = keywords.filter(kw => lowerText.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedIndustry = industry;
    }
  }

  // Extract key descriptors (adjectives and nouns that define the product)
  const descriptors = meaningfulWords.filter(w => w.length > 3).slice(0, 8);

  // Value proposition: try to extract the core promise
  const valueMatch = text.match(/(?:que\s+)(.{10,60}?)(?:\.|,|$)/i);
  const valueProp = valueMatch ? valueMatch[1].trim() : (benefits[0] || descriptors.slice(0, 4).join(" "));

  return { productName, benefits, audiences, detectedIndustry, descriptors, valueProp, meaningfulWords };
}

// ─── HEADLINE FORMULAS PER TONE ──────────────────────────────────────────────
const HEADLINE_FORMULAS = {
  Profesional: [
    (p, v) => `${p}: La Solución Que Tu Negocio Necesita`,
    (p, v) => `${p} — Resultados Profesionales Garantizados`,
    (p, v) => `Optimiza Tu Estrategia Con ${p}`,
    (p, v) => `${p}: Eficiencia y Resultados Medibles`,
    (p, v) => `La Ventaja Competitiva de ${p}`,
    (p, v) => `${p}: Donde la Estrategia Encuentra Resultados`,
    (p, v) => `Profesionales Eligen ${p} Por una Razón`,
    (p, v) => `${p} — El Estándar de la Industria`,
    (p, v) => `Transforma Tu Operación Con ${p}`,
    (p, v) => `${p}: Inteligencia Aplicada a Tu Sector`,
    (p, v) => `El ROI Que Esperabas: ${p}`,
    (p, v) => `${p} Redefine Lo Que Es Posible`,
  ],
  Inspirador: [
    (p, v) => `${p}: Donde Comienzan los Grandes Cambios`,
    (p, v) => `Imagina Lo Que Puedes Lograr Con ${p}`,
    (p, v) => `${p} — Tu Próximo Gran Paso`,
    (p, v) => `El Futuro Que Soñaste Empieza Con ${p}`,
    (p, v) => `${p}: Despierta Tu Máximo Potencial`,
    (p, v) => `Atrévete a Más Con ${p}`,
    (p, v) => `${p} — Porque Mereces Lo Extraordinario`,
    (p, v) => `Transforma Tu Vida Con ${p}`,
    (p, v) => `Cada Gran Historia Empieza Con ${p}`,
    (p, v) => `${p}: El Impulso Que Necesitabas`,
    (p, v) => `No Esperes Más — ${p} Está Aquí`,
    (p, v) => `${p}: Haz Realidad Lo Imposible`,
  ],
  Urgente: [
    (p, v) => `Última Oportunidad: ${p} Con Acceso Limitado`,
    (p, v) => `Solo Hoy: ${p} al Mejor Precio`,
    (p, v) => `No Te Quedes Fuera — ${p} Se Agota`,
    (p, v) => `Quedan Pocas Unidades de ${p}`,
    (p, v) => `${p}: Oferta Que Expira en Horas`,
    (p, v) => `Ahora o Nunca — ${p} No Esperará`,
    (p, v) => `Últimos Lugares Para ${p}`,
    (p, v) => `Alerta: ${p} Con Precio Irrepetible`,
    (p, v) => `${p} — Tu Ventana de Oportunidad Se Cierra`,
    (p, v) => `No Pierdas Tu Acceso a ${p}`,
    (p, v) => `${p}: Actúa Antes de Que Sea Tarde`,
    (p, v) => `Tiempo Limitado — ${p} Te Espera`,
  ],
  Divertido: [
    (p, v) => `${p}: Porque La Vida Es Demasiado Corta`,
    (p, v) => `Dale Sabor a Tu Día Con ${p}`,
    (p, v) => `${p} — Tu Nuevo Favorito Oficial`,
    (p, v) => `¿Ya Probaste ${p}? Te Falta Vivir`,
    (p, v) => `${p}: La Felicidad Tiene Nombre`,
    (p, v) => `Spoiler: ${p} Va a Encantarte`,
    (p, v) => `${p} — Sonríe, Mereces Algo Bueno`,
    (p, v) => `Prepárate Para Enamorarte de ${p}`,
    (p, v) => `${p}: Alegría Garantizada o Devolvemos la Sonrisa`,
    (p, v) => `Esto No Es un Simulacro: ${p} Está Aquí`,
    (p, v) => `${p} — El Plot Twist Que Necesitabas`,
    (p, v) => `Level Up: Descubre ${p}`,
  ],
  Minimalista: [
    (p, v) => `${p}. Simple. Efectivo.`,
    (p, v) => `Menos Ruido. Más ${p}.`,
    (p, v) => `${p} — Lo Esencial.`,
    (p, v) => `La Claridad de ${p}`,
    (p, v) => `${p}. Sin Excesos.`,
    (p, v) => `Pura Esencia: ${p}`,
    (p, v) => `${p}. Nada Sobra.`,
    (p, v) => `Lo Que Necesitas: ${p}`,
    (p, v) => `${p} — Diseño Con Propósito`,
    (p, v) => `Simplifica Con ${p}`,
    (p, v) => `${p}. Menos Es Más.`,
    (p, v) => `${p} — Elegancia En Lo Simple`,
  ],
};

// ─── SUBHEADLINE FORMULAS ────────────────────────────────────────────────────
const SUBHEADLINE_FORMULAS = {
  Profesional: [
    (b, a) => b ? `La solución profesional para ${b}` : "Resultados medibles desde el primer día",
    (b, a) => a ? `Diseñado para ${a} que buscan excelencia` : "La herramienta que los líderes confían",
    (b, a) => b ? `Potencia tu capacidad de ${b} con tecnología probada` : "Eficiencia operativa al siguiente nivel",
    (b, a) => "Miles de profesionales ya optimizaron su flujo de trabajo",
    (b, a) => b ? `Maximiza tus resultados: ${b}` : "Rendimiento superior, resultados consistentes",
  ],
  Inspirador: [
    (b, a) => b ? `Descubre cómo ${b} puede cambiar todo` : "El cambio que estabas esperando empieza aquí",
    (b, a) => a ? `Creado para ${a} con grandes sueños` : "Atrévete a imaginar algo diferente",
    (b, a) => b ? `Más que un producto: tu camino hacia ${b}` : "Cada gran logro empieza con una decisión",
    (b, a) => "Únete a miles que ya transformaron su realidad",
    (b, a) => "Tu mejor versión está a un paso de distancia",
  ],
  Urgente: [
    (b, a) => b ? `Aprovecha ahora y logra ${b} antes que nadie` : "La oportunidad no espera — actúa ya",
    (b, a) => "Solo quedan horas para acceder a esta oferta exclusiva",
    (b, a) => b ? `Miles ya están disfrutando de ${b} — ¿y tú?` : "No dejes pasar esta oportunidad única",
    (b, a) => "Cada minuto que esperas, alguien más lo aprovecha",
    (b, a) => "Cupos limitados — la demanda supera toda expectativa",
  ],
  Divertido: [
    (b, a) => b ? `Porque ${b} debería ser divertido` : "La vida es corta para cosas aburridas",
    (b, a) => a ? `Hecho con amor para ${a} como tú` : "Prepárate para tu nueva obsesión favorita",
    (b, a) => "Advertencia: puede causar sonrisas involuntarias",
    (b, a) => b ? `${b}... pero con estilo y buena vibra` : "Tu dosis diaria de felicidad en un solo lugar",
    (b, a) => "Lo probaste una vez y ya no hay vuelta atrás",
  ],
  Minimalista: [
    (b, a) => b ? `${b}. Sin complicaciones.` : "Lo esencial, sin distracciones.",
    (b, a) => "Diseño intencional. Funcionalidad pura.",
    (b, a) => "Cada detalle, con propósito.",
    (b, a) => b ? `Solo lo que necesitas para ${b}` : "Simplicidad que funciona.",
    (b, a) => "Menos pasos. Mejores resultados.",
  ],
};

// ─── BODY COPY FORMULAS ──────────────────────────────────────────────────────
const BODY_FORMULAS = {
  Profesional: [
    (p, b, a, d) => `${p} no es una solución genérica. Está diseñado específicamente para ${a || "profesionales exigentes"} que necesitan ${b || "resultados reales y medibles"}. Con ${d.slice(0, 2).join(" y ") || "tecnología de vanguardia"}, tu equipo alcanzará un nuevo estándar de productividad. ¿Estás listo para dar el siguiente paso?`,
    (p, b, a, d) => `En un mercado donde cada decisión cuenta, ${p} se convierte en tu aliado estratégico. ${b ? `Logra ${b} sin complicaciones.` : "Optimiza cada proceso con precisión."} Más de 10,000 ${a || "profesionales"} ya confían en esta solución. Los números hablan por sí solos.`,
    (p, b, a, d) => `La diferencia entre bueno y extraordinario es la herramienta correcta. ${p} integra ${d.slice(0, 3).join(", ") || "innovación y eficiencia"} para que ${a || "tu equipo"} ${b ? `pueda ${b}` : "supere cualquier expectativa"}. Implementación rápida, resultados inmediatos, ROI comprobado.`,
  ],
  Inspirador: [
    (p, b, a, d) => `Imagina un mundo donde ${b || "tus metas se vuelven realidad sin esfuerzo"}. ${p} hace eso posible para ${a || "personas como tú que buscan algo más"}. No se trata solo de ${d[0] || "un producto"}, se trata de transformar la manera en que vives y trabajas. Tu momento es ahora.`,
    (p, b, a, d) => `Cada gran cambio empieza con una decisión valiente. ${p} nació para ${a || "quienes se atreven a soñar en grande"} y no se conforman con lo ordinario. ${b ? `Descubre cómo ${b} puede redefinir tu día a día.` : "El futuro que imaginas está más cerca de lo que crees."} Este es tu momento.`,
    (p, b, a, d) => `${p} es más que ${d[0] || "tecnología"}: es la promesa de un futuro mejor. Para ${a || "quienes buscan evolucionar"}, ${b ? `la posibilidad de ${b}` : "cada día trae nuevas oportunidades"}. Miles ya dieron ese paso y no miraron atrás. ¿Qué estás esperando?`,
  ],
  Urgente: [
    (p, b, a, d) => `ATENCIÓN ${a ? a.toUpperCase() : ""}:  La oportunidad de acceder a ${p} con condiciones exclusivas se cierra pronto. ${b ? `Mientras lees esto, otros ya están aprovechando ${b}.` : "Cada segundo cuenta."} No esperes a que sea demasiado tarde — la demanda está superando las expectativas.`,
    (p, b, a, d) => `${p} está generando una demanda sin precedentes. ${b ? `Quienes ya lo tienen disfrutan de ${b} todos los días.` : "Los resultados están superando todas las predicciones."} Para ${a || "quienes actúan rápido"}, aún hay tiempo. Pero no mucho. Asegura tu lugar AHORA.`,
    (p, b, a, d) => `Solo quedan horas. ${p} está disponible por tiempo limitado con acceso completo a ${d.slice(0, 2).join(" y ") || "todas las funciones premium"}. ${a ? `Si eres ${a}` : "Si buscas resultados"}, ${b ? `y quieres ${b}` : ""}, este es el momento de actuar. No habrá segunda oportunidad.`,
  ],
  Divertido: [
    (p, b, a, d) => `Okay, seamos honestos: ${a || "todos"} necesitamos algo que ${b || "nos haga la vida más fácil y divertida"}. ${p} es exactamente eso, pero mejor. Con ${d[0] || "un toque especial"} que no encontrarás en ningún otro lugar. Pruébalo y agradécenos después.`,
    (p, b, a, d) => `Plot twist: ${p} existe y es todo lo que ${a || "siempre quisiste"} pero no sabías que necesitabas. ${b ? `¿${b}? Check.` : "¿Funciona? Absolutamente."} ¿Es divertido? Demasiado. ¿Deberías probarlo? La respuesta es sí, siempre sí. De nada.`,
    (p, b, a, d) => `Alerta de spoiler: una vez que pruebes ${p}, todo lo demás te parecerá aburrido. ${b ? `Porque ${b} nunca fue tan fácil ni tan entretenido.` : "Es adictivamente bueno."} ${a ? `Creado para ${a} con buen gusto.` : "Para quienes saben lo que quieren."} Tu yo del futuro te lo agradecerá.`,
  ],
  Minimalista: [
    (p, b, a, d) => `${p}. ${b ? `${b.charAt(0).toUpperCase() + b.slice(1)}.` : "Sin complicaciones."} ${a ? `Para ${a}.` : "Para ti."} Nada más, nada menos.`,
    (p, b, a, d) => `Simplicidad radical. ${p} elimina lo innecesario y deja solo lo que funciona. ${b ? `Resultado: ${b}.` : "Resultado: eficiencia pura."} Punto.`,
    (p, b, a, d) => `${p}. ${d[0] ? `${d[0].charAt(0).toUpperCase() + d[0].slice(1)}` : "Diseño"}. ${d[1] || "Propósito"}. ${b || "Resultados"}. Todo lo que necesitas, concentrado en su forma más pura.`,
  ],
};

// ─── CTA FORMULAS ─────────────────────────────────────────────────────────────
const CTA_BY_FORMAT = {
  Producto: ["Compra ahora", "Consíguelo hoy", "Lo quiero", "Agregar al carrito", "Descúbrelo ya", "Ver producto", "Comprar con descuento", "Obtener el mío"],
  Servicio: ["Agenda tu consulta", "Solicita una demo", "Reserva tu sesión", "Empieza gratis", "Habla con un experto", "Cotiza sin compromiso", "Prueba 14 días gratis", "Conectar ahora"],
  Evento: ["Reserva tu lugar", "Inscríbete ahora", "Asegura tu entrada", "Quiero asistir", "Regístrate gratis", "Separa tu asiento", "No te lo pierdas", "Confirmar asistencia"],
  Oferta: ["Aprovechar oferta", "Canjea tu descuento", "Activar promoción", "Compra con 50% OFF", "Última oportunidad", "Reclamar mi oferta", "Usar código ahora", "Ahorrar hoy"],
  Branding: ["Conócenos", "Descubre nuestra historia", "Explora la marca", "Sé parte de esto", "Únete al movimiento", "Vive la experiencia", "Conoce nuestra misión", "Únete a la comunidad"],
};

// ─── INDUSTRY COLOR PALETTES ──────────────────────────────────────────────────
const INDUSTRY_PALETTES = {
  tech:       [["#0066FF", "#00D4AA", "#1A1A2E"], ["#6366F1", "#8B5CF6", "#0F172A"], ["#00B4D8", "#0077B6", "#03045E"], ["#3B82F6", "#10B981", "#111827"]],
  food:       [["#FF6B35", "#F7C948", "#2D1810"], ["#E63946", "#F1FAEE", "#457B9D"], ["#BC4749", "#F2E8CF", "#386641"], ["#FF8C42", "#FFD166", "#2B2D42"]],
  health:     [["#06D6A0", "#118AB2", "#073B4C"], ["#52B788", "#40916C", "#1B4332"], ["#80ED99", "#57CC99", "#22577A"], ["#38A3A5", "#57CC99", "#C7F9CC"]],
  finance:    [["#1B4332", "#2D6A4F", "#D4AF37"], ["#0D1B2A", "#1B3A4B", "#3A7CA5"], ["#14213D", "#FCA311", "#E5E5E5"], ["#003049", "#D62828", "#F77F00"]],
  education:  [["#4361EE", "#3A0CA3", "#F72585"], ["#7209B7", "#560BAD", "#480CA8"], ["#4CC9F0", "#4895EF", "#3F37C9"], ["#FF6D00", "#FF9E00", "#240046"]],
  fashion:    [["#2B2D42", "#8D99AE", "#EF233C"], ["#000000", "#D4AF37", "#FFFFFF"], ["#FF006E", "#8338EC", "#3A86FF"], ["#1A1A1A", "#C9184A", "#FFD6FF"]],
  beauty:     [["#FF69B4", "#FFB6C1", "#2D1B2E"], ["#D4A5A5", "#9C6644", "#F5E6CC"], ["#E0AAFF", "#C77DFF", "#7B2D8E"], ["#FF85A1", "#FBB1BD", "#2D1B2E"]],
  realestate: [["#1B4332", "#588157", "#DAD7CD"], ["#3C2A21", "#D5CEA3", "#1A120B"], ["#14213D", "#FCA311", "#E5E5E5"], ["#606C38", "#283618", "#FEFAE0"]],
  travel:     [["#00B4D8", "#0077B6", "#CAF0F8"], ["#FF6B6B", "#FFE66D", "#4ECDC4"], ["#F4A261", "#E76F51", "#264653"], ["#06D6A0", "#118AB2", "#EF476F"]],
  marketing:  [["#FF6B6B", "#4ECDC4", "#1A1A2E"], ["#E63946", "#457B9D", "#F1FAEE"], ["#FF006E", "#FB5607", "#FFBE0B"], ["#7209B7", "#3A0CA3", "#4361EE"]],
  general:    [["#E8C547", "#D4A017", "#1A1A2E"], ["#6366F1", "#8B5CF6", "#1E1B4B"], ["#F59E0B", "#EF4444", "#1F2937"], ["#10B981", "#3B82F6", "#111827"]],
};

// Override palette mood by tone
const TONE_PALETTE_ADJUSTMENTS = {
  Minimalista: [["#1A1A1A", "#4A4A4A", "#8A8A8A"], ["#0A0A0A", "#333333", "#666666"], ["#2D2D2D", "#555555", "#888888"], ["#1C1C1C", "#3D3D3D", "#6E6E6E"]],
};

// ─── EMOJIS BY TONE ──────────────────────────────────────────────────────────
const EMOJI_SETS = {
  Profesional:  [["💼", "📊", "✅"], ["🎯", "📈", "💡"], ["🏆", "🔑", "⚡"], ["📋", "🤝", "💎"]],
  Inspirador:   [["✨", "🌟", "💫"], ["🚀", "🌈", "💪"], ["🎯", "🔥", "⭐"], ["🦋", "🌻", "💖"]],
  Urgente:      [["⚡", "🔥", "⏰"], ["🚨", "💥", "⏳"], ["❗", "🔴", "⚡"], ["🏃", "💨", "🎯"]],
  Divertido:    [["🎉", "🎊", "🥳"], ["😎", "🤩", "💃"], ["🎪", "🌈", "✨"], ["🦄", "🍕", "🎮"]],
  Minimalista:  [["◾", "▪", "●"], ["◽", "○", "◆"], ["■", "□", "▲"], ["▫", "◉", "◈"]],
};

// ─── POSTING TIMES ───────────────────────────────────────────────────────────
const POSTING_TIMES = {
  instagram: [
    "Miércoles y viernes 11:00-13:00 hrs — el engagement en Instagram alcanza su pico durante la hora de almuerzo, cuando los usuarios hacen scroll pasivo buscando inspiración visual.",
    "Martes y jueves 18:00-20:00 hrs — mayor actividad post-trabajo. Tu audiencia busca contenido aspiracional después de su jornada laboral.",
    "Sábados 10:00-11:00 hrs — el fin de semana empieza relajado y los usuarios dedican más tiempo a explorar contenido nuevo en su feed.",
    "Lunes 7:00-9:00 hrs — inicio de semana, usuarios revisan Instagram durante el desayuno o camino al trabajo. Ideal para contenido motivacional.",
  ],
  twitter: [
    "Lunes a viernes 8:00-9:00 hrs — Twitter/X tiene su mayor actividad durante el commute matutino. Los usuarios buscan noticias y actualizaciones rápidas.",
    "Miércoles 12:00-13:00 hrs — punto medio de la semana laboral, genera la mayor interacción en hilos y contenido de opinión profesional.",
    "Martes y jueves 17:00-18:00 hrs — fin de jornada laboral, los usuarios participan más activamente en conversaciones y debates de nicho.",
    "Domingos 19:00-21:00 hrs — momento de reflexión y planificación semanal. Ideal para hilos educativos y contenido largo.",
  ],
  linkedin: [
    "Martes a jueves 7:30-8:30 hrs — los profesionales revisan LinkedIn antes de iniciar su jornada. Momento clave para contenido B2B y thought leadership.",
    "Miércoles 10:00-11:00 hrs — hora pico de decisores y C-level. Ideal para anuncios corporativos y casos de estudio.",
    "Martes 12:00-13:00 hrs — la pausa del almuerzo es perfecta para artículos y posts extensos que generan debate profesional.",
    "Jueves 15:00-16:00 hrs — los profesionales buscan inspiración para cerrar la semana. Buen momento para storytelling empresarial.",
  ],
  facebook: [
    "Jueves y viernes 13:00-16:00 hrs — la audiencia de Facebook tiene mayor actividad en las tardes de fin de semana laboral, consumiendo contenido variado.",
    "Domingos 11:00-13:00 hrs — contenido de marca tiene alto engagement cuando la audiencia está relajada y navegando sin prisa.",
    "Miércoles 12:00-14:00 hrs — el punto medio de la semana muestra picos de interacción en videos y carruseles visuales.",
    "Sábados 9:00-11:00 hrs — mañana de fin de semana, los usuarios exploran marketplace y descubren nuevas marcas.",
  ],
};

// ─── HASHTAG GENERATOR ──────────────────────────────────────────────────────
const INDUSTRY_HASHTAGS = {
  tech: ["tech", "innovacion", "digital", "ia", "futurodigital", "startup", "software", "automatizacion", "transformaciondigital"],
  food: ["foodie", "gastronomia", "comidacasera", "recetas", "cheflife", "healthyfood", "delicioso", "gourmet"],
  health: ["bienestar", "saludmental", "fitness", "vidaSaludable", "wellness", "mindfulness", "autocuidado", "salud"],
  finance: ["finanzas", "inversion", "dinero", "libertadfinanciera", "ahorro", "fintech", "educacionfinanciera"],
  education: ["educacion", "aprendizaje", "cursoonline", "formacion", "conocimiento", "desarrollo", "skillup"],
  fashion: ["moda", "estilo", "outfit", "tendencias", "fashion", "lookdeldia", "diseño", "streetstyle"],
  beauty: ["belleza", "skincare", "glowup", "beauty", "cuidadopersonal", "rutina", "selfcare"],
  realestate: ["bienesraices", "inversion", "hogar", "propiedades", "inmobiliaria", "tuhogar", "departamentos"],
  travel: ["viajes", "destinos", "aventura", "travel", "turismo", "explora", "wanderlust", "vacaciones"],
  marketing: ["marketingdigital", "estrategia", "redessociales", "branding", "contenido", "growthhacking"],
  general: ["trending", "viral", "novedades", "descubre", "imperdible", "recomendado", "tendencia"],
};

const FORMAT_HASHTAGS = {
  Producto: ["nuevolanzamiento", "producto", "musthave", "compraonline", "tienda"],
  Servicio: ["servicio", "consultoria", "profesional", "agendatu", "expertos"],
  Evento: ["evento", "networking", "conferencia", "noteloPierdas", "envivo"],
  Oferta: ["oferta", "descuento", "promocion", "precioEspecial", "ultimahora"],
  Branding: ["marca", "identidad", "branding", "historia", "proposito"],
};

const PLATFORM_HASHTAGS = {
  instagram: ["instagood", "photooftheday", "explore"],
  twitter: ["thread", "tech", "opinion"],
  linkedin: ["linkedin", "business", "networking"],
  facebook: ["fb", "comunidad", "compartir"],
};

// ─── DALLE PROMPT BUILDER ────────────────────────────────────────────────────
function buildDallePrompt(parsed, platform, tone, palette, rng) {
  const platformDims = PLATFORMS.find(p => p.id === platform);
  const aspectDesc = platform === "instagram" ? "square 1:1 aspect ratio" :
    platform === "twitter" ? "wide 16:9 landscape aspect ratio" :
    "wide 1.91:1 landscape aspect ratio";

  const toneStyles = {
    Profesional: "Clean, corporate aesthetic with sharp lines, professional lighting, and a sophisticated color scheme. Minimalist but impactful composition.",
    Inspirador: "Warm, uplifting atmosphere with golden hour lighting, expansive spaces, and an aspirational feel. Ethereal and empowering mood.",
    Urgente: "High-contrast, bold visual with dynamic angles, intense colors, and a sense of movement. Eye-catching and immediate impact.",
    Divertido: "Bright, playful colors with whimsical elements, creative typography, and a lighthearted atmosphere. Fun and engaging composition.",
    Minimalista: "Ultra-clean composition with ample white space, geometric elements, and a monochromatic palette. Zen-like simplicity and elegance.",
  };

  const industrySubjects = {
    tech: "sleek technology devices, digital interfaces, and futuristic elements",
    food: "beautifully plated dishes, fresh ingredients, and warm kitchen ambiance",
    health: "serene natural settings, wellness imagery, and calming botanical elements",
    finance: "abstract representations of growth, upward trends, and premium materials",
    education: "open books, illuminated spaces, and pathways of knowledge",
    fashion: "editorial-style fashion photography, fabric textures, and bold styling",
    beauty: "soft skin textures, luxurious cosmetic products, and gentle lighting",
    realestate: "architectural photography, modern interiors, and lifestyle spaces",
    travel: "breathtaking landscapes, exotic destinations, and adventure elements",
    marketing: "creative workspace, dynamic graphics, and brand storytelling elements",
    general: "modern lifestyle elements, abstract geometric forms, and premium textures",
  };

  const subject = industrySubjects[parsed.detectedIndustry] || industrySubjects.general;
  const style = toneStyles[tone] || toneStyles.Profesional;

  return `Professional marketing visual for "${parsed.productName}" — a ${parsed.descriptors.slice(0, 4).join(", ")} brand. Scene features ${subject}. ${style} Color palette: ${palette.join(", ")}. Designed for ${platformDims.label} social media (${aspectDesc}, ${platformDims.dims} pixels). Include space for text overlay. 8K resolution, photorealistic rendering, commercial advertising quality, depth of field, cinematic composition.`;
}

// ─── MAIN GENERATOR FUNCTION ─────────────────────────────────────────────────
function generateSmartContent(brand, platform, tone, format, generationCount) {
  const parsed = parseBrand(brand);
  const seed = hashString(brand + platform + tone + format) + generationCount * 7919;
  const rng = createRng(seed);

  // Pick headline
  const formulas = HEADLINE_FORMULAS[tone] || HEADLINE_FORMULAS.Profesional;
  const headline = pickRandom(shuffled(formulas, rng), rng)(parsed.productName, parsed.valueProp);

  // Pick subheadline
  const subFormulas = SUBHEADLINE_FORMULAS[tone] || SUBHEADLINE_FORMULAS.Profesional;
  const subheadline = pickRandom(shuffled(subFormulas, rng), rng)(parsed.benefits[0] || "", parsed.audiences[0] || "");

  // Pick body
  const bodyFormulas = BODY_FORMULAS[tone] || BODY_FORMULAS.Profesional;
  const body = pickRandom(shuffled(bodyFormulas, rng), rng)(
    parsed.productName,
    parsed.benefits[0] || "",
    parsed.audiences[0] || "",
    parsed.descriptors
  );

  // Pick CTA
  const ctas = CTA_BY_FORMAT[format] || CTA_BY_FORMAT.Producto;
  const cta = pickRandom(shuffled(ctas, rng), rng);

  // Generate hashtags: 2 from brand keywords + 2 from industry + 1 from format + 1 from platform + 1 bonus
  const brandHashtags = parsed.meaningfulWords
    .filter(w => w.length > 3)
    .map(w => w.toLowerCase().replace(/[^a-záéíóúñü]/gi, ""))
    .filter(w => w.length > 2);
  const industryTags = shuffled(INDUSTRY_HASHTAGS[parsed.detectedIndustry] || INDUSTRY_HASHTAGS.general, rng);
  const formatTags = shuffled(FORMAT_HASHTAGS[format] || FORMAT_HASHTAGS.Producto, rng);
  const platTags = shuffled(PLATFORM_HASHTAGS[platform] || PLATFORM_HASHTAGS.instagram, rng);

  const allTags = [];
  const seen = new Set();
  const addTag = (t) => { if (t && !seen.has(t)) { seen.add(t); allTags.push(t); } };
  shuffled(brandHashtags, rng).slice(0, 2).forEach(addTag);
  industryTags.slice(0, 2).forEach(addTag);
  formatTags.slice(0, 1).forEach(addTag);
  platTags.slice(0, 1).forEach(addTag);
  // Fill to at least 5
  [...industryTags, ...formatTags, ...brandHashtags].forEach(t => { if (allTags.length < 5) addTag(t); });
  const hashtags = allTags.slice(0, 7);

  // Color palette
  let palettes;
  if (tone === "Minimalista") {
    palettes = TONE_PALETTE_ADJUSTMENTS.Minimalista;
  } else {
    palettes = INDUSTRY_PALETTES[parsed.detectedIndustry] || INDUSTRY_PALETTES.general;
  }
  const color_palette = pickRandom(shuffled(palettes, rng), rng);

  // Emojis
  const emojiOptions = EMOJI_SETS[tone] || EMOJI_SETS.Profesional;
  const emoji_set = pickRandom(shuffled(emojiOptions, rng), rng);

  // DALL-E prompt
  const dalle_prompt = buildDallePrompt(parsed, platform, tone, color_palette, rng);

  // Posting time
  const times = POSTING_TIMES[platform] || POSTING_TIMES.instagram;
  const posting_time = pickRandom(shuffled(times, rng), rng);

  return { headline, subheadline, body, cta, hashtags, emoji_set, dalle_prompt, color_palette, posting_time };
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: "#1E293B", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 8, padding: "10px 20px",
      color: "#4ADE80", fontSize: 13, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      opacity: visible ? 1 : 0,
      transition: "all 0.3s ease",
      pointerEvents: "none", zIndex: 999,
    }}>
      {message}
    </div>
  );
}

// ─── MOCK VISUAL (simula imagen DALL-E con gradiente basado en colores) ────────
function MockVisual({ colors, headline, platform, loading, loadingStep }) {
  const ratio = PLATFORMS.find(p => p.id === platform)?.ratio || "1:1";
  const [w, h] = ratio === "1:1" ? [1, 1] : ratio === "16:9" ? [16, 9] : [1.91, 1];
  const paddingBottom = `${(h / w) * 100}%`;

  const safeColors = (colors || []).map((c, i) => safeHex(c, ["#1a1a2e", "#16213e", "#0f3460"][i]));

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom, borderRadius: 12, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: loading
          ? "linear-gradient(135deg, #1a1a2e, #16213e)"
          : `linear-gradient(135deg, ${safeColors[0] || "#1a1a2e"}, ${safeColors[1] || "#16213e"}, ${safeColors[2] || "#0f3460"})`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transition: "background 1s ease",
      }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            {/* Progress bar */}
            <div style={{
              width: 160, height: 4, borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              margin: "0 auto 16px", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg, #E8C547, #D4A017)",
                animation: "progressAnim 1.5s ease infinite",
              }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "sans-serif", margin: 0 }}>
              {loadingStep || "Generando visual..."}
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
function CopyCard({ label, content, accent, onCopied }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(Array.isArray(content) ? content.map(t => `#${t}`).join(" ") : content);
    setCopied(true);
    if (onCopied) onCopied(`"${label}" copiado al portapapeles`);
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
  const [loadingStep, setLoadingStep] = useState("");
  const [toast, setToast] = useState({ message: "", visible: false });
  const [generationCount, setGenerationCount] = useState(0);

  // Ref to track if generation was cancelled by settings change
  const generationIdRef = useRef(0);

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 2200);
  };

  const brandTooShort = brand.trim().length > 0 && brand.trim().length < BRAND_MIN;
  const canGenerate = brand.trim().length >= BRAND_MIN && !loading;

  const getDisabledReason = () => {
    if (loading) return "Generando contenido...";
    if (!brand.trim()) return "Describe tu producto para generar";
    if (brandTooShort) return `Mínimo ${BRAND_MIN} caracteres (faltan ${BRAND_MIN - brand.trim().length})`;
    return "";
  };

  const generate = async (isRegenerate = false) => {
    if (!canGenerate) return;
    const currentGenId = ++generationIdRef.current;
    const nextCount = isRegenerate ? generationCount + 1 : 0;
    setGenerationCount(nextCount);
    setLoading(true);
    setError("");
    setResult(null);

    // Smart generation mode — no API key needed
    const useDemoMode = true;

    if (useDemoMode) {
      // Stepped loading animation
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        if (generationIdRef.current !== currentGenId) return; // cancelled
        setLoadingStep(LOADING_STEPS[i]);
        await new Promise(r => setTimeout(r, 500));
      }
      if (generationIdRef.current !== currentGenId) return; // cancelled

      const smartResults = generateSmartContent(brand, platform, tone, format, nextCount);
      setResult(smartResults);
      setActiveTab("copy");
      setLoading(false);
      setLoadingStep("");
      return;
    }

    try {
      setLoadingStep(LOADING_STEPS[0]);
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

      if (generationIdRef.current !== currentGenId) return;
      setLoadingStep(LOADING_STEPS[1]);

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (generationIdRef.current !== currentGenId) return;
      setLoadingStep(LOADING_STEPS[2]);
      await new Promise(r => setTimeout(r, 300));

      setResult(parsed);
      setActiveTab("copy");
    } catch (_e) {
      if (generationIdRef.current !== currentGenId) return;
      setError("Error generando contenido. Verifica tu conexión e intenta de nuevo.");
    } finally {
      if (generationIdRef.current === currentGenId) {
        setLoading(false);
        setLoadingStep("");
      }
    }
  };

  const handlePlatformChange = (id) => {
    if (loading) return; // Prevent platform change while generating
    setPlatform(id);
  };

  const exportAll = () => {
    if (!result) return;
    const text = [
      `=== ContentStudio — ${PLATFORMS.find(p => p.id === platform)?.label} ===`,
      "",
      `HEADLINE: ${result.headline}`,
      `SUBHEADLINE: ${result.subheadline}`,
      "",
      `CUERPO:`,
      result.body,
      "",
      `CTA: ${result.cta}`,
      "",
      `HASHTAGS: ${(result.hashtags || []).map(t => `#${t}`).join(" ")}`,
      "",
      `PALETA: ${(result.color_palette || []).join(" | ")}`,
      `EMOJIS: ${(result.emoji_set || []).join(" ")}`,
      "",
      `DALL-E PROMPT:`,
      result.dalle_prompt,
      "",
      `MEJOR HORARIO:`,
      result.posting_time,
    ].join("\n");

    navigator.clipboard.writeText(text);
    showToast("Todo el contenido exportado al portapapeles");
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
        @keyframes progressAnim {
          0%   { width: 0%; }
          50%  { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes tabFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.85; }
        textarea:focus, input:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <Toast message={toast.message} visible={toast.visible} />

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace",
                }}>
                  Producto o Servicio
                </label>
                <span style={{
                  fontSize: 10, fontFamily: "'DM Mono', monospace",
                  color: brand.length > BRAND_MAX ? "#F87171" : brand.length >= BRAND_MIN ? "#4ADE80" : "rgba(255,255,255,0.25)",
                }}>
                  {brand.length}/{BRAND_MAX}
                </span>
              </div>
              <textarea
                value={brand}
                onChange={e => {
                  if (e.target.value.length <= BRAND_MAX) setBrand(e.target.value);
                }}
                placeholder="Ej: App de meditación para profesionales con IA adaptativa, reduce el estrés en 10 minutos al día..."
                rows={4}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${brandTooShort ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10, padding: "12px 14px",
                  color: "#F8F4E8", fontSize: 13, lineHeight: 1.6,
                  fontFamily: "'DM Sans', sans-serif",
                  resize: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = brandTooShort ? "rgba(248,113,113,0.6)" : `${accent}60`}
                onBlur={e => e.target.style.borderColor = brandTooShort ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}
              />
              {brandTooShort && (
                <p style={{
                  margin: "6px 0 0", fontSize: 11, color: "#FCA5A5",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Describe tu producto con al menos 10 caracteres
                </p>
              )}
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
                  <button key={p.id} onClick={() => handlePlatformChange(p.id)} style={{
                    background: platform === p.id ? `${accent}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${platform === p.id ? accent : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8, padding: "8px 10px",
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: "all 0.2s",
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
                      <button key={o} onClick={() => { if (!loading) setter(o); }} style={{
                        background: value === o ? `${accent}15` : "none",
                        border: `1px solid ${value === o ? accent : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 6, padding: "6px 10px",
                        fontSize: 12, color: value === o ? accent : "#6B7280",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.5 : 1,
                        textAlign: "left",
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
              onClick={() => generate(false)}
              disabled={!canGenerate}
              style={{
                width: "100%", padding: "14px",
                background: canGenerate
                  ? `linear-gradient(135deg, ${accent}, #D4A017)`
                  : "rgba(255,255,255,0.06)",
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                color: canGenerate ? "#0C0C14" : "#4B5563",
                cursor: canGenerate ? "pointer" : "default",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
                boxShadow: canGenerate ? `0 0 24px ${accent}40` : "none",
              }}
            >
              {loading ? loadingStep || "Generando contenido..." : "⚡ Generar Contenido"}
            </button>
            {!canGenerate && !loading && (
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                {getDisabledReason()}
              </p>
            )}

            {error && (
              <div style={{
                marginTop: 12, padding: "12px 16px",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 10, textAlign: "center",
              }}>
                <p style={{ color: "#FCA5A5", fontSize: 12, margin: "0 0 8px" }}>{error}</p>
                <button onClick={() => generate(false)} style={{
                  background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: 6, padding: "6px 16px", cursor: "pointer",
                  fontSize: 12, color: "#FCA5A5", fontFamily: "'DM Sans', sans-serif",
                }}>
                  Reintentar
                </button>
              </div>
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
                loadingStep={loadingStep}
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

                <div key={activeTab} style={{ animation: "tabFade 0.25s ease" }}>
                  {activeTab === "copy" && (
                    <div>
                      <CopyCard label="Headline" content={result.headline} accent={accent} onCopied={showToast} />
                      <CopyCard label="Subheadline" content={result.subheadline} accent={accent} onCopied={showToast} />
                      <CopyCard label="Cuerpo" content={result.body} accent={accent} onCopied={showToast} />
                      <CopyCard label="CTA" content={result.cta} accent={accent} onCopied={showToast} />
                      <CopyCard label="Hashtags" content={result.hashtags} accent={accent} onCopied={showToast} />
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
                          {result.color_palette?.map((c, i) => {
                            const safe = safeHex(c, ["#1a1a2e", "#16213e", "#0f3460"][i]);
                            return (
                              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ height: 40, borderRadius: 6, background: safe, marginBottom: 4 }} />
                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{safe}</span>
                              </div>
                            );
                          })}
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

                {/* Regenerar + Copiar todo */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => generate(true)} disabled={loading} style={{
                    flex: 1, padding: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    color: "#E2E8F0", cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                    opacity: loading ? 0.5 : 1,
                  }}>
                    Regenerar
                    {generationCount > 0 && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                        #{generationCount + 1}
                      </span>
                    )}
                  </button>
                  <button onClick={exportAll} style={{
                    flex: 1, padding: "10px",
                    background: "rgba(232,197,71,0.08)",
                    border: `1px solid ${accent}30`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    color: accent, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}>
                    Copiar todo
                  </button>
                </div>
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
