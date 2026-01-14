import { Controller, Post, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('api/seed')
export class SeedController {
  
  @Get('status')
  @ApiOperation({ summary: 'Check Firestore data status' })
  async checkDataStatus() {
    try {
      // Initialize Firebase with environment variables
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
        credential: cert(serviceAccount as any),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      const db = getFirestore(app);

      // Check data status
      const collections = ['heroSections', 'aboutSections', 'experts', 'portfolios', 'academies'];
      const status = {};

      for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName).get();
        status[collectionName] = snapshot.docs.length;
      }

      return {
        success: true,
        message: 'Data status checked',
        data: status
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to check data status',
        error: error.message
      };
    }
  }

  @Post('sample-data')
  @ApiOperation({ summary: 'Add sample data to Firestore' })
  async addSampleData(@Res() res: Response) {
    try {
      // Initialize Firebase
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
        credential: cert(serviceAccount as any),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      const db = getFirestore(app);

      // Sample data
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
        }
      ];

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
        }
      ];

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

      // Clear and add data
      const collections = [
        { name: 'heroSections', data: heroSections },
        { name: 'aboutSections', data: aboutSections },
        { name: 'experts', data: experts },
        { name: 'portfolios', data: portfolios },
        { name: 'academies', data: academies }
      ];

      const results = {};

      for (const collection of collections) {
        // Clear existing data
        const snapshot = await db.collection(collection.name).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        // Add new data
        for (const item of collection.data) {
          await db.collection(collection.name).add(item);
        }

        results[collection.name] = collection.data.length;
      }

      return res.json({
        success: true,
        message: 'Sample data added successfully',
        data: results
      });

    } catch (error) {
      console.error('Error adding sample data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add sample data',
        error: error.message
      });
    }
  }
}
