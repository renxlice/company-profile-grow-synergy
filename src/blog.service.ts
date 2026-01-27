import { Injectable } from '@nestjs/common';
import { db } from './common/firebase.service';
import * as admin from 'firebase-admin';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  description: string;
  image: string;
  content: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogDto {
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  description: string;
  image: string;
  content: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

@Injectable()
export class BlogService {
  private readonly collectionName = 'blogs';

  async getAllBlogs(): Promise<Blog[]> {
    try {
      const snapshot = await db.collection(this.collectionName).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Blog));
    } catch (error) {
      console.error('Error fetching blogs from Firestore:', error);
      // Fallback to empty array if Firestore fails
      return [];
    }
  }

  async getBlogById(id: string): Promise<Blog | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      } as Blog;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      return null;
    }
  }

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
      const snapshot = await db.collection(this.collectionName).where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Blog;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  }

  async createBlog(createBlogDto: CreateBlogDto): Promise<Blog> {
    try {
      const docRef = await db.collection(this.collectionName).add({
        ...createBlogDto,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const newDoc = await docRef.get();
      return {
        id: newDoc.id,
        ...newDoc.data()
      } as Blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog | null> {
    try {
      const docRef = db.collection(this.collectionName).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      await docRef.update({
        ...updateBlogDto,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Blog;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      await db.collection(this.collectionName).doc(id).delete();
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  async getBlogsByCategory(category: string): Promise<Blog[]> {
    try {
      const snapshot = await db.collection(this.collectionName)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Blog));
    } catch (error) {
      console.error('Error fetching blogs by category:', error);
      return [];
    }
  }

  async searchBlogs(query: string): Promise<Blog[]> {
    try {
      // Simple search implementation - you might want to use Algolia or similar for production
      const snapshot = await db.collection(this.collectionName)
        .orderBy('createdAt', 'desc')
        .get();
      
      const blogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Blog));
      
      // Filter blogs based on search query
      const searchTerm = query.toLowerCase();
      return blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.description.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching blogs:', error);
      return [];
    }
  }
}
