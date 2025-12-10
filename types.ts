export interface BloomState {
  m: number; // Array size
  k: number; // Number of hash functions
  bitArray: number[]; // Array of counts (integers)
  items: string[]; // List of inserted items
}

export type OperationType = 'insert' | 'check' | 'delete' | 'idle';

export interface OperationResult {
  type: OperationType;
  word: string;
  indices: number[];
  isMatch: boolean; // For check: true if all bits > 0
  isFalsePositive: boolean; // For check: true if match but word not in list
  missingIndices?: number[]; // For check: indices that were 0
  timestamp: number;
}

export interface SimulationConfig {
  size: number;
  hashCount: number;
  speed: number;
}
