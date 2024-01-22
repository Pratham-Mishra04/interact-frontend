import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import isEmail from 'validator/lib/isEmail';
import { useDispatch, useSelector } from 'react-redux';
import { setEmail, setVerificationStatus, userSelector } from '@/slices/userSlice';
import { SERVER_ERROR } from '@/config/errors';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdateEmail = ({ setShow }: Props) => {
  const [mutex, setMutex] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const router = useRouter();

  const dispatch = useDispatch();

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (!isEmail(newEmail)) {
      Toaster.error('Enter a valid email');
      return;
    }
    if (mutex) return;
    setMutex(true);
    const toaster = Toaster.startLoad('Updating your Email...');

    const formData = {
      email: newEmail,
    };

    const URL = `/users/update_email`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Email Updated!', 1);
      setMutex(false);
      dispatch(setEmail(newEmail));
      dispatch(setVerificationStatus(false));
      router.push('/verification');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  const currentEmail = useSelector(userSelector).email;

  return (
    <>
      <form
        onSubmit={el => handleSubmit(el)}
        className="w-fit h-fit max-md:w-5/6 max-md:h-fit fixed backdrop-blur-xl dark:text-white bg-white dark:bg-[#ffe1fc22] z-30 absolute top-[40%] translate-y-[-50%] flex flex-col gap-8 font-primary px-12 py-8 max-md:p-4 border-2 border-gray-500 dark:border-dark_primary_btn animate-fade_third rounded-xl "
      >
        <div className="text-center cursor-default">
          Current Email Address: <span className=" text-xl font-bold">{currentEmail}</span>
        </div>
        <div className="flex flex-col gap-4">
          <input
            className="bg-slate-200 text-black p-3 rounded-lg text-xl max-md:text-base transition-ease-200 focus:bg-[#1f1f1f] focus:text-white focus:outline-none"
            type="email"
            placeholder="Enter your new email address"
            value={newEmail}
            onChange={el => setNewEmail(el.target.value)}
          />
          <button
            type="submit"
            className="w-1/4 max-md:w-1/2 m-auto bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-1 rounded-xl text-lg hover:bg-[#1f1f1f] transition-ease-200"
          >
            Submit
          </button>
        </div>

        <div className="w-full text-center text-sm">
          Note: You will have to verify your account again after updating your email.
        </div>
      </form>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default UpdateEmail;
