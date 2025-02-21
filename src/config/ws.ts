import {
  ChatSetupEvent,
  MeStopTyping,
  MeTyping,
  SendMessageEvent,
  SendMessageReadEvent,
  SendNotificationEvent,
  SendUpdateMembership,
  UpdateHackathonEvent,
  WSEvent,
  getWSEvent,
  routeChatListEvents,
  routeChatReadEvents,
  routeMessagingWindowEvents,
  routeUpdateMembership,
  sendEvent,
} from '@/helpers/ws';
import { incrementUnreadNotifications, setUnreadChats } from '@/slices/feedSlice';
import { store } from '@/store';
import { Chat, Hackathon, Message, TypingStatus, User } from '@/types';
import { messageToastSettings } from '@/utils/toaster';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { SOCKET_URL } from './routes';

class SocketService {
  private static instance: SocketService | null = null;
  private socket: WebSocket | null = null;
  private chatIDs: string[] = [];

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  public getChats(): string[] {
    return this.chatIDs;
  }

  public connect(userID: string | undefined = Cookies.get('id')): void {
    if (!userID || userID === '') return;

    const token = Cookies.get('token');
    if (!token || token === '') return;

    if (this.socket) return;

    const connectToSocket = () => {
      this.socket = new WebSocket(`${SOCKET_URL}?userID=${userID}&token=${token}`);

      this.socket.addEventListener('open', event => {
        this.setupChats();
        this.setupChatNotifications();
        this.setupPushNotifications();
        this.setupUpdateMembership();
      });

      this.socket.addEventListener('error', event => {
        setTimeout(connectToSocket, 5000); // retry after 5 seconds
        this.disconnect();
      });
    };

    connectToSocket();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public reconnect(): void {
    if (this.socket) {
      this.disconnect();
      this.connect();
    }
  }

  public setupChats(chats?: string[]): void {
    if (this.socket) {
      if (!chats) {
        chats = store.getState().user.chats;
      }
      this.chatIDs = chats;
      const outgoingEvent = new ChatSetupEvent(chats);
      sendEvent('chat_setup', outgoingEvent, this.socket);
    }
  }

  public sendMessage(message: string, id: string, chatID: string, userID: string, self: User) {
    if (this.socket) {
      const outgoingMessageEvent = new SendMessageEvent(message, id, chatID, userID, self);
      sendEvent('send_message', outgoingMessageEvent, this.socket);
    }
  }

  public sendTypingStatus(self: User, chatID: string, status: number) {
    if (this.socket) {
      if (status == 0) {
        const outgoingStopTypingEvent = new MeStopTyping(self, chatID);
        sendEvent('me_stop_typing', outgoingStopTypingEvent, this.socket);
      } else {
        const outgoingEvent = new MeTyping(self, chatID);
        sendEvent('me_typing', outgoingEvent, this.socket);
      }
    }
  }

  public sendNotification(userID: string, content: string) {
    if (this.socket) {
      const outgoingNotificationEvent = new SendNotificationEvent(userID, content);
      sendEvent('send_notification', outgoingNotificationEvent, this.socket);
    }
  }

  public sendReadMessage(user: User, messageID: string, chatID: string) {
    if (this.socket) {
      const outgoingNotificationEvent = new SendMessageReadEvent(user, messageID, chatID);
      sendEvent('send_read_message', outgoingNotificationEvent, this.socket);
    }
  }

  public sendUpdateMembership(userID: string, organizationID: string, role: string) {
    if (this.socket) {
      const outgoingNotificationEvent = new SendUpdateMembership(userID, organizationID, role);
      sendEvent('send_update_membership', outgoingNotificationEvent, this.socket);
    }
  }

  public sendUpdateHackathon(hackathon: Hackathon) {
    if (this.socket) {
      const outgoingMessageEvent = new UpdateHackathonEvent(hackathon);
      sendEvent('send_hackathon_update', outgoingMessageEvent, this.socket);
    }
  }

  public setupChatWindowRoutes(
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    typingStatus: TypingStatus,
    setTypingStatus: React.Dispatch<React.SetStateAction<TypingStatus>>
  ) {
    if (this.socket) {
      const handleMessage = (evt: MessageEvent) => {
        const eventData = JSON.parse(evt.data);
        const event = new WSEvent(eventData.type, eventData.payload);
        routeMessagingWindowEvents(event, setMessages, typingStatus, setTypingStatus);
      };

      this.socket.addEventListener('message', handleMessage);

      // Return a cleanup function to remove the event listener
      return () => {
        if (this.socket) this.socket.removeEventListener('message', handleMessage);
      };
    }
  }

  public setupChatListRoutes(setChats: React.Dispatch<React.SetStateAction<Chat[]>>) {
    if (this.socket) {
      this.socket.addEventListener('message', function (evt) {
        const eventData = JSON.parse(evt.data);
        const event = new WSEvent(eventData.type, eventData.payload);
        routeChatListEvents(event, setChats);
      });
    }
  }

  public setupChatReadRoutes(setMessages: React.Dispatch<React.SetStateAction<Message[]>>) {
    if (this.socket) {
      const handleMessage = (evt: MessageEvent) => {
        const eventData = JSON.parse(evt.data);
        const event = new WSEvent(eventData.type, eventData.payload);
        routeChatReadEvents(event, setMessages);
      };

      this.socket.addEventListener('message', handleMessage);

      return () => {
        if (this.socket) this.socket.removeEventListener('message', handleMessage);
      };
    }
  }

  public setupChatNotifications() {
    if (this.socket) {
      this.socket.addEventListener('message', function (evt) {
        const event = getWSEvent(evt);
        if (event.type === undefined) {
          alert('No Type in the Event');
        }

        switch (event.type) {
          case 'new_message':
            const messageEventPayload = event.payload as Message;
            const userID = store.getState().user.id;
            const unreadChatIDs = store.getState().feed.unreadChats;
            const currentChatID = store.getState().messaging.currentChatID;
            if (
              messageEventPayload.userID != userID &&
              !unreadChatIDs.includes(messageEventPayload.chatID) &&
              messageEventPayload.chatID != currentChatID
            )
              store.dispatch(setUnreadChats([...unreadChatIDs, messageEventPayload.chatID]));
            if (store.getState().messaging.currentChatID == '')
              toast.info('New Message from: ' + messageEventPayload.user.name, {
                ...messageToastSettings,
                toastId: messageEventPayload.chatID,
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
            break;
          default:
            break;
        }
      });
    }
  }

  public setupPushNotifications() {
    if (this.socket) {
      this.socket.addEventListener('message', function (evt) {
        const event = getWSEvent(evt);
        if (event.type === undefined) {
          alert('No Type in the Event');
        }

        switch (event.type) {
          case 'receive_notification':
            type WS_Notification = {
              userID: string;
              content: string;
              //TODO add notification type
            };
            const notificationEventPayload = event.payload as WS_Notification;
            toast.info(notificationEventPayload.content, {
              ...messageToastSettings,
              icon: '🐵',
            });
            store.dispatch(incrementUnreadNotifications());
            break;
          default:
            break;
        }
      });
    }
  }

  public setupUpdateMembership() {
    if (this.socket) {
      this.socket.addEventListener('message', function (evt) {
        const eventData = JSON.parse(evt.data);
        const event = new WSEvent(eventData.type, eventData.payload);
        routeUpdateMembership(event);
      });
    }
  }
}
const socketService = SocketService.getInstance();
export default socketService;
