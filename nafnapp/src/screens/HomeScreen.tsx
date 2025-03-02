import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import NameCard from '../components/NameCard';
import { NamesManager, UserType } from '../utils/namesManager';
import { NameData, icelandicFemaleNames } from '../data/icelandicNames';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [names, setNames] = useState<NameData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>('user1');
  const [namesToSwipe, setNamesToSwipe] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load saved names or use default list
    const loadedNames = await NamesManager.loadNames(icelandicFemaleNames);
    setNames(loadedNames);
    
    // Get current user
    const user = await NamesManager.getCurrentUser();
    setCurrentUser(user);
    
    // Get names that need swiping for current user
    const namesToShow = NamesManager.getNamesToSwipe(loadedNames, user);
    setNamesToSwipe(namesToShow);
    
    setLoading(false);

    console.log('Loaded data:', { loadedNames, user, namesToShow });
  };

  const handleSwipeLeft = async () => {
    if (namesToSwipe.length === 0) return;
    
    const nameId = namesToSwipe[0].id;
    const updatedNames = await NamesManager.updateNamePreference(
      nameId,
      false, // disliked
      names,
      currentUser
    );
    
    setNames(updatedNames);
    setNamesToSwipe(namesToSwipe.slice(1));
    await loadData();

    console.log('Swiped left:', { nameId, updatedNames, remainingNames: namesToSwipe.slice(1) });
  };

  const handleSwipeRight = async () => {
    if (namesToSwipe.length === 0) return;
    
    const nameId = namesToSwipe[0].id;
    const updatedNames = await NamesManager.updateNamePreference(
      nameId,
      true, // liked
      names,
      currentUser
    );
    
    setNames(updatedNames);
    setNamesToSwipe(namesToSwipe.slice(1));
    await loadData();

    console.log('Swiped right:', { nameId, updatedNames, remainingNames: namesToSwipe.slice(1) });
  };

  const toggleUser = async () => {
    const newUser: UserType = currentUser === 'user1' ? 'user2' : 'user1';
    await NamesManager.setCurrentUser(newUser);
    setCurrentUser(newUser);
    
    // Update names to swipe for the new user
    const namesToShow = NamesManager.getNamesToSwipe(names, newUser);
    setNamesToSwipe(namesToShow);

    console.log('Toggled user:', { newUser, namesToShow });
  };

  const viewMatches = () => {
    navigation.navigate('Matches', { names });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log('Rendering HomeScreen:', { namesToSwipe, currentUser });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Name Swiper</Text>
        <Text style={styles.userText}>
          Current User: {currentUser === 'user1' ? 'You' : 'Your Partner'}
        </Text>
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
              Switch users or view your matches
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={toggleUser}>
          <Text style={styles.buttonText}>
            Switch to {currentUser === 'user1' ? 'Partner' : 'You'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.matchButton]} onPress={viewMatches}>
          <Text style={styles.buttonText}>View Matches</Text>
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 2,
  },
  matchButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;