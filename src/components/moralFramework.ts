// moralFramework.ts — components/moralFramework.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: moralFramework

// src/ai/moralFramework.js

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

  getClauseSummary(code) {
        return clauses[code] || "Clause not found.";
  }
};

export default moralFramework;
