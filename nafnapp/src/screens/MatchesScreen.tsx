import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NamesManager } from '../utils/namesManager';
import { NameData } from '../data/icelandicNames';

type MatchesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Matches'>;
  route: RouteProp<RootStackParamList, 'Matches'>;
};

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation, route }) => {
  const { names } = route.params;
  const [matchedNames, setMatchedNames] = useState<NameData[]>([]);

  useEffect(() => {
    // Get names that both users liked
    const matches = NamesManager.getMatchedNames(names);
    setMatchedNames(matches);
  }, [names]);

  const renderNameItem = ({ item }: { item: NameData }) => (
    <View style={styles.nameItem}>
      <Text style={styles.nameText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matched Names</Text>
      
      {matchedNames.length > 0 ? (
        <FlatList
          data={matchedNames}
          renderItem={renderNameItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet!</Text>
          <Text style={styles.emptySubtext}>
            Keep swiping to find names you both like.
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Swiping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    paddingVertical: 10,
  },
  nameItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '500',
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
    textAlign: 'center',
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
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchesScreen;