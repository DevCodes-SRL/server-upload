import { Request, Response } from "express";
import { FileFilterCallback } from "multer";

export interface UploadAgentOptions {
  s3: {
    isPrivateAccess: boolean;
    bucketName: string;
    bucketRegion: string;
    accessKey: string;
    secretKey: string;
  }[];
}

export interface UploadFilesFromRequest {
  req: Request;
  folder: string;
  isPrivateAccess: boolean;
  bucketName: string;
  imageOptimization: boolean;
}

export interface UploadFileToS3 {
  file: Buffer;
  folder: string;
  isPrivateAccess: boolean;
  bucketName: string;
  contentType: string;
  imageOptimization: boolean;
}

export interface DeleteFileFromS3 {
  key: string;
  bucketName: string;
}

// Store S3 Interfaces
export interface UploadFile {
  file: Buffer;
  folder: string;
  isPrivateAccess: boolean;
  bucketName: string;
  contentType: string;
}

export interface PreSignedUrl {
  key: string;
  bucketName: string;
  expiresIn: number;
}

export interface GeneratePreSignedUrl {
  key: string;
  bucketName: string;
  expiresIn: number;
}

export interface DeleteFile {
  key: string;
  bucketName: string;
}

// Store Multer Interfaces
export interface MulterOptions {
  allowedMimes: string[];
  maxSize: number;
}

export interface FileFilter {
  req: Request;
  file: Express.Multer.File;
  cb: FileFilterCallback;
  allowedMimes: string[];
}

// Store Sharp Interfaces
export interface SharpCompress {
  buffer: Buffer;
}
