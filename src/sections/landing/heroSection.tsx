import React, { useState, useEffect } from 'react';
import { FloatingImages } from './floatingimages';
import { useWindowWidth } from '@react-hook/window-size';
import Link from 'next/link';
import { BackgroundLines } from '@/components/ui/background-lines';
import { useTheme } from 'next-themes';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { ArrowRight } from 'lucide-react';

const TextAnimation = () => {
  const texts = ['Organizations', 'Hackathons', 'Projects', 'Communities'];
  const [index, setIndex] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const width = useWindowWidth();
  const isMD = width < 768;

  useEffect(() => {
    const animate = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (index === texts.length - 1) {
        setIsResetting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIndex(0);
        requestAnimationFrame(() => setIsResetting(false));
      } else {
        setIndex(prev => prev + 1);
      }
    };

    const timer = setTimeout(animate, 1000);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="h-32 max-md:h-16 overflow-hidden text-primary_black dark:text-white">
      <div
        className={`transform transition-ease-500 ${isResetting ? 'transition-none' : ''}`}
        style={{
          transform: `translateY(-${index * (isMD ? 64 : 128)}px)`,
        }}
      >
        {texts.map((text, i) => (
          <div
            key={i}
            className="h-32 max-md:h-16 pb-8 max-md:pb-2 flex items-center justify-center lg:text-9xl text-5xl font-bold"
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeroSection = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  useEffect(() => {
    const initialTheme = theme;

    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', 'light');
    setTheme('light');

    return () => {
      if (initialTheme) setTheme(initialTheme);
    };
  }, []);

  const user = useSelector(userSelector);

  return (
    <BackgroundLines className="w-screen h-base bg-background text-center relative flex-center flex-col gap-12 max-md:gap-4 z-10 transition-ease-300">
      {/* <FloatingImages /> */}
      <div className="flex flex-col gap-4 max-md:gap-0">
        <div className="mx-auto relative">
          <div className="w-fit md:text-7xl text-primary_black dark:text-white text-5xl font-semibold">Everything</div>
          <div className="font-cursive text-primary_black dark:text-white text-4xl max-md:text-xl absolute -bottom-4 -left-24 max-md:-left-10 rotate-[-20deg]">
            About
          </div>
        </div>
        <TextAnimation />
      </div>
      <div className="space-y-4 max-md:space-y-12 max-md:px-12 z-50">
        <p className="text-xl max-md:text-base text-gray-700 dark:text-gray-300 max-w-sm mx-auto">
          We&apos;re a dynamic web platform for college students to develop their portfolios through projects, events
          and communities.{' '}
        </p>

        <div className="space-y-4">
          <Link href={user.id ? (user.isOrganization ? '/organisation/home' : '/home') : '/signup'}>
            <button className="w-fit bg-sky-400 hover:bg-sky-600 group relative text-white px-6 py-2 rounded-full text-lg transition-ease-300">
              <div className="w-fit flex-center gap-1 relative">
                <div className="group-hover:pr-4 transition-ease-300">
                  {user.id ? 'Back to Feed' : 'Sign up for Free'}
                </div>
                <ArrowRight className="absolute -right-0 opacity-0 group-hover:-right-2 group-hover:opacity-100 transition-ease-300" />
              </div>
            </button>
          </Link>
          {!user.id && (
            <div className="flex justify-center items-center space-x-1 text-sm">
              <span className="text-gray-600">Want to look around?</span>
              <Link href="/projects" className="text-sky-400 font-medium hover-underline-animation after:bg-sky-400">
                Check It Out!
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="w-fit flex justify-center max-md:flex-col items-center gap-4 wiggle pt-12 text-primary_black">
        <div
          className={`transition-all duration-300 ${
            theme == 'dark' ? 'text-lg font-normal text-gray-500' : 'text-xl font-medium text-black'
          }`}
        >
          For Students
        </div>
        <label className="switch">
          <input type="checkbox" onChange={toggleTheme} className="input__check" />
          <span className="slider"></span>
        </label>
        <div
          className={`text-lg transition-all duration-300 ${
            theme == 'dark' ? 'text-xl font-medium text-white' : 'text-lg font-normal text-gray-500'
          }`}
        >
          For Organisations
        </div>
      </div>
    </BackgroundLines>
  );
};

export default HeroSection;
