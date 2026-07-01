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
  {
    name: 'Javier Mejía',
    role: 'Inversionista · Zapopan',
    text: 'Desde el primer mes vi resultados reales. Mi asesor siempre está disponible y explica todo con claridad.',
  },
  {
    name: 'Norma Guerrero',
    role: 'Empresaria · CDMX',
    text: 'La plataforma es intuitiva y el respaldo legal me dio la seguridad que buscaba para invertir en serio.',
  },
  {
    name: 'Raúl Esparza',
    role: 'Inversionista · Culiacán',
    text: 'Diversifiqué en acciones y cripto con una estrategia clara. Estoy muy satisfecho con el acompañamiento.',
  },
  {
    name: 'Leticia Contreras',
    role: 'Inversionista · Tampico',
    text: 'Nunca me sentí sola en el proceso. Broker.mx cumple lo que promete y el trato es siempre respetuoso.',
  },
  {
    name: 'Emilio Zavala',
    role: 'Contador · Villahermosa',
    text: 'Como profesional valoro la transparencia en cada operación. Es la mejor experiencia de inversión que he tenido.',
  },
  {
    name: 'Adriana Cervantes',
    role: 'Inversionista · Pachuca',
    text: 'Empecé con poco y hoy tengo un portafolio sólido. Mi asesora me guió paso a paso con mucha paciencia.',
  },
  {
    name: 'Iván Rocha',
    role: 'Ingeniero · Mexicali',
    text: 'Depósitos rápidos, reportes claros y un equipo que responde. Recomiendo Broker.mx sin dudarlo.',
  },
  {
    name: 'Rosa María Juárez',
    role: 'Inversionista · Reynosa',
    text: 'Recuperé la confianza en invertir. Los rendimientos han sido excelentes y el servicio es impecable.',
  },
  {
    name: 'Sergio Beltrán',
    role: 'Comerciante · Torreón',
    text: 'Llevo más de un año con ustedes y la consistencia del servicio es total. Profesionales de verdad.',
  },
  {
    name: 'Carmen Salgado',
    role: 'Docente · La Paz',
    text: 'Mis ahorros por fin trabajan para mí. Estoy encantada con la atención personalizada de mi asesor.',
  },
  {
    name: 'Guillermo Paredes',
    role: 'Inversionista · CDMX',
    text: 'Probé otras plataformas y ninguna se compara. Aquí hay seguimiento real y resultados concretos.',
  },
  {
    name: 'Laura Estévez',
    role: 'Inversionista · Guadalajara',
    text: 'Me sentí valorada desde la primera llamada. Hoy veo crecer mi patrimonio con total tranquilidad.',
  },
  {
    name: 'Mauricio Galván',
    role: 'Empresario · Monterrey',
    text: 'La diversificación en forex y commodities fue clave. Excelente asesoría y plataforma muy estable.',
  },
  {
    name: 'Beatriz Nava',
    role: 'Inversionista · San Miguel de Allende',
    text: 'Broker.mx me demostró que sí se puede crecer con ética. Estoy muy agradecida con todo el equipo.',
  },
  {
    name: 'Ulises Corona',
    role: 'Inversionista · Xalapa',
    text: 'Operaciones claras y un asesor que entiende mis metas familiares. Experiencia excepcional.',
  },
  {
    name: 'Paola Miranda',
    role: 'Emprendedora · Playa del Carmen',
    text: 'Nunca pensé que invertir pudiera ser tan accesible. Hoy estoy muy satisfecha con mis resultados.',
  },
  {
    name: 'Enrique Valdez',
    role: 'Inversionista · Durango',
    text: 'El respaldo legal y la claridad en cada movimiento me convencieron. La mejor decisión financiera que tomé.',
  },
  {
    name: 'Dolores Félix',
    role: 'Inversionista · Irapuato',
    text: 'Mi asesor me acompañó con paciencia desde cero. Hoy tengo un plan patrimonial que tiene sentido.',
  },
  {
    name: 'Armando Cisneros',
    role: 'Inversionista · Mazatlán',
    text: 'Servicio cercano, humano y siempre disponible. Mis rendimientos han superado mis expectativas.',
  },
  {
    name: 'Teresa Villarreal',
    role: 'Inversionista · Nuevo Laredo',
    text: 'Confío plenamente en mi asesor y en la firma. Duermo tranquila sabiendo que mi dinero está bien administrado.',
  },
  {
    name: 'Francisco Javier Luna',
    role: 'Inversionista · CDMX',
    text: 'En seis meses diversifiqué en varios mercados. Me siento parte de un equipo que realmente quiere que gane.',
  },
  {
    name: 'Ximena Bustos',
    role: 'Arquitecta · Querétaro',
    text: 'La atención personalizada marcó la diferencia. Me guiaron sin tecnicismos innecesarios.',
  },
  {
    name: 'Rodolfo Aguilar',
    role: 'Inversionista · Ensenada',
    text: 'Depósitos por SPEI sin complicaciones. Es la plataforma más profesional con la que he trabajado.',
  },
  {
    name: 'Mónica Serrano',
    role: 'Médica · Puebla',
    text: 'Llevaba años postergando invertir. Con Broker.mx me sentí acompañada y los resultados hablan solos.',
  },
  {
    name: 'Gael Montoya',
    role: 'Inversionista · CDMX',
    text: 'Transparencia total y acompañamiento constante. Recomiendo Broker.mx a toda mi familia.',
  },
  {
    name: 'Yolanda Ríos',
    role: 'Inversionista · Orizaba',
    text: 'Por fin un broker en México que habla claro y respalda legalmente. Estoy muy contenta.',
  },
  {
    name: 'Leonardo Padilla',
    role: 'Inversionista · Guanajuato',
    text: 'Mis ganancias han sido muy buenas y el trato humano hace toda la diferencia. Totalmente recomendado.',
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
