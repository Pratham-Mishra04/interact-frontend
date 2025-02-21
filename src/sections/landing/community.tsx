import React from 'react';
import { TitleBlock } from './features';
import { ReactSVG } from 'react-svg';
import { LANDING_RESOURCE_URL } from '@/config/routes';

const Community = () => {
  return (
    <div className="w-full flex-center flex-col gap-6 text-black">
      <div className="w-1/2 mx-auto max-md:w-full flex-center flex-col gap-4 dark:hidden">
        <TitleBlock
          titleUpper="Explore"
          titleMid="The"
          titleLower="Community"
          description="Check out the latest projects, and apply to their openings to level up your skills for
                        your next job. Join events and communities to expand your knowledge and help
                        others!"
          center
          includeSparkles
        />
      </div>
      <div className="w-full relative flex items-center justify-center scale-[1] dark:hidden">
        <video
          className="w-4/5 max-md:w-full h-auto rotate-x-landing object-contain shadow-xl rounded-xl max-md:rounded-lg"
          width="600"
          autoPlay
          loop
          muted
          playsInline
          placeholder="Community Video"
        >
          <source src={`${LANDING_RESOURCE_URL}/community.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="w-1/2 mx-auto max-md:w-full flex-center flex-col gap-16 mb-12">
        <TitleBlock
          titleUpper="Github & Figma "
          titleLower="Integration"
          description="Get real-time insights into Project Members progress with seamless database integration from figma and github all in one place to keep track and manage everything all at once."
          center
          className="hidden dark:block"
        />
        <ReactSVG
          src="/landing/Cards integration.svg"
          className="dark:flex items-center justify-center hidden bottom-0 h-[5vh] md:h-[20vh] lg:scale-[0.75] md:scale-[0.6] scale-[0.26] sm:mt-24 mt-12"
        />
      </div>
      {/* <LandingButton className="mt-8" label="Know More" /> */}
    </div>
  );
};

export default Community;
