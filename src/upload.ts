import { fileTypeFromBuffer } from "file-type";
import {
  DeleteFileFromS3,
  GeneratePreSignedUrl,
  MulterOptions,
  UploadAgentOptions,
  UploadFilesFromRequest,
  UploadFileToS3,
} from "./types";
import { mimeTypesImage } from "./utils/mimeTypes";
import multerMiddleware from "./utils/multer";
import { createS3Clients } from "./utils/s3";
import {
  deleteFile,
  generatePreSignedUrl,
  uploadFile,
} from "./utils/s3/functions";
import { sharpCompress } from "./utils/sharp";

/**
 * UploadAgent is a class that provides methods for handling file uploads,
 * including integration with AWS S3, file optimization, and generating pre-signed URLs for file access.
 */
export default class UploadAgent {
  static options: UploadAgentOptions;

  /**
   * Initializes the UploadAgent with the provided options.
   *
   * @param options - Configuration options for the upload agent.
   */
  constructor(options: UploadAgentOptions) {
    UploadAgent.options = options;
  }

  /**
   * Returns a middleware function for handling file uploads with specified MIME types and size limits.
   *
   * @param allowedMimes - List of allowed MIME types. Default is all types.
   * @param maxSize - Maximum allowed file size in bytes. Default is `Infinity`.
   * @returns A middleware function for handling file uploads.
   */
  uploadMiddleware({ allowedMimes, maxSize }: MulterOptions) {
    return multerMiddleware({
      allowedMimes,
      maxSize,
    });
  }

  /**
   * Handles file uploads from a request, with optional image optimization.
   *
   * @param req - The request object containing the file(s) to upload.
   * @param folder - The destination folder in the S3 bucket. Node: It must start with '/' and not end with '/'
   * @param isPrivateAccess - Whether the uploaded files should have private access.
   * @param bucketName - The name of the S3 bucket.
   * @param imageOptimization - Optional flag to optimize images before upload. Default is `false`.
   * @returns A promise that resolves with the result of the upload or an array of upload results.
   */
  async uploadFilesFromRequest({
    req,
    folder,
    isPrivateAccess,
    bucketName,
    imageOptimization = false,
  }: UploadFilesFromRequest) {
    if (req.file) {
      const isPossibleToOptimize =
        mimeTypesImage.includes(req.file.mimetype) && imageOptimization;

      var fileBuffer: Buffer;

      if (isPossibleToOptimize) {
        fileBuffer = await sharpCompress({ buffer: req.file.buffer });
      } else {
        fileBuffer = req.file.buffer;
      }

      return await uploadFile({
        bucketName,
        file: fileBuffer,
        folder,
        isPrivateAccess,
        contentType: req.file.mimetype,
      });
    }

    if (req.files) {
      const files = req.files as Express.Multer.File[];

      const filesPromises = files.map(async (file) => {
        const isPossibleToOptimize =
          mimeTypesImage.includes(file.mimetype) && imageOptimization;

        var fileBuffer: Buffer;

        if (isPossibleToOptimize) {
          fileBuffer = await sharpCompress({ buffer: file.buffer });
        } else {
          fileBuffer = file.buffer;
        }

        return await uploadFile({
          bucketName,
          file: fileBuffer,
          folder,
          isPrivateAccess,
          contentType: isPossibleToOptimize ? "image/webp" : file.mimetype,
        });
      });

      return await Promise.all(filesPromises);
    }

    return this;
  }

  /**
   * Uploads a single file to S3, with optional image optimization.
   *
   * @param file - The file buffer to upload.
   * @param folder - The destination folder in the S3 bucket. Node: It must start with '/' and not end with '/'
   * @param isPrivateAccess - Whether the uploaded file should have private access.
   * @param bucketName - The name of the S3 bucket.
   * @param imageOptimization - Optional flag to optimize the image before upload. Default is `false`.
   * @returns A promise that resolves with the result of the upload.
   * @throws Error if the file type is invalid.
   */
  async uploadFileToS3({
    file,
    folder,
    isPrivateAccess,
    bucketName,
    imageOptimization = false,
  }: UploadFileToS3) {
    const contentType = await fileTypeFromBuffer(file);
    const mime = contentType?.mime;

    if (!mime) {
      throw new Error("Invalid file type");
    }

    const isPossibleToOptimize =
      mimeTypesImage.includes(mime) && imageOptimization;

    var fileBuffer: Buffer;

    if (isPossibleToOptimize) {
      fileBuffer = await sharpCompress({ buffer: file });
    } else {
      fileBuffer = file;
    }

    return await uploadFile({
      bucketName,
      file: fileBuffer,
      folder,
      isPrivateAccess,
      contentType: isPossibleToOptimize ? "image/webp" : mime,
    });
  }

  /**
   * Generates a pre-signed URL for accessing a file in S3.
   *
   * @param key - The key of the file in the S3 bucket.
   * @param bucketName - The name of the S3 bucket.
   * @param expiresIn - The expiration time for the pre-signed URL, in seconds. Default is `3600`.
   * @returns A promise that resolves with the generated pre-signed URL.
   */
  async generatePreSignedUrl({
    key,
    bucketName,
    expiresIn,
  }: GeneratePreSignedUrl) {
    return await generatePreSignedUrl({ key, bucketName, expiresIn });
  }

  /**
   * Deletes a file from S3.
   *
   * @param key - The key of the file in the S3 bucket.
   * @param bucketName - The name of the S3 bucket.
   * @returns A promise that resolves when the file has been deleted. Boolean value is returned.
   */
  async deleteFileFromS3({ key, bucketName }: DeleteFileFromS3) {
    return await deleteFile({ key, bucketName });
  }

  /**
   * Creates the S3 clients needed for the upload agent using the provided options.
   *
   * @returns The current instance of the UploadAgent.
   */
  create(): this {
    createS3Clients(UploadAgent.options);

    return this;
  }
}
