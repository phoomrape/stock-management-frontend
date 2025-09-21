import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';

const ProductsScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    sku: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { categoryId, categoryName } = route.params || {};

  useEffect(() => {
    loadCategories();
    loadProducts();
    
    // ถ้ามาจากหน้า Categories ให้กรองแค่หมวดหมู่นั้น
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    loadProducts();
  }, [searchText, selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดหมวดหมู่ได้');
    }
  };

  const loadProducts = async () => {
    try {
      const filters = {};
      if (searchText) filters.keyword = searchText;
      if (selectedCategory) filters.category = selectedCategory;

      const data = await ApiService.getProducts(filters);
      setProducts(data);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: selectedCategory || '',
      stock: '',
      sku: '',
      status: 'active'
    });
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category.id || product.category,
      stock: product.stock.toString(),
      sku: product.sku,
      status: product.status
    });
    setModalVisible(true);
  };

  const handleDeleteProduct = (product) => {
    console.log('🗑️ Delete button clicked for product:', product);
    console.log('🗑️ Product ID:', product._id);
    console.log('👤 Current user role:', user?.role);
    
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบสินค้า "${product.name}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel', onPress: () => console.log('❌ Delete cancelled') },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => {
            console.log('✅ Delete confirmed, calling deleteProduct');
            deleteProduct(product._id);
          }
        }
      ]
    );
  };

  const deleteProduct = async (id) => {
    console.log('🔄 Starting delete product process for ID:', id);
    console.log('🔐 Current JWT token:', ApiService.getToken());
    console.log('👤 Current user:', user);
    
    try {
      console.log('📡 Calling ApiService.deleteProduct...');
      const result = await ApiService.deleteProduct(id);
      console.log('✅ Delete API call successful:', result);
      Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อยแล้ว');
      loadProducts();
    } catch (error) {
      console.error('❌ Delete product error:', error);
      console.error('❌ Error message:', error.message);
      Alert.alert('ข้อผิดพลาด', error.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || 
        !formData.price || !formData.category || !formData.sku.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      };

      if (editingProduct) {
        await ApiService.updateProduct(editingProduct.id, productData);
        Alert.alert('สำเร็จ', 'แก้ไขสินค้าเรียบร้อยแล้ว');
      } else {
        await ApiService.createProduct(productData);
        Alert.alert('สำเร็จ', 'เพิ่มสินค้าเรียบร้อยแล้ว');
      }
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'discontinued': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'ใช้งาน';
      case 'inactive': return 'ไม่ใช้งาน';
      case 'discontinued': return 'หยุดผลิต';
      default: return status;
    }
  };

  const canModify = user?.role === 'admin' || user?.role === 'manager';

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          {canModify && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditProduct(item)}
            >
              <Ionicons name="pencil" size={16} color="#FF9500" />
            </TouchableOpacity>
          )}
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                console.log('🔥 DIRECT DELETE PRODUCT - bypassing Alert');
                deleteProduct(item._id);
              }}
            >
              <Ionicons name="trash" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Text style={styles.productDescription}>{item.description}</Text>
      
      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>หมวดหมู่:</Text>
          <Text style={styles.detailValue}>
            {item.category?.name || 'ไม่ระบุ'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ราคา:</Text>
          <Text style={[styles.detailValue, styles.priceText]}>
            {formatPrice(item.price)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>คงเหลือ:</Text>
          <Text style={[styles.detailValue, item.stock <= 5 ? styles.lowStock : null]}>
            {item.stock} ชิ้น
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>SKU:</Text>
          <Text style={styles.detailValue}>{item.sku}</Text>
        </View>
      </View>
    </View>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {categoryName ? `สินค้าใน${categoryName}` : 'จัดการสินค้า'}
        </Text>
        {canModify && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาสินค้า..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        </View>
        
        {!categoryId && (
          <View style={styles.categoryFilter}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.categoryPicker}
            >
              <Picker.Item label="ทุกหมวดหมู่" value="" />
              {categories.map(category => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal สำหรับเพิ่ม/แก้ไขสินค้า */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </Text>

              <Text style={styles.inputLabel}>ชื่อสินค้า</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อสินค้า"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.inputLabel}>คำอธิบาย</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="กรอกคำอธิบายสินค้า"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>ราคา</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>หมวดหมู่</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="เลือกหมวดหมู่" value="" />
                  {categories.map(category => (
                    <Picker.Item
                      key={category.id}
                      label={category.name}
                      value={category.id}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>จำนวนคงเหลือ</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>SKU</Text>
              <TextInput
                style={styles.input}
                placeholder="รหัสสินค้า"
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
              />

              <Text style={styles.inputLabel}>สถานะ</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="ใช้งาน" value="active" />
                  <Picker.Item label="ไม่ใช้งาน" value="inactive" />
                  <Picker.Item label="หยุดผลิต" value="discontinued" />
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editingProduct ? 'อัปเดต' : 'เพิ่ม'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  categoryFilter: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  categoryPicker: {
    height: 50,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFF3E0',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  priceText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  lowStock: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ProductsScreen;