import { S3Client } from "@aws-sdk/client-s3";
import { logger } from "../../lib/logger";
import { UploadAgentOptions } from "../../types";

const s3Clients = {} as Record<string, S3Client>;

/**
 * Creates and configures S3 clients for each S3 bucket specified in the options.
 *
 * @param options - Configuration options for the upload agent, including S3 bucket details. (Required)
 * @throws Error if there is an issue during the creation of any S3 client.
 */
const createS3Clients = (options: UploadAgentOptions) => {
  try {
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
