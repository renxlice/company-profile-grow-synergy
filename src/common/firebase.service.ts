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

// Firebase configuration (hardcoded for production)
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "your-service-account-email@your-project-id.iam.gserviceaccount.com",
  privateKey: process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
};

// Initialize Firebase with hardcoded config
function initializeFirebase() {
  console.log('🔧 Initializing Firebase with hardcoded config...');
  
  try {
    // Check if we should use Firebase (production) or mock mode
    const useFirebase = process.env.NODE_ENV === 'production' || process.env.USE_FIREBASE === 'true';
    
    if (useFirebase) {
      console.log('📋 Firebase config check:');
      console.log('   Project ID:', firebaseConfig.projectId);
      console.log('   Client Email:', firebaseConfig.clientEmail);
      console.log('   Private Key: SET');
      
      const serviceAccount = {
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.projectId + '.appspot.com',
      });
      
      if (admin.apps.length > 0) {
        db = admin.firestore();
        storage = admin.storage();
        console.log('✅ Firebase initialized successfully');
        return true;
      }
    } else {
      console.log('🔄 Firebase disabled, using mock mode');
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
