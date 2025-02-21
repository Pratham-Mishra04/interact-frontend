import { cn } from '@/lib/utils';
import { FacebookLogo } from '@phosphor-icons/react';
import { InstagramLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import Image from 'next/image';

const TestimonialCard = ({
  img,
  name,
  username,
  body,
  social = 'instagram',
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  social?: 'instagram' | 'twitter' | 'facebook' | 'linkedin';
}) => {
  return (
    <figure
      className={cn(
        'relative h-fit w-96 max-md:w-full cursor-pointer overflow-hidden rounded-xl border p-4 transition-ease-300',
        // light styles
        'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        // dark styles
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Image className="rounded-full" width="32" height="32" alt="" src={img} />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">{name}</figcaption>
            <p className="text-xs font-medium text-left dark:text-white/40">{username}</p>
          </div>
        </div>
        {social == 'instagram' ? (
          <InstagramLogoIcon className="opacity-60" />
        ) : social == 'twitter' ? (
          <TwitterLogoIcon className="opacity-60" />
        ) : social == 'facebook' ? (
          <FacebookLogo className="opacity-60" />
        ) : social == 'linkedin' ? (
          <LinkedInLogoIcon className="opacity-60" />
        ) : (
          <></>
        )}
      </div>

      <blockquote className="mt-2 text-sm text-left">{body}</blockquote>
    </figure>
  );
};

export default TestimonialCard;
