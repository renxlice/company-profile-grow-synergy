import { Controller, Get, Post, Put, Delete, Body, Res, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';

@Controller('admin/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getBlogs(@Res() res: Response) {
    try {
      const blogs = await this.blogService.getAllBlogs();
      return res.render('admin/blogs', {
        title: 'Blog Management - Admin',
        username: 'Admin',
        items: blogs
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return res.render('admin/blogs', {
        title: 'Blog Management - Admin',
        username: 'Admin',
        items: []
      });
    }
  }

  @Get('create')
  async createBlogForm(@Res() res: Response) {
    return res.render('admin/blogs-form', {
      title: 'Create Article - Admin',
      username: 'Admin',
      item: null
    });
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createBlog(@UploadedFile() file: Express.Multer.File, @Body() createBlogDto: any, @Res() res: Response) {
    try {
      // Handle image upload
      if (file) {
        createBlogDto.image = `/uploads/${file.filename}`;
      } else if (!createBlogDto.image) {
        // If no file uploaded and no existing image, set default image or return error
        createBlogDto.image = '/images/default-blog.jpg';
      }
      
      // Parse tags
      if (createBlogDto.tags) {
        createBlogDto.tags = createBlogDto.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      }
      
      const blog = await this.blogService.createBlog(createBlogDto);
      return res.redirect('/admin/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      
      // If it's a validation error, show the form again with error
      if (error.message) {
        return res.render('admin/blogs-form', {
          title: 'Create Article - Admin',
          username: 'Admin',
          item: createBlogDto,
          error: error.message
        });
      }
      
      return res.status(500).render('admin/blogs-form', {
        title: 'Create Article - Admin',
        username: 'Admin',
        item: createBlogDto,
        error: 'An unexpected error occurred while creating the blog post.'
      });
    }
  }

  @Get('edit/:id')
  async editBlogForm(@Param('id') id: string, @Res() res: Response) {
    try {
      const blog = await this.blogService.getBlogById(id);
      if (!blog) {
        return res.redirect('/admin/blogs');
      }
      return res.render('admin/blogs-form', {
        title: 'Edit Article - Admin',
        username: 'Admin',
        item: blog
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      return res.redirect('/admin/blogs');
    }
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateBlog(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateBlogDto: any, @Res() res: Response) {
    try {
      // Handle image upload
      if (file) {
        updateBlogDto.image = `/uploads/${file.filename}`;
      }
      // If no new file uploaded, keep the existing image (don't overwrite)
      
      // Parse tags
      if (updateBlogDto.tags) {
        updateBlogDto.tags = updateBlogDto.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      }
      
      const blog = await this.blogService.updateBlog(id, updateBlogDto);
      return res.redirect('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      
      // If it's a validation error, show the form again with error
      if (error.message) {
        return res.render('admin/blogs-form', {
          title: 'Edit Article - Admin',
          username: 'Admin',
          item: { ...updateBlogDto, id },
          error: error.message
        });
      }
      
      return res.status(500).render('admin/blogs-form', {
        title: 'Edit Article - Admin',
        username: 'Admin',
        item: { ...updateBlogDto, id },
        error: 'An unexpected error occurred while updating the blog post.'
      });
    }
  }

  @Delete('delete/:id')
  async deleteBlog(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.blogService.deleteBlog(id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting blog:', error);
      return res.status(500).json({ success: false, message: 'Error deleting blog' });
    }
  }
}
