// src/services/bookStore.ts
// Book store CTA service for Ayla's literary recommendations - Gorstan Game Beta 1

import { BookstoreData, BookstoreCTA, validateBookstoreData } from '../data/lore/store.schema';
import bookstoreData from '../data/lore/store.json';

interface CTAInteraction {
  ctaId: string;
  timestamp: number;
  action: 'shown' | 'clicked' | 'dismissed' | 'snoozed';
}

interface CTAState {
  interactions: CTAInteraction[];
  totalBookDiscussions: number;
  lastBookDiscussion: number;
  userSnoozeUntil: number; // timestamp
  ctasEnabledByUser: boolean;
}

class BookStoreService {
  private storeData: BookstoreData;
  private state: CTAState;
  private initialized = false;

  constructor() {
    this.storeData = { version: '', lastUpdated: '', globalSettings: { maxCTAsPerDay: 0, defaultCooldownHours: 0, ctaEnabledByDefault: true }, ctas: [] };
    this.state = {
      interactions: [],
      totalBookDiscussions: 0,
      lastBookDiscussion: 0,
      userSnoozeUntil: 0,
      ctasEnabledByUser: true
    };
    this.initialize();
  }

  private initialize(): void {
    try {
      if (!validateBookstoreData(bookstoreData)) {
        console.warn('[BookStore] Invalid bookstore data structure');
        return;
      }

      this.storeData = bookstoreData as BookstoreData;
      this.state.ctasEnabledByUser = this.storeData.globalSettings.ctaEnabledByDefault;
      
      // Load state from localStorage if available
      this.loadState();
      
      this.initialized = true;
      console.log(`[BookStore] Initialized with ${this.storeData.ctas.length} CTAs`);
    } catch (error) {
      console.error('[BookStore] Failed to initialize:', error);
    }
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem('gorstan.bookstore.state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        this.state = { ...this.state, ...parsedState };
        
        // Clean old interactions (older than 7 days)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.state.interactions = this.state.interactions.filter(
          interaction => interaction.timestamp > weekAgo
        );
      }
    } catch (error) {
      console.warn('[BookStore] Failed to load state:', error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('gorstan.bookstore.state', JSON.stringify(this.state));
    } catch (error) {
      console.warn('[BookStore] Failed to save state:', error);
    }
  }

  /**
   * Record a book discussion interaction
   */
  recordBookDiscussion(): void {
    if (!this.initialized) return;
    
    this.state.totalBookDiscussions++;
    this.state.lastBookDiscussion = Date.now();
    this.saveState();
  }

  /**
   * Check if a CTA should be shown
   */
  shouldShowCTA(): { cta: BookstoreCTA; reason: string } | null {
    if (!this.initialized || !this.state.ctasEnabledByUser) {
      return null;
    }

    // Check if user is in snooze period
    if (Date.now() < this.state.userSnoozeUntil) {
      return null;
    }

    // Check daily limits
    const today = new Date().toDateString();
    const todayInteractions = this.state.interactions.filter(
      interaction => new Date(interaction.timestamp).toDateString() === today && 
                    interaction.action === 'shown'
    );

    if (todayInteractions.length >= this.storeData.globalSettings.maxCTAsPerDay) {
      return null;
    }

    // Find eligible CTAs
    const eligibleCTAs = this.storeData.ctas.filter(cta => this.isCTAEligible(cta));
    
    if (eligibleCTAs.length === 0) {
      return null;
    }

    // Weight by probability and select one
    const weightedCTAs = eligibleCTAs.map(cta => ({
      cta,
      weight: cta.trigger.probability * this.calculateBoostFactor(cta)
    }));

    // Randomly select based on weights
    const totalWeight = weightedCTAs.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedCTAs) {
      random -= item.weight;
      if (random <= 0) {
        return { 
          cta: item.cta, 
          reason: `Selected with probability ${item.weight.toFixed(3)}` 
        };
      }
    }

    return null;
  }

  private isCTAEligible(cta: BookstoreCTA): boolean {
    // Check minimum interactions
    if (this.state.totalBookDiscussions < cta.trigger.minInteractions) {
      return false;
    }

    // Check cooldown
    const lastShown = this.state.interactions
      .filter(interaction => interaction.ctaId === cta.id && interaction.action === 'shown')
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (lastShown) {
      const cooldownMs = cta.trigger.cooldownHours * 60 * 60 * 1000;
      if (Date.now() - lastShown.timestamp < cooldownMs) {
        return false;
      }
    }

    // Check daily/weekly limits
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const todayShown = this.state.interactions.filter(
      interaction => interaction.ctaId === cta.id && 
                    interaction.action === 'shown' &&
                    new Date(interaction.timestamp).toDateString() === today
    ).length;

    const weekShown = this.state.interactions.filter(
      interaction => interaction.ctaId === cta.id && 
                    interaction.action === 'shown' &&
                    interaction.timestamp > weekAgo.getTime()
    ).length;

    if (todayShown >= cta.restrictions.maxPerDay || weekShown >= cta.restrictions.maxPerWeek) {
      return false;
    }

    // Check time of day targeting if specified
    if (cta.targeting?.timeOfDay && cta.targeting.timeOfDay !== 'any') {
      const hour = now.getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      if (timeOfDay !== cta.targeting.timeOfDay) {
        return false;
      }
    }

    return true;
  }

  private calculateBoostFactor(cta: BookstoreCTA): number {
    // Base factor is 1.0
    let factor = 1.0;

    // Boost based on user engagement (more book discussions = higher chance)
    if (this.state.totalBookDiscussions > 10) {
      factor *= 1.2;
    } else if (this.state.totalBookDiscussions > 5) {
      factor *= 1.1;
    }

    // Slight boost for CTAs that haven't been shown recently
    const lastShown = this.state.interactions
      .filter(interaction => interaction.ctaId === cta.id && interaction.action === 'shown')
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastShown) {
      factor *= 1.3; // Never shown before
    } else {
      const daysSinceShown = (Date.now() - lastShown.timestamp) / (24 * 60 * 60 * 1000);
      if (daysSinceShown > 7) {
        factor *= 1.2;
      }
    }

    return factor;
  }

  /**
   * Record CTA interaction
   */
  recordCTAInteraction(ctaId: string, action: 'shown' | 'clicked' | 'dismissed' | 'snoozed'): void {
    if (!this.initialized) return;

    this.state.interactions.push({
      ctaId,
      timestamp: Date.now(),
      action
    });

    // If user snoozed, set snooze period (24 hours)
    if (action === 'snoozed') {
      this.state.userSnoozeUntil = Date.now() + (24 * 60 * 60 * 1000);
    }

    this.saveState();
  }

  /**
   * Set user CTA preferences
   */
  setUserPreferences(enabled: boolean): void {
    this.state.ctasEnabledByUser = enabled;
    this.saveState();
  }

  /**
   * Get user snooze status
   */
  getSnoozeStatus(): { snoozed: boolean; until?: Date } {
    const snoozed = Date.now() < this.state.userSnoozeUntil;
    return {
      snoozed,
      until: snoozed ? new Date(this.state.userSnoozeUntil) : undefined
    };
  }

  /**
   * Clear snooze (allow CTAs again)
   */
  clearSnooze(): void {
    this.state.userSnoozeUntil = 0;
    this.saveState();
  }

  /**
   * Get statistics for debugging/admin
   */
  getStats() {
    const recentInteractions = this.state.interactions.filter(
      interaction => Date.now() - interaction.timestamp < (7 * 24 * 60 * 60 * 1000)
    );

    return {
      initialized: this.initialized,
      totalBookDiscussions: this.state.totalBookDiscussions,
      ctasEnabled: this.state.ctasEnabledByUser,
      snoozeStatus: this.getSnoozeStatus(),
      recentInteractions: recentInteractions.length,
      totalCTAs: this.storeData.ctas.length,
      lastBookDiscussion: this.state.lastBookDiscussion ? new Date(this.state.lastBookDiscussion) : null
    };
  }

  /**
   * Reset all data (for testing/debugging)
   */
  reset(): void {
    this.state = {
      interactions: [],
      totalBookDiscussions: 0,
      lastBookDiscussion: 0,
      userSnoozeUntil: 0,
      ctasEnabledByUser: this.storeData.globalSettings.ctaEnabledByDefault
    };
    this.saveState();
  }
}

// Export singleton instance
export const bookStoreService = new BookStoreService();
export default bookStoreService;
