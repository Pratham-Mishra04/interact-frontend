import deleteHandler from '@/handlers/delete_handler';
import { resetUser } from '@/slices/userSlice';
import Protect from '@/utils/wrappers/protect';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Sidebar from '@/components/common/sidebar';
import { ArrowArcLeft } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import WidthCheck from '@/utils/wrappers/widthCheck';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import ConfirmOTP from '@/components/common/confirm_otp';
import getHandler from '@/handlers/get_handler';
import { USER_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';

const Deactivate = () => {
  const [mutex, setMutex] = useState(false);

  const [clickedConfirm, setClickedConfirm] = useState(false);

  const router = useRouter();

  const dispatch = useDispatch();

  const handleSubmit = async (otp: string) => {
    if (otp == '') return;

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Deactivating your Account...');

    const URL = `/users/deactivate`;

    const res = await postHandler(URL, { otp });

    if (res.statusCode === 204) {
      Toaster.stopLoad(toaster, 'Account Deactivated', 1);
      setMutex(false);
      Cookies.remove('token');
      Cookies.remove('id');
      dispatch(resetUser());
      router.push('/login');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  const sendOTP = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Sending OTP');

    const URL = `${USER_URL}/deactivate`;

    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'OTP Sent to your registered mail', 1);
      setClickedConfirm(true);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }

    setMutex(false);
  };

  return (
    <BaseWrapper title="Settings">
      <Sidebar index={9} />
      <MainWrapper>
        {clickedConfirm ? (
          <ConfirmOTP setShow={setClickedConfirm} handleSubmit={handleSubmit} confirmText="Deactivate My Account" />
        ) : (
          <></>
        )}
        <div className="w-[50vw] max-md:w-full mx-auto dark:text-white flex flex-col gap-12 px-8 max-md:px-4 py-6 font-primary relative top-[50%] transition-ease-out-500">
          <div className="flex gap-3">
            <ArrowArcLeft
              onClick={() => router.replace('/settings')}
              className="w-10 h-10 p-2 dark:bg-dark_primary_comp_hover rounded-full cursor-pointer"
              size={40}
            />
            <div className="text-4xl font-semibold dark:text-white m-auto">Deactivate Account</div>
          </div>
          <div className="w-full text-center text-xl  flex flex-col justify-center">
            <div className="font-bold">Note:</div> Your account will not be immediately deleted. If you log in within
            30 days, your account will be fully restored; however, should you fail to do so, it will be subject to
            deletion.
          </div>
          <button
            onClick={sendOTP}
            className="w-1/2 m-auto bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-2 rounded-xl text-xl hover:bg-[#ab3232] cursor-pointer transition-ease-200"
          >
            Deactivate My Account
          </button>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Deactivate);
