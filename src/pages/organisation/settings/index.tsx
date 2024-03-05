import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useState } from 'react';
import OrgSidebar from '@/components/common/org_sidebar';
import { Phone, Password, SmileyXEyes } from '@phosphor-icons/react';
import UpdatePassword from '@/sections/settings/update_password';
import UpdatePhoneNumber from '@/sections/settings/update_phone_number';
import { useSelector } from 'react-redux';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';
import { userSelector } from '@/slices/userSlice';

const Settings = () => {
  //TODO Delete Organization
  const [clickedOnChangePhoneNo, setClickedOnChangePhoneNo] = useState(false);
  const [clickedOnChangePassword, setClickedOnChangePassword] = useState(false);

  const user = useSelector(userSelector);
  return (
    <BaseWrapper title={`Settings | ${user.name}`}>
      <OrgSidebar index={11} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-6 max-md:px-2 p-base_padding">
          <div className="w-full text-6xl font-semibold dark:text-white font-primary">Settings</div>
          <div
            onClick={() => setClickedOnChangePhoneNo(true)}
            className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300"
          >
            <div>{user.phoneNo ? 'Change Phone Number' : 'Add Phone Number'}</div>
            <Phone size={40} weight="duotone" />
          </div>
          <div
            onClick={() => setClickedOnChangePassword(true)}
            className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300"
          >
            <div>Update Your Password</div>
            <Password size={40} weight="duotone" />
          </div>
          <div className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300">
            <div>Delete Organization</div>
            <SmileyXEyes size={40} weight="duotone" />
          </div>
          {clickedOnChangePhoneNo ? <UpdatePhoneNumber setShow={setClickedOnChangePhoneNo} /> : <></>}
          {clickedOnChangePassword ? <UpdatePassword setShow={setClickedOnChangePassword} /> : <></>}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default OrgOnlyAndProtect(Settings);
