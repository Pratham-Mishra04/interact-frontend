import { resizeImage } from '@/utils/resize_image';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { EVENT_PIC_URL, PROJECT_PIC_URL } from '@/config/routes';

type Type = 'Project' | 'Event' | 'Hackathon';

interface Props {
  setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  initialImage?: string;
  picType?: Type;
}

const CoverPic = ({ setSelectedFile, initialImage, picType = 'Project' }: Props) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    initialImage ? `${picType == 'Event' ? EVENT_PIC_URL : PROJECT_PIC_URL}/${initialImage}` : ''
  );
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl('');
    };
  }, []);

  const width = picType == 'Project' ? 1080 : 1920;
  const height = picType == 'Event' ? 1080 : picType == 'Hackathon' ? 540 : 1080;

  return (
    <div
      className={`w-full max-md:h-full ${
        picType == 'Project' ? 'hover:scale-105' : ''
      } max-md:py-2 overflow-auto flex flex-col items-center gap-4 transition-ease-300`}
    >
      <input
        type="file"
        className="hidden"
        id="image"
        multiple={false}
        onChange={async ({ target }) => {
          if (target.files && target.files.length > 0) {
            if (target.files[0].type.split('/')[0] === 'image') {
              try {
                const resizedPic = await resizeImage(target.files[0], width, height);
                setSelectedImageUrl(URL.createObjectURL(resizedPic));
                setSelectedFile(resizedPic);
              } catch (error) {
                console.error('Error while resizing image:', error);
                return null;
              }
            } else {
              Toaster.error('Only Images allowed');
              return null;
            }
          }
        }}
      />

      <label className={`${picType != 'Project' ? 'w-full' : 'w-fit'}`} htmlFor="image">
        {picType != 'Project' ? (
          selectedImageUrl == '' ? (
            <div
              className={`rounded-xl w-full ${
                picType == 'Hackathon' ? 'h-80' : 'h-96'
              } bg-primary_comp hover:bg-primary_comp_hover flex-center transition-ease-500 cursor-pointer`}
            >
              Click here to add cover picture
            </div>
          ) : (
            <Image
              crossOrigin="anonymous"
              width={500}
              height={275}
              alt="event cover"
              src={selectedImageUrl}
              className="w-full h-full rounded-xl cursor-pointer"
            />
          )
        ) : selectedImageUrl == '' ? (
          <div className="rounded-xl max-md:text-xs w-80 max-md:w-56 h-80 max-md:h-56 bg-primary_comp hover:bg-primary_comp_hover dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover flex-center transition-ease-500 cursor-pointer">
            Click here to add cover picture
          </div>
        ) : (
          <Image
            crossOrigin="anonymous"
            width={500}
            height={275}
            alt="project cover"
            src={selectedImageUrl}
            className="rounded-xl w-80 max-md:w-56 h-80 max-md:h-56 cursor-pointer object-cover"
          />
        )}
      </label>
    </div>
  );
};

export default CoverPic;
