import React, { useState } from 'react';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setPhoneNumber, userSelector } from '@/slices/userSlice';
import isMobilePhone from 'validator/lib/isMobilePhone';
import { SERVER_ERROR } from '@/config/errors';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdatePhoneNumber = ({ setShow }: Props) => {
  const [mutex, setMutex] = useState(false);
  const [phoneNo, setPhoneNo] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (!isMobilePhone(phoneNo)) {
      Toaster.error('Enter a valid phone number');
      return;
    }
    if (mutex) return;
    setMutex(true);
    const toaster = Toaster.startLoad('Updating your Phone Number...');

    const formData = {
      phoneNo,
    };

    const URL = `/users/update_phone_number`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Phone Number Updated!', 1);
      setMutex(false);
      dispatch(setPhoneNumber(phoneNo));
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    if (el.target.value.length > 10) return;
    setPhoneNo(el.target.value.replace(/\D+/g, ''));
  };

  const currentPhoneNo = useSelector(userSelector).phoneNo;

  return (
    <>
      <div className="w-1/3 h-1/3 max-md:w-5/6 max-md:h-fit fixed backdrop-blur-xl dark:text-white bg-white dark:bg-[#ffe1fc22] z-30 absolute top-[40%] translate-y-[-50%]  flex max-md:flex-col font-primary p-8 max-md:p-4 border-2 border-gray-500 dark:border-dark_primary_btn animate-fade_third rounded-xl">
        <form
          onSubmit={el => handleSubmit(el)}
          className="w-full h-full flex flex-col max-md:gap-6 justify-between px-4 max-md:px-2 py-4 max-md:py-8"
        >
          {!currentPhoneNo || currentPhoneNo == '' ? (
            <div className="text-xl text-center cursor-default">You haven&apos;t set up your phone number yet.</div>
          ) : (
            <div className="text-center cursor-default">
              Current Phone Number: <span className="text-xl font-bold">{currentPhoneNo}</span>
            </div>
          )}

          <input
            className="bg-slate-200 text-black p-3 rounded-lg text-xl max-md:text-base transition-ease-200 focus:bg-[#1f1f1f] focus:text-white focus:outline-none"
            type="text"
            placeholder="Enter your new phone number"
            value={phoneNo}
            onChange={el => handleChange(el)}
          />
          <button
            type="submit"
            className="w-1/3 max-md:w-1/2 mx-auto bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-1 rounded-xl text-xl hover:bg-[#1f1f1f] transition-ease-200"
          >
            Submit
          </button>
        </form>
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default UpdatePhoneNumber;
