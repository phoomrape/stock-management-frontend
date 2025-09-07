const fs = require('fs');
const path = require('path');

// ไฟล์ที่ต้องแก้ไข
const files = [
  './src/screens/AddCategoryScreen.js',
  './src/screens/UpdateCategoryScreen.js'
];

// Function เพื่อแก้ไข shadow properties
function fixShadowProps(content) {
  // Pattern สำหรับ shadow properties
  const shadowPattern = /(\s+)shadowColor:\s*'#000',\s*\n(\s+)shadowOffset:\s*\{\s*\n(\s+)width:\s*0,\s*\n(\s+)height:\s*(\d+),\s*\n(\s+)\},\s*\n(\s+)shadowOpacity:\s*([\d.]+),\s*\n(\s+)shadowRadius:\s*([\d.]+),/g;
  
  return content.replace(shadowPattern, (match, indent1, indent2, indent3, indent4, height, indent5, indent6, opacity, indent7, radius) => {
    const boxShadowValue = `0px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`;
    return `${indent1}// Web shadow (ใหม่)
${indent1}boxShadow: '${boxShadowValue}',
${indent1}// iOS shadow (เก็บไว้เพื่อ backward compatibility)
${indent1}shadowColor: '#000',
${indent2}shadowOffset: {
${indent3}width: 0,
${indent4}height: ${height},
${indent5}},
${indent6}shadowOpacity: ${opacity},
${indent7}shadowRadius: ${radius},`;
  });
}

// แก้ไขไฟล์ทั้งหมด
files.forEach(filePath => {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixedContent = fixShadowProps(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Fixed shadows in: ${filePath}`);
    } else {
      console.log(`ℹ️ No shadows to fix in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('🎉 Shadow fix completed!');
