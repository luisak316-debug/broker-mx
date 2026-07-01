export type Testimonial = {
  name: string;
  role: string;
  initials: string;
  text: string;
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

const ROWS: Array<Omit<Testimonial, 'initials'>> = [
  {
    name: 'Abraham González',
    role: 'Inversionista · CDMX',
    text: 'Estoy muy contento. He invertido $200,000 MXN y mis ganancias han sido de $450,000 MXN en tan solo cuatro meses. Estoy muy agradecido.',
  },
  {
    name: 'Johana Jiménez',
    role: 'Inversionista · Guadalajara',
    text: 'Excelente transparencia y el acompañamiento de mi asesor asignado me dio toda la confianza para empezar.',
  },
  {
    name: 'Griselda Barrueta',
    role: 'Inversionista · Monterrey',
    text: 'Por fin un broker en México que habla claro y te respalda legalmente.',
  },
  {
    name: 'Ricardo Morales',
    role: 'Empresario · Querétaro',
    text: 'Mi asesor me explicó cada paso con paciencia. Hoy veo crecer mi patrimonio con la tranquilidad de estar en buenas manos.',
  },
  {
    name: 'Patricia Velázquez',
    role: 'Inversionista · Puebla',
    text: 'Llevaba años postergando invertir. Con Broker.mx me sentí acompañada desde el primer depósito y los resultados superaron mis expectativas.',
  },
  {
    name: 'Fernando Castillo',
    role: 'Ingeniero · Tijuana',
    text: 'Depósitos por SPEI sin complicaciones y reportes claros. Es la plataforma más profesional con la que he trabajado.',
  },
  {
    name: 'Alejandra Ruiz',
    role: 'Médica · Mérida',
    text: 'Confío plenamente en mi asesor y en el respaldo legal de la firma. Duermo tranquila sabiendo que mi dinero está bien administrado.',
  },
  {
    name: 'Miguel Ángel Soto',
    role: 'Comerciante · León',
    text: 'En seis meses diversifiqué en acciones y materias primas. El servicio es cercano, humano y siempre disponible cuando lo necesito.',
  },
  {
    name: 'Lucía Hernández',
    role: 'Contadora · CDMX',
    text: 'Como profesional de finanzas valoro la transparencia. Broker.mx cumple lo que promete y el trato con clientes es impecable.',
  },
  {
    name: 'Jorge Iván Medina',
    role: 'Inversionista · Cancún',
    text: 'Empecé con un monto modesto y hoy ya tengo un portafolio sólido. Me siento parte de un equipo que realmente quiere que gane.',
  },
  {
    name: 'Mariana Delgado',
    role: 'Emprendedora · Guadalajara',
    text: 'Mi asesora entiende mis metas familiares y me ayuda a tomar decisiones inteligentes. Estoy encantada con la experiencia.',
  },
  {
    name: 'Arturo Vargas',
    role: 'Inversionista · Monterrey',
    text: 'Probé otras plataformas y ninguna se compara. Aquí hay seguimiento real, no solo promesas en una pantalla.',
  },
  {
    name: 'Sofía Ramírez',
    role: 'Arquitecta · San Luis Potosí',
    text: 'La atención personalizada marcó la diferencia. Me guiaron en mercados globales sin tecnicismos innecesarios.',
  },
  {
    name: 'Eduardo Ponce',
    role: 'Inversionista · Hermosillo',
    text: 'Recuperé la confianza en invertir después de malas experiencias. Broker.mx me demostró que sí se puede crecer con ética.',
  },
  {
    name: 'Verónica Luna',
    role: 'Docente · Morelia',
    text: 'Mis ahorros de años por fin trabajan para mí. El acompañamiento de mi asesor ha sido excepcional en cada etapa.',
  },
  {
    name: 'Carlos Alberto Núñez',
    role: 'Inversionista · Aguascalientes',
    text: 'Operaciones claras, depósitos rápidos y un equipo que responde. Recomiendo Broker.mx a toda mi familia.',
  },
  {
    name: 'Daniela Ortiz',
    role: 'Inversionista · Veracruz',
    text: 'Me sentí valorada desde la primera llamada. Hoy veo resultados concretos y un plan patrimonial que tiene sentido.',
  },
  {
    name: 'Héctor Salinas',
    role: 'Ingeniero · Saltillo',
    text: 'La diversificación en forex y commodities fue clave para mi estrategia. Excelente asesoría y plataforma muy estable.',
  },
  {
    name: 'Gabriela Mendoza',
    role: 'Inversionista · Toluca',
    text: 'Nunca pensé que invertir pudiera ser tan accesible. Mi asesor me acompañó con paciencia y hoy estoy muy satisfecha.',
  },
  {
    name: 'Roberto Fuentes',
    role: 'Inversionista · Chihuahua',
    text: 'Llevo dos años con ustedes y la consistencia en el servicio es total. Profesionales, honestos y siempre al pendiente.',
  },
  {
    name: 'Claudia Espinoza',
    role: 'Empresaria · CDMX',
    text: 'El respaldo legal y la claridad en cada movimiento me convencieron. Es la mejor decisión financiera que he tomado.',
  },
  {
    name: 'Oscar Trejo',
    role: 'Inversionista · Oaxaca',
    text: 'Mis rendimientos han sido muy buenos y el trato humano hace toda la diferencia. Estoy muy agradecido con todo el equipo.',
  },
  {
    name: 'Isabel Camacho',
    role: 'Inversionista · Cuernavaca',
    text: 'Broker.mx me ayudó a proteger el futuro de mis hijos. Servicio de primera y confianza absoluta en mi asesor.',
  },
];

export const TESTIMONIALS: Testimonial[] = ROWS.map((row) => ({
  ...row,
  initials: initials(row.name),
}));

export function chunkTestimonials<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
