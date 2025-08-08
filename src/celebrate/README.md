# Gorstan Celebration System 🎉

A comprehensive, inclusive celebration system that replaces the previous seasonal events with support for major world religious and cultural celebrations.

## Overview

The Celebration System provides once-per-year dismissible overlays for 9 major traditions:
- ✝️ **Christian** (Christmas, Easter)
- ☪️ **Islamic** (Eid al-Fitr, Eid al-Adha)
- ✡️ **Jewish** (Rosh Hashanah, Passover, Hanukkah)
- 🐉 **Chinese** (Lunar New Year, Mid-Autumn Festival)
- 🕉️ **Hindu** (Diwali, Holi)
- ☸️ **Buddhist** (Vesak)
- ☬ **Sikh** (Vaisakhi)
- ⛩️ **Shinto** (Shōgatsu, Obon)
- 🌍 **Seasonal/Astronomical** (Solstices, Equinoxes, Naw-Rúz)

## Features

### 🗄️ Data Generation
- **520+ celebration spans** covering 2025-2050
- Pre-calculated dates for reliability
- JSON-based data storage for performance
- Unique IDs for precise tracking

### 🎯 Smart Detection
- Real-time date checking
- User preference filtering
- Once-per-year dismissal tracking
- Automatic midnight refresh

### 🎨 Beautiful Overlays
- Tradition-specific color themes
- Cultural sensitivity in messaging
- Smooth animations and transitions
- Responsive design

### ⚙️ User Control
- Dismissible overlays (once per year)
- Preference management by tradition
- Automatic New Year reset
- Graceful error handling

## Directory Structure

```
src/celebrate/
├── data/                    # Generated JSON celebration data
│   ├── christian.json       # Christmas, Easter
│   ├── islamic.json         # Eid al-Fitr, Eid al-Adha
│   ├── jewish.json          # Rosh Hashanah, Passover, Hanukkah
│   ├── chinese.json         # Lunar New Year, Mid-Autumn
│   ├── hindu.json           # Diwali, Holi
│   ├── buddhist.json        # Vesak
│   ├── sikh.json            # Vaisakhi
│   ├── shinto.json          # Shōgatsu, Obon
│   ├── seasonal.json        # Solstices, Equinoxes, Naw-Rúz
│   └── index.json           # Comprehensive index
├── gen/                     # Data generation scripts
│   ├── util.ts              # Core utilities and types
│   ├── build-christian.ts   # Christian holiday generator
│   ├── build-islam.ts       # Islamic holiday generator
│   ├── build-judaism.ts     # Jewish holiday generator
│   ├── build-chinese.ts     # Chinese holiday generator
│   ├── build-hindu.ts       # Hindu holiday generator
│   ├── build-buddhist.ts    # Buddhist holiday generator
│   ├── build-sikh.ts        # Sikh holiday generator
│   ├── build-shinto.ts      # Shinto holiday generator
│   ├── build-seasonal.ts    # Seasonal/astronomical generator
│   ├── build-all.ts         # Master generator script
│   └── run-generator.ts     # Simple runner
├── assets/                  # Visual assets
│   └── celebrationIcons.tsx # SVG icons for traditions
├── test/                    # Testing components
│   └── CelebrationTest.tsx  # System verification
├── celebrateGate.ts         # Core runtime logic
├── celebrateController.tsx  # React controller component
└── index.ts                 # Main exports
```

## Usage

### Basic Integration

The system automatically integrates with the main app through the `CelebrationController`:

```tsx
import { CelebrationController } from './celebrate';

function App() {
  return (
    <GameStateProvider>
      <CelebrationController>
        <AppCore />
      </CelebrationController>
    </GameStateProvider>
  );
}
```

### Manual Celebration Checking

```tsx
import { getActiveCelebrations, hasCelebrations } from './celebrate';

// Check for active celebrations
const celebrations = await getActiveCelebrations();
const hasAny = await hasCelebrations();

// Get specific celebration
const christmas = await getCelebrationById('2025-12-25_christmas_2025');
```

### Preference Management

```tsx
import { 
  getCelebrationPreferences, 
  saveCelebrationPreferences 
} from './celebrate';

// Get current preferences
const prefs = getCelebrationPreferences();

// Update preferences
saveCelebrationPreferences({
  ...prefs,
  christian: true,
  islamic: false
});
```

## Data Generation

### Regenerate All Data

```bash
cd src/celebrate/gen
npx tsx run-generator.ts
```

### Individual Tradition Data

```bash
npx tsx build-christian.ts
npx tsx build-islam.ts
# etc.
```

## Data Structure

### Span Type
```typescript
type Span = {
  id: string;        // Unique identifier
  start: string;     // ISO date (YYYY-MM-DD)
  end: string;       // ISO date (YYYY-MM-DD)
  label?: string;    // Human-readable name
};
```

### Example Data
```json
{
  "christmas": [
    {
      "id": "2025-12-25_christmas_2025",
      "start": "2025-12-25",
      "end": "2025-12-25",
      "label": "Christmas 2025"
    }
  ]
}
```

## Cultural Sensitivity

### Approach
- **Inclusive**: Represents major world traditions equally
- **Respectful**: Uses appropriate terminology and styling
- **Optional**: All celebrations can be disabled by user preference
- **Accurate**: Uses known dates rather than approximations

### Color Themes
- **Christian**: Red/Green gradient
- **Islamic**: Green/Emerald gradient
- **Jewish**: Blue/Indigo gradient
- **Chinese**: Red/Yellow gradient
- **Hindu**: Orange/Pink gradient
- **Buddhist**: Orange/Amber gradient
- **Sikh**: Orange/Blue gradient
- **Shinto**: Red/White gradient
- **Seasonal**: Blue/Green gradient

### Messaging
Each tradition has respectful, culturally appropriate celebration messages:
- "Wishing you peace, joy, and wonder this Christmas season."
- "Eid Mubarak! Celebrating the end of Ramadan with joy and gratitude."
- "L'Shana Tova! Wishing you a sweet and blessed new year."
- etc.

## Performance

### Optimization
- **Lazy Loading**: Data loaded only when needed
- **Caching**: In-memory caching of loaded data
- **Efficient Queries**: Date-based filtering
- **Minimal Bundle Impact**: Tree-shakeable exports

### Storage
- **LocalStorage**: User preferences and dismissal state
- **JSON Files**: Celebration data (served by Vite)
- **Memory Cache**: Runtime data caching

## Future Enhancements

### Possible Additions
- Additional traditions (Indigenous, African, etc.)
- Custom user celebrations
- Integration with calendar APIs
- Accessibility improvements
- Animation enhancements

### Technical Improvements
- WebWorker for date calculations
- IndexedDB for larger datasets
- Service worker for offline support
- Advanced caching strategies

## Migration from Seasonal System

The celebration system completely replaces the previous seasonal system:

### Removed
- `src/seasonal/` directory and all components
- `useSeasonalController` hook
- `OverlayPortal` component
- Season-specific overlays

### Added
- `src/celebrate/` directory with comprehensive structure
- `CelebrationController` component
- Multi-religious celebration support
- Generated data tables through 2050

### Migration Steps
1. ✅ Remove seasonal imports from AppCore
2. ✅ Replace OverlayPortal with CelebrationController
3. ✅ Generate celebration data
4. ✅ Test system integration
5. 🔄 Remove seasonal files (cleanup)

## Testing

### Automated Testing
```bash
# Run the test component in development
npm run dev
# Navigate to app and check test panel in top-right
```

### Manual Testing
1. Change system date to celebration date
2. Refresh application
3. Verify overlay appears
4. Test dismissal functionality
5. Verify preferences work

### Data Verification
- All 520+ spans generated correctly
- Dates accurate for each tradition
- IDs unique and well-formed
- JSON structure valid

## License

Part of the Gorstan game project. See main project license.
