import multer from "multer";
import { FileFilter, MulterOptions } from "../../types";

const fileStorage = multer.memoryStorage();

const fileFilter = ({ req, file, cb, allowedMimes }: FileFilter) => {
  if (!allowedMimes) {
    return cb(null, true);
  }

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error("Invalid mime type"));
  }

  cb(null, true);
};

const multerMiddleware = ({ allowedMimes, maxSize }: MulterOptions) => {
  return multer({
    storage: fileStorage,
    fileFilter: (req, file, cb) => fileFilter({ req, file, cb, allowedMimes }),
    limits: {
      fileSize: maxSize,
    },
  });
};

export default multerMiddleware;
