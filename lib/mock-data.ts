import { FeedPost, Subject, Grade, AttendanceRecord, Course, CalendarEvent, Communication, WallPost, Classmate, ParentContact, ChatConversation, ChatMessage, Trip, TripAttendee, Group } from './types';

export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Matemática', teacher: 'Prof. García', color: '#5B77D3' },
  { id: 's2', name: 'Lengua', teacher: 'Prof. Martínez', color: '#0693E3' },
  { id: 's3', name: 'Historia', teacher: 'Prof. López', color: '#FF9800' },
  { id: 's4', name: 'Biología', teacher: 'Prof. Fernández', color: '#4CAF50' },
  { id: 's5', name: 'Inglés', teacher: 'Prof. Rodríguez', color: '#9C27B0' },
];

export const mockFeedPosts: FeedPost[] = [
  {
    id: 'f1',
    title: 'Acto del 25 de Mayo',
    body: 'Se invita a toda la comunidad educativa al acto conmemorativo del 25 de Mayo. Se realizará en el patio central a las 10:00 hs.',
    author: 'Dirección',
    date: '2026-03-15',
    category: 'evento',
  },
  {
    id: 'f2',
    title: 'Suspensión de clases - Jornada docente',
    body: 'Se informa que el día viernes 20/03 no habrá clases por jornada de capacitación docente.',
    author: 'Dirección',
    date: '2026-03-14',
    category: 'urgente',
  },
  {
    id: 'f3',
    title: 'Inscripción a talleres extracurriculares',
    body: 'Están abiertas las inscripciones para los talleres de teatro, robótica y deportes. Consultar en secretaría.',
    author: 'Coordinación',
    date: '2026-03-13',
    category: 'novedad',
  },
  {
    id: 'f4',
    title: 'Reunión de padres - 2do trimestre',
    body: 'Se convoca a reunión de padres para el día 22/03 a las 18:00 hs. en el salón de actos.',
    author: 'Dirección',
    date: '2026-03-12',
    category: 'comunicado',
  },
];

export const mockGrades: Grade[] = [
  { id: 'g1', subjectId: 's1', subjectName: 'Matemática', studentId: 'st1', studentName: 'Juan Pérez', value: 8, date: '2026-03-10', description: 'Parcial 1', period: '1er Trimestre' },
  { id: 'g2', subjectId: 's2', subjectName: 'Lengua', studentId: 'st1', studentName: 'Juan Pérez', value: 7, date: '2026-03-08', description: 'TP Análisis literario', period: '1er Trimestre' },
  { id: 'g3', subjectId: 's3', subjectName: 'Historia', studentId: 'st1', studentName: 'Juan Pérez', value: 9, date: '2026-03-05', description: 'Exposición oral', period: '1er Trimestre' },
  { id: 'g4', subjectId: 's4', subjectName: 'Biología', studentId: 'st1', studentName: 'Juan Pérez', value: 6, date: '2026-03-03', description: 'Parcial 1', period: '1er Trimestre' },
  { id: 'g5', subjectId: 's5', subjectName: 'Inglés', studentId: 'st1', studentName: 'Juan Pérez', value: 10, date: '2026-03-01', description: 'Reading comprehension', period: '1er Trimestre' },
  { id: 'g6', subjectId: 's1', subjectName: 'Matemática', studentId: 'st2', studentName: 'María González', value: 9, date: '2026-03-10', description: 'Parcial 1', period: '1er Trimestre' },
  { id: 'g7', subjectId: 's2', subjectName: 'Lengua', studentId: 'st2', studentName: 'María González', value: 8, date: '2026-03-08', description: 'TP Análisis literario', period: '1er Trimestre' },
];

export const mockCourses: Course[] = [
  {
    id: 'c1',
    name: '3ro A',
    grade: '3ro A',
    subjectId: 's1',
    students: [
      { id: 'st1', name: 'Juan Pérez' },
      { id: 'st2', name: 'María González' },
      { id: 'st3', name: 'Lucas Rodríguez' },
      { id: 'st4', name: 'Sofía Martínez' },
      { id: 'st5', name: 'Mateo López' },
    ],
  },
  {
    id: 'c2',
    name: '4to B',
    grade: '4to B',
    subjectId: 's1',
    students: [
      { id: 'st6', name: 'Valentina Díaz' },
      { id: 'st7', name: 'Tomás Fernández' },
      { id: 'st8', name: 'Camila Ruiz' },
    ],
  },
  {
    id: 'c3',
    name: '1ro A',
    grade: '1ro A',
    subjectId: 's2',
    students: [
      { id: 'st9', name: 'Agustina Torres' },
      { id: 'st10', name: 'Nicolás Herrera' },
      { id: 'st11', name: 'Florencia Castro' },
    ],
  },
  {
    id: 'c4',
    name: '2do B',
    grade: '2do B',
    subjectId: 's3',
    students: [
      { id: 'st12', name: 'Ignacio Romero' },
      { id: 'st13', name: 'Julieta Sánchez' },
      { id: 'st14', name: 'Facundo Morales' },
    ],
  },
  {
    id: 'c5',
    name: '5to C',
    grade: '5to C',
    subjectId: 's4',
    students: [
      { id: 'st15', name: 'Milagros Vega' },
      { id: 'st16', name: 'Ezequiel Blanco' },
      { id: 'st17', name: 'Rocío Mendoza' },
    ],
  },
];

export const mockAttendance: AttendanceRecord[] = [
  // Juan Pérez — c1
  { id: 'a1',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-18', status: 'presente', courseId: 'c1', checkInTime: '07:58' },
  { id: 'a2',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-17', status: 'presente', courseId: 'c1', checkInTime: '08:05' },
  { id: 'a3',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-14', status: 'presente', courseId: 'c1', checkInTime: '07:55' },
  { id: 'a4',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-13', status: 'tardanza', courseId: 'c1', checkInTime: '08:34' },
  { id: 'a5',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-12', status: 'ausente',  courseId: 'c1' },
  { id: 'a6',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-11', status: 'presente', courseId: 'c1', checkInTime: '08:01' },
  { id: 'a7',  studentId: 'st1', studentName: 'Juan Pérez',       date: '2026-03-10', status: 'presente', courseId: 'c1', checkInTime: '08:03' },
  // María González — c1
  { id: 'a8',  studentId: 'st2', studentName: 'María González',   date: '2026-03-18', status: 'tardanza', courseId: 'c1', checkInTime: '08:21' },
  { id: 'a9',  studentId: 'st2', studentName: 'María González',   date: '2026-03-17', status: 'presente', courseId: 'c1', checkInTime: '08:02' },
  { id: 'a10', studentId: 'st2', studentName: 'María González',   date: '2026-03-14', status: 'ausente',  courseId: 'c1' },
  { id: 'a11', studentId: 'st2', studentName: 'María González',   date: '2026-03-13', status: 'presente', courseId: 'c1', checkInTime: '07:59' },
  // Lucas Rodríguez — c1
  { id: 'a12', studentId: 'st3', studentName: 'Lucas Rodríguez',  date: '2026-03-18', status: 'ausente',  courseId: 'c1' },
  { id: 'a13', studentId: 'st3', studentName: 'Lucas Rodríguez',  date: '2026-03-17', status: 'presente', courseId: 'c1', checkInTime: '08:10' },
  { id: 'a14', studentId: 'st3', studentName: 'Lucas Rodríguez',  date: '2026-03-14', status: 'tardanza', courseId: 'c1', checkInTime: '08:28' },
  // Sofía Martínez — c1
  { id: 'a15', studentId: 'st4', studentName: 'Sofía Martínez',   date: '2026-03-18', status: 'presente', courseId: 'c1', checkInTime: '07:52' },
  { id: 'a16', studentId: 'st4', studentName: 'Sofía Martínez',   date: '2026-03-17', status: 'presente', courseId: 'c1', checkInTime: '07:54' },
  { id: 'a17', studentId: 'st4', studentName: 'Sofía Martínez',   date: '2026-03-14', status: 'presente', courseId: 'c1', checkInTime: '08:00' },
  // Mateo López — c1
  { id: 'a18', studentId: 'st5', studentName: 'Mateo López',      date: '2026-03-18', status: 'tardanza', courseId: 'c1', checkInTime: '08:19' },
  { id: 'a19', studentId: 'st5', studentName: 'Mateo López',      date: '2026-03-17', status: 'ausente',  courseId: 'c1' },
  { id: 'a20', studentId: 'st5', studentName: 'Mateo López',      date: '2026-03-14', status: 'presente', courseId: 'c1', checkInTime: '08:07' },
  // Valentina Díaz — c2
  { id: 'a21', studentId: 'st6', studentName: 'Valentina Díaz',   date: '2026-03-18', status: 'presente', courseId: 'c2', checkInTime: '08:04' },
  { id: 'a22', studentId: 'st6', studentName: 'Valentina Díaz',   date: '2026-03-17', status: 'presente', courseId: 'c2', checkInTime: '07:57' },
  // Tomás Fernández — c2
  { id: 'a23', studentId: 'st7', studentName: 'Tomás Fernández',  date: '2026-03-18', status: 'ausente',  courseId: 'c2' },
  { id: 'a24', studentId: 'st7', studentName: 'Tomás Fernández',  date: '2026-03-17', status: 'tardanza', courseId: 'c2', checkInTime: '08:41' },
  // Camila Ruiz — c2
  { id: 'a25', studentId: 'st8', studentName: 'Camila Ruiz',      date: '2026-03-18', status: 'presente', courseId: 'c2', checkInTime: '08:11' },
  { id: 'a26', studentId: 'st8', studentName: 'Camila Ruiz',      date: '2026-03-17', status: 'presente', courseId: 'c2', checkInTime: '08:06' },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Parcial Matemática', date: '2026-03-20', type: 'examen', subjectId: 's1', description: 'Unidades 1 a 3' },
  { id: 'e2', title: 'Reunión de padres', date: '2026-03-22', type: 'reunion', description: 'Salón de actos, 18:00 hs' },
  { id: 'e3', title: 'Acto 25 de Mayo', date: '2026-03-25', type: 'acto', description: 'Patio central, 10:00 hs' },
  { id: 'e4', title: 'Feriado Nacional', date: '2026-03-24', type: 'feriado' },
  { id: 'e5', title: 'Entrega TP Lengua', date: '2026-03-28', type: 'examen', subjectId: 's2', description: 'Trabajo práctico grupal' },
  { id: 'e6', title: 'Parcial Historia', date: '2026-04-02', type: 'examen', subjectId: 's3', description: 'Revolución de Mayo' },
];

export const mockCommunications: Communication[] = [
  {
    id: 'com1',
    title: 'Autorización salida educativa',
    body: 'Se solicita autorización para la salida educativa al Museo de Ciencias Naturales el día 25/03. Por favor confirmar lectura y enviar autorización firmada.',
    author: 'Prof. García',
    date: '2026-03-15',
    courseId: 'c1',
    read: false,
    requiresConfirmation: true,
    confirmed: false,
  },
  {
    id: 'com2',
    title: 'Material para clase de Biología',
    body: 'Para la próxima clase de Biología traer: microscopio portátil (quien tenga), hojas para herbario y lupa.',
    author: 'Prof. Fernández',
    date: '2026-03-14',
    courseId: 'c1',
    read: true,
    requiresConfirmation: false,
    confirmed: false,
  },
  {
    id: 'com3',
    title: 'Cambio de horario - Viernes',
    body: 'Se informa que el viernes 20/03 el horario de salida será a las 12:00 hs por jornada institucional.',
    author: 'Dirección',
    date: '2026-03-13',
    read: true,
    requiresConfirmation: true,
    confirmed: true,
  },
];

export const mockWallPosts: WallPost[] = [
  {
    id: 'w1',
    authorId: 'dir1',
    authorName: 'Dirección',
    authorRole: 'docente',
    text: '¡Bienvenidos al ciclo lectivo 2026! Nos alegra recibirlos a todos en este nuevo año escolar. Les deseamos un año lleno de aprendizaje, compañerismo y crecimiento. ¡Arrancamos con todo!',
    image: 'https://picsum.photos/seed/bienvenida2026/800/400',
    date: '2026-03-10',
    likes: [],
    reactions: { st1: 'love', st2: 'aplauso', st3: 'like', st4: 'love', st5: 'aplauso' },
    viewedBy: ['st1', 'st2', 'st3', 'st4', 'st5', 'st6', 'st7', 'st8'],
    comments: [],
  },
  {
    id: 'w2',
    authorId: 'doc1',
    authorName: 'Prof. García',
    authorRole: 'docente',
    text: 'Ya están disponibles los materiales para el primer parcial de Matemática. Los encontrán en la sección "Material de estudio". El parcial será el jueves 20/03, unidades 1 a 3. Cualquier consulta, me escriben.',
    date: '2026-03-14',
    likes: [],
    reactions: { st1: 'like', st2: 'like', st3: 'sorpresa' },
    viewedBy: ['st1', 'st2', 'st3', 'st4', 'st5'],
    comments: [
      { id: 'wc1', authorId: 'doc2', authorName: 'Prof. Martínez', text: 'Igual les recomiendo repasar los ejercicios de práctica del cuadernillo.', date: '2026-03-14' },
    ],
  },
  {
    id: 'w3',
    authorId: 'coord1',
    authorName: 'Coordinación',
    authorRole: 'docente',
    text: 'Esta semana arranca el torneo deportivo intercolegial. Participan los equipos de fútbol, básquet y vóley. Los partidos se juegan los miércoles y viernes en el horario de Educación Física. ¡Vamos con todo!',
    image: 'https://picsum.photos/seed/torneo2026/800/400',
    date: '2026-03-13',
    likes: [],
    reactions: { st1: 'aplauso', st2: 'love', st4: 'aplauso', st5: 'like' },
    viewedBy: ['st1', 'st2', 'st3', 'st4', 'st5', 'st6'],
    comments: [],
  },
  {
    id: 'w4',
    authorId: 'doc2',
    authorName: 'Prof. Martínez',
    authorRole: 'docente',
    text: 'Recordamos que el viernes 21/03 es la entrega del trabajo práctico de Lengua. Debe presentarse en formato digital por el campus y en papel. Cualquier consulta no dejen de escribirme antes del jueves.',
    date: '2026-03-12',
    likes: [],
    reactions: { st3: 'like', st4: 'sorpresa' },
    viewedBy: ['st1', 'st2', 'st3'],
    comments: [],
  },
  {
    id: 'w5',
    authorId: 'dir1',
    authorName: 'Dirección',
    authorRole: 'docente',
    text: 'Felicitamos a los ganadores del concurso de redacción institucional: 1° lugar Sofía Martínez (3ro A), 2° lugar Tomás Fernández (4to B) y 3° lugar Camila Ruiz (4to B). ¡Excelente trabajo a todos los participantes!',
    image: 'https://picsum.photos/seed/concurso2026/800/400',
    date: '2026-03-11',
    likes: [],
    reactions: { st1: 'aplauso', st2: 'love', st3: 'aplauso', st5: 'love' },
    viewedBy: ['st1', 'st2', 'st3', 'st4'],
    comments: [
      { id: 'wc2', authorId: 'doc1', authorName: 'Prof. García', text: '¡Muy merecido! Se lo dedicaron muchísimo.', date: '2026-03-11' },
    ],
  },
];

export const mockClassmates: Classmate[] = [
  { id: 'st2', name: 'María González', grade: '3ro A', isAdded: true },
  { id: 'st3', name: 'Lucas Rodríguez', grade: '3ro A', isAdded: true },
  { id: 'st4', name: 'Sofía Martínez', grade: '3ro A', isAdded: false },
  { id: 'st5', name: 'Mateo López', grade: '3ro A', isAdded: false },
  { id: 'st6', name: 'Valentina Díaz', grade: '4to B', isAdded: false },
  { id: 'st7', name: 'Tomás Fernández', grade: '4to B', isAdded: false },
  { id: 'st8', name: 'Camila Ruiz', grade: '4to B', isAdded: false },
];

export const mockParentContacts: ParentContact[] = [
  { id: 'p1', name: 'Laura González', childName: 'María González', grade: '3ro A', isContact: true },
  { id: 'p2', name: 'Roberto Rodríguez', childName: 'Lucas Rodríguez', grade: '3ro A', isContact: true },
  { id: 'p3', name: 'Ana Martínez', childName: 'Sofía Martínez', grade: '3ro A', isContact: false },
  { id: 'p4', name: 'Carlos López', childName: 'Mateo López', grade: '3ro A', isContact: false },
  { id: 'p5', name: 'Silvia Díaz', childName: 'Valentina Díaz', grade: '4to B', isContact: false },
];

export const mockChatConversations: ChatConversation[] = [
  { id: 'chat1', participantId: 'p1', participantName: 'Laura González', lastMessage: '¿Sabés a qué hora es la reunión?', lastMessageDate: '2026-03-17', unreadCount: 1 },
  { id: 'chat2', participantId: 'p2', participantName: 'Roberto Rodríguez', lastMessage: 'Dale, coordinamos el cumple', lastMessageDate: '2026-03-16', unreadCount: 0 },
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
  chat1: [
    { id: 'm1', senderId: 'p1', senderName: 'Laura González', text: 'Hola! ¿Cómo estás?', date: '2026-03-17', time: '09:30' },
    { id: 'm2', senderId: 'me', senderName: 'Yo', text: 'Bien! ¿Vos?', date: '2026-03-17', time: '09:32' },
    { id: 'm3', senderId: 'p1', senderName: 'Laura González', text: '¿Sabés a qué hora es la reunión?', date: '2026-03-17', time: '09:35' },
  ],
  chat2: [
    { id: 'm4', senderId: 'me', senderName: 'Yo', text: 'Hola Roberto, quería coordinar para el cumple de los chicos', date: '2026-03-16', time: '14:00' },
    { id: 'm5', senderId: 'p2', senderName: 'Roberto Rodríguez', text: 'Dale, coordinamos el cumple', date: '2026-03-16', time: '14:15' },
  ],
};

export interface Birthday {
  id: string;
  name: string;
  date: string; // MM-DD
  avatar?: string;
  grade: string;
}

export const mockBirthdays: Birthday[] = [
  { id: 'b1', name: 'María González', date: '03-18', grade: '3ro A' },
  { id: 'b2', name: 'Lucas Rodríguez', date: '03-18', grade: '3ro A' },
  { id: 'b3', name: 'Sofía Martínez', date: '03-20', grade: '3ro A' },
  { id: 'b4', name: 'Mateo López', date: '03-22', grade: '3ro A' },
  { id: 'b5', name: 'Valentina Díaz', date: '03-25', grade: '4to B' },
  { id: 'b6', name: 'Prof. García', date: '03-19', grade: 'Docente' },
];

export const mockTrips: Trip[] = [
  {
    id: 'trip1',
    title: 'Museo de Ciencias Naturales',
    type: 'salida',
    date: '2026-03-25',
    location: 'Parque Centenario, CABA',
    status: 'proximo',
    details: {
      horarioSalida: '08:30 hs',
      horarioRegreso: '13:00 hs',
      puntoEncuentro: 'Puerta principal del colegio',
      transporte: 'Micro escolar',
      descripcion: 'Visita guiada al Museo Argentino de Ciencias Naturales. Se recorrerán las salas de paleontología y biodiversidad.',
      queLlevar: ['Cuaderno y lapicera', 'Vianda y agua', 'Guardapolvo', 'DNI'],
      autorizacionRequerida: true,
      autorizacionEstado: 'pendiente',
      contactoEmergencia: 'Prof. García - 11-5555-0001',
    },
  },
  {
    id: 'trip2',
    title: 'Campamento en Sierra de la Ventana',
    type: 'campamento',
    date: '2026-04-15',
    location: 'Sierra de la Ventana, Buenos Aires',
    status: 'confirmado',
    details: {
      horarioSalida: '06:00 hs (Miércoles 15/04)',
      horarioRegreso: '18:00 hs (Viernes 17/04)',
      puntoEncuentro: 'Estacionamiento del colegio',
      transporte: 'Micro de larga distancia',
      descripcion: 'Campamento de 3 días y 2 noches. Actividades al aire libre, trekking, fogón y juegos grupales.',
      queLlevar: ['Bolsa de dormir', 'Ropa abrigada', 'Linterna', 'Protector solar', 'Repelente', 'Muda de ropa (3 días)', 'Zapatillas de trekking', 'Toalla', 'Elementos de higiene personal', 'Botiquín personal', 'Vianda para el viaje'],
      autorizacionRequerida: true,
      autorizacionEstado: 'autorizado',
      contactoEmergencia: 'Prof. López - 11-5555-0002',
    },
  },
  {
    id: 'trip3',
    title: 'Viaje de Egresados - Bariloche',
    type: 'egresados',
    date: '2026-09-10',
    location: 'San Carlos de Bariloche',
    status: 'proximo',
    details: {
      horarioSalida: '22:00 hs (Jueves 10/09)',
      horarioRegreso: '08:00 hs (Lunes 21/09)',
      puntoEncuentro: 'Aeropuerto de Ezeiza - Terminal A',
      transporte: 'Avión + Micro en destino',
      descripcion: 'Viaje de egresados de 10 días. Incluye excursiones al Cerro Catedral, Circuito Chico, Isla Victoria, Bosque de Arrayanes y actividades recreativas.',
      queLlevar: ['Valija grande', 'Ropa de abrigo', 'Traje de baño', 'Documentación (DNI)', 'Medicamentos personales', 'Cargador de celular', 'Dinero para gastos personales'],
      autorizacionRequerida: true,
      autorizacionEstado: 'pendiente',
      contactoEmergencia: 'Coordinador viaje - 11-5555-0003',
    },
  },
  {
    id: 'trip4',
    title: 'Visita a la Usina del Arte',
    type: 'excursion',
    date: '2026-03-10',
    location: 'La Boca, CABA',
    status: 'finalizado',
    details: {
      horarioSalida: '09:00 hs',
      horarioRegreso: '12:30 hs',
      puntoEncuentro: 'Puerta principal del colegio',
      transporte: 'Micro escolar',
      descripcion: 'Visita a la muestra de arte contemporáneo y taller de expresión artística.',
      queLlevar: ['Cuaderno de arte', 'Lapicera'],
      autorizacionRequerida: false,
      autorizacionEstado: 'no_requerido',
      contactoEmergencia: 'Prof. Fernández - 11-5555-0004',
    },
  },
];

export const mockGroups: Group[] = [
  {
    id: 'grp-3a',
    name: '3° A - 2026',
    description: 'Grupo oficial del curso 3° A. Solo docentes y admins pueden publicar.',
    type: 'curso',
    isAutomatic: true,
    createdBy: 'admin',
    createdByName: 'Dirección',
    createdAt: '2026-03-01',
    coverColor: '#7C6BC4',
    members: [
      { userId: 'u1', userName: 'Lucía Martínez', role: 'miembro', joinedAt: '2026-03-01' },
      { userId: 'st2', userName: 'María González', role: 'miembro', joinedAt: '2026-03-01' },
      { userId: 'st3', userName: 'Lucas Rodríguez', role: 'miembro', joinedAt: '2026-03-01' },
      { userId: 'st4', userName: 'Sofía Martínez', role: 'miembro', joinedAt: '2026-03-01' },
      { userId: 'st5', userName: 'Mateo López', role: 'miembro', joinedAt: '2026-03-01' },
      { userId: 'doc1', userName: 'Prof. García', role: 'admin', joinedAt: '2026-03-01' },
      { userId: 'doc2', userName: 'Prof. Martínez', role: 'admin', joinedAt: '2026-03-01' },
    ],
  },
  {
    id: 'grp-mat',
    name: 'Matemática - Prof. García',
    description: 'Espacio de la materia para consultas, materiales y avisos.',
    type: 'materia',
    isAutomatic: false,
    createdBy: 'doc1',
    createdByName: 'Prof. García',
    createdAt: '2026-03-05',
    coverColor: '#5B77D3',
    members: [
      { userId: 'u1', userName: 'Lucía Martínez', role: 'miembro', joinedAt: '2026-03-05' },
      { userId: 'st2', userName: 'María González', role: 'miembro', joinedAt: '2026-03-05' },
      { userId: 'st3', userName: 'Lucas Rodríguez', role: 'miembro', joinedAt: '2026-03-05' },
      { userId: 'st4', userName: 'Sofía Martínez', role: 'miembro', joinedAt: '2026-03-05' },
      { userId: 'st5', userName: 'Mateo López', role: 'miembro', joinedAt: '2026-03-05' },
      { userId: 'doc1', userName: 'Prof. García', role: 'admin', joinedAt: '2026-03-05' },
    ],
  },
  {
    id: 'grp-robotica',
    name: 'Club de Robótica',
    description: 'Grupo del taller extracurricular de robótica. Martes y jueves 16:00–18:00 hs.',
    type: 'extracurricular',
    isAutomatic: false,
    createdBy: 'doc1',
    createdByName: 'Prof. García',
    createdAt: '2026-03-06',
    coverColor: '#00897B',
    members: [
      { userId: 'u1', userName: 'Lucía Martínez', role: 'miembro', joinedAt: '2026-03-06' },
      { userId: 'st3', userName: 'Lucas Rodríguez', role: 'miembro', joinedAt: '2026-03-06' },
      { userId: 'st5', userName: 'Mateo López', role: 'miembro', joinedAt: '2026-03-06' },
      { userId: 'doc1', userName: 'Prof. García', role: 'admin', joinedAt: '2026-03-06' },
    ],
  },
  {
    id: 'grp-futbol',
    name: 'Equipo de Fútbol',
    description: 'Equipo de fútbol del colegio. Entrenamientos los viernes.',
    type: 'extracurricular',
    isAutomatic: false,
    createdBy: 'doc2',
    createdByName: 'Prof. Martínez',
    createdAt: '2026-03-08',
    coverColor: '#43A047',
    members: [
      { userId: 'st2', userName: 'María González', role: 'miembro', joinedAt: '2026-03-08' },
      { userId: 'st4', userName: 'Sofía Martínez', role: 'miembro', joinedAt: '2026-03-08' },
      { userId: 'doc2', userName: 'Prof. Martínez', role: 'admin', joinedAt: '2026-03-08' },
    ],
  },
];

export const mockGroupPosts: WallPost[] = [
  {
    id: 'gp1',
    groupId: 'grp-3a',
    groupName: '3° A - 2026',
    authorId: 'doc1',
    authorName: 'Prof. García',
    authorRole: 'docente',
    text: 'Recordatorio para todo el curso: el **lunes 23/03** traer el trabajo práctico de Matemática impreso. Quien no lo entregue en tiempo y forma tendrá nota desaprobada. ¡Sin excepciones!',
    date: '2026-03-17',
    likes: [],
    reactions: { 'u1': 'like', st2: 'aplauso', st3: 'sorpresa' },
    viewedBy: ['u1', 'st2', 'st3'],
    comments: [],
  },
  {
    id: 'gp2',
    groupId: 'grp-mat',
    groupName: 'Matemática - Prof. García',
    authorId: 'doc1',
    authorName: 'Prof. García',
    authorRole: 'docente',
    text: 'Subí la guía de ejercicios para el parcial del jueves. La encuentran en la sección "Material". Repasen especialmente los ejercicios 12 al 18, que son los de mayor peso en el examen.',
    date: '2026-03-16',
    likes: [],
    reactions: { 'u1': 'aplauso', st2: 'like' },
    viewedBy: ['u1', 'st2'],
    comments: [
      { id: 'gc1', authorId: 'doc1', authorName: 'Prof. García', text: 'Recuerden que pueden consultarme hasta el miércoles a las 18 hs.', date: '2026-03-16' },
    ],
  },
  {
    id: 'gp3',
    groupId: 'grp-robotica',
    groupName: 'Club de Robótica',
    authorId: 'doc1',
    authorName: 'Prof. García',
    authorRole: 'docente',
    text: '¡Muy buena sesión hoy! Ya terminamos el armado del chasis. El jueves arrancamos con la programación del sensor ultrasónico. Traigan sus notebooks cargadas.',
    image: 'https://picsum.photos/seed/robotica2026/800/400',
    date: '2026-03-15',
    likes: [],
    reactions: { 'u1': 'love', st3: 'aplauso' },
    viewedBy: ['u1', 'st3'],
    comments: [],
  },
];

export const mockTripAttendees: Record<string, TripAttendee[]> = {
  trip1: [
    { studentId: 'st1', studentName: 'Juan Pérez', authorized: false, authorizedBy: null },
    { studentId: 'st2', studentName: 'María González', authorized: true, authorizedBy: 'Laura González (Madre)' },
    { studentId: 'st3', studentName: 'Lucas Rodríguez', authorized: true, authorizedBy: 'Roberto Rodríguez (Padre)' },
    { studentId: 'st4', studentName: 'Sofía Martínez', authorized: false, authorizedBy: null },
    { studentId: 'st5', studentName: 'Mateo López', authorized: true, authorizedBy: 'Carlos López (Padre)' },
  ],
  trip2: [
    { studentId: 'st1', studentName: 'Juan Pérez', authorized: true, authorizedBy: 'Carlos Pérez (Padre)' },
    { studentId: 'st2', studentName: 'María González', authorized: true, authorizedBy: 'Laura González (Madre)' },
    { studentId: 'st3', studentName: 'Lucas Rodríguez', authorized: false, authorizedBy: null },
    { studentId: 'st4', studentName: 'Sofía Martínez', authorized: true, authorizedBy: 'Ana Martínez (Madre)' },
    { studentId: 'st5', studentName: 'Mateo López', authorized: false, authorizedBy: null },
  ],
  trip3: [
    { studentId: 'st1', studentName: 'Juan Pérez', authorized: false, authorizedBy: null },
    { studentId: 'st2', studentName: 'María González', authorized: false, authorizedBy: null },
    { studentId: 'st3', studentName: 'Lucas Rodríguez', authorized: true, authorizedBy: 'Roberto Rodríguez (Padre)' },
    { studentId: 'st4', studentName: 'Sofía Martínez', authorized: false, authorizedBy: null },
    { studentId: 'st5', studentName: 'Mateo López', authorized: false, authorizedBy: null },
  ],
  trip4: [
    { studentId: 'st1', studentName: 'Juan Pérez', authorized: true, authorizedBy: 'Carlos Pérez (Padre)' },
    { studentId: 'st2', studentName: 'María González', authorized: true, authorizedBy: 'Laura González (Madre)' },
    { studentId: 'st3', studentName: 'Lucas Rodríguez', authorized: true, authorizedBy: 'Roberto Rodríguez (Padre)' },
    { studentId: 'st4', studentName: 'Sofía Martínez', authorized: true, authorizedBy: 'Ana Martínez (Madre)' },
    { studentId: 'st5', studentName: 'Mateo López', authorized: true, authorizedBy: 'Carlos López (Padre)' },
  ],
};
