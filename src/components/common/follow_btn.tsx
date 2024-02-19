import { CONNECTION_URL } from '@/config/routes';
import socketService from '@/config/ws';
import getHandler from '@/handlers/get_handler';
import { configSelector, setUpdatingFollowing } from '@/slices/configSlice';
import { setFollowing, userSelector } from '@/slices/userSlice';
import Semaphore from '@/utils/semaphore';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  setFollowerCount?: React.Dispatch<React.SetStateAction<number>>;
  toFollowID: string;
  smaller?: boolean;
  profileDesign?: boolean;
}

const FollowBtn = ({ toFollowID, setFollowerCount, smaller = false, profileDesign = false }: Props) => {
  const following = useSelector(userSelector).following;

  const [isFollowing, setIsFollowing] = useState<boolean>(following.includes(toFollowID));

  const updatingFollowing = useSelector(configSelector).updatingFollowing;
  const dispatch = useDispatch();

  const user = useSelector(userSelector);

  const semaphore = new Semaphore(updatingFollowing, setUpdatingFollowing);

  const submitHandler = async () => {
    await semaphore.acquire();

    const newFollowing = [...following];
    if (setFollowerCount) {
      if (isFollowing) {
        setFollowerCount(prev => prev - 1);
      } else {
        setFollowerCount(prev => prev + 1);
      }
    }
    setIsFollowing(prev => !prev);

    const res = await getHandler(`${CONNECTION_URL}/${isFollowing ? 'un' : ''}follow/${toFollowID}`);
    if (res.statusCode === 200) {
      if (isFollowing) {
        newFollowing.splice(newFollowing.indexOf(toFollowID), 1);
      } else {
        newFollowing.push(toFollowID);
        socketService.sendNotification(toFollowID, `${user.name} started following you!`);
      }
      dispatch(setFollowing(newFollowing));
    } else {
      if (setFollowerCount) {
        if (isFollowing) {
          setFollowerCount(prev => prev + 1);
        } else {
          setFollowerCount(prev => prev - 1);
        }
      }
      setIsFollowing(prev => !prev);
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
    }

    semaphore.release();
  };

  return (
    <>
      {toFollowID !== user.id ? (
        profileDesign ? (
          <button
            onClick={submitHandler}
            className={`border hover:scale-90 duration-300 relative group cursor-pointer text-white bg-white overflow-hidden h-12 w-36 rounded-xl p-2 flex justify-center items-center`}
          >
            <div className="absolute right-32 -top-4 scale-125 group-hover:top-1 group-hover:right-2 z-10 w-36 h-36 rounded-full group-hover:scale-150  delay-75 duration-500 bg-[#6661c7]"></div>
            <div className="absolute right-3 -top-4 scale-125 group-hover:top-1 group-hover:right-2 z-10 w-24 h-24 rounded-full group-hover:scale-150  delay-150 duration-500 bg-[#ada9ff]"></div>
            <div className="absolute -right-10 top-0 group-hover:top-1 group-hover:right-2 z-10 w-20 h-20 rounded-full group-hover:scale-150  delay-200 duration-500 bg-[#cea9ff]"></div>
            <div className="absolute right-20 -top-8 scale-75 group-hover:top-1 group-hover:right-2 z-10 w-16 h-16 rounded-full group-hover:scale-125  delay-300 duration-500 bg-[#df96ff]"></div>
            <div
              className={`w-[96%] h-[90%] bg-gray-50 ${
                isFollowing ? 'opacity-100' : 'opacity-0'
              } absolute rounded-xl z-10 transition-ease-500`}
            ></div>
            <p className={`z-10 ${isFollowing ? 'font-bold' : 'font-extrabold'} transition-ease-500`}>
              {isFollowing ? (
                <>
                  <div className="absolute -translate-x-1/2 -translate-y-3 group-hover:-translate-y-12 text-gradient transition-ease-out-300">
                    Following
                  </div>
                  <div className="absolute -translate-x-1/2 translate-y-12 group-hover:-translate-y-3 text-gradient transition-ease-out-300">
                    UnFollow?
                  </div>
                </>
              ) : (
                <div className="">Follow</div>
              )}
            </p>
          </button>
        ) : (
          <div
            onClick={submitHandler}
            className={`${
              isFollowing
                ? `${smaller ? 'w-20' : 'w-24'} border-2 border-gray-500 text-gray-600 dark:border-dark_primary_btn`
                : `${smaller ? 'w-16' : 'w-20'} bg-zinc-800 dark:bg-purple-950 text-white`
            } h-8 rounded-3xl flex justify-center items-center cursor-pointer ${
              smaller ? 'text-xs' : 'text-sm'
            } transition-ease-150`}
          >
            {isFollowing ? 'following' : 'follow'}
          </div>
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default FollowBtn;
