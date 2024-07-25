import sharp from 'sharp';
import { SharpCompress } from '../../types';

const sharpCompress = async ({ buffer }: SharpCompress): Promise<Buffer> => {
  return await sharp(buffer)
    .resize(2000, 2000, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .withMetadata()
    .webp()
    .toBuffer();
};

export { sharpCompress };