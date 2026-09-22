const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary credentials missing; using local uploads directory fallback');
}

/**
 * Uploads a file buffer or local file path to Cloudinary or falls back to public local upload URL
 * @param {Object} file Multer file object
 * @param {String} folder Destination folder
 * @returns {Promise<String>} Image URL
 */
const uploadToCloudinaryOrLocal = async (file, folder = 'fixit_complaints') => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fixit/${folder}`,
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error.message);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      if (file.buffer) {
        uploadStream.end(file.buffer);
      } else if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
      } else {
        reject(new Error('Invalid file object for upload'));
      }
    });
  }

  // Fallback: Store locally in uploads/ directory and return static URL
  const uploadsDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '.jpg')}`;
  const filepath = path.join(uploadsDir, filename);

  if (file.buffer) {
    fs.writeFileSync(filepath, file.buffer);
  } else if (file.path) {
    fs.copyFileSync(file.path, filepath);
  }

  const baseUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinaryOrLocal
};
