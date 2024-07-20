const cloudinary = require("../configs/cloudinary.config");

const deleteImage = async (public_id) => {
  if (!public_id || public_id.length < 0) {
    return;
  }
  const result = await cloudinary.api.delete_resources(public_id);
  return result;
};

module.exports = deleteImage;
