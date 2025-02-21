import React from 'react';
import { ReactSVG } from 'react-svg';
import { CaretRight } from '@phosphor-icons/react';
import Image from 'next/image';
import SparklesText from '@/components/ui/sparkles-text';
import FlickeringGrid from '@/components/ui/flickering-grid';

const comments = [
  {
    caption:
      'Lorem ipsum dolor sit amet consectetur. Dui dictum ut tellus cursus ac mauris sagittis cras. Ultricies est interdum arcu quis. Egestas sagittis fusce vitae massa donec tincidunt elementum.',
    user: {
      picURL: '/logo.png',
      name: 'Chomu',
      username: 'Zexgar29',
    },
  },
  {
    caption:
      'Lorem ipsum dolor sit amet consectetur. Dui dictum ut tellus cursus ac mauris sagittis cras. Ultricies est interdum arcu quis. Egestas sagittis fusce vitae massa donec tincidunt elementum.',
    user: {
      picURL: '/logo.png',
      name: 'Chomu',
      username: 'Zexgar29',
    },
  },
  {
    caption:
      'Lorem ipsum dolor sit amet consectetur. Dui dictum ut tellus cursus ac mauris sagittis cras. Ultricies est interdum arcu quis. Egestas sagittis fusce vitae massa donec tincidunt elementum.',
    user: {
      picURL: '/logo.png',
      name: 'Chomu',
      username: 'Zexgar29',
    },
  },
];

const ExploreCommunity: React.FC = () => {
  return (
    <div className="w-full flex-center flex-col gap-8">
      {/* <div className="flex flex-row items-center justify-center text-4xl md:text-5xl space-x-4 font-semibold">
          <SparklesText className="text-6xl font-semimbold" text="Explore Community" />
          <CaretRight weight="bold" size={24} />
        </div> */}

      <div className="w-4/5 rounded-lg space-y-8">
        <div className="w-full md:max-h-72 overflow-y-clip flex-center md:flex-row flex-col md:gap-8 px-12 max-md:p-4 border-2 rounded-xl">
          <div className="w-1/2 max-md:w-full space-y-12 md:space-y-16 md:py-18">
            <div className="relative pt-4 pb-1">
              <div className="text-4xl font-semibold mb-2 dark:text-white">Supporting the</div>
              <div className="w-fit font-cursive rotate-[-8deg] text-sky-400 text-6xl font-medium absolute">
                Future makers
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-200">
              Our goal is to facilitate building your resume through the projects, events and competitions hosted on the
              website.
            </p>
          </div>
          <div className="w-4/5 h-full relative">
            <div className="w-full h-full absolute bg-white opacity-80"></div>
            <Image
              width={500}
              height={300}
              src={'/landing/futuremakers.png'}
              alt="img"
              className="w-full h-full object-cover rounded-lg pt-12"
            />
          </div>

          {/* <SocialMediaGrid /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comments.map((comment, index) => (
            <div key={index} className="p-4 rounded-lg space-y-4 border-2">
              <p className="text-gray-600 dark:text-gray-200 italic text-sm">&quot;{comment.caption}&quot;</p>
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-300 text-xs">
                <div className="flex-center gap-1">
                  <Image
                    width={50}
                    height={50}
                    alt={'User Pic'}
                    src={comment.user.picURL}
                    className="w-4 h-4 rounded-full"
                  />
                  {comment.user.name}
                </div>
                <span>@{comment.user.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GridBox = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="w-1/3 mx-auto flex-center p-4 border-[1px] border-dashed hover:bg-slate-100 transition-ease-300">
      <Image width={75} height={75} src={src} alt={alt} />
    </div>
  );
};

const SocialMediaGrid: React.FC = () => {
  return (
    <div className="md:w-1/2 w-[70vw] flex-center flex-col mt-4">
      <GridBox src="/landing/logos/x.svg" alt="Twitter Logo" />
      <div className="w-full flex">
        <GridBox src="/landing/logos/discord.svg" alt="Discord Logo" />
        <GridBox src="/landing/logos/linkedin.svg" alt="Linkedin Logo" />
        <GridBox src="/landing/logos/instagram.svg" alt="Instagram Logo" />
      </div>
      <GridBox src="/landing/logos/reddit.svg" alt="Reddit Logo" />
    </div>
  );
};

export default ExploreCommunity;
