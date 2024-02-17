import { USER_PROFILE_PIC_URL } from '@/config/routes';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { initialUser } from '@/types/initials';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { ArrowDownLeft, PencilSimple } from '@phosphor-icons/react';
import Loader from '@/components/common/loader';
import ProfileCardLoader from '@/components/loaders/feed_profile_card';
import Connections from '../explore/connections_view';
import { SERVER_ERROR } from '@/config/errors';
import getDomainName from '@/utils/funcs/get_domain_name';
import getIcon from '@/utils/funcs/get_icon';

const ProfileCard = () => {
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [clickedOnFollowers, setClickedOnFollowers] = useState(false);
  const [clickedOnFollowing, setClickedOnFollowing] = useState(false);

  const fetchUser = () => {
    const URL = `/users/me`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUser(res.data.user);
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

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      {clickedOnFollowers ? <Connections type="followers" user={user} setShow={setClickedOnFollowers} /> : <></>}
      {clickedOnFollowing ? <Connections type="following" user={user} setShow={setClickedOnFollowing} /> : <></>}
      {loading ? (
        <ProfileCardLoader />
      ) : (
        <div
          className={`${
            open
              ? 'w-[24vw] h-[75vh] pb-4 gap-4 pt-8 px-4 top-[150px] overflow-y-auto'
              : 'w-[48px] h-[48px] pb-0 gap-0 pt-12 px-0 top-[90px] hover:shadow-lg overflow-y-hidden'
          } shadow-md dark:shadow-none transition-ease-500 sticky overflow-x-hidden font-primary flex flex-col dark:text-white items-center bg-white dark:bg-[#84478023] backdrop-blur-md border-[1px] border-gray-300 dark:border-dark_primary_btn max-lg:hidden rounded-md`}
        >
          <ArrowDownLeft
            onClick={() => setOpen(prev => !prev)}
            className={`absolute ${
              open ? 'top-0 right-0' : 'top-2 right-2 rotate-180'
            } text-gray-500 dark:text-white transition-ease-500 cursor-pointer`}
            size={32}
          />
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="relative">
                <Link
                  href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=profilePic`}
                  className={`${
                    open ? 'w-44 h-44' : 'w-0 h-0'
                  } absolute top-0 right-0 rounded-full flex-center bg-white transition-ease-200 cursor-pointer opacity-0 hover:opacity-50`}
                >
                  <PencilSimple color="black" size={32} />
                </Link>
                <Image
                  crossOrigin="anonymous"
                  priority={true}
                  width={200}
                  height={200}
                  alt={'User Pic'}
                  src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                  className={`rounded-full ${
                    open ? 'w-44 h-44' : 'w-0 h-0'
                  } border-gray-500 border-[1px] dark:border-0 transition-ease-500 cursor-default`}
                />
              </div>

              <Link
                href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=name`}
                className="w-full relative group rounded-lg flex-center p-2 hover:bg-primary_comp cursor-pointer transition-ease-300"
              >
                <PencilSimple className="absolute opacity-0 group-hover:opacity-100 top-2 right-2 transition-ease-300" />
                <div
                  className={`${
                    open ? 'text-3xl' : 'text-xxs'
                  } transition-ease-500 text-center font-bold text-gradient`}
                >
                  {user.name}
                </div>{' '}
              </Link>

              <div
                className={`w-full ${
                  open ? 'text-base gap-6' : 'text-xxs gap-0'
                } transition-ease-500 flex justify-center`}
              >
                <div onClick={() => setClickedOnFollowers(true)} className="flex gap-1 cursor-pointer">
                  <div className="font-bold">{user.noFollowers}</div>
                  <div>Follower{user.noFollowers != 1 ? 's' : ''}</div>
                </div>
                <div onClick={() => setClickedOnFollowing(true)} className="flex gap-1 cursor-pointer">
                  <div className="font-bold">{user.noFollowing}</div>
                  <div>Following</div>
                </div>
              </div>

              <div className="w-full h-[1px] border-t-[1px] border-gray-500 border-dashed"></div>

              <Link
                href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=bio`}
                className={`w-full relative group rounded-lg flex-center p-4 ${
                  user.bio.trim() == '' ? 'bg-primary_comp' : 'hover:bg-primary_comp'
                } cursor-pointer transition-ease-300`}
              >
                <PencilSimple
                  className={`absolute opacity-0 ${
                    user.bio.trim() == '' ? 'opacity-100' : 'group-hover:opacity-100'
                  } top-2 right-2 transition-ease-300`}
                />
                {user.bio.trim() == '' ? (
                  <div className="text-gray-400">Click here to add a bio!</div>
                ) : (
                  <div className={`text-center text-sm cursor-pointer line-clamp-3`}>{user.bio}</div>
                )}
              </Link>

              <div className="w-full">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Skills</div>

                <Link
                  href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=tags`}
                  className={`w-full relative group rounded-lg flex-center p-4 ${
                    !user.tags || user.tags?.length == 0 ? 'bg-primary_comp' : 'hover:bg-primary_comp'
                  } cursor-pointer transition-ease-300`}
                >
                  <PencilSimple
                    className={`absolute opacity-0 ${
                      !user.tags || user.tags?.length == 0 ? 'opacity-100' : 'group-hover:opacity-100'
                    } top-2 right-2 transition-ease-300`}
                  />
                  {!user.tags || user.tags?.length == 0 ? (
                    <div className="text-gray-400">Click here to add Skills!</div>
                  ) : (
                    <div
                      className={`w-full flex flex-wrap items-center ${
                        user.tags?.length == 1 ? 'justify-start' : 'justify-center'
                      } gap-2`}
                    >
                      {user.tags &&
                        user.tags
                          .filter((_, i) => {
                            return i >= 0 && i < 5;
                          })
                          .map(tag => {
                            return (
                              <div
                                className="flex-center text-xs px-2 py-1 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-full cursor-pointer"
                                key={tag}
                              >
                                {tag}
                              </div>
                            );
                          })}
                      {user.tags && user.tags.length > 5 ? (
                        <div className="flex-center text-sm p-2 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-full cursor-pointer">
                          +{user.tags.length - 5}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </Link>
              </div>

              <div className="w-full">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Links</div>

                <Link
                  href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=links`}
                  className={`w-full relative group rounded-lg flex-center p-4 ${
                    !user.links || user.links?.length == 0 ? 'bg-primary_comp' : 'hover:bg-primary_comp'
                  } cursor-pointer transition-ease-300`}
                >
                  <PencilSimple
                    className={`absolute opacity-0 ${
                      !user.links || user.links?.length == 0 ? 'opacity-100' : 'group-hover:opacity-100'
                    } top-2 right-2 transition-ease-300`}
                  />
                  {!user.links || user.links?.length == 0 ? (
                    <div className="text-gray-400">Click here to add Links!</div>
                  ) : (
                    <div
                      className={`w-full h-fit flex flex-wrap items-center ${
                        user.links?.length == 1 ? 'justify-start' : 'justify-center'
                      } gap-2`}
                    >
                      {user.links &&
                        user.links
                          .filter((_, i) => {
                            return i >= 0 && i < 3;
                          })
                          .map((link, index) => {
                            return (
                              <div
                                key={index}
                                className="w-fit h-8 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg text-sm px-2 py-4 flex items-center gap-2"
                              >
                                {getIcon(getDomainName(link), 24)}
                                <div className="capitalize">{getDomainName(link)}</div>
                              </div>
                            );
                          })}
                      {user.links && user.links.length > 3 ? (
                        <div className="w-fit h-8 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg text-sm px-2 py-4 flex items-center gap-2">
                          +{user.links.length - 3}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileCard;
