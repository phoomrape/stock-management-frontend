const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5001;
const MONGO_URI = 'mongodb://localhost:27017/stock_store';

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('เชื่อมต่อ MongoDB สำเร็จ');
  })
  .catch((error) => {
    console.error('เชื่อมต่อ MongoDB ไม่สำเร็จ:', error);
  });

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// เพิ่ม virtual field สำหรับ id
categorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// ตั้งค่าให้ส่ง virtual fields ในการแปลงเป็น JSON
categorySchema.set('toJSON', {
  virtuals: true
});

const Category = mongoose.model('Category', categorySchema);

// Routes

// Route สำหรับเพิ่มข้อมูลตัวอย่าง (ต้องมาก่อน /:id)
app.post('/api/categories/seed', async (req, res) => {
  try {
    const sampleCategories = [
      {
        name: "เสื้อผ้า",
        description: "สินค้าเกี่ยวกับเครื่องแต่งกาย"
      },
      {
        name: "อิเล็กทรอนิกส์",
        description: "สินค้าเครื่องใช้ไฟฟ้าและอุปกรณ์อิเล็กทรอนิกส์"
      },
      {
        name: "เครื่องดื่ม",
        description: "น้ำดื่มและเครื่องดื่มต่างๆ"
      }
    ];

    // ลบข้อมูลเก่าออกก่อน (ถ้ามี)
    await Category.deleteMany({});
    
    // เพิ่มข้อมูลตัวอย่าง
    const createdCategories = await Category.insertMany(sampleCategories);
    
    res.status(201).json({
      message: 'เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว',
      categories: createdCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง', error: error.message });
  }
});

// GET - ดึงข้อมูลหมวดหมู่ทั้งหมด
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
});

// GET - ดึงข้อมูลหมวดหมู่ตาม ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่ที่ต้องการ' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
});

// POST - เพิ่มหมวดหมู่ใหม่
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อและคำอธิบายหมวดหมู่' });
    }

    const newCategory = new Category({
      name,
      description
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' });
    } else {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่', error: error.message });
    }
  }
});

// PUT - อัปเดตหมวดหมู่
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อและคำอธิบายหมวดหมู่' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่ที่ต้องการอัปเดต' });
    }

    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' });
    } else {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่', error: error.message });
    }
  }
});

// DELETE - ลบหมวดหมู่
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // ค้นหาหมวดหมู่ก่อนลบ
    const categoryToDelete = await Category.findOne({ _id: categoryId });
    
    if (!categoryToDelete) {
      return res.status(404).json({ 
        message: 'ไม่พบหมวดหมู่ที่ต้องการลบ',
        success: false,
        id: categoryId
      });
    }

    // ลบหมวดหมู่โดยใช้ deleteOne
    const deleteResult = await Category.deleteOne({ _id: categoryId });
    
    if (deleteResult.deletedCount === 1) {
      res.json({ 
        message: 'ลบหมวดหมู่เรียบร้อยแล้ว', 
        success: true,
        deletedCategory: {
          id: categoryToDelete._id,
          name: categoryToDelete.name,
          description: categoryToDelete.description
        }
      });
    } else {
      res.status(500).json({ 
        message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่',
        success: false,
        deleteResult: deleteResult
      });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่', 
      success: false,
      error: error.message,
      id: req.params.id
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Stock Store API Server กำลังทำงาน',
    endpoints: {
      'GET /api/categories': 'ดึงข้อมูลหมวดหมู่ทั้งหมด',
      'GET /api/categories/:id': 'ดึงข้อมูลหมวดหมู่ตาม ID',
      'POST /api/categories': 'เพิ่มหมวดหมู่ใหม่',
      'PUT /api/categories/:id': 'อัปเดตหมวดหมู่',
      'DELETE /api/categories/:id': 'ลบหมวดหมู่',
      'POST /api/categories/seed': 'เพิ่มข้อมูลตัวอย่าง',
      'GET /api/categories/test-delete/:id': 'ทดสอบลบหมวดหมู่ด้วย GET'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server กำลังทำงานที่ port ${PORT}`);
});

module.exports = app;
