const BASE_URL = 'http://localhost:5001/api';

class ApiService {
  // ฟังก์ชัน helper สำหรับการจัดการ token
  static getToken() {
    // ใน React Native ใช้ AsyncStorage แต่สำหรับเว็บจะใช้ localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  static setToken(token) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  static removeToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
  }

  // ฟังก์ชัน helper สำหรับ fetch พร้อม timeout และ authorization
  static async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // เพิ่ม Authorization header ถ้ามี token
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('การเชื่อมต่อหมดเวลา โปรดลองใหม่อีกครั้ง');
      }
      throw error;
    }
  }

  // ตรวจสอบการเชื่อมต่อ server
  static async checkServerConnection() {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/categories`, {
        method: 'GET'
      }, 5000);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // ===== AUTHENTICATION METHODS =====

  // เข้าสู่ระบบ
  static async login(username, password) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'การเข้าสู่ระบบล้มเหลว');
      }

      // เก็บ token และข้อมูลผู้ใช้
      this.setToken(data.token);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // ลงทะเบียน
  static async register(userData) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'การลงทะเบียนล้มเหลว');
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // ออกจากระบบ
  static async logout() {
    try {
      // เรียก logout API เพื่อบันทึก activity log
      const response = await this.fetchWithTimeout(`${BASE_URL}/auth/logout`, {
        method: 'POST'
      });

      // ลบข้อมูลจาก localStorage ไม่ว่า API จะสำเร็จหรือไม่
      this.removeToken();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('user');
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Logout response:', data);
        return data;
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // ยัง clear localStorage แม้ API error
      this.removeToken();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('user');
      }
    }
  }

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  static getCurrentUser() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  static isAuthenticated() {
    return !!this.getToken();
  }

  // ===== CATEGORIES METHODS =====
  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  static async getCategories() {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/categories`, {
        method: 'GET'
      }, 10000);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.message.includes('เชื่อมต่อ')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่อ');
      }
      throw error;
    }
  }

  // ดึงข้อมูลหมวดหมู่ตาม ID
  static async getCategoryById(id) {
    try {
      const response = await fetch(`${BASE_URL}/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // เพิ่มหมวดหมู่ใหม่
  static async createCategory(categoryData) {
    try {
      console.log('🌐 API: Creating category:', categoryData);
      
      // ตรวจสอบการเชื่อมต่อก่อน
      const serverOnline = await this.checkServerConnection();
      if (!serverOnline) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
      }
      
      const url = `${BASE_URL}/categories`;
      console.log('🌐 API: POST URL:', url);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      }, 15000);
      
      console.log('🌐 API: Response status:', response.status);
      console.log('🌐 API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🌐 API: Error text:', errorText);
        
        if (response.status === 400) {
          throw new Error('ข้อมูลไม่ถูกต้อง โปรดตรวจสอบข้อมูลที่กรอก');
        } else if (response.status === 409) {
          throw new Error('ชื่อหมวดหมู่นี้มีอยู่แล้ว โปรดใช้ชื่ออื่น');
        } else if (response.status === 500) {
          throw new Error('เกิดข้อผิดพลาดในเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง');
        } else {
          throw new Error(`การสร้างหมวดหมู่ไม่สำเร็จ (${response.status})`);
        }
      }
      
      const result = await response.json();
      console.log('🌐 API: Create result:', result);
      return result;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // อัปเดตหมวดหมู่
  static async updateCategory(id, categoryData) {
    try {
      const response = await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // ลบหมวดหมู่
  static async deleteCategory(id) {
    try {
      console.log('🌐 API: Deleting category with ID:', id);
      
      // ตรวจสอบการเชื่อมต่อก่อน
      const serverOnline = await this.checkServerConnection();
      if (!serverOnline) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
      }
      
      const url = `${BASE_URL}/categories/${id}`;
      const token = this.getToken();
      
      console.log('🌐 API: DELETE URL:', url);
      console.log('🔐 API: Token exists:', !!token);
      console.log('🔐 API: Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE'
      }, 15000); // เพิ่ม timeout เป็น 15 วินาที
      
      console.log('🌐 API: Response status:', response.status);
      console.log('🌐 API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🌐 API: Error text:', errorText);
        
        if (response.status === 401) {
          throw new Error('ไม่มีสิทธิ์ในการลบหมวดหมู่ โปรด login ใหม่');
        } else if (response.status === 404) {
          throw new Error('ไม่พบหมวดหมู่ที่ต้องการลบ');
        } else if (response.status === 500) {
          throw new Error('เกิดข้อผิดพลาดในเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง');
        } else {
          throw new Error(`การลบไม่สำเร็จ (${response.status}): ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('🌐 API: Delete result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      console.error('❌ Error type:', error.name);
      console.error('❌ Error message:', error.message);
      throw error;
    }
  }

  // เพิ่มข้อมูลตัวอย่าง
  static async seedCategories() {
    try {
      const response = await fetch(`${BASE_URL}/categories/seed`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed categories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error seeding categories:', error);
      throw error;
    }
  }

  // ===== PRODUCTS METHODS =====

  // ดึงข้อมูลสินค้าทั้งหมด พร้อมกรอง
  static async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.status) params.append('status', filters.status);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const url = `${BASE_URL}/products${params.toString() ? '?' + params.toString() : ''}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลสินค้าได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // ดึงข้อมูลสินค้าตาม ID
  static async getProductById(id) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/products/${id}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่พบสินค้าที่ต้องการ');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // เพิ่มสินค้าใหม่
  static async createProduct(productData) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'เพิ่มสินค้าไม่สำเร็จ');
      }
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // แก้ไขสินค้า
  static async updateProduct(id, productData) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'แก้ไขสินค้าไม่สำเร็จ');
      }
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // ลบสินค้า
  static async deleteProduct(id) {
    try {
      console.log('🌐 API: Deleting product with ID:', id);
      
      const url = `${BASE_URL}/products/${id}`;
      const token = this.getToken();
      
      console.log('🌐 API: DELETE URL:', url);
      console.log('🔐 API: Token exists:', !!token);
      console.log('🔐 API: Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE'
      });

      console.log('🌐 API: Response status:', response.status);
      console.log('🌐 API: Response ok:', response.ok);

      const data = await response.json();
      console.log('🌐 API: Response data:', data);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('ไม่มีสิทธิ์ในการลบสินค้า โปรด login ใหม่');
        } else if (response.status === 404) {
          throw new Error('ไม่พบสินค้าที่ต้องการลบ');
        } else {
          throw new Error(data.message || `การลบไม่สำเร็จ (${response.status})`);
        }
      }
      return data;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      console.error('❌ Error type:', error.name);
      console.error('❌ Error message:', error.message);
      throw error;
    }
  }

  // เพิ่มข้อมูลสินค้าตัวอย่าง
  static async seedProducts() {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/products/seed`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }

  // ===== REPORTS METHODS =====

  // ดึงสถิติโดยรวม
  static async getStatistics() {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/reports/statistics`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลสถิติได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // ดึงประวัติการอัพเดท
  static async getUpdateHistory(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.timeRange) params.append('timeRange', filters.timeRange);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const url = `${BASE_URL}/reports/history${params.toString() ? '?' + params.toString() : ''}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลประวัติได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching update history:', error);
      throw error;
    }
  }

  // ดึงรายงานสินค้าคงคลัง
  static async getInventoryReport() {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/reports/inventory`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงรายงานสินค้าคงคลังได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  }

  // ดึงรายงานสินค้าใกล้หมด
  static async getLowStockReport(threshold = 10) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/reports/low-stock?threshold=${threshold}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงรายงานสินค้าใกล้หมดได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching low stock report:', error);
      throw error;
    }
  }

  // ดึงรายงานการเปลี่ยนแปลงสินค้า
  static async getProductChangesReport(productId, days = 30) {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/reports/product-changes/${productId}?days=${days}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงรายงานการเปลี่ยนแปลงสินค้าได้');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product changes report:', error);
      throw error;
    }
  }
}

export default ApiService;
