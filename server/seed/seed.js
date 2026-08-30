const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const Review = require('../models/Review');

const products = [
  // --- Skinny ---
  {
    name: 'Classic Dark Wash Skinny',
    description: 'Timeless dark indigo skinny jeans with a sleek silhouette. Premium stretch denim for all-day comfort and a flattering fit.',
    category: 'Skinny',
    price: 120,
    sizes: ['26', '28', '30', '32', '34', '36'],
    stock: 25,
    isNewArrival: true,
    images: [],
  },
  {
    name: 'Jet Black Skinny Fit',
    description: 'Ultra-slim jet black jeans crafted from soft-stretch denim. Perfect for both casual and dressy occasions.',
    category: 'Skinny',
    price: 135,
    sizes: ['26', '28', '30', '32', '34'],
    stock: 18,
    images: [],
  },
  {
    name: 'Faded Blue Skinny',
    description: 'Light blue faded skinny jeans with a vintage wash effect. A wardrobe staple for effortless everyday style.',
    category: 'Skinny',
    price: 110,
    discountPercent: 15,
    saleStartsAt: new Date(),
    saleEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    sizes: ['28', '30', '32', '34', '36'],
    stock: 30,
    isFlashSale: true,
    images: [],
  },

  // --- Straight ---
  {
    name: 'Indigo Straight Leg',
    description: 'Classic straight-leg jeans in a rich indigo wash. Relaxed through the thigh with a straight cut to the ankle.',
    category: 'Straight',
    price: 125,
    sizes: ['28', '30', '32', '34', '36', '38'],
    stock: 22,
    isNewArrival: true,
    images: [],
  },
  {
    name: 'Stone Wash Straight',
    description: 'Medium stone wash straight-leg denim with a comfortable mid-rise fit. Durable construction for everyday wear.',
    category: 'Straight',
    price: 115,
    sizes: ['26', '28', '30', '32', '34', '36'],
    stock: 20,
    images: [],
  },
  {
    name: 'Raw Selvedge Straight',
    description: 'Premium raw selvedge denim in a straight cut. Develops unique fading patterns with wear for a truly personal pair.',
    category: 'Straight',
    price: 180,
    discountPercent: 20,
    saleStartsAt: new Date(),
    saleEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    sizes: ['30', '32', '34', '36'],
    stock: 12,
    isFlashSale: true,
    images: [],
  },

  // --- Ripped ---
  {
    name: 'Distressed Knee Ripped',
    description: 'Trendy ripped jeans with strategically placed knee distressing. Slim fit with authentic worn-in character.',
    category: 'Ripped',
    price: 140,
    sizes: ['26', '28', '30', '32', '34'],
    stock: 15,
    isNewArrival: true,
    images: [],
  },
  {
    name: 'Heavy Distressed Ripped',
    description: 'Bold heavy-distressed jeans with multiple rip details. Makes a statement with every step.',
    category: 'Ripped',
    price: 150,
    sizes: ['28', '30', '32', '34', '36'],
    stock: 10,
    images: [],
  },
  {
    name: 'Light Wash Ripped Ankle',
    description: 'Cropped ankle-length ripped jeans in a fresh light wash. Perfect for showing off your favourite sneakers.',
    category: 'Ripped',
    price: 130,
    sizes: ['26', '28', '30', '32'],
    stock: 20,
    images: [],
  },

  // --- Mom Fit ---
  {
    name: 'High-Rise Mom Jeans',
    description: 'Authentic high-waisted mom jeans with a relaxed tapered leg. Vintage-inspired fit that flatters every body type.',
    category: 'Mom Fit',
    price: 135,
    sizes: ['26', '28', '30', '32', '34', '36'],
    stock: 28,
    isNewArrival: true,
    images: [],
  },
  {
    name: 'Acid Wash Mom Fit',
    description: 'Retro acid wash mom jeans with a comfortable high rise. Brings 90s nostalgia to your modern wardrobe.',
    category: 'Mom Fit',
    price: 125,
    sizes: ['26', '28', '30', '32', '34'],
    stock: 16,
    images: [],
  },
  {
    name: 'Dark Blue Mom Jeans',
    description: 'Deep dark blue mom jeans with a clean, polished look. Versatile enough for work and weekend.',
    category: 'Mom Fit',
    price: 130,
    discountPercent: 10,
    saleStartsAt: new Date(),
    saleEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sizes: ['28', '30', '32', '34', '36'],
    stock: 22,
    isFlashSale: true,
    images: [],
  },

  // --- Baggy ---
  {
    name: 'Loose Fit Cargo Baggy',
    description: 'Relaxed baggy jeans with functional cargo pockets. Urban streetwear vibes with maximum comfort.',
    category: 'Baggy',
    price: 155,
    sizes: ['28', '30', '32', '34', '36', '38'],
    stock: 14,
    images: [],
  },
  {
    name: 'Washed Out Baggy Denim',
    description: 'Super relaxed baggy jeans with an authentic washed-out finish. The ultimate in laid-back denim style.',
    category: 'Baggy',
    price: 140,
    sizes: ['30', '32', '34', '36', '38'],
    stock: 18,
    images: [],
  },
  {
    name: 'Oversized Streetwear Baggy',
    description: 'Extra-wide oversized baggy jeans for that bold streetwear look. Features reinforced stitching and deep pockets.',
    category: 'Baggy',
    price: 160,
    sizes: ['30', '32', '34', '36', '38', '40'],
    stock: 10,
    isNewArrival: false,
    images: [],
  },

  // --- Wide Leg ---
  {
    name: 'Flared Wide Leg Classic',
    description: 'Elegant wide-leg jeans with a subtle flare. High-waisted design creates a long, lean silhouette.',
    category: 'Wide Leg',
    price: 145,
    sizes: ['26', '28', '30', '32', '34'],
    stock: 20,
    images: [],
  },
  {
    name: 'Palazzo Wide Leg Denim',
    description: 'Extra-wide palazzo-style denim trousers with a flowing, dramatic silhouette. Dress up or down with ease.',
    category: 'Wide Leg',
    price: 165,
    sizes: ['26', '28', '30', '32', '34', '36'],
    stock: 12,
    isNewArrival: false,
    images: [],
  },
  {
    name: 'Cropped Wide Leg Blue',
    description: 'Cropped wide-leg jeans in a vibrant medium blue wash. Ankle-length cut pairs perfectly with heels or sandals.',
    category: 'Wide Leg',
    price: 138,
    sizes: ['26', '28', '30', '32', '34'],
    stock: 15,
    images: [],
  },
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Admin.deleteMany({});
    await Settings.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared!\n');

    // Seed products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`  ✓ ${createdProducts.length} products created\n`);

    // Seed admin
    console.log('Creating default admin...');
    await Admin.create({
      email: 'admin@ritajeans.com',
      password: 'changeme123',
      role: 'admin',
    });
    console.log('  ✓ Admin created (admin@ritajeans.com / changeme123)\n');

    // Seed settings
    console.log('Creating default settings...');
    await Settings.create({
      deliveryFee: 20,
      currency: 'GH₵',
      businessPhone: '059217747',
      businessName: 'Rita Jeans',
      locations: ['La Paz', 'Ablekuma'],
    });
    console.log('  ✓ Settings created\n');

    // Add some sample reviews
    console.log('Adding sample reviews...');
    const sampleReviews = [
      { productId: createdProducts[0]._id, customerName: 'Ama K.', rating: 5, comment: 'Perfect fit! The quality is amazing and it arrived quickly.', isApproved: true },
      { productId: createdProducts[0]._id, customerName: 'Kwame B.', rating: 4, comment: 'Great jeans, very comfortable. Would buy again.', isApproved: true },
      { productId: createdProducts[3]._id, customerName: 'Abena M.', rating: 5, comment: 'Love the color and the straight fit is just right.', isApproved: true },
      { productId: createdProducts[6]._id, customerName: 'Yaw D.', rating: 4, comment: 'The ripped look is fire! Good quality denim.', isApproved: true },
      { productId: createdProducts[9]._id, customerName: 'Efua S.', rating: 5, comment: 'Best mom jeans I\'ve ever owned. So flattering!', isApproved: true },
    ];
    await Review.insertMany(sampleReviews);

    // Update ratings for reviewed products
    for (const review of sampleReviews) {
      await Review.updateProductRating(review.productId);
    }
    console.log(`  ✓ ${sampleReviews.length} reviews created\n`);

    console.log('============================');
    console.log('  Database seeded successfully!');
    console.log('============================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
