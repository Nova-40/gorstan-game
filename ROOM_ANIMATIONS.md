# Room Transition Animation System

## Overview
The game now features a sophisticated room transition animation system that automatically detects different types of movement and applies appropriate visual effects.

## Animation Types

### 1. Zone Change Transitions
**Triggered when:** Moving between different zones (e.g., from `londonZone` to `newyorkZone`)
**Duration:** 2 seconds
**Effect:** 
- 3D rotation effect with perspective
- Opacity fade and scale transformation
- Background gradient shift
- Text displays: "Transitioning from [Zone A] to [Zone B]..."

**Example:** Moving from London Reality to New York Reality

### 2. Portal Transitions
**Triggered when:** Using exits named `portal`, `gateway`, `dimensional_door`, or `step_through`
**Duration:** 1.8 seconds
**Effect:**
- Radial gradient background with purple/pink colors
- Rotating spiral effect with scale transformation
- Particle convergence animation (12 particles)
- Text displays: "Stepping through the portal..."

**Example:** Using the portal at St Katherine's Dock to travel to New York

### 3. Chair Portal Transitions
**Triggered when:** Using exits named `sit`, `chair`, or `chair_portal`
**Duration:** 2.2 seconds
**Effect:**
- Conic gradient background with teal/blue colors
- Complex rotation and scale transformation
- Advanced particle system
- Text displays: "Reality shifts around you..."

**Example:** Sitting in the chair in the reset chamber to return to Trent Park

### 4. Normal Room Movement
**Triggered when:** Moving within the same zone using standard directions
**Duration:** 0.6 seconds
**Effect:**
- Subtle opacity fade and slight scale effect
- Minimal black overlay
- Text displays: "Moving..."

**Example:** Going north/south/east/west within the same zone

## Technical Implementation

### Auto-Detection System
The system automatically detects:
- **Zone changes** by comparing `room.zone` properties
- **Portal travel** by checking exit names for portal-related keywords
- **Chair usage** by detecting `sit` commands and chair-related exits
- **Movement actions** by parsing command input

### Visual Effects Features
- **Framer Motion** animations with sophisticated easing
- **Custom CSS keyframes** for background effects
- **Particle systems** for portal and chair transitions
- **Responsive timing** based on transition type
- **Zone-aware messaging** with proper zone display names

### Zone Display Names
- `introZone` → "Dimensional Control"
- `londonZone` → "London Reality"  
- `newyorkZone` → "New York Reality"
- `gorstanZone` → "Gorstan Highlands"
- `mazeZone` → "The Labyrinth"
- `elfhameZone` → "Elfhame Realm"
- `latticeZone` → "Quantum Lattice"
- `multiZone` → "Liminal Space"
- `offmultiverseZone` → "Broken Realities"
- `glitchZone` → "Glitch Realm"

## Animation Phases

Each transition follows a 4-phase cycle:

1. **Start Phase** (200ms): Initial state preparation
2. **Transition Phase** (Variable): Main animation effect
3. **Arrival Phase** (300ms): Completion animation
4. **Complete Phase**: Animation cleanup and callback

## Integration Points

### Command Detection
The system monitors command input to detect:
- Directional movement (`north`, `south`, `east`, `west`, `up`, `down`)
- Sitting actions (`sit`, `sit in chair`)
- Portal interactions (`enter portal`, `step through`)

### Room State Tracking
- Tracks previous room for comparison
- Maintains transition state flags
- Handles animation lifecycle management

## Performance Features
- **Conditional rendering**: Only renders when transitions are active
- **Cleanup management**: Proper animation cleanup to prevent memory leaks  
- **Optimized timing**: Different durations for different transition types
- **State management**: Prevents overlapping transitions

## User Experience
- **Visual feedback**: Clear indication of movement type
- **Contextual messaging**: Descriptive text based on transition type
- **Smooth transitions**: Professional-quality animations
- **Non-blocking**: Doesn't interfere with game functionality

## Special Cases

### Reset Chamber Chair
The chair in `introZone_introreset.patched.ts` uses the `sit: 'trentpark'` exit, which triggers the chair portal animation when players use `sit` command.

### Portal Networks
St Katherine's Dock and Central Park portals use `portal` exits, triggering the portal spiral animation.

### Hub Transitions
Dimensional hubs with multiple zone connections get zone change animations with appropriate messaging.

## CSS Classes Available
- `.transition-zone-change`: Zone transition effects
- `.transition-dimensional-shift`: Advanced 3D transformations  
- `.transition-portal-spiral`: Portal rotation effects
- `.transition-chair-portal`: Chair reality shift effects

The animation system enhances immersion by providing visual feedback that matches the narrative context of different movement types, making the interdimensional travel feel more meaningful and engaging.
