import { Chat } from '@/types';
import React from 'react';
import Image from 'next/image';
import getDisplayTime from '@/utils/funcs/get_display_time';
import { useDispatch, useSelector } from 'react-redux';
import { currentChatIDSelector, setCurrentChatID } from '@/slices/messagingSlice';
import { GROUP_CHAT_PIC_URL } from '@/config/routes';
import { userIDSelector } from '@/slices/userSlice';
import { Circle, Lock } from '@phosphor-icons/react';
import { getSelfMembership, isChatUnread } from '@/utils/funcs/messaging';

interface Props {
  chat: Chat;
  setChat?: React.Dispatch<React.SetStateAction<Chat>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setUnreadChatCounts?: React.Dispatch<React.SetStateAction<number[]>>;
  setClickedOnChat?: React.Dispatch<React.SetStateAction<boolean>>;
  wider?: boolean;
}

const GroupChatCard = ({ chat, setChat, setChats, setUnreadChatCounts, setClickedOnChat, wider = false }: Props) => {
  const userID = useSelector(userIDSelector);
  const dispatch = useDispatch();

  const currentChatID = useSelector(currentChatIDSelector);

  const handleClick = () => {
    dispatch(setCurrentChatID(chat.id));
    if (isChatUnread(chat))
      if (setUnreadChatCounts)
        setUnreadChatCounts(([personalCount, groupCount, projectCount, requestCount]) => [
          personalCount,
          chat.projectID ? groupCount : groupCount - 1,
          chat.projectID ? projectCount - 1 : projectCount,
          requestCount,
        ]);
    setChats(prev =>
      prev.map(c => {
        if (c.id == chat.id && c.latestMessageID && isChatUnread(c)) {
          const readBy = c.latestMessage?.readBy || [];
          readBy.push({ messageID: c.latestMessageID, userID, readAt: new Date(), user: null });
          c.latestMessage.readBy = readBy;
        }
        return c;
      })
    );
    if (setChat) setChat(chat);
    if (setClickedOnChat) setClickedOnChat(true);
  };

  const getLatestMessageContent = () => {
    if (chat.latestMessage.content != '') return chat.latestMessage.content;
    if (chat.latestMessage.postID) return 'shared a post.';
    if (chat.latestMessage.projectID) return 'shared a project.';
    if (chat.latestMessage.openingID) return 'shared an opening.';
    if (chat.latestMessage.profileID) return 'shared a profile.';
    if (chat.latestMessage.announcementID) return 'shared an announcement.';
    if (chat.latestMessage.eventID) return 'shared an event.';
    return '';
  };
  return (
    <div
      onClick={handleClick}
      className={`w-full relative font-primary dark:text-white ${
        chat.id == currentChatID
          ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
          : 'hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover'
      } border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg flex gap-4 p-3 cursor-pointer transition-ease-300`}
    >
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`}
        className={'rounded-full w-14 h-14 cursor-pointer border-[1px] border-black'}
      />
      <div className="w-[calc(100%-56px)] flex items-center justify-between">
        <div className="grow flex flex-col gap-1">
          <div className="w-fit flex-center gap-2">
            <div className="text-xl font-semibold">{chat.title}</div>
            <div className="text-xs">
              {chat.projectID
                ? chat.project?.title && '@' + chat.project?.title
                : chat.organizationID && '@' + chat.organization?.user?.username}
            </div>
          </div>
          {getSelfMembership(chat).userID != userID ? (
            <div className="w-fit flex-center gap-1 font-light text-sm">
              <Lock /> You are not a member of this chat
            </div>
          ) : chat.latestMessageID ? (
            <div className="w-full line-clamp-2 font-light">
              <span className="mr-2 font-medium">
                {chat.latestMessage.userID == userID ? '• You' : `• ${chat.latestMessage.user.username}`}
              </span>
              {getLatestMessageContent()}
            </div>
          ) : (
            <div className="w-fit flex-center gap-1 font-light text-sm">
              <span className="font-medium">{chat.user.id == userID ? 'You' : `${chat.user.username}`}</span>
              created this chat
            </div>
          )}
        </div>
        <div className="flex-center flex-col font text-xs">
          {chat.latestMessageID
            ? getDisplayTime(chat.latestMessage.createdAt, wider, wider)
            : getDisplayTime(chat.createdAt, wider, wider)}
          {chat.latestMessageID && isChatUnread(chat) && (
            <>
              <div className="text-xxs text-primary_text font-medium">Unread</div>
              <Circle
                className="text-primary_text absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
                size={16}
                weight="fill"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChatCard;
