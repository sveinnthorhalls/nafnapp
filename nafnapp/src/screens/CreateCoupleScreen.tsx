import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { OptimizedFirebaseNamesManager, Gender } from '../utils/optimizedFirebaseNamesManager';
import { Picker } from '@react-native-picker/picker';

type CreateCoupleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateCouple'>;
};

const CreateCoupleScreen: React.FC<CreateCoupleScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [preferredGender, setPreferredGender] = useState<Gender | 'both'>('both');
  const [loading, setLoading] = useState(false);

  // Handle couple creation
  const handleCreateCouple = async () => {
    // Validate inputs
    if (!email || !password || !confirmPassword || !coupleName) {
      Alert.alert('Missing Information', 'Please fill all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Error', 'Password must be at least 6 characters long.');
      return;
    }

    // Create the couple
    setLoading(true);
    try {
      await OptimizedFirebaseNamesManager.createCouple(
        email, 
        password, 
        coupleName,
        preferredGender
      );
      Alert.alert(
        'Account Created', 
        'Your couple account has been created successfully! Share your couple code with your partner.',
        [{ text: 'Continue', onPress: () => navigation.replace('Home') }]
      );
    } catch (error: any) {
      console.error('Create couple error:', error);
      Alert.alert('Account Creation Failed', error.message || 'Failed to create couple. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Couple Account</Text>
            <Text style={styles.subtitle}>Start your shared name journey</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Your Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Couple Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 'Sarah & John'"
              value={coupleName}
              onChangeText={setCoupleName}
            />

            <Text style={styles.label}>Preferred Baby Names</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferredGender}
                onValueChange={(itemValue) => setPreferredGender(itemValue as Gender | 'both')}
                style={styles.picker}
              >
                <Picker.Item label="Both" value="both" />
                <Picker.Item label="Female Names" value="female" />
                <Picker.Item label="Male Names" value="male" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateCouple}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Couple Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              After creating an account, you'll receive a couple code to share with your partner.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    height: 50,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
  },
  infoText: {
    color: '#777',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CreateCoupleScreen;