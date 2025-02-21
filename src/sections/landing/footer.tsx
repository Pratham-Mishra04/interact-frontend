import TooltipIcon from '@/components/common/tooltip_icon';
import FlickeringGrid from '@/components/ui/flickering-grid';
import { InstagramLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { MailIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { ReactSVG } from 'react-svg';

const Footer = () => {
  const links = [
    {
      label: '@interact_now',
      href: 'https://www.linkedin.com/company/interact-now/',
      Icon: <LinkedInLogoIcon className="w-6 h-6" />,
    },
    {
      label: '@interact_now',
      href: 'https://x.com/interact_now',
      Icon: <TwitterLogoIcon className="w-6 h-6" />,
    },
    {
      label: '@interact.now',
      href: 'https://www.instagram.com/interact.now',
      Icon: <InstagramLogoIcon className="w-6 h-6" />,
    },
    {
      label: 'socials@interactnow.in',
      href: 'mailto:socials@interactnow.in',
      Icon: <MailIcon className="w-6 h-6" />,
    },
  ];
  return (
    <div id="footer" className="w-full">
      <div className="w-full relative h-[250px] max-md:h-[125px] flex-center bg-background overflow-hidden">
        <ReactSVG src="/onboarding_logo.svg" className="md:scale-[2.0] z-10 dark:hidden" />
        <ReactSVG src="/onboarding_logo_dark.svg" className="md:scale-[2.0] z-10 hidden dark:block" />
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#478EE1"
          maxOpacity={0.5}
          flickerChance={0.1}
          height={800}
          width={1400}
        />
      </div>
      <div className="w-full flex justify-between gap-6 pt-4 pb-12 max-md:pb-8">
        <div className="text-gray-600 dark:text-gray-300 italic">Connect, Create & Collaborate</div>
        <div className="flex gap-4">
          {links.map(({ label, href, Icon }) => (
            <TooltipIcon
              key={label}
              label={label}
              icon={
                <Link href={href} target="_blank">
                  {Icon}
                </Link>
              }
              excludeHoverEffect
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
