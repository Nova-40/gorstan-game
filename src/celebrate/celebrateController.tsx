// src/celebrate/celebrateController.tsx
// React controller for celebration overlays

import React, { useEffect, useState } from 'react';
import { 
  getActiveCelebrations, 
  isCelebrationDismissed, 
  dismissCelebration,
  getCelebrationPreferences,
  clearDismissedCelebrations
} from './celebrateGate';
import { Span } from './gen/util';

interface CelebrationControllerProps {
  children: React.ReactNode;
}

interface CelebrationState {
  activeCelebrations: Span[];
  currentCelebration: Span | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Main celebration controller component
 * Manages display of celebration overlays based on current date
 */
export const CelebrationController: React.FC<CelebrationControllerProps> = ({ children }) => {
  const [state, setState] = useState<CelebrationState>({
    activeCelebrations: [],
    currentCelebration: null,
    isLoading: true,
    error: null
  });
  
  const [preferences] = useState(() => getCelebrationPreferences());
  
  // Check for active celebrations on mount and date changes
  useEffect(() => {
    checkActiveCelebrations();
    
    // Clear dismissed celebrations on New Year (January 1st)
    const now = new Date();
    if (now.getMonth() === 0 && now.getDate() === 1) {
      clearDismissedCelebrations();
    }
    
    // Set up daily check at midnight
    const setMidnightCheck = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        checkActiveCelebrations();
        setMidnightCheck(); // Set up next day's check
      }, timeUntilMidnight);
    };
    
    setMidnightCheck();
  }, []);
  
  const checkActiveCelebrations = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const celebrations = await getActiveCelebrations();
      
      // Filter by user preferences and dismissed status
      const filteredCelebrations = celebrations.filter(celebration => {
        // Extract tradition from celebration ID or label
        const tradition = extractTraditionFromCelebration(celebration);
        const isPreferenceEnabled = preferences[tradition] !== false;
        const isNotDismissed = !isCelebrationDismissed(celebration.id);
        
        return isPreferenceEnabled && isNotDismissed;
      });
      
      // Select the first celebration to show (if any)
      const currentCelebration = filteredCelebrations.length > 0 ? filteredCelebrations[0] : null;
      
      setState({
        activeCelebrations: filteredCelebrations,
        currentCelebration,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load celebrations'
      }));
    }
  };
  
  const handleDismissCelebration = (celebrationId: string) => {
    dismissCelebration(celebrationId);
    setState(prev => ({
      ...prev,
      currentCelebration: null,
      activeCelebrations: prev.activeCelebrations.filter(c => c.id !== celebrationId)
    }));
  };
  
  // Extract tradition name from celebration
  const extractTraditionFromCelebration = (celebration: Span): string => {
    const label = celebration.label?.toLowerCase() || '';
    
    if (label.includes('christmas') || label.includes('easter')) return 'christian';
    if (label.includes('eid') || label.includes('ramadan')) return 'islamic';
    if (label.includes('rosh') || label.includes('passover') || label.includes('hanukkah')) return 'jewish';
    if (label.includes('lunar') || label.includes('mid-autumn')) return 'chinese';
    if (label.includes('diwali') || label.includes('holi')) return 'hindu';
    if (label.includes('vesak') || label.includes('buddha')) return 'buddhist';
    if (label.includes('vaisakhi')) return 'sikh';
    if (label.includes('shogatsu') || label.includes('obon')) return 'shinto';
    if (label.includes('solstice') || label.includes('equinox') || label.includes('naw-rúz')) return 'seasonal';
    
    return 'other';
  };
  
  return (
    <>
      {children}
      {state.currentCelebration && (
        <CelebrationOverlay
          celebration={state.currentCelebration}
          onDismiss={() => handleDismissCelebration(state.currentCelebration!.id)}
        />
      )}
    </>
  );
};

interface CelebrationOverlayProps {
  celebration: Span;
  onDismiss: () => void;
}

/**
 * Individual celebration overlay component
 */
const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ celebration, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Fade in after a short delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for fade out animation
  };
  
  // Extract tradition for styling
  const tradition = extractTraditionFromLabel(celebration.label || '');
  
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-50 backdrop-blur-sm
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleDismiss}
    >
      <div
        className={`
          relative max-w-md mx-4 p-6 rounded-lg shadow-xl
          transform transition-all duration-300
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
          ${getTraditionStyling(tradition)}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
          aria-label="Dismiss celebration"
        >
          <span className="text-white text-xl">&times;</span>
        </button>
        
        {/* Celebration content */}
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">{celebration.label}</h2>
          <p className="text-lg opacity-90">
            {getCelebrationMessage(celebration)}
          </p>
          <div className="mt-4 text-sm opacity-75">
            {celebration.start === celebration.end 
              ? new Date(celebration.start).toLocaleDateString()
              : `${new Date(celebration.start).toLocaleDateString()} - ${new Date(celebration.end).toLocaleDateString()}`
            }
          </div>
        </div>
        
        {/* Dismiss button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white font-medium transition-colors"
          >
            Continue to Gorstan
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function extractTraditionFromLabel(label: string): string {
  const lower = label.toLowerCase();
  
  if (lower.includes('christmas') || lower.includes('easter')) return 'christian';
  if (lower.includes('eid') || lower.includes('ramadan')) return 'islamic';
  if (lower.includes('rosh') || lower.includes('passover') || lower.includes('hanukkah')) return 'jewish';
  if (lower.includes('lunar') || lower.includes('mid-autumn')) return 'chinese';
  if (lower.includes('diwali') || lower.includes('holi')) return 'hindu';
  if (lower.includes('vesak') || lower.includes('buddha')) return 'buddhist';
  if (lower.includes('vaisakhi')) return 'sikh';
  if (lower.includes('shogatsu') || lower.includes('obon')) return 'shinto';
  if (lower.includes('solstice') || lower.includes('equinox') || lower.includes('naw-rúz')) return 'seasonal';
  
  return 'other';
}

function getTraditionStyling(tradition: string): string {
  const styles = {
    christian: 'bg-gradient-to-br from-red-600 to-green-600',
    islamic: 'bg-gradient-to-br from-green-600 to-emerald-700',
    jewish: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    chinese: 'bg-gradient-to-br from-red-600 to-yellow-600',
    hindu: 'bg-gradient-to-br from-orange-500 to-pink-600',
    buddhist: 'bg-gradient-to-br from-orange-400 to-amber-600',
    sikh: 'bg-gradient-to-br from-orange-500 to-blue-600',
    shinto: 'bg-gradient-to-br from-red-500 to-white',
    seasonal: 'bg-gradient-to-br from-blue-500 to-green-500',
    other: 'bg-gradient-to-br from-purple-600 to-blue-600'
  };
  
  return styles[tradition as keyof typeof styles] || styles.other;
}

function getCelebrationMessage(celebration: Span): string {
  const label = celebration.label?.toLowerCase() || '';
  
  if (label.includes('christmas')) return 'Wishing you peace, joy, and wonder this Christmas season.';
  if (label.includes('easter')) return 'Celebrating renewal, hope, and new beginnings.';
  if (label.includes('eid al-fitr')) return 'Eid Mubarak! Celebrating the end of Ramadan with joy and gratitude.';
  if (label.includes('eid al-adha')) return 'Eid Mubarak! Honoring sacrifice, devotion, and community.';
  if (label.includes('rosh hashanah')) return 'L\'Shana Tova! Wishing you a sweet and blessed new year.';
  if (label.includes('passover')) return 'Chag Pesach Sameach! Celebrating freedom and liberation.';
  if (label.includes('hanukkah')) return 'Chag Hanukkah Sameach! Festival of lights and miracles.';
  if (label.includes('lunar new year')) return 'Gong Xi Fa Cai! Welcoming prosperity and good fortune.';
  if (label.includes('mid-autumn')) return 'Happy Mid-Autumn Festival! Celebrating unity and harvest.';
  if (label.includes('diwali')) return 'Happy Diwali! Festival of lights, prosperity, and new beginnings.';
  if (label.includes('holi')) return 'Happy Holi! Celebrating the triumph of good over evil with colors and joy.';
  if (label.includes('vesak')) return 'Happy Vesak Day! Honoring the birth, enlightenment, and passing of Buddha.';
  if (label.includes('vaisakhi')) return 'Vaisakhi da mela! Celebrating harvest and the Khalsa.';
  if (label.includes('shogatsu')) return 'Akemashite Omedetou Gozaimasu! Happy New Year!';
  if (label.includes('obon')) return 'Honoring ancestors and the cycle of life.';
  if (label.includes('spring equinox')) return 'Celebrating the balance of light and the renewal of spring.';
  if (label.includes('summer solstice')) return 'Celebrating the longest day and the power of light.';
  if (label.includes('autumn equinox')) return 'Honoring the harvest and the balance of day and night.';
  if (label.includes('winter solstice')) return 'Celebrating the return of light in the darkest time.';
  if (label.includes('naw-rúz')) return 'Happy Naw-Rúz! Celebrating the Baháʼí New Year and spiritual renewal.';
  
  return 'Celebrating this special time of reflection and community.';
}

export default CelebrationController;
