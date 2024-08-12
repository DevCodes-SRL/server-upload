import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// UUID
import { v4 as uuidv4 } from "uuid";

// Types
import { DeleteFile, PreSignedUrl, UploadFile } from "../../types";

// S3 Clients
import { s3Clients } from "./index";
import { logger } from "../../lib/logger";

// Options
import UploadAgent from "../../index";

// Regex to validate the folder path
const folderRegex = /^\/[^\/\0]+(?:\/[^\/\0]+)*[^\/\0]$/;

/**
 * Uploads a file to an S3 bucket with optional folder placement and access control.
 *
 * @param file - The file buffer to upload. (Required)
 * @param folder - The destination folder in the S3 bucket. If not provided, the file will be placed at the root. (Optional)
 * @param bucketName - The name of the S3 bucket where the file will be uploaded. (Required)
 * @param isPrivateAccess - Whether the file should have private access. Defaults to the bucket's global access setting. (Optional)
 * @param contentType - The MIME type of the file. (Required)
 * @returns A promise that resolves with the file's key in the S3 bucket upon successful upload.
 * @throws Error if the S3 client for the specified bucket is not found, if the folder path is invalid, or if the content type is not provided.
 */
const uploadFile = async ({
  file,
  folder = undefined,
  bucketName,
  isPrivateAccess,
  contentType,
}: UploadFile) => {
  try {
    if (!s3Clients[bucketName]) {
      return logger.warn("S3 Client not found - " + bucketName);
    }

    if (folder && !folderRegex.test(folder)) {
      throw new Error(
        "Invalid folder path. It must start with '/' and not end with '/' and must not contain invalid characters."
      );
    }

    if (!contentType) {
      throw new Error("Invalid content type");
    }

    // Get the global options
    const options = UploadAgent.options;

    // Check if the bucket is private or public
    const globalIsPrivateAccess =
      options.s3.find((item) => item.bucketName === bucketName)
        ?.isPrivateAccess ?? true; // Default to private

    const inlinedIsPrivateAccess = isPrivateAccess ?? globalIsPrivateAccess;

    return new Promise(async (resolve, reject) => {
      const params = {
        Bucket: bucketName,
        Body: file,
        Key: folder ? `${folder}/${uuidv4()}` : uuidv4(),
        ContentType: contentType,
        ACL: inlinedIsPrivateAccess ? "private" : "public-read", // Default to private
      } as PutObjectCommandInput;

      const upload = new Upload({
        client: s3Clients[bucketName],
        params,
      });

      try {
        const { Key } = await upload.done();
        resolve(Key);
      } catch (e) {
        reject(e);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Generates a pre-signed URL for accessing a file in an S3 bucket.
 *
 * @param key - The key of the file in the S3 bucket. (Required)
 * @param bucketName - The name of the S3 bucket. (Required)
 * @param expiresIn - The time in seconds before the URL expires. Defaults to `3600` seconds (1 hour). (Optional)
 * @returns A promise that resolves with the pre-signed URL for accessing the file.
 * @throws Error if the S3 client for the specified bucket is not found.
 */
const generatePreSignedUrl = async ({
  key,
  bucketName,
  expiresIn = 3600,
}: PreSignedUrl) => {
  try {
    if (!s3Clients[bucketName]) {
      logger.warn("S3 Client not found - " + bucketName);
      return;
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Clients[bucketName], command, {
      expiresIn,
    });
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Deletes a file from an S3 bucket.
 *
 * @param key - The key of the file in the S3 bucket. (Required)
 * @param bucketName - The name of the S3 bucket. (Required)
 * @returns A promise that resolves with `true` when the file has been successfully deleted.
 * @throws Error if the S3 client for the specified bucket is not found.
 */
const deleteFile = async ({ key, bucketName }: DeleteFile) => {
  try {
    if (!s3Clients[bucketName]) {
      logger.warn("S3 Client not found - " + bucketName);
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    await s3Clients[bucketName].send(new DeleteObjectCommand(params));

    return true;
  } catch (error) {
    logger.error(error);
  }
};

export { deleteFile, generatePreSignedUrl, uploadFile };
