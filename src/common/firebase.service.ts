import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
export let db: admin.firestore.Firestore;
export let storage: admin.storage.Storage;

// Check if we want to use Firebase or Mock mode
const USE_FIREBASE = process.env.NODE_ENV === 'production' && 
  (process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID_PART1); // More flexible check

// Initialize Firebase with environment variables
if (USE_FIREBASE) {
  try {
    // Check if we're in production environment
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      // Production: Use environment variables
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Handle private key that might be split or formatted differently
      if (process.env.FIREBASE_PRIVATE_KEY_PART1 && process.env.FIREBASE_PRIVATE_KEY_PART2) {
        // If private key is split into multiple parts
        privateKey = process.env.FIREBASE_PRIVATE_KEY_PART1 + process.env.FIREBASE_PRIVATE_KEY_PART2;
      }
      
      // Clean up the private key format
      privateKey = privateKey.replace(/\\n/g, '\n').trim();
      
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else if (process.env.FIREBASE_PROJECT_ID_PART1 && process.env.FIREBASE_PRIVATE_KEY_PART1) {
      // Alternative: Use split environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID_PART1 + (process.env.FIREBASE_PROJECT_ID_PART2 || '');
      let privateKey = process.env.FIREBASE_PRIVATE_KEY_PART1 + (process.env.FIREBASE_PRIVATE_KEY_PART2 || '');
      
      // Clean up the private key format
      privateKey = privateKey.replace(/\\n/g, '\n').trim();
      
      const serviceAccount = {
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com',
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || projectId + '.appspot.com',
      });
    } else {
      // Development: Use service account file if available
      try {
        const serviceAccount = require('../../config/firebase-service-account.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || 'company-profile-grow-synergy',
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'company-profile-grow-synergy.appspot.com',
        });
      } catch (error) {
        console.warn('Firebase service account file not found, using mock mode');
        db = null as any;
        storage = null as any;
      }
    }
    
    if (admin.apps.length > 0) {
      db = admin.firestore();
      storage = admin.storage();
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('🔄 Using mock mode for development');
    db = null as any;
    storage = null as any;
  }
} else {
  console.log('🔄 Firebase disabled, using mock mode');
  db = null as any;
  storage = null as any;
}

// Mock data for development
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
