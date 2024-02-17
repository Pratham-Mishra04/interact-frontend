import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Announcement, Organization, Poll } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import PollCard from '@/components/organization/poll_card';
import { initialOrganization } from '@/types/initials';
import AnnouncementCard from '@/components/organization/announcement_card';
import Loader from '@/components/common/loader';

interface Props {
  orgID: string;
}

const NewsFeed = ({ orgID }: Props) => {
  const [newsFeed, setNewsFeed] = useState<(Poll | Announcement)[]>([]);

  const [organisation, setOrganisation] = useState(initialOrganization);
  const [loading, setLoading] = useState(true);

  const getPolls = () => {
    const URL = `${ORG_URL}/${orgID}/newsFeed`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const newsFeedData: (Poll | Announcement)[] = res.data.newsFeed || [];
          const organizationData: Organization = res.data.organization || initialOrganization;
          setNewsFeed(
            newsFeedData.map(n => {
              n.organization = organizationData;
              return n;
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
    getPolls();
  }, []);

  return (
    <div className="w-4/5 mx-auto pb-base_padding flex flex-col gap-4">
      {loading ? (
        <Loader />
      ) : (
        newsFeed.map(news =>
          'totalVotes' in news ? (
            <PollCard key={news.id} poll={news} organisation={organisation} setPolls={setNewsFeed} />
          ) : (
            <AnnouncementCard key={news.id} announcement={news} />
          )
        )
      )}
    </div>
  );
};

export default NewsFeed;
