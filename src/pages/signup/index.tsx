import React, { useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import ArrowRight from '@phosphor-icons/react/dist/icons/ArrowRight';
import Eye from '@phosphor-icons/react/dist/icons/Eye';
import EyeClosed from '@phosphor-icons/react/dist/icons/EyeClosed';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Toaster from '@/utils/toaster';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '@/config/routes';
import { useDispatch } from 'react-redux';
import { setUser } from '@/slices/userSlice';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next/types';
import nookies from 'nookies';
import configuredAxios from '@/config/axios';
import { setConfig } from '@/slices/configSlice';
import { setOnboarding, setUnreadNotifications } from '@/slices/feedSlice';
import { User } from '@/types';
import socketService from '@/config/ws';
import isEmail from 'validator/lib/isEmail';
import isStrongPassword from 'validator/lib/isStrongPassword';
import { SERVER_ERROR } from '@/config/errors';
import Info from '@phosphor-icons/react/dist/icons/Info';
import generateRandomProfilePicture from '@/utils/generate_profile_picture';
import StrongPassInfo from '@/components/common/strong_pass_info';
import WidthCheck from '@/utils/wrappers/widthCheck';

const SignUp = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [earlyAccessToken, setEarlyAccessToken] = useState('');
  const [mutex, setMutex] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [clickedOnStrongPassInfo, setClickedOnStrongPassInfo] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (name.trim().length == 0 || !/^[a-z][a-z\s]*/.test(name.trim().toLowerCase())) {
      Toaster.error('Enter a Valid Name');
      return;
    }
    if (!isEmail(email)) {
      Toaster.error('Enter a Valid Email');
      return;
    }

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
      setClickedOnStrongPassInfo(true);
      return;
    }

    if (password != confirmPassword) {
      Toaster.error('Passwords do not match');
      return;
    }

    // if (earlyAccessToken == '') {
    //   Toaster.error('Enter your Early Access Token');
    //   return;
    // }

    if (mutex) return;
    setMutex(true);

    const randomProfilePic = await generateRandomProfilePicture(1080, 1080);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', name);
    formData.append('username', username.trim().toLowerCase());
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    if (randomProfilePic) formData.append('profilePic', randomProfilePic);

    const toaster = Toaster.startLoad('Creating your Account...');

    await configuredAxios
      .post(`${BACKEND_URL}/signup`, formData, {
        withCredentials: true,
      })
      .then(res => {
        if (res.status === 201) {
          Toaster.stopLoad(toaster, 'Account created!', 1);
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
          dispatch(setUser({ ...user, isVerified: false }));

          //Early Access - dispatch(setUser({ ...user, isVerified: true }));

          dispatch(setConfig());
          dispatch(setUnreadNotifications(1)); //welcome notification
          dispatch(setOnboarding(true));
          socketService.connect(user.id);

          sessionStorage.setItem('verification-redirect', 'signup-callback');
          router.push('/verification');

          //Early Access -  sessionStorage.setItem('onboarding-redirect', 'signup');
          //Early Access -  router.replace('/onboarding');
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

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    const email = new URLSearchParams(window.location.search).get('email');

    // if (token && token != '') setEarlyAccessToken(token);
    if (email && email != '') setEmail(email);
  }, [window.location.search]);

  const handleGoogleLogin = () => {
    router.push(`${BACKEND_URL}/auth/google`);
  };
  return (
    <>
      <Head>
        <title>Sign up | Interact</title>
        <meta
          name="description"
          content="Sign up for Interact! Interact is a groundbreaking web platform designed for college-going students, freelancers, professionals, and creatives."
        />
      </Head>
      <div className="h-full flex">
        {clickedOnStrongPassInfo ? (
          <StrongPassInfo password={password} confirmPassword={confirmPassword} setShow={setClickedOnStrongPassInfo} />
        ) : (
          <></>
        )}
        <div className="w-[45%] max-lg:w-full h-full min-h-screen font-primary gap-12 py-8 px-8 flex flex-col justify-between items-center">
          <div className="w-full flex justify-start items-center">
            <ReactSVG src="/onboarding_logo.svg" />
          </div>
          <form onSubmit={handleSubmit} className="w-3/5 max-md:w-full flex flex-col items-center gap-6">
            <div className="flex flex-col gap-2 text-center">
              <div className="text-2xl font-semibold">Let&apos;s Get Started</div>
              <div className="text-gray-400">Start setting up your account ✌️</div>
            </div>
            <div
              onClick={handleGoogleLogin}
              className="w-full flex gap-4 justify-center cursor-pointer shadow-md  border-[#D4D9E1] hover:bg-[#F2F2F2] active:bg-[#EDEDED] border-2 rounded-xl px-4 py-2"
            >
              <div>
                <ReactSVG src="/assets/google.svg" />
              </div>
              <div className="font-medium">Sign up with Google</div>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="w-[25%] h-[1px] bg-gray-200"></div>
              <div className="w-[50%] text-center text-sm max-lg:text-xs text-gray-400">or continue with email</div>
              <div className="w-[25%] h-[1px] bg-gray-200"></div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="font-medium">Name</div>
                  <input
                    name="name"
                    maxLength={25}
                    value={name}
                    onChange={el => setName(el.target.value)}
                    type="text"
                    className="w-full bg-white focus:outline-none border-2 p-2 rounded-xl text-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="font-medium">Username</div>
                  <input
                    name="username"
                    maxLength={16}
                    value={username}
                    onChange={el => setUsername(el.target.value.toLowerCase())}
                    type="text"
                    className="w-full bg-white focus:outline-none border-2 p-2 rounded-xl text-gray-400"
                  />
                </div>
              </div>

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

              <div className="w-full flex justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <div>Password</div>
                    <Info
                      onClick={() => setClickedOnStrongPassInfo(true)}
                      className="cursor-pointer"
                      size={18}
                      weight="light"
                    />
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
              </div>

              {/* <div className="flex flex-col gap-2">
                <div className="font-medium">Early Access Token</div>
                <input
                  name="token"
                  value={earlyAccessToken}
                  onChange={el => setEarlyAccessToken(el.target.value)}
                  type="password"
                  className="w-full bg-white focus:outline-none border-2 p-2 rounded-xl text-gray-400"
                />
              </div> */}
            </div>
            <div className="w-full p-1 flex flex-col gap-2 items-center">
              <button
                type="submit"
                className="w-full relative p-2 border-2 after:absolute after:-top-[3px] after:-left-[3px] after:-right-[3px] after:-bottom-[3.5px] after:-z-10 after:bg-[#395887] after:rounded-xl flex items-center cursor-pointer justify-center gap-2 bg-[#3D6DB3] hover:bg-[#345C98] active:bg-[#2D5185] border-[#d1d1d1a7] text-white py-2 rounded-xl font-semibold"
              >
                <div> Continue</div>
                <ArrowRight size={20} weight="regular" />
              </button>

              {/* <div onClick={() => router.push('/early_access')} className="text-gray-400 text-sm cursor-pointer">
                Don&apos;t have your token yet?{' '}
                <span className="font-medium underline underline-offset-2">Get It Now</span>
              </div> */}

              <div onClick={() => router.push('/login')} className="text-gray-400 text-sm cursor-pointer">
                <span className="font-medium hover:underline underline-offset-2">Already have an Account?</span>
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
        <div className="w-[55%] max-lg:hidden min-h-screen bg-onboarding bg-cover"></div>
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

export default SignUp;
