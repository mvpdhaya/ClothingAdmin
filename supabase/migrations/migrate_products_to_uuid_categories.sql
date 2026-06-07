-- MIGRATE PRODUCTS TO UUID-BASED CATEGORIES
-- This script converts the text columns to UUID references.

-- 1. Preparation: Add temporary UUID columns
ALTER TABLE products ADD COLUMN category_id uuid;
ALTER TABLE products ADD COLUMN subcategory_id uuid;

-- 2. Data Reconciliation: Insert missing categories/subcategories to prevent data loss
-- Repair Categories
INSERT INTO categories (name, icon_name, active, count, display_order)
SELECT DISTINCT category, 'Package', true, 0, 0
FROM products
WHERE category IS NOT NULL 
  AND category NOT IN (SELECT name FROM categories)
ON CONFLICT (name) DO NOTHING;

-- Repair Subcategories
INSERT INTO subcategories (name, category_id, display_order, count)
SELECT DISTINCT p.subcategory, c.id, 0, 0
FROM products p
JOIN categories c ON c.name = p.category
WHERE p.subcategory IS NOT NULL 
  AND p.subcategory NOT IN (SELECT name FROM subcategories)
ON CONFLICT (name) DO NOTHING;

-- 3. Populate new ID columns
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category = c.name;

UPDATE products p
SET subcategory_id = s.id
FROM subcategories s
WHERE p.subcategory = s.name;

-- 4. Drop old text columns
ALTER TABLE products DROP COLUMN category;
ALTER TABLE products DROP COLUMN subcategory;

-- 5. Rename new columns to final names
ALTER TABLE products RENAME COLUMN category_id TO category;
ALTER TABLE products RENAME COLUMN subcategory_id TO subcategory;

-- 6. Add formal foreign key constraints
ALTER TABLE products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category)
REFERENCES categories(id)
ON DELETE SET NULL;

ALTER TABLE products
ADD CONSTRAINT fk_products_subcategory
FOREIGN KEY (subcategory)
REFERENCES subcategories(id)
ON DELETE SET NULL;
