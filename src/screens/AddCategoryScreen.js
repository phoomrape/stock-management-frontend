import React, { useState } from 'react';
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

const AddCategoryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

      await ApiService.createCategory(categoryData);
      
      Alert.alert(
        'สำเร็จ',
        'เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error.message || 'ไม่สามารถเพิ่มหมวดหมู่ได้'
      );
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันล้างฟอร์ม
  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
    });
    setErrors({});
  };

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
            colors={['#10B981', '#059669']}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>เพิ่มหมวดหมู่ใหม่</Text>
            <Text style={styles.headerSubtitle}>
              กรอกข้อมูลหมวดหมู่สินค้าที่ต้องการเพิ่ม
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
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>🔄 ล้างข้อมูล</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#10B981', '#059669']}
                  style={styles.submitButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>กำลังบันทึก...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>💾 บันทึกหมวดหมู่</Text>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default AddCategoryScreen;
