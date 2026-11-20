// Utilidades de horarios. Lógica pura (sin React ni Supabase).
// "dia_semana" sigue el criterio de la base de datos: 0 = domingo ... 6 = sábado.

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Tabasco usa la hora del centro de México.
const ZONA_HORARIA = "America/Mexico_City";

// "09:00:00" → "9:00 a. m." · "16:30:00" → "4:30 p. m." · "00:00:00" → "12:00 a. m."
export function formatoHora(hora) {
  const [h, m] = String(hora).split(":").map(Number);
  const periodo = h >= 12 ? "p. m." : "a. m.";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${periodo}`;
}

const aMinutos = (hora) => {
  const [h, m] = String(hora).split(":").map(Number);
  return h * 60 + m;
};

// Día de la semana (0-6) y minutos transcurridos del día en Villahermosa.
export function ahoraEnVillahermosa(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));
  return { dia, minutos: Number(valor("hour")) * 60 + Number(valor("minute")) };
}

// Los 7 días, cada uno con sus franjas. Un día sin registros queda como "sinDatos".
export function agruparPorDia(horarios) {
  return DIAS.map((nombre, dia) => {
    const filas = horarios.filter((h) => h.dia_semana === dia);
    const franjas = filas.filter((h) => !h.cerrado).map((h) => ({ abre: h.abre, cierra: h.cierra }));
    return {
      dia,
      nombre,
      sinDatos: filas.length === 0,
      cerrado: filas.length > 0 && franjas.length === 0,
      franjas: franjas.sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre)),
    };
  });
}

// ¿Está abierto en este momento? Devuelve { conocido, abierto, texto }.
// Una franja con cierre menor o igual a la apertura cruza la medianoche (p. ej. 6 p. m. – 2 a. m.).
export function estadoAhora(horarios, fecha = new Date()) {
  if (!horarios || horarios.length === 0) return { conocido: false, abierto: false, texto: "" };

  const { dia, minutos } = ahoraEnVillahermosa(fecha);
  const dias = agruparPorDia(horarios);
  const hoy = dias[dia];
  const ayer = dias[(dia + 6) % 7];

  // Franja que viene de ayer y todavía no termina (cruza la medianoche).
  for (const f of ayer.franjas) {
    if (aMinutos(f.cierra) <= aMinutos(f.abre) && minutos < aMinutos(f.cierra)) {
      return { conocido: true, abierto: true, texto: `Abierto ahora · cierra ${formatoHora(f.cierra)}` };
    }
  }

  for (const f of hoy.franjas) {
    const abre = aMinutos(f.abre);
    const cierra = aMinutos(f.cierra);
    const cruzaMedianoche = cierra <= abre;
    if (minutos >= abre && (cruzaMedianoche || minutos < cierra)) {
      return { conocido: true, abierto: true, texto: `Abierto ahora · cierra ${formatoHora(f.cierra)}` };
    }
  }

  const siguiente = hoy.franjas.find((f) => aMinutos(f.abre) > minutos);
  return {
    conocido: true,
    abierto: false,
    texto: siguiente ? `Cerrado · abre ${formatoHora(siguiente.abre)}` : "Cerrado ahora",
  };
}

// Fecha de hoy en Villahermosa como "AAAA-MM-DD" (para comparar con fechas de la base de datos).
export function fechaHoyVillahermosa(fecha = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(fecha);
}

// "2026-12-31" → "31 de diciembre" (se fija el mediodía para que la zona horaria no mueva el día).
export function fechaCorta(fechaIso) {
  return new Date(`${fechaIso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
}
