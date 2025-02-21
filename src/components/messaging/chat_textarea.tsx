import React, { useState } from 'react';
// import { MeStopTyping, MeTyping, sendEvent } from '@/utils/ws';
import { Chat } from '@/types';
import Cookies from 'js-cookie';
import socketService from '@/config/ws';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { getSelfMembership } from '@/utils/funcs/messaging';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromState } from '@/utils/funcs/redux';
import { ArrowRightCircleIcon } from 'lucide-react';
import { ArrowRight } from '@phosphor-icons/react';

interface Props {
  chat: Chat;
}

const ChatTextarea = ({ chat }: Props) => {
  const [value, setValue] = useState('');

  const userID = Cookies.get('id');

  const handleChange = (event: any) => {
    const newValue = event.target.value;

    const typingStatus = newValue === '' ? 0 : 1;
    socketService.sendTypingStatus(getUserFromState(), chat.id, typingStatus);

    setValue(newValue);
  };

  const handleKeyUp = (event: any) => {
    if (event.keyCode === 13 && event.shiftKey != true) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (value.trim() == '') return;

    const id = uuidv4();

    socketService.sendMessage(value, id, chat.id, userID || '', getSelfMembership(chat).user);
    socketService.sendTypingStatus(getSelfMembership(chat).user, chat.id, 0);

    setValue('');

    const URL = `/messaging/content/`;
    const formData = {
      content: value,
      id,
      chatID: chat.id,
    };

    const res = await postHandler(URL, formData);

    if (res.statusCode === 201) {
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
    }
  };

  return chat.isAdminOnly && !getSelfMembership(chat).isAdmin ? (
    <div className="w-full h-[64px] max-md:h-[38px] backdrop-blur-md bg-primary_comp text-gray-600 dark:bg-dark_primary_comp rounded-xl p-4 dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn cursor-default">
      Only Admins can send messages
    </div>
  ) : getSelfMembership(chat).isBlocked ? (
    <div className="w-full h-[64px] max-md:h-[38px] backdrop-blur-md bg-primary_comp text-gray-600 dark:bg-dark_primary_comp rounded-xl p-4 dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn cursor-default">
      Chat is Blocked
    </div>
  ) : (
    <div className="w-full flex items-end gap-2">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        // style={{ height: height, resize: 'none' }}
        placeholder="Message..."
        className="w-full max-md:w-[calc(100%-38px)] h-[64px] max-md:h-[38px] min-h-[64px] max-md:min-h-[38px] max-h-[132px] max-md:text-sm backdrop-blur-md bg-primary_comp dark:bg-dark_primary_comp rounded-xl p-4 max-md:p-2 dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn overflow-auto focus:outline-none"
      />
      <ArrowRight
        onClick={handleSubmit}
        className="bg-primary_comp dark:bg-dark_primary_comp_hover p-2 rounded-full md:hidden"
        size={38}
      />
    </div>
  );
};

export default ChatTextarea;
