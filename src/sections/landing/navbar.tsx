import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
import LandingButton from '@/components/buttons/landing_btn';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';

const Navbar: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100;
      setIsSticky(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const rawHref = e.currentTarget.getAttribute('href') || '';
    const targetId = rawHref.startsWith('#') ? rawHref : `#${rawHref.split('#')[1] || ''}`;

    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NavbarLogo = () => {
    return (
      <div className="flex items-center md:max-h-[10vh]">
        <ReactSVG src="/onboarding_logo.svg" className="max-h-[6vh] dark:hidden" />
        <ReactSVG src="/onboarding_logo_dark.svg" className="max-h-[6vh] hidden dark:block" />
      </div>
    );
  };

  const NavbarMenu = () => {
    const user = useSelector(userSelector);
    return (
      <div className="flex-center gap-8 max-md:gap-4">
        <Link href={'/projects'} className="hover-underline-animation after:bg-gray-700 max-md:text-xs">
          Explore
        </Link>
        <Link
          href={'#features'}
          onClick={handleClick}
          className="hover-underline-animation after:bg-gray-700 max-md:text-xs"
        >
          Features
        </Link>
        <Link
          href={'#footer'}
          onClick={handleClick}
          className="hover-underline-animation after:bg-gray-700 max-md:text-xs"
        >
          Contact
        </Link>
        {!user.id && (
          <Link href="/signup">
            <LandingButton label="Sign up" />
          </Link>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Static Navbar */}
      <div
        className={`w-[90vw] mx-auto max-md:w-screen p-4 h-16 flex items-center justify-between z-40 text-primary_black dark:text-white transition-all duration-500 ${
          isSticky ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
      >
        <NavbarLogo />
        <NavbarMenu />
      </div>

      {/* Sticky Navbar */}
      <div
        className={`w-full fixed top-0 left-0 bg-white dark:bg-dark_primary_comp shadow-md z-50 p-4 h-16 flex items-center justify-between text-primary_black dark:text-white transition-all duration-500 ${
          isSticky ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <NavbarLogo />
        <NavbarMenu />
      </div>
    </div>
  );
};

export default Navbar;
