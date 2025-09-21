import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    try {
      await login(username.trim(), password);
      // Navigation จะถูกจัดการโดย App.js เมื่อสถานะ authentication เปลี่ยน
    } catch (error) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.message);
    }
  };

  const handleQuickLogin = (role) => {
    switch (role) {
      case 'admin':
        setUsername('admin');
        setPassword('admin123');
        break;
      case 'manager':
        setUsername('manager');
        setPassword('manager123');
        break;
      case 'staff':
        setUsername('staff');
        setPassword('staff123');
        break;
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={60} color="white" />
          </View>
          <Text style={styles.logoText}>Stock Store</Text>
          <Text style={styles.subTitle}>ระบบจัดการคลังสินค้า</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>เข้าสู่ระบบ</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ชื่อผู้ใช้หรืออีเมล"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="รหัสผ่าน"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>หรือ</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.quickLoginTitle}>เข้าสู่ระบบด่วน:</Text>
          <View style={styles.quickLoginContainer}>
            <TouchableOpacity
              style={[styles.quickLoginButton, styles.adminButton]}
              onPress={() => handleQuickLogin('admin')}
            >
              <Ionicons name="shield" size={16} color="white" />
              <Text style={styles.quickLoginText}>Admin</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickLoginButton, styles.managerButton]}
              onPress={() => handleQuickLogin('manager')}
            >
              <Ionicons name="briefcase" size={16} color="white" />
              <Text style={styles.quickLoginText}>Manager</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickLoginButton, styles.staffButton]}
              onPress={() => handleQuickLogin('staff')}
            >
              <Ionicons name="person" size={16} color="white" />
              <Text style={styles.quickLoginText}>Staff</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  quickLoginTitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  quickLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickLoginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 5,
  },
  adminButton: {
    backgroundColor: '#dc3545',
  },
  managerButton: {
    backgroundColor: '#fd7e14',
  },
  staffButton: {
    backgroundColor: '#198754',
  },
  quickLoginText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoginScreen;