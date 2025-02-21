import { SERVER_ERROR } from '@/config/errors';
import { USER_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import { ArrowRight, SignOut, X } from '@phosphor-icons/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignUp = ({ setShow }: Props) => {
  useEffect(() => {
    if ((document.documentElement.style.overflowY = 'auto')) {
      document.documentElement.style.overflowY = 'hidden';
      document.documentElement.style.height = '100vh';

      return () => {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
      };
    }
  }, []);

  return (
    <>
      <div className="fixed top-48 w-1/3 max-md:w-5/6 h-fit backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-0 rounded-lg p-8 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn dark:border-dark_primary_btn right-1/2 shadow-2xl translate-x-1/2 animate-fade_third z-50 max-md:z-[150]">
        <div className="w-full flex justify-end">
          <X className="cursor-pointer" onClick={() => setShow(false)} size={32} />
        </div>
        <div className="w-full flex flex-col gap-8">
          <div className="font-semibold text-6xl max-md:text-5xl text-gray-800 dark:text-white capitalize">
            Sign Up!
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="font-medium max-md:text-sm">
                Complete your Sign Up Process and explore Interact to it&apos;s full extent! 🚀
              </div>
              <Link href={'/signup'} className="w-full flex justify-end">
                <ArrowRight weight="bold" size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-30 max-md:z-[100]"
      ></div>
    </>
  );
};

export default SignUp;
