// ════════════════════════════════════════════════════════════════
//  CLUB HINDICA — app de inscripción + panel del equipo + panel de la dueña
//  Pegar en GitHub → club-hindica → src → App.jsx
//
//  Direcciones:
//    club-hindica.vercel.app            → formulario para clientas (el QR)
//    club-hindica.vercel.app/?t=papudo  → igual, pero anota en qué tienda se inscribió
//    club-hindica.vercel.app/#equipo    → vendedoras: buscar socia, 20%/5%, regalo
//    club-hindica.vercel.app/#duena     → Simon: cumpleaños, mensajes, socias, resumen
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";

// ─── CONFIGURACIÓN ─────────────────────────────────────────────
const SUPABASE_URL = "https://cwjfxuelbzlxingxylfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_4Mex1P359ZgUxk2VmS1iRA_oAVwjGmc"; // llave pública: no da acceso a los datos
// WhatsApp de Hindica (el que tiene WhatsApp Business), formato 569XXXXXXXX, sin + ni espacios
const HINDICA_WHATSAPP = "56928814150";
const INSTAGRAM = "@hindica.cl";
const TIENDAS = [
  { id: "maitencillo", nombre: "Maitencillo" },
  { id: "papudo", nombre: "Papudo" },
  { id: "renaca", nombre: "Reñaca" },
  { id: "ladehesa", nombre: "Portal La Dehesa" },
  { id: "piedraroja", nombre: "Piedra Roja" },
  { id: "popup", nombre: "Pop-up / Feria" },
];
const COMUNAS = ["Zapallar", "Papudo", "Puchuncaví", "Maitencillo", "La Ligua", "Viña del Mar", "Concón",
  "Valparaíso", "Quilpué", "Villa Alemana", "Lo Barnechea", "Vitacura", "Las Condes", "Providencia",
  "Ñuñoa", "La Reina", "Colina", "Chicureo", "Santiago", "Peñalolén", "Huechuraba", "La Florida", "Otra"];
const COLORES = ["Turquesa", "Fucsia", "Naranjo", "Amarillo", "Rojo", "Verde", "Azul", "Morado", "Rosado",
  "Blanco", "Negro", "Terracota", "Dorado"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre",
  "Octubre", "Noviembre", "Diciembre"];

// Textos de WhatsApp
const txtBienvenida = (nombre, numero) =>
  `¡Hola Hindica! 🌸 Soy ${nombre} y me acabo de unir al Club Hindica. Mi número de socia es el ${numero}.`;
const txtCumple = (nombre, numero) =>
  `¡Feliz cumpleaños, ${nombre}! 🎂🌸 Todo el equipo Hindica te desea un día precioso.\n\nTu regalo de cumpleaños te espera en cualquiera de nuestras tiendas, sin necesidad de comprar nada. Solo di tu número de socia: ${numero}.\n\nCon cariño, Hindica`;

// ─── ESTILO ────────────────────────────────────────────────────
const C = {
  bg: "#FBF5EC", card: "#FFFFFF", ink: "#2B1D14", muted: "#8A7465", line: "#EADBC8",
  magenta: "#B0306A", saffron: "#E08A1E", teal: "#1F7A74", green: "#2E7D4F", red: "#B3261E", soft: "#F6E9D8",
};
const serif = "Georgia, 'Times New Roman', serif";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const s = {
  page: { minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: sans, padding: "20px 16px 60px" },
  wrap: { maxWidth: 480, margin: "0 auto" },
  wide: { maxWidth: 900, margin: "0 auto" },
  card: { background: C.card, borderRadius: 18, padding: 20, boxShadow: "0 2px 14px rgba(43,29,20,.07)", marginBottom: 14 },
  label: { display: "block", fontSize: 14, fontWeight: 600, margin: "14px 0 6px" },
  hint: { fontSize: 12.5, color: C.muted, marginTop: 4 },
  input: { width: "100%", boxSizing: "border-box", padding: "13px 14px", fontSize: 16, borderRadius: 12,
    border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, fontFamily: sans },
  btn: { width: "100%", padding: "15px 18px", fontSize: 16.5, fontWeight: 700, borderRadius: 14, border: "none",
    background: C.magenta, color: "#fff", cursor: "pointer", fontFamily: sans },
  btn2: { width: "100%", padding: "13px 16px", fontSize: 15, fontWeight: 600, borderRadius: 14,
    border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, cursor: "pointer", fontFamily: sans },
  err: { background: "#FCEBEA", color: C.red, padding: "11px 13px", borderRadius: 12, fontSize: 14, marginTop: 12 },
  ok: { background: "#E7F4EC", color: C.green, padding: "11px 13px", borderRadius: 12, fontSize: 14, marginTop: 12 },
  chip: (on, col = C.magenta) => ({ padding: "8px 12px", borderRadius: 999, fontSize: 14, cursor: "pointer",
    border: `1.5px solid ${on ? col : C.line}`, background: on ? col : "#fff", color: on ? "#fff" : C.ink }),
  tag: (col) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
    background: col + "1A", color: col, marginRight: 6, marginBottom: 6 }),
};

// Franja decorativa tipo bloque de estampado
const Borde = () => (
  <div style={{ height: 8, borderRadius: 8, margin: "0 0 18px",
    background: `repeating-linear-gradient(90deg, ${C.magenta} 0 18px, ${C.saffron} 18px 36px, ${C.teal} 36px 54px, ${C.saffron} 54px 72px)` }} />
);
const Logo = ({ sub }) => (
  <div style={{ textAlign: "center", margin: "6px 0 16px" }}>
    <div style={{ fontFamily: serif, fontSize: 13, letterSpacing: 5, color: C.saffron, textTransform: "uppercase" }}>Club</div>
    <div style={{ fontFamily: serif, fontSize: 38, letterSpacing: 6, color: C.magenta, lineHeight: 1.1 }}>HINDICA</div>
    {sub && <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{sub}</div>}
  </div>
);

// ─── CONEXIÓN SEGURA ───────────────────────────────────────────
async function rpc(fn, args) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!r.ok) return { ok: false, error: "No pudimos conectar. Intenta de nuevo en un momento." };
    return await r.json();
  } catch {
    return { ok: false, error: "Sin conexión a internet. Intenta de nuevo." };
  }
}
const guardar = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const waLink = (tel, texto) => `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
const formatoRut = (v) => {
  const r = v.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (r.length < 2) return r;
  const cuerpo = r.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpo}-${r.slice(-1)}`;
};
const hoy = () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago" }));

// ════════════════════════════════════════════════════════════════
export default function App() {
  const [ruta, setRuta] = useState(window.location.hash);
  useEffect(() => {
    const f = () => setRuta(window.location.hash);
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  if (ruta === "#equipo") return <Equipo />;
  if (ruta === "#duena") return <Duena />;
  return <Inscripcion />;
}

// ════════════════════════════════════════════════════════════════
//  1. FORMULARIO DE INSCRIPCIÓN (lo que abre el QR)
// ════════════════════════════════════════════════════════════════
function Inscripcion() {
  const tienda = new URLSearchParams(window.location.search).get("t") || "";
  const [f, setF] = useState({ nombre: "", telefono: "", rut: "", dia: "", mes: "", anio: "", comuna: "",
    color: "", combinacion: "", acepta: false });
  const [verDatos, setVerDatos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e });
  const anioMax = hoy().getFullYear() - 18;
  const anios = Array.from({ length: anioMax - 1929 }, (_, i) => anioMax - i);

  async function enviar() {
    setError("");
    if (f.nombre.trim().length < 2) return setError("Escribe tu nombre.");
    if (f.telefono.replace(/\D/g, "").length < 9) return setError("Escribe tu celular (9 dígitos).");
    if (f.rut.replace(/[^0-9kK]/g, "").length < 8) return setError("Escribe tu RUT.");
    if (!f.dia || !f.mes || !f.anio) return setError("Elige tu fecha de nacimiento.");
    if (!f.comuna.trim()) return setError("Cuéntanos tu comuna.");
    if (!f.acepta) return setError("Para unirte, acepta cómo cuidamos tus datos.");
    const fecha = `${f.anio}-${String(f.mes).padStart(2, "0")}-${String(f.dia).padStart(2, "0")}`;
    const d = new Date(fecha + "T12:00:00");
    if (d.getDate() !== Number(f.dia)) return setError("Esa fecha no existe. Revisa el día.");
    setEnviando(true);
    const r = await rpc("club_registrar", {
      p_nombre: f.nombre, p_telefono: f.telefono, p_rut: f.rut, p_fecha_nacimiento: fecha,
      p_comuna: f.comuna, p_color_favorito: f.color || null, p_combinacion: f.combinacion || null,
      p_tienda: tienda || null, p_acepta: f.acepta,
    });
    setEnviando(false);
    if (!r.ok) return setError(r.error || "Algo falló. Intenta de nuevo.");
    setListo(r);
    window.scrollTo(0, 0);
  }

  if (listo) return (
    <div style={s.page}><div style={s.wrap}>
      <Logo />
      <Borde />
      <div style={{ ...s.card, textAlign: "center", padding: "28px 20px" }}>
        <div style={{ fontSize: 40 }}>🌸</div>
        <div style={{ fontFamily: serif, fontSize: 26, margin: "8px 0 4px" }}>¡Bienvenida, {listo.nombre}!</div>
        <div style={{ color: C.muted, fontSize: 15 }}>Ya eres parte del Club Hindica</div>
        <div style={{ margin: "22px auto 8px", padding: "18px 10px", borderRadius: 18, border: `2px dashed ${C.saffron}`, maxWidth: 260 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: C.saffron, textTransform: "uppercase" }}>Tu número de socia</div>
          <div style={{ fontFamily: serif, fontSize: 56, color: C.magenta, lineHeight: 1.1 }}>{listo.numero}</div>
        </div>
        <div style={{ fontSize: 15.5, margin: "16px 0 20px", lineHeight: 1.5 }}>
          Muéstralo en caja: <b>hoy tienes 20% de descuento</b> en tu compra de bienvenida.
        </div>
        {HINDICA_WHATSAPP && !HINDICA_WHATSAPP.includes("X") ? (
          <>
            <a href={waLink(HINDICA_WHATSAPP, txtBienvenida(listo.nombre, listo.numero))}
               style={{ ...s.btn, display: "block", textDecoration: "none", background: "#1FA855", boxSizing: "border-box" }}>
              Guardar mi número en WhatsApp
            </a>
            <div style={s.hint}>Se abre WhatsApp con tu número escrito: solo aprieta enviar. Así siempre lo tendrás en tu chat con Hindica.</div>
          </>
        ) : (
          <div style={s.hint}>Toma una captura de pantalla para no olvidar tu número.</div>
        )}
      </div>
    </div></div>
  );

  return (
    <div style={s.page}><div style={s.wrap}>
      <Logo sub="Gratis · menos de un minuto" />
      <Borde />
      <div style={s.card}>
        <div style={{ fontFamily: serif, fontSize: 21, marginBottom: 12 }}>Al unirte recibes</div>
        {[
          ["🎉", "20% de descuento hoy", "Una vez, en tu compra de bienvenida"],
          ["🏷️", "5% en todas tus compras", "Siempre, en todas las tiendas"],
          ["🎂", "Regalo de cumpleaños", "Sin comprar nada. Retíralo cuando quieras"],
          ["✨", "Primero en todo", "Ofertas exclusivas, ediciones especiales y colecciones nuevas antes que nadie"],
          ["💌", "Eventos VIP", "Invitaciones a los eventos exclusivos del Club"],
          ["📵", "Máximo 5 mensajes al año", "Incluido tu saludo de cumpleaños. Lo prometemos"],
          ["🔒", "Tus datos son tuyos", "No los compartimos con nadie"],
        ].map(([i, t, d]) => (
          <div key={t} style={{ display: "flex", gap: 12, padding: "8px 0", borderTop: `1px solid ${C.soft}` }}>
            <div style={{ fontSize: 22, width: 28 }}>{i}</div>
            <div><div style={{ fontWeight: 700, fontSize: 15 }}>{t}</div><div style={{ fontSize: 13.5, color: C.muted }}>{d}</div></div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <label style={s.label}>Nombre y apellido</label>
        <input style={s.input} value={f.nombre} onChange={set("nombre")} autoComplete="name" placeholder="Ej: Camila Rojas" />

        <label style={s.label}>Celular</label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ ...s.input, width: 70, textAlign: "center", background: C.soft }}>+56</div>
          <input style={s.input} value={f.telefono} onChange={set("telefono")} inputMode="tel" autoComplete="tel" placeholder="9 1234 5678" />
        </div>
        <div style={s.hint}>Aquí te llega tu número de socia y tu saludo de cumpleaños.</div>

        <label style={s.label}>RUT</label>
        <input style={s.input} value={f.rut} onChange={(e) => set("rut")(formatoRut(e.target.value))} placeholder="12.345.678-9" />
        <div style={s.hint}>Solo para que los beneficios sean uno por persona. Se guarda cifrado: nadie del equipo puede verlo.</div>

        <label style={s.label}>Fecha de nacimiento</label>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...s.input, width: "auto", minWidth: 0, flex: 1 }} value={f.dia} onChange={set("dia")}>
            <option value="">Día</option>{Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>
          <select style={{ ...s.input, width: "auto", minWidth: 0, flex: 1.7 }} value={f.mes} onChange={set("mes")}>
            <option value="">Mes</option>{MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select style={{ ...s.input, width: "auto", minWidth: 0, flex: 1.3 }} value={f.anio} onChange={set("anio")}>
            <option value="">Año</option>{anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={s.hint}>Para tu regalo de cumpleaños. Club para mayores de 18.</div>

        <label style={s.label}>Comuna donde vives</label>
        <input style={s.input} value={f.comuna} onChange={set("comuna")} list="comunas" placeholder="Ej: Zapallar" />
        <datalist id="comunas">{COMUNAS.map((c) => <option key={c} value={c} />)}</datalist>

        <label style={s.label}>Tu color favorito <span style={{ color: C.muted, fontWeight: 400 }}>(opcional)</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {COLORES.map((c) => <div key={c} style={s.chip(f.color === c)} onClick={() => set("color")(f.color === c ? "" : c)}>{c}</div>)}
        </div>
        <label style={s.label}>Tu combinación de colores favorita <span style={{ color: C.muted, fontWeight: 400 }}>(opcional)</span></label>
        <input style={s.input} value={f.combinacion} onChange={set("combinacion")} placeholder="Ej: turquesa con dorado" />
        <div style={s.hint}>Nos ayuda a traer desde India lo que más te gusta.</div>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 20, fontSize: 14.5, lineHeight: 1.45 }}>
          <input type="checkbox" checked={f.acepta} onChange={set("acepta")} style={{ width: 22, height: 22, marginTop: 1, accentColor: C.magenta }} />
          <span>Acepto que Hindica guarde mis datos para el Club y me envíe hasta 5 mensajes de WhatsApp al año.{" "}
            <span style={{ color: C.magenta, textDecoration: "underline", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); setVerDatos(!verDatos); }}>
              Cómo cuidamos tus datos</span></span>
        </label>
        {verDatos && <Privacidad />}

        {error && <div style={s.err}>{error}</div>}
        <button style={{ ...s.btn, marginTop: 18, opacity: enviando ? 0.6 : 1 }} disabled={enviando} onClick={enviar}>
          {enviando ? "Inscribiendo…" : "Unirme al Club"}
        </button>
      </div>
    </div></div>
  );
}

function Privacidad() {
  return (
    <div style={{ background: C.soft, borderRadius: 12, padding: 14, fontSize: 13.5, lineHeight: 1.55, marginTop: 10 }}>
      <b>Quién:</b> Hindica es responsable de tus datos.<br />
      <b>Qué guardamos:</b> nombre, celular, fecha de nacimiento, comuna, tu color favorito (si lo das), en qué tienda te uniste y tus beneficios usados.
      Del RUT guardamos solo una huella cifrada y los últimos 4 caracteres: nadie puede leer tu RUT completo.<br />
      <b>Para qué:</b> reconocerte como socia, aplicar tus descuentos, entregarte tu regalo de cumpleaños, invitarte a eventos
      y avisarte de colecciones nuevas, con un máximo de 5 mensajes de WhatsApp al año.<br />
      <b>Con quién:</b> con nadie. No vendemos ni compartimos tus datos. Se guardan en un servidor seguro con acceso restringido.<br />
      <b>Tus derechos:</b> puedes pedir ver, corregir o borrar tus datos, o dejar de recibir mensajes, en cualquier tienda,
      escribiendo <b>BAJA</b> a nuestro WhatsApp o por Instagram {INSTAGRAM}.<br />
      <b>Cuánto tiempo:</b> mientras seas socia. Si pides salir, borramos tus datos.
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  2. PANEL DEL EQUIPO (vendedoras)  →  /#equipo
// ════════════════════════════════════════════════════════════════
function Equipo() {
  const [clave, setClave] = useState(leer("club_clave_equipo") || "");
  const [entrada, setEntrada] = useState("");
  const [tienda, setTienda] = useState(leer("club_tienda") || "");
  const [busca, setBusca] = useState("");
  const [socia, setSocia] = useState(null);
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    const r = await rpc("club_buscar", { p_clave: entrada, p_numero: 0 });
    if (r.error && r.error.startsWith("Clave")) return setMsg({ e: r.error });
    guardar("club_clave_equipo", entrada); setClave(entrada); setMsg(null);
  }
  function salir() { guardar("club_clave_equipo", null); setClave(""); setSocia(null); }

  async function buscar() {
    setMsg(null); setSocia(null);
    const v = busca.trim();
    if (!v) return;
    const esNumero = /^\d{4,6}$/.test(v);
    setCargando(true);
    const r = await rpc("club_buscar", esNumero ? { p_clave: clave, p_numero: Number(v) } : { p_clave: clave, p_rut: v });
    setCargando(false);
    if (!r.ok) { if (r.error?.startsWith("Clave")) salir(); return setMsg({ e: r.error }); }
    setSocia(r.socia);
  }
  async function compra(bienvenida) {
    const r = await rpc("club_compra", { p_clave: clave, p_numero: socia.numero, p_bienvenida: bienvenida, p_tienda: tienda || null });
    if (!r.ok) return setMsg({ e: r.error });
    setSocia(r.socia);
    setMsg({ ok: `Listo. Aplica ${r.descuento}% de descuento a ${r.socia.primer_nombre}.` });
  }
  async function regalo() {
    if (!window.confirm(`¿Entregaste el regalo de cumpleaños a ${socia.primer_nombre}?`)) return;
    const r = await rpc("club_regalo", { p_clave: clave, p_numero: socia.numero, p_tienda: tienda || null });
    if (!r.ok) return setMsg({ e: r.error });
    setSocia(r.socia);
    setMsg({ ok: `Regalo anotado. ¡Feliz cumpleaños a ${r.socia.primer_nombre}! 🎂` });
  }

  if (!clave) return (
    <div style={s.page}><div style={s.wrap}>
      <Logo sub="Equipo Hindica" />
      <div style={s.card}>
        <label style={s.label}>Clave del equipo</label>
        <input style={s.input} type="password" value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} />
        <label style={s.label}>¿En qué tienda estás?</label>
        <select style={s.input} value={tienda} onChange={(e) => { setTienda(e.target.value); guardar("club_tienda", e.target.value); }}>
          <option value="">Elegir…</option>{TIENDAS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        {msg?.e && <div style={s.err}>{msg.e}</div>}
        <button style={{ ...s.btn, marginTop: 16 }} onClick={entrar}>Entrar</button>
      </div>
    </div></div>
  );

  const regaloTxt = { disponible: "🎁 Tiene regalo de cumpleaños disponible", entregado: "Regalo de este año ya entregado",
    proximo: "Regalo: desde su próximo cumpleaños", sin_fecha: "Sin fecha de cumpleaños" };

  return (
    <div style={s.page}><div style={s.wrap}>
      <Logo sub={`Equipo · ${TIENDAS.find((t) => t.id === tienda)?.nombre || "sin tienda"}`} />
      <div style={s.card}>
        <label style={{ ...s.label, marginTop: 0 }}>Número de socia o RUT</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={s.input} value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscar()} placeholder="Ej: 1023 o 12.345.678-9" />
          <button style={{ ...s.btn, width: 110 }} onClick={buscar}>{cargando ? "…" : "Buscar"}</button>
        </div>
        <div style={s.hint}>Si olvidó su número, búscala por RUT.</div>
      </div>

      {msg?.e && <div style={s.err}>{msg.e}</div>}
      {msg?.ok && <div style={{ ...s.ok, fontSize: 16, fontWeight: 600 }}>{msg.ok}</div>}

      {socia && (
        <div style={{ ...s.card, marginTop: 14 }}>
          <div style={{ fontSize: 13, color: C.muted }}>Socia N° {socia.numero}</div>
          <div style={{ fontFamily: serif, fontSize: 30, color: C.magenta }}>{socia.nombre}</div>
          <div style={{ background: C.soft, borderRadius: 12, padding: "10px 12px", margin: "10px 0 12px", fontSize: 14.5 }}>
            💬 Llámala por su nombre: <b>"{socia.primer_nombre}"</b>
            {socia.color_favorito && <> · le encanta el <b>{socia.color_favorito.toLowerCase()}</b></>}
          </div>
          {socia.cumple_hoy && <div style={{ ...s.ok, background: "#FFF1DC", color: C.saffron, fontWeight: 700 }}>🎂 ¡Hoy es su cumpleaños! Salúdala.</div>}
          {!socia.cumple_hoy && socia.cumple_este_mes && <div style={{ ...s.ok, background: "#FFF1DC", color: C.saffron }}>🎂 Está de cumpleaños este mes</div>}
          <div style={{ margin: "12px 0" }}>
            <span style={s.tag(socia.bienvenida_disponible ? C.magenta : C.teal)}>
              {socia.bienvenida_disponible ? "20% de bienvenida disponible" : "Descuento socia 5%"}</span>
            <span style={s.tag(socia.regalo === "disponible" ? C.saffron : C.muted)}>{regaloTxt[socia.regalo]}</span>
            <span style={s.tag(C.muted)}>{socia.compras} compra{socia.compras === 1 ? "" : "s"}</span>
          </div>
          {socia.bienvenida_disponible ? (
            <>
              <button style={s.btn} onClick={() => compra(true)}>Compra con 20% de bienvenida</button>
              <div style={s.hint}>El 20% se usa una sola vez y reemplaza al 5% en esa compra.</div>
            </>
          ) : (
            <button style={{ ...s.btn, background: C.teal }} onClick={() => compra(false)}>Compra con 5% de socia</button>
          )}
          {socia.regalo === "disponible" && (
            <button style={{ ...s.btn2, marginTop: 10, borderColor: C.saffron }} onClick={regalo}>🎁 Entregar regalo de cumpleaños</button>
          )}
        </div>
      )}

      <div style={{ ...s.card, marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>¿No es socia y quiere unirse?</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 10 }}>Que escanee el QR del mesón con su celular. Si no puede, inscríbela tú aquí mismo.</div>
        <button style={s.btn2} onClick={() => { window.location.href = `/?t=${tienda}`; }}>Abrir formulario de inscripción</button>
      </div>
      <button style={{ ...s.btn2, background: "transparent", border: "none", color: C.muted }} onClick={salir}>Cerrar sesión</button>
    </div></div>
  );
}

// ════════════════════════════════════════════════════════════════
//  3. PANEL DE LA DUEÑA  →  /#duena
// ════════════════════════════════════════════════════════════════
function Duena() {
  const [clave, setClave] = useState(() => { try { return sessionStorage.getItem("club_duena") || ""; } catch { return ""; } });
  const [entrada, setEntrada] = useState("");
  const [socias, setSocias] = useState(null);
  const [tab, setTab] = useState("cumple");
  const [error, setError] = useState("");

  async function cargar(k = clave) {
    const r = await rpc("club_duena_lista", { p_clave: k });
    if (!r.ok) { setError(r.error); setClave(""); try { sessionStorage.removeItem("club_duena"); } catch {} return; }
    setSocias(r.socias); setError("");
  }
  async function entrar() {
    const r = await rpc("club_duena_lista", { p_clave: entrada });
    if (!r.ok) return setError(r.error);
    try { sessionStorage.setItem("club_duena", entrada); } catch {}
    setClave(entrada); setSocias(r.socias); setError("");
  }
  useEffect(() => { if (clave) cargar(clave); }, []); // eslint-disable-line

  if (!clave || !socias) return (
    <div style={s.page}><div style={s.wrap}>
      <Logo sub="Panel de la dueña" />
      <div style={s.card}>
        <label style={s.label}>Clave de dueña</label>
        <input style={s.input} type="password" value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} />
        {error && <div style={s.err}>{error}</div>}
        <button style={{ ...s.btn, marginTop: 16 }} onClick={entrar}>Entrar</button>
        <div style={s.hint}>Por seguridad, la sesión se cierra al cerrar el navegador.</div>
      </div>
    </div></div>
  );

  const tabs = [["cumple", "🎂 Cumpleaños"], ["mensajes", "💌 Mensajes"], ["socias", "👥 Socias"], ["resumen", "📊 Resumen"]];
  return (
    <div style={s.page}><div style={s.wide}>
      <Logo sub={`${socias.length} socias`} />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14 }}>
        {tabs.map(([id, t]) => <div key={id} style={{ ...s.chip(tab === id), whiteSpace: "nowrap" }} onClick={() => setTab(id)}>{t}</div>)}
      </div>
      {tab === "cumple" && <Cumples socias={socias} clave={clave} recargar={cargar} />}
      {tab === "mensajes" && <Mensajes socias={socias} clave={clave} recargar={cargar} />}
      {tab === "socias" && <ListaSocias socias={socias} clave={clave} recargar={cargar} />}
      {tab === "resumen" && <Resumen socias={socias} />}
    </div></div>
  );
}

// Botón de 2 pasos: 1) anota el mensaje (y verifica el límite de 5)  2) abre WhatsApp
function BotonWhatsApp({ socia, clave, tipo, campana, texto, alEnviar }) {
  const [link, setLink] = useState(null);
  const [err, setErr] = useState("");
  async function preparar() {
    const r = await rpc("club_duena_mensaje", { p_clave: clave, p_numero: socia.numero, p_tipo: tipo, p_campana: campana || null });
    if (!r.ok) return setErr(r.error);
    setLink(waLink(socia.telefono, texto));
  }
  if (err) return <div style={{ fontSize: 13, color: C.red }}>{err}</div>;
  if (link) return (
    <a href={link} target="_blank" rel="noreferrer" onClick={() => setTimeout(alEnviar, 1500)}
       style={{ ...s.btn, display: "inline-block", width: "auto", padding: "9px 14px", fontSize: 14, background: "#1FA855", textDecoration: "none" }}>
      Abrir WhatsApp ›</a>
  );
  return <button style={{ ...s.btn2, width: "auto", padding: "9px 14px", fontSize: 14 }} onClick={preparar}>Preparar mensaje</button>;
}

function Cumples({ socias, clave, recargar }) {
  const h = hoy(); const mes = h.getMonth() + 1; const dia = h.getDate();
  const delMes = socias.filter((x) => x.cumple_mes === mes).sort((a, b) => a.cumple_dia - b.cumple_dia);
  const prox = socias.filter((x) => x.cumple_mes === (mes % 12) + 1).sort((a, b) => a.cumple_dia - b.cumple_dia);
  const fila = (x) => (
    <div key={x.numero} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
      padding: "11px 0", borderTop: `1px solid ${C.soft}`, background: x.cumple_dia === dia && x.cumple_mes === mes ? "#FFF6E8" : "transparent" }}>
      <div>
        <div style={{ fontWeight: 700 }}>{x.cumple_dia === dia && x.cumple_mes === mes ? "🎂 HOY · " : `${x.cumple_dia} ${MESES[x.cumple_mes - 1].slice(0, 3)} · `}{x.nombre}</div>
        <div style={{ fontSize: 13, color: C.muted }}>N° {x.numero} · {x.comuna} · regalo: {x.regalo} · mensajes {x.mensajes_anio}/5{x.baja ? " · NO ENVIAR" : ""}</div>
      </div>
      {!x.baja && x.cumple_mes === mes && x.cumple_dia <= dia + 0 && x.cumple_dia >= dia - 3 &&
        <BotonWhatsApp socia={x} clave={clave} tipo="cumpleanos" texto={txtCumple(x.nombre.split(" ")[0], x.numero)} alEnviar={recargar} />}
    </div>
  );
  return (
    <>
      <div style={s.card}>
        <div style={{ fontFamily: serif, fontSize: 20 }}>Este mes · {MESES[mes - 1]} ({delMes.length})</div>
        <div style={s.hint}>El botón de saludo aparece el día del cumpleaños (y hasta 3 días después, por si se te pasó). Se envía desde el WhatsApp de este teléfono: ábrelo en el teléfono que tiene el WhatsApp Business de Hindica.</div>
        {delMes.length ? delMes.map(fila) : <div style={s.hint}>Nadie cumple años este mes.</div>}
      </div>
      <div style={s.card}>
        <div style={{ fontFamily: serif, fontSize: 20 }}>Próximo mes · {MESES[mes % 12]} ({prox.length})</div>
        <div style={s.hint}>Para preparar regalos con tiempo.</div>
        {prox.map(fila)}
      </div>
    </>
  );
}

function Mensajes({ socias, clave, recargar }) {
  const [campana, setCampana] = useState(leer("club_campana") || "");
  const [texto, setTexto] = useState(leer("club_campana_txt") || "¡Hola {nombre}! 🌸 Como socia del Club Hindica, eres la primera en saberlo: ");
  const [filtro, setFiltro] = useState("todas");
  const listas = socias.filter((x) => !x.baja && x.mensajes_anio < 5);
  const comunas = [...new Set(listas.map((x) => x.comuna).filter(Boolean))].sort();
  const visibles = filtro === "todas" ? listas : listas.filter((x) => x.comuna === filtro);
  const ok = campana.trim().length >= 3 && texto.includes("{nombre}");
  return (
    <>
      <div style={s.card}>
        <div style={{ fontFamily: serif, fontSize: 20 }}>Nuevo mensaje del Club</div>
        <div style={s.hint}>Recuerda: prometimos máximo 5 al año por socia (contando el de cumpleaños). El sistema no deja pasar del límite ni repetir el mismo mensaje.</div>
        <label style={s.label}>Nombre corto del mensaje (para no repetirlo)</label>
        <input style={s.input} value={campana} onChange={(e) => { setCampana(e.target.value); guardar("club_campana", e.target.value); }} placeholder="Ej: coleccion-verano-2027" />
        <label style={s.label}>Texto · escribe {"{nombre}"} donde va su nombre</label>
        <textarea style={{ ...s.input, minHeight: 110 }} value={texto} onChange={(e) => { setTexto(e.target.value); guardar("club_campana_txt", e.target.value); }} />
        <label style={s.label}>Enviar a</label>
        <select style={s.input} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todas">Todas ({listas.length})</option>
          {comunas.map((c) => <option key={c} value={c}>{c} ({listas.filter((x) => x.comuna === c).length})</option>)}
        </select>
      </div>
      <div style={s.card}>
        {!ok && <div style={s.hint}>Escribe el nombre del mensaje y un texto que incluya {"{nombre}"}.</div>}
        {ok && visibles.map((x) => (
          <div key={x.numero} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.soft}` }}>
            <div><div style={{ fontWeight: 600 }}>{x.nombre}</div><div style={{ fontSize: 13, color: C.muted }}>N° {x.numero} · {x.comuna} · {x.mensajes_anio}/5</div></div>
            <BotonWhatsApp socia={x} clave={clave} tipo="campana" campana={campana.trim()} texto={texto.replaceAll("{nombre}", x.nombre.split(" ")[0])} alEnviar={recargar} />
          </div>
        ))}
      </div>
    </>
  );
}

function ListaSocias({ socias, clave, recargar }) {
  const [q, setQ] = useState("");
  const [abierta, setAbierta] = useState(null);
  const lista = socias.filter((x) => !q || `${x.numero} ${x.nombre} ${x.comuna}`.toLowerCase().includes(q.toLowerCase())).slice().reverse();
  async function baja(x) {
    if (!window.confirm(x.baja ? `¿Volver a enviarle mensajes a ${x.nombre}?` : `¿${x.nombre} pidió no recibir más mensajes?`)) return;
    await rpc("club_duena_baja", { p_clave: clave, p_numero: x.numero, p_baja: !x.baja }); recargar();
  }
  async function borrar(x) {
    const conf = window.prompt(`Esto BORRA para siempre a ${x.nombre} y su historial.\nEscribe su número (${x.numero}) para confirmar:`);
    if (conf !== String(x.numero)) return;
    await rpc("club_duena_eliminar", { p_clave: clave, p_numero: x.numero }); recargar();
  }
  return (
    <div style={s.card}>
      <input style={s.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, número o comuna" />
      {lista.map((x) => (
        <div key={x.numero} style={{ padding: "11px 0", borderTop: `1px solid ${C.soft}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAbierta(abierta === x.numero ? null : x.numero)}>
            <div><b>{x.nombre}</b> <span style={{ color: C.muted, fontSize: 13 }}>N° {x.numero}</span></div>
            <span style={s.tag(x.activa ? C.green : C.muted)}>{x.activa ? "Activa" : "Sin compras"}</span>
          </div>
          {abierta === x.numero && (
            <div style={{ fontSize: 14, color: C.ink, marginTop: 8, lineHeight: 1.7 }}>
              📱 +{x.telefono} · 🎂 {x.cumple_dia ? `${x.cumple_dia} de ${MESES[x.cumple_mes - 1]}` : "—"} · {x.rango_edad || "—"}<br />
              📍 {x.comuna || "—"} · Se unió en {TIENDAS.find((t) => t.id === x.tienda)?.nombre || "—"} · RUT …{x.rut_final || "—"}<br />
              🎨 {x.color_favorito || "—"}{x.combinacion ? ` · ${x.combinacion}` : ""}<br />
              🛍️ {x.compras} compras · 20% bienvenida: {x.bienvenida_usada ? "usado" : "disponible"} · regalo: {x.regalo} · mensajes {x.mensajes_anio}/5
              {!x.consentimiento && <><br /><span style={{ color: C.saffron }}>⚠ Inscrita con el formulario antiguo (sin aceptar las nuevas condiciones)</span></>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button style={{ ...s.btn2, width: "auto", padding: "8px 12px", fontSize: 13 }} onClick={() => baja(x)}>{x.baja ? "Reactivar mensajes" : "No más mensajes"}</button>
                <button style={{ ...s.btn2, width: "auto", padding: "8px 12px", fontSize: 13, color: C.red }} onClick={() => borrar(x)}>Borrar sus datos</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Resumen({ socias }) {
  const cuenta = (campo) => {
    const m = {}; socias.forEach((x) => { const v = x[campo] || "—"; m[v] = (m[v] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };
  const activas = socias.filter((x) => x.activa).length;
  const h = hoy(); const mesActual = socias.filter((x) => { const d = new Date(x.inscrita); return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear(); }).length;
  const Bloque = ({ titulo, datos, nombres }) => (
    <div style={s.card}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{titulo}</div>
      {datos.slice(0, 10).map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, margin: "5px 0", fontSize: 14 }}>
          <div style={{ width: 130 }}>{nombres ? nombres(k) : k}</div>
          <div style={{ flex: 1, background: C.soft, borderRadius: 6 }}><div style={{ width: `${(v / socias.length) * 100}%`, background: C.magenta, height: 10, borderRadius: 6 }} /></div>
          <div style={{ width: 30, textAlign: "right" }}>{v}</div>
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        {[["Socias", socias.length], ["Con compras", activas], ["Nuevas este mes", mesActual], ["Usaron el 20%", socias.filter((x) => x.bienvenida_usada).length]].map(([t, v]) => (
          <div key={t} style={{ ...s.card, marginBottom: 0, textAlign: "center" }}><div style={{ fontFamily: serif, fontSize: 30, color: C.magenta }}>{v}</div><div style={{ fontSize: 13, color: C.muted }}>{t}</div></div>
        ))}
      </div>
      <Bloque titulo="Dónde se inscribieron" datos={cuenta("tienda")} nombres={(k) => TIENDAS.find((t) => t.id === k)?.nombre || k} />
      <Bloque titulo="Comunas" datos={cuenta("comuna")} />
      <Bloque titulo="Edades" datos={cuenta("rango_edad")} />
      <Bloque titulo="Colores favoritos" datos={cuenta("color_favorito")} />
    </>
  );
}
