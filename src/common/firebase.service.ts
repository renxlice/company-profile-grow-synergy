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
  projectId: "company-profile-grow-synergy",
  clientEmail: "firebase-adminsdk-fbsvc@company-profile-grow-synergy.iam.gserviceaccount.com",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChvzANtK317wFA
QAT8w1linwKx+T2b2Syug/G/8Zaw/osfAHJhanGuaqA/9NZMdCsQ19bOsyq0/Moq
hHe7Ma4um/JptIBFtWOfkTvEtYDzYRxKPhiOMWVRDTNbkmSD7wWlB4o+kOnNYifD
CTFN1Zn/dOZA7rgG+VZlLTVbJ4pjfVv0FMYNt575akY6Be4LqTvGOsMW8gGrNedb
P5YVqpYW1YPO6sLuxweaTseR3kwJ1wPdqq3h70rcU+wHvHYrtZrdQMtfDlhGpMnS
haCBH9sQG5H3/egN2DdvFqzJ50/2NFBBIOFmsBUxxD3Z8VNGCZrFYvMrOi0/gLt9
DCIZtABpAgMBAAECggEAIeUEJ2Mc70QKAZJI2UUAhrOmp3AA8pdEjz+UGfKA7w8w
TStVTMe3EeNDOJPQko3ndmyclY0jHnE41kcTJhWnmBnS50bNeI4l1crj+PlGD/pi
KMaxc56zShRXllFroeAlUStu02SfsgvnJC5ZeCOSVV+EXsgHpWJ7sdES9Mqo6+cD
4W87/eUqR4vM+aBOBvtzsxyZCbJ8/wC4aTIQA4/uyElwqeUZy0yYH6BylUchRjXX
V/PB37kiK2BDxJXxazr+YdBXfXCan2GsqCZF+SD7qYrkQgEmzjQ7oPou37fW6BS3
BnyhVk+B8DjJOiCyk+GWyjsqxPJmEYrdrf2JKGRQuQKBgQDjDmvlmnKgvs0e5CXc
Zn0n3o1TeG+WAl1Ydv45ZtouuZwdXw+NesMgv9ddc3Z+gqmo0MVXwsKptqxcMSfs
J+tB9idC1CPKhs9r3wbpD3rO8iDHsk9pCqykFJyCN5be69m2J9ECc/GFmqoWKUQC
KIaxB8sJ74aU+EOh+G4vWUo+pQKBgQC2XYHHknFh3jrVa8EJ81xAOMIiMK3IwClF
+w2fDNtNVBrXAqLpKyklo9RmJOXSQaLuEBwFjsQO2LeGWlsNNCoOGg8PoB47xLr7
B26u9HlnhUQURI45O/LYoIqN2lshLS537U7eGebZCf+TFttKOeN1ZiH7SzUUxTGw
AYExQ5izdQKBgGhT+w3P7rWflh6IlED2MrG8F9Hvt84EniGE44E6miv4CxyPzlSi
wL/uhiWhZSPyI8S20MZnbgyPLBlcWMyw9u8jDJ0vXpazZOFa5BD4lOQ76wX3D3fj
eLoX4mYO5trdIfcJyobHAYXzMA3oviADwQfc3dVd4sfWXzUwMmi9LVklAoGAb1X5
JKmQVUrCqoeFrBiKap78Trlfb995k0Lplv/XZ4eAd2Ihqa7zCQrTYqUGNm5iFWt6
YB5ALjw7F2hUjGQbhM5+AXEk5CKAcT+hYGjbMctXu/P6zJB/+6dPz7jOyBt4cjlM
XCZ+HGWRRfC/Yrqi1orLFktdFdgqNKVGhZgaQv0CgYEA3m05DNSVLlBqzlcrW1Il
neU46DosygQnN2XSirEBkFC+l3I7g1j3emA3RUYidmaODsCSYP5DOtSI0yYlQPe09
94OsnInN6KKxHIrH95haq4SUXCDcplAhKQAQ98ujUU0ewdELM2Cd40DZWorJMZy+
alIgNfNHfcvffHxnUQr6oz8=
-----END PRIVATE KEY-----`
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
