import React, { useState, useEffect } from 'react';
import Loader from '@/components/common/loader';
import ApplicationUpdate from '@/components/notifications/applicationUpdate';
import Follow from '@/components/notifications/follow';
import Liked from '@/components/notifications/liked';
import UserAppliedToOpening from '@/components/notifications/application';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Notification } from '@/types';
import Comment from '@/components/notifications/comment';
import Welcome from '@/components/notifications/welcome';
import ChatRequest from '@/components/notifications/chatRequest';
import { useDispatch, useSelector } from 'react-redux';
import { setUnreadNotifications, unreadNotificationsSelector } from '@/slices/feedSlice';
import { NOTIFICATION_URL } from '@/config/routes';
import Link from 'next/link';
import { SERVER_ERROR } from '@/config/errors';
import { userSelector } from '@/slices/userSlice';
import Invitation from '@/components/notifications/invitation';
import Task from '@/components/notifications/task';
import Impressions from '@/components/notifications/impressions';
import Tagged from '@/components/notifications/tagged';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notifications = ({ setShow }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector(userSelector);

  useEffect(() => {
    getNotifications();
    return () => {
      dispatch(setUnreadNotifications(0));
    };
  }, []);

  const getNotifications = () => {
    setLoading(true);
    const URL = `${NOTIFICATION_URL}/unread`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setNotifications(res.data.notifications);
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

  return (
    <>
      <div className="w-96 bg-gray-200 dark:bg-[#200c1944] font-primary max-md:w-full max-h-[480px] max-md:max-h-none max-md:h-screen overflow-y-auto fixed top-[72px] max-md:top-0 right-4 max-md:right-0 rounded-2xl max-md:rounded-none backdrop-blur-lg backdrop flex flex-col items-center p-2 z-[150] animate-fade_third">
        <div className="w-full flex flex-col gap-2 max-md:gap-4 p-4 pb-2">
          <div className="w-full flex items-center justify-between">
            <div className="w-fit text-start text-2xl max-md:text-3xl font-bold text-gradient">Notification Center</div>
            <div onClick={() => setShow(false)} className="text-xl dark:text-white cursor-pointer md:hidden">
              X
            </div>
          </div>

          <div className="w-full h-[1px] bg-dark:dark_primary_btn"></div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <>
            {notifications.length === 0 ? (
              <div className="w-full font-primary flex-center dark:text-white py-4 cursor-default text-center">
                No new notifications :)
              </div>
            ) : (
              <div className="w-full">
                {notifications.map(notification => {
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
              </div>
            )}
          </>
        )}
        <Link
          href={`${user.isOrganization ? '/organisation' : ''}/notifications`}
          className="dark:text-white font-primary text-xs hover:underline my-2"
        >
          view all
        </Link>
      </div>
      <div
        onClick={() => setShow(false)}
        className="backdrop-brightness-75 w-screen h-screen fixed top-0 left-0 z-30 animate-fade_third"
      ></div>
    </>
  );
};

export default Notifications;
