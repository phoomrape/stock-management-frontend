import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ฟังก์ชันดึงข้อมูลหมวดหมู่
  const fetchCategories = useCallback(async () => {
    try {
      console.log('🔄 Starting to fetch categories...');
      setLoading(true);
      const data = await ApiService.getCategories();
      console.log('📦 Data received from API:', data);
      
      // ตรวจสอบและกรองข้อมูลที่ได้รับ
      if (Array.isArray(data)) {
        const validCategories = data.filter(item => 
          item && typeof item === 'object' && (item.id !== undefined || item._id !== undefined)
        ).map(item => ({
          ...item,
          id: item.id || item._id // ใช้ id หรือ _id เป็น fallback
        }));
        console.log('✅ Valid categories:', validCategories);
        console.log('📊 Categories count:', validCategories.length);
        console.log('🎯 Total FlatList items:', validCategories.length + 1); // +1 for header
        setCategories(validCategories);
      } else {
        console.warn('⚠️ Data received is not an array:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]); // ตั้งค่าเป็น array ว่างเมื่อเกิดข้อผิดพลาด
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error.message || 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
        [{ text: 'ตกลง' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ฟังก์ชัน refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  // ฟังก์ชันลบหมวดหมู่
  const handleDeleteCategory = useCallback((categoryId, categoryName) => {
    console.log('🗑️ Delete button pressed:', { categoryId, categoryName, type: typeof categoryId });
    
    // ตรวจสอบ ID ที่ได้รับ
    if (!categoryId || categoryId === 'unknown') {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบ ID ของหมวดหมู่ที่ต้องการลบ');
      return;
    }
    
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบหมวดหมู่ "${categoryName}" หรือไม่?\nID: ${categoryId}`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Starting delete process for ID:', categoryId);
              const result = await ApiService.deleteCategory(categoryId);
              console.log('🗑️ Delete result:', result);
              
              Alert.alert('สำเร็จ', 'ลบหมวดหมู่เรียบร้อยแล้ว', [
                {
                  text: 'ตกลง',
                  onPress: () => {
                    console.log('🔄 Refreshing categories after delete...');
                    fetchCategories(); // รีเฟรชข้อมูล
                  }
                }
              ]);
            } catch (error) {
              console.error('❌ Error deleting category:', error);
              Alert.alert(
                'เกิดข้อผิดพลาด',
                `ไม่สามารถลบหมวดหมู่ได้\nรายละเอียด: ${error.message}`,
                [{ text: 'ตกลง' }]
              );
            }
          },
        },
      ]
    );
  }, [fetchCategories]);

  // ฟังก์ชันไปหน้าแก้ไข
  const handleEditCategory = useCallback((category) => {
    navigation.navigate('UpdateCategory', { category });
  }, [navigation]);

  // ฟังก์ชันไปหน้าเพิ่มหมวดหมู่
  const handleAddCategory = useCallback(() => {
    navigation.navigate('AddCategory');
  }, [navigation]);

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

  // Component สำหรับแสดงแต่ละหมวดหมู่
  const CategoryCard = ({ item }) => {
    // ตรวจสอบข้อมูลก่อนแสดง
    if (!item) return null;
    
    const categoryId = item.id || item._id || 'unknown';
    const categoryName = item.name || 'ไม่มีชื่อ';
    const categoryDescription = item.description || 'ไม่มีคำอธิบาย';
    
    console.log('📋 CategoryCard data:', { 
      itemId: item.id, 
      item_id: item._id, 
      categoryId, 
      categoryName 
    });
    
    return (
      <View style={styles.categoryCard}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{categoryName}</Text>
              <Text style={styles.categoryDescription}>{categoryDescription}</Text>
            </View>
            <View style={styles.categoryId}>
              <Text style={styles.idText}>#{categoryId}</Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditCategory(item)}
              disabled={!categoryId || categoryId === 'unknown'}
              accessible={true}
              accessibilityLabel={`แก้ไขหมวดหมู่ ${categoryName}`}
              accessibilityRole="button"
              importantForAccessibility="yes"
            >
              <Text style={styles.editButtonText}>✏️ แก้ไข</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCategory(categoryId, categoryName)}
              disabled={!categoryId || categoryId === 'unknown'}
              accessible={true}
              accessibilityLabel={`ลบหมวดหมู่ ${categoryName}`}
              accessibilityRole="button"
              importantForAccessibility="yes"
            >
              <Text style={styles.deleteButtonText}>🗑️ ลบ</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Web-specific wrapper component
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
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  const content = (
    <>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>หมวดหมู่สินค้า</Text>
        <Text style={styles.headerSubtitle}>
          จำนวนหมวดหมู่ทั้งหมด: {categories.length} หมวดหมู่
        </Text>
      </LinearGradient>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCategory}
          accessible={true}
          accessibilityLabel="เพิ่มหมวดหมู่ใหม่"
          accessibilityRole="button"
          importantForAccessibility="yes"
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>➕ เพิ่มหมวดหมู่ใหม่</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <Text style={styles.categoryCountText}>
          📋 แสดง {categories.length} หมวดหมู่
        </Text>
      )}

      {/* Categories List */}
      {categories.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>ยังไม่มีหมวดหมู่สินค้า</Text>
          <Text style={styles.emptySubtitle}>
            เริ่มต้นด้วยการเพิ่มหมวดหมู่สินค้าใหม่
          </Text>
        </View>
      ) : (
        categories.map((item, index) => (
          <CategoryCard key={item.id || index} item={item} />
        ))
      )}

      {/* Footer */}
      {categories.length > 0 && (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            🔽 จบรายการหมวดหมู่ 🔽
          </Text>
        </View>
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
              colors={['#4F46E5']}
              tintColor="#4F46E5"
              title="ดึงข้อมูลใหม่..."
              titleColor="#4F46E5"
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
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden',
    }),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webScrollView: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  webScrollContainer: {
    minHeight: '100%',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  categoryCountText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footerContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  addButtonContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  addButton: {
    borderRadius: 12,
    elevation: 3,
    // Web shadow (ใหม่)
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    // iOS shadow (เก็บไว้เพื่อ backward compatibility)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listWrapper: {
    flex: 1,
  },
  flatListStyle: {
    flex: 1,
  },
  scrollViewStyle: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
    flexGrow: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  categoriesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100, // เพิ่มพื้นที่ด้านล่าง
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    // Web shadow (ใหม่)
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    // iOS shadow (เก็บไว้เพื่อ backward compatibility)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    minHeight: 140, // กำหนดความสูงขั้นต่ำ
    backgroundColor: '#fff',
  },
  cardGradient: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  categoryId: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  idText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CategoriesScreen;
