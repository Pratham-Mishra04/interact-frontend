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
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const userID = useSelector(userIDSelector) || '';

  const fetchUsers = async (search: string | null) => {
    const sub_url = 'users';
    const URL =
      search && search != ''
        ? `${EXPLORE_URL}/${sub_url}/trending?${'search=' + search}`
        : userID != ''
        ? `${EXPLORE_URL}/${sub_url}/recommended?page=${page}&limit=${10}`
        : `${EXPLORE_URL}/${sub_url}/trending?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      if (search && search != '') {
        setUsers(res.data.users || []);
        setHasMore(false);
      } else {
        if (!search && page == 1) setUsers(res.data.users || []);
        else {
          const addedUsers = [...users, ...(res.data.users || [])];
          if (addedUsers.length === users.length) setHasMore(false);
          setUsers(addedUsers);
        }
        setPage(prev => prev + 1);
      }
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(new URLSearchParams(window.location.search).get('search'));
  }, [window.location.search]);
  return (
    <div className="w-full flex flex-col gap-6 pt-2">
      {loading ? (
        <Loader />
      ) : (
        <>
          {users.length > 0 ? (
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
        </>
      )}
    </div>
  );
};

export default Users;
