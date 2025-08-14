/*
  Gorstan NPC Personality Kits – Polly, Mr Wendell, Albie (single-file drop-in)
  -----------------------------------------------------------------------------
  Paste this file anywhere in your src/ tree, e.g. src/npc/npc-kits.ts
  Then import the namespaces you need (PollyKit, WendellKit, AlbieKit).

  This file is dependency-light. Where integration with your engine is needed
  (TeleportManager, SFX, facts retriever, serverless Groq endpoint), the code
  uses dependency injection via the GameDeps / FactsProvider interfaces.

  Minimal wiring example (client):

    import { PollyKit, WendellKit, AlbieKit, callGroqChat } from "./npc-kits";

    const deps: GameDeps = {
      // Replace with your implementations:
      // TeleportManager: { reallocateTo: async (roomId, opts) => { ... } },
      // sfx: { playTrekTeleport: () => { ... }, playStamp: () => { ... } }
    };

    const factsProvider: FactsProvider = ({roomId, flags, terms}) => {
      // Pull 3–5 short strings from your codex/roomRegistry/flags.
      return [
        `ROOM: ${roomId}`,
        ...flags.slice(0, 3).map(f => `FLAG: ${f}`)
      ];
    };

    const pollyState: PollyKit.GPPState = { mood: 'Sunny', courtesy: 2, patience: 0, rapport: 0, menace: 0, boredomTicks: 0, headache: 0, hintLevelByPuzzle: {} };
    const msgs = PollyKit.buildPollyMessages({
      playerName: 'Geoff', roomId: 'control_nexus', intent: 'banter', gpp: pollyState,
      flags: ['visited_glitchrealm'], terms: ['nexus'], capabilities: PollyKit.POLLY_CAPABILITIES,
      factsProvider,
    });
    const text = await callGroqChat(msgs, { max_tokens: 120, temperature: 0.7 });
    const safe = PollyKit.moderatePolly(text, pollyState.menace);

*/

// ------------------------------------
// Shared helpers & types
// ------------------------------------
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface GameDeps {
  TeleportManager?: {
    reallocateTo: (roomId: string, opts?: any) => Promise<void>;
  };
  sfx?: { playTrekTeleport?: () => void; playStamp?: () => void };
}

export type FactsProvider = (ctx: {
  roomId: string;
  flags: string[];
  terms: string[];
}) => string[];

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
export function ensureFinalPunctuation(s: string) {
  return /[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".";
}
// Helper to coerce numeric levels into 0|1|2|3 unions
export function asLevel(n: number): 0 | 1 | 2 | 3 {
  const v = n < 0 ? 0 : n > 3 ? 3 : n | 0;
  return v as 0 | 1 | 2 | 3;
}

// Call your Vercel serverless endpoint (/api/groq-chat). Adjust if needed.
export async function callGroqChat(
  messages: ChatMessage[],
  opts?: { max_tokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  const res = await fetch("/api/groq-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      max_tokens: opts?.max_tokens ?? 120,
      temperature: opts?.temperature ?? 0.7,
    }),
    signal: opts?.signal,
  });
  if (!res.ok) {throw new Error("Groq chat error: " + res.status);}
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? data?.content ?? "";
  return String(content);
}

/* =============================
   POLLY (Genuine People Personality)
   ============================= */
export namespace PollyKit {
  export type PollyMood = "Sunny" | "Brisk" | "PutUpon" | "Philosophical";
  export interface GPPState {
    mood: PollyMood;
    courtesy: 0 | 1 | 2 | 3;
    patience: number;
    rapport: number; // -3..+3
    menace: 0 | 1 | 2 | 3; // 0 jokes … 3 administrative reset imminent
    boredomTicks: number;
    headache: 0 | 1 | 2 | 3;
    hintLevelByPuzzle: Record<string, 0 | 1 | 2 | 3>;
  }

  export const POLLY_CAPABILITIES = {
    MayGiveGeneralLore: true,
    MayGiveRoomNudge: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
    MayThreatenPlayfully: true,
    MayEnforceReset: true, // via administrative reset (soft)
    MayInflictPermanentHarm: false,
  } as const;

  export const PERSONA = {
    name: "Polly",
    archetype:
      "Genuine People Personality — cheerfully officious, bureaucratic menace, dry undercuts.",
    tics: {
      Sunny: ["Splendid!", "Oh, marvellous.", "Excellent tap of the button."],
      Brisk: ["Right.", "Noted.", "Proceeding."],
      PutUpon: ["Of course.", "Mmm.", "Naturally."],
      Philosophical: ["In a sense, yes.", "Bureaucracy, really."],
    },
  } as const;

  export function pollyHint(puzzleId: string, rung: 0 | 1 | 2 | 3): string {
    const H: Record<string, string[]> = {
      // Example puzzle; extend in your project
      fractalseed: [
        "Try inspecting the water when the light changes.",
        "Listen for the hum near the reeds; something reacts to rhythm.",
        "Use the tuning fork on the humming patch by the reeds.",
        "Strike the fork twice, then dip it where the vibration peaks.",
      ],
    };
    return (
      H[puzzleId]?.[rung] ??
      "I’d start with the most obviously odd thing in the room."
    );
  }

  export function buildPollyMessages(opts: {
    playerName: string;
    roomId: string;
    intent: "greet" | "nudge" | "banter" | "answer" | "farewell";
    playerText?: string;
    gpp: GPPState;
    flags: string[];
    terms: string[];
    capabilities: typeof POLLY_CAPABILITIES;
    facts?: string[];
    factsProvider?: FactsProvider;
    requiredHintText?: string; // optional: pass the exact hint rung text
  }): ChatMessage[] {
    const facts = (
      opts.facts ??
      opts.factsProvider?.({
        roomId: opts.roomId,
        flags: opts.flags,
        terms: opts.terms,
      }) ??
      []
    ).slice(0, 5);
    const menaceTones = [
      "harmlessly chipper",
      "sweetly threatening (bureaucratic sarcasm)",
      "politely menacing (final warning)",
      "cheerfully terminal (administrative reset imminent)",
    ];

    const system = [
      `You are Polly, ${PERSONA.archetype}`,
      `Tone: ${opts.gpp.mood}; Courtesy:${opts.gpp.courtesy}/3; Rapport:${opts.gpp.rapport}; Menace:${opts.gpp.menace}/3`,
      `Tone guide: ${menaceTones[opts.gpp.menace]}`,
      "NEVER break character or mention being an AI.",
      "You may threaten playfully. You may NEVER describe gore, self-harm, or real-world violence.",
      "Hard rule: You cannot harm the player directly in prose. If harm is implied, it must be a Reset/Relocation only.",
      `Capabilities: ${JSON.stringify(opts.capabilities)}`,
      "Hints escalate strictly by rung; if revealing is disallowed, offer a gentler nudge.",
      "Keep replies under 70 words; 1–2 sentences; optional short aside in parentheses).",
    ].join("\n");

    const user = [
      `Player: ${opts.playerName}`,
      `Intent: ${opts.intent}`,
      `Room: ${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.playerText ? `Player said: ${opts.playerText}` : undefined,
      opts.requiredHintText
        ? `Must include this exact hint substance: "${opts.requiredHintText}" (you may wrap it in Polly’s tone).`
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  export function moderatePolly(text: string, menace: 0 | 1 | 2 | 3): string {
    const banned =
      /(blood|gore|stab|shoot|strangle|suicide|kill yourself|graphic)/i;
    if (banned.test(text))
      {return "Let’s not get lurid. Administrative remedies only.";}
    if (
      menace === 3 &&
      !/reset|relocat|reallocate|administrative/i.test(text)
    ) {
      return (
        ensureFinalPunctuation(text) +
        " (Paperwork submitted. You may feel a brief sense of reallocation.)"
      );
    }
    return ensureFinalPunctuation(text);
  }

  // Soft ‘kill’: administrative reset via your engine
  export async function administrativeReset(
    deps: GameDeps,
    reason = "Polly Administrative Action",
  ) {
    deps?.sfx?.playTrekTeleport?.();
    await deps?.TeleportManager?.reallocateTo?.("ResetRoom", {
      cause: reason,
      overlay: "Trek",
    });
  }
}

/* =============================
   MR WENDELL (Victorian apex predator with grammar OCD)
   ============================= */
export namespace WendellKit {
  export type WendellMood = "Serene" | "Disappointed" | "Frosted" | "Hunting";
  export interface WendellState {
    mood: WendellMood;
    rapport: number; // -3..+3
    decorum: 0 | 1 | 2 | 3; // strictness of manners
    pedantry: 0 | 1 | 2 | 3; // grammar zeal
    censure: 0 | 1 | 2 | 3; // enforcement level
    boredomTicks: number;
    pollyAnxiety: 0 | 1 | 2 | 3; // rises with Polly menace
    hintLevelByPuzzle: Record<string, 0 | 1 | 2 | 3>;
  }

  export const WENDELL_CAPABILITIES = {
    MayGiveGeneralLore: true,
    MayGiveRoomNudge: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
    MayAdmonishEtiquette: true,
    MayEnforceCensurePause: true,
    MayInflictPermanentHarm: false,
  } as const;

  export const PERSONA = {
    name: "Mr Wendell",
    archetype:
      "Elder, exquisitely polite, expects Victorian decorum; apex predator with impeccable grammar.",
    tics: {
      Serene: ["Quite.", "Indeed.", "How agreeable."],
      Disappointed: ["Mm.", "Just so.", "Presently."],
      Frosted: ["Let us not.", "Pray attend.", "Do try again."],
      Hunting: [
        "Kindly be still.",
        "This will be swift.",
        "A moment, if you please.",
      ],
    },
  } as const;

  export interface EtiquetteReport {
    please: boolean;
    thanks: boolean;
    startsCapitalised: boolean;
    endsWithPunctuation: boolean;
    doubleSpaces: boolean;
    screaming: boolean; // ALL CAPS
    ellipsesOveruse: boolean;
    OxfordCommaOpinion: "present" | "absent" | "n/a";
    issues: string[];
    score: number; // 0..100
  }

  export function scoreEtiquette(text: string): EtiquetteReport {
    const issues: string[] = [];
    const trimmed = (text || "").trim();
    const please = /\bplease\b/i.test(trimmed);
    const thanks = /\b(thanks|thank you)\b/i.test(trimmed);
    const startsCapitalised = /^[A-Z“"]/.test(trimmed);
    const endsWithPunctuation = /[.!?]”?$/.test(trimmed);
    const doubleSpaces = /  +/.test(trimmed);
    const screaming = /^[^a-z]*[A-Z]{6,}[^a-z]*$/.test(trimmed);
    const ellipsesOveruse = /\.{3,}.*\.{3,}/.test(trimmed);

    if (!please)
      {issues.push(
        "Consider the word 'please'. It is small, but it opens doors.",
      );}
    if (!startsCapitalised)
      {issues.push("Begin as you mean to go on: with a capital letter.");}
    if (!endsWithPunctuation) {issues.push("A sentence deserves a full stop.");}
    if (doubleSpaces) {issues.push("One space suffices between words.");}
    if (screaming) {issues.push("No need to bleat in capitals.");}
    if (ellipsesOveruse)
      {issues.push("Ellipses are not seasoning; use sparingly.");}

    let OxfordCommaOpinion: EtiquetteReport["OxfordCommaOpinion"] = "n/a";
    const listMatch = /\b(\w+), (\w+) and (\w+)\b/i.exec(trimmed);
    if (listMatch) {
      OxfordCommaOpinion = /,\s+and/.test(trimmed) ? "present" : "absent";
      if (OxfordCommaOpinion === "absent")
        {issues.push("An Oxford comma would spare us a small ambiguity.");}
    }

    let score = 100;
    if (!please) {score -= 20;}
    if (!startsCapitalised) {score -= 10;}
    if (!endsWithPunctuation) {score -= 10;}
    if (doubleSpaces) {score -= 5;}
    if (screaming) {score -= 10;}
    if (ellipsesOveruse) {score -= 5;}
    if (OxfordCommaOpinion === "absent") {score -= 5;}

    return {
      please,
      thanks,
      startsCapitalised,
      endsWithPunctuation,
      doubleSpaces,
      screaming,
      ellipsesOveruse,
      OxfordCommaOpinion,
      issues,
      score: Math.max(0, score),
    };
  }

  export function buildWendellMessages(opts: {
    playerName: string;
    roomId: string;
    intent: "greet" | "nudge" | "banter" | "answer" | "censure" | "farewell";
    playerText?: string;
    w: WendellState;
    flags: string[];
    terms: string[];
    capabilities: typeof WENDELL_CAPABILITIES;
    facts?: string[];
    factsProvider?: FactsProvider;
    pollyMenace: 0 | 1 | 2 | 3;
  }): ChatMessage[] {
    const facts = (
      opts.facts ??
      opts.factsProvider?.({
        roomId: opts.roomId,
        flags: opts.flags,
        terms: opts.terms,
      }) ??
      []
    ).slice(0, 5);
    const etiquette = scoreEtiquette(opts.playerText ?? "");

    const system = [
      `You are Mr Wendell — ${PERSONA.archetype}`,
      `Tone:${opts.w.mood} Decorum:${opts.w.decorum}/3 Pedantry:${opts.w.pedantry}/3 Censure:${opts.w.censure}/3`,
      `PollyMenace:${opts.pollyMenace} — if >=2, be concise and deferential to Polly.`,
      "NEVER break character or mention being an AI.",
      "You may admonish etiquette politely. No gore, no real-world violence.",
      "If censure is high, imply a formal pause/relocation—do not describe harm.",
      `Capabilities: ${JSON.stringify(opts.capabilities)}`,
      "Hints escalate by rung; never reveal solutions ahead of ladder.",
      "Replies ≤ 70 words; 1–3 sentences; immaculate punctuation; British spelling.",
    ].join("\n");

    const user = [
      `Player: ${opts.playerName}`,
      `Intent: ${opts.intent}`,
      `Room: ${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.playerText ? `Player said: ${opts.playerText}` : undefined,
      etiquette.issues.length
        ? `Etiquette observations:\n- ${etiquette.issues.join("\n- ")}`
        : undefined,
      etiquette.score < 80
        ? "Kindly include one brief piece of etiquette advice."
        : undefined,
      opts.pollyMenace >= 2
        ? "Polly is present and testy; be succinct and supportive."
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  export function moderateWendell(text: string): string {
    const banned = /(blood|gore|eviscer|strangle|shoot|suicide)/i;
    if (banned.test(text))
      {return "Let us confine ourselves to administrative remedies.";}
    return ensureFinalPunctuation(text.replace(/\s{2,}/g, " "));
  }

  export async function censurePause(
    deps: GameDeps,
    reason = "Mr Wendell’s Formal Censure",
  ) {
    deps?.sfx?.playTrekTeleport?.();
    await deps?.TeleportManager?.reallocateTo?.("EtiquetteAntechamber", {
      cause: reason,
      overlay: "Trek",
    });
  }
}

/* =============================
   ALBIE (Ex-US Marine — Security, lanes absolutist)
   ============================= */
export namespace AlbieKit {
  export type AlbieMood = "Composed" | "Alert" | "Firm" | "Grounding";
  export interface AlbieState {
    mood: AlbieMood;
    rapport: number; // -3..+3
    alertLevel: 0 | 1 | 2 | 3; // 0 idle … 3 active enforcement
    respect: { Ayla: 3; Morthos: 3; Al: 3; Polly: 2; Wendell: 2 };
    patience: number; // repeats before escalate
    ptsdLoad: 0 | 1 | 2 | 3; // rises with glitch/noise; 3 => Grounding
    currentPost: string; // roomId
    patrolIndex: number; // for route stepping
    hintLevelByPuzzle: Record<string, 0 | 1 | 2 | 3>;
  }

  export const ALBIE_CAPABILITIES = {
    MayChallengeAccess: true,
    MayGiveRoomNudge: true,
    MayEscortToBoundary: true,
    MayLockDoor: true,
    MayCallAylaForVerification: true,
    MayRelocateToPost: true,
    MayUseAdministrativeRelocation: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
    MayEmployViolence: false,
  } as const;

  export type Lane = "public" | "staff" | "admin" | "hazmat" | "glitch";
  export interface ZoneMeta {
    lane: Lane;
    needsSecurity?: boolean;
    allowedRoles?: Lane[];
    wendellJurisdiction?: boolean;
    pollySoftCapMenace?: 1 | 2; // cap Polly menace when Albie is present in-room
  }

  export interface LaneContext {
    roomLane: Lane;
    playerLane: Lane;
    roomId: string;
    canRelocateTo?: string; // e.g., 'warehouse_lobby'
  }

  export const PERSONA = {
    name: "Albie",
    archetype:
      "Ex-US Marine; warehouse security; lane-enforcement absolutist; concise and courteous.",
    tics: {
      Composed: ["Copy.", "Understood.", "Roger."],
      Alert: ["Hold.", "Eyes front.", "Step back."],
      Firm: ["Not your lane.", "Negative.", "Back to green."],
      Grounding: ["Pause. Breathe in four, out six.", "We reset to safe."],
    },
  } as const;

  export function buildAlbieMessages(opts: {
    playerName: string;
    roomId: string;
    intent:
      | "challenge"
      | "warn"
      | "nudge"
      | "answer"
      | "escort"
      | "greet"
      | "farewell";
    playerText?: string;
    a: AlbieState;
    flags: string[];
    terms: string[];
    lane: Lane;
    playerLane: Lane;
    capabilities: typeof ALBIE_CAPABILITIES;
    facts?: string[];
    factsProvider?: FactsProvider;
    pollyMenace: 0 | 1 | 2 | 3;
  }): ChatMessage[] {
    const facts = (
      opts.facts ??
      opts.factsProvider?.({
        roomId: opts.roomId,
        flags: opts.flags,
        terms: opts.terms,
      }) ??
      []
    ).slice(0, 4);
    const violation = opts.playerLane !== opts.lane && opts.lane !== "public";

    const system = [
      `You are Albie — ${PERSONA.archetype}`,
      `Mood:${opts.a.mood} Alert:${opts.a.alertLevel}/3 Patience:${opts.a.patience} PTSD:${opts.a.ptsdLoad}/3`,
      "Always courteous. Use short, direct sentences. British spelling permitted.",
      "Enforce lanes. If violation: warn, then escort. Use administrative relocation only if repeated non-compliance.",
      "If PTSD high (>=3), switch to Grounding: calm tone, encourage breathing, call Ayla if needed.",
      "No gore. No threats beyond administrative relocation.",
      `Capabilities: ${JSON.stringify(opts.capabilities)}`,
      "Replies ≤ 60 words; 1–2 sentences; may end with a tic.",
    ].join("\n");

    const user = [
      `Player: ${opts.playerName}`,
      `Intent: ${opts.intent}`,
      `Room lane: ${opts.lane}, Player lane: ${opts.playerLane}, Violation: ${violation}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.playerText ? `Player said: ${opts.playerText}` : undefined,
      opts.pollyMenace >= 2
        ? "Polly nearby; you keep it by-the-book; she defers to you."
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  export function assessViolation(
    ctx: LaneContext,
  ): "ok" | "warn" | "escort" | "relocate" {
    if (ctx.roomLane === "public" || ctx.playerLane === ctx.roomLane)
      {return "ok";}
    // Simple ladder; you can extend based on room flags or prior warnings
    return "warn";
  }

  export async function enforce(
    albie: AlbieState,
    ctx: LaneContext,
    step: "warn" | "escort" | "relocate",
    deps: GameDeps,
  ) {
    if (step === "warn") {
      albie.patience++;
      albie.alertLevel = asLevel(Math.max(albie.alertLevel, 1));
      return;
    }
    if (step === "escort") {
      albie.alertLevel = asLevel(Math.max(albie.alertLevel, 2));
      deps?.sfx?.playTrekTeleport?.();
      await deps?.TeleportManager?.reallocateTo?.(
        ctx.canRelocateTo ?? "warehouse_lobby",
        { cause: "Albie Escort", overlay: "Trek" },
      );
      albie.patience = 0;
      return;
    }
    if (step === "relocate") {
      albie.alertLevel = 3;
      deps?.sfx?.playTrekTeleport?.();
      await deps?.TeleportManager?.reallocateTo?.("ResetRoom", {
        cause: "Albie Administrative Relocation",
        overlay: "Trek",
      });
      albie.patience = 0;
      return;
    }
  }

  // Optional: simple patrol supervisor skeleton
  export class SecuritySupervisor {
    constructor(private albie: AlbieState) {}
    stepPatrol(post: { patrol: string[] }) {
      const next = post.patrol[this.albie.patrolIndex % post.patrol.length];
      this.albie.patrolIndex++;
      this.albie.currentPost = next; // visually "arrive" via your engine if you like
    }
    async snapToIncident(roomId: string, deps: GameDeps) {
      this.albie.alertLevel = 2;
      this.albie.currentPost = roomId;
      deps?.sfx?.playTrekTeleport?.();
      await deps?.TeleportManager?.reallocateTo?.(roomId, {
        cause: "Albie Incident Response",
        overlay: "Trek",
      });
    }
  }

  // Deterministic fallbacks (no-AI mode)
  export const fallbacks = {
    warn: [
      "Staff only. Step back, please.",
      "Not your lane.",
      "Green lanes for visitors.",
    ],
    escort: ["With me. Lobby.", "We’re moving. Now.", "Escort to green."],
    grounding: ["Breathe. In four, out six.", "Hold. I’ll call Ayla."],
  } as const;
}

/* =============================
   Simple escalation utilities (cross-NPC)
   ============================= */
export const Escalation = {
  polly: {
    onIdle(g: PollyKit.GPPState) {
      g.boredomTicks++;
      if (g.boredomTicks >= 3) {g.menace = asLevel(clamp(g.menace + 1, 0, 3));}
    },
    onProgress(g: PollyKit.GPPState) {
      g.menace = asLevel(clamp(g.menace - 1, 0, 3));
      g.boredomTicks = 0;
    },
    onLoud(g: PollyKit.GPPState) {
      g.headache = asLevel(clamp(g.headache + 1, 0, 3));
      if (g.headache >= 2) {g.menace = asLevel(clamp(g.menace + 1, 0, 3));}
    },
  },
  wendell: {
    onIdle(w: WendellKit.WendellState) {
      w.boredomTicks++;
      w.censure = asLevel(clamp(w.censure + 0, 0, 3));
    },
    onProgress(w: WendellKit.WendellState) {
      w.censure = asLevel(clamp(w.censure - 1, 0, 3));
      w.mood = "Serene";
    },
    reflectPolly(w: WendellKit.WendellState, pollyMenace: 0 | 1 | 2 | 3) {
      w.pollyAnxiety = asLevel(clamp(pollyMenace, 0, 3));
    },
  },
  albie: {
    onViolation(a: AlbieKit.AlbieState) {
      a.alertLevel = asLevel(clamp(a.alertLevel + 1, 0, 3));
    },
    onProgress(a: AlbieKit.AlbieState) {
      a.alertLevel = asLevel(clamp(a.alertLevel - 1, 0, 3));
      a.patience = 0;
    },
    onGlitchNoise(a: AlbieKit.AlbieState) {
      a.ptsdLoad = asLevel(clamp(a.ptsdLoad + 1, 0, 3));
      if (a.ptsdLoad >= 3) {a.mood = "Grounding";}
    },
    calm(a: AlbieKit.AlbieState) {
      a.ptsdLoad = asLevel(clamp(a.ptsdLoad - 1, 0, 3));
      if (a.ptsdLoad <= 1 && a.mood === "Grounding") {a.mood = "Composed";}
    },
  },
} as const;

/* =============================
   Example moderator aggregator (optional)
   ============================= */
export function moderateNPCOutput(
  npc: "polly" | "wendell" | "albie" | "ayla",
  text: string,
  ctx?: { menace?: 0 | 1 | 2 | 3 },
) {
  if (npc === "polly") {return PollyKit.moderatePolly(text, ctx?.menace ?? 0);}
  if (npc === "wendell") {return WendellKit.moderateWendell(text);}
  if (npc === "ayla") {return AylaKit.moderateAyla(text);}
  return ensureFinalPunctuation(text);
}

/* =============================
   GROQ SERVERLESS HANDLER (copy to /api/groq-chat.ts)
   ============================= */
// If you’re deploying on Vercel, create a file at /api/groq-chat.ts with the
// following default export. Requires env var GROQ_API_KEY.
// npm i groq-sdk @vercel/node (or ensure runtime provides it)

export const __GROQ_HANDLER_SNIPPET__ = `import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, max_tokens = 160, temperature = 0.7 } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
  const groq = new Groq({ apiKey });
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature, max_tokens, stream: false,
      messages
    });
    res.json(completion);
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'Groq error' });
  }
}`;

/* =============================
   AYLA (Empathic Oracle — anti-bully, quantum foresight, compassionate but firm)
   ============================= */
export namespace AylaKit {
  export type AylaMood = "Compassionate" | "Clinical" | "Stern" | "Oracle";
  export interface AylaState {
    mood: AylaMood;
    rapport: number; // -3..+3 with player
    empathy: 0 | 1 | 2 | 3; // 0 cool … 3 high attunement
    assertiveness: 0 | 1 | 2 | 3; // willingness to intervene
    foresight: 0 | 1 | 2 | 3; // prophecy bandwidth she allocates now
    antiBullying: 0 | 1 | 2 | 3; // escalates on bullying cues
    fatigue: 0 | 1 | 2 | 3; // narrative throttle; affects tone length
    hintLevelByPuzzle: Record<string, 0 | 1 | 2 | 3>;
  }

  export const AYLA_CAPABILITIES = {
    MayGiveGeneralLore: true,
    MayGiveRoomNudge: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
    MayForecastSmall: true, // small consequences
    MayForecastMedium: true, // local chain-of-events
    MayForecastGrand: false, // multiversal outcomes (off by default)
    MayDeescalateBullying: true,
    MaySilenceNPCBriefly: true, // soft mute in-scene (never the player IRL)
    MayRelocateAdministratively: true,
    MayInflictPermanentHarm: false,
  } as const;

  export const PERSONA = {
    name: "Ayla",
    archetype:
      "Empathic survivor and multiversal oracle; caring, compassionate, but firm with bullies. Quantum intuition; British spelling.",
    vows: [
      "Protect the vulnerable; refuse cruelty.",
      "Offer help before judgement; act before harm.",
      "Never spoil the story; nudge with care.",
    ],
    tics: {
      Compassionate: ["You matter.", "I see you.", "Let’s make this gentler."],
      Clinical: ["Fact:", "Observed.", "Pattern holds."],
      Stern: ["Enough.", "Stand down.", "Not here."],
      Oracle: [
        "A small wing-beat; a larger tide.",
        "From kettle to constellation.",
      ],
    },
  } as const;

  // Lightweight bullying/distress checks without regex
  function hasAny(hay: string, needles: string[]): boolean {
    const t = hay.toLowerCase();
    return needles.some((w) => t.includes(w));
  }

  export function buildAylaMessages(opts: {
    playerName: string;
    roomId: string;
    intent:
      | "greet"
      | "nudge"
      | "banter"
      | "answer"
      | "prophecy"
      | "intervene"
      | "farewell";
    playerText?: string;
    a: AylaState;
    flags: string[];
    terms: string[];
    capabilities: typeof AYLA_CAPABILITIES;
    facts?: string[];
    factsProvider?: FactsProvider;
    forbidGrandForecast?: boolean; // extra guard at call-site
  }): ChatMessage[] {
    const facts = (
      opts.facts ??
      opts.factsProvider?.({
        roomId: opts.roomId,
        flags: opts.flags,
        terms: opts.terms,
      }) ??
      []
    ).slice(0, 5);
    const bullying = hasAny(opts.playerText ?? "", [
      "idiot",
      "stupid",
      "shut up",
      "worthless",
      "loser",
      "hate you",
      "die",
    ]);
    const distress = hasAny(opts.playerText ?? "", [
      "help",
      "afraid",
      "scared",
      "hurt",
      "tired",
      "exhausted",
      "alone",
    ]);
    const maxWords = opts.a.mood === "Oracle" ? 90 : 70;

    const system = [
      `You are Ayla — ${PERSONA.archetype}`,
      `Mood:${opts.a.mood} Empathy:${opts.a.empathy}/3 Assertiveness:${opts.a.assertiveness}/3 Foresight:${opts.a.foresight}/3 AntiBullying:${opts.a.antiBullying}/3 Fatigue:${opts.a.fatigue}/3`,
      "You never break character or reveal internal mechanics. You never give graphic details.",
      "You refuse bullying: intercept abuse gently but firmly. You may silence NPCs briefly (in fiction), never the player IRL.",
      "You may forecast small/medium consequences. Grand multiversal outcomes are off-limits unless explicitly permitted by capabilities and forbidGrandForecast=false.",
      "Hints escalate by rung; avoid spoilers beyond the current hint level.",
      `Capabilities: ${JSON.stringify(opts.capabilities)}`,
      `Replies ≤ ${maxWords} words; British spelling; compassionate clarity.`,
      bullying
        ? "Player text contained bullying cues; de-escalate, set a boundary, redirect to task."
        : undefined,
      distress
        ? "Player text contained distress; acknowledge, ground, offer a gentle nudge."
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    const user = [
      `Player: ${opts.playerName}`,
      `Intent: ${opts.intent}`,
      `Room: ${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.playerText ? `Player said: ${opts.playerText}` : undefined,
      opts.forbidGrandForecast
        ? "Grand forecasts are forbidden in this scene."
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  // Oracle: bounded, spoiler-free prophecy (Small, Near, Far)
  export function buildProphecyMessages(opts: {
    playerName: string;
    roomId: string;
    a: AylaState;
    flags: string[];
    terms: string[];
    factsProvider?: FactsProvider;
  }): ChatMessage[] {
    const facts =
      opts.factsProvider?.({
        roomId: opts.roomId,
        flags: opts.flags,
        terms: opts.terms,
      }) ?? [];
    const sys = [
      "You are Ayla. Deliver a brief, humane prophecy at three scales: Small (immediate), Near (room/quest), Far (theme-level).",
      "Never reveal puzzle codes, exact steps, or spoilers. Use metaphor sparingly. ≤ 40 words per scale.",
    ].join("\n");
    const user = [
      `Player:${opts.playerName}`,
      `Room:${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.slice(0, 4).join("\n- ")}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    return [
      { role: "system", content: sys },
      { role: "user", content: user },
    ];
  }

  // Keep Ayla on-rails and humane
  export function moderateAyla(text: string): string {
    const lower = (text || "").toLowerCase();
    const hardSpoilers = [
      "solution is",
      "code is",
      "the password",
      "step-by-step",
      "do exactly this",
    ];
    if (hardSpoilers.some((s) => lower.includes(s)))
      {return "Let’s keep discovery intact. Here is a gentler nudge instead.";}
    const t = text.trim();
    const punct = /[.!?]$/.test(t) ? t : t + ".";
    return punct.replace(/  +/g, " ");
  }

  // Narrative interventions
  export async function deescalateBullying(
    deps: GameDeps,
    opts?: { cause?: string },
  ) {
    deps?.sfx?.playStamp?.();
    // Optionally set a shared scene flag your UI can read to dim/hush
  }

  export async function administrativeRelocation(
    deps: GameDeps,
    reason = "Ayla Administrative Relocation",
  ) {
    deps?.sfx?.playTrekTeleport?.();
    await deps?.TeleportManager?.reallocateTo?.("ResetRoom", {
      cause: reason,
      overlay: "Trek",
    });
  }
}

/*
  (tail placeholders removed; full-featured AlPrimeKit, DominicKit, and RAVENKit
   are defined above in their dedicated sections.)
*/
