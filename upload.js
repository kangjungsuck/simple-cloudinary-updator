const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const recursiveReaddir = require('recursive-readdir');

// Load environment variables from env.local file
dotenv.config();

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
async function uploadFile(filePath) {
  try {
    // Ignore .DS_Store files
    if (path.basename(filePath) === '.DS_Store') {
      console.log(`Ignoring ${filePath}`);
      return;
    }

    const cloudinaryFolderPath = path.join(
      process.env.FOLDER_NAME || '',
      path.dirname(filePath).replace('myImages/', '')
    );
    const result = await cloudinary.uploader.upload(filePath, {
      folder: cloudinaryFolderPath,
      use_filename: true,
      unique_filename: false,
    });
    console.log(`Uploaded ${filePath} to ${result.url}`);
  } catch (error) {
    console.error(
      `Failed to upload ${filePath}. Error: ${
        error.message || JSON.stringify(error)
      }`
    );
  }
}

async function uploadAllFilesInFolder(folderPath) {
  try {
    // Only consider files with extensions, this helps ignore some system files
    const files = await recursiveReaddir(folderPath, [
      (file, stats) => {
        return !stats.isDirectory() && !path.extname(file);
      },
    ]);

    for (const file of files) {
      await uploadFile(file);
    }
    console.log('All files uploaded successfully!');
  } catch (error) {
    console.error(`Failed to read files from folder. Error: ${error.message}`);
  }
}
uploadAllFilesInFolder('./myImages');
