-- Establish formal relationships between products and categories/subcategories
-- (Updated to automatically fix orphaned data)

-- 1. Ensure category names are unique
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END $$;

-- 2. Repair Data: Insert missing categories found in the products table
-- We use default values for icon_name and display_order.
INSERT INTO categories (name, icon_name, active, count, display_order)
SELECT DISTINCT category, 'Package', true, 0, 0
FROM products
WHERE category IS NOT NULL 
  AND category NOT IN (SELECT name FROM categories)
ON CONFLICT (name) DO NOTHING;

-- 3. Add foreign key from products to categories
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_category') THEN
        ALTER TABLE products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category)
        REFERENCES categories(name)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Ensure subcategory names are unique
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subcategories_name_key') THEN
        ALTER TABLE subcategories ADD CONSTRAINT subcategories_name_key UNIQUE (name);
    END IF;
END $$;

-- 5. Repair Data: Insert missing subcategories found in the products table
-- We join with categories to get the correct UUID for category_id
INSERT INTO subcategories (name, category_id, display_order, count)
SELECT DISTINCT p.subcategory, c.id, 0, 0
FROM products p
JOIN categories c ON c.name = p.category
WHERE p.subcategory IS NOT NULL 
  AND p.subcategory NOT IN (SELECT name FROM subcategories)
ON CONFLICT (name) DO NOTHING;

-- 6. Add foreign key from products to subcategories
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_subcategory') THEN
        ALTER TABLE products
        ADD CONSTRAINT fk_products_subcategory
        FOREIGN KEY (subcategory)
        REFERENCES subcategories(name)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;
END $$;
