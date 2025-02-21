import type React from 'react';
import { useState } from 'react';
import { setSecondaryEmail, userSelector } from '@/slices/userSlice';
import patchHandler from '@/handlers/patch_handler';
import postHandler from '@/handlers/post_handler';
import { Plus } from '@phosphor-icons/react';
import Toaster from '@/utils/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { ALREADY_VERIFIED_ERROR, SERVER_ERROR } from '@/config/errors';
import { Button } from '@/components/ui/button';
import isEmail from 'validator/lib/isEmail';
import ConfirmOTP from '@/components/common/confirm_otp';

const Email = () => {
  const user = useSelector(userSelector);

  const [clickedOnChange, setClickedOnChange] = useState(false);
  const [secondaryEmail, setLocalSecondaryEmail] = useState(user.secondaryEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecondaryEmailInput, setShowSecondaryEmailInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(true);
  const [clickedOnVerifySecondaryEmail, setClickedOnVerifySecondaryEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email);

  const dispatch = useDispatch();

  const handleSecondaryEmailSubmit = async () => {
    const toaster = Toaster.startLoad('Sending OTP');
    const URL = `/verification/secondary_email`;
    const res = await postHandler(URL, { email: secondaryEmail });

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'OTP sent to your email', 1);
      setShowEmailInput(false);
      setClickedOnVerifySecondaryEmail(true);
    } else {
      if (res.data.message === ALREADY_VERIFIED_ERROR) {
        Toaster.stopLoad(toaster, 'Email already verified', 0);
      } else Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleSecondaryEmailOTPSubmit = async (OTP: string) => {
    setIsLoading(true);
    const toaster = Toaster.startLoad('Verifying OTP...');

    const res = await patchHandler('/verification/secondary_email', {
      email: secondaryEmail,
      otp: OTP,
    });

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Email verified', 1);
      setShowEmailInput(true);
      setShowSecondaryEmailInput(false);
      setClickedOnVerifySecondaryEmail(false);
      dispatch(setSecondaryEmail(secondaryEmail));
      setLocalSecondaryEmail(secondaryEmail);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full flex justify-between flex-col space-y-4">
      {clickedOnVerifySecondaryEmail && (
        <ConfirmOTP
          setShow={setClickedOnVerifySecondaryEmail}
          handleSubmit={handleSecondaryEmailOTPSubmit}
          email={secondaryEmail}
        />
      )}
      <div className="w-full">
        <div className="text-lg font-semibold">Your email address</div>
        {clickedOnChange ? (
          <div className="w-full flex-center gap-4 items-center">
            <input
              value={newEmail}
              onChange={el => setNewEmail(el.target.value)}
              type="email"
              className="w-full bg-white focus:outline-none rounded-lg p-2"
            />
            <div className="w-fit h-fit flex text-sm justify-end gap-2">
              <div
                onClick={() => {
                  setNewEmail(user.email);
                  setClickedOnChange(false);
                }}
                className="h-fit border-[1px] border-primary_black flex-center rounded-full w-20 p-1 cursor-pointer"
              >
                Cancel
              </div>
              {newEmail == user.email ? (
                <div className="h-fit bg-primary_black bg-opacity-50 text-white flex-center rounded-full w-16 p-1 cursor-default">
                  Save
                </div>
              ) : (
                <div
                  onClick={() => {}}
                  className="h-fit bg-primary_black text-white flex-center rounded-full w-16 p-1 cursor-pointer"
                >
                  Save
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>{user.email}</div>
        )}
      </div>
      {!user.isOrganization && (
        <div>
          {showSecondaryEmailInput ? (
            <div className="w-full h-full flex flex-row gap-2">
              {showEmailInput && (
                <>
                  <input
                    value={secondaryEmail}
                    onChange={e => setLocalSecondaryEmail(e.target.value)}
                    placeholder="Enter your secondary email"
                    type="email"
                    className="w-full bg-white dark:bg-dark_primary_comp focus:outline-none rounded-lg p-2"
                  />
                  <Button
                    onClick={handleSecondaryEmailSubmit}
                    disabled={isLoading || !isEmail(secondaryEmail || '')}
                    className={`bg-primary_black text-white w-32 h-full rounded-lg p-2 ${
                      isLoading || !secondaryEmail ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } transition-ease-300`}
                  >
                    Verify
                  </Button>
                  <Button onClick={() => setShowSecondaryEmailInput(false)} className="h-full" variant="destructive">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              {user.secondaryEmail ? (
                <div className="w-full text-xl flex flex-row justify-between items-center">
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold">Your secondary email address</div>
                    <div className="text-base">{user.secondaryEmail}</div>
                  </div>
                  <div
                    onClick={() => setShowSecondaryEmailInput(true)}
                    className="bg-white flex dark:bg-dark_primary_comp h-fit flex-center text-primary_black dark:text-white text-sm font-medium px-3 py-1 rounded-xl border-[1px] cursor-pointer"
                  >
                    Edit
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSecondaryEmailInput(true)}
                  className="w-full flex items-center cursor-pointer transition-ease-300"
                >
                  <Plus size={20} weight="bold" />
                  <span className="ml-2">Add a Secondary Email</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Email;
