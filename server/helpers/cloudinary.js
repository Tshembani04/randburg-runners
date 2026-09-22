const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary with your account credentials
cloudinary.config({
  cloud_name: "obuhoxmn",
  api_key: "436296218956729",
  api_secret: "X41jktqxG4Og902yY_P7olNMgR4",
});

// Set up multer for handling file uploads in memory
const storage = new multer.memoryStorage();

// Utility function to upload an image to Cloudinary
async function imageUploadUtil(file) {
  // Upload the file to Cloudinary and return the result
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

// Export the upload middleware and the image upload utility function
const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
