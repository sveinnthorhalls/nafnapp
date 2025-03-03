import { collection, doc, getDocs, setDoc, updateDoc, query, where, serverTimestamp, addDoc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { NameData, allIcelandicNames } from '../data/icelandicNames';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { randomUUID } from 'expo-crypto';

// Define types for our Firebase implementation
export type CoupleId = string;
export type UserId = string;
export type UserRole = 'partner1' | 'partner2';
export type Gender = 'female' | 'male' | 'unisex';

// Interface for names in the masterNames collection
export interface MasterNameData {
  id: string;
  name: string;
  gender: Gender;
  meaning?: string;
  origin?: string;
  popularity?: number;
}

// Interface for name preferences in the nameLikes collection
export interface NameLikeData {
  id?: string; // Firestore document ID
  nameId: string;
  coupleId: string; 
  partner1Like: boolean | null;
  partner2Like: boolean | null;
}

// Combined data for displaying to users (MasterName + preferences)
export interface NameWithPreference {
  id: string;
  name: string;
  gender: Gender;
  meaning?: string;
  partner1Like: boolean | null;
  partner2Like: boolean | null;
  nameLikeId?: string; // Reference to the nameLike document ID
}

export class OptimizedFirebaseNamesManager {
  // Set up a couple pairing in Firebase
  static async createCouple(
    partner1Email: string, 
    partner1Password: string,
    coupleNickname: string,
    preferredGender: Gender | 'both' = 'both'
  ): Promise<{ coupleId: CoupleId; userId: UserId; userRole: UserRole }> {
    try {
      // Create the first partner's account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        partner1Email, 
        partner1Password
      );
      const userId = userCredential.user.uid;
      
      // Generate a unique coupleId
      const coupleId = randomUUID();
      
      // Create a document in the couples collection
      await setDoc(doc(db, 'couples', coupleId), {
        coupleId,
        nickname: coupleNickname,
        partner1: userId,
        partner2: null, // Will be filled when partner 2 joins
        createdAt: serverTimestamp(),
        preferredGender
      });

      // Associate the user with this couple
      await setDoc(doc(db, 'users', userId), {
        userId,
        coupleId,
        role: 'partner1',
        email: partner1Email,
        createdAt: serverTimestamp(),
      });

      // Ensure master names are populated
      await this.ensureMasterNamesExist();

      return { coupleId, userId, userRole: 'partner1' };
    } catch (error: any) {
      console.error('Error creating couple:', error);
      // Provide specific error messages based on Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already in use. Please try another email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else {
        throw new Error('Failed to create couple: ' + (error.message || 'Unknown error'));
      }
    }
  }

  // Join an existing couple as the second partner
  static async joinCouple(
    partner2Email: string,
    partner2Password: string,
    coupleId: string
  ): Promise<{ userId: UserId; userRole: UserRole }> {
    try {
      // Check if the coupleId exists and doesn't already have a partner2
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleSnapshot = await getDoc(coupleRef);
      
      if (!coupleSnapshot.exists()) {
        throw new Error('Invalid couple code. Please check and try again.');
      }
      
      const coupleData = coupleSnapshot.data();
      if (coupleData.partner2) {
        throw new Error('This couple already has two partners. Cannot join.');
      }
      
      // Create the second partner's account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        partner2Email, 
        partner2Password
      );
      const userId = userCredential.user.uid;
      
      // Update the couple document with partner2's id
      await updateDoc(coupleRef, {
        partner2: userId,
      });

      // Associate the user with this couple
      await setDoc(doc(db, 'users', userId), {
        userId,
        coupleId,
        role: 'partner2',
        email: partner2Email,
        createdAt: serverTimestamp(),
      });

      return { userId, userRole: 'partner2' };
    } catch (error: any) {
      console.error('Error joining couple:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already in use. Please try another email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else {
        throw new Error(error.message || 'Failed to join couple');
      }
    }
  }

  // Login an existing user
  static async login(
    email: string,
    password: string
  ): Promise<{ userId: UserId; coupleId: CoupleId; userRole: UserRole }> {
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Get the user's couple info
      const userDoc = await getDocs(query(
        collection(db, 'users'), 
        where('userId', '==', userId)
      ));
      
      if (userDoc.empty) {
        throw new Error('User not associated with any couple');
      }
      
      const userData = userDoc.docs[0].data();
      return { 
        userId, 
        coupleId: userData.coupleId, 
        userRole: userData.role 
      };
    } catch (error: any) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to log in');
      }
    }
  }

  // Ensure the masterNames collection exists and is populated
  static async ensureMasterNamesExist(): Promise<void> {
    try {
      // Check if masterNames collection already has names
      const namesSnapshot = await getDocs(collection(db, 'masterNames'));
      
      if (!namesSnapshot.empty) {
        console.log('Master names collection already exists with', namesSnapshot.docs.length, 'names');
        return;
      }
      
      // Initialize with default names from our data file
      const batch = writeBatch(db);
      
      allIcelandicNames.forEach(name => {
        const nameRef = doc(db, 'masterNames', name.id);
        batch.set(nameRef, {
          id: name.id,
          name: name.name,
          gender: name.gender,
          meaning: name.meaning || null,
          createdAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Added', allIcelandicNames.length, 'names to master names collection');
    } catch (error) {
      console.error('Error ensuring master names exist:', error);
      throw error;
    }
  }

  // Get names to swipe for a specific couple and user role
  static async getNamesToSwipe(
    coupleId: CoupleId,
    userRole: UserRole,
    preferredGender: Gender | 'both' = 'both'
  ): Promise<NameWithPreference[]> {
    try {
      // 1. Get all name IDs this couple has already swiped on
      const alreadySwipedQuery = query(
        collection(db, 'nameLikes'), 
        where('coupleId', '==', coupleId)
      );
      const alreadySwipedSnapshot = await getDocs(alreadySwipedQuery);
      
      const swipedNameIds = new Set<string>();
      alreadySwipedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // If this user has already swiped on this name (not null)
        if (userRole === 'partner1' && data.partner1Like !== null) {
          swipedNameIds.add(data.nameId);
        }
        if (userRole === 'partner2' && data.partner2Like !== null) {
          swipedNameIds.add(data.nameId);
        }
      });
      
      // 2. Get all master names matching gender preference
      let masterNamesQuery;
      
      if (preferredGender === 'both') {
        masterNamesQuery = query(collection(db, 'masterNames'));
      } else {
        masterNamesQuery = query(
          collection(db, 'masterNames'),
          where('gender', '==', preferredGender)
        );
      }
      
      const masterNamesSnapshot = await getDocs(masterNamesQuery);
      
      // 3. Filter out names this user has already swiped on
      const namesToSwipe: NameWithPreference[] = [];
      
      masterNamesSnapshot.docs.forEach(doc => {
        const nameData = doc.data() as MasterNameData;
        
        // Skip if this name has already been swiped on by this user
        if (swipedNameIds.has(nameData.id)) {
          return;
        }
        
        // Add to names to swipe
        namesToSwipe.push({
          id: nameData.id,
          name: nameData.name,
          gender: nameData.gender as Gender,
          meaning: nameData.meaning,
          partner1Like: null,
          partner2Like: null
        });
      });
      
      return namesToSwipe;
    } catch (error) {
      console.error('Error getting names to swipe:', error);
      throw error;
    }
  }

  // Update a name preference
  static async updateNamePreference(
    nameId: string,
    liked: boolean,
    userRole: UserRole,
    coupleId: CoupleId
  ): Promise<void> {
    try {
      // Check if a nameLike document already exists for this name/couple
      const nameLikeQuery = query(
        collection(db, 'nameLikes'),
        where('nameId', '==', nameId),
        where('coupleId', '==', coupleId)
      );
      
      const nameLikeSnapshot = await getDocs(nameLikeQuery);
      
      if (nameLikeSnapshot.empty) {
        // No existing like document, create one
        const likeData: NameLikeData = {
          nameId,
          coupleId,
          partner1Like: userRole === 'partner1' ? liked : null,
          partner2Like: userRole === 'partner2' ? liked : null,
        };
        
        await addDoc(collection(db, 'nameLikes'), {
          ...likeData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Document exists, update it
        const nameLikeDoc = nameLikeSnapshot.docs[0];
        
        // Create the update object based on which partner is voting
        const updateData = userRole === 'partner1'
          ? { partner1Like: liked, updatedAt: serverTimestamp() }
          : { partner2Like: liked, updatedAt: serverTimestamp() };
          
        await updateDoc(nameLikeDoc.ref, updateData);
      }
      
      console.log(`Updated name ${nameId} preference for ${userRole} to ${liked}`);
    } catch (error: any) {
      console.error('Error updating name preference:', error);
      throw new Error('Failed to save your preference: ' + (error.message || 'Unknown error'));
    }
  }

  // Get all names with preferences for a couple
  static async getAllNamesWithPreferences(coupleId: CoupleId): Promise<NameWithPreference[]> {
    try {
      // 1. Get all the nameLikes for this couple
      const likesQuery = query(
        collection(db, 'nameLikes'),
        where('coupleId', '==', coupleId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      
      // Map to store preferences by nameId
      const preferencesByNameId = new Map<string, { 
        partner1Like: boolean | null; 
        partner2Like: boolean | null;
        nameLikeId: string;
      }>();
      
      // Populate the preferences map
      likesSnapshot.docs.forEach(doc => {
        const data = doc.data() as NameLikeData;
        preferencesByNameId.set(data.nameId, {
          partner1Like: data.partner1Like, 
          partner2Like: data.partner2Like,
          nameLikeId: doc.id
        });
      });
      
      // 2. Get all master names
      const masterNamesSnapshot = await getDocs(collection(db, 'masterNames'));
      
      // 3. Combine master names with preferences
      const namesWithPreferences: NameWithPreference[] = [];
      
      masterNamesSnapshot.docs.forEach(doc => {
        const nameData = doc.data() as MasterNameData;
        const preferences = preferencesByNameId.get(nameData.id);
        
        namesWithPreferences.push({
          id: nameData.id,
          name: nameData.name,
          gender: nameData.gender as Gender,
          meaning: nameData.meaning,
          partner1Like: preferences?.partner1Like ?? null,
          partner2Like: preferences?.partner2Like ?? null,
          nameLikeId: preferences?.nameLikeId
        });
      });
      
      return namesWithPreferences;
    } catch (error) {
      console.error('Error getting names with preferences:', error);
      throw error;
    }
  }

  // Get matched names (both partners liked)
  static getMatchedNames(namesWithPreferences: NameWithPreference[]): NameWithPreference[] {
    return namesWithPreferences.filter(name => 
      name.partner1Like === true && name.partner2Like === true
    );
  }

  // Get the current logged in user's information
  static async getCurrentUserInfo(): Promise<{
    userId: UserId | null;
    coupleId: CoupleId | null;
    userRole: UserRole | null;
    preferredGender?: Gender | 'both';
  }> {
    const user = auth.currentUser;
    
    if (!user) {
      return { userId: null, coupleId: null, userRole: null };
    }
    
    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('userId', '==', user.uid)
      ));
      
      if (userDoc.empty) {
        return { userId: user.uid, coupleId: null, userRole: null };
      }
      
      const userData = userDoc.docs[0].data();
      const coupleId = userData.coupleId;
      
      // Get couple details including gender preference
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      const coupleData = coupleDoc.data();
      
      return {
        userId: user.uid,
        coupleId: userData.coupleId,
        userRole: userData.role as UserRole,
        preferredGender: coupleData?.preferredGender || 'both'
      };
    } catch (error: any) {
      console.error('Error getting current user info:', error);
      return { userId: user.uid, coupleId: null, userRole: null };
    }
  }
  
  // Update a couple's preferred gender for baby names
  static async updatePreferredGender(
    coupleId: CoupleId, 
    preferredGender: Gender | 'both'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'couples', coupleId), {
        preferredGender,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating preferred gender:', error);
      throw error;
    }
  }
}