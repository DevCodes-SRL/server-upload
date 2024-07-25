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

export default class UploadAgent {
  static options: UploadAgentOptions;

  constructor(options: UploadAgentOptions) {
    UploadAgent.options = options;
  }

  uploadMiddleware({ allowedMimes, maxSize }: MulterOptions) {
    return multerMiddleware({
      allowedMimes,
      maxSize,
    });
  }

  async uploadFilesFromRequest({
    req,
    folder,
    isPrivateAccess,
    bucketName,
    imageOptimization,
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

  async uploadFileToS3({
    file,
    folder,
    isPrivateAccess,
    bucketName,
    imageOptimization,
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

  async generatePreSignedUrl({
    key,
    bucketName,
    expiresIn,
  }: GeneratePreSignedUrl) {
    return await generatePreSignedUrl({ key, bucketName, expiresIn });
  }

  async deleteFileFromS3({ key, bucketName }: DeleteFileFromS3) {
    return await deleteFile({ key, bucketName });
  }

  create(): this {
    createS3Clients(UploadAgent.options);

    return this;
  }
}
