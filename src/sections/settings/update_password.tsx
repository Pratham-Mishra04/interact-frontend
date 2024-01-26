import React, { useState } from 'react';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import Cookies from 'js-cookie';
import isStrongPassword from 'validator/lib/isStrongPassword';
import { Eye, EyeClosed, Info } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import StrongPassInfo from '@/components/common/strong_pass_info';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdatePassword = ({ setShow }: Props) => {
  const [mutex, setMutex] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [clickedOnStrongPassInfo, setClickedOnStrongPassInfo] = useState(false);

  const handleSubmit = async () => {
    if (
      !isStrongPassword(newPassword, {
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

    if (newPassword != confirmPassword) {
      Toaster.error('Passwords do not match!');
      return;
    }
    if (mutex) return;
    setMutex(true);
    const toaster = Toaster.startLoad('Updating your Password...');

    const formData = {
      password,
      newPassword,
      confirmPassword,
    };

    const URL = `/users/update_password`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Password Updated!', 1);
      Cookies.set('token', res.data.token, {
        expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
      });
      setMutex(false);
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
      {clickedOnStrongPassInfo ? (
        <StrongPassInfo password={password} confirmPassword={confirmPassword} setShow={setClickedOnStrongPassInfo} />
      ) : (
        <div className="w-1/3 h-3/5 max-md:w-5/6 max-md:h-fit fixed backdrop-blur-xl dark:text-white bg-white dark:bg-[#ffe1fc22] z-30 absolute top-[40%] translate-y-[-50%]  flex max-md:flex-col font-primary p-8 max-md:p-4 gap-2 border-2 border-gray-500 dark:border-dark_primary_btn animate-fade_third rounded-xl">
          <div className="w-full flex flex-col gap-6 p-4 max-md:px-8 max-md:py-8">
            <div className="flex flex-col gap-2">
              <div className="font-medium">Password</div>
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
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:text-gray-500"
                    size={20}
                    weight="regular"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setShowPassword(true)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:text-gray-500"
                    size={20}
                    weight="regular"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-medium">
                <div>New Password</div>
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
                  value={newPassword}
                  onChange={el => setNewPassword(el.target.value)}
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full bg-white p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10"
                />
                {showNewPassword ? (
                  <Eye
                    onClick={() => setShowNewPassword(false)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:text-gray-500"
                    size={20}
                    weight="regular"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setShowNewPassword(true)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:text-gray-500"
                    size={20}
                    weight="regular"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Confirm New Password</div>
              <div className="w-full relative">
                <input
                  name="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={el => setConfirmPassword(el.target.value)}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full bg-white p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10"
                />
                {showConfirmPassword ? (
                  <Eye
                    onClick={() => setShowConfirmPassword(false)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:text-gray-500"
                    size={20}
                    weight="regular"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setShowConfirmPassword(true)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer dark:text-gray-500"
                    size={20}
                    weight="regular"
                  />
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-1/3 max-md:w-1/2 m-auto bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-1 rounded-xl text-xl hover:bg-[#1f1f1f] transition-ease-200"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default UpdatePassword;
