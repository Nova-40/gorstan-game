/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  NPC Dialogue Trigger System
  Handles character storytelling and relationship dynamics through natural dialogue
*/

import { npcAI } from './npcAI';
import type { LocalGameState } from '../state/gameState';
import type { NPCBehaviorContext } from './npcAI';

export interface DialogueTrigger {
  keywords: string[];
  npcId: string;
  aboutCharacter: string;
  triggerType: 'self_story' | 'other_story' | 'relationship_warning' | 'special_reaction';
}

export class NPCDialogueTriggerSystem {
  private static instance: NPCDialogueTriggerSystem;

  public static getInstance(): NPCDialogueTriggerSystem {
    if (!NPCDialogueTriggerSystem.instance) {
      NPCDialogueTriggerSystem.instance = new NPCDialogueTriggerSystem();
    }
    return NPCDialogueTriggerSystem.instance;
  }

  /**
   * Check if player input triggers character storytelling
   */
  public async checkDialogueTriggers(
    playerInput: string,
    npcId: string,
    context: NPCBehaviorContext
  ): Promise<string | null> {
    const input = playerInput.toLowerCase();
    const triggers = this.getTriggersForNPC(npcId);

    for (const trigger of triggers) {
      if (this.matchesTrigger(input, trigger)) {
        const response = await this.handleTrigger(trigger, context, playerInput);
        if (response) {
          return response;
        }
      }
    }

    return null;
  }

  /**
   * Get dialogue triggers for specific NPC
   */
  private getTriggersForNPC(npcId: string): DialogueTrigger[] {
    const commonSelfTriggers = [
      'tell me about yourself',
      'who are you',
      'what are you',
      'your story',
      'about you',
      'yourself'
    ];

    const triggers: DialogueTrigger[] = [];

    // Self-story triggers for all NPCs
    triggers.push({
      keywords: commonSelfTriggers,
      npcId,
      aboutCharacter: npcId,
      triggerType: 'self_story'
    });

    // Character-specific triggers
    switch (npcId) {
      case 'mrwendell':
        triggers.push(
          {
            keywords: ['polly', 'tell me about polly', 'who is polly'],
            npcId,
            aboutCharacter: 'polly',
            triggerType: 'relationship_warning'
          },
          {
            keywords: ['dominic', 'tell me about dominic', 'who is dominic', 'the fish'],
            npcId,
            aboutCharacter: 'dominic',
            triggerType: 'other_story'
          },
          {
            keywords: ['killed dominic', 'dominic dead', 'dominic is dead'],
            npcId,
            aboutCharacter: 'dominic',
            triggerType: 'special_reaction'
          }
        );
        break;

      case 'polly':
        triggers.push(
          {
            keywords: ['dominic', 'tell me about dominic', 'who is dominic', 'the fish'],
            npcId,
            aboutCharacter: 'dominic',
            triggerType: 'relationship_warning'
          },
          {
            keywords: ['morthos', 'tell me about morthos', 'who is morthos'],
            npcId,
            aboutCharacter: 'morthos',
            triggerType: 'other_story'
          },
          {
            keywords: ['evil', 'are you evil', 'dangerous'],
            npcId,
            aboutCharacter: 'polly',
            triggerType: 'special_reaction'
          }
        );
        break;

      case 'dominic':
        triggers.push(
          {
            keywords: ['polly', 'tell me about polly', 'who is polly'],
            npcId,
            aboutCharacter: 'polly',
            triggerType: 'relationship_warning'
          },
          {
            keywords: ['reset', 'resets', 'remember', 'memory', 'previous'],
            npcId,
            aboutCharacter: 'dominic',
            triggerType: 'self_story'
          }
        );
        break;

      case 'morthos':
        triggers.push(
          {
            keywords: ['polly', 'tell me about polly', 'who is polly'],
            npcId,
            aboutCharacter: 'polly',
            triggerType: 'relationship_warning'
          },
          {
            keywords: ['demon', 'are you a demon', 'hell', 'evil'],
            npcId,
            aboutCharacter: 'morthos',
            triggerType: 'self_story'
          }
        );
        break;

      case 'librarian':
        triggers.push(
          {
            keywords: ['civilization', 'culture', 'history', 'knowledge', 'archive'],
            npcId,
            aboutCharacter: 'librarian',
            triggerType: 'self_story'
          },
          {
            keywords: ['lattice builders', 'creators', 'human-like beings', 'who built'],
            npcId,
            aboutCharacter: 'lattice_builders',
            triggerType: 'other_story'
          },
          {
            keywords: ['earth', 'quantum entanglement', 'mirror world', 'gorstan mirror'],
            npcId,
            aboutCharacter: 'earth_gorstan',
            triggerType: 'other_story'
          }
        );
        break;

      case 'al':
        triggers.push(
          {
            keywords: ['albie', 'tell me about albie', 'who is albie'],
            npcId,
            aboutCharacter: 'albie',
            triggerType: 'other_story'
          },
          {
            keywords: ['guardian', 'creation', 'multiverse', 'mk1'],
            npcId,
            aboutCharacter: 'al',
            triggerType: 'self_story'
          }
        );
        break;
    }

    // Universal character inquiry triggers
    const allCharacters = ['librarian', 'mrwendell', 'polly', 'dominic', 'morthos', 'al', 'albie', 'ayla', 'barista'];
    for (const character of allCharacters) {
      if (character !== npcId) {
        triggers.push({
          keywords: [character, `tell me about ${character}`, `who is ${character}`],
          npcId,
          aboutCharacter: character,
          triggerType: 'other_story'
        });
      }
    }

    return triggers;
  }

  /**
   * Check if input matches trigger keywords
   */
  private matchesTrigger(input: string, trigger: DialogueTrigger): boolean {
    return trigger.keywords.some(keyword => 
      input.includes(keyword.toLowerCase())
    );
  }

  /**
   * Handle specific trigger and generate response
   */
  private async handleTrigger(
    trigger: DialogueTrigger,
    context: NPCBehaviorContext,
    originalInput: string
  ): Promise<string | null> {
    const { npcId, aboutCharacter, triggerType } = trigger;

    // Special handling for Mr. Wendell's Dominic reaction
    if (npcId === 'mrwendell' && triggerType === 'special_reaction' && aboutCharacter === 'dominic') {
      const dominicKilled = npcAI.checkDominicKilled(context.gameState);
      if (dominicKilled) {
        return this.getMrWendellDominicReaction();
      }
    }

    // Special handling for Polly's evil reveals
    if (npcId === 'polly' && triggerType === 'special_reaction') {
      return this.getPollyEvilReaction();
    }

    // Generate AI-powered character story
    const action = await npcAI.generateCharacterStory(
      npcId,
      aboutCharacter,
      context,
      originalInput
    );

    return action?.content || null;
  }

  /**
   * Get Mr. Wendell's special reaction when player killed Dominic
   */
  private getMrWendellDominicReaction(): string {
    const reactions = [
      "*Mr. Wendell chuckles darkly* \"Ah, I see you've had dealings with our fishy friend. Poor Dominic... well, I suppose I'll leave you to Polly now. If I'm lucky, she may even let me watch.\" *his eyes gleam with ancient amusement*",
      "*A slow, knowing smile spreads across Mr. Wendell's weathered face* \"Killed Dominic, did you? How... interesting. Don't worry about him - he'll be back next reset. But Polly... oh, she remembers everything. I'll step aside and let her handle you. This should be entertaining.\"",
      "*Mr. Wendell laughs, a sound like autumn leaves rustling* \"The fish remembers, you know. Through every reset. And now... well, I think I'll just mention to Polly what you've done. She has such creative ways of dealing with troublemakers. I do hope she lets me observe.\""
    ];

    return reactions[Math.floor(Math.random() * reactions.length)];
  }

  /**
   * Get Polly's subtle evil reaction
   */
  private getPollyEvilReaction(): string {
    const reactions = [
      "*Polly's smile becomes just a little too wide* \"Evil? Oh my, what a funny question! I'm just here to help newcomers like you. Though I do have to say, some people find my... enthusiasm... a bit overwhelming. Even Morthos seems nervous around me sometimes! Isn't that silly?\"",
      "*For just a moment, something dark flickers behind Polly's cheerful eyes* \"Dangerous? Me? Oh, you sweet thing! I'm just a helpful guide! Though I must admit, I do get rather... invested... in making sure troublemakers learn their lessons properly. It's all about helping, really.\"",
      "*Polly tilts her head, her smile never wavering but her voice dropping slightly* \"You know, even the demon king gives me a wide berth these days. Isn't that amusing? I think it's because I'm just so dedicated to my work. Some people don't appreciate true... commitment to helping others.\""
    ];

    return reactions[Math.floor(Math.random() * reactions.length)];
  }

  /**
   * Add player message to trigger character storytelling
   */
  public addCharacterInquiry(
    playerMessage: string,
    npcId: string,
    aboutCharacter: string
  ): void {
    // This could be used to track which stories have been told
    console.log(`[Dialogue Triggers] ${npcId} telling story about ${aboutCharacter} due to: ${playerMessage}`);
  }
}

// Export singleton instance
export const npcDialogueTriggers = NPCDialogueTriggerSystem.getInstance();
