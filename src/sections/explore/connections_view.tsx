import Loader from '@/components/common/loader';
import UserCard from '@/components/explore/user_card';
import UserCardLoader from '@/components/loaders/user_card';
import { SERVER_ERROR } from '@/config/errors';
import { CONNECTION_URL, ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { OrganizationMembership, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface Props {
  type: string; // followers, following or members
  user: User;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  orgID?: string;
  org?: Boolean;
}

const Connections = ({ type, user, setShow, orgID = '', org = false }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    const BASE_URL = org ? `${ORG_URL}/${orgID}/explore_memberships` : `${CONNECTION_URL}/${type}/${user.id}`;
    const URL = `${BASE_URL}?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      var newUsers: User[] = res.data.users || [];
      if (org) {
        newUsers = [];
        const memberships: OrganizationMembership[] = res.data.memberships || [];
        memberships.forEach(m => newUsers.push(m.user));
      }
      const addedUsers = [...users, ...newUsers];
      if (addedUsers.length === users.length) setHasMore(false);
      setUsers(addedUsers);
      setPage(prev => prev + 1);

      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div
        className={`w-2/5 ${
          users.length < 5 ? 'h-fit' : 'h-4/5'
        } max-lg:w-5/6  fixed overflow-y-auto border-gray-400 border-[1px] dark:border-0 backdrop-blur-lg bg-white dark:bg-[#ffe1fc22] dark:max-lg:bg-[#2a192eea] dark:text-white z-30 translate-x-1/2 -translate-y-1/4 top-64 right-1/2 flex flex-col font-primary p-6 gap-6 rounded-xl animate-fade_third`}
      >
        <div className="w-full text-center text-gradient font-bold text-2xl capitalize">
          {type} of {user.name}
        </div>
        {loading && page == 1 ? (
          <div className="w-full flex flex-col gap-2">
            {Array(3)
              .fill(1)
              .map((_, i) => (
                <UserCardLoader key={i} />
              ))}
          </div>
        ) : (
          <>
            {!users || users.length === 0 ? (
              <div className="w-full text-center text-lg font-medium">Nothing Here :)</div>
            ) : (
              <InfiniteScroll
                className="px-4 max-lg:px-2 flex flex-col gap-2"
                dataLength={users.length}
                next={fetchUsers}
                hasMore={hasMore}
                loader={<Loader />}
              >
                {users.map(user => {
                  return <UserCard key={user.id} user={user} />;
                })}
              </InfiniteScroll>
            )}
          </>
        )}
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default Connections;
