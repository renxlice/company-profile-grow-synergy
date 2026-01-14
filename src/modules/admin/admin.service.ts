import { Injectable } from '@nestjs/common';
import { db } from '../../common/firebase.service';
import {
  HeroSection,
  AboutSection,
  Expert,
  Portfolio,
  Academy,
} from '../../common/interfaces/admin-content.interface';

@Injectable()
export class AdminService {
  // Hero Section CRUD
  async getHeroSection(): Promise<HeroSection[]> {
    const snapshot = await db.collection('heroSection').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as HeroSection[];
  }

  async getHeroSectionById(id: string): Promise<HeroSection> {
    const doc = await db.collection('heroSection').doc(id).get();
    if (!doc.exists) {
      throw new Error('Hero section not found');
    }
    return { id: doc.id, ...doc.data() } as HeroSection;
  }

  async createHeroSection(data: HeroSection): Promise<HeroSection> {
    const docRef = await db.collection('heroSection').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as HeroSection;
  }

  async updateHeroSection(id: string, data: Partial<HeroSection>): Promise<HeroSection> {
    await db.collection('heroSection').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getHeroSectionById(id);
  }

  async deleteHeroSection(id: string): Promise<void> {
    await db.collection('heroSection').doc(id).delete();
  }

  // About Section CRUD
  async getAboutSection(): Promise<AboutSection[]> {
    const snapshot = await db.collection('aboutSection').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AboutSection[];
  }

  async getAboutSectionById(id: string): Promise<AboutSection> {
    const doc = await db.collection('aboutSection').doc(id).get();
    if (!doc.exists) {
      throw new Error('About section not found');
    }
    return { id: doc.id, ...doc.data() } as AboutSection;
  }

  async createAboutSection(data: AboutSection): Promise<AboutSection> {
    const docRef = await db.collection('aboutSection').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as AboutSection;
  }

  async updateAboutSection(id: string, data: Partial<AboutSection>): Promise<AboutSection> {
    await db.collection('aboutSection').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getAboutSectionById(id);
  }

  async deleteAboutSection(id: string): Promise<void> {
    await db.collection('aboutSection').doc(id).delete();
  }

  // Experts CRUD
  async getExperts(): Promise<Expert[]> {
    const snapshot = await db.collection('experts').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Expert[];
  }

  async getExpertById(id: string): Promise<Expert> {
    const doc = await db.collection('experts').doc(id).get();
    if (!doc.exists) {
      throw new Error('Expert not found');
    }
    return { id: doc.id, ...doc.data() } as Expert;
  }

  async createExpert(data: Expert): Promise<Expert> {
    const docRef = await db.collection('experts').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Expert;
  }

  async updateExpert(id: string, data: Partial<Expert>): Promise<Expert> {
    await db.collection('experts').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getExpertById(id);
  }

  async deleteExpert(id: string): Promise<void> {
    await db.collection('experts').doc(id).delete();
  }

  // Portfolio CRUD
  async getPortfolios(): Promise<Portfolio[]> {
    const snapshot = await db.collection('portfolios').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Portfolio[];
  }

  async getPortfolioById(id: string): Promise<Portfolio> {
    const doc = await db.collection('portfolios').doc(id).get();
    if (!doc.exists) {
      throw new Error('Portfolio not found');
    }
    return { id: doc.id, ...doc.data() } as Portfolio;
  }

  async createPortfolio(data: Portfolio): Promise<Portfolio> {
    const docRef = await db.collection('portfolios').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Portfolio;
  }

  async updatePortfolio(id: string, data: Partial<Portfolio>): Promise<Portfolio> {
    await db.collection('portfolios').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getPortfolioById(id);
  }

  async deletePortfolio(id: string): Promise<void> {
    await db.collection('portfolios').doc(id).delete();
  }

  // Academy CRUD
  async getAcademies(): Promise<Academy[]> {
    const snapshot = await db.collection('academies').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Academy[];
  }

  async getAcademyById(id: string): Promise<Academy> {
    const doc = await db.collection('academies').doc(id).get();
    if (!doc.exists) {
      throw new Error('Academy not found');
    }
    return { id: doc.id, ...doc.data() } as Academy;
  }

  async createAcademy(data: Academy): Promise<Academy> {
    const docRef = await db.collection('academies').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Academy;
  }

  async updateAcademy(id: string, data: Partial<Academy>): Promise<Academy> {
    await db.collection('academies').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getAcademyById(id);
  }

  async deleteAcademy(id: string): Promise<void> {
    await db.collection('academies').doc(id).delete();
  }
}
