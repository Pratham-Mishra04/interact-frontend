import { Chat } from '@/types';
import { initialChatMembership, initialUser } from '@/types/initials';
import Cookies from 'js-cookie';

export const getMessagingUser = (chat: Chat) => {
  const userID = Cookies.get('id');
  try {
    if (chat?.memberships[0]?.userID == userID) return chat.memberships[1].user;
    return chat.memberships[0].user;
  } catch (e) {
    return initialUser;
  }
};

export const getMessagingMembership = (chat: Chat) => {
  const userID = Cookies.get('id');
  try {
    if (chat?.memberships[0]?.userID == userID) return chat.memberships[1];
    return chat.memberships[0] || initialChatMembership;
  } catch (e) {
    return initialChatMembership;
  }
};

export const getSelfMembership = (chat: Chat) => {
  const userID = Cookies.get('id');
  for (const membership of chat.memberships) {
    if (membership.userID == userID) return membership;
  }
  return initialChatMembership;
};

export const isChatUnread = (chat: Chat) => {
  const userID = Cookies.get('id') || '';

  return (
    chat.latestMessageID &&
    chat.latestMessage?.userID !== userID &&
    !chat.latestMessage?.readBy?.some(r => r.userID === userID)
  );
};
