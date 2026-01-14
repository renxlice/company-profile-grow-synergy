import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  Session,
  Redirect,
  Req,
  Render,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { AdminService } from './admin.service';
import {
  HeroSection,
  AboutSection,
  Expert,
  Portfolio,
  Academy,
} from '../../common/interfaces/admin-content.interface';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Login Page
  @Get('login')
  @Render('admin/login')
  loginPage() {
    return { title: 'Admin Login' };
  }

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Session() session: Record<string, any>,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    console.log('Login attempt:', body);
    console.log('Session object:', session);
    console.log('Request session:', req.session);
    
    // Simple authentication (in production, use proper hashing and database)
    const storedPassword = session.password || process.env.ADMIN_PASSWORD;
    
    if (
      body.username === process.env.ADMIN_USERNAME &&
      body.password === storedPassword
    ) {
      // Use the session parameter from @Session decorator
      session.isLoggedIn = true;
      session.username = body.username;
      
      console.log('Login successful, session after:', session);
      return res.redirect('/admin/dashboard');
    }
    
    console.log('Login failed');
    return res.render('admin/login', {
      title: 'Admin Login',
      error: 'Invalid credentials',
    });
  }

  @Get('logout')
  async logout(@Session() session: Record<string, any>, @Res() res: Response) {
    session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      return res.redirect('/admin/login');
    });
  }

  // Dashboard
  @Get('dashboard')
  @Render('admin/dashboard')
  async dashboard(@Session() session: Record<string, any>, @Res() res: Response) {
    console.log('Dashboard - Session:', session);
    
    try {
      const stats = {
        heroSections: (await this.adminService.getHeroSection()).length,
        aboutSections: (await this.adminService.getAboutSection()).length,
        experts: (await this.adminService.getExperts()).length,
        portfolios: (await this.adminService.getPortfolios()).length,
        academies: (await this.adminService.getAcademies()).length,
      };

      const heroSections = await this.adminService.getHeroSection();
      const aboutSections = await this.adminService.getAboutSection();
      const experts = await this.adminService.getExperts();
      const portfolios = await this.adminService.getPortfolios();
      const academies = await this.adminService.getAcademies();
      
      console.log('Dashboard hero sections:', heroSections);
      console.log('Dashboard hero sections count:', heroSections.length);

      return {
        title: 'Admin Dashboard',
        username: session.username,
        stats,
        heroSections,
        aboutSections,
        experts,
        portfolios,
        academies,
      };
    } catch (error) {
      console.error('Dashboard error:', error);
      return {
        title: 'Admin Dashboard',
        username: session.username,
        stats: { heroSections: 0, aboutSections: 0, experts: 0, portfolios: 0, academies: 0 },
        heroSections: [],
        aboutSections: [],
        experts: [],
        portfolios: [],
        academies: [],
        error: 'Failed to load dashboard data'
      };
    }
  }

  // Hero Section CRUD
  @Get('hero-section')
  @Render('admin/hero-section')
  async heroSection(@Session() session: Record<string, any>, @Res() res: Response) {
    console.log('Hero Section - Session:', session);
    console.log('=== DEBUG: Starting hero section fetch ===');
    
    try {
      const items = await this.adminService.getHeroSection();
      console.log('DEBUG: Hero sections from service:', items);
      console.log('DEBUG: Hero sections count:', items.length);
      console.log('DEBUG: Hero sections data:', JSON.stringify(items, null, 2));
      
      // Test with static data if no data
      if (!items || items.length === 0) {
        console.log('DEBUG: No hero sections found, returning static data');
        const staticData = [
          {
            id: 'static-1',
            title: 'Static Hero 1',
            subtitle: 'Static Subtitle 1',
            backgroundImage: 'https://picsum.photos/seed/static1/1920/1080.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'static-2',
            title: 'Static Hero 2',
            subtitle: 'Static Subtitle 2',
            backgroundImage: 'https://picsum.photos/seed/static2/1920/1080.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        console.log('DEBUG: Returning static data:', staticData);
        return {
          title: 'Hero Section Management',
          username: session.username,
          items: staticData,
        };
      }
      
      return {
        title: 'Hero Section Management',
        username: session.username,
        items,
      };
    } catch (error) {
      console.error('ERROR: Hero section fetch error:', error);
      return {
        title: 'Hero Section Management',
        username: session.username,
        items: [],
        error: 'Failed to load hero sections: ' + error.message
      };
    }
  }

  @Get('hero-section/create')
  @Render('admin/hero-section-form')
  createHeroSectionForm(@Session() session: Record<string, any>, @Res() res: Response) {
    console.log('Create Hero Section Form - Session:', session);
    return {
      title: 'Create Hero Section',
      username: session.username,
      item: null,
      action: '/admin/hero-section',
    };
  }

  @Post('hero-section')
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async createHeroSection(
    @Body() body: HeroSection,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Create Hero Section - Body:', body);
      console.log('Create Hero Section - File:', file);
      
      if (file) {
        body.backgroundImage = `/uploads/admin/${file.filename}`;
        console.log('Create Hero Section - Background Image:', body.backgroundImage);
      }
      
      await this.adminService.createHeroSection(body);
      console.log('Create Hero Section - Success');
      return res.redirect('/admin/hero-section');
    } catch (error) {
      console.error('Create Hero Section - Error:', error);
      return res.status(500).json({
        message: 'Failed to create hero section',
        error: error.message
      });
    }
  }

  @Get('hero-section/edit/:id')
  @Render('admin/hero-section-form')
  async editHeroSectionForm(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    console.log('Edit Hero Section Form - Session:', session);
    const item = await this.adminService.getHeroSectionById(id);
    return {
      title: 'Edit Hero Section',
      username: session.username,
      item,
      action: `/admin/hero-section/${id}`,
    };
  }

  @Put('hero-section/:id')
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async updateHeroSection(
    @Param('id') id: string,
    @Body() body: Partial<HeroSection>,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    
    if (file) {
      body.backgroundImage = `/uploads/admin/${file.filename}`;
    }
    
    await this.adminService.updateHeroSection(id, body);
    return res.redirect('/admin/hero-section');
  }

  @Post('hero-section/:id')
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async updateHeroSectionPost(
    @Param('id') id: string,
    @Body() body: Partial<HeroSection> & { _method?: string },
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    console.log('POST Hero Section - Body:', body);
    
    // Check if this is a delete request (form with _method=DELETE)
    if (body._method === 'DELETE') {
      console.log('Delete Hero Section - Session:', session);
      await this.adminService.deleteHeroSection(id);
      return res.json({ success: true });
    }
    
    // Otherwise, treat as update
    if (file) {
      body.backgroundImage = `/uploads/admin/${file.filename}`;
    }
    
    await this.adminService.updateHeroSection(id, body);
    return res.redirect('/admin/hero-section');
  }

  @Delete('hero-section/:id')
  async deleteHeroSection(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    console.log('Delete Hero Section - Session:', session);
    await this.adminService.deleteHeroSection(id);
    return res.json({ success: true });
  }

  // About Section CRUD
  @Get('about-section')
  @Render('admin/about-section')
  async aboutSection(@Session() session: Record<string, any>, @Res() res: Response) {
        const items = await this.adminService.getAboutSection();
    return {
      title: 'About Section Management',
      username: session.username,
      items,
    };
  }

  @Get('about-section/create')
  @Render('admin/about-section-form')
  createAboutSectionForm(@Session() session: Record<string, any>, @Res() res: Response) {
        return {
      title: 'Create About Section',
      username: session.username,
      item: null,
      action: '/admin/about-section',
    };
  }

  @Post('about-section')
  @UseInterceptors(FileInterceptor('image'))
  async createAboutSection(
    @Body() body: AboutSection,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
        
    if (file) {
      body.image = `/uploads/admin/${file.filename}`;
    }
    
    await this.adminService.createAboutSection(body);
    return res.redirect('/admin/about-section');
  }

  @Get('about-section/edit/:id')
  @Render('admin/about-section-form')
  async editAboutSectionForm(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
        const item = await this.adminService.getAboutSectionById(id);
    return {
      title: 'Edit About Section',
      username: session.username,
      item,
      action: `/admin/about-section/${id}`,
    };
  }

  @Put('about-section/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateAboutSection(
    @Param('id') id: string,
    @Body() body: Partial<AboutSection>,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    
    if (file) {
      body.image = `/uploads/admin/${file.filename}`;
    }
    
    await this.adminService.updateAboutSection(id, body);
    return res.redirect('/admin/about-section');
  }

  @Post('about-section/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateAboutSectionPost(
    @Param('id') id: string,
    @Body() body: Partial<AboutSection> & { _method?: string },
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    console.log('POST About Section - Body:', body);
    
    // Check if this is a delete request (form with _method=DELETE)
    if (body._method === 'DELETE') {
      console.log('Delete About Section - Session:', session);
      await this.adminService.deleteAboutSection(id);
      return res.json({ success: true });
    }
    
    // Otherwise, treat as update
    if (file) {
      body.image = `/uploads/admin/${file.filename}`;
    }
    
    await this.adminService.updateAboutSection(id, body);
    return res.redirect('/admin/about-section');
  }

  @Delete('about-section/:id')
  async deleteAboutSection(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
        await this.adminService.deleteAboutSection(id);
    return res.json({ success: true });
  }

  // Experts CRUD
  @Get('experts')
  @Render('admin/experts')
  async experts(@Session() session: Record<string, any>, @Res() res: Response) {
        const items = await this.adminService.getExperts();
    return {
      title: 'Experts Management',
      username: session.username,
      items,
    };
  }

  @Get('experts/create')
  @Render('admin/experts-form')
  createExpertsForm(@Session() session: Record<string, any>, @Res() res: Response) {
    try {
      console.log('Create Experts Form - Session:', session);
      
      if (!session.isLoggedIn) {
        console.log('Create Experts Form - Not logged in');
        return res.redirect('/admin/login');
      }
      
      const result = {
        title: 'Create Expert',
        username: session.username,
        item: null,
        action: '/admin/experts',
      };
      
      console.log('Create Experts Form - Result:', result);
      return result;
    } catch (error) {
      console.error('Create Experts Form - Error:', error);
      return res.status(500).json({
        message: 'Failed to load create form',
        error: error.message
      });
    }
  }

  @Post('experts')
  @UseInterceptors(FileInterceptor('image'))
  async createExpert(
    @Body() body: Expert,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Create Expert - Body:', body);
      console.log('Create Expert - File:', file);
      console.log('Create Expert - Session:', session);
      
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
        console.log('Create Expert - Image path:', body.image);
      }
      
      const expert = await this.adminService.createExpert(body);
      console.log('Create Expert - Success:', expert);
      return res.redirect('/admin/experts');
    } catch (error) {
      console.error('Create Expert - Error:', error);
      return res.status(500).json({
        message: 'Failed to create expert',
        error: error.message
      });
    }
  }

  @Get('experts/edit/:id')
  @Render('admin/experts-form')
  async editExpertsForm(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
        const item = await this.adminService.getExpertById(id);
    return {
      title: 'Edit Expert',
      username: session.username,
      item,
      action: `/admin/experts/${id}`,
    };
  }

  @Put('experts/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateExpert(
    @Param('id') id: string,
    @Body() body: Partial<Expert>,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Update Expert - Body:', body);
      console.log('Update Expert - File:', file);
      console.log('Update Expert - Session:', session);
      
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
        console.log('Update Expert - Image path:', body.image);
      }
      
      const expert = await this.adminService.updateExpert(id, body);
      console.log('Update Expert - Success:', expert);
      return res.redirect('/admin/experts');
    } catch (error) {
      console.error('Update Expert - Error:', error);
      return res.status(500).json({
        message: 'Failed to update expert',
        error: error.message
      });
    }
  }

  @Post('experts/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateExpertPost(
    @Param('id') id: string,
    @Body() body: Partial<Expert> & { _method?: string },
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('POST Expert - Body:', body);
      
      // Check if this is a delete request (form with _method=DELETE)
      if (body._method === 'DELETE') {
        console.log('Delete Expert - Session:', session);
        await this.adminService.deleteExpert(id);
        return res.json({ success: true });
      }
      
      // Otherwise, treat as update
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
      }
      
      const expert = await this.adminService.updateExpert(id, body);
      console.log('POST Expert Update - Success:', expert);
      return res.redirect('/admin/experts');
    } catch (error) {
      console.error('POST Expert - Error:', error);
      return res.status(500).json({
        message: 'Failed to update expert',
        error: error.message
      });
    }
  }

  @Delete('experts/:id')
  async deleteExpert(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Delete Expert - Session:', session);
      await this.adminService.deleteExpert(id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Delete Expert - Error:', error);
      return res.status(500).json({
        message: 'Failed to delete expert',
        error: error.message
      });
    }
  }

  // Portfolio CRUD
  @Get('portfolios')
  @Render('admin/portfolios')
  async portfolios(@Session() session: Record<string, any>, @Res() res: Response) {
        const items = await this.adminService.getPortfolios();
    return {
      title: 'Portfolio Management',
      username: session.username,
      items,
    };
  }

  @Get('portfolios/create')
  @Render('admin/portfolios-form')
  createPortfoliosForm(@Session() session: Record<string, any>, @Res() res: Response) {
        return {
      title: 'Create Portfolio',
      username: session.username,
      item: null,
      action: '/admin/portfolios',
    };
  }

  @Post('portfolios')
  @UseInterceptors(FileInterceptor('image'))
  async createPortfolio(
    @Body() body: Portfolio,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Create Portfolio - Body:', body);
      console.log('Create Portfolio - File:', file);
      console.log('Create Portfolio - Session:', session);
      
      // Process technologies field - convert comma-separated string to array
      if (body.technologies && typeof body.technologies === 'string') {
        body.technologies = (body.technologies as string).split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
        console.log('Create Portfolio - Processed technologies:', body.technologies);
      }
      
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
        console.log('Create Portfolio - Image path:', body.image);
      }
      
      const portfolio = await this.adminService.createPortfolio(body);
      console.log('Create Portfolio - Success:', portfolio);
      return res.redirect('/admin/portfolios');
    } catch (error) {
      console.error('Create Portfolio - Error:', error);
      return res.status(500).json({
        message: 'Failed to create portfolio',
        error: error.message
      });
    }
  }

  @Get('portfolios/edit/:id')
  @Render('admin/portfolios-form')
  async editPortfoliosForm(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Edit Portfolio Form - ID:', id);
      console.log('Edit Portfolio Form - Session:', session);
      
      const item = await this.adminService.getPortfolioById(id);
      console.log('Edit Portfolio Form - Item:', item);
      
      return {
        title: 'Edit Activity Documentation',
        username: session.username,
        item,
        action: `/admin/portfolios/${id}`,
      };
    } catch (error) {
      console.error('Edit Portfolio Form - Error:', error);
      return res.status(500).json({
        message: 'Failed to load portfolio for editing',
        error: error.message
      });
    }
  }

  @Put('portfolios/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updatePortfolio(
    @Param('id') id: string,
    @Body() body: Partial<Portfolio>,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Update Portfolio - Body:', body);
      console.log('Update Portfolio - File:', file);
      
      // Process technologies field - convert comma-separated string to array
      if (body.technologies && typeof body.technologies === 'string') {
        body.technologies = (body.technologies as string).split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
        console.log('Update Portfolio - Processed technologies:', body.technologies);
      }
      
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
        console.log('Update Portfolio - Image path:', body.image);
      }
      
      const portfolio = await this.adminService.updatePortfolio(id, body);
      console.log('Update Portfolio - Success:', portfolio);
      return res.redirect('/admin/portfolios');
    } catch (error) {
      console.error('Update Portfolio - Error:', error);
      return res.status(500).json({
        message: 'Failed to update portfolio',
        error: error.message
      });
    }
  }

  @Post('portfolios/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updatePortfolioPost(
    @Param('id') id: string,
    @Body() body: Partial<Portfolio> & { _method?: string },
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('POST Portfolio - Body:', body);
      
      // Check if this is a delete request (form with _method=DELETE)
      if (body._method === 'DELETE') {
        console.log('Delete Portfolio - Session:', session);
        await this.adminService.deletePortfolio(id);
        return res.json({ success: true });
      }
      
      // Otherwise, treat as update
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
      }
      
      // Process technologies field - convert comma-separated string to array
      if (body.technologies && typeof body.technologies === 'string') {
        body.technologies = (body.technologies as string).split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
        console.log('POST Portfolio Update - Processed technologies:', body.technologies);
      }
      
      const portfolio = await this.adminService.updatePortfolio(id, body);
      console.log('POST Portfolio Update - Success:', portfolio);
      return res.redirect('/admin/portfolios');
    } catch (error) {
      console.error('POST Portfolio - Error:', error);
      return res.status(500).json({
        message: 'Failed to update portfolio',
        error: error.message
      });
    }
  }

  @Delete('portfolios/:id')
  async deletePortfolio(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Delete Portfolio - Session:', session);
      await this.adminService.deletePortfolio(id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Delete Portfolio - Error:', error);
      return res.status(500).json({
        message: 'Failed to delete portfolio',
        error: error.message
      });
    }
  }

  // Academy CRUD
  @Get('academies')
  @Render('admin/academies')
  async academies(@Session() session: Record<string, any>, @Res() res: Response) {
    try {
      console.log('=== ACADEMIES ROUTE DEBUG ===');
      console.log('Academies List - Session:', session);
      console.log('Academies List - Session keys:', Object.keys(session || {}));
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Academies List - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      
      console.log('Academies List - Session valid, loading academies');
      console.log('About to call adminService.getAcademies()...');
      
      const items = await this.adminService.getAcademies();
      console.log('Academies List - Items loaded:', items.length);
      console.log('Academies List - Items sample:', items.slice(0, 2));
      
      return {
        title: 'Academy Management',
        username: session.username,
        items,
        activeTab: 'academies', // For dashboard navigation
      };
    } catch (error) {
      console.error('=== ACADEMIES ROUTE ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error code:', (error as any).code);
      console.error('Full error object:', error);
      
      return res.status(500).json({
        message: 'Failed to load academies',
        error: error.message,
        stack: error.stack
      });
    }
  }

  @Get('academies/create')
  @Render('admin/academies-form-fixed')
  async createAcademiesForm(@Session() session: Record<string, any>, @Res() res: Response) {
    try {
      console.log('Create Academy Form - Session:', session);
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Create Academy Form - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      
      console.log('Create Academy Form - Session valid, returning fixed template');
      
      return {
        title: 'Create Academy',
        username: session.username,
        item: null,
        action: '/admin/academies',
      };
    } catch (error) {
      console.error('Create Academy Form - Error:', error);
      return res.status(500).json({
        message: 'Failed to load academy creation form',
        error: error.message
      });
    }
  }

  @Post('academies')
  @UseInterceptors(FileInterceptor('image'))
  async createAcademy(
    @Body() body: Academy,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Create Academy - Body:', body);
      console.log('Create Academy - File:', file);
      console.log('Create Academy - Session:', session);
      
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
        console.log('Create Academy - Image path:', body.image);
      }
      
      const academy = await this.adminService.createAcademy(body);
      console.log('Create Academy - Success:', academy);
      return res.redirect('/admin/academies');
    } catch (error) {
      console.error('Create Academy - Error:', error);
      return res.status(500).json({
        message: 'Failed to create academy',
        error: error.message
      });
    }
  }

  @Post('academies/json')
  async createAcademyJson(
    @Body() body: Academy,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Create Academy JSON - Body:', body);
      console.log('Create Academy JSON - Session:', session);
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Create Academy JSON - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      
      const academy = await this.adminService.createAcademy(body);
      console.log('Create Academy JSON - Success:', academy);
      return res.json({ success: true, academy });
    } catch (error) {
      console.error('Create Academy JSON - Error:', error);
      return res.status(500).json({
        message: 'Failed to create academy',
        error: error.message
      });
    }
  }

  @Get('academies/edit/:id')
  @Render('admin/academies-edit')
  async editAcademiesForm(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Edit Academy Form - ID:', id);
      console.log('Edit Academy Form - Session:', session);
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Edit Academy Form - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      
      const item = await this.adminService.getAcademyById(id);
      console.log('Edit Academy Form - Item:', item);
      
      return {
        title: 'Edit Academy',
        username: session.username,
        item,
        action: `/admin/academies/${id}`,
      };
    } catch (error) {
      console.error('Edit Academy Form - Error:', error);
      return res.status(500).json({
        message: 'Failed to load academy for editing',
        error: error.message
      });
    }
  }

  @Post('academies/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateAcademyPost(
    @Param('id') id: string,
    @Body() body: Partial<Academy>,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Update Academy - Session:', session);
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Update Academy - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      console.log('Update Academy - Body:', body);
      console.log('Update Academy - File:', file);
      
      if (file) {
        body.image = `/uploads/admin/${file.filename}`;
        console.log('Update Academy - Image path:', body.image);
      }
      
      const academy = await this.adminService.updateAcademy(id, body);
      console.log('Update Academy - Success:', academy);
      return res.redirect('/admin/academies');
    } catch (error) {
      console.error('Update Academy - Error:', error);
      return res.status(500).json({
        message: 'Failed to update academy',
        error: error.message
      });
    }
  }

  @Put('academies/:id/json')
  async updateAcademyJson(
    @Param('id') id: string,
    @Body() body: Partial<Academy>,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Update Academy JSON - ID:', id);
      console.log('Update Academy JSON - Body:', body);
      console.log('Update Academy JSON - Session:', session);
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Update Academy JSON - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      
      const academy = await this.adminService.updateAcademy(id, body);
      console.log('Update Academy JSON - Success:', academy);
      return res.json({ success: true, academy });
    } catch (error) {
      console.error('Update Academy JSON - Error:', error);
      return res.status(500).json({
        message: 'Failed to update academy',
        error: error.message
      });
    }
  }

  @Delete('academies/:id')
  async deleteAcademy(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Delete Academy - Session:', session);
      await this.adminService.deleteAcademy(id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Delete Academy - Error:', error);
      return res.status(500).json({
        message: 'Failed to delete academy',
        error: error.message
      });
    }
  }

  @Post('change-password')
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Change Password - Session:', session);
      
      // Check if user is logged in
      if (!session || !session.isLoggedIn) {
        console.log('Change Password - No session found, redirecting to login');
        return res.redirect('/admin/login');
      }
      
      // Validate input
      if (!body.currentPassword || !body.newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password saat ini dan password baru harus diisi'
        });
      }
      
      // Validate password length
      if (body.newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password baru minimal 6 karakter'
        });
      }
      
      // Verify current password (check against environment or session storage)
      const currentStoredPassword = session.password || process.env.ADMIN_PASSWORD;
      
      if (body.currentPassword !== currentStoredPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password saat ini salah!'
        });
      }
      
      // Update password in session (for this session only)
      // In production, you would also update in database
      session.password = body.newPassword;
      
      // Update environment variable for this session (temporary solution)
      // Note: This only works for the current session, not permanently
      process.env.ADMIN_PASSWORD = body.newPassword;
      
      console.log('Change Password - Password updated successfully');
      
      // Auto logout after successful password change
      session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        console.log('Session destroyed for security after password change');
      });
      
      return res.json({
        success: true,
        message: 'Password berhasil diubah! Anda akan diarahkan ke halaman login untuk menggunakan password baru.',
        redirect: '/admin/login'
      });
      
    } catch (error) {
      console.error('Change Password - Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengubah password',
        error: error.message
      });
    }
  }
}
