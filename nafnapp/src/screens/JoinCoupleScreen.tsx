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
import { OptimizedFirebaseNamesManager } from '../utils/optimizedFirebaseNamesManager';

type JoinCoupleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JoinCouple'>;
};

const JoinCoupleScreen: React.FC<JoinCoupleScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [coupleCode, setCoupleCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle joining a couple
  const handleJoinCouple = async () => {
    // Validate inputs
    if (!email || !password || !confirmPassword || !coupleCode) {
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

    // Join the couple
    setLoading(true);
    try {
      await OptimizedFirebaseNamesManager.joinCouple(
        email,
        password,
        coupleCode
      );
      
      Alert.alert(
        'Joined Successfully', 
        'You have successfully joined your partner\'s couple account!',
        [{ text: 'Continue', onPress: () => navigation.replace('Home') }]
      );
    } catch (error: any) {
      console.error('Join couple error:', error);
      Alert.alert('Failed to Join', error.message || 'Failed to join couple. Please check your code and try again.');
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
            <Text style={styles.title}>Join Your Partner</Text>
            <Text style={styles.subtitle}>Connect to your partner's account</Text>
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

            <Text style={styles.label}>Create a Password</Text>
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

            <Text style={styles.label}>Couple Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the code from your partner"
              value={coupleCode}
              onChangeText={setCoupleCode}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleJoinCouple}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Join Couple</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Ask your partner to share their couple code with you. This code is available in their account settings after they create a couple account.
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

export default JoinCoupleScreen;