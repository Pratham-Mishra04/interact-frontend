import React from 'react';
import { ReactSVG } from 'react-svg';
import { useState } from 'react';
import Toaster from '@/utils/toaster';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '@/config/routes';
import { useDispatch } from 'react-redux';
import { setPasswordSetupStatus, setUser } from '@/slices/userSlice';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next/types';
import { setConfig } from '@/slices/configSlice';
import { setOnboarding, setUnreadNotifications } from '@/slices/feedSlice';
import { User } from '@/types';
import socketService from '@/config/ws';
import nookies from 'nookies';
import { SERVER_ERROR } from '@/config/errors';
import configuredAxios from '@/config/axios';
import generateRandomProfilePicture from '@/utils/generate_profile_picture';
import RegistrationButton from '@/components/buttons/registration_btn';

interface Props {
  token: string;
}

const SignUpCallback = ({ token }: Props) => {
  const [username, setUsername] = useState('');
  const [mutex, setMutex] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 4) {
      Toaster.error('Username too short');
      return;
    } else if (!/^[a-z]/.test(trimmedUsername)) {
      Toaster.error('Username must start with a letter');
      return;
    } else if (!/^([a-z][a-z0-9_]{4,})$/.test(trimmedUsername)) {
      Toaster.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const randomProfilePic = await generateRandomProfilePicture(1080, 1080);
    const formData = new FormData();
    formData.append('username', username.trim().toLowerCase());
    if (randomProfilePic) formData.append('profilePic', randomProfilePic);

    const toaster = Toaster.startLoad('Creating your account...');

    await configuredAxios
      .post(`${BACKEND_URL}/auth/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: 'Bearer ' + token },
        withCredentials: true,
      })
      .then(res => {
        if (res.status === 201) {
          Toaster.stopLoad(toaster, 'Account Created!', 1);
          const user: User = res.data.user;
          user.email = res.data.email;
          user.phoneNo = res.data.phoneNo || '';
          user.resume = res.data.resume || '';
          Cookies.set('token', res.data.token, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
          });
          Cookies.set('id', user.id, {
            expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
          });
          dispatch(setUser(user));
          dispatch(setConfig());
          dispatch(setUnreadNotifications(1));
          dispatch(setOnboarding(true));
          dispatch(setPasswordSetupStatus(res.data.isPasswordSetupComplete || false));
          socketService.connect(user.id);
          Cookies.set('verified', 'true');
          sessionStorage.setItem('onboarding-redirect', 'signup-callback');
          window.location.replace('/onboarding');
        }
        setMutex(false);
      })
      .catch(err => {
        if (err.response?.status == 403) {
          Toaster.stopLoad(toaster, 'Connection Timeout, Login again"', 0);
          window.location.replace('/signup');
        } else if (err.response?.data?.message) {
          Toaster.stopLoad(toaster, err.response.data.message, 0);
        } else {
          Toaster.stopLoad(toaster, SERVER_ERROR, 0);
        }
        setMutex(false);
      });
  };

  return (
    <>
      <Head>
        <title>SignUp | Interact</title>
      </Head>
      <div className="h-screen flex">
        <div className="w-[45%] max-lg:w-full h-full font-primary py-8 px-8 flex flex-col justify-between items-center">
          <div className="w-full flex justify-start">
            <ReactSVG src="/onboarding_logo.svg" />
          </div>
          <form onSubmit={handleSubmit} className="w-3/5 max-md:w-full flex flex-col items-center gap-6">
            <div className="flex flex-col gap-2 text-center">
              <div className="text-2xl font-semibold">One Last Step</div>
              <div className="text-gray-400">Enter your username</div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="font-medium">Username</div>
              <input
                maxLength={16}
                value={username}
                onChange={el => setUsername(el.target.value.toLowerCase())}
                type="text"
                className="w-full bg-white focus:outline-none border-2 p-2 rounded-xl text-gray-400"
              />
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
              <RegistrationButton />
            </div>
          </form>
          <div className="w-3/4 max-lg:w-full text-[12px] text-center text-gray-400">
            By clicking “Continue” above, you acknowledge that you have read and understood, and agree to
            Interact&apos;s <span className="underline underline-offset-2 font-medium">Term & Conditions</span> and{' '}
            <span className="underline underline-offset-2 font-medium">Privacy Policy.</span>
          </div>
        </div>
        <div className="w-[55%] max-lg:hidden h-full bg-onboarding bg-cover"></div>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const access_token = nookies.get(context).token;
  if (access_token && process.env.NODE_ENV != 'development') {
    return {
      redirect: {
        permanent: true,
        destination: '/home',
      },
      props: { access_token },
    };
  }

  const { query } = context;
  const token = query.token;
  if (!token || token == '')
    return {
      redirect: {
        permanent: true,
        destination: '/signup',
      },
      props: { token },
    };
  return {
    props: { token },
  };
}
export default SignUpCallback;
