# Visual Asset Guidelines

## PNG to Animated GIF Upgrade System

### Overview
The Gorstan game supports both static PNG and animated GIF backgrounds for rooms. The system provides a safe upgrade path to add subtle animations while maintaining performance.

### Asset Structure
```
public/images/
├── roomName.png          # Static fallback (always required)
├── roomName.gif          # Animated version (optional)
└── fallback.png          # System fallback
```

### Implementation Strategy

#### 1. Fallback System
- **Primary**: Use GIF if available and animation enabled
- **Secondary**: Fall back to PNG with same base name
- **Tertiary**: Use system fallback.png if neither exists

#### 2. Performance Guardrails

##### File Size Budget
- **Maximum GIF size**: 2MB per file
- **Recommended size**: 500KB - 1MB
- **Dimensions**: Match existing PNG dimensions exactly
- **Frame rate**: 15-30 FPS maximum
- **Duration**: 3-10 second loops

##### Loading Strategy
- **Lazy loading**: Only load when room is entered
- **Preloading**: Cache adjacent rooms' assets
- **Pause on hidden**: Pause GIF animation when tab/window not visible
- **Memory management**: Unload distant room assets

#### 3. Animation Guidelines

##### Subtle Motion Principles
- **Ambient effects**: Flickering lights, floating particles, gentle swaying
- **Atmospheric elements**: Mist movement, water ripples, wind effects
- **Technology**: Blinking LEDs, screen flickers, hologram shimmer
- **Natural**: Candle flames, cloud drift, aurora movements

##### What to Avoid
- **Jarring motion**: Fast or sudden movements that distract from text
- **High contrast flashing**: Accessibility concern for photosensitive users
- **Complex scenes**: Detailed character animation or complex object movement
- **Continuous motion**: Prefer subtle loops over constant movement

### Technical Implementation

#### Configuration Options
```typescript
// Per-room metadata in room definition
interface Room {
  // ... existing properties
  visualConfig?: {
    allowAnimation: boolean;     // Enable/disable for this room
    preloadAdjacent: boolean;   // Preload neighboring room assets
    animationPriority: 'low' | 'medium' | 'high';
    fallbackStrategy: 'png' | 'static' | 'none';
  };
}
```

#### Global Settings
```typescript
// In game settings
interface Settings {
  // ... existing settings
  animationsEnabled: boolean;        // Master animation toggle
  lowBandwidthMode: boolean;        // Force PNG-only mode
  preloadAssets: boolean;           // Preload adjacent rooms
  animationQuality: 'low' | 'high'; // Adjust frame rates
}
```

### Asset Creation Checklist

#### Pre-Production
- [ ] Identify candidate rooms for animation enhancement
- [ ] Review existing PNG for animation potential
- [ ] Plan subtle motion elements
- [ ] Consider performance impact

#### Production
- [ ] Create GIF with exact same dimensions as PNG
- [ ] Optimize file size (use tools like gifsicle, ezgif.com)
- [ ] Test smooth looping (first and last frames should match)
- [ ] Verify motion is subtle and non-distracting
- [ ] Check accessibility (no rapid flashing)

#### Testing
- [ ] Test loading performance on slow connections
- [ ] Verify fallback to PNG works correctly
- [ ] Check pause behavior when tab is hidden
- [ ] Validate memory usage doesn't increase significantly
- [ ] Test on various screen sizes and devices

#### Deployment
- [ ] Place GIF in same directory as PNG
- [ ] Ensure PNG remains as fallback
- [ ] Update room metadata if needed
- [ ] Monitor performance metrics

### File Naming Convention
```
// Static images (required)
introZone_controlnexus.png
gorstanZone_village.png
latticeZone_library.png

// Animated versions (optional)
introZone_controlnexus.gif
gorstanZone_village.gif
latticeZone_library.gif
```

### Performance Monitoring

#### Metrics to Track
- **Load times**: GIF vs PNG loading comparison
- **Memory usage**: RAM consumption with animations
- **CPU impact**: Animation rendering overhead
- **User preference**: Settings usage statistics

#### Optimization Strategies
- **Conditional loading**: Only load GIF for high-end devices
- **Quality scaling**: Reduce frame rate on slower devices
- **Progressive enhancement**: Start with PNG, upgrade to GIF when ready
- **Cache management**: Intelligent asset cleanup

### Browser Compatibility
- **Modern browsers**: Full GIF animation support
- **Legacy browsers**: Automatic PNG fallback
- **Mobile devices**: Respect `prefers-reduced-motion` CSS media query
- **Low bandwidth**: Detect connection speed and adjust accordingly

### Future Enhancements
- **WebP support**: Consider WebP animated format for better compression
- **Video backgrounds**: MP4 loops for high-quality animations
- **Interactive elements**: Hover effects and click animations
- **Dynamic generation**: Procedural animation based on game state
