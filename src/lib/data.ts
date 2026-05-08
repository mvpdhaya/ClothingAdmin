import { Shirt, Watch, Zap } from "lucide-react";

export const initialMainCategories = [
  { id: 1, name: "Clothing", icon: Shirt, count: 84, active: true },
  { id: 2, name: "Accessories", icon: Watch, count: 32, active: false },
  { id: 3, name: "Flash Sale", icon: Zap, count: 12, active: false },
];

export const initialSubcategoriesData = {
  "Clothing": [
    { 
      id: 101, 
      name: "Menswear", 
      count: 24,
      children: [
        { id: 1011, name: "Jeans", count: 10 },
        { id: 1012, name: "Shirt", count: 14 }
      ]
    },
    { id: 102, name: "Womenswear", count: 38 },
    { id: 103, name: "Knitwear", count: 12 },
    { id: 104, name: "Outerwear", count: 10 },
  ],
  "Accessories": [
    { id: 201, name: "Jewelry", count: 15 },
    { id: 202, name: "Bags", count: 8 },
    { id: 203, name: "Belts", count: 5 },
    { id: 204, name: "Wallets", count: 4 },
  ],
  "Flash Sale": [
    { id: 301, name: "Trending", count: 6 },
    { id: 302, name: "Last Chance", count: 6 },
  ]
};

export const initialProducts = [
  { 
    id: "PROD-001", 
    name: "Classic Silk Shirt", 
    subcategory: "Menswear",
    category: "Clothing", 
    price: 120.00, 
    oldPrice: 150.00,
    discount: "20%",
    stock: 45, 
    stockStatus: "In Stock",
    status: "Active",
    badges: ["NEW"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop"
  },
  { 
    id: "PROD-002", 
    name: "Tailored Wool Trousers", 
    subcategory: "Menswear",
    category: "Clothing", 
    price: 180.00, 
    stock: 12, 
    stockStatus: "Low Stock",
    status: "Active",
    badges: [],
    image: "https://images.unsplash.com/photo-1624371414361-e6e8ea402030?w=100&h=100&fit=crop"
  },
  { 
    id: "PROD-003", 
    name: "Gold Chain Necklace", 
    subcategory: "Jewelry",
    category: "Accessories", 
    price: 85.00, 
    oldPrice: 120.00,
    discount: "30%",
    stock: 0, 
    stockStatus: "Out of Stock",
    status: "Draft",
    badges: ["SALE", "FLASH"],
    image: "https://images.unsplash.com/photo-1535633302723-9993d57af2aa?w=100&h=100&fit=crop"
  },
  { 
    id: "PROD-004", 
    name: "Linen Summer Dress", 
    subcategory: "Womenswear",
    category: "Clothing", 
    price: 145.00, 
    stock: 89, 
    stockStatus: "In Stock",
    status: "Active",
    badges: ["NEW"],
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=100&h=100&fit=crop"
  },
  { 
    id: "PROD-005", 
    name: "Leather Handbag", 
    subcategory: "Bags",
    category: "Accessories", 
    price: 320.00, 
    stock: 24, 
    stockStatus: "In Stock",
    status: "Active",
    badges: [],
    image: "https://images.unsplash.com/photo-1584917033904-491a84b2efbd?w=100&h=100&fit=crop"
  },
];
