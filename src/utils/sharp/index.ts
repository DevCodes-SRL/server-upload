import sharp from "sharp";
import { SharpCompress } from "../../types";

/**
 * Compresses an image buffer using the Sharp library by resizing and converting it to WebP format.
 *
 * @param buffer - The image file buffer to be compressed. (Required)
 * @returns A promise that resolves with the compressed image buffer in WebP format.
 * @throws Error if there is an issue with the image processing.
 */
const sharpCompress = async ({ buffer }: SharpCompress): Promise<Buffer> => {
  return await sharp(buffer)
    .resize(2000, 2000, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .withMetadata()
    .webp()
    .toBuffer();
};

export { sharpCompress };
