import { useState, useEffect } from "react";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://cwjfxuelbzlxingxylfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_4Mex1P359ZgUxk2VmS1iRA_oAVwjGmc";

const db = {
  async get(table, filters={}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    Object.entries(filters).forEach(([k,v])=>url+=`&${k}=eq.${v}`);
    const res = await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{
      method:"POST",
      headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},
      body:JSON.stringify(data)
    });
    return res.json();
  },
};

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#FAF7F2", dark:"#1C3A2E", orange:"#E8621F", purple:"#8B3A7E",
  gold:"#C9963E", text:"#1A1A1A", muted:"#7A7065", border:"#DDD5C8",
  green:"#2D7A45", red:"#C0392B", white:"#FFFFFF",
};
const sInput = { width:"100%", padding:"15px 18px", borderRadius:14, border:`2px solid ${C.border}`, fontSize:16, background:C.white, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" };
const sBtn = (color=C.orange, full=false) => ({ background:color, color:C.white, border:"none", borderRadius:16, padding:"17px 24px", fontSize:16, fontWeight:800, cursor:"pointer", width:full?"100%":"auto", fontFamily:"inherit" });

// ─── DATOS ────────────────────────────────────────────────────────────────────
const COMUNAS = [
  "Las Condes","Vitacura","Lo Barnechea","Providencia","Ñuñoa","La Reina",
  "Santiago Centro","Peñalolén","Macul","San Miguel","La Florida","Huechuraba",
  "Colina / Chicureo","Maitencillo","Papudo","Zapallar","Cachagua","Reñaca",
  "Viña del Mar","Concón","Valparaíso","Otra"
];

const RANGOS_EDAD = ["Menos de 25","25 – 34","35 – 44","45 – 54","55 – 64","65 o más"];

const COLORES = [
  {n:"Azul", h:"#3B6EA5"}, {n:"Turquesa", h:"#3BA5A0"}, {n:"Verde", h:"#4A8B5C"},
  {n:"Morado", h:"#8B3A7E"}, {n:"Rosa", h:"#D96BA0"}, {n:"Rojo", h:"#C0392B"},
  {n:"Naranja", h:"#E8621F"}, {n:"Amarillo", h:"#D9A93B"}, {n:"Tierra", h:"#A67C52"},
  {n:"Café", h:"#6B4E37"}, {n:"Negro", h:"#2C2C2C"}, {n:"Blanco", h:"#F5F2ED"},
];

const COMBINACIONES = [
  "Tonos tierra y naturales",
  "Colores vivos y contrastantes",
  "Azules y turquesas",
  "Rosados y morados",
  "Verdes y dorados",
  "Neutros con un toque de color",
  "Todo colorido, sin miedo",
];

const BENEFICIOS = [
  { icono:"🏷️", titulo:"Precio de socia", texto:"Precio especial en toda la ropa, siempre." },
  { icono:"🎁", titulo:"3 x 2 en accesorios", texto:"Llevas tres, pagas dos. En aros, collares, pulseras y más." },
  { icono:"🎂", titulo:"Regalo de cumpleaños", texto:"Un regalo para ti, sin necesidad de comprar nada. Lo retiras en tienda cuando puedas." },
  { icono:"📵", titulo:"Máximo 6 mensajes al año", texto:"No te vamos a molestar. Te escribimos solo cuando vale la pena." },
  { icono:"✨", titulo:"Eventos exclusivos", texto:"Invitaciones a eventos solo para socias, cerca de donde vives." },
  { icono:"👗", titulo:"Primero en todo", texto:"Acceso anticipado a colecciones nuevas y liquidaciones." },
];

// ─── COMPONENTES ──────────────────────────────────────────────────────────────
function Progreso({ actual, total }) {
  return (
    <div style={{ padding:"0 24px", marginBottom:28 }}>
      <div style={{ display:"flex", gap:6 }}>
        {Array.from({length:total}).map((_,i)=>(
          <div key={i} style={{ flex:1, height:4, borderRadius:4, background: i<actual ? C.orange : "rgba(255,255,255,0.15)", transition:"all 0.3s" }}/>
        ))}
      </div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:10, fontWeight:600 }}>
        Paso {actual} de {total}
      </div>
    </div>
  );
}

function Pantalla({ children, titulo, subtitulo }) {
  return (
    <div style={{ minHeight:"100vh", background:C.dark, fontFamily:"system-ui,-apple-system,sans-serif", display:"flex", flexDirection:"column" }}>
      {children}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function ClubHindica() {
  const [paso, setPaso] = useState("bienvenida");
  const [datos, setDatos] = useState({
    nombre:"", telefono:"", cumple_dia:"", cumple_mes:"",
    comuna:"", rango_edad:"", color_favorito:"", combinacion:"",
  });
  const [numeroSocia, setNumeroSocia] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const set = (k,v) => setDatos(p=>({...p,[k]:v}));

  const registrar = async () => {
    setEnviando(true);
    setError("");
    try {
      const existentes = await db.get("socias", {});
      const siguiente = 1001 + (Array.isArray(existentes) ? existentes.length : 0);
      const res = await db.insert("socias", {
        numero_socia: siguiente,
        nombre: datos.nombre,
        telefono: datos.telefono,
        cumple_dia: Number(datos.cumple_dia),
        cumple_mes: Number(datos.cumple_mes),
        comuna: datos.comuna,
        rango_edad: datos.rango_edad,
        color_favorito: datos.color_favorito,
        combinacion_favorita: datos.combinacion,
        activa: false,
      });
      setNumeroSocia(siguiente);
      setPaso("bienvenidaClub");
    } catch(e) {
      setError("Hubo un problema. Intenta de nuevo o pídele ayuda a la vendedora.");
    }
    setEnviando(false);
  };

  // ── BIENVENIDA ──────────────────────────────────────────────────────────────
  if (paso === "bienvenida") return (
    <Pantalla>
      <div style={{ padding:"56px 28px 36px", textAlign:"center" }}>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:"6px", textTransform:"uppercase", marginBottom:14 }}>BIENVENIDA AL</div>
        <div style={{ fontSize:38, fontWeight:900, color:C.white, letterSpacing:"4px", lineHeight:1.1 }}>CLUB<br/>HINDICA</div>
        <div style={{ width:44, height:3, background:C.orange, margin:"20px auto" }}/>
        <div style={{ fontSize:15, color:"rgba(255,255,255,0.6)", lineHeight:1.6, maxWidth:300, margin:"0 auto" }}>
          Un espacio para nuestras clientas más queridas. Gratis, para siempre.
        </div>
      </div>

      <div style={{ flex:1, background:C.bg, borderRadius:"32px 32px 0 0", padding:"32px 22px 40px" }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.orange, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:20, textAlign:"center" }}>
          Tus beneficios
        </div>

        {BENEFICIOS.map((b,i)=>(
          <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start", padding:"16px 0", borderBottom: i<BENEFICIOS.length-1 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize:26, flexShrink:0, lineHeight:1 }}>{b.icono}</span>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:C.dark, marginBottom:3 }}>{b.titulo}</div>
              <div style={{ fontSize:13.5, color:C.muted, lineHeight:1.5 }}>{b.texto}</div>
            </div>
          </div>
        ))}

        <div style={{ background:"#FEF8F3", border:`1.5px solid ${C.orange}`, borderRadius:16, padding:"18px 20px", margin:"24px 0" }}>
          <div style={{ fontSize:14, fontWeight:800, color:C.orange, marginBottom:6 }}>Tranquila, no te vamos a molestar</div>
          <div style={{ fontSize:13.5, color:C.muted, lineHeight:1.6 }}>
            Te escribimos como máximo 6 veces al año. Solo para cosas que realmente valen la pena: eventos, colecciones nuevas y tu regalo de cumpleaños.
          </div>
        </div>

        <button onClick={()=>setPaso("nombre")} style={{ ...sBtn(C.orange,true), padding:"19px", fontSize:17 }}>
          Quiero ser socia →
        </button>
        <div style={{ textAlign:"center", fontSize:12.5, color:C.muted, marginTop:14 }}>
          Toma menos de un minuto. Es gratis.
        </div>
      </div>
    </Pantalla>
  );

  // ── NOMBRE ──────────────────────────────────────────────────────────────────
  if (paso === "nombre") return (
    <Pantalla>
      <div style={{ padding:"36px 0 0" }}>
        <Progreso actual={1} total={6}/>
      </div>
      <div style={{ flex:1, background:C.bg, borderRadius:"28px 28px 0 0", padding:"32px 22px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:8, lineHeight:1.3 }}>¿Cómo te llamas?</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:26 }}>Para saludarte por tu nombre cuando vengas.</div>
        <input style={sInput} placeholder="Tu nombre" value={datos.nombre} onChange={e=>set("nombre",e.target.value)} autoFocus/>
        <button disabled={!datos.nombre.trim()} onClick={()=>setPaso("telefono")} style={{ ...sBtn(datos.nombre.trim()?C.orange:C.border,true), marginTop:24, opacity: datos.nombre.trim()?1:0.5 }}>
          Continuar →
        </button>
      </div>
    </Pantalla>
  );

  // ── TELÉFONO ────────────────────────────────────────────────────────────────
  if (paso === "telefono") return (
    <Pantalla>
      <div style={{ padding:"36px 0 0" }}>
        <Progreso actual={2} total={6}/>
      </div>
      <div style={{ flex:1, background:C.bg, borderRadius:"28px 28px 0 0", padding:"32px 22px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:8, lineHeight:1.3 }}>Tu teléfono</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:26 }}>Solo para avisarte de eventos y tu regalo de cumpleaños. Máximo 6 veces al año.</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:C.muted }}>+56</span>
          <input style={sInput} type="tel" placeholder="9 1234 5678" value={datos.telefono} onChange={e=>set("telefono",e.target.value.replace(/\D/g,"").slice(0,9))} autoFocus/>
        </div>
        <button disabled={datos.telefono.length<8} onClick={()=>setPaso("cumple")} style={{ ...sBtn(datos.telefono.length>=8?C.orange:C.border,true), marginTop:24, opacity: datos.telefono.length>=8?1:0.5 }}>
          Continuar →
        </button>
        <button onClick={()=>setPaso("nombre")} style={{ background:"transparent", border:"none", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:16, width:"100%" }}>← Atrás</button>
      </div>
    </Pantalla>
  );

  // ── CUMPLEAÑOS ──────────────────────────────────────────────────────────────
  if (paso === "cumple") {
    const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const ok = datos.cumple_dia && datos.cumple_mes;
    return (
      <Pantalla>
        <div style={{ padding:"36px 0 0" }}>
          <Progreso actual={3} total={6}/>
        </div>
        <div style={{ flex:1, background:C.bg, borderRadius:"28px 28px 0 0", padding:"32px 22px 40px" }}>
          <div style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:8, lineHeight:1.3 }}>¿Cuándo es tu cumpleaños? 🎂</div>
          <div style={{ fontSize:14, color:C.muted, marginBottom:26 }}>Tenemos un regalo para ti. Sin comprar nada.</div>

          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>Día</div>
          <input style={{...sInput, marginBottom:22}} type="number" placeholder="Ej: 15" value={datos.cumple_dia} onChange={e=>{const v=e.target.value; if(v==="" || (Number(v)>=1 && Number(v)<=31)) set("cumple_dia",v);}}/>

          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>Mes</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {MESES.map((m,i)=>(
              <button key={m} onClick={()=>set("cumple_mes",String(i+1))} style={{
                padding:"12px 6px", borderRadius:12, fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer",
                border:`2px solid ${datos.cumple_mes===String(i+1)?C.orange:C.border}`,
                background: datos.cumple_mes===String(i+1)?"#FEF0E8":C.white,
                color: datos.cumple_mes===String(i+1)?C.orange:C.text,
              }}>{m.slice(0,3)}</button>
            ))}
          </div>

          <button disabled={!ok} onClick={()=>setPaso("comuna")} style={{ ...sBtn(ok?C.orange:C.border,true), marginTop:26, opacity: ok?1:0.5 }}>
            Continuar →
          </button>
          <button onClick={()=>setPaso("telefono")} style={{ background:"transparent", border:"none", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:16, width:"100%" }}>← Atrás</button>
        </div>
      </Pantalla>
    );
  }

  // ── COMUNA ──────────────────────────────────────────────────────────────────
  if (paso === "comuna") return (
    <Pantalla>
      <div style={{ padding:"36px 0 0" }}>
        <Progreso actual={4} total={6}/>
      </div>
      <div style={{ flex:1, background:C.bg, borderRadius:"28px 28px 0 0", padding:"32px 22px 40px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:8, lineHeight:1.3 }}>¿Dónde vives?</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>Para invitarte a eventos cerca tuyo.</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {COMUNAS.map(c=>(
            <button key={c} onClick={()=>{set("comuna",c); setTimeout(()=>setPaso("edad"),200);}} style={{
              padding:"11px 16px", borderRadius:22, fontFamily:"inherit", fontSize:14, fontWeight:600, cursor:"pointer",
              border:`2px solid ${datos.comuna===c?C.orange:C.border}`,
              background: datos.comuna===c?"#FEF0E8":C.white,
              color: datos.comuna===c?C.orange:C.text,
            }}>{c}</button>
          ))}
        </div>
        <button onClick={()=>setPaso("cumple")} style={{ background:"transparent", border:"none", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:26, width:"100%" }}>← Atrás</button>
      </div>
    </Pantalla>
  );

  // ── EDAD ────────────────────────────────────────────────────────────────────
  if (paso === "edad") return (
    <Pantalla>
      <div style={{ padding:"36px 0 0" }}>
        <Progreso actual={5} total={6}/>
      </div>
      <div style={{ flex:1, background:C.bg, borderRadius:"28px 28px 0 0", padding:"32px 22px 40px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:8, lineHeight:1.3 }}>¿En qué rango de edad estás?</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>Nos ayuda a elegir mejor lo que traemos.</div>
        {RANGOS_EDAD.map(r=>(
          <button key={r} onClick={()=>{set("rango_edad",r); setTimeout(()=>setPaso("colores"),200);}} style={{
            width:"100%", padding:"17px 20px", borderRadius:14, fontFamily:"inherit", fontSize:16, fontWeight:700, cursor:"pointer", textAlign:"left", marginBottom:10,
            border:`2px solid ${datos.rango_edad===r?C.orange:C.border}`,
            background: datos.rango_edad===r?"#FEF0E8":C.white,
            color: datos.rango_edad===r?C.orange:C.text,
          }}>{r}</button>
        ))}
        <button onClick={()=>setPaso("comuna")} style={{ background:"transparent", border:"none", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:16, width:"100%" }}>← Atrás</button>
      </div>
    </Pantalla>
  );

  // ── COLORES ─────────────────────────────────────────────────────────────────
  if (paso === "colores") {
    const ok = datos.color_favorito && datos.combinacion;
    return (
      <Pantalla>
        <div style={{ padding:"36px 0 0" }}>
          <Progreso actual={6} total={6}/>
        </div>
        <div style={{ flex:1, background:C.bg, borderRadius:"28px 28px 0 0", padding:"32px 22px 40px" }}>
          <div style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:8, lineHeight:1.3 }}>Cuéntanos de colores 🎨</div>
          <div style={{ fontSize:14, color:C.muted, marginBottom:26 }}>Así elegimos mejor lo que traemos de India, pensando en ti.</div>

          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>Tu color favorito</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:28 }}>
            {COLORES.map(c=>(
              <button key={c.n} onClick={()=>set("color_favorito",c.n)} style={{
                padding:"10px 4px", borderRadius:12, fontFamily:"inherit", cursor:"pointer",
                border:`2.5px solid ${datos.color_favorito===c.n?C.dark:"transparent"}`,
                background: C.white, display:"flex", flexDirection:"column", alignItems:"center", gap:6,
              }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:c.h, border: c.n==="Blanco" ? `1px solid ${C.border}` : "none" }}/>
                <span style={{ fontSize:11, fontWeight:600, color:C.text }}>{c.n}</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>Tu combinación favorita</div>
          {COMBINACIONES.map(c=>(
            <button key={c} onClick={()=>set("combinacion",c)} style={{
              width:"100%", padding:"15px 18px", borderRadius:13, fontFamily:"inherit", fontSize:14.5, fontWeight:600, cursor:"pointer", textAlign:"left", marginBottom:9,
              border:`2px solid ${datos.combinacion===c?C.orange:C.border}`,
              background: datos.combinacion===c?"#FEF0E8":C.white,
              color: datos.combinacion===c?C.orange:C.text,
            }}>{c}</button>
          ))}

          {error && <div style={{ background:"#FDECEA", border:`1.5px solid ${C.red}`, borderRadius:12, padding:14, marginTop:18, fontSize:14, color:C.red }}>{error}</div>}

          <button disabled={!ok || enviando} onClick={registrar} style={{ ...sBtn(ok&&!enviando?C.green:C.border,true), marginTop:26, opacity: ok&&!enviando?1:0.5, padding:"19px", fontSize:17 }}>
            {enviando ? "Creando tu membresía…" : "✓ Ser socia del Club Hindica"}
          </button>
          <button onClick={()=>setPaso("edad")} style={{ background:"transparent", border:"none", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:16, width:"100%" }}>← Atrás</button>
        </div>
      </Pantalla>
    );
  }

  // ── BIENVENIDA AL CLUB ──────────────────────────────────────────────────────
  if (paso === "bienvenidaClub") return (
    <div style={{ minHeight:"100vh", background:C.dark, fontFamily:"system-ui,-apple-system,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", textAlign:"center" }}>
      <div style={{ fontSize:56, marginBottom:20 }}>🌿</div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"5px", textTransform:"uppercase", marginBottom:12 }}>BIENVENIDA AL CLUB</div>
      <div style={{ fontSize:28, fontWeight:900, color:C.white, marginBottom:8, lineHeight:1.2 }}>¡Ya eres socia,<br/>{datos.nombre}!</div>

      <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:24, padding:"28px 36px", margin:"28px 0", width:"100%", maxWidth:320 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>Tu número de socia</div>
        <div style={{ fontSize:52, fontWeight:900, color:C.gold, letterSpacing:"2px", lineHeight:1 }}>{numeroSocia}</div>
        <div style={{ width:36, height:2, background:"rgba(255,255,255,0.2)", margin:"18px auto" }}/>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>
          Muéstrale este número a la vendedora para activar tus beneficios en tu próxima compra.
        </div>
      </div>

      <div style={{ background:"rgba(232,98,31,0.15)", border:`1px solid ${C.orange}`, borderRadius:16, padding:"16px 20px", maxWidth:320, marginBottom:24 }}>
        <div style={{ fontSize:13.5, color:"rgba(255,255,255,0.8)", lineHeight:1.6 }}>
          <strong style={{ color:C.orange }}>Toma una captura de pantalla</strong> para guardar tu número. También te lo enviaremos por WhatsApp.
        </div>
      </div>

      <div style={{ fontSize:13.5, color:"rgba(255,255,255,0.5)", lineHeight:1.7, maxWidth:300 }}>
        Nos vemos pronto. Y no olvides: tu regalo de cumpleaños te espera el {datos.cumple_dia} de {["","enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][Number(datos.cumple_mes)]}. 🎂
      </div>
    </div>
  );

  return null;
}
