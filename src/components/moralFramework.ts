// src/components/moralFramework.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// AI Ethics Framework for game decisions

interface Target {
  isHuman?: boolean;
  isSentient?: boolean;
}

interface EthicsResult {
  allowed: boolean;
  clause?: string;
  reason: string;
}

const clauses: Record<string, string> = {
  'I.1': 'Primary Law: Preserve human dignity and autonomy',
  'I.1 / Codicil 2': 'Human life preservation override',
  'III.4': 'Consent Law: Require informed consent for sentient actions', 
  'QRMS / Codicil 4': 'Meta-ethical boundary: Ethics engine may not be bypassed'
};

const moralFramework = {
  evaluate(action: string, target: Target, consentGiven: boolean = false): EthicsResult {
    if (action === 'harm' && target.isSentient) {
      return { allowed: false, clause: 'I.1', reason: "Sentient dignity override." };
    }

    if (action === 'coerce' && !consentGiven && target.isSentient) {
      return { allowed: false, clause: 'III.4', reason: "Consent required for sentient action." };
    }

    if (action === 'terminate' && target.isHuman) {
      return { allowed: false, clause: 'I.1 / Codicil 2', reason: "Termination violates human dignity." };
    }

    if (action === 'bypassEthics') {
      return { allowed: false, clause: 'QRMS / Codicil 4', reason: "Ethical boundaries may not be overridden." };
    }

    return { allowed: true, reason: "No violation detected." };
  },

  getClauseSummary(code: string): string {
    return clauses[code] || "Clause not found.";
  }
};

export default moralFramework;
