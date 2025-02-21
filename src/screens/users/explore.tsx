import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/common/loader';
import UserCard from '@/components/explore/wide_user_card';
import NoSearch from '@/components/fillers/search';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProfileCompletion from '@/sections/explore/profile_completion';
import OrderMenu from '@/components/common/order_menu';

const ExploreUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('trending');

  const fetchUsers = async (search: string | null, initialPage?: number) => {
    const URL = `${EXPLORE_URL}/users?page=${initialPage ? initialPage : page}&limit=${10}&order=${order}${
      search ? `&search=${search}` : ''
    }`;

    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      if (initialPage == 1) {
        setUsers(res.data.users || []);
      } else {
        const addedUsers = [...users, ...(res.data.users || [])];
        if (addedUsers.length === users.length) setHasMore(false);
        setUsers(addedUsers);
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
    setUsers([]);
    setHasMore(true);
    setLoading(true);
    fetchUsers(new URLSearchParams(window.location.search).get('search'), 1);
  }, [window.location.search, order]);

  return (
    <div className="w-full flex flex-col gap-6">
      <OrderMenu orders={['trending', 'most_viewed', 'latest', 'followers']} current={order} setState={setOrder} />
      {loading ? (
        <Loader />
      ) : users.length > 0 ? (
        <InfiniteScroll
          className="w-full px-8 pt-2 pb-12 mx-auto flex flex-wrap gap-6 justify-center"
          dataLength={users.length}
          next={() => fetchUsers(new URLSearchParams(window.location.search).get('search'))}
          hasMore={hasMore}
          loader={<Loader />}
        >
          <ProfileCompletion />
          {users.map(user => {
            return <UserCard key={user.id} user={user} />;
          })}
        </InfiniteScroll>
      ) : (
        <NoSearch />
      )}
    </div>
  );
};

export default ExploreUsers;
