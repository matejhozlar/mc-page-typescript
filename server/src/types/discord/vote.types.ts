export interface Vote {
  active: boolean;
  cooldownUntil: number;
  counts: { yes: number; no: number };
  voters: Set<string>;
  timeout: NodeJS.Timeout | null;
}

export interface VoteDetails {
  description: string;
  command: string;
}

export interface VoteInitiator {
  name: string;
}
