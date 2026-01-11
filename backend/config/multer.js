import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directories exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createDir('uploads/listings');
createDir('uploads/profiles');

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Storage configuration for listings using Disk Storage
const listingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/listings');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'listing-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for profile images using Disk Storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer instances
export const uploadListing = multer({
  storage: listingStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

export const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
});
