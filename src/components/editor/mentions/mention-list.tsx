import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useState } from 'react';
import Image from 'next/image';
import { FetchResponse } from '@/components/editor/mentions/mention-suggestions';
import { COMMUNITY_PROFILE_PIC_URL, EVENT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import Separator from '@/components/ui/separator';
import { Users } from '@phosphor-icons/react';
import { getProjectPicURL } from '@/utils/funcs/safe_extract';
import { Community, Event, Opening, Organization, Project, User } from '@/types';

type MentionNodeData = {
  id: string;
  category: string;
  label: string;
  href: string;
};

type MentionListProps = {
  items: FetchResponse[];
  command: (item: MentionNodeData) => void;
};

export type MentionListHandle = {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
};

const list = ['users', 'projects', 'openings', 'communities', 'orgs', 'events'];

const getSelectedType = (
  selectedIndex: number,
  items: FetchResponse | null | undefined
): keyof FetchResponse | null => {
  if (!items) return null;

  let offset = 0;
  for (const key of list) {
    const array = items[key as keyof FetchResponse] || [];
    if (selectedIndex < offset + array.length) {
      return key as keyof FetchResponse;
    }
    offset += array.length;
  }

  return null;
};

const MentionListItem = ({
  children,
  isSelected,
  onClick,
}: {
  children: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className={`w-full flex items-center justify-between gap-1 p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 ${
        isSelected ? 'bg-neutral-300 dark:bg-neutral-700' : ''
      } transition duration-150 ease-in-out`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const renderSection = (title: string, items: any[], renderItem: (item: any, index: number) => JSX.Element) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="text-sm font-medium mt-1">{title}</div>
      <Separator className="mb-1" />
      {items.map((item, index) => renderItem(item, index))}
    </>
  );
};

const MentionList = forwardRef<MentionListHandle, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const totalLength = props.items[0]
    ? Object.values(props.items[0]).reduce((acc, array) => {
        if (Array.isArray(array)) {
          const uniqueItems = new Set(array.map(item => JSON.stringify(item)));
          return acc + uniqueItems.size;
        }
        return acc;
      }, 0)
    : 0;

  const selectItem = (index: number) => {
    const type = getSelectedType(index, props.items[0]);
    if (!type) return;

    const offset = getOffset(type);
    const itemsOfType = props.items[0]?.[type] || [];
    const item = itemsOfType[index - offset];
    if (!item) return;

    const getHref = (type: keyof FetchResponse, item: any): string => {
      const hrefMap: Record<keyof FetchResponse, string> = {
        projects: `/projects/${item.slug || ''}`,
        users: `/users/${item.username || ''}`,
        orgs: `/organisations/${item.user?.username || ''}`,
        events: `/events/${item.id}`,
        openings: `/openings?oid=${item.id || ''}`,
        communities: `/community/${item.id}`,
      };

      return hrefMap[type] || '';
    };

    props.command({
      id: item.id,
      category: type,
      label: 'name' in item ? item.name : item.title || '',
      href: getHref(type, item),
    });
  };

  const upHandler = () => setSelectedIndex((selectedIndex + totalLength - 1) % totalLength);
  const downHandler = () => setSelectedIndex((selectedIndex + 1) % totalLength);
  const enterHandler = () => selectItem(selectedIndex);

  useEffect(() => setSelectedIndex(-1), [props.items[0]]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      switch (event.key) {
        case 'ArrowUp':
          upHandler();
          return true;
        case 'ArrowDown':
          downHandler();
          return true;
        case 'Enter':
          enterHandler();
          return true;
        default:
          return false;
      }
    },
  }));

  const getOffset = (sectionKey: keyof FetchResponse): number => {
    const listIndex = list.indexOf(sectionKey);

    return listIndex === -1
      ? 0
      : list
          .slice(0, listIndex)
          .reduce((acc, key) => acc + (props.items[0]?.[key as keyof FetchResponse]?.length || 0), 0);
  };

  const renderSectionSafe = (
    title: string,
    items: Community[] | User[] | Event[] | Organization[] | Opening[] | Project[] | undefined,
    renderItem: (item: any, index: number) => JSX.Element
  ) => {
    if (!items || items.length === 0) return <></>;
    return renderSection(title, items as any[], renderItem);
  };

  const sections = [
    {
      title: 'Users',
      items: props.items[0]?.users || [],
      renderItem: (item: User, index: number) => (
        <MentionListItem key={index} isSelected={index === selectedIndex} onClick={() => selectItem(index)}>
          <div className="flex-center gap-1">
            <Image
              alt="User Pic"
              src={`${USER_PROFILE_PIC_URL}/${item.profilePic}`}
              className="w-6 h-6 rounded-full"
              width={32}
              height={32}
            />
            <p className="text-sm text-ellipsis line-clamp-1">{item.name}</p>
          </div>
          <p className="text-xs line-clamp-1 text-right text-neutral-500">@{item.username}</p>
        </MentionListItem>
      ),
    },
    {
      title: 'Projects',
      items: props.items[0]?.projects || [],
      renderItem: (item: Project, index: number) => (
        <MentionListItem
          key={index}
          isSelected={index + getOffset('projects') === selectedIndex}
          onClick={() => selectItem(index + getOffset('projects'))}
        >
          <div className="w-[calc(100%-32px)] flex items-center gap-1 text-left">
            <Image alt="Project Pic" src={getProjectPicURL(item)} className="h-6 rounded-md" width={40} height={32} />
            <p className="text-sm text-ellipsis line-clamp-1">{item.title}</p>
          </div>
          <p className="flex-center gap-1 text-xs line-clamp-1 text-right text-neutral-500">
            <Users size={18} />
            {item.noMembers}
          </p>
        </MentionListItem>
      ),
    },
    {
      title: 'Openings',
      items: props.items[0]?.openings || [],
      renderItem: (item: Opening, index: number) => (
        <MentionListItem
          key={index}
          isSelected={index + getOffset('openings') === selectedIndex}
          onClick={() => selectItem(index + getOffset('openings'))}
        >
          <div className="flex-center gap-1 text-left">
            <Image
              alt="Opening Pic"
              src={getProjectPicURL(item.project)}
              className="h-6 rounded-md"
              width={40}
              height={32}
            />
            <p className="text-sm text-ellipsis line-clamp-1">{item.title}</p>
          </div>
          <p className="flex-center gap-1 text-xxs text-right text-neutral-500 line-clamp-1">@{item.project?.title}</p>
        </MentionListItem>
      ),
    },
    {
      title: 'Communities',
      items: props.items[0]?.communities || [],
      renderItem: (item: Community, index: number) => (
        <MentionListItem
          key={index}
          isSelected={index + getOffset('communities') === selectedIndex}
          onClick={() => selectItem(index + getOffset('communities'))}
        >
          <div className="w-[calc(100%-32px)] flex items-center gap-1 text-left">
            <Image
              alt="Community Pic"
              src={`${COMMUNITY_PROFILE_PIC_URL}/${item.profilePic}`}
              className="w-6 h-6 rounded-full"
              width={32}
              height={32}
            />
            <p className="text-sm text-ellipsis line-clamp-1">{item.title}</p>
          </div>
          <p className="flex-center gap-1 text-xs line-clamp-1 text-right text-neutral-500">
            <Users size={18} />
            {item.noMembers}
          </p>
        </MentionListItem>
      ),
    },
    {
      title: 'Organisations',
      items: props.items[0]?.orgs || [],
      renderItem: (item: Organization, index: number) => (
        <MentionListItem
          key={index}
          isSelected={index + getOffset('orgs') === selectedIndex}
          onClick={() => selectItem(index + getOffset('orgs'))}
        >
          <div className="flex-center gap-1">
            <Image
              alt="Organisation Pic"
              src={`${USER_PROFILE_PIC_URL}/${item.user.profilePic}`}
              className="w-6 h-6 rounded-full"
              width={32}
              height={32}
            />
            <p className="text-sm text-ellipsis line-clamp-1">{item.title}</p>
          </div>
          <p className="flex-center gap-1 text-xs line-clamp-1 text-right text-neutral-500">@{item.user.username}</p>
        </MentionListItem>
      ),
    },
    {
      title: 'Events',
      items: props.items[0]?.events || [],
      renderItem: (item: Event, index: number) => (
        <MentionListItem
          key={index}
          isSelected={index + getOffset('events') === selectedIndex}
          onClick={() => selectItem(index + getOffset('events'))}
        >
          <div className="flex-center gap-1">
            <Image
              alt="Event Pic"
              src={`${EVENT_PIC_URL}/${item.coverPic}`}
              className="h-6 rounded-md"
              width={40}
              height={32}
            />
            <p className="text-sm text-ellipsis line-clamp-1">{item.title}</p>
          </div>
          <p className="flex-center gap-1 text-xs line-clamp-1 text-right text-neutral-500">
            @{item.organization?.title}
          </p>
        </MentionListItem>
      ),
    },
  ];

  const hasItems = totalLength > 0;

  return (
    <div className="max-w-[300px] max-h-[500px] overflow-y-auto flex flex-col gap-1 p-2 bg-neutral-50 dark:bg-neutral-800 shadow-md rounded-lg thin_scrollbar">
      {hasItems ? (
        sections.map(({ title, items, renderItem }, index) => renderSectionSafe(title, items, renderItem))
      ) : (
        <div className="text-sm text-neutral-500 text-center">No Items Found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
