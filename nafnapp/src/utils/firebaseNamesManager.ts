import { collection, doc, getDocs, setDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { NameData } from '../data/icelandicNames';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';
import { randomUUID } from 'expo-crypto';

// Define new types for our Firebase implementation
export type CoupleId = string;
export type UserId = string;
export type UserRole = 'partner1' | 'partner2';

export interface FirebaseNameData extends NameData {
  gender: 'female' | 'male' | 'unisex';
  liked: {
    partner1: boolean | null;
    partner2: boolean | null;
  };
}

export class FirebaseNamesManager {
  // Set up a couple pairing in Firebase
  static async createCouple(
    partner1Email: string, 
    partner1Password: string,
    coupleNickname: string
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
      });

      // Associate the user with this couple
      await setDoc(doc(db, 'users', userId), {
        userId,
        coupleId,
        role: 'partner1',
        email: partner1Email,
        createdAt: serverTimestamp(),
      });

      return { coupleId, userId, userRole: 'partner1' };
    } catch (error: any) {
      console.error('Error creating couple:', error);
      // Provide more specific error messages based on Firebase error codes
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
      const coupleDoc = await getDocs(query(
        collection(db, 'couples'),
        where('coupleId', '==', coupleId)
      ));
      
      if (coupleDoc.empty) {
        throw new Error('Invalid couple code. Please check and try again.');
      }
      
      const coupleData = coupleDoc.docs[0].data();
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
      await updateDoc(doc(db, 'couples', coupleId), {
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

  // Load names from Firebase or initialize with default data if empty
  static async loadNames(
    coupleId: CoupleId,
    defaultNames: NameData[]
  ): Promise<FirebaseNameData[]> {
    try {
      // Check if names already exist for this couple
      const namesSnapshot = await getDocs(
        query(collection(db, 'names'), where('coupleId', '==', coupleId))
      );
      
      if (!namesSnapshot.empty) {
        // Names exist, return them - make sure to include the document ID as the name ID
        return namesSnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            ...data, 
            id: doc.id  // Ensure the document ID is properly set as the name ID
          } as FirebaseNameData;
        });
      } else {
        // Initialize with default names
        const firebaseNames: FirebaseNameData[] = defaultNames.map(name => ({
          ...name,
          liked: {
            partner1: null,
            partner2: null
          }
        }));
        
        // Store each name as a separate document
        for (const name of firebaseNames) {
          await setDoc(doc(db, 'names', name.id), {
            ...name,
            coupleId,
            createdAt: serverTimestamp(),
          });
        }
        
        return firebaseNames;
      }
    } catch (error: any) {
      console.error('Error loading names:', error);
      return defaultNames.map(name => ({
        ...name,
        liked: {
          partner1: null,
          partner2: null
        }
      }));
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
      const nameRef = doc(db, 'names', nameId);
      
      // Create the update object based on which partner is voting
      const updateData = userRole === 'partner1'
        ? { 'liked.partner1': liked }
        : { 'liked.partner2': liked };
        
      await updateDoc(nameRef, updateData);
      console.log(`Updated name ${nameId} preference for ${userRole} to ${liked}`);
    } catch (error: any) {
      console.error('Error updating name preference:', error);
      throw new Error('Failed to save your preference: ' + (error.message || 'Unknown error'));
    }
  }

  // Get all names for a couple
  static async getAllNames(coupleId: CoupleId): Promise<FirebaseNameData[]> {
    try {
      const namesSnapshot = await getDocs(
        query(collection(db, 'names'), where('coupleId', '==', coupleId))
      );
      
      return namesSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          id: doc.id  // Include the document ID as the name ID
        } as FirebaseNameData;
      });
    } catch (error: any) {
      console.error('Error getting all names:', error);
      throw new Error('Failed to load names: ' + (error.message || 'Unknown error'));
    }
  }

  // Get names that both partners liked
  static getMatchedNames(names: FirebaseNameData[]): FirebaseNameData[] {
    return names.filter(name => 
      name.liked?.partner1 === true && name.liked?.partner2 === true
    );
  }

  // Get names that still need to be swiped by the current user
  static getNamesToSwipe(names: FirebaseNameData[], userRole: UserRole): FirebaseNameData[] {
    const field = userRole === 'partner1' ? 'partner1' : 'partner2';
    return names.filter(name => name.liked?.[field] === null);
  }

  // Get the current logged in user's information
  static async getCurrentUserInfo(): Promise<{
    userId: UserId | null;
    coupleId: CoupleId | null;
    userRole: UserRole | null;
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
      return {
        userId: user.uid,
        coupleId: userData.coupleId,
        userRole: userData.role as UserRole
      };
    } catch (error: any) {
      console.error('Error getting current user info:', error);
      return { userId: user.uid, coupleId: null, userRole: null };
    }
  }
}