import React from 'react';
import Image from 'next/image';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { PROJECT_PIC_URL } from '@/config/routes';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Project } from '@/types';

const ProjectCardCarousel = ({ project, width = 'full' }: { project: Project; width?: string }) => {
  const variants = ['w-1/5', 'w-full'];
  return project.images && project.images.length > 1 ? (
    <Carousel
      className={`w-${width}`}
      opts={{
        align: 'center',
        loop: false,
        dragFree: false,
        duration: 2,
        active: true,
      }}
    >
      <CarouselContent>
        {project.images.map((image, index) => {
          let imageHash = 'no-hash';
          if (project.hashes && index < project.hashes.length) imageHash = project.hashes[index];

          return (
            <CarouselItem key={image}>
              <Image
                crossOrigin="anonymous"
                width={430}
                height={270}
                className="w-full rounded-lg"
                alt={'Project Pic'}
                src={`${PROJECT_PIC_URL}/${image}`}
                placeholder="blur"
                blurDataURL={imageHash}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  ) : (
    <Image
      crossOrigin="anonymous"
      className={`w-${width} rounded-lg`}
      src={getProjectPicURL(project)}
      alt="Project Cover"
      width={430}
      height={270}
      placeholder="blur"
      blurDataURL={getProjectPicHash(project)}
    />
  );
};

export default ProjectCardCarousel;
