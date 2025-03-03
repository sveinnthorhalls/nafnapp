import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { FirebaseNamesManager, FirebaseNameData, UserRole } from '../utils/firebaseNamesManager';
import { auth } from '../config/firebase';

type PersonalLikesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PersonalLikes'>;
  route: RouteProp<RootStackParamList, 'PersonalLikes'>;
};

const PersonalLikesScreen: React.FC<PersonalLikesScreenProps> = ({ navigation }) => {
  const [likedNames, setLikedNames] = useState<FirebaseNameData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalLikes();
  }, []);

  const loadPersonalLikes = async () => {
    setLoading(true);
    
    try {
      // Get current user info
      const userInfo = await FirebaseNamesManager.getCurrentUserInfo();
      
      if (!userInfo.coupleId || !userInfo.userRole) {
        Alert.alert('Error', 'Could not retrieve your user information.');
        navigation.goBack();
        return;
      }
      
      // Load personal likes for the current user
      const allNames = await FirebaseNamesManager.getAllNames(userInfo.coupleId);
      const personalLikes = allNames.filter(name => name.liked?.[userInfo.userRole as keyof typeof name.liked] === true);
      
      console.log(`Found ${personalLikes.length} liked names for ${userInfo.userRole}`);
      setLikedNames(personalLikes);
    } catch (error) {
      console.error('Error loading personal likes:', error);
      Alert.alert('Error', 'Failed to load your liked names. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: FirebaseNameData }) => (
    <View style={styles.nameItem}>
      <Text style={styles.nameText}>{item.name}</Text>
      {item.gender && (
        <Text style={[
          styles.genderTag, 
          item.gender === 'female' ? styles.femaleTag : 
          item.gender === 'male' ? styles.maleTag : styles.unisexTag
        ]}>
          {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
        </Text>
      )}
      
      {/* Show if partner also likes this name */}
      {(item.liked?.partner1 === true && item.liked?.partner2 === true) && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>Match! Your partner also likes this name</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading your liked names...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Names You Like</Text>
      <Text style={styles.subtitle}>All the names you've swiped right on</Text>
      {likedNames.length > 0 ? (
        <FlatList
          data={likedNames}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't liked any names yet!</Text>
          <Text style={styles.emptySubtext}>
            Start swiping to add names to your liked list
          </Text>
        </View>
      )}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Swiping</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={loadPersonalLikes}
        >
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  nameItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  genderTag: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginTop: 5,
  },
  femaleTag: {
    backgroundColor: '#ffcce6',
    color: '#cc0066',
  },
  maleTag: {
    backgroundColor: '#cce6ff',
    color: '#0066cc',
  },
  unisexTag: {
    backgroundColor: '#e6e6e6',
    color: '#666666',
  },
  matchBadge: {
    marginTop: 10,
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 5,
  },
  matchText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  refreshButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalLikesScreen;