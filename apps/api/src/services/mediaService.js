const cloudinary = require("cloudinary").v2;
const { HttpError } = require("../utils/errors");
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER
} = require("../utils/env");

function ensureCloudinaryConfigured() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new HttpError(501, "Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
}

function buildDataUri(file) {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

async function uploadAvatar(file, userId) {
  if (!file) {
    throw new HttpError(400, "Avatar file is required");
  }

  ensureCloudinaryConfigured();

  const result = await cloudinary.uploader.upload(buildDataUri(file), {
    folder: CLOUDINARY_FOLDER,
    public_id: userId,
    overwrite: true,
    resource_type: "image"
  });

  return result.secure_url;
}

module.exports = { uploadAvatar };
