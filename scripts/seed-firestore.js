const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Initialize Firebase Admin with environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = getFirestore(app);

async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');

    // Hero Sections
    const heroSections = [
      {
        title: 'Pelatihan Data Analitik Terbaik di Indonesia',
        subtitle: 'Kuasai kemampuan analisis data dengan mentor berpengalaman',
        backgroundImage: '/uploads/admin/12f6533bf2ab5d10bbc41056cb1d1091d42.png',
        primaryButtonText: 'Mulai Belajar',
        primaryButtonUrl: '#courses',
        secondaryButtonText: 'Lihat Program',
        secondaryButtonUrl: '#programs',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // About Sections
    const aboutSections = [
      {
        title: 'Tentang Kami',
        description: 'Kami adalah platform pembelajaran data analitik terbaik di Indonesia dengan mentor berpengalaman dan kurikulum yang komprehensif.',
        image: '/images/about1.jpg',
        primaryButtonText: 'Pelajari Lebih Lanjut',
        primaryButtonUrl: '#about',
        secondaryButtonText: 'Hubungi Kami',
        secondaryButtonUrl: '#contact',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Experts
    const experts = [
      {
        name: 'Dr. Ahmad Wijaya',
        title: 'Data Scientist Expert',
        image: '/images/expert1.jpg',
        description: '10+ tahun pengalaman dalam data science dan machine learning.',
        specialties: ['Data Science', 'Machine Learning', 'Python'],
        linkedin: '#',
        twitter: '#',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sarah Putri',
        title: 'Business Intelligence Specialist',
        image: '/images/expert2.jpg',
        description: 'Spesialis dalam business intelligence dan data visualization.',
        specialties: ['Business Intelligence', 'Tableau', 'Power BI'],
        linkedin: '#',
        twitter: '#',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Budi Santoso',
        title: 'Data Analytics Consultant',
        image: '/images/expert3.jpg',
        description: 'Konsultan data analytics untuk berbagai industri.',
        specialties: ['Data Analytics', 'SQL', 'R'],
        linkedin: '#',
        twitter: '#',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Portfolios
    const portfolios = [
      {
        title: 'E-commerce Analytics Platform',
        category: 'Data Analytics',
        image: '/images/project1.jpg',
        description: 'Platform analitik untuk e-commerce dengan real-time dashboard.',
        technologies: ['Python', 'React', 'PostgreSQL'],
        projectUrl: '#',
        githubUrl: '#',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Customer Segmentation System',
        category: 'Machine Learning',
        image: '/images/project2.jpg',
        description: 'Sistem segmentasi pelanggan menggunakan machine learning.',
        technologies: ['Python', 'Scikit-learn', 'Pandas'],
        projectUrl: '#',
        githubUrl: '#',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Sales Dashboard Automation',
        category: 'Business Intelligence',
        image: '/images/project3.jpg',
        description: 'Dashboard otomatis untuk monitoring penjualan.',
        technologies: ['Tableau', 'SQL', 'Excel'],
        projectUrl: '#',
        githubUrl: '#',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Academies
    const academies = [
      {
        title: 'Fundamental Data Science',
        description: 'Pelatihan dasar-dasar data science untuk pemula.',
        duration: '3 bulan',
        level: 'Beginner',
        image: '/images/course1.jpg',
        price: 'Rp 5.000.000',
        instructor: 'Dr. Ahmad Wijaya',
        rating: 4.8,
        students: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Advanced Machine Learning',
        description: 'Pelatihan machine learning tingkat lanjut.',
        duration: '6 bulan',
        level: 'Advanced',
        image: '/images/course2.jpg',
        price: 'Rp 10.000.000',
        instructor: 'Sarah Putri',
        rating: 4.9,
        students: 80,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const collections = ['heroSections', 'aboutSections', 'experts', 'portfolios', 'academies'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${collectionName}`);
    }

    // Add new data
    console.log('📝 Adding sample data...');

    // Add Hero Sections
    for (const hero of heroSections) {
      await db.collection('heroSections').add(hero);
    }
    console.log('✅ Added hero sections');

    // Add About Sections
    for (const about of aboutSections) {
      await db.collection('aboutSections').add(about);
    }
    console.log('✅ Added about sections');

    // Add Experts
    for (const expert of experts) {
      await db.collection('experts').add(expert);
    }
    console.log('✅ Added experts');

    // Add Portfolios
    for (const portfolio of portfolios) {
      await db.collection('portfolios').add(portfolio);
    }
    console.log('✅ Added portfolios');

    // Add Academies
    for (const academy of academies) {
      await db.collection('academies').add(academy);
    }
    console.log('✅ Added academies');

    console.log('🎉 Firestore seeding completed successfully!');
    console.log('');
    console.log('📊 Data Summary:');
    console.log(`   Hero Sections: ${heroSections.length}`);
    console.log(`   About Sections: ${aboutSections.length}`);
    console.log(`   Experts: ${experts.length}`);
    console.log(`   Portfolios: ${portfolios.length}`);
    console.log(`   Academies: ${academies.length}`);

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding
seedFirestore().then(() => {
  console.log('✅ Seeding completed');
  process.exit(0);
});
