import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import { Review } from "@/models/Review";

// Helper function to generate slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

const seedData = {
  users: [
    {
      name: "Admin User",
      email: "admin@draprly.com",
      password: bcrypt.hashSync("admin123", 12), // Fixed: Use hashSync for synchronous hashing
      role: "admin",
      isVerified: true,
      isActive: true,
      avatar: "/placeholder-user.jpg",
      preferences: {
        language: "en",
        currency: "INR",
        newsletter: true,
        notifications: true,
        theme: "light",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "John Doe",
      email: "john@example.com",
      password: bcrypt.hashSync("password123", 12), // Fixed: Use hashSync
      role: "customer",
      isVerified: true,
      isActive: true,
      phone: "+91 98765 43210",
      avatar: "/placeholder-user.jpg",
      preferences: {
        language: "en",
        currency: "INR",
        newsletter: true,
        notifications: true,
        theme: "light",
      },
      addresses: [
        {
          type: "home",
          name: "John Doe",
          phone: "+91 98765 43210",
          address: "123 Main Street, Apartment 4B",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: bcrypt.hashSync("password123", 12), // Fixed: Use hashSync
      role: "seller",
      isVerified: true,
      isActive: true,
      phone: "+91 98765 43211",
      avatar: "/placeholder-user.jpg",
      preferences: {
        language: "en",
        currency: "INR",
        newsletter: true,
        notifications: true,
        theme: "light",
      },
      sellerInfo: {
        businessName: "Jane's Electronics",
        gstNumber: "GST123456789",
        panNumber: "ABCDE1234F",
        bankDetails: {
          accountNumber: "1234567890",
          ifscCode: "HDFC0001234",
          accountHolderName: "Jane Smith",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  products: [
    {
      name: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      description: "Premium quality wireless headphones with noise cancellation and 30-hour battery life.",
      price: 2999,
      originalPrice: 3999,
      category: "Electronics",
      subcategory: "Audio",
      brand: "TechSound",
      sku: "TS-WH-001",
      stock: 50,
      reorderLevel: 10,
      maxStock: 200,
      images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
      specifications: {
        "Battery Life": "30 hours",
        Connectivity: "Bluetooth 5.0",
        Weight: "250g",
        Color: "Black",
        Warranty: "1 year",
      },
      features: [
        "Active Noise Cancellation",
        "Quick Charge - 5 min for 2 hours",
        "Premium Sound Quality",
        "Comfortable Fit",
      ],
      tags: ["wireless", "bluetooth", "headphones", "audio"],
      isActive: true,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 128,
      seoTitle: "Best Wireless Bluetooth Headphones - TechSound",
      seoDescription: "Premium wireless headphones with noise cancellation and long battery life.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Smartphone Case - Clear",
      slug: "smartphone-case-clear",
      description: "Crystal clear protective case for smartphones with drop protection.",
      price: 299,
      originalPrice: 499,
      category: "Electronics",
      subcategory: "Accessories",
      brand: "ProtectPro",
      sku: "PP-SC-002",
      stock: 100,
      reorderLevel: 20,
      maxStock: 500,
      images: ["/placeholder.jpg", "/placeholder.jpg"],
      specifications: {
        Material: "TPU + PC",
        Compatibility: "Universal",
        Color: "Clear",
        "Drop Protection": "Up to 6 feet",
      },
      features: ["Crystal Clear Design", "Drop Protection", "Easy Installation", "Wireless Charging Compatible"],
      tags: ["phone case", "clear", "protection", "accessories"],
      isActive: true,
      isFeatured: false,
      rating: 4.2,
      reviewCount: 89,
      seoTitle: "Clear Smartphone Case with Drop Protection",
      seoDescription: "Protect your phone with our crystal clear case featuring drop protection.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Cotton T-Shirt - Navy Blue",
      slug: "cotton-t-shirt-navy-blue",
      description: "Comfortable 100% cotton t-shirt perfect for casual wear.",
      price: 599,
      originalPrice: 799,
      category: "Fashion",
      subcategory: "Men's Clothing",
      brand: "ComfortWear",
      sku: "CW-TS-003",
      stock: 75,
      reorderLevel: 15,
      maxStock: 300,
      images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
      specifications: {
        Material: "100% Cotton",
        Fit: "Regular",
        Color: "Navy Blue",
        Care: "Machine Wash",
      },
      variants: [
        { size: "S", color: "Navy Blue", stock: 15 },
        { size: "M", color: "Navy Blue", stock: 25 },
        { size: "L", color: "Navy Blue", stock: 20 },
        { size: "XL", color: "Navy Blue", stock: 15 },
      ],
      features: ["Soft Cotton Fabric", "Comfortable Fit", "Durable Quality", "Easy Care"],
      tags: ["t-shirt", "cotton", "casual", "men"],
      isActive: true,
      isFeatured: true,
      rating: 4.3,
      reviewCount: 156,
      seoTitle: "Comfortable Cotton T-Shirt for Men - Navy Blue",
      seoDescription: "100% cotton t-shirt in navy blue, perfect for casual everyday wear.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours.",
      price: 899,
      originalPrice: 1199,
      category: "Home & Kitchen",
      subcategory: "Drinkware",
      brand: "HydroMax",
      sku: "HM-WB-004",
      stock: 60,
      reorderLevel: 12,
      maxStock: 250,
      images: ["/placeholder.jpg", "/placeholder.jpg"],
      specifications: {
        Capacity: "750ml",
        Material: "Stainless Steel",
        Insulation: "Double Wall",
        Color: "Silver",
      },
      features: ["24-hour Cold Retention", "BPA Free", "Leak Proof Design", "Easy to Clean"],
      tags: ["water bottle", "stainless steel", "insulated", "hydration"],
      isActive: true,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 203,
      seoTitle: "Insulated Stainless Steel Water Bottle - 750ml",
      seoDescription: "Keep your drinks cold for 24 hours with our premium insulated water bottle.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Yoga Mat - Premium",
      slug: "yoga-mat-premium",
      description: "Non-slip yoga mat made from eco-friendly materials, perfect for all yoga practices.",
      price: 1299,
      originalPrice: 1699,
      category: "Sports & Fitness",
      subcategory: "Yoga",
      brand: "ZenFit",
      sku: "ZF-YM-005",
      stock: 40,
      reorderLevel: 8,
      maxStock: 150,
      images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
      specifications: {
        Dimensions: "183cm x 61cm",
        Thickness: "6mm",
        Material: "TPE",
        Color: "Purple",
      },
      features: ["Non-Slip Surface", "Eco-Friendly Material", "Lightweight & Portable", "Easy to Clean"],
      tags: ["yoga mat", "fitness", "exercise", "eco-friendly"],
      isActive: true,
      isFeatured: true,
      rating: 4.4,
      reviewCount: 92,
      seoTitle: "Premium Non-Slip Yoga Mat - Eco-Friendly",
      seoDescription: "Practice yoga comfortably with our premium non-slip, eco-friendly yoga mat.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  coupons: [
    {
      code: "WELCOME20",
      description: "Welcome offer - 20% off on your first order",
      discountType: "percentage",
      discountValue: 20,
      maxDiscountAmount: 500,
      minOrderAmount: 999,
      usageLimit: 1000,
      usedCount: 156,
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2024-12-31"),
      isActive: true,
      applicableCategories: [],
      applicableProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "SAVE100",
      description: "Flat ₹100 off on orders above ₹1999",
      discountType: "fixed",
      discountValue: 100,
      minOrderAmount: 1999,
      usageLimit: 500,
      usedCount: 89,
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2024-06-30"),
      isActive: true,
      applicableCategories: [],
      applicableProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "ELECTRONICS15",
      description: "15% off on all electronics",
      discountType: "percentage",
      discountValue: 15,
      maxDiscountAmount: 1000,
      minOrderAmount: 1499,
      usageLimit: 200,
      usedCount: 45,
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2024-03-31"),
      isActive: true,
      applicableCategories: ["Electronics"],
      applicableProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  orders: [
    {
      orderNumber: "DR2024001",
      userId: null, // Will be set after user creation
      items: [
        {
          productId: null, // Will be set after product creation
          name: "Wireless Bluetooth Headphones",
          price: 2999,
          quantity: 1,
          image: "/placeholder.jpg",
        },
      ],
      totalAmount: 3098,
      status: "delivered",
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      shippingAddress: {
        name: "John Doe",
        phone: "+91 98765 43210",
        address: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      trackingNumber: "DR2024001TRK",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(),
    },
    {
      orderNumber: "DR2024002",
      userId: null, // Will be set after user creation
      items: [
        {
          productId: null, // Will be set after product creation
          name: "Smartphone Case - Clear",
          price: 299,
          quantity: 2,
          image: "/placeholder.jpg",
        },
        {
          productId: null, // Will be set after product creation
          name: "Cotton T-Shirt - Navy Blue",
          price: 599,
          quantity: 1,
          image: "/placeholder.jpg",
        },
      ],
      totalAmount: 1296,
      status: "shipped",
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      shippingAddress: {
        name: "John Doe",
        phone: "+91 98765 43210",
        address: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      trackingNumber: "DR2024002TRK",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(),
    },
  ],
  reviews: [
    {
      productId: null, // Will be set after product creation
      userId: null, // Will be set after user creation
      rating: 5,
      title: "Excellent sound quality!",
      comment:
        "These headphones are amazing. The sound quality is crystal clear and the battery life is exactly as advertised. Highly recommended!",
      isVerified: true,
      isHelpful: 12,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      productId: null, // Will be set after product creation
      userId: null, // Will be set after user creation
      rating: 4,
      title: "Good protection",
      comment: "The case fits perfectly and provides good protection. It's truly clear and doesn't yellow over time.",
      isVerified: true,
      isHelpful: 8,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ],
};

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    // Insert users
    console.log("Inserting users...");
    const userResult = await User.insertMany(seedData.users);
    const userMap = new Map(userResult.map(user => [user.email, user._id]));

    // Insert products with seller assigned
    console.log("Inserting products...");
    const sellerId = userMap.get("jane@example.com"); // Jane Smith is the seller
    const productsWithSeller = seedData.products.map(product => ({
      ...product,
      seller: sellerId,
    }));
    const productResult = await Product.insertMany(productsWithSeller);
    const productMap = new Map(productResult.map(product => [product.name, product._id]));

    // Update orders with user and product references
    console.log("Updating orders...");
    const johnUserId = userMap.get("john@example.com");
    const updatedOrders = seedData.orders.map(order => {
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 99; // Fixed shipping cost
      const total = subtotal + shipping;
      
      return {
        orderNumber: order.orderNumber,
        user: johnUserId, // Changed from userId to user
        subtotal: subtotal, // Added required subtotal
        total: total, // Changed from totalAmount to total
        shipping: shipping, // Added shipping cost
        paymentStatus: order.paymentStatus === "paid" ? "completed" : order.paymentStatus, // Fix enum value
        paymentMethod: order.paymentMethod,
        status: order.status,
        trackingNumber: order.trackingNumber,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          product: productMap.get(item.name), // Changed from productId to product
          quantity: item.quantity,
          price: item.price,
          seller: sellerId, // Added required seller field
        })),
      };
    });
    const orderResult = await Order.insertMany(updatedOrders);

    // Update reviews with user, product, and order references
    console.log("Updating reviews...");
    const updatedReviews = seedData.reviews.map((review, index) => ({
      user: johnUserId, // Changed from userId to user
      product: productMap.get(review.title.includes("headphones") ? "Wireless Bluetooth Headphones" : "Smartphone Case - Clear"), // Changed from productId to product
      order: orderResult[0]._id, // Add required order reference using actual order ID
      rating: review.rating,
      comment: review.comment,
      verified: review.isVerified, // Changed from isVerified to verified
      helpful: review.isHelpful, // Changed from isHelpful to helpful
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
    await Review.insertMany(updatedReviews);

    // Insert coupons with createdBy field
    console.log("Inserting coupons...");
    const adminUserId = userMap.get("admin@draprly.com"); // Admin creates the coupons
    const couponsWithCreator = seedData.coupons.map(coupon => ({
      ...coupon,
      createdBy: adminUserId,
    }));
    await Coupon.insertMany(couponsWithCreator);

    console.log("Database seeded successfully!");
    console.log(`Inserted ${userResult.length} users`);
    console.log(`Inserted ${productResult.length} products`);
    console.log(`Inserted ${seedData.coupons.length} coupons`);
    console.log(`Inserted ${orderResult.length} orders`);
    console.log(`Inserted ${updatedReviews.length} reviews`);

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
