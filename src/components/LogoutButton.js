import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log('🚪 Direct logout - starting process...');
    
    try {
      console.log('📞 Calling logout()...');
      await logout();
      console.log('✅ Logout completed successfully!');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleLogout}
      style={{ marginRight: 10 }}
    >
      <Text style={{ color: '#007AFF', fontSize: 16 }}>
        ออกจากระบบ
      </Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;