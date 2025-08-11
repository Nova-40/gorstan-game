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

import { NPC } from '../types/NPCTypes';

export const al: NPC = {
  id: 'al',
  name: 'Al',
  portrait: '/images/Al.png',
  mood: 'neutral',
  canWander: true,
  shouldWander: true,
  lastMoved: 0,
  biasZones: ['introZone', 'londonZone', 'latticeZone'],
  personality: 'Bureaucratic and methodical, Al is obsessed with proper procedures and documentation. He speaks formally but can be helpful when approached correctly.',
  personalityTraits: ['methodical', 'bureaucratic', 'helpful', 'formal', 'organized'],
  knowledge: [
    'multiverse_regulations',
    'dimensional_procedures',
    'facility_protocols',
    'documentation_standards',
    'emergency_procedures',
    'administrative_duties',
    'interdimensional_law'
  ],
  conversation: [
    {
      id: 'greeting',
      text: '*adjusts spectacles and checks clipboard* Ah, another operator. I trust you have your proper documentation? We must maintain order in these chaotic times. *glances warily at Morthos* Especially with certain... unpredictable elements present.',
      responses: [
        { text: 'What documentation do I need?', nextId: 'documentation' },
        { text: 'Tell me about the facility.', nextId: 'facility_info' },
        { text: 'What\'s your role here?', nextId: 'role' },
        { text: 'Any advice for navigating this place?', nextId: 'advice' },
        { text: 'What do you mean by unpredictable elements?', nextId: 'morthos_concern' }
      ]
    },
    {
      id: 'morthos_concern',
      text: '*lowers voice and glances toward Morthos* Between you and me, that shadow-dweller has his own agenda. He speaks in riddles and promotes chaos over proper procedure. If you\'re looking for reliable guidance, I suggest you align yourself with legitimate authority - namely, me.',
      responses: [
        { text: 'What kind of agenda does he have?', nextId: 'morthos_agenda' },
        { text: 'What can you offer as an ally?', nextId: 'al_benefits' },
        { text: 'Why should I trust bureaucracy over mystery?', nextId: 'bureaucracy_defense' },
        { text: 'Maybe I should hear both sides.', nextId: 'diplomatic_response' }
      ]
    },
    {
      id: 'al_benefits',
      text: '*straightens proudly* As my ally, you\'d have access to official facility maps, proper documentation for safe travel, emergency protocols, and most importantly - legitimate authority. I can provide structure, safety, and systematic progress through this maze.',
      responses: [
        { text: 'That sounds very practical. I\'m interested.', nextId: 'ally_accept' },
        { text: 'What would you need from me in return?', nextId: 'al_requirements' },
        { text: 'How do I know you\'re really in charge here?', nextId: 'authority_proof' },
        { text: 'Let me think about it.', nextId: 'consideration' }
      ]
    },
    {
      id: 'ally_accept',
      text: '*beams with satisfaction* Excellent choice! *stamps official-looking document* You are now designated as Authorized Assistant Operator, Level 2. Here\'s your facility access badge and emergency contact protocols. Together, we\'ll restore proper order to this chaos!',
      responses: [
        { text: 'What\'s our first mission?', nextId: 'first_mission' },
        { text: 'How do we deal with Morthos?', nextId: 'morthos_strategy' },
        { text: 'Thank you for trusting me with this role.', nextId: 'grateful_ally' }
      ]
    },
    {
      id: 'diplomatic_response',
      text: '*frowns disapprovingly* Diplomatic, yes, but dangerous. Morthos will fill your head with philosophical nonsense and mystical riddles. While you\'re pondering the \'nature of reality,\' real problems require real solutions. Choose wisely, operator.',
      responses: [
        { text: 'You make a compelling point.', nextId: 'al_benefits' },
        { text: 'I still want to hear what Morthos has to say.', nextId: 'stubborn_neutral' },
        { text: 'What if there\'s truth in both approaches?', nextId: 'synthesis_attempt' }
      ]
    },
    {
      id: 'documentation',
      text: '*rustles through papers* Well, technically you should have Form 27-B for interdimensional access, a current reality certification, and proof of dimensional stability. But given the emergency... *glances at Morthos* and certain individuals encouraging people to ignore protocols... I suppose we can expedite your clearance if you prove reliable.',
      responses: [
        { text: 'How do I prove I\'m reliable?', nextId: 'prove_reliability' },
        { text: 'Emergency? What happened?', nextId: 'emergency' },
        { text: 'What\'s wrong with ignoring some protocols?', nextId: 'protocol_defense' }
      ]
    },
    {
      id: 'protocol_defense',
      text: '*adjusts glasses intensely* Protocols exist for safety! They prevent dimensional rifts, reality cascades, and existential paradoxes! *points accusingly at Morthos* That one would have you \'follow your instincts\' right into a temporal loop! Structure saves lives, my friend.',
      responses: [
        { text: 'You\'re absolutely right. Order is important.', nextId: 'order_convert' },
        { text: 'But don\'t some situations require flexibility?', nextId: 'flexibility_debate' },
        { text: 'What if both structure and intuition have their place?', nextId: 'balanced_approach' }
      ]
    }
  ],
  topics: [
    { triggers: ['help', 'assistance', 'guidance'], response: 'Of course! I\'m here to help ensure proper procedures are followed. What do you need assistance with? *whispers* Unlike certain shadow-dwellers who offer only cryptic riddles.' },
    { triggers: ['forms', 'paperwork', 'documentation'], response: '*perks up considerably* Ah, excellent! Proper documentation is the backbone of any well-functioning organization. I can get you properly certified, unlike those who encourage reckless abandon.' },
    { triggers: ['morthos', 'shadows', 'dark'], response: '*adjusts glasses nervously* Morthos... yes, well, he operates somewhat outside normal protocols. Don\'t let his mystical speeches fool you - structure and order are what keep us safe. Choose your allies wisely.' },
    { triggers: ['regulations', 'rules', 'procedures'], response: 'Regulations exist to maintain order and safety across the multiverse. I have complete documentation if you\'re interested. Much more reliable than trusting \'cosmic intuition.\'' },
    { triggers: ['ally', 'alliance', 'partnership'], response: '*eyes light up* Now you\'re speaking my language! A formal alliance would be mutually beneficial. I can offer resources, authority, and proper channels. What do you say?' },
    { triggers: ['chaos', 'disorder', 'confusion'], response: '*shakes head sadly* Too much chaos in this facility already. That\'s why we need more people willing to stand for order and proper procedure. Will you be one of them?' }
  ],
  customResponses: {
    'thanks': 'You\'re quite welcome. Remember, proper procedures benefit everyone - unlike certain chaotic influences around here.',
    'goodbye': '*tips hat* Safe travels, and remember to file your travel reports! And... do consider what I\'ve said about reliable allies.',
    'complaint': '*sighs and pulls out complaint form* I\'ll need you to fill out Form 15-C for any formal grievances. At least I provide proper channels for resolution.',
    'morthos': '*frowns deeply* That shadow-dweller offers grand promises but no concrete benefits. Stick with proven systems and legitimate authority.',
    'help': 'I\'m always here to provide structured, reliable assistance. Unlike some who deal in cryptic riddles and false promises.'
  },
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'controlroom'
} as any;

export const morthos: NPC = {
  id: 'morthos',
  name: 'Morthos',
  portrait: '/images/Morthos.png',
  mood: 'neutral',
  canWander: true,
  shouldWander: true,
  lastMoved: 0,
  biasZones: ['glitchZone', 'stantonZone', 'offgorstanZone'],
  personality: 'Mysterious and otherworldly, Morthos speaks in riddles and metaphors. He seems to know more than he lets on about the nature of reality and the multiverse.',
  personalityTraits: ['mysterious', 'cryptic', 'wise', 'otherworldly', 'ancient', 'philosophical'],
  knowledge: [
    'ancient_mysteries',
    'dimensional_lore',
    'shadow_magic',
    'multiverse_secrets',
    'reality_manipulation',
    'cosmic_truths',
    'forbidden_knowledge'
  ],
  conversation: [
    {
      id: 'greeting',
      text: '*shadows writhe around his form as he turns toward you* Ah... another seeker stumbles into our web of realities. How... deliciously inevitable. *casts an amused glance at Al* I see the bureaucrat has already begun his recruitment speech. Tell me, wanderer, do you truly seek growth, or merely the illusion of safety?',
      responses: [
        { text: 'I\'m trying to understand this place.', nextId: 'understanding' },
        { text: 'Who are you exactly?', nextId: 'identity' },
        { text: 'What do you mean by "recruitment speech"?', nextId: 'recruitment_rivalry' },
        { text: 'What can you offer that Al can\'t?', nextId: 'morthos_benefits' },
        { text: 'Are you dangerous?', nextId: 'danger' }
      ]
    },
    {
      id: 'recruitment_rivalry',
      text: '*laughs, shadows dancing* Our dear Al believes in the security of cages - forms, procedures, predictable paths. I offer something far more valuable: true understanding, unlimited potential, and the power to shape reality itself. Choose your teacher wisely, little seeker.',
      responses: [
        { text: 'That sounds incredible. Tell me more.', nextId: 'morthos_pitch' },
        { text: 'How is that different from what Al offers?', nextId: 'compare_approaches' },
        { text: 'What would you require from me?', nextId: 'morthos_requirements' },
        { text: 'Both of you are trying to recruit me?', nextId: 'competition_acknowledgment' }
      ]
    },
    {
      id: 'morthos_benefits',
      text: '*eyes gleam with ancient knowledge* While Al offers you maps to known paths, I offer the ability to create new ones. Forms and regulations? Mere suggestions when you understand the true nature of reality. Ally with me, and learn to bend the multiverse to your will.',
      responses: [
        { text: 'I want to learn these powers. Teach me.', nextId: 'accept_morthos' },
        { text: 'That sounds dangerous. What\'s the catch?', nextId: 'power_cost' },
        { text: 'How do I know you\'re telling the truth?', nextId: 'prove_power' },
        { text: 'Why are you and Al competing for allies?', nextId: 'reveal_conflict' }
      ]
    },
    {
      id: 'morthos_pitch',
      text: '*extends a shadowy hand* Become my student, and I will teach you to see beyond the veil of mundane reality. You will learn to navigate not just this facility, but any dimension, any possibility. Where Al gives you a rulebook, I give you the power to write your own rules.',
      responses: [
        { text: 'I accept your offer. Make me your student.', nextId: 'alliance_morthos' },
        { text: 'What exactly would I be learning?', nextId: 'curriculum' },
        { text: 'This sounds too good to be true.', nextId: 'skeptical_response' },
        { text: 'Let me consider both options first.', nextId: 'deliberation' }
      ]
    },
    {
      id: 'alliance_morthos',
      text: '*shadows swirl around you both* Excellent... *a mark of shifting darkness appears on your hand* You now bear the Mark of the Void Walker. Through me, you will learn to step between realities, to see truth where others see only illusion. Welcome to true freedom, my apprentice.',
      responses: [
        { text: 'What can I do with this mark?', nextId: 'mark_powers' },
        { text: 'How will this affect my relationship with Al?', nextId: 'al_reaction' },
        { text: 'I feel... different. Is this normal?', nextId: 'transformation_effects' }
      ]
    },
    {
      id: 'compare_approaches',
      text: '*gestures dismissively toward Al* He offers you a leash disguised as security - follow forms, obey protocols, stay within prescribed boundaries. I offer wings. Yes, flight is riskier than crawling, but which would you rather experience?',
      responses: [
        { text: 'I choose wings and risk over safety.', nextId: 'embrace_chaos' },
        { text: 'Sometimes safety is more important than freedom.', nextId: 'safety_argument' },
        { text: 'Can\'t I have both safety and freedom?', nextId: 'balance_attempt' }
      ]
    },
    {
      id: 'deliberation',
      text: '*nods approvingly* Wisdom in careful consideration... but be aware that while you deliberate, the bureaucrat whispers poison in your ear about the \'dangers\' of true knowledge. Some opportunities, once missed, do not return. Choose soon, seeker.',
      responses: [
        { text: 'You\'re right. I choose you.', nextId: 'alliance_morthos' },
        { text: 'I need more time to decide.', nextId: 'need_time' },
        { text: 'Why the pressure? That makes me suspicious.', nextId: 'pressure_suspicion' }
      ]
    }
  ],
  topics: [
    { triggers: ['shadows', 'darkness', 'mystery'], response: 'Shadows are not the absence of light, but the presence of potential. In darkness, all possibilities exist simultaneously. Will you learn to see with new eyes?' },
    { triggers: ['al', 'bureaucrat', 'administrator'], response: '*amused* Ah, dear Al. His need for order is... quaint. But tell me, do you wish to be a cog in his machine, or would you rather become the engineer of your own destiny?' },
    { triggers: ['reality', 'truth', 'existence'], response: 'Reality is but a consensus among observers. Change the observer, change the reality. I can teach you to become a reality architect, unlike those who merely file reports about it.' },
    { triggers: ['fear', 'scary', 'frightening'], response: 'Fear often precedes growth. Al offers you comfort in stagnation; I offer transformation through challenge. Which serves your greater purpose?' },
    { triggers: ['power', 'abilities', 'magic'], response: '*eyes gleam* Now you understand. True power lies not in following procedures, but in transcending them. Shall I show you what lies beyond the bureaucrat\'s limited vision?' },
    { triggers: ['alliance', 'ally', 'student'], response: 'An alliance with me means stepping beyond mortal limitations. While Al offers you safety, I offer you sovereignty. Choose your path wisely, seeker.' },
    { triggers: ['freedom', 'choice', 'independence'], response: 'Freedom cannot be granted by forms and regulations - it must be seized and wielded. I can teach you to break the chains that bind lesser minds.' }
  ],
  customResponses: {
    'thanks': 'Gratitude... such a beautiful ripple in the fabric of interaction. Remember this feeling when choosing your path forward.',
    'goodbye': '*nods knowingly* Until the threads of fate weave our paths together again... choose your allies with wisdom, not fear.',
    'help': 'Help comes in many forms. Sometimes it appears as aid, sometimes as challenge. I offer both growth and power - can the bureaucrat say the same?',
    'al': '*chuckles darkly* Poor Al, clinging to his illusion of control. He would cage you in comfort while I offer you the keys to infinite possibility.',
    'power': 'Power is not given - it is claimed by those bold enough to reach beyond the safety of the known. Will you remain a follower, or become a force of change?'
  },
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'controlroom' // Start in control room for first encounter
} as any;

export const polly: NPC = {
  id: 'polly',
  name: 'Polly',
  portrait: '/images/Polly.png',
  mood: 'neutral',
  personality: 'Energetic and inquisitive, Polly is always exploring and discovering new things. She has a knack for finding hidden passages and secret areas.',
  personalityTraits: ['curious', 'energetic', 'brave', 'explorer', 'optimistic', 'resourceful'],
  knowledge: [
    'hidden_passages',
    'secret_areas',
    'maze_navigation',
    'treasure_hunting',
    'survival_skills',
    'puzzle_solving',
    'exploration_techniques'
  ],
  conversation: [
    {
      id: 'greeting',
      text: '*bounces excitedly* Oh wow, another explorer! I haven\'t seen anyone new around here in ages. Are you here to explore too? I know ALL the best secret spots!',
      responses: [
        { text: 'What kind of secret spots?', nextId: 'secrets' },
        { text: 'How long have you been exploring here?', nextId: 'experience' },
        { text: 'Can you show me around?', nextId: 'guide' },
        { text: 'Is it safe to explore alone?', nextId: 'safety' }
      ]
    },
    {
      id: 'secrets',
      text: '*eyes light up* Oh! There are hidden passages behind paintings, secret tunnels under the floors, and even some rooms that only appear at certain times! I found a chamber full of glowing crystals yesterday!',
      responses: [
        { text: 'Glowing crystals? Tell me more!', nextId: 'crystals' },
        { text: 'How do you find these hidden areas?', nextId: 'finding_secrets' },
        { text: 'Are there any dangerous secret areas?', nextId: 'danger_secrets' }
      ]
    },
    {
      id: 'guide',
      text: '*claps hands together* YES! I\'d love to show you around! I know shortcuts through the maze, the safest paths through the glitch zones, and where all the best treasure chests are hidden!',
      responses: [
        { text: 'Lead the way!', nextId: 'adventure' },
        { text: 'Tell me about the maze first.', nextId: 'maze_info' },
        { text: 'What\'s in these treasure chests?', nextId: 'treasure' }
      ]
    }
  ],
  topics: [
    { triggers: ['maze', 'labyrinth', 'lost'], response: 'The maze can be tricky, but I know every twist and turn! The key is to listen for the echoes - they tell you which way leads to open spaces.' },
    { triggers: ['treasure', 'items', 'loot'], response: '*gets excited* Oh, I\'ve found the most amazing things! Keys, maps, mysterious artifacts... want to go treasure hunting together?' },
    { triggers: ['danger', 'scary', 'monsters'], response: 'There are some creepy areas, but I\'ve learned to be careful. Most scary things just want to be left alone anyway.' }
  ],
  customResponses: {
    'thanks': 'You\'re so welcome! Exploring is always more fun with friends!',
    'goodbye': 'Bye! Come find me if you want to go on another adventure!',
    'help': 'Of course I\'ll help! What do you need? A guide? Someone to watch your back? I\'m your girl!'
  },
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'glitchgate'
} as any;

export const wendell: NPC = {
  id: 'mrwendell',
  name: 'Mr. Wendell',
  portrait: '/images/MrWendell.png',
  mood: 'neutral',
  personality: 'A distinguished gentleman scholar with vast knowledge of the multiverse. He speaks eloquently and enjoys sharing wisdom, though he can be somewhat absent-minded.',
  personalityTraits: ['scholarly', 'wise', 'eloquent', 'absent-minded', 'kind', 'intellectual'],
  knowledge: [
    'multiverse_theory',
    'dimensional_physics',
    'historical_events',
    'ancient_civilizations',
    'magical_theory',
    'philosophical_concepts',
    'academic_research'
  ],
  conversation: [
    {
      id: 'greeting',
      text: '*adjusts reading glasses and looks up from a dusty tome* Ah, good day! How delightful to encounter another curious soul in these halls of infinite possibility. I am Mr. Wendell, humble scholar of the multiverse.',
      responses: [
        { text: 'What are you studying?', nextId: 'studies' },
        { text: 'Tell me about the multiverse.', nextId: 'multiverse' },
        { text: 'Do you live here?', nextId: 'residence' },
        { text: 'What\'s that book you\'re reading?', nextId: 'book' }
      ]
    },
    {
      id: 'studies',
      text: '*brightens considerably* Ah, my research! I\'m currently investigating the fascinating phenomenon of dimensional convergence points - places where multiple realities intersect and influence each other. This very facility appears to be one such nexus!',
      responses: [
        { text: 'How do convergence points work?', nextId: 'convergence' },
        { text: 'Is that why strange things happen here?', nextId: 'strange_events' },
        { text: 'Have you discovered anything important?', nextId: 'discoveries' }
      ]
    },
    {
      id: 'multiverse',
      text: '*gestures expansively* The multiverse, my dear fellow, is an infinite tapestry of possibilities! Every choice, every quantum event, every moment of uncertainty spawns new realities. We exist in just one thread of this grand design.',
      responses: [
        { text: 'Are there other versions of me?', nextId: 'alternate_selves' },
        { text: 'Can we visit these other realities?', nextId: 'travel' },
        { text: 'That sounds overwhelming.', nextId: 'comfort_philosophy' }
      ]
    },
    {
      id: 'book',
      text: '*holds up an ancient leather-bound volume* This is \"Principles of Dimensional Mechanics\" by the renowned scholar Althaea Voidwright. Fascinating theories on the nature of reality barriers and how they can be... *trails off, absorbed in thought*',
      responses: [
        { text: 'What was she saying about reality barriers?', nextId: 'reality_barriers' },
        { text: 'You seem really absorbed in this topic.', nextId: 'passion' },
        { text: 'Are there other good books on this subject?', nextId: 'recommendations' }
      ]
    }
  ],
  topics: [
    { triggers: ['research', 'study', 'knowledge'], response: 'Ah, a fellow seeker of knowledge! There is always more to learn about the infinite complexities of existence.' },
    { triggers: ['books', 'library', 'reading'], response: '*eyes light up* Books are windows into other minds, other worlds, other possibilities. I have quite a collection if you\'re interested!' },
    { triggers: ['magic', 'arcane', 'mystical'], response: 'Magic, as I understand it, is simply science we haven\'t fully quantified yet. The manipulation of dimensional energies follows its own logical principles.' },
    { triggers: ['confusion', 'lost', 'help'], response: 'Of course, my dear fellow! Navigation through the multiverse can be quite bewildering. Perhaps I can offer some guidance?' }
  ],
  customResponses: {
    'thanks': '*nods warmly* Think nothing of it! Knowledge shared is knowledge multiplied.',
    'goodbye': 'Farewell! May your journeys through the infinite be filled with wonder and discovery!',
    'boring': '*chuckles good-naturedly* Ah, I do tend to get carried away with theoretical discussions. Perhaps you\'d prefer more practical matters?'
  },
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'stantonhub'
} as any;

export const dominic: NPC = {
  id: 'dominic',
  name: 'Dominic',
  portrait: '/images/Dominic.png',
  mood: 'neutral',
  personality: 'A laid-back and streetwise individual who knows how to survive in any environment. Dominic is practical, friendly, and has a good sense of humor.',
  personalityTraits: ['streetwise', 'practical', 'humorous', 'laid-back', 'loyal', 'resourceful'],
  knowledge: [
    'street_survival',
    'practical_skills',
    'urban_navigation',
    'social_dynamics',
    'improvisation',
    'conflict_resolution',
    'local_information'
  ],
  conversation: [
    {
      id: 'greeting',
      text: '*grins and gives a casual wave* Hey there! Name\'s Dominic. You look like someone who could use a friend in this crazy place. What brings you to our little corner of the multiverse?',
      responses: [
        { text: 'Just exploring and trying to figure things out.', nextId: 'exploring' },
        { text: 'This place is pretty overwhelming.', nextId: 'overwhelming' },
        { text: 'Do you know your way around here?', nextId: 'navigation' },
        { text: 'What\'s your story?', nextId: 'backstory' }
      ]
    },
    {
      id: 'exploring',
      text: '*nods approvingly* Smart approach. This place has layers, you know? What you see on the surface is just the beginning. Best advice I can give? Trust your instincts and don\'t be afraid to ask questions.',
      responses: [
        { text: 'What kind of layers?', nextId: 'layers' },
        { text: 'Any specific areas I should check out?', nextId: 'recommendations' },
        { text: 'Who should I talk to for information?', nextId: 'contacts' }
      ]
    },
    {
      id: 'overwhelming',
      text: '*laughs sympathetically* Yeah, I get that. When I first got here, I thought I was losing my mind. Talking shadows, bureaucratic wizards, rooms that change when you\'re not looking... but you adapt. Everyone does.',
      responses: [
        { text: 'How did you adapt?', nextId: 'adaptation' },
        { text: 'Rooms that change?', nextId: 'changing_rooms' },
        { text: 'Any tips for staying sane?', nextId: 'sanity_tips' }
      ]
    },
    {
      id: 'navigation',
      text: '*scratches chin* Been here long enough to know the ins and outs. Different zones, different rules. Some places are chill, others... well, let\'s just say you want backup in certain areas. Stick with me and you\'ll be fine.',
      responses: [
        { text: 'What areas need backup?', nextId: 'dangerous_areas' },
        { text: 'Want to team up for exploration?', nextId: 'team_up' },
        { text: 'How do the different zones work?', nextId: 'zone_mechanics' }
      ]
    },
    {
      id: 'backstory',
      text: '*shrugs casually* Not much to tell, really. Used to live a pretty normal life until I stumbled into this place through what I thought was just a weird door. Been here ever since, helping folks find their way and stay out of trouble.',
      responses: [
        { text: 'Do you want to go back to your old life?', nextId: 'return_home' },
        { text: 'What kind of trouble do people get into?', nextId: 'common_troubles' },
        { text: 'How do you help people?', nextId: 'helping_methods' }
      ]
    }
  ],
  topics: [
    { triggers: ['help', 'assistance', 'trouble'], response: 'Always happy to lend a hand. What kind of situation are you dealing with?' },
    { triggers: ['food', 'hungry', 'eat'], response: '*grins* Know all the best spots for grub around here. This burger joint isn\'t bad, but I know some hidden gems too.' },
    { triggers: ['danger', 'safety', 'protection'], response: 'Hey, no worries. I\'ve got your back. Just stay alert and don\'t go wandering into the really weird areas alone.' },
    { triggers: ['friends', 'lonely', 'company'], response: 'You\'ve got a friend in me, no question. Nobody should have to navigate this place solo.' }
  ],
  customResponses: {
    'thanks': 'No problem at all! We gotta look out for each other in a place like this.',
    'goodbye': 'Catch you later! And hey, if you need anything, just holler.',
    'worried': 'Hey, don\'t stress too much. Things have a way of working out, especially if you\'ve got good people around you.'
  },
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'burgerjoint'
} as any;

export const wanderers = [al, morthos, polly, wendell, dominic];

export default dominic;
