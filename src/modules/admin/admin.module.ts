import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'admin');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
        const allowedPdfTypes = /pdf/;
        const imageExtname = allowedImageTypes.test(file.originalname.toLowerCase());
        const pdfExtname = allowedPdfTypes.test(file.originalname.toLowerCase());
        const imageMimetype = allowedImageTypes.test(file.mimetype);
        const pdfMimetype = allowedPdfTypes.test(file.mimetype);

        if ((imageMimetype && imageExtname) || (pdfMimetype && pdfExtname)) {
          return cb(null, true);
        } else {
          const error = new Error('Only image files (jpeg, jpg, png, gif, webp) and PDF files are allowed!');
          return cb(error as any, false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB (increased for PDF)
      },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
