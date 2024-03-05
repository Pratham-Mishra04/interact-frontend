import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React, { useEffect, useState } from 'react';
import { initialAnnouncement } from '@/types/initials';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { GetServerSidePropsContext } from 'next/types';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import OrgSidebar from '@/components/common/org_sidebar';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import AnnouncementCard from '@/components/organization/announcement_card';

interface Props {
  id: string;
}

const Announcement = ({ id }: Props) => {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [loading, setLoading] = useState(true);

  const user = useSelector(userSelector);

  const getPost = () => {
    const URL = `${EXPLORE_URL}/announcements/${id}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setAnnouncement(res.data.announcement);
          setLoading(false);
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
    getPost();
  }, []);

  return (
    <BaseWrapper title={`${announcement.title} | Interact`}>
      {user.isOrganization ? <OrgSidebar index={1} /> : <Sidebar index={2} />}
      <MainWrapper>
        <div className="w-[50vw] pt-6 mx-auto max-lg:w-full max-lg:px-4 flex max-md:flex-col transition-ease-out-500 font-primary">
          {loading ? <Loader /> : <AnnouncementCard announcement={announcement} />}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Announcement;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;

  return {
    props: { id },
  };
}
