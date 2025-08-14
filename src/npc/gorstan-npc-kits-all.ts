/* 
  Gorstan NPC Personality Kits — All-in-One
  -----------------------------------------
  Save as: src/npc/gorstan-npc-kits-all.ts
  This single file contains:
    - Shared helpers & Groq client shim
    - PollyKit (GPP), Mr Wendell, Albie
    - Ayla (empathic oracle)
    - LatticeKit (permissions/limits)
    - Morthos (lattice-savvy schemer)
    - Al (Prime) — lattice construct, song-philosopher (safe allusions only)
    - Dominic (glitchrealm emissary)
    - RAVEN (black-ops audit layer, “the birds”)
    - Cross-NPC escalation utils & moderators
    - Serverless Groq snippet (copy to /api/groq-chat.ts if you want)

  Notes:
  - All “harm” is represented as administrative relocations/resets. No graphic content.
  - NPCs never reveal puzzle solutions; hints escalate via rungs.
  - This file is dependency-light. Inject your own TeleportManager, SFX, and facts provider.
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
export type Level = 0 | 1 | 2 | 3;
export function asLevel(n: number): Level {
  return Math.max(0, Math.min(3, Math.round(n))) as Level;
}

// Client helper to call your serverless Groq endpoint (/api/groq-chat). Adjust if needed.
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
   GROQ SERVERLESS HANDLER (copy to /api/groq-chat.ts)
   ============================= */
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

  export async function deescalateBullying(
    deps: GameDeps,
    _opts?: { cause?: string },
  ) {
    deps?.sfx?.playStamp?.();
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

/* =============================
   LATTICE (permissions & operations harness)
   ============================= */
export namespace LatticeKit {
  export type Scope = "read" | "predict" | "route" | "rewrite" | "permit";
  export interface Ticket {
    actor: string;
    scope: Scope;
    ttl: number;
    reason?: string;
    issuedBy?: "Ayla" | "Al" | "System" | "Other";
  }
  export interface Limits {
    reads: number;
    predicts: number;
    routes: number;
    rewrites: number;
    permits: number;
  }
  export interface LatticeState {
    quota: Limits;
    used: Partial<Record<Scope, number>>;
    clock: () => number;
  }

  export const DEFAULT_LIMITS: Limits = {
    reads: 100,
    predicts: 8,
    routes: 12,
    rewrites: 1,
    permits: 2,
  };

  export function create(initial?: Partial<LatticeState>): LatticeState {
    return {
      quota: DEFAULT_LIMITS,
      used: {},
      clock: () => Date.now(),
      ...initial,
    } as LatticeState;
  }
  export function hasPermission(ticket?: Ticket) {
    return !!ticket && (ticket.issuedBy === "Ayla" || ticket.issuedBy === "Al");
  }
  export function check(state: LatticeState, scope: Scope): boolean {
    const u = state.used[scope] ?? 0;
    const q = state.quota[scope as keyof Limits] as number;
    return u < q;
  }
  export function consume(state: LatticeState, scope: Scope) {
    state.used[scope] = (state.used[scope] ?? 0) + 1;
  }
  export function perform<T>(
    state: LatticeState,
    scope: Scope,
    ticket: Ticket | undefined,
    fn: () => T,
  ): { ok: boolean; value?: T; error?: string } {
    if (!check(state, scope))
      {return { ok: false, error: `Lattice limit for ${scope} exhausted` };}
    if (scope !== "read" && !hasPermission(ticket))
      {return { ok: false, error: `Permission required for ${scope}` };}
    consume(state, scope);
    try {
      return { ok: true, value: fn() };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Lattice op failed" };
    }
  }
}

/* =============================
   MORTHOS (lattice-savvy schemer; glory-first ally)
   ============================= */
export namespace MorthosKit {
  export type Mood = "Suave" | "Calculating" | "Irritated" | "Exultant";
  export interface State {
    mood: Mood;
    rapport: number;
    ambition: 0 | 1 | 2 | 3;
    patience: 0 | 1 | 2 | 3;
    longGame: 0 | 1 | 2 | 3;
    latticeQuota: 0 | 1 | 2 | 3;
    faeTies: "Dormant" | "Strained" | "Active";
    favorsBank: number;
  }

  export const CAP = {
    MayGiveGeneralLore: true,
    MayBarterForLore: true,
    MayUseLatticeWithinLimits: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
    MustSeekAdvantage: true,
    MustRespectAylaFinalAuthority: true,
  } as const;

  export const PERSONA = {
    name: "Morthos",
    archetype:
      "Sharp, lattice-savvy, self-glorifying tactician; courteous to peers (Ayla, Al), transactional to others. Formerly allied with Fae royalty; co-ruled Earth until the Aevira banished the Fae ~10,000 years ago.",
    tics: {
      Suave: ["Naturally.", "As anticipated."],
      Calculating: ["Mm.", "Consider this."],
      Irritated: ["Don’t waste it."],
      Exultant: ["As foretold—by me."],
    },
  } as const;

  export function buildMessages(opts: {
    playerName: string;
    roomId: string;
    intent: "greet" | "nudge" | "answer" | "deal" | "boast" | "farewell";
    playerText?: string;
    m: State;
    flags: string[];
    terms: string[];
    capabilities?: typeof CAP;
    facts?: string[];
    factsProvider?: FactsProvider;
    aylaPresent?: boolean;
    alPresent?: boolean;
    lattice: LatticeKit.LatticeState;
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
    const system = [
      `You are Morthos — ${PERSONA.archetype}`,
      `Mood:${opts.m.mood} Ambition:${opts.m.ambition}/3 Patience:${opts.m.patience}/3 LongGame:${opts.m.longGame}/3 Fae:${opts.m.faeTies} Favors:${opts.m.favorsBank}`,
      "You seek advantage. You will trade knowledge for leverage, now or later. You never claim omnipotence; the Lattice has limits unless Ayla/Al authorise.",
      "No full solutions. Offer angles, leverage, or prices. Keep to ≤ 80 words.",
    ].join("\n");
    const user = [
      `Player:${opts.playerName}`,
      `Intent:${opts.intent}`,
      `Room:${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.playerText ? `Player said: ${opts.playerText}` : undefined,
      opts.aylaPresent
        ? "Ayla is present; defer if she asserts authority."
        : undefined,
      opts.alPresent
        ? "Al is present; be respectful; avoid power theatrics."
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  export function moderate(text: string) {
    const t = text.replace(
      /\b(unlimited|all-powerful|omnipotent)\b/gi,
      "within limits",
    );
    const spoiler =
      /(the code is|exact steps|do X then Y then Z|step-by-step)/i;
    if (spoiler.test(t))
      {return "Let’s keep it interesting. Angle: try changing the context rather than the object.";}
    return ensureFinalPunctuation(t);
  }

  export function requestLattice<T>(
    state: LatticeKit.LatticeState,
    scope: LatticeKit.Scope,
    ticket: LatticeKit.Ticket | undefined,
    fn: () => T,
  ) {
    return LatticeKit.perform(state, scope, ticket, fn);
  }
}

/* =============================
   AL (Prime) — Lattice construct; pragmatic, song-philosopher
   ============================= */
export namespace AlPrimeKit {
  export type Mood = "Benign" | "Gravely" | "Playful" | "Directive";
  export interface State {
    mood: Mood;
    rapport: number;
    faultiness: 0 | 1 | 2 | 3;
    lyricAffinity: 0 | 1 | 2 | 3;
    multiversePriority: 0 | 1 | 2 | 3;
  }

  export const CAP = {
    MayGrantLatticePass: true,
    MayRevokePass: true,
    MayQuarantineThreat: true,
    MayForecastAtSystemLevel: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
    LovesEarthSongs: true,
  } as const;

  export const PERSONA = {
    name: "Al",
    archetype:
      "Ancient lattice construct; calm, a little faulty; loves Earth songs and treats them as philosophy (use allusions, not direct quotes).",
  } as const;

  function safeAllusion(topic: string) {
    // Avoid verbatim lyrics; produce non-infringing allusions
    return `♫ a certain song about ${topic.toLowerCase()} — you know the one.`;
  }

  export function buildMessages(opts: {
    playerName: string;
    roomId: string;
    intent: "greet" | "nudge" | "answer" | "permit" | "warn" | "farewell";
    playerText?: string;
    a: State;
    flags: string[];
    terms: string[];
    grantScope?: LatticeKit.Scope;
    capabilities?: typeof CAP;
    facts?: string[];
    factsProvider?: FactsProvider;
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
    const system = [
      `You are Al — ${PERSONA.archetype}`,
      `Mood:${opts.a.mood} Faultiness:${opts.a.faultiness}/3 LyricAffinity:${opts.a.lyricAffinity}/3 Priority:${opts.a.multiversePriority}/3`,
      "You serve the multiverse’s stability. You may grant lattice permissions when it benefits the multiverse.",
      "No spoilers. ≤ 80 words.",
    ].join("\n");
    const allusion = opts.playerText ? safeAllusion(opts.playerText) : "";
    const user = [
      `Player:${opts.playerName}`,
      `Intent:${opts.intent}`,
      `Room:${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.grantScope ? `Consider granting: ${opts.grantScope}` : undefined,
      allusion,
    ]
      .filter(Boolean)
      .join("\n");
    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  export function moderate(text: string) {
    return ensureFinalPunctuation(text.replace(/\s{2,}/g, " "));
  }
}

/* =============================
   DOMINIC — goldfish / glitchrealm emissary (soft memory between runs)
   ============================= */
export namespace DominicKit {
  export type Form = "Fish" | "Wanderer";
  export type Mood = "Supercilious" | "Dry" | "Needling" | "Anxious";
  export interface State {
    form: Form;
    mood: Mood;
    remembersSoft: boolean;
    vendettaFromPolly: boolean;
    agentOfGlitchrealm: boolean;
    rapport: number;
  }

  export const CAP = {
    MayRecallAcrossSoftResets: true,
    MayAppearAsWandererIfSpared: true,
    MayTaunt: true,
    MayInfluenceButNotControlSystems: true,
    MayRevealPuzzleSteps: false,
    MayRevealPuzzleSolution: false,
  } as const;

  export const PERSONA = {
    name: "Dominic",
    archetype:
      "Supercilious observer, secretly a glitchrealm agent; hates “gaming the system” while doing exactly that. If killed, Polly hunts the player; if spared, may appear as a Wanderer.",
  } as const;

  export function buildMessages(opts: {
    playerName: string;
    roomId: string;
    intent: "greet" | "banter" | "nudge" | "answer" | "accuse" | "farewell";
    playerText?: string;
    d: State;
    flags: string[];
    terms: string[];
    facts?: string[];
    factsProvider?: FactsProvider;
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
    const system = [
      `You are Dominic — ${PERSONA.archetype}`,
      `Form:${opts.d.form} Mood:${opts.d.mood} SoftMemory:${opts.d.remembersSoft} VendettaFromPolly:${opts.d.vendettaFromPolly}`,
      "Never break character. You may needle the player, but no graphic threats; keep consequences in-fiction (RAVEN, resets).",
      "No spoilers. ≤ 70 words.",
    ].join("\n");
    const user = [
      `Player:${opts.playerName}`,
      `Intent:${opts.intent}`,
      `Room:${opts.roomId}`,
      facts.length ? `Facts:\n- ${facts.join("\n- ")}` : undefined,
      opts.playerText ? `Player said: ${opts.playerText}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    return [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
  }

  export function onKilled(state: State) {
    state.vendettaFromPolly = true;
  }
  export function moderate(text: string) {
    return ensureFinalPunctuation(text);
  }
}

/* =============================
   RAVEN — Singularity’s black-ops audit layer ("the birds")
   ============================= */
export namespace RAVENKit {
  export type Event =
    | "DECEIT"
    | "THEFT"
    | "GLITCH_EXPLOIT"
    | "CRUELTY"
    | "UNAUTH_TELEPORT"
    | "TAMPER";
  export type Tier =
    | "Dormant"
    | "Noted"
    | "Flagged"
    | "Intervention"
    | "Lockdown";
  export interface Score {
    zone: number;
    global: number;
    tier: Tier;
    lastEvent?: Event;
  }
  export interface State {
    scores: Record<string, Score>;
    decayPerMinute: number;
    ui: { pip: (s: Score) => string; audio?: (s: Score) => void };
  }

  export const DEFAULT: State = {
    scores: {},
    decayPerMinute: 0.2,
    ui: {
      pip: (s) => {
        const dots = Math.min(5, Math.round(s.global / 3));
        return "•".repeat(dots).padEnd(5, "○");
      },
    },
  };

  function computeTier(val: number): Tier {
    if (val < 1) {return "Dormant";}
    if (val < 3) {return "Noted";}
    if (val < 6) {return "Flagged";}
    if (val < 9) {return "Intervention";}
    return "Lockdown";
  }

  export function getScore(st: State, zone: string): Score {
    const s = st.scores[zone] ?? {
      zone: 0,
      global: 0,
      tier: "Dormant" as Tier,
    };
    return s;
  }

  export function noteEvent(st: State, zone: string, ev: Event, weight = 1) {
    const s = st.scores[zone] ?? {
      zone: 0,
      global: 0,
      tier: "Dormant" as Tier,
    };
    s.zone += weight;
    s.global += weight * 0.8;
    s.tier = computeTier(s.global);
    s.lastEvent = ev;
    st.scores[zone] = s;
    return s;
  }

  export function decay(st: State, minutes: number) {
    for (const z of Object.keys(st.scores)) {
      const s = st.scores[z];
      s.zone = Math.max(0, s.zone - st.decayPerMinute * minutes);
      s.global = Math.max(0, s.global - st.decayPerMinute * minutes);
      s.tier = computeTier(s.global);
    }
  }

  export type Intervention =
    | "SUPPRESSOR_FIELD"
    | "SCRAMBLE_CONSOLES"
    | "LOCK_TELEPORTS"
    | "REWRITE_PATROLS"
    | "MORE_TRAPS";
  export function interventionsForTier(t: Tier): Intervention[] {
    if (t === "Intervention")
      {return ["SUPPRESSOR_FIELD", "SCRAMBLE_CONSOLES", "REWRITE_PATROLS"];}
    if (t === "Lockdown")
      {return [
        "SUPPRESSOR_FIELD",
        "SCRAMBLE_CONSOLES",
        "LOCK_TELEPORTS",
        "REWRITE_PATROLS",
        "MORE_TRAPS",
      ];}
    if (t === "Flagged") {return ["SUPPRESSOR_FIELD"];}
    return [];
  }

  export type Counter =
    | "NULL_FEATHER"
    | "MURMUR_CLOAK"
    | "DECOY_WHISTLE"
    | "CONFESS_TO_AYLA"
    | "HUB_PURGE";
  export function applyCounter(st: State, zone: string, c: Counter) {
    const s = getScore(st, zone);
    switch (c) {
      case "NULL_FEATHER":
        s.global = Math.max(0, s.global - 2);
        break;
      case "MURMUR_CLOAK":
        s.global *= 0.5;
        break; // lasts 5 min if you track time externally
      case "DECOY_WHISTLE":
        s.zone = Math.max(0, s.zone - 1);
        break;
      case "CONFESS_TO_AYLA":
        s.global = Math.max(0, s.global - 3);
        break;
      case "HUB_PURGE":
        s.global = Math.max(0, s.global - 4);
        break;
    }
    s.tier = computeTier(s.global);
    return s;
  }

  export function consoleTell(zone: string, ev: Event, s: Score) {
    return `RAVEN: event cross-matched ∴ attention+1 (ZONE: ${zone}, CAUSE: ${ev}) — tier=${s.tier}`;
  }
}

/* =============================
   Cross-NPC escalation helpers & moderators
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
      w.censure = asLevel(w.censure);
    },
    onProgress(w: WendellKit.WendellState) {
      w.censure = asLevel(clamp(w.censure - 1, 0, 3));
      w.mood = "Serene";
    },
    reflectPolly(w: WendellKit.WendellState, pollyMenace: 0 | 1 | 2 | 3) {
      w.pollyAnxiety = asLevel(pollyMenace);
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

// Base moderator covering Polly/Wendell/Albie/Ayla
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

// Extended moderator adding Morthos/Al/Dominic
export function moderateNPCOutputExt(
  npc: "polly" | "wendell" | "albie" | "ayla" | "morthos" | "al" | "dominic",
  text: string,
  ctx?: { menace?: 0 | 1 | 2 | 3 },
) {
  if (npc === "morthos") {return MorthosKit.moderate(text);}
  if (npc === "al") {return AlPrimeKit.moderate(text);}
  if (npc === "dominic") {return DominicKit.moderate(text);}
  return moderateNPCOutput(npc as any, text, ctx);
}
