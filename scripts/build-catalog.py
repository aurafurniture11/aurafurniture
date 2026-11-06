import json
import re
import csv
import os

with open(r'd:\projects\orca\aura-furniture\src\data\raw-products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

FALLBACK_BED_IMAGE = "https://www.raneen.com/media/catalog/product/i/m/img-20250814-wa0014.jpg"

def get_base_price(cat, name_en, sku):
    name_lower = name_en.lower()
    c = cat.lower()
    
    if 'bedroom' in c:
        base = 34000
    elif 'living' in c:
        base = 31000
    elif 'dining room' in c:
        base = 25000
    elif 'dressing room' in c:
        base = 22000
    elif 'kitchen' in c:
        base = 24000
    elif 'sofa' in c or 'couch' in name_lower:
        if 'l-shape' in name_lower or 'corner' in name_lower or 'u-shape' in name_lower or 'sectional' in name_lower:
            base = 16500
        elif 'three-seater' in name_lower or '3' in name_lower:
            base = 12500
        elif 'two-seater' in name_lower or '2' in name_lower:
            base = 9800
        else:
            base = 14000
    elif 'bed' in c:
        if 'king' in name_lower or '200' in name_lower:
            base = 13800
        elif 'single' in name_lower or '120' in name_lower:
            base = 8900
        else:
            base = 11500
    elif 'wardrobe' in c:
        if '4' in name_lower or 'four' in name_lower:
            base = 18500
        elif '3' in name_lower or 'three' in name_lower:
            base = 14500
        elif '2' in name_lower or 'two' in name_lower:
            base = 10800
        else:
            base = 15000
    elif 'recliner' in c:
        base = 8500
    elif 'dressing table' in c:
        base = 7800
    elif 'dining table' in c:
        base = 11500
    elif 'chair' in c:
        base = 3900
    elif 'tv table' in c:
        base = 3800
    elif 'center table' in c or 'table' in c:
        base = 3200
    elif 'commode' in c or 'drawer' in c:
        base = 4200
    elif 'shoe rack' in c:
        base = 3100
    elif 'storage' in c:
        base = 4100
    elif 'coffee corner' in c:
        base = 4600
    elif 'display' in c or 'book' in c:
        base = 5400
    elif 'hanger' in c:
        base = 2400
    else:
        base = 4500

    # Add pseudo-random variance based on sku digits
    digits = re.findall(r'\d+', sku)
    var = (int(digits[0]) * 350) % 3500 if digits else 500
    price = base + var
    price = round(price / 100) * 100
    compare_price = round((price * 1.18) / 100) * 100
    return price, compare_price

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text[:80]

catalog_items = []
shopify_rows = []
vondera_rows = []

for idx, p in enumerate(products, 1):
    sku = p['sku'].strip()
    cat = p['category'].strip()
    name_en = p['name_en'].replace('×', 'x').replace('✕', 'x').replace('–', '-').replace('—', '-').strip()
    name_ar = p['name_ar'].replace('×', 'x').replace('✕', 'x').replace('–', '-').replace('—', '-').strip()
    link = p['link'].strip() if p.get('link') else ''
    
    if not link or 'no_selection' in link or not link.startswith('http'):
        link = FALLBACK_BED_IMAGE

    price, compare_price = get_base_price(cat, name_en, sku)
    
    # Extract dimensions if present
    dim_match = re.search(r'(\d+[\s]*[x*][\s]*\d+(?:[\s]*[x*][\s]*\d+)?(?:[\s]*[x*][\s]*\d+)?\s*(?:cm|سم)?)', name_en, re.IGNORECASE)
    dimensions = dim_match.group(1).strip() if dim_match else "Standard"
    
    # Handle / slug
    handle = slugify(f"{sku}-{name_en[:40]}")
    
    # Single-line description for high CSV compatibility
    body_html = f"<p><strong>Aura Furniture Premium Collection</strong></p><p>{name_en}</p><p dir=\"rtl\">{name_ar}</p><ul><li><strong>Dimensions:</strong> {dimensions}</li><li><strong>Category:</strong> {cat}</li><li><strong>SKU:</strong> {sku}</li><li><strong>Warranty:</strong> 3 Years Full Warranty</li><li><strong>Delivery:</strong> Fast Delivery Across Egypt</li></ul>"

    vondera_desc = f"{name_en} | {name_ar} | Dimensions: {dimensions} | 3 Years Warranty | Fast Delivery Across Egypt"

    # 1. Shopify CSV format
    shopify_rows.append({
        'Handle': handle,
        'Title': name_en,
        'Body (HTML)': body_html,
        'Vendor': 'Aura Furniture',
        'Product Category': f"Furniture > {cat}",
        'Type': cat,
        'Tags': f"{cat}, Aura 2026, Egyptian Furniture, {sku}",
        'Published': 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': sku,
        'Variant Grams': '25000',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '15',
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': str(price),
        'Variant Compare At Price': str(compare_price),
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'FALSE',
        'Variant Barcode': '',
        'Image Src': link,
        'Image Position': '1',
        'Image Alt Text': name_en,
        'Gift Card': 'FALSE',
        'SEO Title': f"{name_en} | Aura Furniture",
        'SEO Description': f"Buy {name_en} at Aura Furniture. Premium quality, best price in Egypt, cash on delivery or online payment.",
        'Status': 'active'
    })

    # 2. Vondera Standard CSV format
    vondera_rows.append({
        'SKU': sku,
        'Name': name_en,
        'Name_AR': name_ar,
        'Category': cat,
        'Price': price,
        'Compare_Price': compare_price,
        'Quantity': 25,
        'Image_URL': link,
        'Description': vondera_desc,
        'Brand': 'Aura Furniture',
        'Status': 'Active'
    })

    # 3. Storefront JSON product matching AuraProduct interface
    catalog_items.append({
        'id': f"aura-{sku.lower()}",
        'name': name_en,
        'nameAr': name_ar,
        'brand': 'Aura Furniture',
        'price': price,
        'crossedPrice': compare_price,
        'mainImage': {
            'originalSize': link,
            'smallSize': link
        },
        'images': [
            {
                'originalSize': link,
                'smallSize': link
            }
        ],
        'link': f"/product/aura-{sku.lower()}",
        'categoryId': cat.lower().replace(' ', '-'),
        'categoryName': cat,
        'subCategoryName': cat,
        'slug': f"aura-{sku.lower()}",
        'quantity': 25,
        'isAvailable': True,
        'currency': 'EGP',
        'storeId': 'uRu0IdBQlhPH7LIIWqE5WjdpIod2',
        'variantsCount': 0,
        'variantsSettings': [],
        'dimensions': dimensions,
        'description': body_html,
        'sku': sku,
        'labels': {
            'lastPiece': False,
            'outOfStock': False,
            'onSale': compare_price > price,
            'preOrder': False
        },
        'rating': {
            'average': round(4.5 + (idx % 5) * 0.1, 1),
            'count': 12 + (idx % 25)
        }
    })

# Write Shopify CSV with UTF-8 BOM for flawless Excel compatibility
shopify_csv_path = r'd:\projects\orca\aura-furniture\public\imports\shopify-products-import.csv'
shopify_headers = list(shopify_rows[0].keys())
with open(shopify_csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=shopify_headers)
    writer.writeheader()
    writer.writerows(shopify_rows)

# Write Vondera Standard CSV with UTF-8 BOM
vondera_csv_path = r'd:\projects\orca\aura-furniture\public\imports\vondera-products-import.csv'
vondera_headers = list(vondera_rows[0].keys())
with open(vondera_csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=vondera_headers)
    writer.writeheader()
    writer.writerows(vondera_rows)

# Write JSON catalog
json_path = r'd:\projects\orca\aura-furniture\src\data\catalog-products.json'
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(catalog_items, f, ensure_ascii=False, indent=2)

print(f"Generated {len(catalog_items)} products successfully:")
print(f"1. Shopify CSV: {shopify_csv_path}")
print(f"2. Vondera CSV: {vondera_csv_path}")
print(f"3. Storefront JSON: {json_path}")
