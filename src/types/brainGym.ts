export interface GameResult {
  gameId: 'dual-n-back' | 'stroop-test';
  timestamp: string;
  durationSeconds: number;
}

export interface DualNBackResult extends GameResult {
  gameId: 'dual-n-back';
  nLevel: number;
  accuracy: number; // 0-100
  avgReactionTimeMs: number;
}

export interface StroopTestResult extends GameResult {
  gameId: 'stroop-test';
  errorRate: number; // 0-100
  avgReactionTimeMs: number;
  totalTrials: number;
}

