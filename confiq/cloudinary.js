import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dlwldzscu',
  api_key: '999868714772457',
  api_secret: '2fAKT6GvPVOWbpApuixl9CJ_HO4',
  secure: true
});

// Custom storage engine for Cloudinary
const storage = multer.memoryStorage();

// File filter for multer
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP files are allowed.'), false);
  }
};

// Create multer instance with memory storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 1
  },
  fileFilter: fileFilter
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'afnanecommerce/images') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ],
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size is too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({ success: false, message: err.message || 'Error uploading file' });
  }
  next();
};

export { cloudinary, upload, uploadToCloudinary, handleUploadError };

// This file configures Cloudinary for image storage and sets up Multer middleware for handling file uploads.
// It uses memory storage and a custom upload function to work with Cloudinary v2.
