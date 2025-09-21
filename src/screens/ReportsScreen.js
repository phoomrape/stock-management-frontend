import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // สถิติข้อมูล
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    totalValue: 0
  });

  // ประวัติการอัพเดท
  const [updateHistory, setUpdateHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // ฟิลเตอร์
  const [selectedTimeRange, setSelectedTimeRange] = useState('week'); // week, month, year
  const [selectedAction, setSelectedAction] = useState('all'); // all, create, update, delete

  useEffect(() => {
    fetchReportsData();
  }, [selectedTimeRange, selectedAction]);

  // เพิ่มฟังก์ชันทดสอบสำหรับ debug
  const testAPIConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await fetch('http://localhost:5001/api/reports/statistics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ApiService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🧪 Direct API response:', response.status, response.ok);
      const data = await response.json();
      console.log('🧪 Direct API data:', data);
    } catch (error) {
      console.error('🧪 Direct API error:', error);
    }
  };

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      console.log('🔍 ReportsScreen: กำลังดึงข้อมูลรายงาน...');
      
      // ดึงสถิติจาก API
      const statsResponse = await ApiService.getStatistics();
      console.log('📊 Statistics Response:', statsResponse);
      if (statsResponse.success) {
        const data = statsResponse.data;
        setStats({
          totalProducts: data.totalProducts,
          totalCategories: data.totalCategories,
          lowStockProducts: data.lowStockProducts,
          totalValue: data.totalValue
        });
      }

      // ดึงประวัติการอัพเดทจาก API
      const historyResponse = await ApiService.getUpdateHistory({
        timeRange: selectedTimeRange === 'week' ? '7' : 
                   selectedTimeRange === 'month' ? '30' : '365',
        action: selectedAction === 'all' ? undefined : selectedAction
      });
      console.log('📋 History Response:', historyResponse);
      
      if (historyResponse.success) {
        console.log('✅ Activity Logs found:', historyResponse.data.length);
        setUpdateHistory(historyResponse.data);
      } else {
        console.log('❌ No activity logs or error:', historyResponse);
      }

    } catch (error) {
      console.error('❌ Error fetching reports data:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลรายงานได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'create': return 'เพิ่มสินค้า';
      case 'update': return 'อัพเดทสินค้า';
      case 'delete': return 'ลบสินค้า';
      default: return 'ไม่ทราบ';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return { name: 'add-circle', color: '#4CAF50' };
      case 'update': return { name: 'create', color: '#FF9800' };
      case 'delete': return { name: 'trash', color: '#F44336' };
      default: return { name: 'help-circle', color: '#999' };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('http://localhost:5001/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend response:', data);
        Alert.alert('สำเร็จ', 'เชื่อมต่อ Backend ได้แล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', 'Backend ไม่ตอบสนอง');
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่า server ทำงานอยู่หรือไม่');
    }
  };

  const testReportsAPI = async () => {
    try {
      console.log('Testing reports API...');
      const statsResponse = await ApiService.getStatistics();
      console.log('Statistics response:', statsResponse);
      
      const historyResponse = await ApiService.getUpdateHistory();
      console.log('History response:', historyResponse);
      
      Alert.alert('ทดสอบ API', `Statistics: ${statsResponse.success ? 'สำเร็จ' : 'ล้มเหลว'}\nHistory: ${historyResponse.success ? 'สำเร็จ' : 'ล้มเหลว'}`);
    } catch (error) {
      console.error('API test error:', error);
      Alert.alert('ข้อผิดพลาด', 'ทดสอบ API ล้มเหลว: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderHistoryItem = ({ item }) => {
    const icon = getActionIcon(item.action);
    
    return (
      <TouchableOpacity 
        style={styles.historyItem}
        onPress={() => {
          setSelectedProduct(item);
          setHistoryModalVisible(true);
        }}
      >
        <View style={styles.historyIcon}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        
        <View style={styles.historyContent}>
          <Text style={styles.historyAction}>{getActionText(item.action)}</Text>
          <Text style={styles.historyProduct}>{item.entityName}</Text>
          <Text style={styles.historyDetails}>{item.details || `${item.action} ${item.entityType}`}</Text>
          <Text style={styles.historyDate}>
            {formatDate(item.timestamp)} โดย {item.userName}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={styles.statInfo}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>กำลังโหลดข้อมูลรายงาน...</Text>
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
      {/* สถิติโดยรวม */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>สถิติโดยรวม</Text>
          <View style={styles.testButtons}>
            <TouchableOpacity style={styles.testButton} onPress={testBackendConnection}>
              <Text style={styles.testButtonText}>Test Backend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testButton} onPress={testReportsAPI}>
              <Text style={styles.testButtonText}>Test API</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="จำนวนสินค้าทั้งหมด"
            value={stats.totalProducts}
            icon="cube"
            color="#2196F3"
            subtitle="รายการ"
          />
          
          <StatCard
            title="จำนวนหมวดหมู่"
            value={stats.totalCategories}
            icon="folder"
            color="#4CAF50"
            subtitle="หมวดหมู่"
          />
        </View>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="สินค้าใกล้หมด"
            value={stats.lowStockProducts}
            icon="warning"
            color="#FF9800"
            subtitle="รายการ (< 10 ชิ้น)"
          />
          
          <StatCard
            title="มูลค่าสินค้าคงคลัง"
            value={formatCurrency(stats.totalValue)}
            icon="cash"
            color="#9C27B0"
            subtitle="บาท"
          />
        </View>
      </View>

      {/* ประวัติการอัพเดท */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ประวัติการอัพเดท</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, { backgroundColor: '#007AFF' }]}
              onPress={testAPIConnection}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={[styles.filterText, { color: 'white' }]}>Test API</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter" size={20} color="#666" />
              <Text style={styles.filterText}>กรอง</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={updateHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item._id || item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal สำหรับแสดงรายละเอียด */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>รายละเอียดการอัพเดท</Text>
            <TouchableOpacity 
              onPress={() => setHistoryModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedProduct && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>การกระทำ:</Text>
                <Text style={styles.modalValue}>{getActionText(selectedProduct.action)}</Text>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>รายการ:</Text>
                <Text style={styles.modalValue}>{selectedProduct.entityName}</Text>
              </View>
              
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>ประเภท:</Text>
                <Text style={styles.modalValue}>
                  {selectedProduct.entityType === 'product' ? 'สินค้า' : 'หมวดหมู่'}
                </Text>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>รายละเอียด:</Text>
                <Text style={styles.modalValue}>{selectedProduct.details || '-'}</Text>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>วันที่:</Text>
                <Text style={styles.modalValue}>{formatDate(selectedProduct.timestamp)}</Text>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>ผู้ดำเนินการ:</Text>
                <Text style={styles.modalValue}>{selectedProduct.userName}</Text>
              </View>
              
              {selectedProduct.oldValues && (
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>ค่าเดิม:</Text>
                  <Text style={styles.modalValue}>
                    {JSON.stringify(selectedProduct.oldValues, null, 2)}
                  </Text>
                </View>
              )}
              
              {selectedProduct.newValues && (
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>ค่าใหม่:</Text>
                  <Text style={styles.modalValue}>
                    {JSON.stringify(selectedProduct.newValues, null, 2)}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyProduct: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  historyDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
    color: '#aaa',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default ReportsScreen;