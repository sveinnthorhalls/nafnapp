import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { OptimizedFirebaseNamesManager, Gender } from '../utils/optimizedFirebaseNamesManager';
import { Picker } from '@react-native-picker/picker';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [nameOrder, setNameOrder] = useState<'alphabetical' | 'random'>('random');
  const [genderPreference, setGenderPreference] = useState<Gender | 'both'>('both');
  const [coupleId, setCoupleId] = useState<string | null>(null);

  // Load current settings when component mounts
  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    setLoading(true);
    try {
      const userInfo = await OptimizedFirebaseNamesManager.getCurrentUserInfo();
      
      if (!userInfo.coupleId) {
        Alert.alert('Error', 'Could not retrieve your couple information.');
        navigation.goBack();
        return;
      }
      
      setCoupleId(userInfo.coupleId);
      
      // Get couple settings
      const coupleSettings = await OptimizedFirebaseNamesManager.getCoupleSettings(userInfo.coupleId);
      
      // Set state based on retrieved settings
      setNameOrder(coupleSettings.nameOrder || 'random');
      setGenderPreference(coupleSettings.preferredGender || 'both');
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load your settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!coupleId) return;
    
    setLoading(true);
    try {
      // Save both settings
      await OptimizedFirebaseNamesManager.updateCoupleSettings(coupleId, {
        nameOrder,
        preferredGender: genderPreference
      });
      
      Alert.alert(
        'Settings Saved',
        'Your preferences have been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
        
        <View style={styles.settingsContainer}>
          {/* Name Order Setting */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Name Order</Text>
            <Text style={styles.sectionDescription}>
              Choose how names will be presented during swiping
            </Text>
            
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  nameOrder === 'alphabetical' && styles.optionButtonSelected
                ]}
                onPress={() => setNameOrder('alphabetical')}
              >
                <Text
                  style={[
                    styles.optionText,
                    nameOrder === 'alphabetical' && styles.optionTextSelected
                  ]}
                >
                  Alphabetical
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  nameOrder === 'random' && styles.optionButtonSelected
                ]}
                onPress={() => setNameOrder('random')}
              >
                <Text
                  style={[
                    styles.optionText,
                    nameOrder === 'random' && styles.optionTextSelected
                  ]}
                >
                  Random
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Gender Preference Setting */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Name Gender</Text>
            <Text style={styles.sectionDescription}>
              Choose which types of names you want to see
            </Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={genderPreference}
                onValueChange={(value) => setGenderPreference(value as Gender | 'both')}
                style={styles.picker}
              >
                <Picker.Item label="All Names" value="both" />
                <Picker.Item label="Female Names Only" value="female" />
                <Picker.Item label="Unisex Names Only" value="unisex" />
              </Picker>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40, // To balance out the back button space
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  optionText: {
    fontSize: 16,
    color: '#555',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;