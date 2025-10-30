export interface NCProgram {
  id: string;
  name: string;
  partNumber: string;
  revision: string;
  machine: string;
  operation: string;
  material: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Released' | 'Obsolete';
  author: string;
  lastModified: string;
  workOrder?: string;
  customer: string;
  hasCAD: boolean;
  hasDXF: boolean;
  hasSetupSheet: boolean;
  description?: string;
  ncCode?: string; // NC program code content
}

export interface Tool {
  toolNumber: number;
  toolName: string;
  length: number;
  offsetH: number;
  offsetD: number;
  comment?: string;
}

export interface OriginOffset {
  name: string; // G54, G55, G56, etc.
  x: number;
  y: number;
  z: number;
  a?: number;
  b?: number;
  c?: number;
}

export interface Fixture {
  fixtureId: string;
  quantity: number;
  setupDescription: string;
}

export interface SetupSheetMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  annotations?: string[];
}

export interface SetupSheet {
  id: string;
  programId: string;
  machineType: string;
  tools: Tool[];
  originOffsets: OriginOffset[];
  fixtures: Fixture[];
  media: SetupSheetMedia[]; // Must have exactly 5
  safetyChecklist: string[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'Online' | 'Offline';
  programs: number;
}
