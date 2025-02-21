import Loader from '@/components/common/loader';
import UserCard from '@/components/explore/user_card';
import UserCardLoader from '@/components/loaders/user_card';
import { SERVER_ERROR } from '@/config/errors';
import { CONNECTION_URL, ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { CommunityMembership, OrganizationMembership, User } from '@/types';
import Toaster from '@/utils/toaster';
import ModalWrapper from '@/wrappers/modal';
import React, { useEffect, useState } from 'react';

interface Props {
  type: string; // followers, following or members
  user?: User;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  orgID?: string;
  org?: Boolean;
  baseURL?: string;
  title?: string;
}

const Connections = ({ type, user, setShow, orgID = '', org = false, baseURL, title }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    const BASE_URL =
      baseURL || (org ? `${ORG_URL}/${orgID}/explore_memberships` : `${CONNECTION_URL}/${type}/${user?.id}`);
    const URL = `${BASE_URL}?page=${page}&limit=${limit}`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      var newUsers: User[] = res.data.users || [];
      if (org) {
        newUsers = [];
        const memberships: OrganizationMembership[] = res.data.memberships || [];
        memberships.forEach(m => newUsers.push(m.user));
      } else if (type == 'community') {
        newUsers = [];
        const memberships: CommunityMembership[] = res.data.memberships || [];
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
    <ModalWrapper
      setShow={setShow}
      width="2/5"
      height="fit"
      blur={true}
      modalStyles={{ top: users && users.length > 5 ? '50%' : '45%' }}
    >
      <div className="w-full text-center text-gradient font-bold text-2xl capitalize">
        {title || `${type} of ${user?.name}`}
      </div>
      {loading && page == 1 ? (
        <div className="w-full flex flex-col gap-2">
          {Array(3)
            .fill(1)
            .map((_, i) => (
              <UserCardLoader key={i} />
            ))}
        </div>
      ) : loading && page == 1 ? (
        <Loader />
      ) : users && users.length == 0 ? (
        <div className="w-full text-center font-medium">No users here :)</div>
      ) : (
        <div className="w-full flex flex-col gap-2">
          {users.map(user => {
            return <UserCard key={user.id} user={user} forTrending={true} />;
          })}
          {loading ? (
            <Loader />
          ) : (
            users.length % limit == 0 &&
            hasMore && (
              <div
                onClick={fetchUsers}
                className="w-fit mx-auto pt-4 text-xs text-gray-700 dark:text-white font-medium hover-underline-animation after:bg-gray-700 cursor-pointer"
              >
                Load More
              </div>
            )
          )}
        </div>
      )}
    </ModalWrapper>
  );
};

export default Connections;
