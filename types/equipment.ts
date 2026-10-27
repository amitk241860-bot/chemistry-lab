// ============================================================
// Equipment Types
// ============================================================

export type EquipmentCategory =
  | 'glassware'
  | 'measurement'
  | 'heating'
  | 'support'
  | 'safety'
  | 'other';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  uses: string[];
  capacity?: string;          // e.g. "250 mL", "100 mL"
  unit?: string;              // measurement unit if applicable
  handlingInstructions: string[];
  compatibleWith: string[];   // Equipment IDs that work well with this
  hazards?: string[];
  icon: string;               // Lucide icon name
  modelType: EquipmentModelType;
}

export type EquipmentModelType =
  | 'beaker'
  | 'test-tube'
  | 'conical-flask'
  | 'volumetric-flask'
  | 'measuring-cylinder'
  | 'dropper'
  | 'pipette'
  | 'funnel'
  | 'glass-rod'
  | 'lab-stand'
  | 'clamp'
  | 'tripod'
  | 'wire-gauze'
  | 'thermometer'
  | 'balance'
  | 'spatula'
  | 'watch-glass'
  | 'evaporating-dish'
  | 'wash-bottle'
  | 'bunsen-burner'
  | 'mortar-pestle'
  | 'crucible';

export interface EquipmentSlot {
  slotId: string;
  position: [number, number, number];  // 3D position on workbench
  equipmentId: string | null;
  occupied: boolean;
}

export interface PlacedEquipment {
  instanceId: string;
  equipmentId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  containedSubstance?: {
    substanceId: string;
    volume: number;       // mL
    color: string;
  };
  isSelected: boolean;
  isHighlighted: boolean;
}
