const multer = require("multer");
const upload = multer();
const { asyncHandler } = require("../utils/errorHandle");
const cloudinary = require("../configs/cloudinary.config");
const { regexImage } = require("../utils");

const uploadFile = (fieldName) => {
  return upload.single(fieldName);
};

const uploadFiles = (fieldName, count) => {
  return upload.array(fieldName, count);
};

const cloudinaryUpload = asyncHandler(async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return next();
  }

  if (!regexImage.test(file.originalname)) {
    return next();
  }

  const image = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream((err, uploadResult) => {
        if (err) return reject(err);
        return resolve(uploadResult);
      })
      .end(file.buffer);
  });

  if (image) {
    req.image = { public_id: image.public_id, url: image.secure_url };
  }
  next();
});

const transformImages = (req, res, next) => {};

const cloudinaryUploadMultiple = asyncHandler(async (req, res, next) => {
  const files = req.files;

  if (!files || files.length < 0) {
    return next();
  }

  const pendingImages = files.reduce((array, curr) => {
    if (regexImage.test(curr.originalname)) {
      array.push(
        new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream((err, uploadResult) => {
              if (err) return reject(err);
              const { public_id, secure_url: url } = uploadResult;
              return resolve({ public_id, url });
            })
            .end(curr.buffer);
        })
      );
    }
    return array;
  }, []);

  const images = await Promise.all(pendingImages);
  if (images.length > 0) {
    req.images = images;
  }
  next();
});

module.exports = {
  uploadFile,
  uploadFiles,
  cloudinaryUpload,
  transformImages,
  cloudinaryUploadMultiple,
};
