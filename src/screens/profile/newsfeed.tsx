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
import InfiniteScroll from 'react-infinite-scroll-component';
import Masonry from 'react-masonry-css';
import Mascot from '@/components/fillers/mascot';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';

interface Props {
  orgID: string;
}

const NewsFeed = ({ orgID }: Props) => {
  const [newsFeed, setNewsFeed] = useState<(Poll | Announcement)[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [organisation, setOrganisation] = useState(initialOrganization);

  const user = useSelector(userSelector);

  const getNewsFeed = () => {
    const URL = `${ORG_URL}/${orgID}/newsFeed?page=${page}&limit=${10}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const organizationData: Organization = res.data.organization || initialOrganization;
          const addedNewsFeed = [...newsFeed, ...(res.data.newsFeed || [])];
          if (addedNewsFeed.length === newsFeed.length) setHasMore(false);
          setNewsFeed(
            addedNewsFeed.map(n => {
              n.organization = organizationData;
              return n;
            })
          );
          setPage(prev => prev + 1);
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
    if (user.id != '') getNewsFeed();
  }, []);

  return (
    <div className="w-full pb-base_padding flex flex-col gap-4">
      {user.id != '' ? (
        loading ? (
          <Loader />
        ) : newsFeed.length > 0 ? (
          <InfiniteScroll
            className="w-5/6 max-md:w-full mx-auto max-md:px-2"
            dataLength={newsFeed.length}
            next={getNewsFeed}
            hasMore={hasMore}
            loader={<Loader />}
          >
            <Masonry
              breakpointCols={{ default: newsFeed.length == 1 ? 1 : 2, 768: 1 }}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {newsFeed.map((news, index) =>
                'totalVotes' in news ? (
                  <div key={news.id} className={`${index != 0 && index != 1 && 'mt-4'} ${index == 0 && 'max-md:mb-4'}`}>
                    <PollCard poll={news} organisation={organisation} setPolls={setNewsFeed} />
                  </div>
                ) : (
                  <div key={news.id} className={`${index != 0 && index != 1 && 'mt-4'} ${index == 0 && 'max-md:mb-4'}`}>
                    <AnnouncementCard announcement={news} />
                  </div>
                )
              )}
            </Masonry>
          </InfiniteScroll>
        ) : (
          <div className="w-5/6 mx-auto">
            <Mascot message="This organization is as quiet as a library at midnight. Shh, nothing's on their newsfeed yet." />
          </div>
        )
      ) : (
        <div className="w-5/6 mx-auto">
          <Mascot message="Sign up to view this section." />
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
