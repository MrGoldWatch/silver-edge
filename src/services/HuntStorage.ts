import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hunt, HuntEditHistory, HuntHelpers } from '../types/Hunt';
import { HuntMigration } from '../utils/HuntMigration';

const HUNTS_STORAGE_KEY = '@SilverEdge:hunts';
const EDIT_HISTORY_STORAGE_KEY = '@SilverEdge:editHistory';

export class HuntStorage {
  /**
   * Save a new hunt to storage
   */
  static async saveHunt(hunt: Hunt): Promise<void> {
    try {
      const existingHunts = await this.getAllHunts();
      const updatedHunts = [hunt, ...existingHunts];
      await AsyncStorage.setItem(HUNTS_STORAGE_KEY, JSON.stringify(updatedHunts));
    } catch (error) {
      console.error('Error saving hunt:', error);
      throw new Error('Failed to save hunt');
    }
  }

  /**
   * Get all hunts from storage
   */
  static async getAllHunts(): Promise<Hunt[]> {
    try {
      const huntsJson = await AsyncStorage.getItem(HUNTS_STORAGE_KEY);
      if (!huntsJson) {
        return [];
      }
      const rawHunts = JSON.parse(huntsJson);
      // Migrate any legacy hunts to new format
      const migratedHunts = HuntMigration.migrateHunts(rawHunts);

      // Save migrated data back to storage if any migration occurred
      const needsMigration = rawHunts.some((hunt: any) => HuntMigration.isLegacyHunt(hunt));
      if (needsMigration) {
        await AsyncStorage.setItem(HUNTS_STORAGE_KEY, JSON.stringify(migratedHunts));
        console.log('Migrated legacy hunts to new format');
      }

      return migratedHunts;
    } catch (error) {
      console.error('Error loading hunts:', error);
      return [];
    }
  }

  /**
   * Get hunts from this week
   */
  static async getHuntsThisWeek(): Promise<Hunt[]> {
    try {
      const allHunts = await this.getAllHunts();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return allHunts.filter(hunt => {
        const huntDate = new Date(hunt.date);
        return huntDate >= oneWeekAgo;
      });
    } catch (error) {
      console.error('Error loading weekly hunts:', error);
      return [];
    }
  }

  /**
   * Delete a hunt by ID
   */
  static async deleteHunt(huntId: string): Promise<void> {
    try {
      const existingHunts = await this.getAllHunts();
      const updatedHunts = existingHunts.filter(hunt => hunt.id !== huntId);
      await AsyncStorage.setItem(HUNTS_STORAGE_KEY, JSON.stringify(updatedHunts));
    } catch (error) {
      console.error('Error deleting hunt:', error);
      throw new Error('Failed to delete hunt');
    }
  }

  /**
   * Update an existing hunt
   */
  static async updateHunt(updatedHunt: Hunt): Promise<void> {
    try {
      const existingHunts = await this.getAllHunts();
      const huntIndex = existingHunts.findIndex(hunt => hunt.id === updatedHunt.id);

      if (huntIndex === -1) {
        throw new Error('Hunt not found');
      }

      // Update the hunt with timestamp
      updatedHunt.lastUpdated = new Date().toISOString();
      existingHunts[huntIndex] = updatedHunt;

      await AsyncStorage.setItem(HUNTS_STORAGE_KEY, JSON.stringify(existingHunts));
    } catch (error) {
      console.error('Error updating hunt:', error);
      throw new Error('Failed to update hunt');
    }
  }

  /**
   * Update silver count for a hunt and track the change
   */
  static async updateSilverCount(
    huntId: string,
    newSilverCount: number,
    processingNotes?: string
  ): Promise<void> {
    try {
      const existingHunts = await this.getAllHunts();
      const huntIndex = existingHunts.findIndex(hunt => hunt.id === huntId);

      if (huntIndex === -1) {
        throw new Error('Hunt not found');
      }

      const hunt = existingHunts[huntIndex];
      const previousSilverCount = hunt.silverCoinsFound;

      // Create edit history entry
      const editHistory: HuntEditHistory = {
        huntId,
        editDate: new Date().toISOString(),
        previousSilverCount,
        newSilverCount,
        editNotes: processingNotes,
      };

      // Update hunt
      hunt.silverCoinsFound = newSilverCount;
      hunt.isProcessed = true;
      hunt.lastUpdated = new Date().toISOString();
      if (processingNotes) {
        hunt.processingNotes = processingNotes;
      }

      existingHunts[huntIndex] = hunt;

      // Save updated hunts and edit history
      await AsyncStorage.setItem(HUNTS_STORAGE_KEY, JSON.stringify(existingHunts));
      await this.saveEditHistory(editHistory);
    } catch (error) {
      console.error('Error updating silver count:', error);
      throw new Error('Failed to update silver count');
    }
  }

  /**
   * Get hunt by ID
   */
  static async getHuntById(huntId: string): Promise<Hunt | null> {
    try {
      const hunts = await this.getAllHunts();
      return hunts.find(hunt => hunt.id === huntId) || null;
    } catch (error) {
      console.error('Error getting hunt by ID:', error);
      return null;
    }
  }

  /**
   * Save edit history
   */
  private static async saveEditHistory(editHistory: HuntEditHistory): Promise<void> {
    try {
      const existingHistory = await this.getEditHistory();
      const updatedHistory = [editHistory, ...existingHistory];
      await AsyncStorage.setItem(EDIT_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving edit history:', error);
    }
  }

  /**
   * Get edit history
   */
  static async getEditHistory(): Promise<HuntEditHistory[]> {
    try {
      const historyJson = await AsyncStorage.getItem(EDIT_HISTORY_STORAGE_KEY);
      if (!historyJson) {
        return [];
      }
      return JSON.parse(historyJson) as HuntEditHistory[];
    } catch (error) {
      console.error('Error loading edit history:', error);
      return [];
    }
  }

  /**
   * Get edit history for a specific hunt
   */
  static async getHuntEditHistory(huntId: string): Promise<HuntEditHistory[]> {
    try {
      const allHistory = await this.getEditHistory();
      return allHistory.filter(entry => entry.huntId === huntId);
    } catch (error) {
      console.error('Error loading hunt edit history:', error);
      return [];
    }
  }

  /**
   * Clear all hunts (for testing/reset)
   */
  static async clearAllHunts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HUNTS_STORAGE_KEY);
      await AsyncStorage.removeItem(EDIT_HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing hunts:', error);
      throw new Error('Failed to clear hunts');
    }
  }
}