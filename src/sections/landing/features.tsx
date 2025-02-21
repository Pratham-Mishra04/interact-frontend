import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ShineBorder from '@/components/ui/shine-border';
import { useTheme } from 'next-themes';
import SparklesText from '@/components/ui/sparkles-text';
import AnimatedGridPattern from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';
import { FadeText } from '@/components/ui/fade-text';
import { features, extraFeatures } from '@/config/landing';
import { useWindowWidth } from '@react-hook/window-size';
import { MagicCard } from '@/components/ui/magic-card';

export const TitleBlock = ({
  titleUpper,
  titleMid,
  titleLower,
  titleSide,
  description,
  center = false,
  includeSparkles = false,
  theme = 'light',
  className,
}: {
  titleUpper: string;
  titleMid?: string;
  titleLower: string;
  titleSide?: string;
  description: string;
  center?: boolean;
  includeSparkles?: boolean;
  theme?: string;
  className?: string;
}) => {
  const width = useWindowWidth();
  const isMD = width < 760;

  return (
    <div className={cn('space-y-4', className)}>
      <div className={`relative ${(center || isMD) && 'flex-center flex-col gap-2'}`}>
        <FadeText
          key={`${theme}-${titleUpper}`}
          className="text-6xl max-md:text-5xl font-bold dark:text-white"
          direction="up"
          framerProps={{
            show: { transition: { delay: 0.2 } },
          }}
          text={titleUpper}
        />
        {titleMid && (
          <FadeText
            key={`${theme}-${titleMid}`}
            className={`w-fit font-cursive rotate-[-20deg] text-3xl absolute dark:text-white ${
              center || isMD ? '-translate-x-1/2' : '-left-5'
            }`}
            direction="up"
            framerProps={{
              show: { transition: { delay: 0.4 } },
            }}
            text={titleMid}
          />
        )}
        <div className={`md:inline-block ${titleMid && 'pt-5'}`}>
          {includeSparkles ? (
            <SparklesText className="md:text-8xl text-6xl text-sky-400 font-bold" text={titleLower} />
          ) : (
            <FadeText
              key={`${theme}-${titleLower}`}
              className="md:text-8xl text-6xl text-sky-400 font-bold"
              direction="up"
              framerProps={{
                show: { transition: { delay: 0.8 } },
              }}
              text={titleLower}
            />
          )}

          {titleSide && !isMD && (
            <FadeText
              key={`${theme}-${titleSide}`}
              className="w-full text-gray-600 dark:text-gray-200 italic text-xl max-md:text-center"
              direction="left"
              framerProps={{
                show: { transition: { delay: 0.9 } },
              }}
              text={titleSide}
            />
          )}
        </div>
      </div>
      <FadeText
        key={`${theme}-${description.substring(0, 10)}`}
        className={`text-gray-600 dark:text-gray-200 ${(center || isMD) && 'text-center'}`}
        direction="down"
        framerProps={{
          show: { transition: { delay: 1 } },
        }}
        text={description}
      />
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  const theme = useTheme();
  return (
    <ShineBorder className="p-5 shadow-sm" color={theme.theme === 'dark' ? 'white' : '#51D1F6'}>
      <h3 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 dark:from-neutral-300 to-neutral-700 dark:to-neutral-500 mb-3">
        {title}
      </h3>
      <p className="text-primary_black dark:text-white text-sm">{description}</p>
      <AnimatedGridPattern
        numSquares={10}
        maxOpacity={0.05}
        duration={3}
        repeatDelay={1}
        className={cn(
          '[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]',
          'inset-x-0 skew-y-12 z-20'
        )}
      />
    </ShineBorder>
  );
};

interface Quote {
  name: string;
  designation: string;
  quote: string;
  position?: string;
}

const Quote = ({ name, designation, quote, position = 'center' }: Quote) => {
  const variants = ['self-start', 'self-center', 'self-end'];
  return (
    <div
      className={`md:w-2/5 w-full self-${position} flex ${position == 'end' ? 'flex-row-reverse' : 'flex-row'} ${
        position == 'end' ? 'text-right' : position == 'start' ? 'text-left' : 'text-center'
      } justify-center gap-4`}
    >
      <div className="grow rounded-lg w-4 bg-[#00BDF2]"></div>
      <div className="">
        <p className="italic dark:text-white">&quot;{quote}&quot;</p>
        <p className="font-bold dark:text-white">
          {name} - {designation}
        </p>
      </div>
    </div>
  );
};

interface FeatureSectionProps {
  index: number;
  image: string;
  imageAlt: string;
  imageClass: string;
  titleUpper: string;
  titleMid: string;
  titleLower: string;
  titleSide: string;
  description: string;
  features: any[];
  quote: Quote;
  theme?: string;
}

const FeatureSection = ({
  index,
  image,
  imageAlt,
  imageClass,
  titleUpper,
  titleMid,
  titleLower,
  titleSide,
  description,
  features,
  quote,
  theme,
}: FeatureSectionProps) => {
  const isEven = index % 2 === 0;

  const width = useWindowWidth();
  const isMD = width < 768;

  return (
    <div className="w-full flex flex-col gap-14">
      <section
        className={`flex flex-col lg:flex-row items-center gap-16 max-md:gap-4 ${isEven ? '' : 'lg:flex-row-reverse'}`}
      >
        <div className="relative w-full lg:w-1/2 h-full">
          {isMD ? (
            <Image
              width={500}
              height={300}
              src={image}
              alt={imageAlt}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <Image
              width={500}
              height={300}
              src={image}
              alt={imageAlt}
              className={`w-full h-full object-contain rounded-lg ${imageClass}`}
            />
          )}
        </div>

        <div className="w-full lg:w-1/2 space-y-8">
          <TitleBlock
            titleUpper={titleUpper}
            titleMid={titleMid}
            titleLower={titleLower}
            titleSide={titleSide}
            description={description}
            theme={theme}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, featureIndex) => (
              <FeatureCard key={featureIndex} title={feature.title} description={feature.description} />
            ))}
          </div>
          {/* <LandingButton label="Know More" /> */}
        </div>
      </section>
      <Quote {...quote} />
    </div>
  );
};

const ExtraFeature = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => {
  return (
    <MagicCard gradientColor="#ffffff1a" className="lg:border py-8 relative group/feature dark:border-neutral-800">
      <div className="mb-4 relative px-6 text-neutral-600 dark:text-neutral-400">{icon}</div>
      <div className="text-lg font-bold mb-2 relative px-6">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-16 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-sky-400 transition-ease-300 origin-center" />
        <span className="group-hover/feature:translate-x-2 text-xl transition-ease-300 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative px-6">{description}</p>
    </MagicCard>
  );
};

const Features = () => {
  const { theme } = useTheme();
  const [sections, setSections] = useState(features[theme == 'dark' ? 'students' : 'organisations']);
  const [extraFeat, setExtraFeat] = useState(extraFeatures[theme == 'dark' ? 'students' : 'organisations']);

  useEffect(() => {
    setSections(features[theme == 'light' ? 'students' : 'organisations']);
    setExtraFeat(extraFeatures[theme == 'light' ? 'students' : 'organisations']);
  }, [theme]);

  return (
    <div id="features" className="w-full space-y-24 text-primary_black">
      {sections.map((section, index) => (
        <FeatureSection key={index} index={index} theme={theme} {...section} />
      ))}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 relative z-10 max-w-7xl mx-auto">
        {extraFeat.map(feature => (
          <ExtraFeature key={feature.title} {...feature} />
        ))}
      </div>
      {/* <div className="w-fit mx-auto">
        <LandingButton label="Explore All The Features" />
      </div> */}
    </div>
  );
};

export default Features;
