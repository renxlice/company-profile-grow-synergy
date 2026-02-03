// Load environment variables first
require('dotenv').config();

const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  console.log('🔥 Firebase initialized successfully');
} else {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const db = admin.firestore();

async function testConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    const [expertsSnapshot, portfoliosSnapshot, academiesSnapshot] = await Promise.all([
      db.collection('experts').get(),
      db.collection('portfolios').get(),
      db.collection('academies').get()
    ]);

    const experts = expertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const portfolios = portfoliosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const academies = academiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('✅ Firebase connection test successful');
    console.log('📊 Data Summary:');
    console.log(`  - Experts: ${experts.length} documents`);
    console.log(`  - Portfolios: ${portfolios.length} documents`);
    console.log(`  - Academies: ${academies.length} documents`);

    if (experts.length > 0) {
      console.log('👤 Sample Expert:', experts[0].name);
    }
    if (portfolios.length > 0) {
      console.log('💼 Sample Portfolio:', portfolios[0].title);
    }
    if (academies.length > 0) {
      console.log('🎓 Sample Academy:', academies[0].title);
    }

  } catch (error) {
    console.error('❌ Error testing Firebase connection:', error);
  } finally {
    process.exit();
  }
}

testConnection();
