import { t, getLang } from './i18n.js'
import { classifyExercise } from './classifications.js'

/**
 * Biomechanical Analysis, EMG Activation & Execution Variants Engine
 *
 * Provides research-based biomechanical insights, muscle activation breakdowns (EMG),
 * resistance curve peak tension phases, joint stress evaluations, and execution cues.
 */

// Canonical Archetype Rule Definitions
// Matches exercise names and targets to specific biomechanical variant suites.
const ARCHETYPES = [
  // 1. Incline Presses (Barbell, Dumbbell, Machine, Smith, Cable)
  {
    key: 'incline_press',
    match: e => (e.bp === 'chest' || e.tg === 'pectorals') && (e.n.includes('incline') && (e.n.includes('press') || e.n.includes('bench') || e.nameEn?.includes('incline'))),
    category: 'chest',
    variants: [
      {
        id: 'incline-tucked-45',
        nameEn: 'Tucked Elbows (45°–60° Clavicular Alignment)',
        nameEs: 'Codos a 45°–60° (Alineación Pectoral Superior)',
        focusEn: 'Upper Pec (Clavicular Head)',
        focusEs: 'Pectoral Superior (Fibras Claviculares)',
        advantageEn: '+20% Upper Pec Activation (Optimal fiber line of pull)',
        advantageEs: '+20% activación en pectoral superior (Alineación con las fibras)',
        jointStress: 'Low',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Tuck elbows to 45°–60° relative to torso in the scapular plane.',
          'Lower weights with control until dumbbells touch outside upper chest.',
          'Press slightly inward in a gentle converging arc without clashing.'
        ],
        cuesEs: [
          'Mantén los codos recogidos a 45°–60° respecto al torso en el plano escapular.',
          'Baja con control hasta que el peso llegue a la altura de la parte alta del pecho.',
          'Empuja convergiendo ligeramente hacia arriba sin chocar las mancuernas.'
        ],
        activation: [
          { nameEn: 'Upper Chest (Clavicular)', nameEs: 'Pectoral Superior', percent: 92, isPrimary: true },
          { nameEn: 'Mid Chest (Sternal)', nameEs: 'Pectoral Medio', percent: 65, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 52, isPrimary: false },
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 45, isPrimary: false }
        ]
      },
      {
        id: 'incline-flared-90',
        nameEn: 'Flared Elbows (80°–90° Wide Angle)',
        nameEs: 'Codos Abiertos a 80°–90° (Apertura Amplia)',
        focusEn: 'Anterior Deltoid & Mid Chest',
        focusEs: 'Deltoides Anterior y Pectoral Esternal',
        advantageEn: 'Higher anterior shoulder stretch, reduced upper chest bias',
        advantageEs: 'Mayor estiramiento deltoideo, menor aislamiento de pectoral superior',
        jointStress: 'Moderate-High',
        peakTension: 'Lengthened',
        sfr: 'Moderate',
        cuesEn: [
          'Elbows flare wide out to the sides at nearly 90°.',
          'Limit bottom depth if experiencing anterior shoulder impingement.',
          'Keep shoulder blades pinned to the bench.'
        ],
        cuesEs: [
          'Abre los codos hacia afuera en un ángulo cercano a 90°.',
          'No bajes en exceso si notas molestias en la parte frontal del hombro.',
          'Mantén las escápulas bien retraídas contra el respaldo.'
        ],
        activation: [
          { nameEn: 'Upper Chest (Clavicular)', nameEs: 'Pectoral Superior', percent: 70, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 85, isPrimary: true },
          { nameEn: 'Mid Chest (Sternal)', nameEs: 'Pectoral Medio', percent: 68, isPrimary: false },
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 40, isPrimary: false }
        ]
      },
      {
        id: 'incline-neutral-close',
        nameEn: 'Neutral Grip / Close Press',
        nameEs: 'Agarre Neutro Cerrado (Palmas enfrentadas)',
        focusEn: 'Triceps & Sternal-Clavicular Center',
        focusEs: 'Tríceps y Pectoral Clavicular Interno',
        advantageEn: 'Minimal shoulder shear stress, highest tricep overload',
        advantageEs: 'Mínimo estrés en hombros, mayor activación de tríceps',
        jointStress: 'Low',
        peakTension: 'Mid-range',
        sfr: 'High',
        cuesEn: [
          'Palms facing each other throughout the full movement.',
          'Keep elbows tight grazing the ribcage as you descend.',
          'Lockout fully to maximize tricep contraction.'
        ],
        cuesEs: [
          'Mantén las palmas mirándose entre sí durante todo el recorrido.',
          'Baja con los codos rozando los costados.',
          'Extiende completamente los brazos para enfatizar el tríceps.'
        ],
        activation: [
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 88, isPrimary: true },
          { nameEn: 'Upper Chest (Clavicular)', nameEs: 'Pectoral Superior', percent: 75, isPrimary: true },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 40, isPrimary: false }
        ]
      }
    ]
  },

  // 2. Flat Presses (Flat Bench Press, Dumbbell Press, Machine Press, Push-up)
  {
    key: 'flat_press',
    match: e => (e.bp === 'chest' || e.tg === 'pectorals') && (e.n.includes('bench press') || e.n.includes('chest press') || e.n.includes('push-up') || e.n.includes('push up')),
    category: 'chest',
    variants: [
      {
        id: 'flat-retracted-power',
        nameEn: 'Retracted Scapula & 45° Elbows (Standard Hypertrophy)',
        nameEs: 'Escápulas Retraídas y Codos a 45° (Estándar)',
        focusEn: 'Sternal Pec (Overall Chest Mass)',
        focusEs: 'Pectoral Esternal (Masa Pectoral Global)',
        advantageEn: 'Maximal safe mechanical loading & full chest recruitment',
        advantageEs: 'Máxima carga mecánica segura y alto reclutamiento global',
        jointStress: 'Low-Moderate',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Plant feet firmly, arch slightly, and pin shoulder blades back and down.',
          'Touch the bar or lower dumbbells to lower/mid sternum.',
          'Drive straight up and slightly back over the upper chest.'
        ],
        cuesEs: [
          'Apoya los pies firmes, arquea ligeramente la espalda y retrae escápulas.',
          'Baja la barra o mancuernas hacia la línea media/baja del esternón.',
          'Empuja hacia arriba y ligeramente hacia atrás sobre el pecho.'
        ],
        activation: [
          { nameEn: 'Mid Chest (Sternal)', nameEs: 'Pectoral Medio/Esternal', percent: 95, isPrimary: true },
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 70, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 62, isPrimary: false }
        ]
      },
      {
        id: 'flat-wide-flared',
        nameEn: 'Wide Grip / Flared (Chest Stretch Bias)',
        nameEs: 'Agarre Ancho (Énfasis Estiramiento Pectoral)',
        focusEn: 'Outer Pectoral Fibers',
        focusEs: 'Fibras Externas del Pectoral',
        advantageEn: 'Higher stretch tension, reduced tricep contribution',
        advantageEs: 'Gran tensión en estiramiento, menor trabajo de tríceps',
        jointStress: 'Moderate-High',
        peakTension: 'Lengthened',
        sfr: 'Moderate',
        cuesEn: [
          'Widen grip by 1-2 hand widths outside shoulder width.',
          'Pause 1s in deep stretch at the bottom.',
          'Do not bounce off the chest.'
        ],
        cuesEs: [
          'Separa las manos 1-2 palmos más allá de la anchura de los hombros.',
          'Haz una pausa de 1s en la parte baja sintiendo el estiramiento.',
          'Evita cualquier rebote en el pecho.'
        ],
        activation: [
          { nameEn: 'Mid Chest (Sternal)', nameEs: 'Pectoral Mayor', percent: 92, isPrimary: true },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 74, isPrimary: false },
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 45, isPrimary: false }
        ]
      },
      {
        id: 'flat-close-grip',
        nameEn: 'Close-Grip (Triceps & Inner Chest Bias)',
        nameEs: 'Agarre Estrecho (Énfasis Tríceps)',
        focusEn: 'Triceps Lateral & Medial Heads',
        focusEs: 'Tríceps y Pectoral Esternal',
        advantageEn: 'Significantly higher triceps EMG with minimal shoulder strain',
        advantageEs: 'Mayor activación EMG en tríceps con menor palanca en hombro',
        jointStress: 'Low',
        peakTension: 'Mid-range',
        sfr: 'High',
        cuesEn: [
          'Grip shoulder-width apart (avoid excessively narrow grips to protect wrists).',
          'Keep elbows tucked close to your sides.',
          'Focus on driving through palms to lockout.'
        ],
        cuesEs: [
          'Agarra a la anchura de los hombros (evita juntar demasiado las manos por las muñecas).',
          'Mantén los codos pegados a los costados al bajar.',
          'Empuja fuerte con las palmas hasta bloquear el tríceps.'
        ],
        activation: [
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 92, isPrimary: true },
          { nameEn: 'Mid Chest (Sternal)', nameEs: 'Pectoral Medio', percent: 65, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 48, isPrimary: false }
        ]
      }
    ]
  },

  // 3. Dips & Decline Presses
  {
    key: 'dips_decline',
    match: e => e.n.includes('dip') || e.n.includes('decline') || (e.nameEn && (e.nameEn.includes('dip') || e.nameEn.includes('decline'))),
    category: 'chest',
    variants: [
      {
        id: 'dips-forward-lean',
        nameEn: 'Forward Lean 30° (Lower Pec Bias)',
        nameEs: 'Torso Inclinado 30° (Énfasis Pectoral Inferior)',
        focusEn: 'Lower Pec (Costal/Abdominal Head)',
        focusEs: 'Pectoral Inferior (Fibras Costales)',
        advantageEn: 'Maximizes lower pec line of pull and deep stretch',
        advantageEs: 'Máxima línea de tracción en fibras inferiores y estiramiento profundo',
        jointStress: 'Moderate',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Lean torso forward ~30° and let elbows flare out moderately.',
          'Keep knees slightly bent or ankles crossed.',
          'Lower until shoulders are level with elbows.'
        ],
        cuesEs: [
          'Inclina el torso hacia adelante unos 30° con codos ligeramente hacia afuera.',
          'Flexiona rodillas o cruza los tobillos hacia atrás.',
          'Baja hasta que los hombros queden alineados con los codos.'
        ],
        activation: [
          { nameEn: 'Lower Chest (Costal)', nameEs: 'Pectoral Inferior', percent: 95, isPrimary: true },
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 68, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 55, isPrimary: false }
        ]
      },
      {
        id: 'dips-upright',
        nameEn: 'Upright Torso (Triceps Bias)',
        nameEs: 'Torso Vertical (Énfasis Tríceps)',
        focusEn: 'Triceps Brachii',
        focusEs: 'Tríceps Braquial',
        advantageEn: 'Direct triceps mechanical overload with reduced chest contribution',
        advantageEs: 'Sobrecarga mecánica directa en tríceps con menor trabajo pectoral',
        jointStress: 'Low-Moderate',
        peakTension: 'Mid-range',
        sfr: 'High',
        cuesEn: [
          'Stay completely upright throughout the descent.',
          'Keep elbows pinned directly behind you.',
          'Squeeze triceps hard at the top lockout.'
        ],
        cuesEs: [
          'Mantén el cuerpo completamente recto y vertical.',
          'Dirige los codos directamente hacia atrás.',
          'Aprieta los tríceps con fuerza en la parte superior.'
        ],
        activation: [
          { nameEn: 'Triceps', nameEs: 'Tríceps', percent: 96, isPrimary: true },
          { nameEn: 'Lower Chest', nameEs: 'Pectoral Inferior', percent: 50, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 45, isPrimary: false }
        ]
      }
    ]
  },

  // 4. Chest Flies & Crossovers & Pec Deck
  {
    key: 'chest_fly',
    match: e => e.n.includes('fly') || e.n.includes('crossover') || e.n.includes('pec deck'),
    category: 'chest',
    variants: [
      {
        id: 'fly-low-to-high',
        nameEn: 'Low to High (Clavicular / Upper Pec Bias)',
        nameEs: 'Polea Baja a Alta (Énfasis Pectoral Superior)',
        focusEn: 'Upper Pectoralis Major',
        focusEs: 'Pectoral Superior (Porción Clavicular)',
        advantageEn: 'Upward scooping motion aligns with clavicular fiber orientation',
        advantageEs: 'La trayectoria ascendente sigue la dirección de las fibras superiores',
        jointStress: 'Low',
        peakTension: 'Shortened',
        sfr: 'Very High',
        cuesEn: [
          'Set pulleys at ankle/knee height.',
          'Bring handles upward and inward finishing at eye level with supinated palms.',
          'Hold 1s peak squeeze at the top.'
        ],
        cuesEs: [
          'Coloca las poleas a la altura de tobillos o rodillas.',
          'Lleva las manos hacia arriba y al centro terminando a la altura de los ojos.',
          'Aprieta 1 segundo arriba en el punto de máxima contracción.'
        ],
        activation: [
          { nameEn: 'Upper Pec (Clavicular)', nameEs: 'Pectoral Superior', percent: 94, isPrimary: true },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 50, isPrimary: false },
          { nameEn: 'Mid Chest', nameEs: 'Pectoral Medio', percent: 48, isPrimary: false }
        ]
      },
      {
        id: 'fly-high-to-low',
        nameEn: 'High to Low (Costal / Lower Pec Bias)',
        nameEs: 'Polea Alta a Baja (Énfasis Pectoral Inferior)',
        focusEn: 'Lower Pectoralis Major',
        focusEs: 'Pectoral Inferior (Porción Costal)',
        advantageEn: 'Downward convergence isolates abdominal/costal head',
        advantageEs: 'La trayectoria descendente aísla la porción baja del pectoral',
        jointStress: 'Low',
        peakTension: 'Shortened',
        sfr: 'Very High',
        cuesEn: [
          'Set pulleys high above head level.',
          'Press downward and inward towards your hips/crotch.',
          'Cross hands slightly at the bottom for maximal shortened contraction.'
        ],
        cuesEs: [
          'Coloca las poleas altas por encima de la cabeza.',
          'Empuja hacia abajo y al centro hacia las caderas.',
          'Cruza ligeramente las muñecas abajo para máximo acortamiento.'
        ],
        activation: [
          { nameEn: 'Lower Pec (Costal)', nameEs: 'Pectoral Inferior', percent: 95, isPrimary: true },
          { nameEn: 'Mid Chest', nameEs: 'Pectoral Medio', percent: 60, isPrimary: false },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 35, isPrimary: false }
        ]
      }
    ]
  },

  // 5. Lat Pulldowns & Pull-ups
  {
    key: 'pulldown_pullup',
    match: e => (e.bp === 'back' || e.tg === 'lats') && (e.n.includes('pulldown') || e.n.includes('pull-up') || e.n.includes('pull up') || e.n.includes('chin-up')),
    category: 'back',
    variants: [
      {
        id: 'pull-neutral-close',
        nameEn: 'Close Neutral Grip (Lat Illiac / Lower Lat Bias)',
        nameEs: 'Agarre Neutro Cerrado (Énfasis Dorsal Ancho Inferior)',
        focusEn: 'Latissimus Dorsi (Lower & Illiac Fibers)',
        focusEs: 'Dorsal Ancho (Fibras Bajas e Ilíacas)',
        advantageEn: 'Elbows travel in sagital plane right by ribcage; maximal lat leverage',
        advantageEs: 'Codos viajan pegados al torso en plano sagital; máxima palanca dorsal',
        jointStress: 'Low',
        peakTension: 'Shortened',
        sfr: 'Very High',
        cuesEn: [
          'Keep torso nearly vertical with a subtle backward arch.',
          'Drive elbows straight down towards your back pockets, keeping them close to your ribs.',
          'Stop pulling when elbows hit waistline to avoid rear delt/trap takeover.'
        ],
        cuesEs: [
          'Mantén el torso casi vertical con una ligera curvatura en el pecho.',
          'Dirige los codos hacia abajo buscando los bolsillos traseros, pegados al cuerpo.',
          'Detén la tracción cuando los codos lleguen a la cintura para no desviar la carga.'
        ],
        activation: [
          { nameEn: 'Lats (Lower)', nameEs: 'Dorsal Ancho (Fibras Bajas)', percent: 96, isPrimary: true },
          { nameEn: 'Biceps / Brachialis', nameEs: 'Bíceps y Braquial', percent: 65, isPrimary: false },
          { nameEn: 'Teres Major', nameEs: 'Redondo Mayor', percent: 55, isPrimary: false }
        ]
      },
      {
        id: 'pull-wide-overhand',
        nameEn: 'Wide Overhand Grip (Upper Back & Teres Major Bias)',
        nameEs: 'Agarre Prono Ancho (Espalda Alta y Redondo Mayor)',
        focusEn: 'Upper Lats, Teres Major, Rhomboids',
        focusEs: 'Dorsal Alto, Redondo Mayor y Romboides',
        advantageEn: 'Flared elbow path recruits scapular retractors and teres major',
        advantageEs: 'Apertura de codos recluta redondo mayor, romboides y trapecio medio',
        jointStress: 'Low-Moderate',
        peakTension: 'Mid-range',
        sfr: 'High',
        cuesEn: [
          'Grip 1.5x shoulder width with thumbless overhand grip.',
          'Lean back ~15°–20° and pull bar to upper clavicles.',
          'Squeeze shoulder blades together forcefully at the bottom.'
        ],
        cuesEs: [
          'Agarra a 1.5 veces el ancho de hombros en agarre prono.',
          'Inclínate hacia atrás unos 15°–20° y tracciona hacia la parte alta del pecho.',
          'Junta con fuerza los omóplatos en la posición inferior.'
        ],
        activation: [
          { nameEn: 'Teres Major & Upper Lats', nameEs: 'Redondo Mayor y Dorsal Alto', percent: 90, isPrimary: true },
          { nameEn: 'Rhomboids / Mid Traps', nameEs: 'Romboides y Trapecio Medio', percent: 85, isPrimary: true },
          { nameEn: 'Biceps', nameEs: 'Bíceps', percent: 60, isPrimary: false }
        ]
      },
      {
        id: 'pull-unilateral-cable',
        nameEn: 'Single-Arm Unilateral (Peak Lat Isolation)',
        nameEs: 'Unilateral a Una Mano (Máximo Aislamiento Dorsal)',
        focusEn: 'Unilateral Latissimus Dorsi',
        focusEs: 'Dorsal Ancho Unilateral',
        advantageEn: 'Eliminates asymmetric pulling and maximizes active range of motion',
        advantageEs: 'Elimina asimetrías y maximiza el rango de movimiento activo',
        jointStress: 'Minimal',
        peakTension: 'Continuous',
        sfr: 'Very High',
        cuesEn: [
          'Slightly lean torso towards working side to align cable with lat fibers.',
          'Drive elbow down and tight to hip, feeling the lat bunch up.',
          'Allow scapula to fully elevate into deep stretch at the top.'
        ],
        cuesEs: [
          'Inclina ligeramente el torso hacia el lado que trabaja para alinear la polea.',
          'Lleva el codo hacia la cadera sintiendo la contracción profunda.',
          'Deja que la escápula suba libremente en la parte alta para máximo estiramiento.'
        ],
        activation: [
          { nameEn: 'Lats (Isolated)', nameEs: 'Dorsal Ancho (Aislado)', percent: 98, isPrimary: true },
          { nameEn: 'Biceps', nameEs: 'Bíceps', percent: 45, isPrimary: false }
        ]
      }
    ]
  },

  // 6. Rows (Barbell, Dumbbell, Cable Seated, Machine, T-Bar)
  {
    key: 'rows',
    match: e => (e.bp === 'back' || e.tg === 'upper back' || e.tg === 'lats') && (e.n.includes('row') || (e.nameEn && e.nameEn.includes('row'))),
    category: 'back',
    variants: [
      {
        id: 'row-tucked-hip',
        nameEn: 'Tucked Elbows pulling to Hips (Lat Focus)',
        nameEs: 'Codos Pegados a Caderas (Énfasis Dorsal Ancho)',
        focusEn: 'Latissimus Dorsi',
        focusEs: 'Dorsal Ancho',
        advantageEn: 'Restricts elbow angle to ~30°, transferring load from traps to lats',
        advantageEs: 'Codos a 30° transfieren el trabajo del trapecio al dorsal ancho',
        jointStress: 'Low',
        peakTension: 'Mid-range',
        sfr: 'High',
        cuesEn: [
          'Pull handle/weight back towards your hip/belt buckle, not your chest.',
          'Keep forearms in line with the resistance cable/path.',
          'Keep upper traps relaxed and depressed throughout.'
        ],
        cuesEs: [
          'Tracciona llevando el peso hacia la cadera/cinturón, no hacia el pecho.',
          'Mantén los antebrazos alineados con la trayectoria de tiro.',
          'Mantén los trapecios superiores relajados y los hombros deprimidos.'
        ],
        activation: [
          { nameEn: 'Lats', nameEs: 'Dorsal Ancho', percent: 95, isPrimary: true },
          { nameEn: 'Rear Delts', nameEs: 'Deltoides Posterior', percent: 50, isPrimary: false },
          { nameEn: 'Biceps', nameEs: 'Bíceps', percent: 55, isPrimary: false }
        ]
      },
      {
        id: 'row-flared-chest',
        nameEn: 'Flared Elbows at 75° (Upper Back & Rhomboid Bias)',
        nameEs: 'Codos a 75° al Pecho (Énfasis Espalda Alta y Romboides)',
        focusEn: 'Mid Traps, Rhomboids & Rear Delts',
        focusEs: 'Trapecio Medio, Romboides y Deltoides Posterior',
        advantageEn: 'Maximizes scapular retraction and rear deltoid horizontal abduction',
        advantageEs: 'Maximiza la retracción escapular y la abducción horizontal del hombro',
        jointStress: 'Low-Moderate',
        peakTension: 'Shortened',
        sfr: 'High',
        cuesEn: [
          'Flay elbows out to ~75° from torso with a wide overhand grip.',
          'Pull weight directly towards lower sternum/nipple line.',
          'Squeeze shoulder blades together forcefully for 1 second.'
        ],
        cuesEs: [
          'Abre los codos a unos 75° del torso con agarre prono ancho.',
          'Tracciona directo hacia la línea baja del esternón.',
          'Junta las escápulas con fuerza aguantando 1 segundo atrás.'
        ],
        activation: [
          { nameEn: 'Rhomboids / Mid Traps', nameEs: 'Romboides y Trapecio', percent: 96, isPrimary: true },
          { nameEn: 'Rear Delts', nameEs: 'Deltoides Posterior', percent: 88, isPrimary: true },
          { nameEn: 'Lats', nameEs: 'Dorsal Ancho', percent: 58, isPrimary: false }
        ]
      },
      {
        id: 'row-chest-supported',
        nameEn: 'Chest-Supported (Zero Spinal Load / High SFR)',
        nameEs: 'Con Pecho Apoyado (Cero Fatiga Lumbar / Alto SFR)',
        focusEn: 'Pure Back Musculature without Lower Back Fatigue',
        focusEs: 'Espalda Pura sin Sobrecarga en Lumbares',
        advantageEn: 'Removes spinal erectors fatigue constraint; permits closer proximity to failure',
        advantageEs: 'Elimina el fallo por fatiga lumbar, permitiendo llevar la espalda al fallo real',
        jointStress: 'Minimal',
        peakTension: 'Continuous',
        sfr: 'Very High',
        cuesEn: [
          'Rest sternum flat against the support pad throughout the set.',
          'Let back round slightly forward at bottom for enhanced stretch.',
          'Pull back explosively without heaving torso off the pad.'
        ],
        cuesEs: [
          'Mantén el pecho firmemente apoyado en el respaldo durante toda la serie.',
          'Deja que las escápulas se abran delante para máximo estiramiento.',
          'Tracciona sin despegar el torso de la almohadilla.'
        ],
        activation: [
          { nameEn: 'Back (Upper & Lats)', nameEs: 'Dorsal y Espalda Alta', percent: 94, isPrimary: true },
          { nameEn: 'Spinal Erectors', nameEs: 'Erectores Lumbares', percent: 12, isPrimary: false }
        ]
      }
    ]
  },

  // 7. Squats (Back, Front, Hack, Goblet)
  {
    key: 'squats',
    match: e => (e.bp === 'upper legs' || e.tg === 'quads') && (e.n.includes('squat') && !e.n.includes('split') && !e.n.includes('bulgarian')),
    category: 'quads',
    variants: [
      {
        id: 'squat-high-bar-heels',
        nameEn: 'High-Bar with Elevated Heels (Quad Bias)',
        nameEs: 'Barra Alta con Talones Elevados (Énfasis Cuádriceps)',
        focusEn: 'Quadriceps (Vastus Medialis & Lateralis)',
        focusEs: 'Cuádriceps (Vasto Interno y Externo)',
        advantageEn: 'Elevated heels permit forward knee travel with vertical torso; massive quad stretch',
        advantageEs: 'Talones elevados permiten avance de rodillas y torso recto; estiramiento brutal de cuádriceps',
        jointStress: 'Moderate',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Place bar high on traps; elevate heels on plates or weightlifting shoes.',
          'Drive knees forward over toes while keeping chest proud.',
          'Descend deep until hamstrings touch calves.'
        ],
        cuesEs: [
          'Coloca la barra alta en trapecios; eleva talones con calzas o zapatillas de halterofilia.',
          'Empuja las rodillas hacia adelante sobre las puntas manteniendo el pecho erguido.',
          'Baja profundo hasta que los isquios toquen los gemelos.'
        ],
        activation: [
          { nameEn: 'Quads', nameEs: 'Cuádriceps', percent: 96, isPrimary: true },
          { nameEn: 'Glutes', nameEs: 'Glúteos', percent: 65, isPrimary: false },
          { nameEn: 'Spinal Erectors', nameEs: 'Erectores Lumbares', percent: 50, isPrimary: false }
        ]
      },
      {
        id: 'squat-low-bar-hinge',
        nameEn: 'Low-Bar Hip Hinge (Glute & Posterior Chain Bias)',
        nameEs: 'Barra Baja con Mayor Bisagra (Énfasis Glúteo y Cadena Posterior)',
        focusEn: 'Gluteus Maximus & Hip Extensors',
        focusEs: 'Glúteo Mayor y Cadena Posterior',
        advantageEn: 'Longer hip moment arm recruits glutes and adductors for max poundage',
        advantageEs: 'Mayor brazo de palanca en cadera recluta glúteos y aductores para máxima carga',
        jointStress: 'Moderate-High',
        peakTension: 'Mid-range',
        sfr: 'Moderate',
        cuesEn: [
          'Rest bar across rear deltoids with wider stance.',
          'Hinge back at the hips, allowing torso to lean forward ~45°.',
          'Drive hips forward forcefully out of the hole.'
        ],
        cuesEs: [
          'Apoya la barra sobre los deltoides posteriores con una postura más ancha.',
          'Lleva la cadera hacia atrás inclinando el torso unos 45°.',
          'Empuja con la cadera hacia adelante con fuerza al subir.'
        ],
        activation: [
          { nameEn: 'Glutes', nameEs: 'Glúteos', percent: 92, isPrimary: true },
          { nameEn: 'Spinal Erectors', nameEs: 'Erectores Lumbares', percent: 80, isPrimary: true },
          { nameEn: 'Quads', nameEs: 'Cuádriceps', percent: 72, isPrimary: false },
          { nameEn: 'Adductors', nameEs: 'Aductores', percent: 70, isPrimary: false }
        ]
      }
    ]
  },

  // 8. Leg Press
  {
    key: 'leg_press',
    match: e => e.n.includes('leg press'),
    category: 'quads',
    variants: [
      {
        id: 'lp-low-narrow',
        nameEn: 'Feet Low & Narrow on Platform (Pure Quad Focus)',
        nameEs: 'Pies Bajos y Juntos en Plataforma (Énfasis Cuádriceps)',
        focusEn: 'Quadriceps / Knee Extensors',
        focusEs: 'Cuádriceps (Vasto Lateral y Recto Femoral)',
        advantageEn: 'Maximizes knee flexion angle and quad tension; minimizes hip extensor contribution',
        advantageEs: 'Maximiza la flexión de rodilla y la tensión en cuádriceps; minimiza la cadera',
        jointStress: 'Moderate',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Position feet in bottom third of plate, hip-width apart.',
          'Lower carriage smoothly until knees reach deep angle without tailbone lifting.',
          'Push through midfoot/balls of feet, stopping just short of knee hyperextension.'
        ],
        cuesEs: [
          'Coloca los pies en el tercio inferior de la plataforma a la anchura de caderas.',
          'Baja suave hasta máxima profundidad sin despegar el coxis del asiento.',
          'Empuja con la planta del pie sin bloquear bruscamente las rodillas arriba.'
        ],
        activation: [
          { nameEn: 'Quads', nameEs: 'Cuádriceps', percent: 96, isPrimary: true },
          { nameEn: 'Glutes', nameEs: 'Glúteos', percent: 40, isPrimary: false }
        ]
      },
      {
        id: 'lp-high-wide',
        nameEn: 'Feet High & Wide (Glutes & Adductors Bias)',
        nameEs: 'Pies Altos y Separados (Énfasis Glúteos y Aductores)',
        focusEn: 'Gluteus Maximus & Inner Thighs',
        focusEs: 'Glúteo Mayor y Aductores',
        advantageEn: 'Increases hip flexion depth, shifting peak stimulus to glutes',
        advantageEs: 'Aumenta el recorrido de cadera, trasladando el estímulo al glúteo',
        jointStress: 'Low',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Place feet at top of platform, slightly wider than shoulder width with toes turned out 30°.',
          'Descend deep into hip crease.',
          'Drive through heels.'
        ],
        cuesEs: [
          'Coloca los pies en la parte superior de la plataforma, más anchos que hombros con puntas a 30°.',
          'Baja profundo sintiendo la apertura y estiramiento de glúteos.',
          'Empuja principalmente con los talones.'
        ],
        activation: [
          { nameEn: 'Glutes', nameEs: 'Glúteos', percent: 90, isPrimary: true },
          { nameEn: 'Adductors', nameEs: 'Aductores', percent: 80, isPrimary: true },
          { nameEn: 'Quads', nameEs: 'Cuádriceps', percent: 58, isPrimary: false }
        ]
      }
    ]
  },

  // 9. Romanian Deadlift & Hip Hinge
  {
    key: 'rdl_hinge',
    match: e => e.n.includes('romanian deadlift') || e.n.includes('stiff leg') || e.n.includes('rdl') || (e.nameEn && (e.nameEn.includes('romanian') || e.nameEn.includes('stiff'))),
    category: 'hamstrings',
    variants: [
      {
        id: 'rdl-fixed-soft-knee',
        nameEn: 'Fixed 15° Knee Bend (Hamstrings in Lengthened Position)',
        nameEs: 'Rodillas a 15° Fijas (Énfasis Isquiosurales Estirados)',
        focusEn: 'Hamstrings (Biceps Femoris & Semitendinosus)',
        focusEs: 'Isquiosurales en Posición de Máximo Estiramiento',
        advantageEn: 'Pure hip hinge; delivers greatest hypertrophy stimulus per rep',
        advantageEs: 'Bisagra de cadera pura; produce el mayor estímulo hipertrófico por repetición',
        jointStress: 'Low-Moderate',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Unlock knees to ~15° and freeze knee angle throughout the descent.',
          'Push hips back as if trying to touch a wall behind you with your glutes.',
          'Stop when hips stop moving backward (usually just below knees).'
        ],
        cuesEs: [
          'Desbloquea rodillas a ~15° y congela ese ángulo durante toda la bajada.',
          'Empuja la cadera hacia atrás como si quisieras tocar una pared con los glúteos.',
          'Detén la bajada cuando la cadera no vaya más atrás (normalmente bajo las rodillas).'
        ],
        activation: [
          { nameEn: 'Hamstrings', nameEs: 'Isquiosurales', percent: 96, isPrimary: true },
          { nameEn: 'Glutes', nameEs: 'Glúteos', percent: 82, isPrimary: true },
          { nameEn: 'Lower Back', nameEs: 'Erectores Lumbares', percent: 62, isPrimary: false }
        ]
      },
      {
        id: 'rdl-deeper-knee',
        nameEn: 'Greater Knee Flexion / B-Stance (Glute Max Bias)',
        nameEs: 'Mayor Flexión de Rodilla / B-Stance (Énfasis Glúteo)',
        focusEn: 'Gluteus Maximus Upper & Lower Divs',
        focusEs: 'Glúteo Mayor',
        advantageEn: 'Additional knee flexion shortens hamstrings, forcing glutes to execute the hinge',
        advantageEs: 'Mayor flexión de rodilla acorta los isquios, obligando al glúteo a cargar la extensión',
        jointStress: 'Low',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Allow knees to bend to ~35°–45° as hips travel back.',
          'Keep shin vertical and focus all tension into hips.',
          'Drive forward through the front heel.'
        ],
        cuesEs: [
          'Permite que las rodillas se flexionen a unos 35°–45° mientras la cadera va atrás.',
          'Mantén las tibias verticales y concéntrate en estirar el glúteo.',
          'Empuja con el talón extendiendo la cadera.'
        ],
        activation: [
          { nameEn: 'Glutes', nameEs: 'Glúteos', percent: 95, isPrimary: true },
          { nameEn: 'Hamstrings', nameEs: 'Isquiosurales', percent: 70, isPrimary: false },
          { nameEn: 'Lower Back', nameEs: 'Erectores Lumbares', percent: 55, isPrimary: false }
        ]
      }
    ]
  },

  // 10. Lateral Raises (Dumbbell, Cable, Machine)
  {
    key: 'lateral_raise',
    match: e => e.n.includes('lateral raise') || (e.nameEn && e.nameEn.includes('lateral raise')),
    category: 'shoulders',
    variants: [
      {
        id: 'lat-scapular-30',
        nameEn: 'Scapular Plane (30° Forward with Slight Torso Lean)',
        nameEs: 'Plano Escapular a 30° con Inclinación (Máxima Activación)',
        focusEn: 'Lateral Deltoid (Side Delt)',
        focusEs: 'Deltoides Lateral',
        advantageEn: 'Prevents supraspinatus subacromial impingement; aligns delt fibers for max leverage',
        advantageEs: 'Previene el pinzamiento subacromial y alinea el deltoides con la resistencia',
        jointStress: 'Minimal',
        peakTension: 'Shortened',
        sfr: 'Very High',
        cuesEn: [
          'Raise arms ~30° in front of the pure side plane (scapular plane).',
          'Lead with elbows, keeping hands level or slightly below elbows.',
          'Lean forward 10°–15° at the hips.'
        ],
        cuesEs: [
          'Eleva los brazos unos 30° por delante del cuerpo en el plano escapular.',
          'Guía el movimiento con los codos, nunca con las muñecas por encima.',
          'Inclina el torso ligeramente hacia adelante unos 10°–15°.'
        ],
        activation: [
          { nameEn: 'Lateral Deltoid', nameEs: 'Deltoides Lateral', percent: 96, isPrimary: true },
          { nameEn: 'Anterior Deltoid', nameEs: 'Deltoides Anterior', percent: 35, isPrimary: false },
          { nameEn: 'Upper Trapezius', nameEs: 'Trapecio Superior', percent: 28, isPrimary: false }
        ]
      },
      {
        id: 'lat-behind-back-cable',
        nameEn: 'Cable Behind Back / Knee-Height (Continuous Tension Curve)',
        nameEs: 'En Polea Tras Espalda (Tensión Continua en Estiramiento)',
        focusEn: 'Lateral Deltoid at Stretch & Peak',
        focusEs: 'Deltoides Lateral en Rango Completo',
        advantageEn: 'Dumbbells have 0 tension at bottom; cable provides tension throughout 100% of ROM',
        advantageEs: 'Las mancuernas no tienen tensión abajo; la polea ofrece tensión en todo el recorrido',
        jointStress: 'Minimal',
        peakTension: 'Continuous',
        sfr: 'Very High',
        cuesEn: [
          'Set pulley at knee height and pull cable from behind your back.',
          'Maintain constant tension even at the very bottom.',
          'Pause 0.5s at shoulder height.'
        ],
        cuesEs: [
          'Coloca la polea a la altura de la rodilla pasando el cable por detrás de la espalda.',
          'Siente la tensión constante desde abajo sin soltar.',
          'Aguanta medio segundo arriba a la altura del hombro.'
        ],
        activation: [
          { nameEn: 'Lateral Deltoid', nameEs: 'Deltoides Lateral', percent: 98, isPrimary: true },
          { nameEn: 'Upper Trapezius', nameEs: 'Trapecio Superior', percent: 22, isPrimary: false }
        ]
      }
    ]
  },

  // 11. Biceps Curls (Incline, Preacher, Hammer, Standing)
  {
    key: 'biceps_curl',
    match: e => (e.bp === 'upper arms' || e.tg === 'biceps') && (e.n.includes('bicep curl') || e.n.includes('biceps curl') || e.n.includes('hammer curl') || e.n.includes('preacher curl')),
    category: 'biceps',
    variants: [
      {
        id: 'curl-incline-stretch',
        nameEn: 'Incline Bench (Elbows Behind Torso / Long Head Bias)',
        nameEs: 'Banco Inclinado (Codos Atrás / Cabeza Larga)',
        focusEn: 'Long Head of Biceps (Peak)',
        focusEs: 'Cabeza Larga del Bíceps (Pico del Bíceps)',
        advantageEn: 'Pre-stretches long head over the shoulder joint for lengthened hypertrophy',
        advantageEs: 'Pre-estira la cabeza larga sobre el hombro para máximo estímulo hipertrófico',
        jointStress: 'Low',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Set bench to 60° angle and let arms hang vertically behind torso.',
          'Keep upper arms stationary; curl dumbbells while supinating wrists.',
          'Emphasize full extension and stretch at the bottom.'
        ],
        cuesEs: [
          'Coloca el banco a 60° y deja caer los brazos por detrás del torso.',
          'Mantén el codo inmóvil; flexiona supinando las muñecas hacia afuera.',
          'Estira completamente el bíceps abajo antes de la siguiente repetición.'
        ],
        activation: [
          { nameEn: 'Biceps Long Head', nameEs: 'Cabeza Larga del Bíceps', percent: 95, isPrimary: true },
          { nameEn: 'Biceps Short Head', nameEs: 'Cabeza Corta', percent: 75, isPrimary: false },
          { nameEn: 'Brachialis', nameEs: 'Braquial Anterior', percent: 60, isPrimary: false }
        ]
      },
      {
        id: 'curl-preacher-short',
        nameEn: 'Preacher / Scott (Elbows Forward / Short Head Bias)',
        nameEs: 'Banco Scott / Predicador (Codos Adelante / Cabeza Corta)',
        focusEn: 'Short Head of Biceps & Brachialis',
        focusEs: 'Cabeza Corta del Bíceps y Braquial',
        advantageEn: 'Places shoulder in flexion, shifting highest tension to initial range & short head',
        advantageEs: 'Hombro en flexión traslada la mayor tensión al inicio y a la cabeza corta',
        jointStress: 'Low-Moderate',
        peakTension: 'Lengthened',
        sfr: 'High',
        cuesEn: [
          'Armpits wedged firmly on top of the preacher pad.',
          'Do not hyperextend elbows aggressively at bottom.',
          'Stop curling before forearm reaches 90° vertical where tension drops.'
        ],
        cuesEs: [
          'Apoya bien las axilas en el borde superior del soporte.',
          'Controla la bajada sin bloquear de golpe los codos.',
          'No subas hasta la vertical completa para no perder la tensión.'
        ],
        activation: [
          { nameEn: 'Biceps Short Head', nameEs: 'Cabeza Corta del Bíceps', percent: 95, isPrimary: true },
          { nameEn: 'Brachialis', nameEs: 'Braquial Anterior', percent: 85, isPrimary: true },
          { nameEn: 'Biceps Long Head', nameEs: 'Cabeza Larga', percent: 65, isPrimary: false }
        ]
      },
      {
        id: 'curl-hammer-neutral',
        nameEn: 'Hammer Grip (Brachialis & Forearm Brachioradialis Bias)',
        nameEs: 'Agarre Martillo (Braquial y Antebrazo / Braquiorradial)',
        focusEn: 'Brachialis & Brachioradialis',
        focusEs: 'Músculo Braquial y Braquiorradial',
        advantageEn: 'Pushes bicep outward creating arm thickness; strengthens wrist & elbow tendons',
        advantageEs: 'Empuja el bíceps hacia afuera dando grosor al brazo y refuerza tendones',
        jointStress: 'Minimal',
        peakTension: 'Mid-range',
        sfr: 'Very High',
        cuesEn: [
          'Maintain neutral palms facing inward throughout the entire repetition.',
          'Curl weights with slight inward angle towards chest.',
          'Squeeze forearm and upper arm at peak.'
        ],
        cuesEs: [
          'Mantén las palmas enfrentadas durante todo el recorrido.',
          'Flexiona llevando las mancuernas ligeramente hacia el centro del pecho.',
          'Aprieta con fuerza antebrazo y braquial en la cima.'
        ],
        activation: [
          { nameEn: 'Brachialis', nameEs: 'Braquial Anterior', percent: 96, isPrimary: true },
          { nameEn: 'Brachioradialis (Forearm)', nameEs: 'Braquiorradial (Antebrazo)', percent: 90, isPrimary: true },
          { nameEn: 'Biceps Brachii', nameEs: 'Bíceps Braquial', percent: 70, isPrimary: false }
        ]
      }
    ]
  },

  // 12. Triceps Extensions & Pushdowns
  {
    key: 'triceps_extension',
    match: e => (e.bp === 'upper arms' || e.tg === 'triceps') && (e.n.includes('tricep') || e.n.includes('triceps') || e.n.includes('pushdown') || e.n.includes('skullcrusher')),
    category: 'triceps',
    variants: [
      {
        id: 'tri-overhead-stretch',
        nameEn: 'Overhead Cable / Dumbbell (Long Head Lengthened Bias)',
        nameEs: 'Extensión Sobre la Cabeza (Cabeza Larga Estirada)',
        focusEn: 'Triceps Long Head (Back of Arm)',
        focusEs: 'Cabeza Larga del Tríceps',
        advantageEn: 'Only overhead position stretches the long head across the shoulder for max growth',
        advantageEs: 'Solo la posición sobre la cabeza estira la cabeza larga para máximo crecimiento',
        jointStress: 'Low',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Set cable at chest or waist height and face away with torso angled forward.',
          'Let forearms hinge back behind head for complete stretch.',
          'Extend forward locking elbows fully without moving shoulder angle.'
        ],
        cuesEs: [
          'Coloca la polea a media altura e inclina el torso hacia adelante.',
          'Deja que los antebrazos vayan detrás de la cabeza para máximo estiramiento.',
          'Extiende los codos al frente bloqueando sin mover los hombros.'
        ],
        activation: [
          { nameEn: 'Triceps Long Head', nameEs: 'Cabeza Larga del Tríceps', percent: 96, isPrimary: true },
          { nameEn: 'Triceps Lateral Head', nameEs: 'Cabeza Lateral', percent: 75, isPrimary: false },
          { nameEn: 'Triceps Medial Head', nameEs: 'Cabeza Medial', percent: 70, isPrimary: false }
        ]
      },
      {
        id: 'tri-pushdown-rope-spread',
        nameEn: 'Cable Pushdown with Rope Spread (Lateral & Medial Heads)',
        nameEs: 'Jalón en Polea con Cuerda Abriendo (Cabeza Lateral)',
        focusEn: 'Lateral Head ("Horseshoe" shape)',
        focusEs: 'Cabeza Lateral y Medial ("Forma de Herradura")',
        advantageEn: 'Spreading the rope past hips achieves full triceps shortened contraction',
        advantageEs: 'Separar las cuerdas más allá de la cadera logra la contracción acortada completa',
        jointStress: 'Minimal',
        peakTension: 'Shortened',
        sfr: 'Very High',
        cuesEn: [
          'Pin upper arms to ribcage; lean forward 10°.',
          'Push downward and spread the rope handles apart past your hips at lockout.',
          'Hold 1s peak squeeze.'
        ],
        cuesEs: [
          'Pega los codos a los costados con ligera inclinación de 10°.',
          'Empuja hacia abajo y abre los extremos de la cuerda hacia afuera al final.',
          'Aguanta 1 segundo la contracción en el bloqueo.'
        ],
        activation: [
          { nameEn: 'Triceps Lateral Head', nameEs: 'Cabeza Lateral del Tríceps', percent: 95, isPrimary: true },
          { nameEn: 'Triceps Medial Head', nameEs: 'Cabeza Medial', percent: 90, isPrimary: true },
          { nameEn: 'Triceps Long Head', nameEs: 'Cabeza Larga', percent: 65, isPrimary: false }
        ]
      }
    ]
  },

  // 13. Calves (Standing vs Seated)
  {
    key: 'calves',
    match: e => e.bp === 'lower legs' || e.tg === 'calves',
    category: 'calves',
    variants: [
      {
        id: 'calves-straight-knee',
        nameEn: 'Standing / Straight-Leg (Gastrocnemius Diamond Bias)',
        nameEs: 'De Pie con Rodillas Rectas (Énfasis Gastrocnemio)',
        focusEn: 'Gastrocnemius (Upper Calf Diamond)',
        focusEs: 'Gastrocnemio / Gemelos Externo e Interno',
        advantageEn: 'Straight knee allows gastrocnemius to contract fully without active insufficiency',
        advantageEs: 'Rodilla recta permite la contracción completa del gastrocnemio',
        jointStress: 'Low',
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Keep knees straight with a soft micro-bend (not locked out stiff).',
          'Drop heels as low as possible and pause 2s in deep stretch.',
          'Rise onto big toe knuckles with explosive force.'
        ],
        cuesEs: [
          'Mantén las rodillas rectas sin bloquearlas rígidamente.',
          'Baja los talones todo lo posible y aguanta 2s de pausa en estiramiento.',
          'Sube de forma explosiva apoyando sobre la base del dedo gordo.'
        ],
        activation: [
          { nameEn: 'Gastrocnemius (Calves)', nameEs: 'Gastrocnemio (Gemelos)', percent: 96, isPrimary: true },
          { nameEn: 'Soleus', nameEs: 'Sóleo', percent: 55, isPrimary: false }
        ]
      },
      {
        id: 'calves-seated-bent',
        nameEn: 'Seated / 90° Knee Bend (Soleus Thickness Bias)',
        nameEs: 'Sentado con Rodillas a 90° (Énfasis Sóleo)',
        focusEn: 'Soleus (Lower Calf Thickness)',
        focusEs: 'Músculo Sóleo (Grosor Inferior)',
        advantageEn: 'At 90° knee flexion, gastrocnemius is slackened; soleus does 90% of the work',
        advantageEs: 'A 90° de flexión el gemelo se inhibe y el sóleo asume el 90% de la carga',
        jointStress: 'Minimal',
        peakTension: 'Shortened',
        sfr: 'Very High',
        cuesEn: [
          'Sit with thighs secured firmly under pad.',
          'Drop heels down deeply, pause 1s, then press up to full plantarflexion.',
          'Emphasize slow controlled cadence.'
        ],
        cuesEs: [
          'Siéntate con los muslos bien sujetos bajo el cojín.',
          'Baja talones profundo, aguanta 1s y sube a máxima contracción.',
          'Mantén una cadencia lenta y controlada.'
        ],
        activation: [
          { nameEn: 'Soleus', nameEs: 'Músculo Sóleo', percent: 96, isPrimary: true },
          { nameEn: 'Gastrocnemius', nameEs: 'Gastrocnemio', percent: 25, isPrimary: false }
        ]
      }
    ]
  }
]

/**
 * Universal Fallback Generator for any exercise in the 1,324 dataset
 */
function generateUniversalBiomechanicalProfile(ex) {
  const cls = classifyExercise(ex)
  const isEs = getLang() === 'es'
  const bp = ex.bp || 'other'
  const tg = ex.tg || 'primary muscle'
  const eq = ex.eq || 'equipment'

  // Determine peak tension based on equipment and movement pattern
  let peakTension = 'Mid-range'
  if (eq.includes('cable') || eq.includes('rope')) {
    peakTension = 'Continuous'
  } else if (eq.includes('dumbbell') || eq.includes('barbell')) {
    if (cls.pat === 'push' || cls.pat === 'knee_dominant' || cls.pat === 'hip_dominant') {
      peakTension = 'Lengthened'
    } else {
      peakTension = 'Mid-range'
    }
  } else if (eq.includes('band')) {
    peakTension = 'Shortened'
  }

  // Derive joint stress
  let jointStress = 'Low'
  if (cls.jnt === 'compound') {
    jointStress = (eq.includes('barbell') || eq.includes('olympic')) ? 'Moderate' : 'Low-Moderate'
  }

  // Derive SFR
  let sfr = 'High'
  if (cls.jnt === 'isolation') sfr = 'Very High'
  else if (eq.includes('barbell') && cls.pat === 'hip_dominant') sfr = 'Moderate'

  const primaryPct = 90
  const secondaryPct = 50

  return {
    key: 'universal_' + ex.id,
    category: bp,
    variants: [
      {
        id: `univ-standard-${ex.id}`,
        nameEn: 'Standard Execution (Full ROM)',
        nameEs: 'Ejecución Estándar (Rango Completo)',
        focusEn: `${tg} (Primary Target)`,
        focusEs: `${tg} (Zona Principal)`,
        advantageEn: 'Balanced tension curve through full active range of motion',
        advantageEs: 'Curva de tensión equilibrada en todo el rango de movimiento activo',
        jointStress,
        peakTension,
        sfr,
        cuesEn: [
          'Maintain a controlled 2–3s eccentric (lowering) phase.',
          'Pause briefly at the bottom to eliminate momentum.',
          'Execute the concentric phase with smooth power.'
        ],
        cuesEs: [
          'Mantén una fase excéntrica (bajada) controlada de 2 a 3 segundos.',
          'Haz una breve pausa en el punto de cambio para eliminar rebotes e inercia.',
          'Realiza la fase concéntrica con potencia fluida y control articular.'
        ],
        activation: [
          { nameEn: tg, nameEs: tg, percent: primaryPct, isPrimary: true },
          ...(ex.sm || []).slice(0, 2).map(s => ({
            nameEn: s,
            nameEs: s,
            percent: secondaryPct,
            isPrimary: false
          }))
        ]
      },
      {
        id: `univ-stretch-pause-${ex.id}`,
        nameEn: 'Lengthened Pause (Stretch Hypertrophy Bias)',
        nameEs: 'Pausa en Estiramiento (Énfasis Hipertrofia por Estiramiento)',
        focusEn: `${tg} (Lengthened Fibers)`,
        focusEs: `${tg} (Tensión Mecánica Máxima)`,
        advantageEn: 'Maximizes mechanical tension where muscle fibers experience stretch-mediated hypertrophy',
        advantageEs: 'Maximiza la tensión mecánica donde las fibras experimentan hipertrofia por estiramiento',
        jointStress: jointStress === 'Low' ? 'Low-Moderate' : jointStress,
        peakTension: 'Lengthened',
        sfr: 'Very High',
        cuesEn: [
          'Lower smoothly to the maximum comfortable lengthened position.',
          'Hold an active 2-second dead stop pause under stretch.',
          'Initiate the lift purely with the target muscle without jerking.'
        ],
        cuesEs: [
          'Baja suavemente hasta la posición de máximo estiramiento cómodo.',
          'Mantén una pausa activa de 2 segundos en la posición estirada.',
          'Inicia la subida únicamente con la musculatura objetivo sin tirones.'
        ],
        activation: [
          { nameEn: `${tg} (Stretch)`, nameEs: `${tg} (Estiramiento)`, percent: 95, isPrimary: true },
          ...(ex.sm || []).slice(0, 2).map(s => ({
            nameEn: s,
            nameEs: s,
            percent: 45,
            isPrimary: false
          }))
        ]
      }
    ]
  }
}

/**
 * Main public API: Get biomechanical profile and variants for any exercise
 */
export function getBiomechanicalProfile(ex) {
  if (!ex) return null
  const archetype = ARCHETYPES.find(a => a.match(ex))
  if (archetype) {
    return {
      key: archetype.key,
      category: archetype.category,
      variants: archetype.variants
    }
  }
  return generateUniversalBiomechanicalProfile(ex)
}

/**
 * Convenience helper to get localized variant fields
 */
export function localizeVariant(variant) {
  const isEs = getLang() === 'es'
  return {
    id: variant.id,
    name: isEs ? (variant.nameEs || variant.nameEn) : variant.nameEn,
    focus: isEs ? (variant.focusEs || variant.focusEn) : variant.focusEn,
    advantage: isEs ? (variant.advantageEs || variant.advantageEn) : variant.advantageEn,
    jointStress: isEs ? translateJointStress(variant.jointStress) : variant.jointStress,
    peakTension: isEs ? translatePeakTension(variant.peakTension) : variant.peakTension,
    sfr: isEs ? translateSFR(variant.sfr) : variant.sfr,
    cues: isEs ? (variant.cuesEs || variant.cuesEn) : variant.cuesEn,
    activation: (variant.activation || []).map(a => ({
      name: isEs ? (a.nameEs || a.nameEn) : a.nameEn,
      percent: a.percent,
      isPrimary: a.isPrimary
    }))
  }
}

function translateJointStress(s) {
  const map = {
    'Minimal': 'Mínimo',
    'Low': 'Bajo',
    'Low-Moderate': 'Bajo-Medio',
    'Moderate': 'Medio',
    'Moderate-High': 'Medio-Alto',
    'High': 'Alto'
  }
  return map[s] || s
}

function translatePeakTension(p) {
  const map = {
    'Lengthened': 'Posición Estirada (Mayor Estímulo)',
    'Shortened': 'Posición Acortada (Pico Contracción)',
    'Mid-range': 'Rango Medio',
    'Continuous': 'Tensión Continua (100% Recorrido)'
  }
  return map[p] || p
}

function translateSFR(s) {
  const map = {
    'Very High': 'Muy Alto (Óptimo)',
    'High': 'Alto',
    'Moderate': 'Medio',
    'Low': 'Bajo'
  }
  return map[s] || s
}
