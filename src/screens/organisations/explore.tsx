import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/common/loader';
import NoSearch from '@/components/fillers/search';
import InfiniteScroll from 'react-infinite-scroll-component';
import OrgCard from '@/components/explore/org_card';

const ExploreOrganisations = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async (search: string | null, initialPage?: number) => {
    const sub_url = 'orgs';
    const URL = `${EXPLORE_URL}/${sub_url}?page=${initialPage ? initialPage : page}&limit=${10}${
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
    const orgId = new URLSearchParams(window.location.search).get('orgId');
    if (orgId && orgId != '') fetchUsers(orgId, 1);
    else fetchUsers(new URLSearchParams(window.location.search).get('search'), 1);
  }, [window.location.search]);

  return (
    <div className="w-full flex flex-col gap-6">
      {loading ? (
        <Loader />
      ) : users.length > 0 ? (
        <InfiniteScroll
          className="w-full px-8 pt-2 pb-12 mx-auto flex flex-wrap gap-8 justify-center"
          dataLength={users.length}
          next={() => fetchUsers(new URLSearchParams(window.location.search).get('search'))}
          hasMore={hasMore}
          loader={<Loader />}
        >
          {users.map(user => {
            return <OrgCard key={user.id} user={user} />;
          })}
        </InfiniteScroll>
      ) : (
        <NoSearch />
      )}
    </div>
  );
};

export default ExploreOrganisations;
