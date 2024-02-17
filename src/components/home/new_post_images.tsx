import { CarouselProvider, Slider, Dot, Slide } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import React, { useState } from 'react';
import Image from 'next/image';
import Toaster from '@/utils/toaster';
import { resizeImage } from '@/utils/resize_image';
import { Images } from '@phosphor-icons/react';
import { MAX_IMAGE_SIZE } from '@/config/constants';

interface Props {
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const NewPostImages = ({ setSelectedFiles }: Props) => {
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  return (
    <div className={`flex-col ${selectedImageUrls.length == 0 ? 'w-fit' : 'w-full'}`}>
      <input
        type="file"
        className="hidden"
        id="image"
        multiple={true}
        onChange={async ({ target }) => {
          if (target.files && target.files.length > 0) {
            if (target.files.length + selectedImageUrls.length > 5) {
              Toaster.error('Can add at most 5 photos.');
              return;
            }

            const resizedImages = await Promise.all(
              Array.from(target.files).map(async file => {
                if (file.type.split('/')[0] === 'image') {
                  try {
                    const resizedPic = await resizeImage(file, 1280, 720, MAX_IMAGE_SIZE / 5);
                    return resizedPic;
                  } catch (error) {
                    console.error('Error while resizing image:', error);
                    return null;
                  }
                } else {
                  Toaster.error('Only Images allowed');
                  return null;
                }
              })
            );
            const filteredResizedImages = resizedImages.filter(img => img !== null);

            setSelectedImageUrls(prev => [
              ...prev,
              ...filteredResizedImages.map(img => URL.createObjectURL(img as File)),
            ]);
            setSelectedFiles(prev => [...prev, ...(filteredResizedImages.filter(img => img !== null) as File[])]);
          }
        }}
      />
      <label htmlFor="image" className="w-fit cursor-pointer">
        <Images className="cursor-pointer" size={24} />
      </label>
      {selectedImageUrls.length > 0 ? (
        <CarouselProvider
          naturalSlideHeight={500}
          naturalSlideWidth={1000}
          totalSlides={selectedImageUrls.length}
          visibleSlides={2}
          infinite={true}
          dragEnabled={true}
          isPlaying={false}
          className="w-full h-full dark:text-white flex items-center justify-center rounded-xl relative"
        >
          <Slider className="w-full rounded-xl ">
            {selectedImageUrls.map((el, index) => {
              return (
                <Slide
                  index={index}
                  key={index}
                  className="w-full h-full rounded-xl text-center flex items-center justify-center"
                >
                  <div className="w-fit pl-2 relative rounded-xl">
                    <div
                      onClick={() => {
                        setSelectedFiles(prev => prev.filter((file, i) => i != index));
                        setSelectedImageUrls(prev => prev.filter((img, i) => i != index));
                      }}
                      className="w-6 h-6 absolute top-6 right-6 max-md:right-2 rounded-full flex-center p-2 translate-x-1/2 -translate-y-1/2 cursor-pointer bg-white dark:bg-black"
                    >
                      X
                    </div>
                    <Image
                      width={500}
                      height={500}
                      alt="post"
                      src={el}
                      className="w-[98%] rounded-3xl object-contain"
                    />
                  </div>
                </Slide>
              );
            })}
          </Slider>
          {selectedImageUrls.length > 2 ? (
            <div className="absolute bottom-2">
              {selectedImageUrls.map((_, i) => {
                return <Dot key={i} slide={i} />;
              })}
            </div>
          ) : (
            <></>
          )}
        </CarouselProvider>
      ) : (
        <></>
      )}
    </div>
  );
};

export default NewPostImages;
