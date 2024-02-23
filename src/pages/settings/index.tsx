import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useState } from 'react';
import Sidebar from '@/components/common/sidebar';
import { At, Phone, Password, SmileyXEyes, IdentificationBadge, File, FilePdf } from '@phosphor-icons/react';
import Protect from '@/utils/wrappers/protect';
import UpdatePassword from '@/sections/settings/update_password';
import UpdatePhoneNumber from '@/sections/settings/update_phone_number';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import WidthCheck from '@/utils/wrappers/widthCheck';
import UpdateResume from '@/sections/settings/update_resume';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';

const Settings = () => {
  const [theme, setTheme] = useState(String(localStorage.getItem('theme')) == 'dark' ? 'dark' : 'light');

  const [clickedOnChangeResume, setClickedOnChangeResume] = useState(false);
  const [clickedOnChangePhoneNo, setClickedOnChangePhoneNo] = useState(false);
  const [clickedOnChangePassword, setClickedOnChangePassword] = useState(false);

  const user = useSelector(userSelector);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };
  return (
    <BaseWrapper title="Settings">
      <Sidebar index={9} />
      <MainWrapper>
        <div className="w-3/4 max-md:w-full mx-auto dark:text-white flex flex-col gap-2 px-8 max-md:px-4 py-6 font-primary relative transition-ease-out-500">
          <div className="w-fit text-4xl font-extrabold text-gradient mb-2">Settings</div>
          {/* <label className="w-full h-16 select-none text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300">
            <div className="capitalize">{theme} Mode</div>
            <div className="relative">
              <input type="checkbox" onChange={toggleTheme} className="sr-only" />
              <div
                className={`box block h-8 w-14 rounded-full ${
                  theme == 'dark' ? 'bg-white' : 'bg-black'
                } transition-ease-300`}
              ></div>
              <div
                className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full ${
                  theme == 'dark' ? 'translate-x-full bg-black' : 'bg-white '
                } transition-ease-300`}
              ></div>
            </div>
          </label> */}
          <div
            onClick={() => setClickedOnChangeResume(true)}
            className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300"
          >
            <div>{user.resume == '' ? 'Upload Resume' : 'Change Resume'}</div>
            <FilePdf size={40} weight="duotone" />
          </div>
          {/* <div
            onClick={() => setClickedOnChangeEmail(true)}
            className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300"
          >
            <div>Change Email Address</div>
            <At size={40} weight="duotone" />
          </div> */}
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
            <div>{user.isPasswordSetupComplete ? 'Update Your Password' : 'Set Up Your Password'}</div>
            <Password size={40} weight="duotone" />
          </div>
          {!user.isVerified ? (
            <Link
              href={'/verification'}
              className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300"
            >
              <div>Verify Your Account</div>
              <IdentificationBadge size={40} weight="duotone" />
            </Link>
          ) : (
            <></>
          )}
          <Link
            href={'/settings/deactivate_account'}
            className="w-full h-16 text-xl flex-center gap-4 dark:bg-dark_primary_comp hover:bg-primary_comp active:bg-primary_comp_hover dark:hover:bg-dark_primary_comp dark:active:bg-dark_primary_comp_hover px-6 rounded-md text-center cursor-pointer transition-ease-300"
          >
            <div>Deactivate Account</div>
            <SmileyXEyes size={40} weight="duotone" />
          </Link>
          {clickedOnChangeResume ? <UpdateResume setShow={setClickedOnChangeResume} /> : <></>}
          {/* {clickedOnChangeEmail ? <UpdateEmail setShow={setClickedOnChangeEmail} /> : <></>} */}
          {clickedOnChangePhoneNo ? <UpdatePhoneNumber setShow={setClickedOnChangePhoneNo} /> : <></>}
          {clickedOnChangePassword ? (
            <UpdatePassword setShow={setClickedOnChangePassword} setupPass={!user.isPasswordSetupComplete} />
          ) : (
            <></>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Settings);
