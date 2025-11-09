import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dlwldzscu',
  api_key: '999868714772457',
  api_secret: '2fAKT6GvPVOWbpApuixl9CJ_HO4',
  secure: true
});

// Create storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'afnanecommerce/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' }
      ],
      resource_type: 'auto'
    };
  }
});

// File filter for multer
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP files are allowed.'), false);
  }
};

// Create multer instance with the storage engine
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 1
  },
  fileFilter: fileFilter
});

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

export { cloudinary, upload, handleUploadError };

// This file configures Cloudinary for image storage and sets up Multer middleware for handling file uploads.
// It ensures that only image files are uploaded and applies transformations for optimization.
