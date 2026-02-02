import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
export let db: admin.firestore.Firestore;
export let storage: admin.storage.Storage;

// Mock data for development/fallback
const mockData = {
  home: {
    title: "Pelatihan Data Analitik Terbaik di Indonesia #1",
    description: "Kursus Online Bersertifikat BNSP | GROW SYNERGY INDONESIA",
    heroTitle: "Transformasi Karir dengan Data Analitik",
    heroDescription: "Pelatihan intensif dengan mentor profesional dan proyek real-world"
  },
  about: {
    title: "Tentang GROW SYNERGY INDONESIA",
    description: "Platform pembelajaran data analitik terbaik di Indonesia",
    content: "GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik dengan kurikulum terbaik dan mentor berpengalaman."
  },
  academy: {
    title: "Synergy Academy",
    description: "Platform pembelajaran data analitik dengan kurikulum terbaik",
    courses: [
      { title: "Data Analyst Fundamentals", duration: "3 bulan" },
      { title: "Advanced SQL & Visualization", duration: "2 bulan" },
      { title: "Machine Learning Basics", duration: "4 bulan" }
    ]
  },
  experts: {
    title: "Synergy Experts",
    description: "Tim ahli data analitik dengan pengalaman profesional",
    team: [
      { name: "Dr. Ahmad Wijaya", expertise: "Data Science" },
      { name: "Sarah Putri", expertise: "Business Intelligence" },
      { name: "Budi Santoso", expertise: "Machine Learning" }
    ]
  },
  portfolio: {
    title: "Synergy Portfolio", 
    description: "Koleksi proyek dan studi kasus data analitik kami",
    projects: [
      { title: "Retail Analytics Dashboard", client: "PT. Retail Maju" },
      { title: "Sales Prediction Model", client: "PT. Sales Global" },
      { title: "Customer Segmentation", client: "PT. Customer First" }
    ]
  }
};

// Helper function to reconstruct private key from parts
function reconstructPrivateKey(): string | null {
  try {
    // Try different combinations of environment variables
    const combinations = [
      // Full private key
      process.env.FIREBASE_PRIVATE_KEY,
      // Split into 2 parts
      process.env.FIREBASE_PRIVATE_KEY_PART1 && process.env.FIREBASE_PRIVATE_KEY_PART2 
        ? process.env.FIREBASE_PRIVATE_KEY_PART1 + process.env.FIREBASE_PRIVATE_KEY_PART2 
        : null,
      // Split into 3 parts
      process.env.FIREBASE_PRIVATE_KEY_PART1 && process.env.FIREBASE_PRIVATE_KEY_PART2 && process.env.FIREBASE_PRIVATE_KEY_PART3
        ? process.env.FIREBASE_PRIVATE_KEY_PART1 + process.env.FIREBASE_PRIVATE_KEY_PART2 + process.env.FIREBASE_PRIVATE_KEY_PART3
        : null,
      // Split into 4 parts
      process.env.FIREBASE_PRIVATE_KEY_PART1 && process.env.FIREBASE_PRIVATE_KEY_PART2 && 
      process.env.FIREBASE_PRIVATE_KEY_PART3 && process.env.FIREBASE_PRIVATE_KEY_PART4
        ? process.env.FIREBASE_PRIVATE_KEY_PART1 + process.env.FIREBASE_PRIVATE_KEY_PART2 + 
          process.env.FIREBASE_PRIVATE_KEY_PART3 + process.env.FIREBASE_PRIVATE_KEY_PART4
        : null,
    ];

    for (const privateKey of combinations) {
      if (privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        // Clean up the private key format
        return privateKey.replace(/\\n/g, '\n').replace(/\n/g, '\n').trim();
      }
    }
    return null;
  } catch (error) {
    console.error('Error reconstructing private key:', error);
    return null;
  }
}

// Helper function to get project ID
function getProjectId(): string | null {
  try {
    // Try different combinations
    const combinations = [
      // Full project ID
      process.env.FIREBASE_PROJECT_ID,
      // Split into 2 parts
      process.env.FIREBASE_PROJECT_ID_PART1 && process.env.FIREBASE_PROJECT_ID_PART2 
        ? process.env.FIREBASE_PROJECT_ID_PART1 + process.env.FIREBASE_PROJECT_ID_PART2 
        : null,
      // Just first part
      process.env.FIREBASE_PROJECT_ID_PART1,
    ];

    for (const projectId of combinations) {
      if (projectId && projectId.trim()) {
        return projectId.trim();
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting project ID:', error);
    return null;
  }
}

// Initialize Firebase with robust error handling
function initializeFirebase() {
  console.log('🔧 Initializing Firebase...');
  
  try {
    // Get project ID and private key
    const projectId = getProjectId();
    const privateKey = reconstructPrivateKey();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@company-profile-grow-synergy.iam.gserviceaccount.com';
    
    console.log('📋 Firebase config check:');
    console.log('   Project ID:', projectId ? 'SET' : 'NOT SET');
    console.log('   Private Key:', privateKey ? 'SET' : 'NOT SET');
    console.log('   Client Email:', clientEmail ? 'SET' : 'NOT SET');
    
    if (projectId && privateKey) {
      const serviceAccount = {
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || projectId + '.appspot.com',
      });
      
      if (admin.apps.length > 0) {
        db = admin.firestore();
        storage = admin.storage();
        console.log('✅ Firebase initialized successfully');
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
  
  // Fallback to mock mode
  console.log('🔄 Using mock mode for development');
  db = null as any;
  storage = null as any;
  return false;
}

// Try to initialize Firebase
const firebaseEnabled = initializeFirebase();

export class FirebaseService {
  getDb(): admin.firestore.Firestore {
    return db;
  }

  getStorage(): admin.storage.Storage {
    return storage;
  }

  isFirebaseEnabled(): boolean {
    return db !== null;
  }

  // Mock data methods for development
  async getHomeData() {
    if (this.isFirebaseEnabled()) {
      try {
        const doc = await db.collection('content').doc('home').get();
        return doc.exists ? doc.data() : mockData.home;
      } catch (error) {
        console.error('Error fetching home data:', error);
        return mockData.home;
      }
    }
    return mockData.home;
  }

  async getAboutData() {
    if (this.isFirebaseEnabled()) {
      try {
        const doc = await db.collection('content').doc('about').get();
        return doc.exists ? doc.data() : mockData.about;
      } catch (error) {
        console.error('Error fetching about data:', error);
        return mockData.about;
      }
    }
    return mockData.about;
  }

  async getAcademyData() {
    if (this.isFirebaseEnabled()) {
      try {
        const snapshot = await db.collection('academies').get();
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (error) {
        console.error('Error fetching academy data:', error);
      }
    }
    return mockData.academy;
  }

  async getExpertsData() {
    if (this.isFirebaseEnabled()) {
      try {
        const snapshot = await db.collection('experts').get();
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (error) {
        console.error('Error fetching experts data:', error);
      }
    }
    return mockData.experts;
  }

  async getPortfolioData() {
    if (this.isFirebaseEnabled()) {
      try {
        const snapshot = await db.collection('portfolios').get();
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      }
    }
    return mockData.portfolio;
  }
}
