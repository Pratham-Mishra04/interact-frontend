import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React from 'react';
import Sidebar from '@/components/common/sidebar';
import { SmileyXEyes } from '@phosphor-icons/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import Github from '@/sections/settings/github';
import Email from '@/sections/settings/email';
import Theme from '@/sections/settings/theme';
import Resume from '@/sections/settings/resume';
import PhoneNumber from '@/sections/settings/phone_number';
import Password from '@/sections/settings/password';
import Verify from '@/sections/settings/verify';
import moment from 'moment';

const Settings = () => {
  const user = useSelector(userSelector);
  return (
    <BaseWrapper title="Settings">
      <Sidebar index={9} />
      <MainWrapper>
        <div className="w-full dark:text-white flex flex-col gap-4 px-8 max-md:px-4 py-6 font-primary relative transition-ease-out-500">
          <div className="w-fit text-5xl font-extrabold text-gradient pb-2">Settings</div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex max-md:flex-col gap-4">
              <div className="w-4/5 max-md:w-full flex flex-col gap-6">
                <Theme />
                <Email />
                <Resume />
                <PhoneNumber />
                <Password />
                <Verify />
              </div>
              <div className="w-1/5 max-md:w-full flex flex-col gap-4 md:border-l-[1px] max-md:border-t-[1px] border-gray-400 md:pl-4 max-md:pt-4">
                <div>
                  <div className="font-semibold">Your username</div>
                  <div className="text-gray-800 dark:text-white text-sm">@{user.username}</div>
                </div>
                <div>
                  <div className="font-semibold">Date Joined</div>
                  <div className="text-gray-800 dark:text-white text-sm">
                    {moment(user.createdAt).format('DD-MM-YYYY')}
                  </div>
                </div>
                {process.env.NODE_ENV == 'development' && (
                  <Link
                    href={'/settings/deactivate_account'}
                    className="w-fit flex-center gap-1 text-sm font-medium hover:text-primary_danger transition-ease-300"
                  >
                    Deactivate Account
                    <SmileyXEyes size={20} weight="duotone" />
                  </Link>
                )}
              </div>
            </div>
            <Github />
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Settings);
