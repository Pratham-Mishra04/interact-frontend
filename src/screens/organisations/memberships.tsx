import React, { useEffect, useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL, USER_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { OrganizationMembership } from '@/types';
import Toaster from '@/utils/toaster';
import Image from 'next/image';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { resetCurrentOrg, setCurrentOrg, setCurrentOrgMembership } from '@/slices/orgSlice';
import { Trash } from '@phosphor-icons/react';
import { initialOrganizationMembership } from '@/types/initials';
import ConfirmDelete from '@/components/common/confirm_delete';
import deleteHandler from '@/handlers/delete_handler';
import ConfirmOTP from '@/components/common/confirm_otp';
import { setOrganizationMemberships, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';

const MemberOrganizations = () => {
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [clickedOnLeaveOrg, setClickedOnLeaveOrg] = useState(false);
  const [clickedOnConfirmLeave, setClickedOnConfirmLeave] = useState(false);

  const [clickedMembership, setClickedMembership] = useState(initialOrganizationMembership);

  const user = useSelector(userSelector);

  const router = useRouter();
  const dispatch = useDispatch();

  const fetchMemberships = () => {
    const URL = `${USER_URL}/me/organization/memberships?populate=true`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const organizationMemberships: OrganizationMembership[] = res.data.memberships || [];
          setMemberships(organizationMemberships);

          const { oid, ouid } = router.query;
          if (oid && oid != '') {
            const filteredMemberships = organizationMemberships.filter(m => m.organizationID == oid);
            if (filteredMemberships.length == 1) {
              handleClick(filteredMemberships[0]);
            }
          }
          if (ouid && ouid != '') {
            const filteredMemberships = organizationMemberships.filter(m => m.organization.userID == ouid);
            if (filteredMemberships.length == 1) {
              handleClick(filteredMemberships[0]);
            }
          }
        } else Toaster.error(res.data.message, 'error_toaster');
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    dispatch(resetCurrentOrg());
    fetchMemberships();
  }, []);

  const handleClick = (membership: OrganizationMembership) => {
    dispatch(setCurrentOrg(membership.organization));
    dispatch(setCurrentOrgMembership(membership));

    const { redirect_url } = router.query;

    if (redirect_url) router.push('/organisation/' + redirect_url);
    else router.push('/organisation/posts');
  };

  const sendOTP = async () => {
    const toaster = Toaster.startLoad('Sending OTP');

    const URL = `${ORG_URL}/${clickedMembership.organizationID}/membership/delete`;

    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'OTP Sent to your registered mail', 1);
      setClickedOnLeaveOrg(false);
      setClickedOnConfirmLeave(true);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleLeaveOrg = async (otp: string) => {
    const toaster = Toaster.startLoad('Leaving Organisation...');

    const URL = `${ORG_URL}/${clickedMembership.organizationID}/membership`;

    const res = await deleteHandler(URL, { otp });

    if (res.statusCode === 204) {
      setMemberships(prev => prev.filter(m => m.id != clickedMembership.id));
      dispatch(
        setOrganizationMemberships(
          user.organizationMemberships.filter(membership => membership.id != clickedMembership.id)
        )
      );
      setClickedMembership(initialOrganizationMembership);
      setClickedOnConfirmLeave(false);
      Toaster.stopLoad(toaster, 'Left Organisation', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {clickedOnLeaveOrg && (
        <ConfirmDelete setShow={setClickedOnLeaveOrg} handleDelete={sendOTP} title="Leave Organisation?" />
      )}
      {clickedOnConfirmLeave && <ConfirmOTP setShow={setClickedOnConfirmLeave} handleSubmit={handleLeaveOrg} />}
      <div className="w-full grid grid-cols-2 max-md:grid-cols-1 gap-8">
        {memberships.map(membership => (
          <div
            key={membership.id}
            onClick={() => handleClick(membership)}
            className="w-full hover:shadow-xl font-primary bg-white hover:bg-primary_comp_hover dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-md flex max-md:flex-col items-center justify-start gap-6 p-4 transition-ease-300 cursor-pointer animate-reveal"
          >
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${membership.organization.user.profilePic}`}
              placeholder="blur"
              blurDataURL={membership.organization.user.profilePicBlurHash || 'no-hash'}
              className="rounded-full w-32 h-32"
            />
            <div className="w-[calc(100%-128px)] max-md:w-full flex flex-col gap-2 max-md:text-center max-md:gap-4">
              <div className="w-full flex justify-between max-md:justify-center items-center max-md:gap-2">
                <div className="text-3xl font-bold text-gradient line-clamp-1">{membership.organization.title}</div>
                <Trash
                  onClick={el => {
                    el.stopPropagation();
                    setClickedMembership(membership);
                    setClickedOnLeaveOrg(true);
                  }}
                  size={24}
                />
              </div>
              <div className="line-clamp-1">{membership.title}</div>
              <div className="font-medium">{membership.role}</div>
              <div className="text-xs">Joined {moment(membership.createdAt).format('DD MMM YYYY')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberOrganizations;
