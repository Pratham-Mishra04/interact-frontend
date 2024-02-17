import { USER_PROFILE_PIC_URL } from '@/config/routes';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Announcement, Option, Poll, Post } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { configSelector, setUpdatingOptions } from '@/slices/configSlice';
import { userSelector, setVotedOptions } from '@/slices/userSlice';
import { initialUser } from '@/types/initials';
import Semaphore from '@/utils/semaphore';
import Toaster from '@/utils/toaster';

interface Props {
  option: Option;
  totalVotes: number;
  orgID: string;
  pollID: string;
  setPolls?: React.Dispatch<React.SetStateAction<Poll[] | (Poll | Announcement)[] | (Post | Poll | Announcement)[]>>;
}

const Option = ({ option, totalVotes, orgID, pollID, setPolls }: Props) => {
  const [isVoted, setIsVoted] = useState(false);

  const user = useSelector(userSelector);

  const votedOptions = user.votedOptions || [];

  useEffect(() => {
    if (votedOptions.includes(option.id)) setIsVoted(true);
  }, [option]);

  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setBarWidth(totalVotes == 0 ? 0 : (option.noVotes * 100) / totalVotes);
  }, [totalVotes, option]);

  const dispatch = useDispatch();

  const userID = user.id;

  const updatingOptionVotes = useSelector(configSelector).updatingOptions;

  const semaphore = new Semaphore(updatingOptionVotes, setUpdatingOptions);

  const handleVoteOption = async (option: Option, setIsVoted: React.Dispatch<React.SetStateAction<boolean>>) => {
    await semaphore.acquire();

    const URL = `${ORG_URL}/${orgID}/polls/vote/${pollID}/${option.id}`;

    const res = await patchHandler(URL, {});
    if (res.statusCode == 200) {
      if (setPolls)
        setPolls(prev =>
          prev.map(p => {
            if (p.id == pollID && 'totalVotes' in p) {
              const newUser = initialUser;
              newUser.id = user.id;
              newUser.name = user.name;
              newUser.username = user.username;
              newUser.profilePic = user.profilePic;

              return {
                ...p,
                totalVotes: p.totalVotes + 1,
                options: p.options.map(o => {
                  if (o.id == option.id)
                    return { ...o, noVotes: o.noVotes + 1, votedBy: [...(o.votedBy || []), newUser] };
                  return o;
                }),
              };
            } else return p;
          })
        );
      dispatch(setVotedOptions([...votedOptions, option.id]));
      setIsVoted(true);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
    }

    semaphore.release();
  };

  const handleUnVoteOption = async (option: Option, setIsVoted: React.Dispatch<React.SetStateAction<boolean>>) => {
    await semaphore.acquire();

    const URL = `${ORG_URL}/${orgID}/polls/unvote/${pollID}/${option.id}`;

    const res = await patchHandler(URL, {});
    if (res.statusCode == 200) {
      if (setPolls)
        setPolls(prev =>
          prev.map(p => {
            if (p.id == pollID && 'totalVotes' in p)
              return {
                ...p,
                totalVotes: p.totalVotes - 1,
                options: p.options.map(o => {
                  if (o.id == option.id)
                    return { ...o, noVotes: o.noVotes - 1, votedBy: (o.votedBy || []).filter(u => u.id != userID) };
                  return o;
                }),
              };
            else return p;
          })
        );
      const newVotedOptions = [...votedOptions];
      newVotedOptions.splice(newVotedOptions.indexOf(option.id), 1);
      dispatch(setVotedOptions(newVotedOptions));
      setIsVoted(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
    }

    semaphore.release();
  };

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full flex justify-between">
        <div>{option.content}</div>
        <div className="w-32 flex gap-1 relative">
          {option.votedBy
            ?.filter((u, index) => {
              return index >= 0 && index < 3;
            })
            .map((u, index) => {
              return (
                <Image
                  key={index}
                  crossOrigin="anonymous"
                  width={50}
                  height={50}
                  alt={'User Pic'}
                  src={`${USER_PROFILE_PIC_URL}/${u.profilePic}`}
                  className={`w-6 h-6 rounded-full cursor-default absolute top-0 right-${index * 3} animate-fade_third`}
                />
              );
            })}
          {option.noVotes > 3 ? (
            <div className="bg-gray-100 flex-center border-[1px] border-primary_black text-xs text-medium w-6 h-6 rounded-full cursor-default absolute top-0 right-[36px]">
              +{option.noVotes - 3}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div
        onClick={() => {
          isVoted ? handleUnVoteOption(option, setIsVoted) : handleVoteOption(option, setIsVoted);
        }}
        className="w-full h-[15px] group max-md:hidden border-dark_primary_btn border-2 rounded-lg cursor-pointer"
      >
        <div
          style={{ width: `${barWidth}%` }}
          className={`h-full ${isVoted ? 'bg-[#9275b9]' : 'bg-[#e7d5ffba] group-hover:bg-[#cca5ffba]'} rounded-lg ${
            barWidth != 100 ? 'rounded-r-none' : ''
          } transition-ease-300`}
        ></div>
      </div>
    </div>
  );
};

export default Option;
