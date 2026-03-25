import { useState, useRef, useEffect, useCallback } from "react";

// ─── ONBOARDING TOUR ────────────────────────────────────────────────────────
const TOUR_TEXT = {
  en: {
    welcomeTitle: "ContentStudio AI \u2014 Multi-Channel Content Generator",
    welcomeBody: "Generate optimized marketing content for Instagram, Twitter/X, LinkedIn, and Facebook. Choose from 5 tones and 5 formats, get AI-generated copy with color palettes and DALL-E image prompts.\n\nLet me show you how!",
    startTour: "Start Tour \u2192",
    skipTour: "Skip",
    skipLabel: "Skip Tour",
    tryIt: "Try it \u2192",
    next: "Next \u2192",
    generate: "Generate \u2192",
    finish: "Finish Tour \u2713",
    step1Title: "Choose a Platform",
    step1Body: "Select which social network to generate content for. Each platform has optimized dimensions and formats.",
    step2Title: "Tone + Format",
    step2Body: "Pick a tone (Professional, Inspiring, Urgent, Fun, Minimalist) and a format (Product, Service, Event, Offer, Branding).",
    step3Title: "Describe Your Brand",
    step3Body: "Enter a description of your product or service. The more detail you give, the better the generated content.",
    step4Title: "Generate Content",
    step4Body: "Click Generate to create your content. The AI analyzes your brand and produces optimized copy.",
    step5Title: "Preview Results",
    step5Body: "Here you can see the generated headline, body, CTA, and hashtags. Each card is individually copyable.",
    step6Title: "Color Palette + DALL-E",
    step6Body: "The Visual tab shows your auto-generated color palette and a ready-to-use DALL-E 3 image prompt.",
    step7Title: "A/B Variants",
    step7Body: "Generate alternative versions to compare headlines, CTAs, and body copy side by side.",
    step8Title: "You're All Set!",
    step8Body: "Explore history to revisit past generations, export content as JSON or Markdown, and add your Claude API key for real AI-powered generation. Enjoy!",
    sampleBrand: "Meditation app for professionals with adaptive AI that reduces stress in 10 minutes a day, featuring personalized sessions and progress tracking",
    stepOf: (c, t) => `${c} / ${t}`,
  },
  es: {
    welcomeTitle: "ContentStudio AI \u2014 Generador de Contenido Multicanal",
    welcomeBody: "Genera contenido de marketing optimizado para Instagram, Twitter/X, LinkedIn y Facebook. Elige entre 5 tonos y 5 formatos, obt\u00e9n copy generado por IA con paletas de colores y prompts para DALL-E.\n\n\u00a1D\u00e9jame mostrarte c\u00f3mo!",
    startTour: "Iniciar Tour \u2192",
    skipTour: "Omitir",
    skipLabel: "Omitir Tour",
    tryIt: "Probar \u2192",
    next: "Siguiente \u2192",
    generate: "Generar \u2192",
    finish: "Finalizar Tour \u2713",
    step1Title: "Elige una Plataforma",
    step1Body: "Selecciona la red social para la que quieres generar contenido. Cada plataforma tiene dimensiones y formatos optimizados.",
    step2Title: "Tono + Formato",
    step2Body: "Elige un tono (Profesional, Inspirador, Urgente, Divertido, Minimalista) y un formato (Producto, Servicio, Evento, Oferta, Branding).",
    step3Title: "Describe tu Marca",
    step3Body: "Ingresa una descripci\u00f3n de tu producto o servicio. Mientras m\u00e1s detalle des, mejor ser\u00e1 el contenido generado.",
    step4Title: "Generar Contenido",
    step4Body: "Haz clic en Generar para crear tu contenido. La IA analiza tu marca y produce copy optimizado.",
    step5Title: "Vista Previa de Resultados",
    step5Body: "Aqu\u00ed puedes ver el headline, cuerpo, CTA y hashtags generados. Cada tarjeta se puede copiar individualmente.",
    step6Title: "Paleta de Colores + DALL-E",
    step6Body: "La pesta\u00f1a Visual muestra tu paleta de colores auto-generada y un prompt listo para usar con DALL-E 3.",
    step7Title: "Variantes A/B",
    step7Body: "Genera versiones alternativas para comparar headlines, CTAs y body copy lado a lado.",
    step8Title: "\u00a1Todo Listo!",
    step8Body: "Explora el historial para revisitar generaciones anteriores, exporta contenido como JSON o Markdown, y agrega tu clave API de Claude para generaci\u00f3n real con IA. \u00a1Disfruta!",
    sampleBrand: "App de meditaci\u00f3n para profesionales con IA adaptativa que reduce el estr\u00e9s en 10 minutos al d\u00eda, con sesiones personalizadas y seguimiento de progreso",
    stepOf: (c, t) => `${c} / ${t}`,
  },
};

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const UI = {
  es: {
    headerSub: "Genera copy + visual para redes sociales en segundos",
    productLabel: "Producto o Servicio",
    placeholder: "Ej: App de meditaci\u00f3n para profesionales con IA adaptativa, reduce el estr\u00e9s en 10 minutos al d\u00eda...",
    platformLabel: "Plataforma",
    toneLabel: "Tono",
    formatLabel: "Formato",
    generateBtn: "Generar Contenido",
    generatingBtn: "Generando contenido...",
    generatingVisual: "Generando visual...",
    defaultHeadline: "Tu contenido aqu\u00ed",
    copied: "Copiado",
    copy: "Copiar",
    copiedToClipboard: (label) => `"${label}" copiado al portapapeles`,
    errorMsg: "Error generando contenido. Verifica tu conexi\u00f3n e intenta de nuevo.",
    retry: "Reintentar",
    previewLabel: "Vista Previa",
    bodyLabel: "Cuerpo",
    colorPalette: "Paleta de Colores",
    dallePromptLabel: "Prompt DALL-E 3",
    bestTime: "Mejor Momento para Publicar",
    tip: "Integra este generador con Make.com para programar publicaciones autom\u00e1ticas en Buffer o Hootsuite directamente desde el flujo de trabajo.",
    emptyState: "EL CONTENIDO APARECER\u00c1 AQU\u00cd",
    describeMin: (min, remaining) => `Describe tu producto con al menos ${min} caracteres (faltan ${remaining})`,
    describePrompt: "Describe tu producto para generar",
    minChars: (min, remaining) => `M\u00ednimo ${min} caracteres (faltan ${remaining})`,
    regenerate: "Regenerar",
    copyAll: "Copiar todo",
    allExported: "Todo el contenido exportado al portapapeles",
    bodyExport: "CUERPO",
    bestTimeExport: "MEJOR HORARIO",
    ctaBar: "Esto es una demo gratuita de Impulso IA -- \u00bfQuieres algo as\u00ed para tu negocio?",
    ctaTalk: "Platiquemos",
    loadingSteps: ["Analizando tu marca...", "Generando copy...", "Creando paleta visual..."],
    userMsg: (brand) => `Genera contenido de marketing para: ${brand}`,
    apiKeyLabel: "Clave API (Claude)",
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyHint: "Opcional: agrega tu clave de Anthropic para IA real",
    aiMode: "Modo IA",
    templateMode: "Modo Plantillas",
    aiBadge: "IA",
    aiToolUseBadge: "IA Tool Use",
    templateBadge: "Smart Templates",
    historyTitle: "Historial",
    clearHistory: "Limpiar historial",
    noHistory: "Sin historial",
    generateVariants: "Generar Variantes",
    variantLabel: (n) => `Opci\u00f3n ${String.fromCharCode(65 + n)}`,
    pickFavorite: "Favorita",
    exportJSON: "Exportar JSON",
    exportMD: "Exportar Markdown",
    statsTitle: "Estad\u00edsticas",
    totalGens: "generaciones",
    mostPlatform: "Plataforma top",
    mostTone: "Tono top",
    aiRatio: "IA vs Plantillas",
    toneNames: { Profesional: "Profesional", Inspirador: "Inspirador", Urgente: "Urgente", Divertido: "Divertido", Minimalista: "Minimalista" },
    formatNames: { Producto: "Producto", Servicio: "Servicio", Evento: "Evento", Oferta: "Oferta", Branding: "Branding" },
    tabCopy: "Copy", tabVisual: "Visual", tabTiming: "Horario",
  },
  en: {
    headerSub: "Generate copy + visuals for social media in seconds",
    productLabel: "Product or Service",
    placeholder: "E.g.: Meditation app for professionals with adaptive AI, reduces stress in 10 minutes a day...",
    platformLabel: "Platform",
    toneLabel: "Tone",
    formatLabel: "Format",
    generateBtn: "Generate Content",
    generatingBtn: "Generating content...",
    generatingVisual: "Generating visual...",
    defaultHeadline: "Your content here",
    copied: "Copied",
    copy: "Copy",
    copiedToClipboard: (label) => `"${label}" copied to clipboard`,
    errorMsg: "Error generating content. Check your connection and try again.",
    retry: "Retry",
    previewLabel: "Preview",
    bodyLabel: "Body",
    colorPalette: "Color Palette",
    dallePromptLabel: "DALL-E 3 Prompt",
    bestTime: "Best Time to Post",
    tip: "Integrate this generator with Make.com to schedule automatic posts on Buffer or Hootsuite directly from the workflow.",
    emptyState: "CONTENT WILL APPEAR HERE",
    describeMin: (min, remaining) => `Describe your product with at least ${min} characters (${remaining} remaining)`,
    describePrompt: "Describe your product to generate",
    minChars: (min, remaining) => `Minimum ${min} characters (${remaining} remaining)`,
    regenerate: "Regenerate",
    copyAll: "Copy all",
    allExported: "All content exported to clipboard",
    bodyExport: "BODY",
    bestTimeExport: "BEST TIME",
    ctaBar: "This is a free demo by Impulso IA -- Want something like this for your business?",
    ctaTalk: "Let's talk",
    loadingSteps: ["Analyzing your brand...", "Generating copy...", "Creating visual palette..."],
    userMsg: (brand) => `Generate marketing content for: ${brand}`,
    apiKeyLabel: "API Key (Claude)",
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyHint: "Optional: add your Anthropic key for real AI generation",
    aiMode: "AI Mode",
    templateMode: "Template Mode",
    aiBadge: "AI",
    aiToolUseBadge: "AI Tool Use",
    templateBadge: "Smart Templates",
    historyTitle: "History",
    clearHistory: "Clear history",
    noHistory: "No history yet",
    generateVariants: "Generate Variants",
    variantLabel: (n) => `Option ${String.fromCharCode(65 + n)}`,
    pickFavorite: "Favorite",
    exportJSON: "Export JSON",
    exportMD: "Export Markdown",
    statsTitle: "Stats",
    totalGens: "generations",
    mostPlatform: "Top platform",
    mostTone: "Top tone",
    aiRatio: "AI vs Templates",
    toneNames: { Profesional: "Professional", Inspirador: "Inspiring", Urgente: "Urgent", Divertido: "Fun", Minimalista: "Minimalist" },
    formatNames: { Producto: "Product", Servicio: "Service", Evento: "Event", Oferta: "Offer", Branding: "Branding" },
    tabCopy: "Copy", tabVisual: "Visual", tabTiming: "Timing",
  },
};

// ─── PLATAFORMAS ──────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "\ud83d\udcf8", dims: "1080\u00d71080", ratio: "1:1" },
  { id: "twitter",   label: "Twitter/X",  icon: "\ud835\udd4f",  dims: "1200\u00d7675",  ratio: "16:9" },
  { id: "linkedin",  label: "LinkedIn",   icon: "\ud83d\udcbc", dims: "1200\u00d7627",  ratio: "1.91:1" },
  { id: "facebook",  label: "Facebook",   icon: "\ud83d\udc65", dims: "1200\u00d7630",  ratio: "1.91:1" },
];

const TONES = ["Profesional", "Inspirador", "Urgente", "Divertido", "Minimalista"];
const FORMATS = ["Producto", "Servicio", "Evento", "Oferta", "Branding"];

const BRAND_MIN = 10;
const BRAND_MAX = 500;

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
  const lower = text.toLowerCase();
  const words = text.split(/\s+/);

  // Product name: quoted text, or first significant phrase up to 4 words
  const quotedMatch = text.match(/[""\u201C]([^""\u201D]+)[""\u201D]/) || text.match(/"([^"]+)"/);
  const stopwords = new Set(["de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "e", "a", "en", "con", "por", "para", "que", "es", "su", "se", "al", "lo", "más", "muy", "sin", "ni", "como", "nos", "te", "mi", "tu", "ser", "está", "son"]);
  const meaningfulWords = words.filter(w => !stopwords.has(w.toLowerCase()) && w.length > 2);
  const productName = quotedMatch ? quotedMatch[1] : words.slice(0, Math.min(4, words.length)).join(" ");

  // Extract benefit (after "que", "that", "which")
  const benefitMatch = text.match(/(?:que|that|which)\s+(.{10,60}?)(?:\.|,|$)/i);
  const benefit = benefitMatch ? benefitMatch[1].trim() : "";

  // Extract audience (after "para", "for")
  const audienceMatch = text.match(/(?:para|for)\s+(.{5,40}?)(?:\s+(?:que|con|with|that)|,|\.|$)/i);
  const audience = audienceMatch ? audienceMatch[1].trim() : "";

  // Extract key descriptors
  const descriptorWords = ["innovador","adaptativa","inteligente","personalizado","profesional","premium","avanzado","automatizado","smart","intelligent","personalized","advanced","automated","innovative","AI","IA","rápido","eficiente","seguro","moderno","único","exclusivo","potente","fácil","simple","completo","escalable","colaborativo","interactivo","dinámico"];
  const descriptors = descriptorWords.filter(d => lower.includes(d.toLowerCase()));

  // Extract numbers/stats
  const numbers = text.match(/\d+\s*(?:minutos?|minutes?|horas?|hours?|días?|days?|%|usuarios?|users?|sesiones?|sessions?)/gi) || [];

  // Benefits: words/phrases after benefit-indicating verbs (keep for compatibility)
  const benefitPatterns = /(?:que|para|con|permite|ayuda a?|logra|ofrece|brinda|genera|mejora|reduce|aumenta|optimiza|facilita|transforma|elimina|garantiza|asegura)\s+([^,.;]+)/gi;
  const benefits = [];
  let m;
  while ((m = benefitPatterns.exec(text)) !== null) {
    const b = m[1].trim();
    if (b.length > 3 && b.split(/\s+/).length <= 10) benefits.push(b);
  }

  // Target audience keywords (keep for compatibility)
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

  // Value proposition: try to extract the core promise
  const valueMatch = text.match(/(?:que\s+)(.{10,60}?)(?:\.|,|$)/i);
  const valueProp = valueMatch ? valueMatch[1].trim() : (benefits[0] || meaningfulWords.filter(w => w.length > 3).slice(0, 4).join(" "));

  return { productName, benefit, audience, descriptors, numbers, benefits, audiences, detectedIndustry, valueProp, meaningfulWords, raw: text };
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

// ─── SMART HEADLINE GENERATOR ───────────────────────────────────────────────
function generateSmartHeadline(brand, tone, format, lang, rng) {
  const { productName, benefit, audience, descriptors, numbers } = brand;

  const templates = {
    professional: {
      es: [
        benefit ? `${productName}: ${benefit.charAt(0).toUpperCase() + benefit.slice(1)}` : `${productName} — La Solución Profesional`,
        audience ? `Diseñado para ${audience}` : `La herramienta que tu equipo necesita`,
        numbers[0] ? `${productName}: Resultados en ${numbers[0]}` : `${productName}: Resultados que importan`,
        benefit ? `${productName} — ${benefit.charAt(0).toUpperCase() + benefit.slice(1)}` : `${productName}: Eficiencia Comprobada`,
      ],
      en: [
        benefit ? `${productName}: ${benefit.charAt(0).toUpperCase() + benefit.slice(1)}` : `${productName} — The Professional Solution`,
        audience ? `Built for ${audience}` : `The tool your team needs`,
        numbers[0] ? `${productName}: Results in ${numbers[0]}` : `${productName}: Results that matter`,
        benefit ? `${productName} — ${benefit.charAt(0).toUpperCase() + benefit.slice(1)}` : `${productName}: Proven Efficiency`,
      ]
    },
    inspirational: {
      es: [
        `Transforma tu ${audience || 'día'} con ${productName}`,
        benefit ? `Imagina ${benefit}` : `El cambio empieza aquí`,
        `${productName}: Más que una herramienta, una experiencia`,
        audience ? `${audience}: Tu próximo gran paso es ${productName}` : `${productName}: Donde comienzan los grandes cambios`,
      ],
      en: [
        `Transform your ${audience || 'day'} with ${productName}`,
        benefit ? `Imagine ${benefit}` : `Change starts here`,
        `${productName}: More than a tool, an experience`,
        audience ? `${audience}: Your next big step is ${productName}` : `${productName}: Where great changes begin`,
      ]
    },
    urgent: {
      es: [
        `¡No esperes más! ${productName} ya está aquí`,
        numbers[0] ? `Solo ${numbers[0]} para ver resultados` : `Resultados desde el primer día`,
        audience ? `${audience}: Esta es tu oportunidad` : `Tu oportunidad es ahora`,
        benefit ? `Últimos lugares: ${benefit}` : `${productName} — Oferta por tiempo limitado`,
      ],
      en: [
        `Don't wait! ${productName} is here`,
        numbers[0] ? `Just ${numbers[0]} to see results` : `Results from day one`,
        audience ? `${audience}: This is your chance` : `Your opportunity is now`,
        benefit ? `Last spots: ${benefit}` : `${productName} — Limited time offer`,
      ]
    },
    fun: {
      es: [
        `${productName}: Porque la vida es mejor con tecnología 🚀`,
        benefit ? `¿Y si pudieras ${benefit}? Ahora puedes` : `Prepárate para lo increíble`,
        `Dale un upgrade a tu ${audience || 'rutina'}`,
        `${productName} — Tu nuevo favorito oficial 🎉`,
      ],
      en: [
        `${productName}: Because life is better with tech 🚀`,
        benefit ? `What if you could ${benefit}? Now you can` : `Get ready for something amazing`,
        `Upgrade your ${audience || 'routine'}`,
        `${productName} — Your new favorite thing 🎉`,
      ]
    },
    minimalist: {
      es: [
        productName,
        benefit ? benefit.charAt(0).toUpperCase() + benefit.slice(1) : `Simple. Efectivo. ${productName}`,
        audience ? `Para ${audience}` : `Menos es más`,
        `${productName}. Nada sobra.`,
      ],
      en: [
        productName,
        benefit ? benefit.charAt(0).toUpperCase() + benefit.slice(1) : `Simple. Effective. ${productName}`,
        audience ? `For ${audience}` : `Less is more`,
        `${productName}. Nothing wasted.`,
      ]
    }
  };

  const toneMap = { 'profesional': 'professional', 'inspirador': 'inspirational', 'urgente': 'urgent', 'divertido': 'fun', 'minimalista': 'minimalist', 'professional': 'professional', 'inspirational': 'inspirational', 'urgent': 'urgent', 'fun': 'fun', 'minimalist': 'minimalist' };
  const toneKey = toneMap[tone.toLowerCase()] || 'professional';
  const langKey = (lang === 'en') ? 'en' : 'es';
  const toneTemplates = templates[toneKey]?.[langKey] || templates.professional[langKey];

  return pickRandom(shuffled(toneTemplates, rng), rng);
}

// ─── SMART SUBHEADLINE GENERATOR ────────────────────────────────────────────
function generateSmartSubheadline(brand, tone, lang, rng) {
  const { productName, benefit, audience, descriptors, numbers } = brand;
  const langKey = (lang === 'en') ? 'en' : 'es';

  const templates = {
    es: [
      audience && benefit ? `La solución para ${audience} que necesitan ${benefit}` : null,
      audience ? `Creado especialmente para ${audience}` : null,
      benefit ? `Descubre cómo ${benefit} puede cambiar todo` : null,
      descriptors.length ? `Con tecnología ${descriptors.slice(0, 2).join(' y ')}` : null,
      numbers[0] ? `Resultados comprobados: ${numbers[0]}` : null,
      `${productName} — la herramienta que marca la diferencia`,
    ],
    en: [
      audience && benefit ? `The solution for ${audience} who need ${benefit}` : null,
      audience ? `Built specifically for ${audience}` : null,
      benefit ? `Discover how ${benefit} can change everything` : null,
      descriptors.length ? `Powered by ${descriptors.slice(0, 2).join(' & ')} technology` : null,
      numbers[0] ? `Proven results: ${numbers[0]}` : null,
      `${productName} — the tool that makes the difference`,
    ]
  };

  const candidates = (templates[langKey] || templates.es).filter(Boolean);
  return pickRandom(shuffled(candidates, rng), rng);
}

// ─── SMART BODY GENERATOR ───────────────────────────────────────────────────
function generateSmartBody(brand, tone, format, lang, rng) {
  const { productName, benefit, audience, descriptors, numbers } = brand;

  const parts = [];

  if (lang === 'en') {
    if (audience) parts.push(`Built specifically for ${audience}.`);
    if (benefit) parts.push(`${productName} lets you ${benefit}.`);
    if (descriptors.length) parts.push(`Powered by ${descriptors.join(', ')} technology.`);
    if (numbers.length) parts.push(`Proven results: ${numbers.join(', ')}.`);
    if (!parts.length) parts.push(`${productName} is the solution you've been looking for. Discover how it can transform the way you work.`);
  } else {
    if (audience) parts.push(`Diseñado especialmente para ${audience}.`);
    if (benefit) parts.push(`${productName} te permite ${benefit}.`);
    if (descriptors.length) parts.push(`Con tecnología ${descriptors.join(', ')}.`);
    if (numbers.length) parts.push(`Resultados comprobados: ${numbers.join(', ')}.`);
    if (!parts.length) parts.push(`${productName} es la solución que estabas buscando. Descubre cómo puede transformar tu forma de trabajar.`);
  }

  return parts.join(' ');
}

// ─── SMART CTA GENERATOR ───────────────────────────────────────────────────
function generateSmartCTA(brand, format, lang, rng) {
  const { productName, numbers } = brand;

  const ctas = {
    es: {
      Producto: [`Descubre ${productName}`, 'Lo quiero ahora', 'Ver producto'],
      Servicio: ['Agenda tu consulta gratis', 'Solicita una demo', 'Empieza gratis'],
      Evento: ['Reserva tu lugar ahora', 'Inscríbete ya', 'Quiero asistir'],
      Oferta: [numbers[0] ? `Prueba gratis por ${numbers[0]}` : 'Empieza gratis hoy', 'Aprovechar oferta', 'Activar promoción'],
      Branding: [`Conoce ${productName}`, 'Descubre nuestra historia', 'Únete al movimiento'],
    },
    en: {
      Producto: [`Discover ${productName}`, 'I want it now', 'View product'],
      Servicio: ['Book your free consultation', 'Request a demo', 'Start free'],
      Evento: ['Reserve your spot now', 'Sign up now', 'I want to attend'],
      Oferta: [numbers[0] ? `Try free for ${numbers[0]}` : 'Start free today', 'Grab this offer', 'Activate promotion'],
      Branding: [`Meet ${productName}`, 'Discover our story', 'Join the movement'],
    }
  };

  const langKey = (lang === 'en') ? 'en' : 'es';
  const formatCtas = ctas[langKey]?.[format] || ctas[langKey]?.Producto || ctas.es.Producto;
  return pickRandom(shuffled(formatCtas, rng), rng);
}

// ─── SMART HASHTAG GENERATOR ────────────────────────────────────────────────
function generateSmartHashtags(brand, lang, platform, format, rng) {
  const { productName, audience, descriptors } = brand;
  const tags = [];
  const seen = new Set();
  const addTag = (t) => { if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); tags.push(t); } };

  // From product name
  const cleanName = productName.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ0-9]/g, '');
  if (cleanName.length > 3) addTag(cleanName);

  // From descriptors
  descriptors.slice(0, 2).forEach(d => addTag(d.replace(/\s/g, '')));

  // From audience
  if (audience) {
    const cleanAud = audience.split(' ').slice(0, 2).join('').replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ]/g, '');
    if (cleanAud.length > 3) addTag(cleanAud);
  }

  // Industry + format + platform tags
  const industryTags = shuffled(INDUSTRY_HASHTAGS[brand.detectedIndustry] || INDUSTRY_HASHTAGS.general, rng);
  const formatTags = shuffled(FORMAT_HASHTAGS[format] || FORMAT_HASHTAGS.Producto, rng);
  const platTags = shuffled(PLATFORM_HASHTAGS[platform] || PLATFORM_HASHTAGS.instagram, rng);

  industryTags.slice(0, 2).forEach(addTag);
  formatTags.slice(0, 1).forEach(addTag);
  platTags.slice(0, 1).forEach(addTag);

  // Fill with generic relevant tags if needed
  const genericES = ['Innovación', 'Tecnología', 'NegociosDigitales', 'Productividad', 'Emprendimiento'];
  const genericEN = ['Innovation', 'Technology', 'DigitalBusiness', 'Productivity', 'Entrepreneurship'];
  const generic = lang === 'en' ? genericEN : genericES;
  let gi = 0;
  while (tags.length < 5 && gi < generic.length) { addTag(generic[gi]); gi++; }

  return tags.slice(0, 7);
}

// ─── MAIN GENERATOR FUNCTION ─────────────────────────────────────────────────
function generateSmartContent(brand, platform, tone, format, generationCount, lang) {
  const parsed = parseBrand(brand);
  const seed = hashString(brand + platform + tone + format) + generationCount * 7919;
  const rng = createRng(seed);

  // Detect language from UI lang parameter, fallback to content detection
  const detectedLang = lang || (parsed.raw.match(/\b(the|for|with|and|that|which)\b/i) ? 'en' : 'es');

  // Smart headline from actual brand content
  const headline = generateSmartHeadline(parsed, tone, format, detectedLang, rng);

  // Smart subheadline from actual brand content
  const subheadline = generateSmartSubheadline(parsed, tone, detectedLang, rng);

  // Smart body from actual brand content
  const body = generateSmartBody(parsed, tone, format, detectedLang, rng);

  // Smart CTA from actual brand content
  const cta = generateSmartCTA(parsed, format, detectedLang, rng);

  // Smart hashtags from actual brand content
  const hashtags = generateSmartHashtags(parsed, detectedLang, platform, format, rng);

  // Color palette (kept as-is — works well)
  let palettes;
  if (tone === "Minimalista") {
    palettes = TONE_PALETTE_ADJUSTMENTS.Minimalista;
  } else {
    palettes = INDUSTRY_PALETTES[parsed.detectedIndustry] || INDUSTRY_PALETTES.general;
  }
  const color_palette = pickRandom(shuffled(palettes, rng), rng);

  // Emojis (kept as-is)
  const emojiOptions = EMOJI_SETS[tone] || EMOJI_SETS.Profesional;
  const emoji_set = pickRandom(shuffled(emojiOptions, rng), rng);

  // DALL-E prompt (kept as-is — works well)
  const dalle_prompt = buildDallePrompt(parsed, platform, tone, color_palette, rng);

  // Posting time (kept as-is)
  const times = POSTING_TIMES[platform] || POSTING_TIMES.instagram;
  const posting_time = pickRandom(shuffled(times, rng), rng);

  return { headline, subheadline, body, cta, hashtags, emoji_set, dalle_prompt, color_palette, posting_time };
}

// ─── CLAUDE TOOL USE ─────────────────────────────────────────────────────────
const CONTENT_TOOLS = [
  {
    name: "analyze_brand",
    description: "Parse a brand description to extract structured information: product name, industry, benefits, target audience, and key descriptors.",
    input_schema: {
      type: "object",
      properties: {
        brand_description: { type: "string", description: "The raw brand/product description from the user" },
      },
      required: ["brand_description"],
    },
  },
  {
    name: "generate_copy",
    description: "Generate platform-specific marketing copy including headline, subheadline, body text, CTA, and hashtags.",
    input_schema: {
      type: "object",
      properties: {
        product_name: { type: "string" },
        industry: { type: "string" },
        benefits: { type: "array", items: { type: "string" } },
        target_audience: { type: "string" },
        descriptors: { type: "array", items: { type: "string" } },
        platform: { type: "string", enum: ["instagram", "twitter", "linkedin", "facebook"] },
        tone: { type: "string", enum: ["Profesional", "Inspirador", "Urgente", "Divertido", "Minimalista"] },
        format: { type: "string", enum: ["Producto", "Servicio", "Evento", "Oferta", "Branding"] },
      },
      required: ["product_name", "industry", "platform", "tone", "format"],
    },
  },
  {
    name: "suggest_colors",
    description: "Suggest a 3-color hex palette based on the industry and desired tone.",
    input_schema: {
      type: "object",
      properties: {
        industry: { type: "string" },
        tone: { type: "string" },
      },
      required: ["industry", "tone"],
    },
  },
  {
    name: "recommend_timing",
    description: "Recommend the best posting time for a given social media platform.",
    input_schema: {
      type: "object",
      properties: {
        platform: { type: "string", enum: ["instagram", "twitter", "linkedin", "facebook"] },
      },
      required: ["platform"],
    },
  },
  {
    name: "create_dalle_prompt",
    description: "Create a detailed DALL-E 3 image generation prompt based on brand info, platform, and color palette.",
    input_schema: {
      type: "object",
      properties: {
        product_name: { type: "string" },
        industry: { type: "string" },
        descriptors: { type: "array", items: { type: "string" } },
        platform: { type: "string" },
        tone: { type: "string" },
        color_palette: { type: "array", items: { type: "string" } },
      },
      required: ["product_name", "industry", "platform", "tone", "color_palette"],
    },
  },
];

function executeContentTool(toolName, toolInput) {
  const rng = createRng(hashString(JSON.stringify(toolInput)));

  switch (toolName) {
    case "analyze_brand": {
      const parsed = parseBrand(toolInput.brand_description || "");
      return {
        product_name: parsed.productName,
        industry: parsed.detectedIndustry,
        benefits: parsed.benefits.length > 0 ? parsed.benefits : ["mejora resultados", "ahorra tiempo"],
        target_audience: parsed.audiences[0] || "profesionales y empresas",
        descriptors: parsed.descriptors,
        value_proposition: parsed.valueProp,
      };
    }
    case "generate_copy": {
      const { product_name, industry, benefits, target_audience, descriptors, platform, tone, format } = toolInput;
      const seed = hashString(product_name + platform + tone + format);
      const localRng = createRng(seed);
      const formulas = HEADLINE_FORMULAS[tone] || HEADLINE_FORMULAS.Profesional;
      const headline = pickRandom(shuffled(formulas, localRng), localRng)(product_name, benefits?.[0] || "");
      const subFormulas = SUBHEADLINE_FORMULAS[tone] || SUBHEADLINE_FORMULAS.Profesional;
      const subheadline = pickRandom(shuffled(subFormulas, localRng), localRng)(benefits?.[0] || "", target_audience || "");
      const bodyFormulas = BODY_FORMULAS[tone] || BODY_FORMULAS.Profesional;
      const body = pickRandom(shuffled(bodyFormulas, localRng), localRng)(product_name, benefits?.[0] || "", target_audience || "", descriptors || []);
      const ctas = CTA_BY_FORMAT[format] || CTA_BY_FORMAT.Producto;
      const cta = pickRandom(shuffled(ctas, localRng), localRng);
      const industryTags = shuffled(INDUSTRY_HASHTAGS[industry] || INDUSTRY_HASHTAGS.general, localRng);
      const formatTags = shuffled(FORMAT_HASHTAGS[format] || FORMAT_HASHTAGS.Producto, localRng);
      const platTags = shuffled(PLATFORM_HASHTAGS[platform] || PLATFORM_HASHTAGS.instagram, localRng);
      const hashtags = [...new Set([...industryTags.slice(0, 3), ...formatTags.slice(0, 1), ...platTags.slice(0, 1)])].slice(0, 5);
      const emojiOptions = EMOJI_SETS[tone] || EMOJI_SETS.Profesional;
      const emoji_set = pickRandom(shuffled(emojiOptions, localRng), localRng);
      return { headline, subheadline, body, cta, hashtags, emoji_set };
    }
    case "suggest_colors": {
      const { industry, tone } = toolInput;
      let palettes;
      if (tone === "Minimalista") {
        palettes = TONE_PALETTE_ADJUSTMENTS.Minimalista;
      } else {
        palettes = INDUSTRY_PALETTES[industry] || INDUSTRY_PALETTES.general;
      }
      return { color_palette: pickRandom(shuffled(palettes, rng), rng) };
    }
    case "recommend_timing": {
      const times = POSTING_TIMES[toolInput.platform] || POSTING_TIMES.instagram;
      return { posting_time: pickRandom(shuffled(times, rng), rng) };
    }
    case "create_dalle_prompt": {
      const { product_name, industry, descriptors, platform, tone, color_palette } = toolInput;
      const parsed = { productName: product_name, detectedIndustry: industry, descriptors: descriptors || [] };
      return { dalle_prompt: buildDallePrompt(parsed, platform, tone, color_palette || ["#1a1a2e", "#16213e", "#0f3460"], rng) };
    }
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

async function generateWithToolUse(apiKey, brandDesc, platform, tone, format, lang) {
  try {
    const langLabel = lang === "en" ? "English" : "Spanish";
    let messages = [
      {
        role: "user",
        content: `You are a senior social media marketing expert. Generate compelling content for this brand.

Brand description: ${brandDesc}
Platform: ${platform}
Tone: ${tone}
Format: ${format}
Language: ${langLabel}

Use the tools in this order:
1. First call analyze_brand to understand the brand
2. Then call generate_copy with the brand analysis
3. Call suggest_colors for a color palette
4. Call recommend_timing for posting schedule
5. Call create_dalle_prompt for visual generation

After all tools return data, synthesize the results into a final JSON with these exact keys: headline, subheadline, body, cta, hashtags, emoji_set, dalle_prompt, color_palette, posting_time. Improve the copy if you can — make headlines punchier and bodies more persuasive while keeping the tone. Respond with ONLY the final JSON.`,
      },
    ];

    const MAX_ROUNDS = 8;
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          tools: CONTENT_TOOLS,
          messages,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();

      // Check if Claude wants to use tools
      const toolUseBlocks = (data.content || []).filter(b => b.type === "tool_use");
      const textBlocks = (data.content || []).filter(b => b.type === "text");

      if (data.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
        // Final response — extract JSON from text
        const text = textBlocks.map(b => b.text).join("");
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Validate required fields
          if (parsed.headline && parsed.body) return parsed;
        }
        return null;
      }

      // Process tool calls — add assistant message then tool results
      messages.push({ role: "assistant", content: data.content });

      const toolResults = toolUseBlocks.map(block => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(executeContentTool(block.name, block.input)),
      }));
      messages.push({ role: "user", content: toolResults });
    }
    return null;
  } catch {
    return null;
  }
}

// ─── HUGGING FACE INFERENCE API ──────────────────────────────────────────────
async function generateWithHuggingFace(brandText, platform, tone, format, lang, hfToken, setLoadingMsg) {
  const HF_API = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

  const systemPrompt = lang === 'en'
    ? `You are a senior social media copywriter. Generate marketing content for ${platform}.`
    : `Eres un copywriter senior de redes sociales. Genera contenido de marketing para ${platform}.`;

  const userPrompt = lang === 'en'
    ? `Brand: ${brandText}
Platform: ${platform}
Tone: ${tone}
Format: ${format}

Generate a JSON with exactly these fields:
{"headline":"max 10 words","subheadline":"max 15 words","body":"2-3 sentences about the brand","cta":"max 5 words call to action","hashtags":["5 relevant hashtags"]}`
    : `Marca: ${brandText}
Plataforma: ${platform}
Tono: ${tone}
Formato: ${format}

Genera un JSON con exactamente estos campos:
{"headline":"max 10 palabras","subheadline":"max 15 palabras","body":"2-3 oraciones sobre la marca","cta":"max 5 palabras call to action","hashtags":["5 hashtags relevantes"]}`;

  const doFetch = () => fetch(HF_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(hfToken ? { 'Authorization': `Bearer ${hfToken}` } : {}),
    },
    body: JSON.stringify({
      inputs: `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  try {
    let response = await doFetch();

    // Handle 503 — model loading (cold start)
    if (response.status === 503) {
      try {
        const body = await response.json();
        if (body.estimated_time && setLoadingMsg) {
          setLoadingMsg(lang === 'en'
            ? `Model loading (~${Math.ceil(body.estimated_time)}s)...`
            : `Cargando modelo (~${Math.ceil(body.estimated_time)}s)...`);
          await new Promise(r => setTimeout(r, body.estimated_time * 1000 + 1000));
          response = await doFetch();
        }
      } catch {
        return null;
      }
    }

    if (!response.ok) return null;

    const data = await response.json();
    const text = data[0]?.generated_text || '';

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        headline: parsed.headline || '',
        subheadline: parsed.subheadline || '',
        body: parsed.body || '',
        cta: parsed.cta || '',
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        emoji_set: parsed.emoji_set || ['✨', '🚀', '💡'],
        dalle_prompt: parsed.dalle_prompt || `Professional marketing visual for "${brandText}" — modern, clean design for ${platform} social media. Commercial photography quality, 8K resolution.`,
        color_palette: parsed.color_palette || ['#6366F1', '#F59E0B', '#1A1A2E'],
        posting_time: parsed.posting_time || (lang === 'en' ? 'Check platform analytics for optimal timing.' : 'Consulta las analíticas de la plataforma para el horario óptimo.'),
        _source: 'huggingface',
      };
    }
    return null;
  } catch (e) {
    console.warn('HF generation failed:', e);
    return null;
  }
}

// ─── CLAUDE API CALLER (simple fallback) ────────────────────────────────────
async function generateWithClaude(apiKey, brandDesc, platform, tone, format, lang) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a senior social media copywriter. Generate marketing content in ${lang === "en" ? "English" : "Spanish"}. Respond ONLY with valid JSON: {"headline":"max 10 words","subheadline":"max 15 words","body":"2-3 sentences","cta":"max 5 words","hashtags":["tag1","tag2","tag3","tag4","tag5"],"emoji_set":["e1","e2","e3"],"dalle_prompt":"Detailed DALL-E 3 image prompt in English, 50+ words, professional marketing visual","color_palette":["#hex1","#hex2","#hex3"],"posting_time":"best time recommendation and why"}`,
        messages: [{ role: "user", content: `Brand: ${brandDesc}\nPlatform: ${platform}\nTone: ${tone}\nFormat: ${format}\n\nGenerate compelling ${platform} content.` }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

// ─── HISTORY HELPERS ────────────────────────────────────────────────────────
const HISTORY_KEY = "cs_history";
const MAX_HISTORY = 20;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

function saveToHistory(entry) {
  const hist = loadHistory();
  hist.unshift(entry);
  if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  return hist;
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// ─── ANALYTICS HELPERS ──────────────────────────────────────────────────────
const STATS_KEY = "cs_stats";

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{"total":0,"platforms":{},"tones":{},"formats":{},"ai":0,"template":0}'); } catch { return { total: 0, platforms: {}, tones: {}, formats: {}, ai: 0, template: 0 }; }
}

function trackGeneration(platform, tone, format, usedAI) {
  const st = loadStats();
  st.total++;
  st.platforms[platform] = (st.platforms[platform] || 0) + 1;
  st.tones[tone] = (st.tones[tone] || 0) + 1;
  st.formats[format] = (st.formats[format] || 0) + 1;
  if (usedAI) st.ai++; else st.template++;
  localStorage.setItem(STATS_KEY, JSON.stringify(st));
  return st;
}

function topEntry(obj) {
  let top = "-", max = 0;
  for (const [k, v] of Object.entries(obj || {})) { if (v > max) { max = v; top = k; } }
  return top;
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
function MockVisual({ colors, headline, platform, loading, loadingStep, s }) {
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
              {loadingStep || (s && s.generatingVisual) || "Generando visual..."}
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
                {headline || (s && s.defaultHeadline) || "Tu contenido aqu\u00ed"}
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
function CopyCard({ label, content, accent, onCopied, s }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(Array.isArray(content) ? content.map(t => `#${t}`).join(" ") : content);
    setCopied(true);
    if (onCopied) onCopied(s ? s.copiedToClipboard(label) : `"${label}" copiado al portapapeles`);
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
          {copied ? `\u2713 ${s ? s.copied : "Copiado"}` : (s ? s.copy : "Copiar")}
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
function ContactBar({ s }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem('cta-dismissed')) return;
    const timer = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(timer);
  }, []);
  if (dismissed || !show) return null;
  const dismiss = () => { setDismissed(true); sessionStorage.setItem('cta-dismissed', '1'); };
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(10,11,15,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(99,102,241,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', animation: 'slideUpCTA 0.4s ease', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes slideUpCTA { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 500 }}>{s.ctaBar}</span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <a href="https://impulso-ia-navy.vercel.app/#contacto" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'transform 0.2s' }}>{s.ctaTalk}</a>
        <a href="https://wa.me/525579605324?text=Hola%20Christian%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20tus%20servicios%20de%20IA" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>
        <button onClick={dismiss} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
      </div>
    </div>
  );
}

// ─── TOUR OVERLAY COMPONENT ──────────────────────────────────────────────────
function TourOverlay({ step, t, tourLang, setTourLang, onNext, onSkip, refs }) {
  const [spotlightRect, setSpotlightRect] = useState(null);
  const TOTAL_STEPS = 8;

  // Map step -> ref
  const stepRefMap = {
    1: refs.platformRef,
    2: refs.toneFormatRef,
    3: refs.brandRef,
    4: refs.generateBtnRef,
    5: refs.resultCopyRef,
    6: refs.resultVisualRef,
    7: refs.variantBtnRef,
  };

  useEffect(() => {
    if (step === 0 || step === 8 || step === -1) {
      setSpotlightRect(null);
      return;
    }
    const ref = stepRefMap[step];
    if (ref?.current) {
      const updateRect = () => {
        const r = ref.current.getBoundingClientRect();
        setSpotlightRect({ top: r.top + window.scrollY - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 });
      };
      updateRect();
      const timer = setTimeout(updateRect, 200);
      return () => clearTimeout(timer);
    } else {
      setSpotlightRect(null);
    }
  }, [step]);

  if (step === -1) return null; // hidden during generation

  const stepConfig = {
    0: { title: t.welcomeTitle, body: t.welcomeBody, btn: t.startTour },
    1: { title: t.step1Title, body: t.step1Body, btn: t.tryIt },
    2: { title: t.step2Title, body: t.step2Body, btn: t.tryIt },
    3: { title: t.step3Title, body: t.step3Body, btn: t.tryIt },
    4: { title: t.step4Title, body: t.step4Body, btn: t.generate },
    5: { title: t.step5Title, body: t.step5Body, btn: t.next },
    6: { title: t.step6Title, body: t.step6Body, btn: t.next },
    7: { title: t.step7Title, body: t.step7Body, btn: t.tryIt },
    8: { title: t.step8Title, body: t.step8Body, btn: t.finish },
  };

  const cfg = stepConfig[step];
  if (!cfg) return null;

  const isWelcome = step === 0;
  const isFinish = step === 8;

  // Position tooltip near spotlight
  let tooltipStyle = {};
  if (spotlightRect && !isWelcome && !isFinish) {
    const viewH = window.innerHeight;
    const spotScreenTop = spotlightRect.top - window.scrollY;
    const below = spotScreenTop + spotlightRect.height + 16;
    const above = spotScreenTop - 16;
    if (below + 200 < viewH) {
      tooltipStyle = { position: "fixed", top: below, left: Math.max(16, Math.min(spotlightRect.left, window.innerWidth - 380)), maxWidth: 360 };
    } else {
      tooltipStyle = { position: "fixed", top: Math.max(16, above - 200), left: Math.max(16, Math.min(spotlightRect.left, window.innerWidth - 380)), maxWidth: 360 };
    }
  }

  return (
    <>
      <style>{`
        @keyframes tourFadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @keyframes tourPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(232,197,71,0.4); } 50% { box-shadow: 0 0 0 8px rgba(232,197,71,0); } }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 10000,
        pointerEvents: isWelcome || isFinish ? "auto" : "none",
      }}>
        {/* Dark overlay with spotlight cutout */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto" }} onClick={(e) => e.stopPropagation()}>
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left} y={spotlightRect.top}
                  width={spotlightRect.width} height={spotlightRect.height}
                  rx="12" fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#tour-mask)" />
        </svg>

        {/* Spotlight ring */}
        {spotlightRect && (
          <div style={{
            position: "absolute",
            top: spotlightRect.top, left: spotlightRect.left,
            width: spotlightRect.width, height: spotlightRect.height,
            border: "2px solid rgba(232,197,71,0.6)", borderRadius: 12,
            pointerEvents: "none",
            animation: "tourPulse 2s ease infinite",
          }} />
        )}

        {/* Tooltip / Modal */}
        <div style={{
          ...(isWelcome || isFinish ? {
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", maxWidth: 440, width: "90%",
          } : tooltipStyle),
          background: "#1A1B2E",
          border: "1px solid rgba(232,197,71,0.3)",
          borderRadius: 16, padding: isWelcome ? "32px 28px" : "20px 22px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          zIndex: 10001,
          animation: "tourFadeIn 0.3s ease",
          pointerEvents: "auto",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Step counter (not on welcome) */}
          {!isWelcome && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{
                fontSize: 10, fontFamily: "'DM Mono', monospace",
                color: "#E8C547", letterSpacing: "0.1em",
              }}>
                {t.stepOf(step, TOTAL_STEPS)}
              </span>
              <button onClick={onSkip} style={{
                background: "none", border: "none", fontSize: 11,
                color: "rgba(255,255,255,0.3)", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {t.skipLabel}
              </button>
            </div>
          )}

          {/* Language selector on welcome */}
          {isWelcome && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              {["en", "es"].map(l => (
                <button key={l} onClick={() => setTourLang(l)} style={{
                  background: tourLang === l ? "rgba(232,197,71,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${tourLang === l ? "#E8C547" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 6, padding: "6px 18px",
                  fontSize: 13, fontWeight: tourLang === l ? 700 : 400,
                  color: tourLang === l ? "#E8C547" : "rgba(255,255,255,0.4)",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}>
                  {l === "en" ? "English" : "Espa\u00f1ol"}
                </button>
              ))}
            </div>
          )}

          <h3 style={{
            margin: "0 0 10px", fontSize: isWelcome ? 22 : 16, fontWeight: 700,
            color: "#F8F4E8", fontFamily: "'Playfair Display', serif",
            lineHeight: 1.3,
          }}>
            {cfg.title}
          </h3>
          <p style={{
            margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7, whiteSpace: "pre-line",
          }}>
            {cfg.body}
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: isWelcome ? "center" : "flex-start" }}>
            <button onClick={onNext} style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #E8C547, #D4A017)",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              color: "#0C0C14", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 0 20px rgba(232,197,71,0.3)",
              transition: "transform 0.15s",
            }}>
              {cfg.btn}
            </button>
            {isWelcome && (
              <button onClick={onSkip} style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8, fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
                {t.skipTour}
              </button>
            )}
          </div>

          {/* Progress dots */}
          {!isWelcome && (
            <div style={{ display: "flex", gap: 4, marginTop: 14, justifyContent: "center" }}>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div key={i} style={{
                  width: i + 1 === step ? 18 : 6, height: 6,
                  borderRadius: 3,
                  background: i + 1 <= step ? "#E8C547" : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s",
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ContentGenerator() {
  const [lang, setLang] = useState("es");
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
  // New state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("cs_apikey") || "");
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [hfToken, setHfToken] = useState(() => localStorage.getItem("cs_hftoken") || "");
  const [showHfKey, setShowHfKey] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [contentSource, setContentSource] = useState("templates"); // 'claude' | 'huggingface' | 'templates'
  const [history, setHistory] = useState(() => loadHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [variants, setVariants] = useState(null);
  const [favoriteVariant, setFavoriteVariant] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(() => loadStats());
  const [exportOpen, setExportOpen] = useState(false);

  // ── ONBOARDING TOUR STATE ──
  const [tourActive, setTourActive] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [tourLang, setTourLang] = useState("en");
  const tourT = TOUR_TEXT[tourLang];

  const s = UI[lang];

  // Ref to track if generation was cancelled by settings change
  const generationIdRef = useRef(0);

  // ── TOUR REFS ──
  const platformRef = useRef(null);
  const toneFormatRef = useRef(null);
  const brandRef = useRef(null);
  const generateBtnRef = useRef(null);
  const resultCopyRef = useRef(null);
  const resultVisualRef = useRef(null);
  const variantBtnRef = useRef(null);

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 2200);
  };

  // ── TOUR ACTIONS ──
  const endTour = useCallback(() => {
    setTourActive(false);
    setTourStep(0);
  }, []);

  const tourNext = useCallback(async () => {
    const step = tourStep;
    if (step === 0) {
      // Welcome -> go to step 1, set lang from tourLang
      setLang(tourLang);
      setTourStep(1);
      setTimeout(() => platformRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } else if (step === 1) {
      // Auto-select Instagram
      setPlatform("instagram");
      setTourStep(2);
      setTimeout(() => toneFormatRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } else if (step === 2) {
      // Auto-select Professional + Product
      setTone("Profesional");
      setFormat("Producto");
      setTourStep(3);
      setTimeout(() => brandRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } else if (step === 3) {
      // Auto-fill brand description
      const sampleText = TOUR_TEXT[tourLang].sampleBrand;
      setBrand(sampleText);
      setTourStep(4);
      setTimeout(() => generateBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } else if (step === 4) {
      // Auto-click generate — hide tour tooltip temporarily, wait for result
      setTourStep(-1); // hide tooltip while generating
      // Trigger generate
      const currentGenId = ++generationIdRef.current;
      const nextCount = 0;
      setGenerationCount(nextCount);
      setLoading(true);
      setError("");
      setResult(null);
      setVariants(null);
      setFavoriteVariant(null);

      const currentS = UI[tourLang];
      for (let i = 0; i < currentS.loadingSteps.length; i++) {
        if (generationIdRef.current !== currentGenId) return;
        setLoadingStep(currentS.loadingSteps[i]);
        await new Promise(r => setTimeout(r, 400));
      }
      if (generationIdRef.current !== currentGenId) return;

      const finalResult = generateSmartContent(brand.trim().length >= BRAND_MIN ? brand : TOUR_TEXT[tourLang].sampleBrand, "instagram", "Profesional", "Producto", nextCount, tourLang);
      finalResult._toolUse = false;
      setUsedAI(false);
      setResult(finalResult);
      setActiveTab("copy");
      setLoading(false);
      setLoadingStep("");
      const newStats = trackGeneration("instagram", "Profesional", "Producto", false);
      setStats(newStats);
      const entry = {
        id: Date.now(),
        brand: (brand || TOUR_TEXT[tourLang].sampleBrand).substring(0, 60),
        platform: "instagram", tone: "Profesional", format: "Producto",
        timestamp: new Date().toISOString(), usedAI: false, result: finalResult,
      };
      const newHist = saveToHistory(entry);
      setHistory(newHist);

      // Show step 5 after a short delay
      setTimeout(() => {
        setTourStep(5);
        resultCopyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    } else if (step === 5) {
      // Show visual tab
      setActiveTab("visual");
      setTourStep(6);
      setTimeout(() => resultVisualRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } else if (step === 6) {
      setActiveTab("copy");
      setTourStep(7);
      setTimeout(() => variantBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    } else if (step === 7) {
      // Auto-generate variants
      if (result) {
        const variantResults = [];
        for (let v = 0; v < 2; v++) {
          const varResult = generateSmartContent(brand || TOUR_TEXT[tourLang].sampleBrand, "instagram", "Profesional", "Producto", generationCount + 100 + v * 37, tourLang);
          variantResults.push({ ...varResult, source: "template" });
        }
        setVariants(variantResults);
        setFavoriteVariant(null);
      }
      setTourStep(8);
    } else if (step === 8) {
      endTour();
    }
  }, [tourStep, tourLang, brand, result, generationCount, endTour]);

  const brandTooShort = brand.trim().length > 0 && brand.trim().length < BRAND_MIN;
  const canGenerate = brand.trim().length >= BRAND_MIN && !loading;

  const getDisabledReason = () => {
    if (loading) return s.generatingBtn;
    if (!brand.trim()) return s.describePrompt;
    if (brandTooShort) return s.minChars(BRAND_MIN, BRAND_MIN - brand.trim().length);
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
    setVariants(null);
    setFavoriteVariant(null);

    let aiUsed = false;

    // Stepped loading animation
    for (let i = 0; i < s.loadingSteps.length; i++) {
      if (generationIdRef.current !== currentGenId) return;
      setLoadingStep(s.loadingSteps[i]);
      await new Promise(r => setTimeout(r, 400));
    }
    if (generationIdRef.current !== currentGenId) return;

    // Try Claude Tool Use first, then simple Claude, then HF, then templates
    let claudeResult = null;
    let toolUseMode = false;
    let source = 'templates';

    // 1. Try Claude (if API key provided)
    if (apiKey.trim()) {
      claudeResult = await generateWithToolUse(apiKey.trim(), brand, platform, tone, format, lang);
      if (generationIdRef.current !== currentGenId) return;
      if (claudeResult) toolUseMode = true;
      // Fallback to simple Claude call
      if (!claudeResult) {
        claudeResult = await generateWithClaude(apiKey.trim(), brand, platform, tone, format, lang);
        if (generationIdRef.current !== currentGenId) return;
      }
      if (claudeResult) source = 'claude';
    }

    // 2. Try Hugging Face (if Claude failed or no API key)
    let hfResult = null;
    if (!claudeResult) {
      hfResult = await generateWithHuggingFace(brand, platform, tone, format, lang, hfToken.trim() || null, setLoadingStep);
      if (generationIdRef.current !== currentGenId) return;
      if (hfResult) source = 'huggingface';
    }

    // 3. Fallback to smart templates
    let finalResult;
    if (claudeResult) {
      aiUsed = true;
      finalResult = claudeResult;
    } else if (hfResult) {
      aiUsed = true;
      finalResult = hfResult;
    } else {
      finalResult = generateSmartContent(brand, platform, tone, format, nextCount, lang);
      source = 'templates';
    }
    finalResult._toolUse = toolUseMode;
    finalResult._source = source;

    setUsedAI(aiUsed);
    setContentSource(source);
    setResult(finalResult);
    setActiveTab("copy");
    setLoading(false);
    setLoadingStep("");

    // Track analytics
    const newStats = trackGeneration(platform, tone, format, aiUsed);
    setStats(newStats);

    // Save to history
    const entry = {
      id: Date.now(),
      brand: brand.substring(0, 60),
      platform,
      tone,
      format,
      timestamp: new Date().toISOString(),
      usedAI: aiUsed,
      result: finalResult,
    };
    const newHist = saveToHistory(entry);
    setHistory(newHist);
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
      `${s.bodyExport}:`,
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
      `${s.bestTimeExport}:`,
      result.posting_time,
    ].join("\n");

    navigator.clipboard.writeText(text);
    showToast(s.allExported);
  };

  const exportJSON = () => {
    if (!result) return;
    const obj = { platform, tone, format, brand: brand.substring(0, 100), generatedWith: contentSource === 'claude' ? "Claude AI" : contentSource === 'huggingface' ? "HF Mistral 7B" : "Smart Templates", ...result };
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    showToast(lang === "es" ? "JSON copiado al portapapeles" : "JSON copied to clipboard");
    setExportOpen(false);
  };

  const exportMarkdown = () => {
    if (!result) return;
    const md = [
      `# ${result.headline}`,
      `### ${result.subheadline}`,
      "",
      result.body,
      "",
      `**CTA:** ${result.cta}`,
      "",
      `**Hashtags:** ${(result.hashtags || []).map(t => `#${t}`).join(" ")}`,
      "",
      `**Best Time:** ${result.posting_time}`,
      "",
      `**DALL-E Prompt:** ${result.dalle_prompt}`,
      "",
      `---`,
      `*Generated with ContentStudio ${contentSource === 'claude' ? "(Claude AI)" : contentSource === 'huggingface' ? "(HF Mistral)" : "(Templates)"}*`,
    ].join("\n");
    navigator.clipboard.writeText(md);
    showToast(lang === "es" ? "Markdown copiado al portapapeles" : "Markdown copied to clipboard");
    setExportOpen(false);
  };

  const generateVariantsFn = async () => {
    if (!result) return;
    const variantResults = [];
    // Generate 2 variants using different seeds
    for (let v = 0; v < 2; v++) {
      // Try Claude first
      if (apiKey.trim()) {
        const claudeVar = await generateWithClaude(apiKey.trim(), brand, platform, tone, format, lang);
        if (claudeVar) { variantResults.push({ ...claudeVar, source: "claude" }); continue; }
      }
      // Try HF second
      const hfVar = await generateWithHuggingFace(brand, platform, tone, format, lang, hfToken.trim() || null, null);
      if (hfVar) { variantResults.push({ ...hfVar, source: "huggingface" }); continue; }
      // Fallback to templates
      const varResult = generateSmartContent(brand, platform, tone, format, generationCount + 100 + v * 37, lang);
      variantResults.push({ ...varResult, source: "template" });
    }
    setVariants(variantResults);
    setFavoriteVariant(null);
  };

  const restoreFromHistory = (entry) => {
    setResult(entry.result);
    setBrand(entry.brand);
    setPlatform(entry.platform);
    setTone(entry.tone);
    setFormat(entry.format);
    setUsedAI(entry.usedAI);
    setShowHistory(false);
    setActiveTab("copy");
    setVariants(null);
    setFavoriteVariant(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    localStorage.setItem("cs_apikey", val);
  };

  const handleHfTokenChange = (val) => {
    setHfToken(val);
    localStorage.setItem("cs_hftoken", val);
  };

  const hasApiKey = apiKey.trim().length > 0;
  const hasHfToken = hfToken.trim().length > 0;

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);
  const accent = "#E8C547";

  return (
    <>
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

            {/* MODE INDICATORS */}
            {hasApiKey && (
              <span style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace",
                color: "#8B5CF6",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 4, padding: "3px 8px", letterSpacing: "0.08em",
              }}>Claude</span>
            )}
            {hasHfToken && (
              <span style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace",
                color: "#F59E0B",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 4, padding: "3px 8px", letterSpacing: "0.08em",
              }}>Mistral 7B</span>
            )}
            {!hasApiKey && !hasHfToken && (
              <span style={{
                fontSize: 9, fontFamily: "'DM Mono', monospace",
                color: "#6B7280",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4, padding: "3px 8px", letterSpacing: "0.08em",
              }}>{lang === 'en' ? 'Templates Mode' : 'Modo Plantillas'}</span>
            )}
            <span style={{
              fontSize: 9, fontFamily: "'DM Mono', monospace",
              color: hasApiKey ? "#4ADE80" : hasHfToken ? "#F59E0B" : "#6B7280",
              background: hasApiKey ? "rgba(74,222,128,0.1)" : hasHfToken ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${hasApiKey ? "rgba(74,222,128,0.3)" : hasHfToken ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 4, padding: "3px 8px", letterSpacing: "0.08em",
              cursor: "pointer",
            }} onClick={() => setShowStats(!showStats)}>
              {hasApiKey ? s.aiMode : hasHfToken ? 'HF Mode' : s.templateMode} {stats.total > 0 ? `\u00b7 ${stats.total}` : ""}
            </span>

            {/* LANGUAGE TOGGLE */}
            <div style={{
              marginLeft: "auto",
              display: "flex",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}>
              <button onClick={() => setLang("es")} style={{
                background: lang === "es" ? `${accent}20` : "transparent",
                border: "none",
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: lang === "es" ? 700 : 400,
                color: lang === "es" ? accent : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}>ES</button>
              <button onClick={() => setLang("en")} style={{
                background: lang === "en" ? `${accent}20` : "transparent",
                border: "none",
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: lang === "en" ? 700 : 400,
                color: lang === "en" ? accent : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}>EN</button>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>
            {s.headerSub} &middot; Claude API + HF Inference + DALL-E 3
          </p>
        </div>

        {/* STATS PANEL (collapsible) */}
        {showStats && stats.total > 0 && (
          <div style={{
            marginBottom: 16, padding: "12px 16px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center",
            animation: "fadeUp 0.3s ease",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>{stats.total}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{s.totalGens}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{topEntry(stats.platforms)}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{s.mostPlatform}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{topEntry(stats.tones)}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{s.mostTone}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{stats.ai} / {stats.template}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{s.aiRatio}</div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* PANEL IZQUIERDO — INPUTS */}
          <div>
            {/* API KEY SECTION (collapsible) */}
            <div style={{ marginBottom: 14 }}>
              <button onClick={() => setApiKeyOpen(!apiKeyOpen)} style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", gap: 6, marginBottom: apiKeyOpen ? 8 : 0,
              }}>
                <span style={{ fontSize: 10, color: apiKeyOpen ? accent : "rgba(255,255,255,0.3)", transition: "transform 0.2s", display: "inline-block", transform: apiKeyOpen ? "rotate(90deg)" : "rotate(0)" }}>&#9654;</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: hasApiKey ? "#4ADE80" : "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>
                  {s.apiKeyLabel} {hasApiKey ? "\u2713" : ""}
                </span>
              </button>
              {apiKeyOpen && (
                <div style={{ animation: "fadeUp 0.2s ease" }}>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => handleApiKeyChange(e.target.value)}
                    placeholder={s.apiKeyPlaceholder}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${hasApiKey ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "8px 12px",
                      color: "#F8F4E8", fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  />
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{s.apiKeyHint}</p>
                </div>
              )}
            </div>

            {/* HF TOKEN SECTION (collapsible) */}
            <div style={{ marginBottom: 14 }}>
              <button onClick={() => setShowHfKey(!showHfKey)} style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", gap: 6, marginBottom: showHfKey ? 8 : 0,
              }}>
                <span style={{ fontSize: 10, color: showHfKey ? "#F59E0B" : "rgba(255,255,255,0.3)", transition: "transform 0.2s", display: "inline-block", transform: showHfKey ? "rotate(90deg)" : "rotate(0)" }}>&#9654;</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: hasHfToken ? "#F59E0B" : "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>
                  {lang === 'en' ? 'HUGGING FACE TOKEN (Optional)' : 'TOKEN HUGGING FACE (Opcional)'} {hasHfToken ? "\u2713" : ""}
                </span>
              </button>
              {showHfKey && (
                <div style={{ animation: "fadeUp 0.2s ease" }}>
                  <input
                    type="password"
                    value={hfToken}
                    onChange={e => handleHfTokenChange(e.target.value)}
                    placeholder={lang === 'en' ? 'hf_... (optional, free tier works without)' : 'hf_... (opcional, tier gratis funciona sin token)'}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${hasHfToken ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "8px 12px",
                      color: "#F8F4E8", fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  />
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                    {lang === 'en' ? 'Mistral 7B via Hugging Face — free tier available' : 'Mistral 7B via Hugging Face — tier gratis disponible'}
                  </p>
                </div>
              )}
            </div>

            {/* Brand Input */}
            <div ref={brandRef} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace",
                }}>
                  {s.productLabel}
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
                placeholder={s.placeholder}
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
                  {s.describeMin(BRAND_MIN, BRAND_MIN - brand.trim().length)}
                </p>
              )}
            </div>

            {/* Plataforma */}
            <div ref={platformRef} style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace",
                marginBottom: 8,
              }}>{s.platformLabel}</label>
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
            <div ref={toneFormatRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: s.toneLabel, options: TONES, value: tone, setter: setTone },
                { label: s.formatLabel, options: FORMATS, value: format, setter: setFormat },
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
                      }}>{label === s.toneLabel ? (s.toneNames[o] || o) : (s.formatNames[o] || o)}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botón Generar */}
            <button
              ref={generateBtnRef}
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
              {loading ? loadingStep || s.generatingBtn : `\u26a1 ${s.generateBtn}`}
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
                  {s.retry}
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
                  {s.previewLabel} &middot; {selectedPlatform?.label}
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
                s={s}
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
              <div ref={resultCopyRef} style={{ animation: "fadeUp 0.4s ease" }}>
                {/* AI / HF / Template badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                    padding: "3px 10px", borderRadius: 4,
                    fontFamily: "'DM Mono', monospace",
                    background: contentSource === 'claude' ? "rgba(74,222,128,0.12)"
                      : contentSource === 'huggingface' ? "rgba(245,158,11,0.12)"
                      : "rgba(255,255,255,0.05)",
                    color: contentSource === 'claude' ? "#4ADE80"
                      : contentSource === 'huggingface' ? "#F59E0B"
                      : "#6B7280",
                    border: `1px solid ${contentSource === 'claude' ? "rgba(74,222,128,0.25)"
                      : contentSource === 'huggingface' ? "rgba(245,158,11,0.25)"
                      : "rgba(255,255,255,0.08)"}`,
                  }}>
                    {contentSource === 'claude'
                      ? (result?._toolUse ? s.aiToolUseBadge : s.aiBadge)
                      : contentSource === 'huggingface'
                        ? (lang === 'en' ? 'HF Model' : 'Modelo HF')
                        : s.templateBadge}
                  </span>
                </div>
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
                      {tab === "copy" ? s.tabCopy : tab === "visual" ? s.tabVisual : s.tabTiming}
                    </button>
                  ))}
                </div>

                <div key={activeTab} style={{ animation: "tabFade 0.25s ease" }}>
                  {activeTab === "copy" && (
                    <div>
                      <CopyCard label="Headline" content={result.headline} accent={accent} onCopied={showToast} s={s} />
                      <CopyCard label="Subheadline" content={result.subheadline} accent={accent} onCopied={showToast} s={s} />
                      <CopyCard label={s.bodyLabel} content={result.body} accent={accent} onCopied={showToast} s={s} />
                      <CopyCard label="CTA" content={result.cta} accent={accent} onCopied={showToast} s={s} />
                      <CopyCard label="Hashtags" content={result.hashtags} accent={accent} onCopied={showToast} s={s} />
                    </div>
                  )}

                  {activeTab === "visual" && (
                    <div ref={resultVisualRef}>
                      <div style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 10, padding: "14px 16px", marginBottom: 10,
                      }}>
                        <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, fontFamily: "'DM Mono', monospace" }}>
                          {s.colorPalette}
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
                          {s.dallePromptLabel}
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
                        {s.bestTime}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: "#E2E8F0", lineHeight: 1.65 }}>
                        {result.posting_time}
                      </p>
                      <div style={{ marginTop: 16, padding: "12px", background: "rgba(232,197,71,0.06)", borderRadius: 8, border: "1px solid rgba(232,197,71,0.12)" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                          <strong style={{ color: accent }}>Tip:</strong> {s.tip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Regenerar + Export + Variants */}
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
                    {s.regenerate}
                    {generationCount > 0 && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                        #{generationCount + 1}
                      </span>
                    )}
                  </button>
                  {/* EXPORT DROPDOWN */}
                  <div style={{ flex: 1, position: "relative" }}>
                    <button onClick={() => setExportOpen(!exportOpen)} style={{
                      width: "100%", padding: "10px",
                      background: "rgba(232,197,71,0.08)",
                      border: `1px solid ${accent}30`,
                      borderRadius: 8, fontSize: 12, fontWeight: 600,
                      color: accent, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}>
                      {s.copyAll} &#9662;
                    </button>
                    {exportOpen && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                        background: "#1E293B", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 8, overflow: "hidden", zIndex: 50, animation: "fadeUp 0.15s ease",
                      }}>
                        <button onClick={() => { exportAll(); setExportOpen(false); }} style={{
                          width: "100%", padding: "8px 12px", background: "none", border: "none",
                          color: "#E2E8F0", fontSize: 11, textAlign: "left", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>{s.copyAll}</button>
                        <button onClick={exportJSON} style={{
                          width: "100%", padding: "8px 12px", background: "none", border: "none",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          color: "#E2E8F0", fontSize: 11, textAlign: "left", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>{s.exportJSON}</button>
                        <button onClick={exportMarkdown} style={{
                          width: "100%", padding: "8px 12px", background: "none", border: "none",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          color: "#E2E8F0", fontSize: 11, textAlign: "left", cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>{s.exportMD}</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* GENERATE VARIANTS */}
                <button ref={variantBtnRef} onClick={generateVariantsFn} style={{
                  width: "100%", padding: "9px", marginTop: 8,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 8, fontSize: 12, fontWeight: 600,
                  color: "#818CF8", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}>
                  {s.generateVariants}
                </button>

                {/* VARIANTS DISPLAY */}
                {variants && variants.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                    {variants.map((v, i) => (
                      <div key={i} onClick={() => { setFavoriteVariant(i); setResult(v); setUsedAI(v.source === "claude" || v.source === "huggingface"); setContentSource(v.source || "templates"); }} style={{
                        padding: "10px 12px",
                        background: favoriteVariant === i ? "rgba(232,197,71,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${favoriteVariant === i ? accent : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: accent, fontFamily: "'DM Mono', monospace" }}>
                            {s.variantLabel(i + 1)}
                          </span>
                          {favoriteVariant === i && <span style={{ fontSize: 12, color: accent }}>&#9733;</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: "#E2E8F0", lineHeight: 1.4 }}>{v.headline}</p>
                        <p style={{ margin: "4px 0 0", fontSize: 10, color: "#6B7280" }}>{v.cta}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* HISTORY TOGGLE */}
                <button onClick={() => setShowHistory(!showHistory)} style={{
                  width: "100%", padding: "8px", marginTop: 10,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, fontSize: 11, fontWeight: 500,
                  color: "rgba(255,255,255,0.35)", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {s.historyTitle} ({history.length})
                </button>
              </div>
            )}

            {/* HISTORY PANEL */}
            {showHistory && (
              <div style={{
                marginTop: 10, padding: "12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, maxHeight: 250, overflowY: "auto",
                animation: "fadeUp 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.historyTitle}</span>
                  {history.length > 0 && (
                    <button onClick={handleClearHistory} style={{
                      background: "none", border: "none", fontSize: 10,
                      color: "#F87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>{s.clearHistory}</button>
                  )}
                </div>
                {history.length === 0 && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0, textAlign: "center", padding: "12px 0" }}>{s.noHistory}</p>
                )}
                {history.map((h) => {
                  const plat = PLATFORMS.find(p => p.id === h.platform);
                  return (
                    <button key={h.id} onClick={() => restoreFromHistory(h)} style={{
                      width: "100%", padding: "8px 10px", marginBottom: 4,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 6, cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ fontSize: 14 }}>{plat?.icon || ""}</span>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 11, color: "#E2E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.brand}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>
                          {h.tone} &middot; {new Date(h.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {h.usedAI && <span style={{ fontSize: 8, color: h.result?._source === 'huggingface' ? "#F59E0B" : "#4ADE80", fontFamily: "'DM Mono', monospace", border: `1px solid ${h.result?._source === 'huggingface' ? "rgba(245,158,11,0.25)" : "rgba(74,222,128,0.25)"}`, borderRadius: 3, padding: "1px 4px" }}>{h.result?._source === 'huggingface' ? 'HF' : 'AI'}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {!result && !loading && !showHistory && (
              <div style={{
                height: 200, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 10,
              }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>✦</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                  {s.emptyState}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            CLAUDE API · HUGGING FACE · DALL-E 3 · MAKE.COM INTEGRATION READY
          </p>
        </div>
      </div>
    </div>
    <ContactBar s={s} />

    {/* ── ONBOARDING TOUR OVERLAY ── */}
    {tourActive && <TourOverlay
      step={tourStep}
      t={tourT}
      tourLang={tourLang}
      setTourLang={setTourLang}
      onNext={tourNext}
      onSkip={endTour}
      refs={{ platformRef, toneFormatRef, brandRef, generateBtnRef, resultCopyRef, resultVisualRef, variantBtnRef }}
    />}
    </>
  );
}
