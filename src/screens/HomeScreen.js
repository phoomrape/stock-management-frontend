import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  const menuItems = [
    {
      title: 'ดูหมวดหมู่',
      subtitle: 'ดูรายการหมวดหมู่สินค้าทั้งหมด',
      icon: '📋',
      color: ['#667eea', '#764ba2'],
      screen: 'Categories',
    },
    {
      title: 'เพิ่มหมวดหมู่',
      subtitle: 'เพิ่มหมวดหมู่สินค้าใหม่',
      icon: '➕',
      color: ['#f093fb', '#f5576c'],
      screen: 'AddCategory',
    },
    {
      title: 'ลบหมวดหมู่',
      subtitle: 'ลบหมวดหมู่สินค้าที่ไม่ต้องการ',
      icon: '🗑️',
      color: ['#ff9a9e', '#fecfef'],
      screen: 'DeleteCategory',
    },
  ];

  const handleMenuPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.headerSection}
        >
          <Text style={styles.welcomeText}>ยินดีต้อนรับสู่</Text>
          <Text style={styles.appTitle}>ระบบจัดการสต็อก</Text>
          <Text style={styles.headerSubtitle}>
            จัดการหมวดหมู่สินค้าของคุณได้อย่างง่ายดาย
          </Text>
        </LinearGradient>

        {/* Menu Cards Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>เมนูหลัก</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => handleMenuPress(item.screen)}
              accessible={true}
              accessibilityLabel={`${item.title}: ${item.subtitle}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={item.color}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>คุณสมบัติ</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📋</Text>
              <Text style={styles.featureText}>ดูรายการหมวดหมู่ทั้งหมด</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>➕</Text>
              <Text style={styles.featureText}>เพิ่มหมวดหมู่ใหม่</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✏️</Text>
              <Text style={styles.featureText}>แก้ไขข้อมูลหมวดหมู่</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🗑️</Text>
              <Text style={styles.featureText}>ลบหมวดหมู่ที่ไม่ต้องการ</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  headerSection: {
    padding: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 24,
  },
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  menuCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 5,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    borderRadius: 15,
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#F1F5F9',
    lineHeight: 20,
  },
  arrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  featuresSection: {
    padding: 20,
    paddingTop: 10,
  },
  featuresList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    boxShadow: '0px 1px 2.22px rgba(0, 0, 0, 0.22)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});

export default HomeScreen;