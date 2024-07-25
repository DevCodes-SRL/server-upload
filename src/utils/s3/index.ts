import { S3Client } from "@aws-sdk/client-s3";
import { logger } from "../../lib/logger";
import { UploadAgentOptions } from "../../types";

const s3Clients = {} as Record<string, S3Client>;

// Create S3 Clients
const createS3Clients = (options: UploadAgentOptions) => {
  try {
    logger.log("Creating S3 Clients");

    for (let index = 0; index < options.s3.length; index++) {
      logger.log(
        "Creating S3 Client for Bucket: " + options.s3[index].bucketName
      );

      const { accessKey, bucketName, bucketRegion, secretKey } =
        options.s3[index];

      s3Clients[bucketName] = new S3Client({
        region: bucketRegion,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
    }
  } catch (error: any) {
    logger.error(error);
  }
};

// Export
export { createS3Clients, s3Clients };
