import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Organization, User } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import getDomainName from '@/utils/funcs/get_domain_name';
import Link from 'next/link';
import getIcon from '@/utils/funcs/get_icon';
import { useDispatch, useSelector } from 'react-redux';
import { setExploreTab } from '@/slices/feedSlice';
import FollowBtn from '@/components/common/follow_btn';
import { Buildings, Chat, Share, Warning } from '@phosphor-icons/react';
import ShareProfile from '../lowers/share';
import { userIDSelector, userSelector } from '@/slices/userSlice';
import SendMessage from './send_message';
import { setCurrentChatID } from '@/slices/messagingSlice';
import Connections from './connections_view';
import Report from '@/components/common/report';
import SignUp from '@/components/common/signup_box';
import { initialOrganization } from '@/types/initials';
import UserCard from '@/components/cards/user';
import { SidePrimeWrapper } from '@/wrappers/side';
import TooltipIcon from '@/components/common/tooltip_icon';

interface Props {
  user: User;
  organisation?: Organization;
  org?: boolean;
}

const ProfileCard = ({ user, organisation = initialOrganization, org = false }: Props) => {
  const dispatch = useDispatch();
  const [numFollowers, setNumFollowers] = useState(user.noFollowers);
  const [clickedOnShare, setClickedOnShare] = useState(false);
  const [clickedOnChat, setClickedOnChat] = useState(false);

  const [clickedOnFollowers, setClickedOnFollowers] = useState(false);
  const [clickedOnFollowing, setClickedOnFollowing] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const chatSlices = useSelector(userSelector).personalChatSlices;

  const handleChat = () => {
    var check = false;
    var chatID = '';
    chatSlices.forEach(chat => {
      if (chat.userID == user.id) {
        chatID = chat.chatID;
        check = true;
        return;
      }
    });
    if (check) {
      dispatch(setCurrentChatID(chatID));
      window.location.assign('/messaging');
    } else setClickedOnChat(true);
  };

  const userID = useSelector(userIDSelector) || '';

  return (
    <>
      {clickedOnShare &&
        (userID != '' ? (
          <ShareProfile
            itemID={user.id}
            itemType="profile"
            setShow={setClickedOnShare}
            clipboardURL={`/users/${user.username}?action=external`}
            item={<UserCard user={user} />}
          />
        ) : (
          <SignUp setShow={setClickedOnShare} />
        ))}
      {clickedOnChat &&
        (userID != '' ? <SendMessage user={user} setShow={setClickedOnChat} /> : <SignUp setShow={setClickedOnChat} />)}
      {clickedOnReport &&
        (userID != '' ? (
          <Report userID={user.id} setShow={setClickedOnReport} />
        ) : (
          <SignUp setShow={setClickedOnReport} />
        ))}

      {clickedOnFollowers && <Connections type="followers" user={user} setShow={setClickedOnFollowers} />}
      {clickedOnFollowing && (
        <Connections
          type={org ? 'members' : 'following'}
          user={user}
          setShow={setClickedOnFollowing}
          orgID={organisation.id}
          org={org}
        />
      )}

      <SidePrimeWrapper stickTop>
        <div className="w-full flex-center flex-col gap-4 py-2">
          <div className="relative w-48 h-48 rounded-full">
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
              placeholder="blur"
              blurDataURL={user.profilePicBlurHash || 'no-hash'}
              className="rounded-full max-lg:mx-auto w-48 h-48 cursor-default"
            />
            {user.isOrganization && (
              <div className="w-12 h-12 rounded-full absolute top-0 right-0 glassMorphism flex-center shadow-lg">
                <Buildings size={24} />
              </div>
            )}
          </div>

          <div className="text-3xl max-lg:text-2xl text-center font-bold text-gradient">{user.name}</div>

          <div className="w-full flex justify-center text-lg gap-6">
            <div onClick={() => setClickedOnFollowers(true)} className="flex gap-1 cursor-pointer">
              <div className="font-bold">{numFollowers}</div>
              <div>Follower{numFollowers != 1 ? 's' : ''}</div>
            </div>
            {org ? (
              <div onClick={() => setClickedOnFollowing(true)} className="flex gap-1 cursor-pointer">
                <div className="font-bold">{organisation.noMembers}</div>
                <div>Member{organisation.noMembers != 1 ? 's' : ''}</div>
              </div>
            ) : (
              <div onClick={() => setClickedOnFollowing(true)} className="flex gap-1 cursor-pointer">
                <div className="font-bold">{user.noFollowing}</div>
                <div>Following</div>
              </div>
            )}
          </div>

          {/* <div className="max-lg:text-sm text-center">{user.bio}</div> */}

          {userID != '' && <FollowBtn toFollowID={user.id} setFollowerCount={setNumFollowers} profileDesign={true} />}

          <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>

          <div className="w-full flex flex-col gap-8 mt-2">
            {user.tags && user.tags.length > 0 && (
              <div className="w-full flex flex-col gap-2">
                <div className="text-sm ml-1 font-medium uppercase text-gray-500">
                  {user.isOrganization ? 'Tags' : 'Skills'}
                </div>
                <div
                  className={`w-full flex flex-wrap items-center ${
                    user.tags.length == 1 ? 'justify-start' : 'justify-center'
                  } gap-2`}
                >
                  {user.tags &&
                    user.tags.map(tag => {
                      return (
                        <Link
                          href={`/users?search=` + tag}
                          target="_blank"
                          onClick={() => dispatch(setExploreTab(2))}
                          className="flex-center text-xs px-2 py-1 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-full cursor-pointer"
                          key={tag}
                        >
                          {tag}
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}

            {user.links && user.links.length > 0 && (
              <div className="w-full flex flex-col gap-2">
                <div className="text-sm ml-1 font-medium uppercase text-gray-500">Links</div>
                <div
                  className={`w-full h-fit flex flex-wrap items-center ${
                    user.links.length == 1 ? 'justify-start' : 'justify-center'
                  } gap-4`}
                >
                  {user.links &&
                    user.links.map((link, index) => {
                      return (
                        <Link
                          href={link}
                          target="_blank"
                          key={index}
                          className="w-fit h-8 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg text-sm px-2 py-4 flex items-center gap-2"
                        >
                          {getIcon(getDomainName(link), 24)}
                          <div className="capitalize">{getDomainName(link)}</div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
          <div className="dark:text-white w-fit absolute max-lg:mt-8 max-lg:static top-4 right-4 flex gap-2">
            {userID != user.id && (
              <TooltipIcon label="Message" onClick={handleChat} icon={<Chat size={18} />} includeBorder />
            )}
            <TooltipIcon
              label="Share"
              onClick={() => setClickedOnShare(true)}
              icon={<Share size={18} />}
              includeBorder
            />
            {userID != user.id && (
              <TooltipIcon
                label="Report"
                className="lg:hidden"
                onClick={() => setClickedOnReport(true)}
                icon={<Warning size={18} />}
                includeBorder
              />
            )}
          </div>
          <div className="absolute max-lg:hidden top-4 left-4">
            {userID != user.id && (
              <TooltipIcon
                label="Report"
                onClick={() => setClickedOnReport(true)}
                icon={<Warning size={18} />}
                includeBorder
              />
            )}
          </div>
        </div>
      </SidePrimeWrapper>
    </>
  );
};

export default ProfileCard;
