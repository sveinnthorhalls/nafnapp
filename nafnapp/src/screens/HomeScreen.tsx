import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import NameCard from '../components/NameCard';
import { FirebaseNamesManager, UserRole, NameData, FirebaseNameData } from '../utils/firebaseNamesManager';
import { auth } from '../config/firebase';

// Define the type for the navigation prop
interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [namesToSwipe, setNamesToSwipe] = useState<FirebaseNameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    userId: string | null;
    coupleId: string | null;
    userRole: UserRole | null;
  }>({ 
    userId: null, 
    coupleId: null, 
    userRole: null
  });
  
  // Load initial data
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  // Check if user is authenticated, if not redirect to login
  const checkAuthAndLoadData = async () => {
    setLoading(true);
    
    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      // Not logged in, redirect to login screen
      navigation.replace('Login');
      return;
    }
    
    try {
      // Get the user's info (which couple they belong to, what role they have)
      const userInfo = await FirebaseNamesManager.getCurrentUserInfo();
      setUserInfo(userInfo);
      
      if (userInfo.coupleId && userInfo.userRole) {
        // Get all names for the couple
        const allNames = await FirebaseNamesManager.getAllNames(userInfo.coupleId);
        // Get names that need swiping for current user
        const namesToSwipe = FirebaseNamesManager.getNamesToSwipe(
          allNames,
          userInfo.userRole
        );
        
        setNamesToSwipe(namesToSwipe);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle swiping left (dislike)
  const handleSwipeLeft = async () => {
    if (namesToSwipe.length === 0 || !userInfo.coupleId || !userInfo.userRole) return;
    
    const nameId = namesToSwipe[0].id;
    try {
      // Update the name preference in Firebase
      await FirebaseNamesManager.updateNamePreference(
        nameId,
        false, // disliked
        userInfo.userRole,
        userInfo.coupleId
      );
      
      // Remove this name from the local list
      setNamesToSwipe(namesToSwipe.slice(1));
    } catch (error) {
      console.error('Error updating name preference:', error);
      Alert.alert('Error', 'Failed to save your preference. Please try again.');
    }
  };

  // Handle swiping right (like)
  const handleSwipeRight = async () => {
    if (namesToSwipe.length === 0 || !userInfo.coupleId || !userInfo.userRole) return;
    
    const nameId = namesToSwipe[0].id;
    const currentName = namesToSwipe[0];
    try {
      // Update the name preference in Firebase
      await FirebaseNamesManager.updateNamePreference(
        nameId,
        true, // liked
        userInfo.userRole,
        userInfo.coupleId
      );
      
      // Remove this name from the local list
      setNamesToSwipe(namesToSwipe.slice(1));

      // Check if this created a new match
      if (userInfo.userRole === 'partner1' && currentName.liked.partner2 === true ||
          userInfo.userRole === 'partner2' && currentName.liked.partner1 === true) {
        // This name is a match! Both partners liked it
        Alert.alert(
          '🎉 It\'s a Match! 🎉',
          `You and your partner both liked the name ${currentName.name}!`,
          [
            { text: 'View All Matches', onPress: viewMatches },
            { text: 'Continue Swiping', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating name preference:', error);
      Alert.alert('Error', 'Failed to save your preference. Please try again.');
    }
  };

  // Navigate to matches screen
  const viewMatches = () => {
    navigation.navigate('Matches', { coupleId: userInfo.coupleId });
  };

  // Navigate to personal likes screen
  const viewPersonalLikes = () => {
    navigation.navigate('PersonalLikes');
  };

  // Navigate to settings screen
  const openSettings = () => {
    navigation.navigate('Settings');
  };

  // Sign out the current user
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Get the current user role as a readable string
  const getRoleDisplay = () => {
    if (!userInfo.userRole) return '';
    return userInfo.userRole === 'partner1' ? 'Partner 1' : 'Partner 2';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Name Swiper</Text>
        <Text style={styles.userText}>
          You are logged in as: {getRoleDisplay()}
        </Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={openSettings}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContainer}>
        {namesToSwipe.length > 0 ? (
          <NameCard
            name={namesToSwipe[0]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        ) : (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>No more names to swipe!</Text>
            <Text style={styles.emptySubtext}>
              Check back later - your partner might still be swiping!
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.matchButton]} 
          onPress={viewMatches}
        >
          <Text style={styles.buttonText}>View Matches</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.personalLikesButton]} 
          onPress={viewPersonalLikes}
        >
          <Text style={styles.buttonText}>My Likes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSignOut}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userText: {
    fontSize: 16,
    color: '#666',
  },
  settingsButton: {
    position: 'absolute',
    top: 5,
    right: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  settingsButtonText: {
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    padding: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
  },
  matchButton: {
    backgroundColor: '#2ecc71',
  },
  personalLikesButton: {
    backgroundColor: '#9b59b6',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;