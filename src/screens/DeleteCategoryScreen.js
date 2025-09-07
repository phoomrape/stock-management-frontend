import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/ApiService';

const DeleteCategoryScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null); // ID ของหมวดหมู่ที่กำลังลบ

  // ฟังก์ชันดึงข้อมูลหมวดหมู่
  const fetchCategories = useCallback(async () => {
    try {
      console.log('🔄 Fetching categories for delete screen...');
      setLoading(true);
      
      // เพิ่ม timestamp เพื่อ bypass cache
      const timestamp = new Date().getTime();
      const url = `http://localhost:5001/api/categories?t=${timestamp}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Categories data:', data);
      
      if (Array.isArray(data)) {
        const validCategories = data.filter(item => 
          item && typeof item === 'object' && (item.id !== undefined || item._id !== undefined)
        ).map(item => ({
          ...item,
          id: item.id || item._id
        }));
        console.log('✅ Setting categories:', validCategories.length, 'items');
        setCategories(validCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error.message || 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
        [{ text: 'ตกลง' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ฟังก์ชันทดสอบการเชื่อมต่อ
  const testConnection = useCallback(async () => {
    try {
      console.log('🔗 Testing connection...');
      const testUrl = 'http://localhost:5001/api/categories';
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔗 Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔗 Test data:', data);
        Alert.alert('✅ การเชื่อมต่อสำเร็จ', `พบข้อมูล ${data.length} หมวดหมู่`);
      } else {
        Alert.alert('❌ การเชื่อมต่อล้มเหลว', `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('🔗 Connection test failed:', error);
      Alert.alert('❌ ทดสอบการเชื่อมต่อล้มเหลว', error.message);
    }
  }, []);

  // ฟังก์ชัน refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  // ฟังก์ชันลบหมวดหมู่
  const handleDeleteCategory = useCallback(async (categoryId, categoryName) => {
    console.log('🗑️ Delete request for:', { categoryId, categoryName });
    
    if (!categoryId || categoryId === 'unknown') {
      Alert.alert(
        'เกิดข้อผิดพลาด', 
        'ไม่พบ ID ของหมวดหมู่ที่ต้องการลบ',
        [{ text: 'ตกลง' }]
      );
      return;
    }

    Alert.alert(
      '⚠️ ยืนยันการลบ',
      `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่\n\n"${categoryName}"\n\n⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
          onPress: () => console.log('🚫 Delete cancelled')
        },
        {
          text: 'ลบทันที',
          style: 'destructive',
          onPress: () => performDelete(categoryId, categoryName)
        }
      ],
      { cancelable: true }
    );
  }, []);

  // ฟังก์ชันทำการลบจริง
  const performDelete = useCallback(async (categoryId, categoryName) => {
    try {
      setDeleting(categoryId); // แสดงสถานะกำลังลบ
      console.log('🗑️ Starting delete process for ID:', categoryId);
      
      // ทดสอบเรียก API โดยตรง
      const deleteUrl = `http://localhost:5001/api/categories/${categoryId}`;
      console.log('🌐 Direct API call to:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌐 Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Delete successful:', result);
      
      // แสดงผลสำเร็จ
      Alert.alert(
        '🎉 ลบสำเร็จ', 
        `ลบหมวดหมู่ "${categoryName}" เรียบร้อยแล้ว`,
        [
          {
            text: 'ตกลง',
            onPress: () => {
              setDeleting(null);
              console.log('🔄 Refreshing categories...');
              // Refresh หลายครั้งเพื่อให้แน่ใจ
              setTimeout(() => fetchCategories(), 100);
              setTimeout(() => fetchCategories(), 500);
              setTimeout(() => fetchCategories(), 1000);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Delete failed:', error);
      setDeleting(null);
      
      Alert.alert(
        '❌ ลบไม่สำเร็จ',
        `ไม่สามารถลบหมวดหมู่ "${categoryName}" ได้\n\nสาเหตุ: ${error.message}\n\nกรุณาลองใหม่อีกครั้ง`,
        [
          { text: 'ลองใหม่', onPress: () => handleDeleteCategory(categoryId, categoryName) },
          { text: 'ยกเลิก', style: 'cancel' }
        ]
      );
    }
  }, [fetchCategories, handleDeleteCategory]);

  // ดึงข้อมูลเมื่อหน้าแสดงขึ้น
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ฟังก์ชันเมื่อกลับมาจากหน้าอื่น
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCategories();
    });
    return unsubscribe;
  }, [navigation, fetchCategories]);

  // Component สำหรับแต่ละหมวดหมู่
  const DeleteCategoryCard = ({ item }) => {
    if (!item) return null;
    
    const categoryId = item.id || item._id || 'unknown';
    const categoryName = item.name || 'ไม่มีชื่อ';
    const categoryDescription = item.description || 'ไม่มีคำอธิบาย';
    const isDeleting = deleting === categoryId;
    
    return (
      <View style={styles.categoryCard}>
        <LinearGradient
          colors={['#FFFFFF', '#FEF2F2']} // สีแดงอ่อนเพื่อเตือนการลบ
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{categoryName}</Text>
              <Text style={styles.categoryDescription}>{categoryDescription}</Text>
              <Text style={styles.categoryId}>ID: {categoryId}</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.deleteButton,
                isDeleting && styles.deletingButton
              ]}
              onPress={() => handleDeleteCategory(categoryId, categoryName)}
              disabled={isDeleting}
              accessible={true}
              accessibilityLabel={`ลบหมวดหมู่ ${categoryName}`}
              accessibilityRole="button"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>🗑️ ลบ</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Web wrapper component
  const WebScrollWrapper = Platform.OS === 'web' ? 'div' : View;
  const webScrollStyles = Platform.OS === 'web' ? {
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  } : {};

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  const content = (
    <>
      {/* Header */}
      <LinearGradient
        colors={['#EF4444', '#DC2626']} // สีแดงสำหรับหน้าลบ
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🗑️ ลบหมวดหมู่สินค้า</Text>
        <Text style={styles.headerSubtitle}>
          เลือกหมวดหมู่ที่ต้องการลบ ({categories.length} หมวดหมู่)
        </Text>
        <Text style={styles.warningText}>
          ⚠️ การลบจะไม่สามารถย้อนกลับได้
        </Text>
        
        {/* ปุ่มทดสอบการเชื่อมต่อ */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={testConnection}
          accessible={true}
          accessibilityLabel="ทดสอบการเชื่อมต่อ"
          accessibilityRole="button"
        >
          <Text style={styles.testButtonText}>🔗 ทดสอบการเชื่อมต่อ</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Categories List */}
      {categories.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>ไม่มีหมวดหมู่ให้ลบ</Text>
          <Text style={styles.emptySubtitle}>
            ไม่พบหมวดหมู่สินค้าในระบบ หรือลบหมดแล้ว{'\n'}
            กลับไปหน้าหลักเพื่อเพิ่มหมวดหมู่ใหม่
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
            accessible={true}
            accessibilityLabel="กลับหน้าหลัก"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>🏠 กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {categories.map((item, index) => (
            <DeleteCategoryCard key={item.id || index} item={item} />
          ))}
          
          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              🔽 จบรายการหมวดหมู่ ({categories.length} รายการ) 🔽
            </Text>
          </View>
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'web' ? (
        <WebScrollWrapper style={webScrollStyles}>
          {content}
        </WebScrollWrapper>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#EF4444']}
              tintColor="#EF4444"
              title="ดึงข้อมูลใหม่..."
              titleColor="#EF4444"
            />
          }
        >
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#DC2626',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FEE2E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#FEF2F2',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    boxShadow: '0px 2px 3.84px rgba(239, 68, 68, 0.2)',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  cardGradient: {
    borderRadius: 15,
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  categoryId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingButton: {
    backgroundColor: '#9CA3AF',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
});

export default DeleteCategoryScreen;
