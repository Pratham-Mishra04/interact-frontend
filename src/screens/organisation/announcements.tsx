import Loader from '@/components/common/loader';
import AnnouncementCard from '@/components/organization/announcement_card';
import { ORG_SENIOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import NewAnnouncement from '@/sections/organization/announcements/new_announcement';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Announcement, Organization } from '@/types';
import { initialOrganization } from '@/types/initials';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import Toaster from '@/utils/toaster';
import { Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [organisation, setOrganisation] = useState(initialOrganization);
  const [loading, setLoading] = useState(true);

  const [clickedOnNewAnnouncement, setClickedOnNewAnnouncement] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const getAnnouncements = () => {
    const URL = `${ORG_URL}/${currentOrg.id}/announcements`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const announcementsData: Announcement[] = res.data.announcements || [];
          const organizationData: Organization = res.data.organization || initialOrganization;
          setAnnouncements(
            announcementsData.map(a => {
              a.organization = organizationData;
              return a;
            })
          );

          setOrganisation(organizationData);
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
    getAnnouncements();
  }, []);

  return (
    <div className="w-full">
      {clickedOnNewAnnouncement ? (
        <NewAnnouncement setAnnouncements={setAnnouncements} setShow={setClickedOnNewAnnouncement} />
      ) : (
        <></>
      )}
      {checkOrgAccess(ORG_SENIOR) && !clickedOnNewAnnouncement ? (
        <div
          className="fixed z-50 bottom-28 right-0 lg:bottom-12 lg:right-12 flex-center text-sm bg-primary_text text-white px-4 py-3 rounded-full flex gap-2 shadow-lg hover:shadow-2xl font-medium cursor-pointer animate-fade_third transition-ease-300"
          onClick={() => setClickedOnNewAnnouncement(true)}
        >
          <Plus size={20} /> <div className="h-fit">Add Announcement</div>
        </div>
      ) : (
        <></>
      )}
      {loading ? (
        <Loader />
      ) : (
        <div className="w-4/5 mx-auto pb-base_padding flex flex-col gap-4">
          {announcements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
