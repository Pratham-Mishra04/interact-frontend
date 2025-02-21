import React, { useEffect, useState } from 'react';
import getHandler from '@/handlers/get_handler';
import {
  COMMUNITY_COVER_PIC_URL,
  COMMUNITY_PROFILE_PIC_URL,
  EVENT_PIC_URL,
  EXPLORE_URL,
  USER_PROFILE_PIC_URL,
} from '@/config/routes';
import { Community, Opening, Organization, Project, User, Event } from '@/types';
import Image from 'next/image';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { cn } from '@/lib/utils';
import Separator from '@/components/ui/separator';
import { Eye, Heart, Users } from '@phosphor-icons/react';
import moment from 'moment';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';

interface HovercardProps {
  id: string;
  category: string;
}

export const idType = {
  users: 'uid',
  communities: 'cid',
  events: 'eid',
  openings: 'oid',
  projects: 'pid',
  orgs: 'orgid',
};

const fetchItem = async (id: string, category: string): Promise<any> => {
  const res = await getHandler(
    `${EXPLORE_URL}/quick/item?${idType[category as keyof typeof idType]}=${id}`,
    undefined,
    true
  );
  return res.data;
};

const MentionHoverCard = ({ id, category }: HovercardProps) => {
  const [hoverCardData, setHoverCardData] = useState<any | null>(null);

  useEffect(() => {
    fetchItem(id, category).then(data => {
      switch (category) {
        case 'users':
          setHoverCardData(data.user);
          break;
        case 'projects':
          setHoverCardData(data.project);
          break;
        case 'communities':
          setHoverCardData(data.community);
          break;
        case 'orgs':
          setHoverCardData(data.organization);
          break;
        case 'events':
          setHoverCardData(data.event);
          break;
        case 'openings':
          setHoverCardData(data.opening);
          break;
      }
    });
  }, [id, category]);

  if (!hoverCardData) return <></>;

  switch (category) {
    case 'users':
      return <UserCard user={hoverCardData} />;
    case 'projects':
      return <ProjectCard project={hoverCardData} />;
    case 'communities':
      return <CommunityCard community={hoverCardData} />;
    case 'orgs':
      return <OrganisationCard organisation={hoverCardData} />;
    case 'events':
      return <EventCard event={hoverCardData} />;
    case 'openings':
      return <OpeningCard opening={hoverCardData} />;
    default:
      return <></>;
  }
};

const HoverCardWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        'min-w-[240px] bg-zinc-100 dark:bg-zinc-800 z-50 rounded-md border dark:border-zinc-900 p-3 text-popover-foreground shadow-lg dark:shadow-neutral-900 outline-none',
        className
      )}
    >
      {children}
    </div>
  );
};

const UserCard = ({ user }: { user: User }) => {
  return (
    <HoverCardWrapper className="flex justify-between gap-4">
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
        className="w-10 h-10 rounded-full mt-1"
        placeholder="blur"
        blurDataURL={user.profilePicBlurHash || 'no-hash'}
      />
      <div className="w-[calc(100%-40px)]">
        <div className="w-fit flex-center gap-1">
          <h4 className="text-lg font-semibold">{user.name}</h4>
          <h4 className="text-xs font-medium text-gray-500">@{user.username}</h4>
        </div>
        <p className="text-sm">{user.tagline}</p>
        <div className="text-xs text-muted-foreground font-medium mt-2">
          {user.noFollowers} Follower{user.noFollowers !== 1 && 's'}
        </div>
      </div>
    </HoverCardWrapper>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <HoverCardWrapper className="w-72 space-y-2">
      <Image
        src={getProjectPicURL(project)}
        alt="Project Pic"
        width={100}
        height={80}
        className="w-full rounded-md"
        placeholder="blur"
        blurDataURL={getProjectPicHash(project)}
      />
      <div className="space-y-2">
        <div>
          <div className="text-xl font-semibold">{project.title}</div>
          <div className="text-sm text-neutral-800 dark:text-neutral-500">{project.tagline}</div>
          <div className="text-xs text-neutral-800 dark:text-neutral-500 mt-2">By {project.user?.name}</div>
        </div>
        <Separator />
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="flex-center gap-2 text-xs">
              <Users size={18} />
              {project.noMembers}
            </div>
            <div className="flex-center gap-2 text-xs">
              <Eye size={18} />
              {project.noImpressions}
            </div>
          </div>
          <div className="flex-center gap-2 text-xs">{project.noMembers} Members</div>
        </div>
      </div>
    </HoverCardWrapper>
  );
};

const OpeningCard = ({ opening }: { opening: Opening }) => {
  return (
    <HoverCardWrapper className="w-72 space-y-2">
      <Image
        src={getProjectPicURL(opening.project)}
        alt="Project Pic"
        width={100}
        height={80}
        className="w-full rounded-md"
        placeholder="blur"
        blurDataURL={getProjectPicHash(opening.project)}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-1 flex-wrap">
          <div className="text-2xl font-semibold">{opening.title}</div>
          <div className="text-xs text-neutral-800 dark:text-neutral-500">@{opening.project?.title}</div>
        </div>
        <div className="text-sm text-neutral-800 dark:text-neutral-300 line-clamp-3">{opening.description}</div>
        <div className="text-xs text-neutral-800 dark:text-neutral-500 mt-2">
          Posted {moment(opening.createdAt).fromNow()}
        </div>
      </div>
    </HoverCardWrapper>
  );
};

const CommunityCard = ({ community }: { community: Community }) => {
  return (
    <HoverCardWrapper className="relative">
      <Image
        crossOrigin="anonymous"
        width={600}
        height={100}
        alt="Community Pic"
        placeholder="blur"
        blurDataURL={community.coverPicBlurHash || 'no-hash'}
        src={`${COMMUNITY_COVER_PIC_URL}/${community.coverPic}`}
        className="w-full h-full absolute rounded-lg opacity-10 top-0 right-0"
      />
      <div className="w-full flex gap-2 items-center z-10">
        <Image
          crossOrigin="anonymous"
          width={50}
          height={50}
          alt="Community Pic"
          placeholder="blur"
          blurDataURL={community.profilePicBlurHash || 'no-hash'}
          src={`${COMMUNITY_PROFILE_PIC_URL}/${community.profilePic}`}
          className="w-10 h-10 rounded-full"
        />
        <div className="w-[calc(100%-40px)] h-10 flex flex-col">
          <div className="w-full font-semibold line-clamp-1">{community.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{community.noMembers} Members</div>
        </div>
        {/* <CommunityJoinBtn communityID={community.id} communityAccess={community.access} /> */}
      </div>
      <div className="w-full text-xs font-medium z-10 mt-2">{community.tagline}</div>
    </HoverCardWrapper>
  );
};

const OrganisationCard = ({ organisation }: { organisation: Organization }) => {
  return (
    <HoverCardWrapper className="flex justify-between gap-4">
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${organisation.user?.profilePic}`}
        className="w-10 h-10 rounded-full mt-1"
        blurDataURL={organisation.user?.profilePicBlurHash || 'no-hash'}
      />
      <div className="w-[calc(100%-40px)]">
        <div className="w-fit flex-center gap-1">
          <h4 className="text-lg font-semibold">{organisation.title}</h4>
          <h4 className="text-xs font-medium text-gray-500">@{organisation.user?.username}</h4>
        </div>
        <p className="text-sm">{organisation.user?.tagline}</p>
        <div className="text-xs text-muted-foreground font-medium mt-2">
          {organisation.user?.noFollowers} Follower{organisation.user?.noFollowers !== 1 && 's'}
        </div>
      </div>
    </HoverCardWrapper>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  return (
    <HoverCardWrapper className="w-72 space-y-2">
      <Image
        src={`${EVENT_PIC_URL}/${event.coverPic}`}
        alt="Event Pic"
        width={100}
        height={30}
        className="w-full rounded-md"
        placeholder="blur"
        blurDataURL={
          event.blurHash
            ? event.blurHash == 'no-hash'
              ? EVENT_PIC_HASH_DEFAULT
              : event.blurHash
            : EVENT_PIC_HASH_DEFAULT
        }
      />
      <div className="space-y-2">
        <div>
          <div className="text-xl font-semibold">{event.title}</div>
          <div className="text-sm text-neutral-800 dark:text-neutral-500">{event.tagline}</div>
          <div className="text-xs text-neutral-800 dark:text-neutral-500 mt-2">By {event.organization?.title}</div>
        </div>
        <Separator />
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="flex-center gap-2 text-xs">
              <Heart size={18} />
              {event.noLikes}
            </div>
            <div className="flex-center gap-2 text-xs">
              <Eye size={18} />
              {event.noImpressions}
            </div>
          </div>
          <div className="text-xs text-neutral-800 dark:text-neutral-500 mt-2">
            {moment(event.endTime).isBefore() ? 'Held' : moment(event.startTime).isBefore() ? 'Started' : 'Starts'}{' '}
            {moment(event.startTime).fromNow()}
          </div>
        </div>
      </div>
    </HoverCardWrapper>
  );
};

export default MentionHoverCard;
