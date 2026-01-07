import { Controller, Get, Render, Param, Query } from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  @Render('training')
  async getAllTraining() {
    const courses = await this.trainingService.getAllCourses();
    return {
      title: 'Pelatihan Data Analitik - Semua Kursus',
      description: 'Pilih dari berbagai pelatihan data analitik yang tersedia',
      courses,
    };
  }

  @Get(':slug')
  @Render('course-detail')
  async getCourseDetail(@Param('slug') slug: string) {
    const course = await this.trainingService.getCourseBySlug(slug);
    return {
      title: course.title,
      description: course.description,
      course,
    };
  }
}
