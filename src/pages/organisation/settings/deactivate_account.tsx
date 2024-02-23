import deleteHandler from '@/handlers/delete_handler';
import { resetUser } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import OrgSidebar from '@/components/common/org_sidebar';
import { ArrowArcLeft } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';

const Deactive = () => {
  const [mutex, setMutex] = useState(false);

  const router = useRouter();

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (mutex) return;
    setMutex(true);
    const toaster = Toaster.startLoad('Deactiving your Account...');

    const URL = `/users/deactive`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      Toaster.stopLoad(toaster, 'Account Deactivated', 1);
      setMutex(false);
      Cookies.remove('token');
      Cookies.remove('id');
      dispatch(resetUser());
      router.replace('/login');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  return (
    <BaseWrapper title="Settings">
      <OrgSidebar index={11} />
      <MainWrapper>
        {/* {showDeactivate ? <ConfirmDeactiveAccount setShow={setShowDeactivate} handleSubmit={handleSubmit} /> : <></>} */}
        <div className="w-[50vw] max-md:w-full mx-auto dark:text-white flex flex-col gap-12 px-8 max-md:px-4 py-6 font-primary relative transition-ease-out-500">
          <div className="flex gap-3">
            <ArrowArcLeft
              onClick={() => router.replace('/settings')}
              className="w-10 h-10 p-2 dark:bg-dark_primary_comp_hover rounded-full cursor-pointer"
              size={40}
            />
            <div className="text-4xl font-semibold dark:text-white">Deactive Account</div>
          </div>
          <div className="w-full text-center text-xl mb-16">
            <span className="font-bold">Note:</span> Your account will not be immediately deleted. If you log in within
            30 days, your account will be fully restored; however, should you fail to do so, it will be subject to
            deletion.
          </div>
          <button
            // onClick={() => setShowDeactivate(true)}
            className="w-1/2 m-auto bg-slate-100 border-2 text-black border-[#1f1f1f] hover:text-white py-2 rounded-xl text-xl hover:bg-[#ab3232] cursor-pointer transition-ease-200"
          >
            Deactive My Account
          </button>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default OrgOnlyAndProtect(Deactive);
