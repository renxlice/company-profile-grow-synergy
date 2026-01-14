import * as admin from 'firebase-admin';
import serviceAccount from '../../config/firebase-service-account.json';

// Initialize Firebase Admin SDK
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

// Check if we want to use Firebase or Mock mode
const USE_FIREBASE = true; // Firebase is now working!

if (USE_FIREBASE && !admin.apps.length) {
  try {
    console.log('🔥 Initializing Firebase in production mode...');
    
    admin.initializeApp({
      credential: admin.credential.cert(
        serviceAccount as admin.ServiceAccount
      ),
      projectId: serviceAccount.project_id
    });

    db = admin.firestore();
    storage = admin.storage();

    console.log('✅ Firebase initialization successful!');
    
    // Test connection
    const testConnection = async () => {
      try {
        console.log('🔍 Testing Firebase connection...');
        await db.collection('test').limit(1).get();
        console.log('✅ Firebase connection test successful');
      } catch (error) {
        console.error('❌ Firebase connection test failed:', error.message);
        console.error('🔄 Falling back to mock mode...');
        initializeMockMode();
      }
    };
    
    setTimeout(testConnection, 2000);
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('🔄 Using mock mode for development');
    initializeMockMode();
  }
} else {
  console.log('🧪 Using mock mode for development');
  console.log('💡 To use Firebase, set NODE_ENV=production or FORCE_FIREBASE=true');
  initializeMockMode();
}

function initializeMockMode() {
  console.log('Initializing mock mode for development');
  
  // Mock Firestore with sample data for dashboard
  const mockData = {
    heroSection: [
      {
        id: 'mock-hero-1',
        title: 'Welcome to GROW SYNERGY INDONESIA',
        subtitle: 'Platform terbaik untuk pengembangan profesional',
        backgroundImage: '/uploads/admin/f4e88ab5e1beeab152609db1096dc6de.png',
        buttonText1: 'Mulai Sekarang',
        buttonText2: 'Pelajari Lebih Lanjut',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    aboutSection: [
      {
        id: 'mock-about-1',
        title: 'Tentang Kami',
        description: 'GROW SYNERGY INDONESIA adalah platform terkemuka yang menghubungkan para profesional dengan peluang pengembangan karir terbaik.',
        image: '/images/about-us.jpg',
        buttonText1: 'Tonton Video',
        buttonText2: 'Lebih Lanjut',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    experts: [
      {
        id: 'mock-expert-1',
        name: 'Dr. Budi Santoso',
        position: 'Senior Data Scientist',
        experience: '10+ Tahun',
        rating: 4.8,
        reviewCount: 150,
        description: 'Expert dalam machine learning dan AI',
        image: '/images/experts/expert1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-expert-2',
        name: 'Siti Nurhaliza',
        position: 'Business Intelligence Expert',
        experience: '8+ Tahun',
        rating: 4.9,
        reviewCount: 200,
        description: 'Spesialis dalam BI dan dashboard development',
        image: '/images/experts/expert2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    portfolios: [
      {
        id: 'mock-portfolio-1',
        title: 'E-Commerce Platform',
        category: 'Web Development',
        description: 'Platform e-commerce modern dengan React dan Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'],
        projectUrl: '#',
        githubUrl: '#',
        image: '/images/portfolio/project1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-portfolio-2',
        title: 'Mobile Banking App',
        category: 'Mobile Development',
        description: 'Aplikasi mobile banking dengan Flutter',
        technologies: ['Flutter', 'Firebase', 'Node.js'],
        projectUrl: '#',
        githubUrl: '#',
        image: '/images/portfolio/project2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    academies: [
      {
        id: 'mock-academy-1',
        title: 'Data Science Fundamentals',
        author: 'Dr. Budi Santoso',
        price: 'Rp 2.500.000',
        rating: 4.7,
        studentCount: 150,
        duration: '8 Minggu',
        certification: 'Yes',
        level: 'Beginner',
        schedule: 'Weekend',
        mode: 'Online',
        description: 'Pengenalan dasar data science dan machine learning',
        image: '/images/courses/course1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-academy-2',
        title: 'Advanced React Development',
        author: 'Siti Nurhaliza',
        price: 'Rp 3.000.000',
        rating: 4.8,
        studentCount: 200,
        duration: '10 Minggu',
        certification: 'Yes',
        level: 'Advanced',
        schedule: 'Weekday',
        mode: 'Hybrid',
        description: 'React advanced patterns dan best practices',
        image: '/images/courses/course2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  };

  // Mock Firestore implementation
  db = {
    collection: (collectionName: string) => ({
      get: async () => {
        const data = mockData[collectionName as keyof typeof mockData] || [];
        return {
          docs: data.map(item => ({
            id: item.id,
            data: () => item,
            exists: true
          }))
        };
      },
      add: async (data: any) => {
        console.log('Mock: Adding data to', collectionName, ':', data);
        const newId = 'mock-' + Date.now();
        const newItem = { ...data, id: newId, createdAt: new Date(), updatedAt: new Date() };
        
        // Add to mock data
        if (mockData[collectionName as keyof typeof mockData]) {
          (mockData[collectionName as keyof typeof mockData] as any[]).push(newItem);
        }
        
        return {
          get: async () => ({
            id: newId,
            data: () => newItem
          })
        };
      },
      doc: (id: string) => ({
        get: async () => {
          const data = mockData[collectionName as keyof typeof mockData] || [];
          const item = data.find((item: any) => item.id === id);
          return {
            exists: !!item,
            id: id,
            data: () => item || {}
          };
        },
        update: async (updateData: any) => {
          console.log('Mock: Updating', collectionName, 'with id', id, ':', updateData);
          const data = mockData[collectionName as keyof typeof mockData] || [];
          const index = data.findIndex((item: any) => item.id === id);
          if (index !== -1) {
            (data as any)[index] = { ...data[index], ...updateData, updatedAt: new Date() };
          }
        },
        delete: async () => {
          console.log('Mock: Deleting', collectionName, 'with id', id);
          const data = mockData[collectionName as keyof typeof mockData] || [];
          const index = data.findIndex((item: any) => item.id === id);
          if (index !== -1) {
            data.splice(index, 1);
          }
        }
      })
    }),
  } as any;

  // Mock Storage
  storage = {} as any;
}

export { db, storage };
export default admin;
