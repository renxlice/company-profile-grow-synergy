#!/usr/bin/env node

const https = require('https');

// Firebase Web API configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZgRNKPqKqXsp8l0Gg2XFU5MZlQ8C-DfA",
  authDomain: "company-profile-grow-synergy.firebaseapp.com",
  projectId: "company-profile-grow-synergy",
  databaseURL: "https://company-profile-grow-synergy-default-rtdb.firebaseio.com",
  storageBucket: "company-profile-grow-synergy.appspot.com",
  messagingSenderId: "584312572709",
  appId: "1:584312572709:web:1e0ad87867af7b878668cc"
};

// Sample data to seed
const seedData = {
  heroSection: [
    {
      backgroundImage: '/images/hero1.jpg',
      title: 'Transformasi Karir dengan Data Analitik',
      subtitle: 'Pelatihan intensif dengan mentor profesional dan proyek real-world',
      description: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
      buttonText1: 'Mulai Belajar',
      buttonText2: 'Konsultasi Gratis'
    }
  ],
  aboutSection: [
    {
      title: 'Tentang GROW SYNERGY INDONESIA',
      description: 'GROW SYNERGY INDONESIA adalah platform pembelajaran data analitik terbaik di Indonesia. Kami menyediakan pelatihan intensif dengan instruktur profesional dan proyek real-world.',
      image: '/images/about1.jpg',
      features: [
        'Instruktur Profesional dengan 10+ tahun pengalaman',
        'Sertifikat Bersertifikat BNSP yang diakui industri',
        'Proyek Real-World dari perusahaan ternama',
        'Mentorship 1-on-1 untuk karir Anda',
        '100% Garansi Kerja untuk lulusan terbaik'
      ],
      stats: {
        students: '1000+',
        courses: '50+',
        instructors: '20+',
        successRate: '95%',
        partners: '15+'
      },
      buttonText1: 'Lihat Kursus',
      buttonText2: 'Testimoni Alumni'
    }
  ],
  experts: [
    {
      name: 'Dr. Ahmad Wijaya, M.Sc.',
      title: 'Data Science Expert & Founder',
      organization: 'GROW SYNERGY INDONESIA',
      image: 'https://picsum.photos/seed/ahmad-wijaya/300/300.jpg',
      bio: 'Expert dengan 10+ tahun pengalaman di bidang data science dan machine learning. Alumni dari universitas ternama dengan publikasi internasional.',
      specialties: ['Data Science', 'Machine Learning', 'Python', 'SQL', 'Tableau'],
      experience: '10+ tahun',
      rating: 4.9,
      reviewCount: 156,
      education: 'S2, Data Science - Stanford University',
      certifications: ['Google Cloud Certified', 'AWS Certified Data Scientist']
    },
    {
      name: 'Sarah Putri, S.Kom., M.T.',
      title: 'Business Intelligence Specialist',
      organization: 'GROW SYNERGY INDONESIA',
      image: 'https://picsum.photos/seed/sarah-putri/300/300.jpg',
      bio: 'Spesialis dalam business intelligence dan data visualization dengan pengalaman di berbagai industri seperti banking, retail, dan e-commerce.',
      specialties: ['Business Intelligence', 'Tableau', 'Power BI', 'Data Visualization', 'SQL'],
      experience: '8+ tahun',
      rating: 4.8,
      reviewCount: 124,
      education: 'S2, Information Systems - UIUC',
      certifications: ['Microsoft Certified BI Professional', 'Tableau Certified Associate']
    },
    {
      name: 'Budi Santoso, S.E., M.M.',
      title: 'Data Analytics Consultant',
      organization: 'GROW SYNERGY INDONESIA',
      image: 'https://picsum.photos/seed/budi-santoso/300/300.jpg',
      bio: 'Konsultan data analytics dengan fokus pada implementasi solusi bisnis berbasis data. Berpengalaman membantu perusahaan mengoptimalkan proses bisnis.',
      specialties: ['Data Analytics', 'Business Analysis', 'R', 'Python', 'Excel', 'Power BI'],
      experience: '12+ tahun',
      rating: 4.7,
      reviewCount: 98,
      education: 'MBA, Business Analytics - University of Indonesia',
      certifications: ['SAS Certified Data Scientist', 'IBM Data Science Professional']
    }
  ],
  portfolios: [
    {
      title: 'Retail Analytics Dashboard',
      category: 'Dashboard',
      description: 'Dashboard real-time untuk monitoring sales dan inventory retail dengan visualisasi interaktif dan alert system otomatis.',
      image: 'https://picsum.photos/seed/retail-dashboard/600/400.jpg',
      technologies: ['Tableau', 'SQL', 'Python', 'D3.js'],
      client: 'PT. Retail Maju Indonesia',
      duration: '3 bulan',
      impact: 'Meningkatkan efisiensi monitoring 40%',
      link: '#'
    },
    {
      title: 'Customer Segmentation Analysis',
      category: 'Analytics',
      description: 'Analisis segmentasi customer menggunakan machine learning untuk strategi pemasaran yang lebih efektif dan personalisasi pengalaman.',
      image: 'https://picsum.photos/seed/customer-segmentation/600/400.jpg',
      technologies: ['Python', 'Scikit-learn', 'Pandas', 'Jupyter'],
      client: 'PT. E-Commerce Indonesia',
      duration: '2 bulan',
      impact: 'Meningkatkan konversi 25%',
      link: '#'
    },
    {
      title: 'Supply Chain Optimization',
      category: 'Optimization',
      description: 'Optimasi rantai pasok menggunakan analisis prediktif untuk mengurangi biaya dan meningkatkan efisiensi distribusi.',
      image: 'https://picsum.photos/seed/supply-chain/600/400.jpg',
      technologies: ['Python', 'R', 'SQL', 'Power BI'],
      client: 'PT. Logistics Nusantara',
      duration: '4 bulan',
      impact: 'Mengurangi biaya operasional 30%',
      link: '#'
    }
  ],
  academies: [
    {
      title: 'Data Analyst Fundamentals',
      level: 'Pemula',
      duration: '3 bulan',
      description: 'Kursus dasar-dasar analisis data dengan tools modern seperti Excel, SQL, dan Tableau. Cocok untuk pemula.',
      image: 'https://picsum.photos/seed/data-analyst-fundamentals/600/400.jpg',
      price: 'Rp 5.000.000',
      rating: 4.8,
      students: 150,
      schedule: 'Weekend (Sabtu & Minggu)',
      instructor: 'Dr. Ahmad Wijaya, M.Sc.',
      curriculum: ['Excel Advanced', 'SQL Fundamentals', 'Tableau Visualization', 'Data Analysis Basics'],
      certificate: 'BNSP Certified'
    },
    {
      title: 'Business Intelligence Professional',
      level: 'Menengah',
      duration: '4 bulan',
      description: 'Pelajari business intelligence dari dasar hingga expert level dengan tools seperti Power BI, Tableau, dan SQL Server.',
      image: 'https://picsum.photos/seed/bi-professional/600/400.jpg',
      price: 'Rp 8.000.000',
      rating: 4.9,
      students: 89,
      schedule: 'Weekday (Senin-Jumat)',
      instructor: 'Sarah Putri, S.Kom., M.T.',
      curriculum: ['Power BI Advanced', 'SQL Server', 'Data Modeling', 'Dashboard Design', 'KPI Development'],
      certificate: 'Microsoft Certified'
    },
    {
      title: 'Machine Learning Specialist',
      level: 'Lanjutan',
      duration: '6 bulan',
      description: 'Kursus machine learning komprehensif dari basic hingga advanced dengan Python, TensorFlow, dan real-world projects.',
      image: 'https://picsum.photos/seed/ml-specialist/600/400.jpg',
      price: 'Rp 15.000.000',
      rating: 4.9,
      students: 67,
      schedule: 'Flexible (Online + Offline)',
      instructor: 'Dr. Ahmad Wijaya, M.Sc.',
      curriculum: ['Python ML', 'TensorFlow', 'Neural Networks', 'Deep Learning', 'Computer Vision', 'NLP'],
      certificate: 'Google TensorFlow Developer'
    }
  ]
};

console.log('🔥 Seeding Firestore data via REST API...');

async function seedCollection(collectionName, documents) {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}`;
  
  for (const doc of documents) {
    try {
      // Convert the document to Firestore format
      const firestoreDoc = convertToFirestoreFormat(doc);
      
      const response = await new Promise((resolve, reject) => {
        const postData = JSON.stringify({ fields: firestoreDoc });
        
        const options = {
          hostname: 'firestore.googleapis.com',
          port: 443,
          path: `/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}?documentId=${collectionName}-${Date.now()}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        });

        req.on('error', (e) => {
          reject(e);
        });

        req.write(postData);
        req.end();
      });
      
      console.log(`✅ Added document to ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error adding document to ${collectionName}:`, error.message);
    }
  }
}

function convertToFirestoreFormat(obj) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      result[key] = { doubleValue: value };
    } else if (typeof value === 'boolean') {
      result[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      result[key] = {
        arrayValue: {
          values: value.map(item => 
            typeof item === 'string' ? { stringValue: item } : { stringValue: String(item) }
          )
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      result[key] = {
        mapValue: { fields: convertToFirestoreFormat(value) }
      };
    }
  }
  
  return result;
}

async function seedAllData() {
  try {
    for (const [collectionName, documents] of Object.entries(seedData)) {
      console.log(`📝 Seeding ${collectionName}...`);
      await seedCollection(collectionName, documents);
    }
    
    console.log('✅ All Firestore data seeded successfully!');
    console.log('📊 Collections created:');
    for (const [collectionName, documents] of Object.entries(seedData)) {
      console.log(`   - ${collectionName}: ${documents.length} documents`);
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit();
  }
}

seedAllData();
