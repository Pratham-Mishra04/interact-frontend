import { MESSAGING_URL } from '@/config/routes';
import socketService from '@/config/ws';
import patchHandler from '@/handlers/patch_handler';
import { setCurrentOrgRole } from '@/slices/orgSlice';
import { store } from '@/store';
import { Chat, Hackathon, Message, OrganizationMembership, TypingStatus, User } from '@/types';
import { initialUser } from '@/types/initials';
import { getUserFromState } from '@/utils/funcs/redux';
import sortChats from '@/utils/funcs/sort_chats';
import { toast } from 'react-toastify';
import { messageToastSettings } from '../utils/toaster';

export class WSEvent {
  type = '';
  payload = {};
  constructor(type: string, payload: any) {
    this.type = type;
    this.payload = payload;
  }
}

export const getWSEvent = (evt: MessageEvent<any>) => {
  const eventData = JSON.parse(evt.data);
  return new WSEvent(eventData.type, eventData.payload);
};

export class SendMessageEvent {
  content = '';
  id = '';
  chatID = '';
  user = initialUser;
  userID = '';

  constructor(content: string, id: string, chatID: string, userID: string, user: User) {
    this.content = content;
    this.id = id;
    this.chatID = chatID;
    this.userID = userID;
    this.user = user;
  }
}

export class NewMessageEvent {
  content = '';
  chatID = '';
  user = initialUser;
  userID = '';
  createdAt: Date | string = '';
  read = false;

  constructor(content: string, chatID: string, userID: string, user: User, createdAt: Date) {
    this.content = content;
    this.chatID = chatID;
    this.userID = userID;
    this.user = user;
    this.createdAt = createdAt;
  }
}

export class SendNotificationEvent {
  content = '';
  userID = '';

  constructor(userID: string, content: string) {
    this.content = content;
    this.userID = userID;
  }
}

export class SendMessageReadEvent {
  user = initialUser;
  messageID = '';
  chatID = '';

  constructor(user: User, messageID: string, chatID: string) {
    this.user = user;
    this.messageID = messageID;
    this.chatID = chatID;
  }
}

export class ChatSetupEvent {
  chats: string[] = [];
  constructor(chats: string[]) {
    this.chats = chats;
  }
}

export class ChangeChatRoomEvent {
  id = '';
  constructor(id: string) {
    this.id = id;
  }
}

export class MeTyping {
  user = initialUser;
  chatID = '';
  constructor(user: User, chatID: string) {
    this.user = user;
    this.chatID = chatID;
  }
}

export class MeStopTyping {
  user = initialUser;
  chatID = '';
  constructor(user: User, chatID: string) {
    this.user = user;
    this.chatID = chatID;
  }
}

export class SendUpdateMembership {
  userID = '';
  organizationID = '';
  role = '';
  constructor(userID: string, organizationID: string, role: string) {
    this.userID = userID;
    this.organizationID = organizationID;
    this.role = role;
  }
}

export class UpdateHackathonEvent {
  hackathon = {} as Hackathon;

  constructor(hackathon: Hackathon) {
    this.hackathon = {
      ...hackathon,
      description: '',
      tags: [],
      links: [],
      participants: [],
      coordinators: [],
      history: [],
      tracks: [],
      sponsors: [],
      prizes: [],
      rounds: [],
      faqs: [],
    };
  }
}

const updateLastRead = async (messageID: string) => {
  const URL = `${MESSAGING_URL}/content/${messageID}`;
  await patchHandler(URL, {});
};

export function routeMessagingWindowEvents(
  event: WSEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  typingStatus: TypingStatus,
  setTypingStatus: React.Dispatch<React.SetStateAction<TypingStatus>>
) {
  if (event.type === undefined) {
    alert('No Type in the Event');
  }

  const currentChatID = store.getState().messaging.currentChatID;

  switch (event.type) {
    case 'new_message':
      const messageEventPayload = event.payload as Message;
      if (messageEventPayload.chatID == currentChatID) {
        setMessages(prev => [messageEventPayload, ...prev]);
        updateLastRead(messageEventPayload.id);
        socketService.sendReadMessage(getUserFromState(), messageEventPayload.id, messageEventPayload.chatID);
      } else if (currentChatID != '') {
        toast.info(messageEventPayload.user.name + ': ' + messageEventPayload.content, {
          ...messageToastSettings,
          icon: '🐵',
          // icon: () => (
          //   <Image
          //     width={100}
          //     height={100}
          //     src={`${USER_PROFILE_PIC_URL}/${messageEventPayload.user.profilePic}`}
          //     alt="User"
          //   />
          // ),
        });
      }
      break;
    case 'user_typing':
      const userTypingEventPayload = event.payload as TypingStatus;
      setTypingStatus(userTypingEventPayload);
      break;
    case 'user_stop_typing':
      const userStopTypingEventPayload = event.payload as TypingStatus;
      if (userStopTypingEventPayload.user.id !== typingStatus.user.id) {
        const initialTypingStatus: TypingStatus = {
          user: initialUser,
          chatID: typingStatus.chatID,
        };
        setTypingStatus(initialTypingStatus);
      }
      break;
    default:
      break;
  }
}

export function routeChatListEvents(
  event: WSEvent,
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  // typingStatus: TypingStatus,
  // setTypingStatus: React.Dispatch<React.SetStateAction<TypingStatus>>
) {
  if (event.type === undefined) {
    alert('No Type in the Event');
  }

  switch (event.type) {
    case 'new_message':
      const messageEventPayload = event.payload as Message;
      setChats(prev =>
        sortChats(
          prev.map(chat => {
            if (chat.id == messageEventPayload.chatID) {
              chat.latestMessage = messageEventPayload;
            }
            return chat;
          })
        )
      );
      break;
    default:
      break;
  }
}

export function routeChatReadEvents(event: WSEvent, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) {
  if (event.type === undefined) {
    alert('No Type in the Event');
  }

  const currentChatID = store.getState().messaging.currentChatID;

  switch (event.type) {
    case 'read_message':
      interface ReadMessagePayload {
        user: User;
        messageID: string;
        chatID: string;
      }

      const payload = event.payload as ReadMessagePayload;
      if (currentChatID == payload.chatID) {
        setMessages(prev =>
          prev.map(m => {
            if (m.id == payload.messageID) {
              return {
                ...m,
                readBy: [
                  ...(m.readBy || []),
                  {
                    userID: payload.user.id,
                    messageID: m.id,
                    user: payload.user,
                    readAt: new Date(),
                  },
                ],
              };
            }
            return m;
          })
        );
      }
      break;
    default:
      break;
  }
}

export function routeUpdateMembership(event: WSEvent) {
  if (event.type === undefined) {
    alert('No Type in the Event');
  }

  const userID = store.getState().user.id;
  const organizationID = store.getState().organization.currentOrgMembership.id;

  switch (event.type) {
    case 'receive_update_membership':
      const payload = event.payload as OrganizationMembership;
      if (payload.userID === userID && organizationID === payload.organizationID) {
        store.dispatch(setCurrentOrgRole(payload.role));
      }
      break;

    default:
      break;
  }
}
export function sendEvent(eventName: string, payloadEvent: any, conn: WebSocket) {
  const event = new WSEvent(eventName, payloadEvent);

  try {
    conn.send(JSON.stringify(event));
  } catch (err) {
    if (process.env.NODE_ENV == 'development') {
      console.log(err);
      alert('Socket connection error: ' + eventName);
    }
  }
}
