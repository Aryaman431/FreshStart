
import data from '@/app/lib/placeholder-images.json';
import type { StaticImageData } from 'next/image';
import per1 from './per1.png';
import per2 from './per2.png';
import per3 from './per3.png';
import per4 from './per4.png';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string | StaticImageData;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages.map((img) => {
  switch (img.id) {
    case 'student-1':
      return { ...img, imageUrl: per1 };
    case 'student-2':
      return { ...img, imageUrl: per2 };
    case 'student-3':
      return { ...img, imageUrl: per3 };
    case 'student-4':
      return { ...img, imageUrl: per4 };
    default:
      return img;
  }
});
