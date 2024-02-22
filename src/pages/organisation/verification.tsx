import React from 'react';
import { ReactSVG } from 'react-svg';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Toaster from '@/utils/toaster';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { setVerificationStatus, userSelector } from '@/slices/userSlice';
import Head from 'next/head';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import OTPInput from 'react-otp-input';
import { ALREADY_VERIFIED_ERROR, SERVER_ERROR } from '@/config/errors';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';

const Verification = () => {
  const [sentOTP, setSentOTP] = useState(false);
  const [resentOTP, setResentOTP] = useState(false);
  const [OTP, setOTP] = useState('');

  const router = useRouter();

  const dispatch = useDispatch();

  const user = useSelector(userSelector);
  // if (!user.email || user.email == '') {
  //   Toaster.error('Please Log in again');
  //   Cookies.remove('token');
  //   Cookies.remove('id');
  //   router.replace('/login');
  // } else if (user.isVerified) router.back();

  const sendOTP = () => {
    const toaster = Toaster.startLoad('Sending OTP');
    const URL = `/verification/otp`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          Toaster.stopLoad(toaster, 'OTP Sent', 1);
          if (sentOTP) setResentOTP(true);
          setSentOTP(true);
        } else {
          if (res.data.message) {
            Toaster.stopLoad(toaster, res.data.message, 0);
            if (res.data.message == ALREADY_VERIFIED_ERROR) {
              dispatch(setVerificationStatus(true));
              router.back();
            }
          } else {
            Toaster.stopLoad(toaster, SERVER_ERROR, 0);
          }
        }
      })
      .catch(err => {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      });
  };

  const verifyOTP = (otp: string) => {
    const toaster = Toaster.startLoad('Verifying OTP');
    const URL = `/verification/otp`;
    postHandler(URL, { otp })
      .then(res => {
        if (res.statusCode === 200) {
          Toaster.stopLoad(toaster, 'Account Verified', 1);
          dispatch(setVerificationStatus(true));
          Cookies.set('verified', 'true');
          const signUpRedirect = sessionStorage.getItem('verification-redirect');
          if (signUpRedirect && signUpRedirect.startsWith('signup')) {
            sessionStorage.removeItem('verification-redirect');
            sessionStorage.setItem('onboarding-redirect', 'signup-callback');
            router.replace('/onboarding');
          } else router.back();
        } else {
          if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
          else {
            Toaster.stopLoad(toaster, SERVER_ERROR, 0);
          }
        }
      })
      .catch(err => {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      });
  };

  const handleChange = (otp: string) => {
    setOTP(otp);
    if (otp.length == 6) verifyOTP(otp);
  };

  return (
    <>
      <Head>
        <title>Verification | Interact</title>
      </Head>
      <div className="h-screen flex">
        <div className="w-[55%] max-lg:hidden h-full bg-onboarding bg-cover"></div>
        <div className="w-[45%] max-lg:w-full h-full font-primary py-8 px-8 flex flex-col justify-between items-center">
          <div className="w-full flex justify-start">
            <ReactSVG src="/onboarding_logo.svg" />
          </div>
          <div className="w-3/5 max-md:w-full flex flex-col items-center gap-6">
            {!sentOTP ? (
              <div className="flex flex-col gap-6 max-lg:px-8 py-12 max-lg:py-16">
                <div className="text-2xl font-medium text-center">
                  Your organisation won&apos;t be <span className="font-bold">operational</span> until you verify your
                  account.
                </div>
                <div className="text-xl text-center">
                  An OTP will be sent to <b>{user.email}</b> for the verification of your account.
                </div>
                <div onClick={sendOTP} className="mx-auto underline-offset-2 cursor-pointer hover:underline">
                  Click Here to send OTP
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-2 px-16 max-lg:px-8 py-24 max-lg:py-16">
                <div className="text-xl text-center">
                  Enter the OTP sent to <b>{user.email}</b> for the verification of your account.
                </div>

                <OTPInput
                  value={OTP}
                  onChange={handleChange}
                  numInputs={6}
                  renderInput={props => <input {...props} />}
                  inputStyle={{
                    width: '52px',
                    height: '64px',
                    display: 'flex',
                    justifyContent: 'center',
                    justifyItems: 'center',
                    textAlign: 'center',
                    borderRadius: '20%',
                    borderWidth: '2px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                  }}
                  containerStyle="flex gap-2"
                  inputType="number"
                  shouldAutoFocus={true}
                />

                {!resentOTP ? (
                  <div onClick={sendOTP} className="text-sm">
                    Didn&apos;t receive email?{' '}
                    <span className="underline-offset-2 font-medium cursor-pointer hover:underline">Resend OTP</span>
                  </div>
                ) : (
                  <></>
                )}
                <div className="text-xs">( Check your spam folder )</div>
              </div>
            )}
          </div>
          <div className="w-3/4 max-lg:w-full text-[12px] text-center text-gray-400">
            By clicking “Continue” above, you acknowledge that you have read and understood, and agree to
            Interact&apos;s <span className="underline underline-offset-2 font-medium">Term & Conditions</span> and{' '}
            <span className="underline underline-offset-2 font-medium">Privacy Policy.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default WidthCheck(OrgOnlyAndProtect(Verification));
