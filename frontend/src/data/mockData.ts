import type { NCProgram, Machine, SetupSheet } from '../types';

// Re-export types for convenience
export type { NCProgram };

export const mockPrograms: NCProgram[] = [
  {
    id: 'O1001',
    name: 'O1001-HOUSING-OP10.NC',
    partNumber: 'P-2847-A',
    revision: 'C',
    machine: 'HAAS-VF4',
    operation: 'OP10-Mill Top Face',
    material: 'AL-6061-T6',
    status: 'Released',
    author: 'J. Miller',
    lastModified: '2025-10-28 14:23',
    workOrder: 'WO-5521',
    customer: 'Vestas Wind Systems',
    hasCAD: true,
    hasDXF: true,
    hasSetupSheet: true,
    description: 'Housing top face milling with pockets'
  },
  {
    id: 'O1002',
    name: 'O1002-HOUSING-OP20.NC',
    partNumber: 'P-2847-A',
    revision: 'C',
    machine: 'HAAS-VF4',
    operation: 'OP20-Mill Bottom Face',
    material: 'AL-6061-T6',
    status: 'Released',
    author: 'J. Miller',
    lastModified: '2025-10-28 14:25',
    workOrder: 'WO-5521',
    customer: 'Vestas Wind Systems',
    hasCAD: true,
    hasDXF: true,
    hasSetupSheet: true,
    description: 'Housing bottom face milling'
  },
  {
    id: 'O2150',
    name: 'O2150-BRACKET-OP10.NC',
    partNumber: 'P-3912-B',
    revision: 'B',
    machine: 'DMG-DMU50',
    operation: 'OP10-5-Axis Contour',
    material: 'TI-6AL4V',
    status: 'In Review',
    author: 'S. Chen',
    lastModified: '2025-10-29 09:15',
    workOrder: 'WO-5623',
    customer: 'Terma A/S',
    hasCAD: true,
    hasDXF: false,
    hasSetupSheet: false,
    description: 'Aerospace bracket 5-axis contour operation'
  },
  {
    id: 'O3001',
    name: 'O3001-SHAFT-OP10.NC',
    partNumber: 'P-4125-A',
    revision: 'A',
    machine: 'MAZAK-QT250',
    operation: 'OP10-Turn OD',
    material: 'SS-316',
    status: 'Approved',
    author: 'M. Rodriguez',
    lastModified: '2025-10-27 16:45',
    workOrder: 'WO-5588',
    customer: 'Grundfos',
    hasCAD: true,
    hasDXF: true,
    hasSetupSheet: true,
    description: 'Shaft turning operation - outer diameter'
  },
  {
    id: 'O3002',
    name: 'O3002-SHAFT-OP20.NC',
    partNumber: 'P-4125-A',
    revision: 'A',
    machine: 'MAZAK-QT250',
    operation: 'OP20-Turn Threading',
    material: 'SS-316',
    status: 'Draft',
    author: 'M. Rodriguez',
    lastModified: '2025-10-29 11:30',
    workOrder: 'WO-5588',
    customer: 'Grundfos',
    hasCAD: false,
    hasDXF: false,
    hasSetupSheet: false,
    description: 'Thread cutting operation'
  },
  {
    id: 'O4500',
    name: 'O4500-GEAR-HOBBING.NC',
    partNumber: 'P-8821-C',
    revision: 'D',
    machine: 'LIEBHERR-LC82',
    operation: 'OP30-Gear Hobbing',
    material: 'STEEL-4340',
    status: 'Released',
    author: 'T. Anderson',
    lastModified: '2025-10-26 08:12',
    workOrder: 'WO-5477',
    customer: 'Danfoss',
    hasCAD: true,
    hasDXF: true,
    hasSetupSheet: true,
    description: 'Precision gear hobbing operation'
  },
];

export const recentActivity = [
  { action: 'Released', program: 'O1001-HOUSING-OP10.NC', user: 'J. Miller', time: '2 hours ago' },
  { action: 'Approved', program: 'O3001-SHAFT-OP10.NC', user: 'Quality Team', time: '5 hours ago' },
  { action: 'Sent to Machine', program: 'O4500-GEAR-HOBBING.NC', user: 'Shop Floor', time: '1 day ago' },
  { action: 'Review Started', program: 'O2150-BRACKET-OP10.NC', user: 'S. Chen', time: '2 days ago' },
];

export const machines: Machine[] = [
  { id: 'HAAS-VF4', name: 'HAAS VF-4', type: 'Fræsemaskine', status: 'Online', programs: 24 },
  { id: 'DMG-DMU50', name: 'DMG DMU 50', type: '5-Akset Fræsemaskine', status: 'Online', programs: 12 },
  { id: 'MAZAK-QT250', name: 'MAZAK QT-250', type: 'Drejebænk', status: 'Offline', programs: 18 },
  { id: 'LIEBHERR-LC82', name: 'LIEBHERR LC 82', type: 'Tandhjulsfræser', status: 'Online', programs: 8 },
];

export const setupSheets: SetupSheet[] = [
  {
    id: 'SS-O1001',
    programId: 'O1001',
    machineType: 'HAAS VF-4 Fræsemaskine',
    tools: [
      {
        toolNumber: 1,
        toolName: '1" Planfræser',
        length: 214.25,
        offsetH: 8.4325,
        offsetD: 1.000,
        comment: '2000 RPM, 30 IPM'
      },
      {
        toolNumber: 2,
        toolName: '0.5" Endefræser',
        length: 157.94,
        offsetH: 6.2150,
        offsetD: 0.500,
        comment: '3000 RPM, 15 IPM'
      },
      {
        toolNumber: 3,
        toolName: '0.25" Bor',
        length: 149.73,
        offsetH: 5.8975,
        offsetD: 0.250,
        comment: '2500 RPM, 5 IPM'
      },
    ],
    originOffsets: [
      {
        name: 'G54',
        x: 0.0,
        y: 0.0,
        z: 0.0,
        a: 0.0,
        b: 0.0,
        c: 0.0,
      }
    ],
    fixtures: [
      {
        fixtureId: 'KURT-6IN-001',
        quantity: 1,
        setupDescription: 'Kurt 6" skruestik med bløde kæber. Emne centreret, 2.5mm over kæber.'
      }
    ],
    media: [
      { id: 'M1', type: 'image', url: '/media/setup1.jpg', caption: 'Emne monteret i skruestik - Nulpunkt top centrum', annotations: ['Nulpunkt her', 'Kontroller parallelitet'] },
      { id: 'M2', type: 'image', url: '/media/setup2.jpg', caption: 'Værktøjsopsætning - Alle værktøjer målt', annotations: ['Værktøj #1: 1" Planfræser'] },
      { id: 'M3', type: 'image', url: '/media/setup3.jpg', caption: 'Råmaterialedimensioner verificeret', annotations: ['Mål verificeret'] },
      { id: 'M4', type: 'image', url: '/media/setup4.jpg', caption: 'Kølevæske system kontrolleret', annotations: [] },
      { id: 'M5', type: 'video', url: '/media/setup-video.mp4', caption: 'Tørkørsel ved 25% fremdrift', annotations: [] },
    ],
    safetyChecklist: [
      'Værktøjsholder verificeret sikker - tilspændingsmoment 25 ft-lbs',
      'Værktøjsoffsets målt og indlæst',
      'Program tørkørsel gennemført ved 25% fremdrift override',
      'Kølevæskesystem kontrolleret og funktionsdygtigt',
      'Alle afskærmninger på plads og funktionelle',
      'Nødstop testet',
      'Første artikel inspektionsformular forberedt'
    ],
    createdBy: 'M. Rodriguez',
    createdAt: '2025-10-28 08:30',
    approvedBy: 'J. Miller',
    approvedAt: '2025-10-28 14:23',
  }
];

