const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create categories
    const techCategory = await prisma.category.create({
      data: {
        name: 'Technology'
      }
    });
    
    const lifestyleCategory = await prisma.category.create({
      data: {
        name: 'Lifestyle'
      }
    });
    
    console.log('✅ Categories created');
    
    // Create sample user
    const hashedPassword = await bcrypt.hash('SecurePass123!', 12);
    
    const sampleUser = await prisma.user.create({
      data: {
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        age: 25,
        password: hashedPassword,
        provider: 'local'
      }
    });
    
    console.log('✅ Sample user created');
    
    // Create sample posts
    await prisma.post.create({
      data: {
        title: 'Welcome to Our Platform',
        content: 'This is a sample post to demonstrate the functionality of our secure backend API. You can create, read, update, and delete posts through our REST API endpoints.'
      }
    });
    
    await prisma.post.create({
      data: {
        title: 'Getting Started with the API',
        content: 'To get started with our API, first register an account using the /auth/register endpoint. Then login to receive your JWT token for authenticated requests.'
      }
    });
    
    console.log('✅ Sample posts created');
    
    // Create sample profile image
    await prisma.profileImage.create({
      data: {
        url: 'https://via.placeholder.com/150x150/007bff/ffffff?text=Profile',
        altText: 'Sample profile image'
      }
    });
    
    console.log('✅ Sample profile image created');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample data created:');
    console.log('👤 User: john@example.com (password: SecurePass123!)');
    console.log('📂 Categories: Technology, Lifestyle');
    console.log('📝 Posts: 2 sample posts');
    console.log('🖼️  Profile Images: 1 sample image');
    console.log('\n🚀 You can now start the server and test the API!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });