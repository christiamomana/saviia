// Espacios comunes y sus reglas, traducidas de los Manuales de Uso oficiales
// del Conjunto Residencial Saviia PH. Esta es la única fuente de verdad para
// el seed de la base de datos y para los textos informativos que se muestran
// en la UI antes de reservar.

/** Ventana horaria "HH:mm" - "HH:mm", en hora de Bogotá. */
export type TimeWindow = [start: string, end: string];

/** Horario semanal, llave = día ISO (1 = lunes ... 7 = domingo). */
export type WeeklySchedule = Record<string, TimeWindow[]>;

export interface SpaceDefinition {
  slug: string;
  name: string;
  description: string;
  /** Reglas informativas mostradas en la página del espacio (no todas se validan automáticamente). */
  rules: string[];
  /** Aforo máximo simultáneo (placeholder editable por el admin; ver manual, remite a NSR-10). */
  capacity: number;
  /** Anticipación mínima requerida, en días calendario (0 = se puede reservar el mismo día, sujeto a disponibilidad). */
  minAdvanceDays: number;
  /** Duración fija de cada turno reservable, en minutos. */
  slotMinutes: number;
  /** Máximo de slots (horas) que un mismo residente puede reservar en un día. */
  maxSlotsPerBookingPerDay?: number;
  /** Máximo de reservas distintas por unidad/apartamento en un día. */
  maxBookingsPerUnitPerDay?: number;
  /** Máximo de personas (partySize) por reserva. */
  maxPeoplePerBooking?: number;
  schedule: WeeklySchedule;
}

export const SPACE_DEFS: SpaceDefinition[] = [
  {
    slug: "gimnasio",
    name: "Gimnasio",
    description:
      "Zona común destinada exclusivamente al ejercicio físico, dotada de máquinas y pesas.",
    capacity: 15,
    minAdvanceDays: 0,
    slotMinutes: 60,
    schedule: {
      "1": [["14:00", "21:00"]],
      "2": [["06:00", "10:00"], ["17:00", "21:00"]],
      "3": [["06:00", "10:00"], ["17:00", "21:00"]],
      "4": [["06:00", "10:00"], ["17:00", "21:00"]],
      "5": [["06:00", "10:00"], ["17:00", "21:00"]],
      "6": [["07:00", "12:00"], ["17:00", "21:00"]],
      "7": [["08:00", "12:00"], ["17:00", "21:00"]],
    },
    rules: [
      "Puedes reservar el mismo día si hay disponibilidad; cancela con al menos 12 horas de anticipación si no vas a asistir, para liberar el cupo.",
      "La inasistencia reiterada sin cancelación (no-show) puede suspender temporalmente tu derecho a reservar.",
      "Usa ropa deportiva y tenis cerrados de suela no marcante; lleva toalla y botella de agua.",
      "Limpia y desinfecta cada máquina antes y después de usarla, y devuelve los implementos a su lugar.",
      "Menores de edad solo pueden ingresar según la edad mínima publicada por la Administración.",
      "No se permite fumar, alcohol, sustancias psicoactivas ni mascotas (salvo animales de asistencia).",
      "El uso de los equipos es responsabilidad exclusiva de cada usuario; el conjunto no presta asesoría médica ni de entrenamiento.",
    ],
  },
  {
    slug: "piscina",
    name: "Piscina",
    description: "Zona común recreativa de uso incluido en la cuota de administración.",
    capacity: 20,
    minAdvanceDays: 0,
    slotMinutes: 60,
    maxPeoplePerBooking: 4,
    schedule: {
      "2": [["07:00", "10:00"], ["16:00", "20:00"]],
      "3": [["07:00", "10:00"], ["16:00", "20:00"]],
      "4": [["07:00", "10:00"], ["16:00", "20:00"]],
      "5": [["07:00", "10:00"], ["16:00", "20:00"]],
      "6": [["08:00", "12:00"], ["13:00", "16:00"]],
      "7": [["08:00", "12:00"], ["13:00", "16:00"]],
    },
    rules: [
      "Máximo 4 personas por unidad/grupo familiar en cada turno reservado.",
      "Debes estar al día en el pago de administración para poder ingresar.",
      "Los lunes (o martes si el lunes es festivo) la piscina permanece cerrada por mantenimiento.",
      "Duchate antes de ingresar y usa vestido de baño adecuado; no se permite ropa o calzado de calle.",
      "Los menores de 12 años deben permanecer siempre bajo supervisión directa de un adulto responsable.",
      "No se permiten clavados, alimentos, envases de vidrio, mascotas ni alcohol/sustancias psicoactivas dentro del área.",
      "No circules por zonas comunes en traje de baño, con toallas o ropa mojada.",
    ],
  },
  {
    slug: "coworking",
    name: "Salón Coworking",
    description:
      "Espacio de trabajo compartido para uso individual o en pequeños grupos, con Wi-Fi gratuito.",
    capacity: 6,
    minAdvanceDays: 0,
    slotMinutes: 60,
    maxSlotsPerBookingPerDay: 4,
    maxBookingsPerUnitPerDay: 2,
    schedule: {
      "1": [["14:00", "19:00"]],
      "2": [["07:00", "19:00"]],
      "3": [["07:00", "19:00"]],
      "4": [["07:00", "19:00"]],
      "5": [["07:00", "19:00"]],
      "6": [["07:00", "19:00"]],
      "7": [["07:00", "19:00"]],
    },
    rules: [
      "Cada apartamento puede usar el espacio con máximo 2 usuarios por día; cada usuario dispone de hasta 4 horas diarias.",
      "El servicio no genera costo. La clave de Wi-Fi la suministra la Administración; úsala de forma responsable.",
      "Mantén un ambiente silencioso: llamadas y reuniones deben ser en tono bajo o con audífonos.",
      "No se permiten actividades comerciales, ventas ni capacitaciones masivas sin autorización de la Administración.",
      "Al finalizar, deja el puesto ordenado, apaga las luces y retira tus pertenencias.",
      "No se permite fumar ni el ingreso de mascotas (salvo animales de asistencia).",
    ],
  },
  {
    slug: "salon-juegos-adultos",
    name: "Salón de Juegos para Adultos",
    description:
      "Espacio de recreación con ping pong, futbolín, consola y TV para residentes mayores de edad.",
    capacity: 10,
    minAdvanceDays: 0,
    slotMinutes: 60,
    schedule: {
      "2": [["08:00", "20:00"]],
      "3": [["08:00", "20:00"]],
      "4": [["08:00", "20:00"]],
      "5": [["08:00", "20:00"]],
      "6": [["08:00", "20:00"]],
      "7": [["08:00", "20:00"]],
    },
    rules: [
      "El ingreso es para residentes mayores de edad; menores de 7 años en adelante solo acompañados de un adulto responsable.",
      "Los elementos de juego se usan por turnos, en estricto orden de llegada, y no pueden salir del salón.",
      "No se permiten apuestas de dinero, juegos de azar, ni subirse sobre la mesa de ping pong u otros elementos.",
      "Está prohibido fumar dentro del espacio; el consumo de alcohol, si se permite, debe ser moderado.",
      "Al finalizar, deja los elementos de juego ordenados y el salón limpio.",
    ],
  },
  {
    slug: "salon-juegos-infantil",
    name: "Salón de Juegos Infantil",
    description: "Espacio destinado al esparcimiento y recreación de los niños y niñas del conjunto.",
    capacity: 8,
    minAdvanceDays: 0,
    slotMinutes: 60,
    schedule: {
      "2": [["08:00", "20:00"]],
      "3": [["08:00", "20:00"]],
      "4": [["08:00", "20:00"]],
      "5": [["08:00", "20:00"]],
      "6": [["08:00", "20:00"]],
      "7": [["08:00", "20:00"]],
    },
    rules: [
      "Niños y niñas de 0 a 6 años deben permanecer siempre bajo supervisión directa de un adulto responsable; nunca solos.",
      "No se permite el ingreso de adultos sin un menor acompañante, salvo personal autorizado por la Administración.",
      "No se permiten alimentos, bebidas, vidrio, elementos cortopunzantes ni mascotas dentro del salón.",
      "Usa calzado adecuado y retíralo en zonas con tapete o colchoneta.",
      "En caso de daño o accidente, avisa de inmediato a portería/vigilancia y activa el protocolo de emergencia.",
      "Al finalizar, deja los juguetes y elementos ordenados en el lugar dispuesto para ello.",
    ],
  },
];

export function getSpaceDef(slug: string): SpaceDefinition | undefined {
  return SPACE_DEFS.find((s) => s.slug === slug);
}
