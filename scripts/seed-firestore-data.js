#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "company-profile-grow-synergy"
});

const db = admin.firestore();

console.log('🔥 Seeding Firestore data...');

async function seedData() {
  try {
    // Hero Section Data
    await db.collection('heroSection').add({
      backgroundImage: '/images/hero1.jpg',
      title: 'Transformasi Karir dengan Data Analitik',
      subtitle: 'Pelatihan intensif dengan mentor profesional dan proyek real-world',
      description: 'Platform pembelajaran data analitik terbaik di Indonesia dengan instruktur profesional dan sertifikat bersertifikat.',
      buttonText1: 'Mulai Belajar',
      buttonText2: 'Konsultasi Gratis',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // About Section Data
    await db.collection('aboutSection').add({
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
      buttonText2: 'Testimoni Alumni',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Experts Data
    const experts = [
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
        certifications: ['Google Cloud Certified', 'AWS Certified Data Scientist'],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
        certifications: ['Microsoft Certified BI Professional', 'Tableau Certified Associate'],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
        certifications: ['SAS Certified Data Scientist', 'IBM Data Science Professional'],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const expert of experts) {
      await db.collection('experts').add(expert);
    }

    // Portfolios Data
    const portfolios = [
      {
        title: 'Retail Analytics Dashboard',
        category: 'Dashboard',
        description: 'Dashboard real-time untuk monitoring sales dan inventory retail dengan visualisasi interaktif dan alert system otomatis.',
        image: 'https://picsum.photos/seed/retail-dashboard/600/400.jpg',
        technologies: ['Tableau', 'SQL', 'Python', 'D3.js'],
        client: 'PT. Retail Maju Indonesia',
        duration: '3 bulan',
        impact: 'Meningkatkan efisiensi monitoring 40%',
        link: '#',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
        link: '#',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
        link: '#',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const portfolio of portfolios) {
      await db.collection('portfolios').add(portfolio);
    }

    // Academies Data
    const academies = [
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
        certificate: 'BNSP Certified',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
        certificate: 'Microsoft Certified',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
        certificate: 'Google TensorFlow Developer',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const academy of academies) {
      await db.collection('academies').add(academy);
    }

    console.log('✅ Firestore data seeded successfully!');
    console.log('📊 Collections created:');
    console.log('   - heroSection: 1 document');
    console.log('   - aboutSection: 1 document');
    console.log('   - experts: 3 documents');
    console.log('   - portfolios: 3 documents');
    console.log('   - academies: 3 documents');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit();
  }
}

seedData();
