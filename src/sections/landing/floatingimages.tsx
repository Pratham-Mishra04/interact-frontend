import Image from 'next/image';
import React from 'react';

export const FloatingImages = () => {
  return (
    <div className="w-[100vw] -z-10">
      <div className="absolute opacity-90 top-0 lg:left-32 left-16 max-md:left-0">
        <Image
          width={400}
          height={1000}
          src="/landing/floating/image1.svg"
          alt="Left UI"
          className="scale-[1.05] -translate-x-1/2"
        />
      </div>
      <div className="absolute lg:right-52 right-48 max-md:right-0 lg:top-24 top-0 w-96 opacity-90 md:overflow-visible overflow-hidden">
        <Image
          width={300}
          height={400}
          src="/landing/floating/image2.svg"
          alt="Right UI"
          className="scale-[1] translate-x-full md:scale-[1.3]"
        />
      </div>
      <div className="absolute bottom-12 lg:left-64 left-24 w-48 opacity-90">
        <Image
          width={1000}
          height={1000}
          src="/landing/floating/image3.svg"
          alt="Bottom Left UI"
          className="scale-[1.05] -translate-x-1/2"
        />
      </div>
      <div className="absolute bottom-12 w-36 lg:right-32 right-0 opacity-90 overflow-none">
        <Image
          width={1000}
          height={1000}
          src="/landing/floating/image4.svg"
          alt="Bottom Right UI"
          className="md:scale-[1.5]"
        />
      </div>
    </div>
  );
};
