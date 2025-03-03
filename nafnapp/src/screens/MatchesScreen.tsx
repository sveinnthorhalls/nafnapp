import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { OptimizedFirebaseNamesManager, NameWithPreference } from '../utils/optimizedFirebaseNamesManager';
import { auth } from '../config/firebase';

type MatchesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Matches'>;
  route: RouteProp<RootStackParamList, 'Matches'>;
};

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation, route }) => {
  const [matchedNames, setMatchedNames] = useState<NameWithPreference[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get coupleId from route params or try to get it from current user if not provided
  const { coupleId = null } = route.params || {};

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    
    try {
      let effectiveCoupleId = coupleId;
      
      // If coupleId is not provided in route params, try to get it from current user
      if (!effectiveCoupleId) {
        const userInfo = await OptimizedFirebaseNamesManager.getCurrentUserInfo();
        effectiveCoupleId = userInfo.coupleId;
      }
      
      if (!effectiveCoupleId) {
        console.error('No couple ID available');
        Alert.alert('Error', 'Could not determine your couple ID. Please try again later.');
        setLoading(false);
        return;
      }
      
      // Load all names with preferences for this couple
      const allNames = await OptimizedFirebaseNamesManager.getAllNamesWithPreferences(effectiveCoupleId);
      
      // Filter out only the matched names
      const matches = OptimizedFirebaseNamesManager.getMatchedNames(allNames);
      
      setMatchedNames(matches);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load your matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: NameWithPreference }) => (
    <View style={styles.matchItem}>
      <Text style={styles.matchName}>{item.name}</Text>
      {item.meaning && (
        <Text style={styles.matchMeaning}>{item.meaning}</Text>
      )}
      {item.gender && (
        <Text style={[
          styles.genderTag, 
          item.gender === 'female' ? styles.femaleTag : 
          item.gender === 'male' ? styles.maleTag : styles.unisexTag
        ]}>
          {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading your matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <Text style={styles.subtitle}>
        Names both you and your partner liked
      </Text>

      {matchedNames.length > 0 ? (
        <FlatList
          data={matchedNames}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet!</Text>
          <Text style={styles.emptySubtext}>
            Keep swiping to find names both of you like
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Swiping</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadMatches}
      >
        <Text style={styles.refreshButtonText}>Refresh Matches</Text>
      </TouchableOpacity>
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
  matchItem: {
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
  matchName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchMeaning: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
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
  backButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#3498db',
    fontSize: 14,
  }
});

export default MatchesScreen;