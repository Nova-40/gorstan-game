/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Miniquest } from '../types/GameTypes';

// import { RoomMiniquests } from '.src/types/types/MiniquestTypes';













export const roomMiniquests: { roomId: string; miniquests: Miniquest[] }[] = [
  
  {
    roomId: 'faeglade',
    miniquests: [
      {
        id: 'decipher_fae_glyphs',
        title: 'Decipher the Ancient Glyphs',
        description: 'The shifting Fae script on the standing stones holds secrets. Try "inspect stones" or bring an ancient scroll to unlock their meaning.',
        type: 'structured',
        rewardPoints: 25,
        flagOnCompletion: 'faeglade_glyphs_deciphered',
        triggerAction: 'inspect stones',
        triggerText: 'Try examining the standing stones more closely...',
        requiredItems: ['ancient_scroll'],
        hint: 'The ancient scroll might help you understand the changing symbols.',
        difficulty: 'medium'
      },
      {
        id: 'commune_with_oaks',
        title: 'Listen to the Ancient Oaks',
        description: 'The towering oaks whisper secrets in the wind. Use "listen" near the trees and wait patiently.',
        type: 'dynamic',
        rewardPoints: 15,
        flagOnCompletion: 'faeglade_oak_communion',
        triggerAction: 'listen',
        triggerText: 'Try listening carefully to the ancient trees...',
        hint: 'Ancient trees have much to say to those who listen with patience.',
        difficulty: 'easy',
        repeatable: true
      }
    ]
  },

  {
    roomId: 'faelake',
    miniquests: [
      {
        id: 'scry_other_realms',
        title: 'Glimpse Other Realms',
        description: 'The lake\'s surface shows glimpses of other worlds. Use "examine reflections" to peer into distant dimensions.',
        type: 'exploration',
        rewardPoints: 20,
        flagOnCompletion: 'faelake_scrying_complete',
        triggerAction: 'examine reflections',
        triggerText: 'Look deeper into the lake\'s mysterious reflections...',
        hint: 'The clearer your focus, the more you might see.',
        difficulty: 'medium'
      },
      {
        id: 'gather_silver_sand',
        title: 'Collect Harmonic Sand',
        description: 'The silver sand chimes underfoot. Gather some with "gather sand" to capture its musical essence.',
        type: 'dynamic',
        rewardPoints: 10,
        flagOnCompletion: 'faelake_sand_collected',
        triggerAction: 'gather sand',
        triggerText: 'Try gathering some of the musical silver sand...',
        difficulty: 'trivial',
        repeatable: true
      }
    ]
  },

  {
    roomId: 'faepalacedungeons',
    miniquests: [
      {
        id: 'decipher_reality_symbols',
        title: 'Decode the Reality Symbols',
        description: 'Strange symbols on the floor glow with cold blue light. Use "trace symbols" to understand their painful patterns.',
        type: 'puzzle',
        rewardPoints: 35,
        flagOnCompletion: 'dungeons_symbols_decoded',
        triggerAction: 'trace symbols',
        requiredItems: ['reality_anchor'],
        hint: 'A reality anchor might help stabilize the painful visions these symbols cause.',
        difficulty: 'hard'
      },
      {
        id: 'listen_to_chains',
        title: 'Hear the Starlight Chains',
        description: 'Chains of silver and starlight hum with contained power. Use "listen chains" to hear their song.',
        type: 'dynamic',
        rewardPoints: 15,
        flagOnCompletion: 'dungeons_chains_heard',
        triggerAction: 'listen chains',
        hint: 'The chains remember all they have bound.',
        difficulty: 'easy'
      }
    ]
  },

  
  {
    roomId: 'gorstanhub',
    miniquests: [
      {
        id: 'fountain_wish',
        title: 'Make a Meaningful Wish',
        description: 'The fountain\'s magical waters might grant a heartfelt wish. Use "toss coin" and make a sincere wish.',
        type: 'social',
        rewardPoints: 15,
        flagOnCompletion: 'hub_fountain_wish_made',
        triggerAction: 'toss coin',
        requiredItems: ['market_token'],
        hint: 'True wishes require both coin and heart.',
        difficulty: 'easy',
        repeatable: true
      },
      {
        id: 'decode_notice_board',
        title: 'Uncover Hidden Messages',
        description: 'The notice board has cryptic messages between the obvious postings. Use "search board" to find hidden meaning.',
        type: 'puzzle',
        rewardPoints: 20,
        flagOnCompletion: 'hub_hidden_messages_found',
        triggerAction: 'search board',
        hint: 'Sometimes the most important messages are written between the lines.',
        difficulty: 'medium'
      }
    ]
  },

  {
    roomId: 'gorstanvillage',
    miniquests: [
      {
        id: 'baker_story_exchange',
        title: 'Share Stories with the Baker',
        description: 'The village baker loves to exchange tales. Use "tell story" after buying bread to share experiences.',
        type: 'social',
        rewardPoints: 18,
        flagOnCompletion: 'village_baker_story_shared',
        triggerAction: 'tell story',
        requiredItems: ['fresh_bread'],
        hint: 'Bakers appreciate customers who share more than just coin.',
        difficulty: 'easy'
      },
      {
        id: 'blacksmith_riddle',
        title: 'Solve the Blacksmith\'s Riddle',
        description: 'The village blacksmith poses riddles about metalwork. Use "answer riddle" when you think you know.',
        type: 'puzzle',
        rewardPoints: 25,
        flagOnCompletion: 'village_riddle_solved',
        triggerAction: 'answer riddle',
        hint: 'Think about what makes metal strong, yet flexible.',
        difficulty: 'medium'
      }
    ]
  },

  
  {
    roomId: 'dalesapartment',
    miniquests: [
      {
        id: 'dominic_philosophy',
        title: 'Discuss Philosophy with Dominic',
        description: 'Dominic seems unusually perceptive. Use "discuss philosophy" to engage in deep conversation.',
        type: 'social',
        rewardPoints: 22,
        flagOnCompletion: 'apartment_dominic_philosophy',
        triggerAction: 'discuss philosophy',
        requiredItems: ['dominic'],
        hint: 'Goldfish may be wiser than they appear.',
        difficulty: 'easy'
      },
      {
        id: 'perfect_alignment_study',
        title: 'Study the Perfect Alignment',
        description: 'Everything is arranged with mathematical precision. Use "measure distances" to understand the pattern.',
        type: 'puzzle',
        rewardPoints: 30,
        flagOnCompletion: 'apartment_alignment_understood',
        triggerAction: 'measure distances',
        hint: 'Mathematical perfection often hides deeper meaning.',
        difficulty: 'medium'
      }
    ]
  },

  {
    roomId: 'trentpark',
    miniquests: [
      {
        id: 'acknowledge_watchers',
        title: 'Acknowledge the Hidden Watchers',
        description: 'Dark shapes flit between trees. Use "acknowledge presence" to show you\'re aware of being observed.',
        type: 'exploration',
        rewardPoints: 20,
        flagOnCompletion: 'trentpark_watchers_acknowledged',
        triggerAction: 'acknowledge presence',
        hint: 'Sometimes acknowledging the unseen is the first step to understanding.',
        difficulty: 'medium'
      },
      {
        id: 'grove_meditation',
        title: 'Meditate in the Sacred Grove',
        description: 'This clearing feels like a natural temple. Use "meditate" to connect with its energy.',
        type: 'dynamic',
        rewardPoints: 15,
        flagOnCompletion: 'trentpark_meditation_complete',
        triggerAction: 'meditate',
        hint: 'Sacred places reward those who approach with reverence.',
        difficulty: 'easy',
        repeatable: true
      }
    ]
  },

  
  {
    roomId: 'crossing',
    miniquests: [
      {
        id: 'decipher_floating_symbols',
        title: 'Decode the Floating Symbols',
        description: 'Glowing symbols appear near certain doors. Use "decipher symbols" to understand their meaning.',
        type: 'puzzle',
        rewardPoints: 25,
        flagOnCompletion: 'crossing_symbols_deciphered',
        triggerAction: 'decipher symbols',
        requiredItems: ['reality_compass'],
        hint: 'A reality compass might help stabilize the shifting symbols.',
        difficulty: 'medium'
      },
      {
        id: 'pathway_guardian_wisdom',
        title: 'Seek the Guardian\'s Wisdom',
        description: 'The Pathway Guardian appears when you\'re not looking directly. Use "ask for guidance" when they manifest.',
        type: 'social',
        rewardPoints: 30,
        flagOnCompletion: 'crossing_guardian_wisdom',
        triggerAction: 'ask for guidance',
        hint: 'The Guardian only speaks to those who demonstrate they need guidance.',
        difficulty: 'hard'
      }
    ]
  },

  
  {
    roomId: 'forgottenchamber',
    miniquests: [
      {
        id: 'chamber_shade_riddle',
        title: 'Answer the Shade\'s Riddle',
        description: 'The sorrowful apparition poses ancient riddles. Use "answer riddle" to respond to their challenge.',
        type: 'puzzle',
        rewardPoints: 28,
        flagOnCompletion: 'chamber_shade_riddle_solved',
        triggerAction: 'answer riddle',
        hint: 'The answer lies in understanding what the shade has lost.',
        difficulty: 'hard'
      },
      {
        id: 'decode_stone_markings',
        title: 'Decipher the Stone Code',
        description: 'Faded markings on the wall might be a map or code. Use "trace markings" to understand their pattern.',
        type: 'structured',
        rewardPoints: 20,
        flagOnCompletion: 'chamber_markings_decoded',
        triggerAction: 'trace markings',
        hint: 'Sometimes old codes need fresh eyes to see their meaning.',
        difficulty: 'medium'
      }
    ]
  },

  
  {
    roomId: 'villagegreen',
    miniquests: [
      {
        id: 'pond_mystery',
        title: 'Uncover the Pond\'s Secret',
        description: 'The warning suggests the pond triggers unknown effects. Use "touch water" to discover what happens.',
        type: 'exploration',
        rewardPoints: 25,
        flagOnCompletion: 'green_pond_mystery_solved',
        triggerAction: 'touch water',
        hint: 'Sometimes the only way to learn is to take the risk.',
        difficulty: 'medium'
      },
      {
        id: 'gazebo_illumination',
        title: 'Light the Gazebo Lanterns',
        description: 'The hanging lanterns wait to be lit. Use "light lanterns" with the lantern fragment.',
        type: 'dynamic',
        rewardPoints: 15,
        flagOnCompletion: 'green_gazebo_lit',
        triggerAction: 'light lanterns',
        requiredItems: ['lantern_fragment'],
        hint: 'Light drives away more than just darkness.',
        difficulty: 'easy'
      }
    ]
  }
];

export default roomMiniquests;
