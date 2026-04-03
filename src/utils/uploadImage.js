const cloudinary = require("../../config/cloudinaryConfig");
const fs = require("fs");

/**
 * Upload single file to Cloudinary
 * @param {string} filePath - local file path
 * @param {string} folder - Cloudinary folder
 * @param {string} resourceType - "image" or "video"
 * @returns {string} Cloudinary URL
 */
const uploadSingle = async (
  filePath,
  folder = "general",
  resourceType = "image",
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });
    return result.secure_url;
  } catch (err) {
    throw err;
  } finally {
    fs.unlinkSync(filePath);
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - array of file objects from multer
 * @param {string} folder
 * @param {string} resourceType
 * @returns {Array} Array of URLs
 */
const uploadMultiple = async (
  files,
  folder = "general",
  resourceType = "image",
) => {
  const urls = [];
  for (const file of files) {
    const url = await uploadSingle(file.path, folder, resourceType);
    urls.push(url);
  }
  return urls;
};

module.exports = { uploadSingle, uploadMultiple };
