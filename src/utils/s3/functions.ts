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

// Upload File
const uploadFile = async ({
  file,
  folder,
  bucketName,
  isPrivateAccess,
  contentType,
}: UploadFile) => {
  try {
    if (!s3Clients[bucketName]) {
      logger.warn("S3 Client not found - " + bucketName);
      return;
    }

    return new Promise(async (resolve, reject) => {
      const params = {
        Bucket: bucketName,
        Body: file,
        Key: folder ? `${folder}/${uuidv4()}` : uuidv4(),
        ContentType: contentType,
        ACL: isPrivateAccess ? "private" : "public-read",
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

// Generate Pre-Signed URL
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

// Delete File
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
