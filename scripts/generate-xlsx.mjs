import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const rawProducts = JSON.parse(
  fs.readFileSync('src/data/raw-products.json', 'utf-8')
);

const FALLBACK_BED_IMAGE =
  'https://www.raneen.com/media/catalog/product/i/m/img-20250814-wa0014.jpg';

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/[×✕✖]/g, 'x') // Replace multiplication symbols with ASCII x
    .replace(/[–—]/g, '-') // Replace en/em dashes with standard hyphen
    .replace(/[“”]/g, '"') // Replace curly quotes
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

function getBasePrice(cat, nameEn, sku) {
  const nameLower = nameEn.toLowerCase();
  const c = cat.toLowerCase();

  let base = 4500;
  if (c.includes('bedroom')) base = 34000;
  else if (c.includes('living')) base = 31000;
  else if (c.includes('dining room')) base = 25000;
  else if (c.includes('dressing room')) base = 22000;
  else if (c.includes('kitchen')) base = 24000;
  else if (c.includes('sofa') || nameLower.includes('couch')) {
    if (
      nameLower.includes('l-shape') ||
      nameLower.includes('corner') ||
      nameLower.includes('u-shape') ||
      nameLower.includes('sectional')
    )
      base = 16500;
    else if (nameLower.includes('three-seater') || nameLower.includes('3'))
      base = 12500;
    else if (nameLower.includes('two-seater') || nameLower.includes('2'))
      base = 9800;
    else base = 14000;
  } else if (c.includes('bed')) {
    if (nameLower.includes('king') || nameLower.includes('200')) base = 13800;
    else if (nameLower.includes('single') || nameLower.includes('120'))
      base = 8900;
    else base = 11500;
  } else if (c.includes('wardrobe')) {
    if (nameLower.includes('4') || nameLower.includes('four')) base = 18500;
    else if (nameLower.includes('3') || nameLower.includes('three')) base = 14500;
    else if (nameLower.includes('2') || nameLower.includes('two')) base = 10800;
    else base = 15000;
  } else if (c.includes('recliner')) base = 8500;
  else if (c.includes('dressing table')) base = 7800;
  else if (c.includes('dining table')) base = 11500;
  else if (c.includes('chair')) base = 3900;
  else if (c.includes('tv table')) base = 3800;
  else if (c.includes('center table') || c.includes('table')) base = 3200;
  else if (c.includes('commode') || c.includes('drawer')) base = 4200;
  else if (c.includes('shoe rack')) base = 3100;
  else if (c.includes('storage')) base = 4100;
  else if (c.includes('coffee corner')) base = 4600;
  else if (c.includes('display') || c.includes('book')) base = 5400;
  else if (c.includes('hanger')) base = 2400;

  const digits = sku.match(/\d+/g);
  const varAmount = digits ? (parseInt(digits[0], 10) * 350) % 3500 : 500;
  const price = Math.round((base + varAmount) / 100) * 100;
  const comparePrice = Math.round((price * 1.18) / 100) * 100;
  return { price, comparePrice };
}

// Prepare rows for different sheets
const standardEnglishRows = [];
const standardArabicRows = [];
const enhancedOriginalRows = [];
const allColumnsCombinedRows = [];

for (const p of rawProducts) {
  const sku = cleanText(p.sku);
  const cat = cleanText(p.category);
  const nameEn = cleanText(p.name_en);
  const nameAr = cleanText(p.name_ar);
  let link = p.link ? p.link.trim() : '';
  if (!link || link.includes('no_selection') || !link.startsWith('http')) {
    link = FALLBACK_BED_IMAGE;
  }

  const { price, comparePrice } = getBasePrice(cat, nameEn, sku);

  // Extract dimensions
  const dimMatch = nameEn.match(
    /(\d+[\s]*[x*][\s]*\d+(?:[\s]*[x*][\s]*\d+)?(?:[\s]*[x*][\s]*\d+)?\s*(?:cm|cm\.)?)/i
  );
  const dimensions = dimMatch ? dimMatch[1].trim() : 'Standard';

  const descEn = `${nameEn}. Dimensions: ${dimensions}. Category: ${cat}. High quality craftsmanship by Aura Furniture. Fast delivery across Egypt with 3 years full warranty.`;
  const descAr = `${nameAr}. الأبعاد: ${dimensions}. الفئة: ${cat}. خامات عالية الجودة من أورا للأثاث. شحن سريع لجميع المحافظات وضمان 3 سنوات.`;

  // 1. Standard English headers (most common in Vondera)
  standardEnglishRows.push({
    'Product Name': nameAr, // Arabic title as primary for Egypt stores
    'Product Name (EN)': nameEn,
    'SKU': sku,
    'Price': price,
    'Compare At Price': comparePrice,
    'Category': cat,
    'Stock': 25,
    'Quantity': 25,
    'Images': link,
    'Image URL': link,
    'Description': `${nameAr} - ${dimensions}\n${nameEn}`,
  });

  // 2. Standard Arabic headers (if Vondera dashboard is in Arabic)
  standardArabicRows.push({
    'اسم المنتج': nameAr,
    'اسم المنتج بالإنجليزية': nameEn,
    'كود المنتج': sku,
    'السعر': price,
    'السعر القديم': comparePrice,
    'القسم': cat,
    'الكمية': 25,
    'رابط الصورة': link,
    'الوصف': descAr,
  });

  // 3. Enhanced Original format (exact user column names + added price/stock)
  enhancedOriginalRows.push({
    'New SKU': sku,
    'Sub Category': cat,
    'Product Name (EN)': nameEn,
    'Product Name (AR)': nameAr,
    'Price': price,
    'Compare Price': comparePrice,
    'Quantity': 25,
    'Link': link,
    'Description': `${nameAr} | ${dimensions}`,
  });

  // 4. Universal multi-header format (contains every variation of column name so Vondera auto-detects)
  allColumnsCombinedRows.push({
    'Name': nameAr,
    'Title': nameAr,
    'Product Name': nameAr,
    'Name (EN)': nameEn,
    'SKU': sku,
    'Code': sku,
    'Price': price,
    'Crossed Price': comparePrice,
    'Compare Price': comparePrice,
    'Quantity': 25,
    'Stock': 25,
    'Category': cat,
    'Images': link,
    'Image': link,
    'Image URL': link,
    'Link': link,
    'Description': `${nameAr}\nالأبعاد: ${dimensions}\n${nameEn}`,
  });
}

// Generate Excel files
const publicImportsDir = path.resolve('public/imports');
if (!fs.existsSync(publicImportsDir)) {
  fs.mkdirSync(publicImportsDir, { recursive: true });
}

// File 1: Aura_Vondera_Bulk_Import.xlsx (Universal standard)
const wb1 = XLSX.utils.book_new();
const ws1 = XLSX.utils.json_to_sheet(standardEnglishRows);
XLSX.utils.book_append_sheet(wb1, ws1, 'Products');
const file1 = path.join(publicImportsDir, 'Aura_Vondera_Bulk_Import.xlsx');
XLSX.writeFile(wb1, file1);

// File 2: Aura_Vondera_Import_Arabic.xlsx (Arabic headers)
const wb2 = XLSX.utils.book_new();
const ws2 = XLSX.utils.json_to_sheet(standardArabicRows);
XLSX.utils.book_append_sheet(wb2, ws2, 'المنتجات');
const file2 = path.join(publicImportsDir, 'Aura_Vondera_Import_Arabic.xlsx');
XLSX.writeFile(wb2, file2);

// File 3: Aura_2026_Fixed_With_Prices.xlsx (Enhanced user file)
const wb3 = XLSX.utils.book_new();
const ws3 = XLSX.utils.json_to_sheet(enhancedOriginalRows);
XLSX.utils.book_append_sheet(wb3, ws3, 'Aura_2026');
const file3 = path.join(publicImportsDir, 'Aura_2026_Fixed_With_Prices.xlsx');
XLSX.writeFile(wb3, file3);

console.log('Successfully created all 3 Excel files:');
console.log('1.', file1);
console.log('2.', file2);
console.log('3.', file3);
