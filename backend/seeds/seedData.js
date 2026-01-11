import mongoose from 'mongoose';
import Post from '../model/PostModel.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentit');
    
    console.log('Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing posts');

    // Sample posts data
    const samplePosts = [
      {
        name: "Mountain Bike",
        price: 25,
        description: "High-quality mountain bike in excellent condition. Perfect for trails and outdoor adventures.",
        category: "Sports",
        images: [],
        location: {
          city: "San Francisco",
          state: "CA",
          zipCode: "94102"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Camping Tent",
        price: 15,
        description: "2-person camping tent, waterproof and easy to setup. Great for weekend trips.",
        category: "Sports",
        images: [],
        location: {
          city: "San Francisco",
          state: "CA",
          zipCode: "94102"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Laptop Stand",
        price: 10,
        description: "Adjustable laptop stand for better ergonomics while working from home.",
        category: "Electronics",
        images: [],
        location: {
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Dining Table",
        price: 40,
        description: "Beautiful wooden dining table that seats 6. Perfect for dinner parties.",
        category: "Furniture",
        images: [],
        location: {
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Used Sofa",
        price: 50,
        description: "Comfortable gray sofa in good condition. Ideal for living rooms.",
        category: "Furniture",
        images: [],
        location: {
          city: "New York",
          state: "NY",
          zipCode: "10001"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Coffee Maker",
        price: 8,
        description: "Automatic coffee maker with thermal carafe. Brews 12 cups.",
        category: "Home Appliances",
        images: [],
        location: {
          city: "New York",
          state: "NY",
          zipCode: "10001"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Winter Jacket",
        price: 20,
        description: "Warm winter jacket in excellent condition. Perfect for cold weather.",
        category: "Clothing",
        images: [],
        location: {
          city: "Chicago",
          state: "IL",
          zipCode: "60601"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Road Bike",
        price: 35,
        description: "Lightweight road bike perfect for commuting and weekend rides.",
        category: "Sports",
        images: [],
        location: {
          city: "Chicago",
          state: "IL",
          zipCode: "60601"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Microwave Oven",
        price: 12,
        description: "Compact microwave oven, perfect for small kitchens. Works great!",
        category: "Home Appliances",
        images: [],
        location: {
          city: "Seattle",
          state: "WA",
          zipCode: "98101"
        },
        userId: new mongoose.Types.ObjectId(),
      },
      {
        name: "Office Chair",
        price: 30,
        description: "Ergonomic office chair with adjustable height and back support.",
        category: "Furniture",
        images: [],
        location: {
          city: "Seattle",
          state: "WA",
          zipCode: "98101"
        },
        userId: new mongoose.Types.ObjectId(),
      },
    ];

    // Insert sample posts
    const insertedPosts = await Post.insertMany(samplePosts);
    console.log(`Successfully inserted ${insertedPosts.length} posts into the database`);

    // Print summary
    console.log('\n=== Sample Posts Added ===');
    insertedPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.name} - $${post.price}/day`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
