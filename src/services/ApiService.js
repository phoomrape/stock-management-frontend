const BASE_URL = 'http://localhost:5001/api';

class ApiService {
  // ฟังก์ชัน helper สำหรับ fetch พร้อม timeout
  static async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
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
      console.log('🌐 API: DELETE URL:', url);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 15000); // เพิ่ม timeout เป็น 15 วินาที
      
      console.log('🌐 API: Response status:', response.status);
      console.log('🌐 API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🌐 API: Error text:', errorText);
        
        if (response.status === 404) {
          throw new Error('ไม่พบหมวดหมู่ที่ต้องการลบ');
        } else if (response.status === 500) {
          throw new Error('เกิดข้อผิดพลาดในเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง');
        } else {
          throw new Error(`การลบไม่สำเร็จ (${response.status})`);
        }
      }
      
      const result = await response.json();
      console.log('🌐 API: Delete result:', result);
      return result;
    } catch (error) {
      console.error('Error deleting category:', error);
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
}

export default ApiService;
