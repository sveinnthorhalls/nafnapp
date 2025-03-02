import AsyncStorage from '@react-native-async-storage/async-storage';
import { NameData } from '../data/icelandicNames';

// Keys for AsyncStorage
const NAMES_STORAGE_KEY = 'names_data';
const CURRENT_USER_KEY = 'current_user';

// User types
export type UserType = 'user1' | 'user2';

export class NamesManager {
  // Load names from storage or use default data if not available
  static async loadNames(defaultNames: NameData[]): Promise<NameData[]> {
    try {
      const storedNames = await AsyncStorage.getItem(NAMES_STORAGE_KEY);
      if (storedNames) {
        console.log('Loaded saved names:', JSON.parse(storedNames));
        return JSON.parse(storedNames);
      }
      console.log('Using default names:', defaultNames);
      // If no stored data, store the default names
      await AsyncStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(defaultNames));
      return defaultNames;
    } catch (error) {
      console.error('Error loading names:', error);
      return defaultNames;
    }
  }

  // Save updated names to storage
  static async saveNames(names: NameData[]): Promise<void> {
    try {
      await AsyncStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(names));
      console.log('Updated names:', names);
    } catch (error) {
      console.error('Error saving names:', error);
    }
  }

  // Update a name with user preference (like/dislike)
  static async updateNamePreference(
    nameId: string, 
    liked: boolean,
    names: NameData[],
    user: UserType
  ): Promise<NameData[]> {
    const updatedNames = names.map(name => {
      if (name.id === nameId) {
        // Ensure we have a valid liked object
        const updatedLiked = name.liked ? { ...name.liked } : { user1: null, user2: null };
        
        // Type-safe update of the user preference
        if (user === 'user1') {
          updatedLiked.user1 = liked;
        } else {
          updatedLiked.user2 = liked;
        }
        
        return {
          ...name,
          liked: updatedLiked
        } as NameData;
      }
      return name;
    });
    
    try {
      await AsyncStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(updatedNames));
      console.log('Updated names:', updatedNames);
    } catch (error) {
      console.error('Error updating names:', error);
    }

    return updatedNames;
  }

  // Get names that both users liked
  static getMatchedNames(names: NameData[]): NameData[] {
    return names.filter(name => 
      name.liked?.user1 === true && name.liked?.user2 === true
    );
  }

  // Get names that still need to be swiped by the current user
  static getNamesToSwipe(names: NameData[], user: UserType): NameData[] {
    const namesToSwipe = names.filter(name => name.liked?.[user] === null);
    console.log('Names to swipe for', user, ':', namesToSwipe);
    return namesToSwipe;
  }

  // Set the current active user
  static async setCurrentUser(user: UserType): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, user);
      console.log('Set current user:', user);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  // Get the current active user
  static async getCurrentUser(): Promise<UserType> {
    try {
      const user = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (user) {
        console.log('Loaded current user:', user);
        return (user as UserType);
      }
      console.log('Using default user: user1');
      return 'user1'; // Default to user1
    } catch (error) {
      console.error('Error getting current user:', error);
      return 'user1'; // Default to user1
    }
  }
}