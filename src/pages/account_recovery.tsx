import React from 'react';
import { useState } from 'react';
import Toaster from '@/utils/toaster';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next/types';
import nookies from 'nookies';
import postHandler from '@/handlers/post_handler';
import { ReactSVG } from 'react-svg';
import { ArrowRight, Eye, EyeClosed, Info } from '@phosphor-icons/react';
import isStrongPassword from 'validator/lib/isStrongPassword';
import { SERVER_ERROR } from '@/config/errors';

interface Props {
  userID: string;
  token: string;
}

const AccountRecovery = ({ userID, token }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mutex, setMutex] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (
      !isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      Toaster.error('Enter a strong Password');
      return;
    }

    if (password != confirmPassword) {
      Toaster.error('Passwords do not match!');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating your Password...');

    const formData = {
      userID,
      token,
      password,
    };

    const URL = `/recovery/verify`;

    const res = await postHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Password Updated!', 1);
      window.location.replace('/login');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      <Head>
        <title>Forgot Password | Interact</title>
      </Head>
      <div className="h-screen flex">
        <div className="w-[45%] max-lg:w-full h-full font-primary py-8 px-8 flex flex-col justify-between items-center">
          <div className="w-full flex justify-start">
            <ReactSVG src="/onboarding_logo.svg" />
          </div>
          <div className="w-full flex flex-col gap-6 font-primary px-24 mb-12 max-md:px-8 py-16 max-lg:py-8">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-semibold text-center">Reset Password</div>
              <div className="text-center">try not to forget it this time :)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-medium">
                <div>Password</div>
                <Info className="cursor-pointer" size={18} weight="light" />
              </div>
              <div className="w-full relative">
                <input
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={el => setPassword(el.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10"
                />
                {showPassword ? (
                  <Eye
                    onClick={() => setShowPassword(false)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    size={20}
                    weight="regular"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setShowPassword(true)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    size={20}
                    weight="regular"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Confirm Password</div>
              <div className="w-full relative">
                <input
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={el => setConfirmPassword(el.target.value)}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full bg-white p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10"
                />
                {showConfirmPassword ? (
                  <Eye
                    onClick={() => setShowConfirmPassword(false)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    size={20}
                    weight="regular"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setShowConfirmPassword(true)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    size={20}
                    weight="regular"
                  />
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full relative p-2 border-2 after:absolute after:-top-[3px] after:-left-[3px] after:-right-[3px] after:-bottom-[3.5px] after:-z-10 after:bg-[#395887] after:rounded-xl flex items-center cursor-pointer justify-center gap-2 bg-[#3D6DB3] hover:bg-[#345C98] active:bg-[#2D5185] border-[#d1d1d1a7] text-white py-2 rounded-xl font-semibold"
            >
              <div> Continue</div>
              <ArrowRight size={20} weight="regular" />
            </button>
          </div>

          <div className="w-3/4 max-lg:w-full text-[12px] text-center text-gray-400">
            By clicking “Continue” above, you acknowledge that you have read and understood, and agree to
            Interact&apos;s{' '}
            <span className="underline underline-offset-2 font-medium cursor-pointer">Term & Conditions</span> and{' '}
            <span className="underline underline-offset-2 font-medium cursor-pointer">Privacy Policy.</span>
          </div>
        </div>

        <div className="w-[55%] max-lg:hidden h-full bg-onboarding bg-cover"></div>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const userID = query.uid;
  const urlToken = query.token;

  const token = nookies.get(context).token;

  if (token && process.env.NODE_ENV != 'development') {
    return {
      redirect: {
        permanent: false,
        destination: '/home',
      },
      props: { token },
    };
  }
  return {
    props: { userID, token: urlToken },
  };
}

export default AccountRecovery;
