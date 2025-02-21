import StrongPassInfo from '@/components/common/strong_pass_info';
import { SERVER_ERROR } from '@/config/errors';
import patchHandler from '@/handlers/patch_handler';
import { setPasswordSetupStatus, userSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import { Eye, EyeClosed, Info, Password as PasswordIcon } from '@phosphor-icons/react';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import isStrongPassword from 'validator/lib/isStrongPassword';

const Password = () => {
  const [mutex, setMutex] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [clickedOnStrongPassInfo, setClickedOnStrongPassInfo] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (
      !isStrongPassword(!user.isPasswordSetupComplete ? password : newPassword, {
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

    if ((!user.isPasswordSetupComplete ? password : newPassword) != confirmPassword) {
      Toaster.error('Passwords do not match!');
      return;
    }
    if (mutex) return;
    setMutex(true);
    const toaster = Toaster.startLoad('Updating your Password...');

    const URL = `/users/${!user.isPasswordSetupComplete ? 'setup_password' : 'update_password'}`;

    const formData = new FormData();
    formData.append('password', password);
    if (user.isPasswordSetupComplete) formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Cookies.set('token', res.data.token, {
        expires: Number(process.env.NEXT_PUBLIC_COOKIE_EXPIRATION_TIME),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
      if (!user.isPasswordSetupComplete) dispatch(setPasswordSetupStatus(true));
      setMutex(false);
      Toaster.stopLoad(toaster, !user.isPasswordSetupComplete ? 'Password Added!' : 'Password Updated!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  const user = useSelector(userSelector);

  const canSubmit = () => {
    if (!user.isPasswordSetupComplete) {
      return password && password === confirmPassword;
    }
    return newPassword && newPassword === confirmPassword;
  };

  return (
    <div className="w-full flex justify-between">
      {clickedOnStrongPassInfo && (
        <StrongPassInfo
          password={!user.isPasswordSetupComplete ? password : newPassword}
          confirmPassword={confirmPassword}
          setShow={setClickedOnStrongPassInfo}
        />
      )}
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex items-center justify-between">
          <div className="w-fit flex-center gap-2 text-lg font-semibold">
            {!user.isPasswordSetupComplete ? 'Setup Password' : 'Update Password'}
            <PasswordIcon size={24} weight="duotone" />
          </div>
          <div
            onClick={() => {
              if (canSubmit()) handleSubmit();
            }}
            className={`h-fit flex-center text-sm font-medium px-3 py-1 rounded-xl border-[1px]
        ${
          canSubmit()
            ? 'cursor-pointer bg-white dark:bg-dark_primary_comp'
            : 'cursor-default bg-gray-100 dark:bg-dark_primary_comp opacity-60'
        }
        `}
          >
            Update
          </div>
        </div>

        <div className="w-1/2 max-md:w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1 ">
            <div className="flex items-center gap-2 font-medium">
              <div>{user.isPasswordSetupComplete && 'Current '}Password</div>
              {!user.isPasswordSetupComplete && (
                <Info
                  onClick={() => setClickedOnStrongPassInfo(true)}
                  className="cursor-pointer"
                  size={18}
                  weight="light"
                />
              )}
            </div>{' '}
            <div className="w-full relative">
              <input
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={el => setPassword(el.target.value)}
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-gray-100 dark:bg-dark_primary_comp p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10 transition-ease-300"
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

          <div className="w-full flex-center gap-4">
            {user.isPasswordSetupComplete && (
              <div className="flex flex-col gap-1">
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
                    className="w-full bg-gray-100 dark:bg-dark_primary_comp p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10 transition-ease-300"
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
            )}

            <div className={`${!user.isPasswordSetupComplete && 'w-full '}flex flex-col gap-1`}>
              <div className="font-medium">Confirm {user.isPasswordSetupComplete && 'New'} Password</div>
              <div className="w-full relative">
                <input
                  name="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={el => setConfirmPassword(el.target.value)}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full bg-gray-100 dark:bg-dark_primary_comp p-2 rounded-xl focus:outline-none focus:bg-white border-2 text-gray-400 pr-10 transition-ease-300"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;
