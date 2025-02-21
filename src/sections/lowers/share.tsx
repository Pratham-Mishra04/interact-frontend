import CopyClipboardButton from '@/components/buttons/copy_clipboard_btn';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { GROUP_CHAT_PIC_URL, MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import { Chat } from '@/types';
import { getMessagingUser } from '@/utils/funcs/messaging';
import Toaster from '@/utils/toaster';
import { X } from '@phosphor-icons/react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import React, { ReactNode, useEffect, useState } from 'react';

interface Props {
  item: ReactNode;
  itemType: string;
  itemID: string;
  clipboardURL: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Share = ({ item, itemType, itemID, clipboardURL, setShow }: Props) => {
  const userID = Cookies.get('id');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userID === '') {
      Toaster.error('You are not logged In.');
      return;
    }

    const URL = `${MESSAGING_URL}/me`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const chatsData: Chat[] = res.data.chats;

          setChats((chatsData || []).filter(chat => chat.isAccepted));
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
  }, [item]);

  useEffect(() => {
    if ((document.documentElement.style.overflowY = 'auto')) {
      document.documentElement.style.overflowY = 'hidden';
      document.documentElement.style.height = '100vh';

      return () => {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
      };
    }
  }, []);

  interface FormData {
    content: string;
    chats: string[];
    postID?: string;
    projectID?: string;
    openingID?: string;
    announcementID?: string;
    profileID?: string;
    eventID?: string;
  }

  const handleSubmit = async () => {
    if (selectedChats.length == 0) {
      setShow(false);
      return;
    }
    const toaster = Toaster.startLoad(`Sharing ${itemType}..`);
    const URL = `/share/${itemType}/`;

    const formData: FormData = {
      content: message.trim(),
      chats: selectedChats,
    };

    switch (itemType) {
      case 'post':
        formData['postID'] = itemID;
        break;
      case 'project':
        formData['projectID'] = itemID;
        break;
      case 'opening':
        formData['openingID'] = itemID;
        break;
      case 'announcement':
        formData['announcementID'] = itemID;
        break;
      case 'profile':
        formData['profileID'] = itemID;
        break;
      case 'event':
        formData['eventID'] = itemID;
        break;
      default:
        break;
    }

    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, `${itemType} Shared!`, 1);
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleSelectChat = (chatID: string) => {
    if (selectedChats.includes(chatID)) setSelectedChats(prev => prev.filter(id => id != chatID));
    else setSelectedChats([...selectedChats, chatID]);
  };

  return (
    <>
      <div className="w-1/2 max-h-[75%] max-md:h-4/5 overflow-y-auto max-lg:w-5/6 fixed backdrop-blur-lg bg-[#ffffff] dark:bg-dark_primary_comp z-50 translate-x-1/2 -translate-y-1/4 max-md:-translate-y-1/2 top-64 max-md:top-1/2 right-1/2 flex flex-col px-8 py-8 gap-2 border-2 border-primary_btn dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div onClick={() => setShow(false)} className="md:hidden absolute top-2 right-2">
          <X size={24} weight="bold" />
        </div>
        <div className="text-3xl capitalize text-center text-gray-900 dark:text-white font-bold">
          Share this {itemType}
        </div>
        <div className="w-full flex max-md:flex-col mt-4 gap-4">
          <div className="w-1/2 max-md:w-full flex flex-col gap-2">
            {item}
            <CopyClipboardButton url={clipboardURL} />
          </div>
          <div className="w-1/2 max-md:w-full md:max-h-[400px] overflow-y-auto flex flex-col justify-between gap-2">
            {loading ? (
              <Loader />
            ) : chats.length > 0 ? (
              <>
                <div className="w-full flex flex-col gap-2">
                  {chats.map(chat => {
                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          handleSelectChat(chat.id);
                        }}
                        className={`w-full flex-center gap-2 rounded-lg py-2 px-2 cursor-pointer ${
                          selectedChats.includes(chat.id)
                            ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                            : 'hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover'
                        } transition-all ease-in-out duration-200`}
                      >
                        {chat.isGroup ? (
                          <>
                            <Image
                              crossOrigin="anonymous"
                              width={50}
                              height={50}
                              alt={'User Pic'}
                              src={`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`}
                              className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                            />
                            <div className="w-5/6 h-fit flex flex-col">
                              <div className="text-lg font-bold">{chat.title}</div>
                              {chat.projectID ? (
                                <div className="text-sm">@{chat.project?.title}</div>
                              ) : (
                                chat.organizationID && (
                                  <div className="text-sm">@{chat.organization?.user?.username}</div>
                                )
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <Image
                              crossOrigin="anonymous"
                              width={50}
                              height={50}
                              alt={'User Pic'}
                              src={`${USER_PROFILE_PIC_URL}/${getMessagingUser(chat).profilePic}`}
                              className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                            />
                            <div className="w-5/6 flex flex-col">
                              <div className="text-lg font-bold">{getMessagingUser(chat).name}</div>
                              <div className="text-sm">@{getMessagingUser(chat).username}</div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="w-full flex flex-col gap-1">
                  <textarea
                    className="bg-primary_comp dark:bg-dark_primary_comp_hover text-sm focus:outline-none p-2 rounded-xl min-h-[6rem] max-h-64"
                    placeholder="Add a message"
                    value={message}
                    onChange={el => setMessage(el.target.value)}
                  />
                  <div
                    onClick={handleSubmit}
                    className="w-full text-center py-2 rounded-lg border-[1px] bg-primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active border-[#ffe1fc10] dark:border-dark_primary_btn dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active cursor-pointer transition-ease-200"
                  >
                    Send Message
                  </div>
                </div>
              </>
            ) : (
              <div className="font-medium text-xl m-auto">No chat present :(</div>
            )}
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

export default Share;
