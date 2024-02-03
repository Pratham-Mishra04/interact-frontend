import { MEMBERSHIP_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Organization, OrganizationMembership } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import Image from 'next/image';
import patchHandler from '@/handlers/patch_handler';
import { ORG_MANAGER, ORG_MEMBER, ORG_SENIOR } from '@/config/constants';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import { currentOrgMembershipSelector, currentOrgSelector } from '@/slices/orgSlice';
import { initialOrganization, initialOrganizationMembership } from '@/types/initials';
import { SERVER_ERROR } from '@/config/errors';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  membership: OrganizationMembership;
  organization: Organization;
  setOrganization?: React.Dispatch<React.SetStateAction<Organization>>;
}

const EditMember = ({ setShow, membership, setOrganization }: Props) => {
  const [title, setTitle] = useState(membership.title);
  const [role, setRole] = useState(membership.role);

  const [clickedOnEditTitle, setClickedOnEditTitle] = useState(false);

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);
  const org = useSelector(currentOrgSelector) || initialOrganization;
  const orgMemberShip = useSelector(currentOrgMembershipSelector) || initialOrganizationMembership;

  const handleSubmit = async () => {
    //TODO edit membership over sockets
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing the membership...');

    const formData = {
      title,
      role,
    };

    const URL = `${ORG_URL}/${org.id}/membership/${membership.id}`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      if (setOrganization)
        setOrganization(prev => {
          return {
            ...prev,
            memberships: prev.memberships.map(m => {
              if (m.id == membership.id)
                return {
                  ...m,
                  title,
                  role,
                };
              else return m;
            }),
          };
        });
      Toaster.stopLoad(toaster, 'Membership Edited', 1);
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
    setMutex(false);
  };

  const canEditRoles =
    org.userID == user.id
      ? [ORG_MANAGER, ORG_SENIOR, ORG_MEMBER]
      : orgMemberShip.role == ORG_MANAGER
      ? [ORG_SENIOR, ORG_MEMBER]
      : [];

  return (
    <>
      <div className="fixed top-56 w-[560px] max-md:w-5/6 h-fit backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-4 rounded-lg p-10 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-30">
        <div className="w-full flex max-md:flex-col max-md:gap-4 max-md:items-start items-center justify-between">
          <div className="w-full flex gap-2">
            <Image
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
              className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
            />
            <div className="grow h-fit flex flex-wrap justify-between">
              <div className="flex flex-col">
                <div className="text-lg font-bold">{membership.user.name}</div>
                <div className="text-sm dakr:text-gray-200">@{membership.user.username}</div>
              </div>
            </div>
          </div>

          <select
            onChange={el => setRole(el.target.value)}
            value={role}
            className="w-fit h-12 border-[1px] border-primary_btn dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-none text-sm rounded-lg block p-2"
          >
            {canEditRoles.map((c, i) => {
              return (
                <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                  {c}
                </option>
              );
            })}
          </select>
        </div>

        {clickedOnEditTitle ? (
          <form
            onSubmit={el => {
              el.preventDefault();
              setClickedOnEditTitle(false);
            }}
          >
            <input
              type="text"
              maxLength={25}
              autoFocus={true}
              value={title}
              onChange={el => {
                setTitle(el.target.value);
              }}
              className="p-2 mr-8 w-full flex-center border-[1px] border-primary_btn dark:border-dark_primary_btn dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active focus:outline-none transition-ease-300 rounded-lg font-medium"
            />
          </form>
        ) : (
          <div
            onClick={() => setClickedOnEditTitle(true)}
            className="p-2 w-full flex-center border-[1px] border-primary_btn dark:border-dark_primary_btn dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium"
          >
            {title}
          </div>
        )}

        <div className="w-full flex justify-end">
          <div
            onClick={handleSubmit}
            className="w-[90px] h-[40px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center font-semibold rounded-lg cursor-pointer"
          >
            Edit
          </div>
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditMember;
