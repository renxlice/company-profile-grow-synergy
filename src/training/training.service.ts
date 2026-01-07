import { Injectable } from '@nestjs/common';

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  duration: string;
  level: string;
  price: number;
  instructor: string;
  rating: number;
  students: number;
  image: string;
  topics: string[];
  objectives: string[];
  prerequisites: string[];
}

@Injectable()
export class TrainingService {
  private courses: Course[] = [
    {
      id: 1,
      title: 'Data Analitik untuk Pemula',
      slug: 'data-analitik-pemula',
      description: 'Kursus komprehensif untuk memulai karir sebagai data analyst. Pelajari dasar-dasar data analitik dengan hands-on project.',
      duration: '6 minggu',
      level: 'Pemula',
      price: 2999000,
      instructor: 'Dr. Ahmad Wijaya, M.Sc.',
      rating: 4.8,
      students: 1250,
      image: '/images/courses/data-analytics-beginner.jpg',
      topics: [
        'Pengenalan Data Analitik',
        'Excel untuk Data Analitik',
        'SQL Dasar',
        'Visualisasi Data dengan Tableau',
        'Statistik Dasar',
        'Project Akhir',
      ],
      objectives: [
        'Memahami konsep dasar data analitik',
        'Menggunakan Excel untuk analisis data',
        'Mengakses dan mengelola database dengan SQL',
        'Membuat visualisasi data yang efektif',
        'Menerapkan statistik dasar dalam analisis',
      ],
      prerequisites: [
        'Komputer/laptop dengan spesifikasi minimal',
        'Microsoft Excel',
        'Tidak ada pengalaman programming dibutuhkan',
      ],
    },
    {
      id: 2,
      title: 'Python untuk Data Analitik',
      slug: 'python-data-analitik',
      description: 'Master Python untuk data analitik profesional. Pelajari pandas, numpy, matplotlib, dan tools data science lainnya.',
      duration: '8 minggu',
      level: 'Menengah',
      price: 4999000,
      instructor: 'Sarah Putri, S.Kom., M.T.',
      rating: 4.9,
      students: 890,
      image: '/images/courses/python-data-analytics.jpg',
      topics: [
        'Python Fundamentals',
        'NumPy untuk Numerical Computing',
        'Pandas untuk Data Manipulation',
        'Matplotlib & Seaborn untuk Visualisasi',
        'Data Cleaning dan Preprocessing',
        'Exploratory Data Analysis',
        'Machine Learning Basics',
        'Real-world Projects',
      ],
      objectives: [
        'Menguasai Python programming',
        'Menggunakan NumPy dan Pandas untuk analisis data',
        'Membuat visualisasi data yang menarik',
        'Melakukan data cleaning dan preprocessing',
        'Menerapkan machine learning dasar',
      ],
      prerequisites: [
        'Pemahaman dasar programming',
        'Statistik dasar',
        'Komputer dengan Python terinstall',
      ],
    },
    {
      id: 3,
      title: 'Business Intelligence & Dashboard',
      slug: 'business-intelligence-dashboard',
      description: 'Pelajari cara membuat dashboard interaktif dan laporan business intelligence menggunakan Power BI dan Tableau.',
      duration: '4 minggu',
      level: 'Menengah',
      price: 3499000,
      instructor: 'Budi Santoso, S.E., M.M.',
      rating: 4.7,
      students: 650,
      image: '/images/courses/bi-dashboard.jpg',
      topics: [
        'Konsep Business Intelligence',
        'Power BI Fundamentals',
        'Tableau Desktop',
        'Data Modeling',
        'DAX Functions',
        'Dashboard Design Principles',
        'KPI dan Metrics',
        'Case Studies',
      ],
      objectives: [
        'Memahami konsep BI',
        'Membuat dashboard di Power BI',
        'Mendesain visualisasi yang efektif',
        'Mengimplementasikan KPI',
        'Membuat laporan bisnis interaktif',
      ],
      prerequisites: [
        'Pemahaman dasar data analitik',
        'Microsoft Excel',
        'Logika bisnis',
      ],
    },
  ];

  async getAllCourses(): Promise<Course[]> {
    return this.courses;
  }

  async getCourseBySlug(slug: string): Promise<Course> {
    const course = this.courses.find(c => c.slug === slug);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async getCourseById(id: number): Promise<Course> {
    const course = this.courses.find(c => c.id === id);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async getCoursesByLevel(level: string): Promise<Course[]> {
    return this.courses.filter(c => c.level.toLowerCase() === level.toLowerCase());
  }

  async searchCourses(query: string): Promise<Course[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.courses.filter(c => 
      c.title.toLowerCase().includes(lowercaseQuery) ||
      c.description.toLowerCase().includes(lowercaseQuery) ||
      c.topics.some(topic => topic.toLowerCase().includes(lowercaseQuery))
    );
  }
}
