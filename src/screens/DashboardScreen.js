import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      
      // ใช้ API statistics ที่มีอยู่แล้ว
      const [statisticsResponse, products] = await Promise.all([
        ApiService.getStatistics(),
        ApiService.getProducts()
      ]);

      console.log('📊 Statistics response:', statisticsResponse);
      console.log('🛒 Products loaded:', products.length);

      const stats = statisticsResponse.data || statisticsResponse;
      
      // คำนวณ activeProducts จาก statusStats
      const activeProducts = stats.statusStats?.find(s => s._id === 'active')?.count || 0;
      
      console.log('✅ Active products calculated:', activeProducts);
      console.log('📋 Status stats:', stats.statusStats);

      setStats({
        totalCategories: stats.totalCategories || 0,
        totalProducts: stats.totalProducts || 0, 
        activeProducts: activeProducts,
        lowStockProducts: stats.lowStockProducts || 0,
        totalValue: stats.totalValue || 0,
        categories: stats.categoryStats || [],
        recentProducts: products.slice(0, 5) // ล่าสุด 5 รายการ
      });

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
      console.error('❌ Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <LinearGradient colors={color} style={styles.statGradient}>
        <View style={styles.statContent}>
          <View style={styles.statIcon}>
            <Ionicons name={icon} size={30} color="white" />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.role}>บทบาท: {user?.role}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color="#007AFF" />
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="หมวดหมู่"
          value={stats?.totalCategories || 0}
          icon="folder"
          color={['#667eea', '#764ba2']}
          onPress={() => navigation.navigate('Categories')}
        />
        <StatCard
          title="สินค้าทั้งหมด"
          value={stats?.totalProducts || 0}
          icon="cube"
          color={['#f093fb', '#f5576c']}
          onPress={() => navigation.navigate('Products')}
        />
        <StatCard
          title="สินค้าใช้งาน"
          value={stats?.activeProducts || 0}
          icon="checkmark-circle"
          color={['#4facfe', '#00f2fe']}
        />
        <StatCard
          title="สินค้าเหลือน้อย"
          value={stats?.lowStockProducts || 0}
          icon="warning"
          color={['#fa709a', '#fee140']}
        />
      </View>

      {/* Total Value */}
      <View style={styles.valueCard}>
        <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.valueGradient}>
          <Text style={styles.valueTitle}>มูลค่าสินค้าทั้งหมด</Text>
          <Text style={styles.valueAmount}>{formatPrice(stats?.totalValue || 0)}</Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>การดำเนินการด่วน</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="จัดการหมวดหมู่"
            icon="folder"
            color="#667eea"
            onPress={() => navigation.navigate('Categories')}
          />
          <QuickAction
            title="จัดการสินค้า"
            icon="cube"
            color="#f093fb"
            onPress={() => navigation.navigate('Products')}
          />
          <QuickAction
            title="เพิ่มสินค้า"
            icon="add-circle"
            color="#4facfe"
            onPress={() => navigation.navigate('Products', { addProduct: true })}
          />
          <QuickAction
            title="รายงาน"
            icon="bar-chart"
            color="#fa709a"
            onPress={() => Alert.alert('ข้อมูล', 'ฟีเจอร์รายงานจะพัฒนาในอนาคต')}
          />
        </View>
      </View>

      {/* Recent Products */}
      {stats?.recentProducts && stats.recentProducts.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>สินค้าล่าสุด</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            </TouchableOpacity>
          </View>
          {stats.recentProducts.map((product, index) => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productIcon}>
                <Ionicons name="cube" size={20} color="#007AFF" />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>
                  {product.category?.name || 'ไม่ระบุหมวดหมู่'}
                </Text>
              </View>
              <View style={styles.productPrice}>
                <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
                <Text style={[
                  styles.stockText,
                  product.stock <= 5 ? styles.lowStock : null
                ]}>
                  คงเหลือ {product.stock}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  role: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    width: '48%',
    height: 100,
  },
  statGradient: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginRight: 10,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  valueCard: {
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  valueGradient: {
    padding: 20,
    alignItems: 'center',
  },
  valueTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  quickActionsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickAction: {
    width: '47%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  recentContainer: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lowStock: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;