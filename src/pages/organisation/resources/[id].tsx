import { SERVER_ERROR } from '@/config/errors';
import { BACKEND_URL, ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import Toaster from '@/utils/toaster';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import Cookies from 'js-cookie';
import { GetServerSidePropsContext } from 'next/types';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  id: string;
}

const File = ({ id }: Props) => {
  const currentOrgID = useSelector(currentOrgIDSelector);

  const checkMembership = () => {
    const URL = `${ORG_URL}/${currentOrgID}/is_member`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          window.location.assign(`${BACKEND_URL}/resources/${currentOrgID}/serve/${id}?token=${Cookies.get('token')}`);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    checkMembership();
  }, []);
  return <div></div>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;

  return {
    props: { id },
  };
}

export default OrgMembersOnlyAndProtect(File);
