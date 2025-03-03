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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { OptimizedFirebaseNamesManager } from '../utils/optimizedFirebaseNamesManager';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle login with existing account
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await OptimizedFirebaseNamesManager.login(email, password);
      navigation.replace('Home');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to create couple screen
  const navigateToCreateCouple = () => {
    navigation.navigate('CreateCouple');
  };

  // Navigate to join couple screen
  const navigateToJoinCouple = () => {
    navigation.navigate('JoinCouple');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Name Swiper</Text>
          <Text style={styles.subtitle}>Find the perfect name together</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={navigateToCreateCouple}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Create New Couple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={navigateToJoinCouple}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Join Existing Couple
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
  },
  subtitle: {
    fontSize: 18,
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
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#777',
    paddingHorizontal: 10,
  },
  optionsContainer: {
    gap: 15,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  secondaryButtonText: {
    color: '#3498db',
  },
});

export default LoginScreen;