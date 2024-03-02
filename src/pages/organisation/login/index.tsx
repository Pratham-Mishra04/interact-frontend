import React, { useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import Eye from '@phosphor-icons/react/dist/icons/Eye';
import EyeClosed from '@phosphor-icons/react/dist/icons/EyeClosed';
import { useState } from 'react';
import Toaster from '@/utils/toaster';
import Cookies from 'js-cookie';
import { BACKEND_URL, ORG_URL } from '@/config/routes';
import { useDispatch } from 'react-redux';
import { setUser } from '@/slices/userSlice';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next/types';
import nookies from 'nookies';
import configuredAxios from '@/config/axios';
import { resetConfig } from '@/slices/configSlice';
import { Organization, User } from '@/types';
import socketService from '@/config/ws';
import { SERVER_ERROR } from '@/config/errors';
import useUserStateFetcher from '@/hooks/user_fetcher';
import WidthCheck from '@/utils/wrappers/widthCheck';
import { setCurrentOrg } from '@/slices/orgSlice';
import Link from 'next/link';
import { Users } from '@phosphor-icons/react';
import RegistrationButton from '@/components/buttons/registration_btn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mutex, setMutex] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const userStateFetcher = useUserStateFetcher();

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (mutex) return;
    setMutex(true);
    const formData = {
      email,
      password,
    };
    const toaster = Toaster.startLoad('Logging In');

    await configuredAxios
      .post(`${ORG_URL}/login`, formData, {
        withCredentials: true,
      })
      .then(res => {
        if (res.status === 200) {
          Toaster.stopLoad(toaster, 'Logged In!', 1);
          const user: User = res.data.user;
          const organization: Organization = res.data.organization;
          user.email = res.data.email;
          user.phoneNo = res.data.phoneNo || '';
          Cookies.set('token', res.data.token, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
          });
          Cookies.set('id', user.id, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
          });
          dispatch(setUser(user));
          dispatch(resetConfig());
          dispatch(setCurrentOrg(organization));
          socketService.connect(user.id);
          userStateFetcher();
          if (user.isVerified) {
            Cookies.set('verified', 'true');
            window.location.replace('/organisation/home');
          } else window.location.assign('/verification');
        }
        setMutex(false);
      })
      .catch(err => {
        if (err.response?.data?.message) Toaster.stopLoad(toaster, err.response.data.message, 0);
        else {
          Toaster.stopLoad(toaster, SERVER_ERROR, 0);
        }
        setMutex(false);
      });
  };

  const handleGoogleLogin = () => {
    window.location.assign(`${BACKEND_URL}/auth/google`);
  };

  useEffect(() => {
    const msg = new URLSearchParams(window.location.search).get('msg');

    if (msg && msg == 'nouser') Toaster.error('No account with this email id exists.');
  }, [window.location.search]);

  return (
    <>
      <Head>
        <title>Login | Interact</title>
        <meta
          name="description"
          content="Log into Interact! Interact is a groundbreaking web platform designed for college-going students, freelancers, professionals, and creatives."
        />
      </Head>
      <div className="h-full flex">
        <div className="w-[55%] max-lg:hidden min-h-screen bg-onboarding bg-cover"></div>
        <div className="w-[45%] max-lg:w-full h-full min-h-screen font-primary py-8 px-8 flex flex-col justify-between items-center">
          <div className="w-full flex justify-between items-center">
            <ReactSVG src="/onboarding_logo.svg" />
            <Link
              href={`/login`}
              className="w-12 hover:w-24 h-12 group overflow-clip relative rounded-full border-[1px] border-primary_black hover:shadow-xl transition-ease-300"
            >
              <div className="w-full text-center absolute top-32 group-hover:top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 font-medium transition-ease-300">
                User?
              </div>
              <Users
                className="absolute top-1/2 group-hover:-top-8 right-1/2 translate-x-1/2 -translate-y-1/2 transition-ease-300"
                size={24}
              />
            </Link>
          </div>
          <form onSubmit={handleSubmit} className="w-3/5 max-md:w-full flex flex-col items-center gap-6">
            <div className="flex flex-col gap-2 text-center">
              <div className="text-2xl font-semibold">Let&apos;s Get Back In</div>
              <div className="text-gray-400">Time to pick up where you left ✌️</div>
            </div>
            <div
              onClick={handleGoogleLogin}
              className="w-full flex gap-4 justify-center cursor-pointer shadow-md  border-[#D4D9E1] hover:bg-[#F2F2F2] active:bg-[#EDEDED] border-2 rounded-xl px-4 py-2"
            >
              <div>
                <ReactSVG src="/assets/google.svg" />
              </div>
              <div className="font-medium">Log in with Google</div>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="w-[25%] h-[1px] bg-gray-200"></div>
              <div className="w-[50%] text-center text-sm max-lg:text-xs text-gray-400">or continue with email</div>
              <div className="w-[25%] h-[1px] bg-gray-200"></div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="font-medium">Email</div>
                <input
                  name="email"
                  value={email}
                  onChange={el => setEmail(el.target.value)}
                  type="email"
                  className="w-full bg-white focus:outline-none border-2 p-2 rounded-xl text-gray-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-medium">Password</div>
                <div className="w-full relative">
                  <input
                    name="password"
                    autoComplete="current-password"
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
            </div>
            <div className="w-full p-1 flex flex-col gap-2 items-center">
              <RegistrationButton />
              <div
                onClick={() => window.location.assign('/forgot_password')}
                className="text-gray-400 font-medium hover:underline hover:underline-offset-2 text-sm cursor-pointer"
              >
                Forgot Password?
              </div>
            </div>
          </form>
          <div className="w-3/4 max-lg:w-full text-[12px] text-center text-gray-400">
            By clicking “Continue” above, you acknowledge that you have read and understood, and agree to
            Interact&apos;s{' '}
            <span className="underline underline-offset-2 font-medium cursor-pointer">Term & Conditions</span> and{' '}
            <span className="underline underline-offset-2 font-medium cursor-pointer">Privacy Policy.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const token = nookies.get(context).token;
  if (token && process.env.NODE_ENV != 'development') {
    return {
      redirect: {
        permanent: true,
        destination: '/home',
      },
      props: { token },
    };
  }
  return {
    props: {},
  };
};

export default Login;
