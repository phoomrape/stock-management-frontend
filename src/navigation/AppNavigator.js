import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

// ฟังก์ชันสำหรับแสดงไอคอนของแต่ละ tab
const getTabBarIcon = (routeName, focused, color, size) => {
  let iconName;
  
  switch (routeName) {
    case 'Dashboard':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Products':
      iconName = focused ? 'cube' : 'cube-outline';
      break;
    case 'Categories':
      iconName = focused ? 'list' : 'list-outline';
      break;
    case 'Reports':
      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
      break;
    default:
      iconName = 'help-circle-outline';
  }
  
  return <Ionicons name={iconName} size={size || 24} color={color || '#666'} />;
};

const AppNavigator = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log('🚪 Direct logout - starting...');
    try {
      await logout();
      console.log('✅ Logout successful!');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'หน้าหลัก',
          headerTitle: 'หน้าหลัก',
          tabBarIcon: ({ focused, color, size }) => getTabBarIcon('Dashboard', focused, color, size),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'สินค้า',
          headerTitle: 'จัดการสินค้า',
          tabBarIcon: ({ focused, color, size }) => getTabBarIcon('Products', focused, color, size),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'หมวดหมู่',
          headerTitle: 'จัดการหมวดหมู่',
          tabBarIcon: ({ focused, color, size }) => getTabBarIcon('Categories', focused, color, size),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'รายงาน',
          headerTitle: 'รายงานระบบ',
          tabBarIcon: ({ focused, color, size }) => getTabBarIcon('Reports', focused, color, size),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
