import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/ApiService';

const UpdateCategoryScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // โหลดข้อมูลหมวดหมู่เมื่อเริ่มต้น
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    }
    setInitialLoading(false);
  }, [category]);

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อหมวดหมู่';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'ชื่อหมวดหมู่ต้องมีไม่เกิน 50 ตัวอักษร';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'กรุณากรอกคำอธิบาย';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'คำอธิบายต้องมีอย่างน้อย 5 ตัวอักษร';
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'คำอธิบายต้องมีไม่เกิน 200 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ฟังก์ชันอัปเดตข้อมูลฟอร์ม
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // ล้าง error เมื่อผู้ใช้เริ่มพิมพ์
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await ApiService.updateCategory(category.id, categoryData);
      
      Alert.alert(
        'สำเร็จ',
        'แก้ไขหมวดหมู่เรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error.message || 'ไม่สามารถแก้ไขหมวดหมู่ได้'
      );
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันรีเซ็ตข้อมูลกลับเป็นค่าเดิม
  const handleReset = () => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
      setErrors({});
    }
  };

  // ตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงหรือไม่
  const hasChanges = () => {
    if (!category) return false;
    return (
      formData.name.trim() !== category.name ||
      formData.description.trim() !== category.description
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ไม่พบข้อมูลหมวดหมู่</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>แก้ไขหมวดหมู่</Text>
            <Text style={styles.headerSubtitle}>
              แก้ไขข้อมูลหมวดหมู่ #{category.id}
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              {/* ชื่อหมวดหมู่ */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  ชื่อหมวดหมู่ <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.name ? styles.inputError : null
                  ]}
                  placeholder="เช่น อิเล็กทรอนิกส์, เสื้อผ้า, อาหาร"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  maxLength={50}
                  editable={!loading}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
                <Text style={styles.characterCount}>
                  {formData.name.length}/50 ตัวอักษร
                </Text>
              </View>

              {/* คำอธิบาย */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  คำอธิบาย <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    errors.description ? styles.inputError : null
                  ]}
                  placeholder="อธิบายรายละเอียดของหมวดหมู่นี้"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  multiline={true}
                  numberOfLines={4}
                  maxLength={200}
                  textAlignVertical="top"
                  editable={!loading}
                />
                {errors.description ? (
                  <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}
                <Text style={styles.characterCount}>
                  {formData.description.length}/200 ตัวอักษร
                </Text>
              </View>

              {/* แสดงสถานะการเปลี่ยนแปลง */}
              {hasChanges() && (
                <View style={styles.changesIndicator}>
                  <Text style={styles.changesText}>
                    ⚠️ มีการเปลี่ยนแปลงข้อมูล
                  </Text>
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>🔄 รีเซ็ต</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.submitButton, 
                  (loading || !hasChanges()) && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={loading || !hasChanges()}
              >
                <LinearGradient
                  colors={
                    loading || !hasChanges()
                      ? ['#9CA3AF', '#9CA3AF']
                      : ['#3B82F6', '#1E40AF']
                  }
                  style={styles.submitButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>กำลังบันทึก...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      💾 บันทึกการเปลี่ยนแปลง
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50, // เพิ่มพื้นที่ด้านล่าง
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 25,
    paddingBottom: 35,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: -15,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 5,
  },
  changesIndicator: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  changesText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resetButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default UpdateCategoryScreen;
