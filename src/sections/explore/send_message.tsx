import UserCard from '@/components/cards/user';
import { SERVER_ERROR } from '@/config/errors';
import { MESSAGING_URL } from '@/config/routes';
import socketService from '@/config/ws';
import postHandler from '@/handlers/post_handler';
import { setPersonalChatSlices, userSelector } from '@/slices/userSlice';
import { User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  user: User;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendMessage = ({ user, setShow }: Props) => {
  const [message, setMessage] = useState('');

  const chatSlices = useSelector(userSelector).personalChatSlices;
  const currentChats = useSelector(userSelector).chats;

  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (message.trim().length == 0) {
      Toaster.error('Message cannot be empty');
      return;
    }
    const toaster = Toaster.startLoad('Sending Message..');
    const URL = `${MESSAGING_URL}/chat/`;
    const formData = {
      userID: user.id,
    };
    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const chatID = res.data.chat?.id;
      dispatch(setPersonalChatSlices([...chatSlices, { chatID, userID: user.id }]));
      socketService.setupChats([...currentChats, ...chatID]);

      const MESSAGE_URL = `${MESSAGING_URL}/content/`;
      const messageFormData = {
        chatID,
        content: message,
      };

      const messageRes = await postHandler(MESSAGE_URL, messageFormData);

      if (messageRes.statusCode == 201) {
        Toaster.stopLoad(toaster, 'Message Sent', 1);
        setShow(false);
      } else {
        if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
        else {
          Toaster.stopLoad(toaster, SERVER_ERROR, 0);
        }
      }
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  return (
    <>
      <div className="w-1/2 max-md:w-5/6 fixed backdrop-blur-lg bg-white dark:bg-dark_primary_comp dark:max-md:bg-[#2a192eea] dark:text-white z-30 translate-x-1/2 -translate-y-1/4 top-64 max-lg:top-1/4 max-md:top-56 right-1/2 flex flex-col px-8 py-8 gap-6 border-2 border-primary_btn  dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div className="text-4xl text-center text-primary_black dark:text-white font-bold">Message</div>
        <div className="w-full flex max-md:flex-col gap-4 items-center">
          <div className="w-1/2 max-md:w-full">
            <UserCard user={user} />
          </div>
          <div className="w-1/2 max-md:w-full h-full max-h-base_md overflow-auto flex flex-col gap-2">
            <form onSubmit={el => handleSubmit(el)} className="w-full flex flex-col gap-1">
              <textarea
                className="bg-primary_comp dark:bg-dark_primary_comp_hover text-sm focus:outline-none p-2 rounded-xl min-h-[16rem] max-h-64"
                placeholder="Add a message"
                value={message}
                onChange={el => setMessage(el.target.value)}
              />
              <button
                type="submit"
                className="w-full text-center py-2 rounded-lg border-[1px] border-primary_btn dark:border-dark_primary_btn bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active cursor-pointer transition-ease-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default SendMessage;
