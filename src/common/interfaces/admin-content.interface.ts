export interface HeroSection {
  id?: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  buttonText1: string;
  buttonText2: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AboutSection {
  id?: string;
  title: string;
  description: string;
  image: string;
  buttonText1: string;
  buttonText2: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Expert {
  id?: string;
  name: string;
  position: string;
  experience: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Portfolio {
  id?: string;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  liveDemoUrl?: string;
  codeUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Academy {
  id?: string;
  title: string;
  description: string;
  image: string;
  pdf?: string;
  author: string;
  rating: number;
  students: number;
  duration: string;
  certification?: string;
  price: number;
  level: string;
  schedule: string;
  mode: string;
  createdAt?: Date;
  updatedAt?: Date;
}
