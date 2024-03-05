import Loader from '@/components/common/loader';
import OrgSidebar from '@/components/common/org_sidebar';
import ApplicationUpdate from '@/components/notifications/applicationUpdate';
import ChatRequest from '@/components/notifications/chatRequest';
import Follow from '@/components/notifications/follow';
import Liked from '@/components/notifications/liked';
import UserAppliedToOpening from '@/components/notifications/application';
import Welcome from '@/components/notifications/welcome';
import { NOTIFICATION_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import { Notification } from '@/types';
import Comment from '@/components/notifications/comment';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SERVER_ERROR } from '@/config/errors';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';
import Invitation from '@/components/notifications/invitation';
import Task from '@/components/notifications/task';
import Impressions from '@/components/notifications/impressions';
import Tagged from '@/components/notifications/tagged';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = () => {
    const URL = `${NOTIFICATION_URL}?page=${page}&limit=${10}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const notificationsData: Notification[] = res.data.notifications;
          const addedNotifications = [...notifications, ...notificationsData];
          if (addedNotifications.length === notifications.length) setHasMore(false);
          setNotifications(addedNotifications);
          setLoading(false);
          setPage(prev => prev + 1);
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
  return (
    <BaseWrapper title="Notifications">
      <OrgSidebar index={10} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-6 max-md:px-2 p-base_padding">
          <div className="w-full text-6xl font-semibold dark:text-white font-primary">Notifications</div>
          {loading ? (
            <Loader />
          ) : (
            <div className="w-full flex flex-col gap-2">
              {notifications.length === 0 ? (
                <div className="w-full font-primary flex-center dark:text-white py-4 cursor-default text-center">
                  No notifications :)
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={notifications.length}
                  next={getNotifications}
                  hasMore={hasMore}
                  loader={<Loader />}
                  className="flex flex-col gap-2"
                >
                  {notifications.map((notification, index) => {
                    switch (notification.notificationType) {
                      case -1:
                        return <Welcome notification={notification} />;
                      case 0:
                        return <Follow notification={notification} />;
                      case 1:
                      case 3:
                      case 12:
                      case 18:
                        return <Liked notification={notification} />;
                      case 2:
                      case 4:
                      case 13:
                      case 19:
                        return <Comment notification={notification} />;
                      case 5:
                      case 20:
                        return <UserAppliedToOpening notification={notification} />;
                      case 6:
                        return <ApplicationUpdate notification={notification} status={1} />;
                      case 7:
                        return <ApplicationUpdate notification={notification} status={0} />;
                      case 9:
                        return <ChatRequest notification={notification} />;
                      case 10:
                        return <Invitation notification={notification} />;
                      case 11:
                        return <Task notification={notification} />;
                      case 14:
                      case 15:
                      case 16:
                      case 17:
                        return <Impressions notification={notification} />;
                      case 21:
                      case 22:
                        return <Tagged notification={notification} />;
                      default:
                        return <></>;
                    }
                  })}
                </InfiniteScroll>
              )}
            </div>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgOnlyAndProtect(Notifications));
