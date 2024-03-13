import Loader from '@/components/common/loader';
import GroupChatCard from '@/components/messaging/group_chat_card';
import { SERVER_ERROR } from '@/config/errors';
import { MESSAGING_URL, PROJECT_PIC_URL } from '@/config/routes';
import socketService from '@/config/ws';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { GroupChat, Project } from '@/types';
import { sortGroupChats } from '@/utils/funcs/sort_chats';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { ArrowArcLeft } from '@phosphor-icons/react';
import NoChats from '@/components/fillers/chats';

const Project = () => {
  const [chats, setChats] = useState<GroupChat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayChats, setDisplayChats] = useState<GroupChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);

  const currentChats = useSelector(userSelector).chats;

  const fetchChats = async () => {
    setLoading(true);
    const URL = `${MESSAGING_URL}/project`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setChats(sortGroupChats(res.data.chats || []));
      setProjects(res.data.projects || []);
      setFilteredChats(res.data.chats || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const filterChats = (search: string | null) => {
    if (!search || search == '') setFilteredChats(chats);
    else
      setFilteredChats(
        chats.filter(chat => {
          if (chat.title.match(new RegExp(search, 'i'))) return true;
          else if (chat.project.title.match(new RegExp(search, 'i'))) return true;
          return false;
        })
      );
  };

  useEffect(() => {
    fetchChats();
    socketService.setupGroupChatListRoutes(setChats);
  }, [currentChats]);

  useEffect(() => {
    filterChats(new URLSearchParams(window.location.search).get('search'));
  }, [window.location.search]);

  return (
    <div className="w-full flex flex-col gap-2 p-2">
      {loading ? (
        <Loader />
      ) : (
        <>
          {!new URLSearchParams(window.location.search).get('search') ? (
            <>
              {chats.length > 0 ? (
                <>
                  {displayChats.length > 0 ? (
                    <>
                      <div className="">
                        <ArrowArcLeft
                          className="cursor-pointer"
                          onClick={() => {
                            setDisplayChats([]);
                          }}
                          size={32}
                        />
                      </div>
                      {displayChats.map(chat => {
                        return <GroupChatCard key={chat.id} chat={chat} />;
                      })}
                    </>
                  ) : (
                    <>
                      {projects.map(project => {
                        return (
                          <div
                            key={project.id}
                            onClick={() => {
                              setDisplayChats(chats.filter(chat => chat.projectID == project.id));
                            }}
                            className="w-full font-primary hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg p-4 flex items-center gap-6 max-lg:gap-4 transition-ease-300 cursor-pointer"
                          >
                            <Image
                              crossOrigin="anonymous"
                              width={100}
                              height={100}
                              alt={'User Pic'}
                              src={`${PROJECT_PIC_URL}/${project.coverPic}`}
                              className={'w-[90px] h-[90px] max-lg:w-[60px] max-lg:h-[60px] rounded-lg object-cover'}
                              placeholder="blur"
                              blurDataURL={project.blurHash || 'no-hash'}
                            />

                            <div className="grow flex flex-col gap-2">
                              <div className="font-bold text-3xl max-lg:text-lg text-gradient">{project.title}</div>
                              <div className="max-lg:text-sm">
                                {chats.filter(chat => chat.projectID == project.id).length} Chat
                                {chats.filter(chat => chat.projectID == project.id).length != 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <NoChats />
              )}
            </>
          ) : (
            <>
              {filteredChats.length > 0 ? (
                <>
                  {filteredChats.map(chat => {
                    return <GroupChatCard key={chat.id} chat={chat} />;
                  })}
                </>
              ) : (
                <NoChats />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Project;
