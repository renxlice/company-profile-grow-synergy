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
export class ContentService {
  // Get data for frontend
  async getHeroSectionsForFrontend(): Promise<HeroSection[]> {
    const snapshot = await db.collection('heroSection').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as HeroSection[];
  }

  async getAboutSectionsForFrontend(): Promise<AboutSection[]> {
    const snapshot = await db.collection('aboutSection').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AboutSection[];
  }

  async getExpertsForFrontend(): Promise<Expert[]> {
    const snapshot = await db.collection('experts').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Expert[];
  }

  async getPortfoliosForFrontend(): Promise<Portfolio[]> {
    const snapshot = await db.collection('portfolios').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Portfolio[];
  }

  async getAcademiesForFrontend(): Promise<Academy[]> {
    const snapshot = await db.collection('academies').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Academy[];
  }
}
