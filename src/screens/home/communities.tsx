import getHandler from '@/handlers/get_handler';
import { Community } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EXPLORE_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import Loader from '@/components/common/loader';
import CommunityCard from '@/components/explore/community_card';
import NoSearch from '@/components/fillers/search';
import OrderMenu from '@/components/common/order_menu';

const Communities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState('trending');

  const fetchCommunities = async (search: string | null, initialPage?: number) => {
    const URL = `${EXPLORE_URL}/communities?page=${initialPage ? initialPage : page}&limit=${10}&order=${order}${
      search ? `&search=${search}` : ''
    }`;

    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      if (initialPage == 1) {
        setCommunities(res.data.communities || []);
      } else {
        const addedCommunity: Community[] = [...communities, ...(res.data.communities || [])];
        if (addedCommunity.length === history.length) setHasMore(false);
        setCommunities(addedCommunity);
      }
      setPage(prev => prev + 1);

      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    setPage(1);
    setCommunities([]);
    setHasMore(true);
    setLoading(true);
    fetchCommunities(new URLSearchParams(window.location.search).get('search'), 1);
  }, [window.location.search, order]);

  return (
    <div className="w-full flex flex-col gap-2">
      {communities.length > 0 && (
        <OrderMenu orders={['trending', 'most_viewed', 'latest']} current={order} setState={setOrder} />
      )}
      {loading ? (
        <Loader />
      ) : communities.length > 0 ? (
        <InfiniteScroll
          className="w-full grid grid-cols-2 max-md:grid-cols-1 gap-2 pt-4"
          dataLength={communities.length}
          next={() => fetchCommunities(new URLSearchParams(window.location.search).get('search'))}
          hasMore={hasMore}
          loader={<></>}
        >
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </InfiniteScroll>
      ) : (
        <NoSearch />
      )}
    </div>
  );
};

export default Communities;
