-- Establish relationship between order_items and products
-- Using TEXT type because product IDs follow a custom format (e.g., PROD-XXXX)

-- 1. Drop existing constraint if it exists
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_products;

-- 2. Add the foreign key constraint (between TEXT columns)
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_products
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE SET NULL;
