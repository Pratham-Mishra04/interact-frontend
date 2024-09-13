import React from 'react';
import { ReactSVG } from 'react-svg';
import { ArrowRight, Users, ChalkboardTeacher, MegaphoneSimple } from '@phosphor-icons/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';

const Index = () => {
  const user = useSelector(userSelector);
  return (
    <div className="bg-animated-gradient min-h-screen flex flex-col items-center relative overflow-hidden">
      <div className="w-screen h-screen fixed bg-animated-container"></div>
      {/* <div className="absolute inset-0 pointer-events-none noise z-50"></div> */}
      <div className="w-full backdrop-blur-sm border-b-white border-b-[1px] flex justify-between items-center p-4">
        <ReactSVG src="/onboarding_logo.svg" />
        <div className="flex-center gap-6 max-md:gap-4">
          <Link href={'/home'} className="hover-underline-animation after:bg-gray-700 max-md:text-xs">
            Home
          </Link>
          <Link href={'/explore'} className="hover-underline-animation after:bg-gray-700 max-md:text-xs">
            Explore
          </Link>
          {user.id && (
            <Link href={'/workspace'} className="hover-underline-animation after:bg-gray-700 max-md:text-xs">
              Workspace
            </Link>
          )}
          {!user.id && (
            <Link
              href={'/signup'}
              className="w-fit max-md:text-xs font-medium hover:bg-white hover:bg-opacity-40 glassMorphism rounded-full shadow-md px-4 max-md:px-2 py-2 group relative transition-ease-300"
            >
              Register Now!
            </Link>
          )}
        </div>
      </div>
      <div className="flex-center flex-col gap-4 mt-[10%] mb-[2%] max-md:my-[5%] max-md:px-4">
        <div className="text-6xl font-semibold font-title">
          <b>interact</b>, cause that&apos;s how you grow.
        </div>
        <div className="text-2xl font-medium font-primary">your space to connect, create, and grow together.</div>
        <Link
          href={user.id ? '/home' : '/explore'}
          className="w-fit text-lg group relative hover:pr-1 transition-ease-300 mt-8 max-md:my-8"
        >
          <div className="hover-underline-animation after:bg-gray-700">
            {user.id ? 'Back to your Feed' : 'Get Started'}
          </div>
          <ArrowRight className="absolute -right-2 opacity-0 group-hover:-right-4 top-1/2 -translate-y-1/2 group-hover:opacity-100 transition-ease-300" />
        </Link>
      </div>
      <FeatureCards />
    </div>
  );
};

const features = [
  {
    title: 'Student Collaboration',
    description:
      'Connect with fellow students to collaborate on projects that inspire and innovate. Teamwork on Interact fuels your academic journey.',
    icon: <Users size={48} weight="bold" className="text-[#4bbbf8]" />,
  },
  {
    title: 'Teacher Guidance',
    description:
      'Partner with teachers to explore research topics and publish papers that make a difference. Get the mentorship you need to bring your ideas to life.',
    icon: <ChalkboardTeacher size={48} weight="bold" className="text-[#4bbbf8]" />,
  },
  {
    title: 'Club Management',
    description:
      'Take control of your club’s activities with tools that make management and promotions easy. Interact empowers you to elevate your club and make an impact.',
    icon: <MegaphoneSimple size={48} weight="bold" className="text-[#4bbbf8]" />,
  },
];

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: Props) => (
  <div className="w-full md:w-80 h-60 backdrop-blur-sm bg-white bg-opacity-20 shadow-lg rounded-lg overflow-hidden p-6 md:hover:scale-105 transition-transform duration-300">
    <div className="flex items-center justify-center mb-4 transform transition-transform duration-300">{icon}</div>
    <h2 className="text-xl font-bold font-title mb-2 text-center text-gray-800">{title}</h2>
    <div className="text-gray-600 text-center text-sm">{description}</div>
  </div>
);

const FeatureCards = () => (
  <div className="flex flex-col md:flex-row justify-around items-center gap-6 md:mt-10 max-md:px-4 pb-6">
    {features.map((feature, index) => (
      <FeatureCard key={index} title={feature.title} description={feature.description} icon={feature.icon} />
    ))}
  </div>
);

export default Index;
