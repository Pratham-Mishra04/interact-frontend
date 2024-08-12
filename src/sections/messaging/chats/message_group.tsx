import { Chat, Message } from '@/types';
import RegularMessage from '@/components/messaging/regular_message';
import SharedPostMessage from '@/components/messaging/shared_post_message';
import SharedProjectMessage from '@/components/messaging/shared_project_message';
import SharedOpeningMessage from '@/components/messaging/shared_opening_message';
import SharedProfileMessage from '@/components/messaging/shared_profile_message';
import SharedAnnouncementMessage from '@/components/messaging/shared_announcement_message';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';
import SharedEventMessage from '@/components/messaging/shared_event_message';

interface Props {
  date: string;
  messages: Message[];
  chat: Chat;
}

const MessageGroup = ({ date, messages, chat }: Props) => {
  const userID = useSelector(userIDSelector);
  return (
    <div className="flex flex-col gap-4 mx-2 dark:text-white font-primary pt-4 pb-2">
      <div className="w-full text-center text-sm">{date}</div>
      <div className="flex flex-col-reverse gap-6">
        {messages.map(message => {
          return (
            <div key={message.id} className="flex flex-col gap-2">
              {message.postID != null ? (
                <SharedPostMessage message={message} />
              ) : message.projectID != null ? (
                <SharedProjectMessage message={message} />
              ) : message.openingID != null ? (
                <SharedOpeningMessage message={message} />
              ) : message.profileID != null ? (
                <SharedProfileMessage message={message} />
              ) : message.announcementID != null ? (
                <SharedAnnouncementMessage message={message} />
              ) : message.eventID != null ? (
                <SharedEventMessage message={message} />
              ) : (
                <RegularMessage message={message} />
              )}
              {message.userID == userID && (
                <>
                  {chat.isGroup
                    ? message.readBy && (
                        <div className="w-fit text-xs self-end opacity-75">
                          {message.readBy?.length == chat.noMembers
                            ? ' • Seen'
                            : message.readBy?.length - 1 != 0 && `• Seen by ${message.readBy?.length - 1} users`}
                        </div>
                      )
                    : chat.isAccepted &&
                      message.readBy?.length == chat.noMembers && (
                        <div className="w-fit text-xs self-end opacity-75">• Seen</div>
                      )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageGroup;
