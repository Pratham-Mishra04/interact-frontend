import { SERVER_ERROR } from '@/config/errors';
import patchHandler from '@/handlers/patch_handler';
import { setPhoneNumber, userSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import { Phone } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import isMobilePhone from 'validator/lib/isMobilePhone';

const PhoneNumber = () => {
  const [clickedOnChange, setClickedOnChange] = useState(false);
  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const [newPhoneNumber, setNewPhoneNumber] = useState(user.phoneNo);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!isMobilePhone(newPhoneNumber, 'en-IN')) {
      Toaster.error('Enter a valid phone number');
      return;
    }
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating your Phone Number...');

    const formData = {
      phoneNo: newPhoneNumber,
    };

    const URL = `/users/update_phone_number`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Phone Number Updated!', 1);
      setMutex(false);
      dispatch(setPhoneNumber(newPhoneNumber));
      setClickedOnChange(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };
  return (
    <div className="w-full flex justify-between">
      <div className="w-full">
        <div className="w-fit flex-center gap-2 text-lg font-semibold">
          Your Phone Number <Phone size={24} weight="duotone" />
        </div>
        {clickedOnChange ? (
          <div className="w-full flex-center gap-4 items-center">
            <input
              value={newPhoneNumber}
              onChange={el => {
                if (Number(el.target.value) || el.target.value == '') setNewPhoneNumber(el.target.value);
              }}
              maxLength={10}
              type="text"
              className="w-full bg-white dark:bg-dark_primary_comp focus:outline-none rounded-lg p-2"
            />
            <div className="w-fit h-fit flex text-sm justify-end gap-2">
              <div
                onClick={() => {
                  setNewPhoneNumber(user.phoneNo);
                  setClickedOnChange(false);
                }}
                className="h-fit border-[1px] border-primary_black flex-center rounded-full w-20 p-1 cursor-pointer"
              >
                Cancel
              </div>
              {newPhoneNumber == user.phoneNo ? (
                <div className="h-fit bg-primary_black bg-opacity-50 text-white flex-center rounded-full w-16 p-1 cursor-default">
                  Save
                </div>
              ) : (
                <div
                  onClick={handleSubmit}
                  className="h-fit bg-primary_black text-white flex-center rounded-full w-16 p-1 cursor-pointer"
                >
                  Save
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>{user.phoneNo ? `+91 ${user.phoneNo}` : 'Add Phone Number'}</div>
        )}
      </div>
      {!clickedOnChange && (
        <div
          onClick={() => setClickedOnChange(true)}
          className="bg-white dark:bg-dark_primary_comp h-fit flex-center text-sm font-medium px-3 py-1 rounded-xl border-[1px] cursor-pointer"
        >
          {user.phoneNo ? 'Update' : 'Add'}
        </div>
      )}{' '}
    </div>
  );
};

export default PhoneNumber;
