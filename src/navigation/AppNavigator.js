import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import UpdateCategoryScreen from '../screens/UpdateCategoryScreen';
import DeleteCategoryScreen from '../screens/DeleteCategoryScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const screenOptions = {
    headerStyle: {
      backgroundColor: '#4F46E5',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitleVisible: false, // ซ่อนข้อความย้อนกลับ
    // ปรับการตั้กค่าเพื่อลด aria-hidden issue
    animationEnabled: true,
    gestureEnabled: true,
    presentation: 'card', // ใช้ card แทน modal
    // เพิ่มการตั้งค่า accessibility ที่ดีกว่า
    headerAccessibilityLabel: 'หัวข้อหน้า',
    // แก้ไข accessibility สำหรับ web
    ...(Platform.OS === 'web' && {
      cardStyle: { backgroundColor: 'transparent' },
      cardOverlayEnabled: false,
    }),
  };

  return (
    <NavigationContainer
      // เพิ่ม linking configuration สำหรับ web
      linking={Platform.OS === 'web' ? {
        prefixes: ['http://localhost:8081'],
        config: {
          screens: {
            Home: '/',
            Categories: '/categories',
            AddCategory: '/add-category',
            UpdateCategory: '/update-category',
            DeleteCategory: '/delete-category',
          },
        },
      } : undefined}
      // ลบ screenOptions ที่อาจทำให้เกิด aria-hidden conflict
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'หน้าหลัก',
            headerLeft: () => null, // ไม่แสดงปุ่มย้อนกลับในหน้าหลัก
          }}
        />
        <Stack.Screen 
          name="Categories" 
          component={CategoriesScreen} 
          options={{ 
            title: 'หมวดหมู่สินค้า',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="AddCategory" 
          component={AddCategoryScreen} 
          options={{ 
            title: 'เพิ่มหมวดหมู่',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="UpdateCategory" 
          component={UpdateCategoryScreen} 
          options={{ 
            title: 'แก้ไขหมวดหมู่',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="DeleteCategory" 
          component={DeleteCategoryScreen} 
          options={{ 
            title: 'ลบหมวดหมู่',
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
