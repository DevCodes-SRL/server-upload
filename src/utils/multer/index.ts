import multer from "multer";
import { FileFilter, MulterOptions } from "../../types";

const fileStorage = multer.memoryStorage();

/**
 * Filters files based on their MIME type during the upload process.
 *
 * @param req - The request object. (Required)
 * @param file - The file being uploaded. (Required)
 * @param cb - The callback function to signal whether the file should be accepted or rejected. (Required)
 * @param allowedMimes - An array of allowed MIME types. If not provided, all MIME types are allowed. (Optional)
 * @returns Calls the callback with an error if the file's MIME type is not allowed, or with `null` and `true` to accept the file.
 */
const fileFilter = ({ req, file, cb, allowedMimes }: FileFilter) => {
  if (!allowedMimes) {
    return cb(null, true);
  }

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error("Invalid mime type"));
  }

  cb(null, true);
};

/**
 * Configures and returns a multer middleware for handling file uploads with specified options.
 *
 * @param allowedMimes - An array of allowed MIME types for the uploaded files. If not provided, all MIME types are allowed. (Optional)
 * @param maxSize - The maximum allowed file size in bytes. (Required)
 * @returns A multer middleware function configured with the specified file filters and size limits.
 */
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
