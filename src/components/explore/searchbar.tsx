import { Command, CommandDialog, CommandEmpty, CommandInput, CommandList } from '@/components/ui/command';
import { SERVER_ERROR } from '@/config/errors';
import { COMMUNITY_PROFILE_PIC_URL, EVENT_PIC_URL, EXPLORE_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project, User, Opening, Event, Organization, Community } from '@/types';
import Toaster from '@/utils/toaster';
import { CommandLoading } from 'cmdk';
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Loader from '../common/loader';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import postHandler from '@/handlers/post_handler';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';

const SearchBar = ({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [results, setResults] = useState({
    projects: [] as Project[],
    users: [] as User[],
    openings: [] as Opening[],
    events: [] as Event[],
    organizations: [] as Organization[],
    communities: [] as Community[],
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const [project, setProject] = useState<Project | null>(null);
  const [opening, setOpening] = useState<Opening | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);

  const fetchItem = async (query: string, setter: (res: any) => void) => {
    const res = await getHandler(`${EXPLORE_URL}/quick/item?${query}`, undefined, true);
    if (res.statusCode == 200) setter(res);
  };

  //TODO add abort controller
  const fetchResults = async (search?: string) => {
    setLoading(true);
    const URL = `/explore/quick?${'search=' + search}&limit=3`;
    const res = await getHandler(URL, undefined, true);

    if (res.statusCode === 200) {
      setResults({
        projects: res.data.projects || [],
        users: res.data.users || [],
        openings: res.data.openings || [],
        events: res.data.events || [],
        organizations: res.data.orgs || [],
        communities: res.data.communities || [],
      });
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
    }

    setLoading(false);
  };

  const submitSearch = async (search: string) => {
    const URL = `${EXPLORE_URL}/search`;
    await postHandler(URL, { search });
  };

  useEffect(() => {
    const search = new URLSearchParams(window.location.search).get('search');
    setSearch(search || '');
    if (search) submitSearch(search);

    const projectSlug = new URLSearchParams(window.location.search).get('pid');
    const projectID = new URLSearchParams(window.location.search).get('id');
    if (projectSlug) fetchItem(`slug=${projectSlug}`, res => setProject(res.data.project));
    else if (projectID) fetchItem(`id=${projectID}`, res => setProject(res.data.project));
    else setProject(null);

    const openingID = new URLSearchParams(window.location.search).get('oid');
    if (openingID) fetchItem(`oid=${openingID}`, res => setOpening(res.data.opening));
    else setOpening(null);

    const communityID = new URLSearchParams(window.location.search).get('cid');
    if (communityID) fetchItem(`cid=${communityID}`, res => setCommunity(res.data.community));
    else setOpening(null);
  }, [window.location.search]);

  const noResults = useMemo(() => Object.values(results).every(group => group.length === 0), [results]);

  const getLoadMoreURL = (type: string) => {
    switch (type) {
      case 'projects':
        return `/projects?search=${search}`;
      case 'users':
        return `/users?search=${search}`;
      case 'openings':
        return `/openings?search=${search}`;
      case 'events':
        return `/events?search=${search}`;
      case 'organizations':
        return `/organisations?search=${search}`;
      case 'communities':
        return `/home?search=${search}`;
      default:
        return '/';
    }
  };

  const handleRemoveItem = () => {
    const url = new URL(window.location.href);

    url.searchParams.delete('pid');
    url.searchParams.delete('id');
    url.searchParams.delete('oid');
    url.searchParams.delete('cid');

    window.location.href = url.toString();
  };

  const handleRemoveSearch = () => {
    const url = new URL(window.location.href);

    url.searchParams.delete('search');

    window.location.href = url.toString();
  };

  const SearchBarItem = ({ title, onRemove }: { title: string; onRemove: () => void }) => (
    <div className="w-fit h-8 flex-center gap-3 max-w-[240px] mx-1 text-xs rounded-md text-primary_text border-primary_text border-[1px] py-1 px-2">
      <div className="line-clamp-1">{title}</div>
      <X className="cursor-pointer" onClick={onRemove} size={18} />
    </div>
  );

  return (
    <Command
      className={`bg-gray-50 dark:bg-dark_primary_comp border-[1px] border-gray-200 dark:border-gray-800 ${
        isDialogOpen && !noResults && 'pb-2 shadow-xl dark:shadow-[#2b2828]'
      } transition-shadow ease-in duration-300`}
    >
      <div className="w-full flex items-center justify-between">
        {project && <SearchBarItem title={project.title} onRemove={handleRemoveItem} />}
        {opening && <SearchBarItem title={opening.title} onRemove={handleRemoveItem} />}
        {community && <SearchBarItem title={community.title} onRemove={handleRemoveItem} />}
        <CommandInput
          className="w-[560px]"
          placeholder="Search for users, projects, openings, communities, events, etc."
          value={search}
          onValueChange={value => {
            if (value) fetchResults(value);
            setIsDialogOpen(Boolean(value));
            setSearch(value);
          }}
        />
        {search && <X onClick={handleRemoveSearch} className="cursor-pointer mr-2" size={16} weight="regular" />}
      </div>

      <CommandList>
        {isDialogOpen &&
          (loading ? (
            <CommandLoading className="loader-container">
              <Loader />
            </CommandLoading>
          ) : (
            <>
              {noResults ? (
                search && <CommandEmpty> No results found for &quot;{search}&quot;</CommandEmpty>
              ) : (
                <>
                  <ToggleGroup
                    className="w-full flex-center gap-4 my-2 flex-wrap"
                    value={filters}
                    onValueChange={setFilters}
                    type="multiple"
                  >
                    {['openings', 'projects', 'users', 'events', 'communities', 'organizations'].map(filterType => (
                      <ToggleGroupItem key={filterType} value={filterType} className="capitalize">
                        {filterType}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </>
              )}
              {Object.entries(results).map(([key, group]) => {
                return (
                  (filters.length === 0 || filters.includes(key)) &&
                  group.length > 0 && (
                    <CommandGroup
                      key={key}
                      heading={key}
                      loadMoreURL={getLoadMoreURL(key)}
                      showLoadMore={group.length === 3}
                      setIsDialogOpen={setIsDialogOpen}
                    >
                      {group.map(item => (
                        <SearchItem key={item.id} item={item} type={key} />
                      ))}
                    </CommandGroup>
                  )
                );
              })}
            </>
          ))}
      </CommandList>
    </Command>
  );
};

const FixedSearchBar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDialogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      className="w-[640px] max-lg:w-[480px] max-md:hidden fixed top-2 right-1/2 translate-x-1/2 mx-auto z-20"
    >
      <SearchBar isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    </div>
  );
};

export const DialogSearchBar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsDialogOpen(true)}
        className="w-10 h-10 rounded-full flex-center hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover cursor-pointer transition-ease-300"
      >
        <MagnifyingGlass className="max-md:w-6 max-md:h-6" size={24} weight="regular" />
      </div>
      <CommandDialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
        <SearchBar isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
      </CommandDialog>
    </>
  );
};

const CommandGroup: React.FC<{
  children: ReactNode;
  heading: string;
  loadMoreURL: string;
  showLoadMore: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ children, heading, loadMoreURL, showLoadMore, setIsDialogOpen }) => {
  return (
    <div className="w-full flex flex-col gap-2 px-2 mt-2">
      <CommandSeparator />
      <div className="text-gray-500 text-sm font-medium pl-1 capitalize">{heading}</div>
      {children}
      {showLoadMore && (
        <Link
          href={loadMoreURL}
          onClick={() => setIsDialogOpen(false)}
          className="w-fit mx-auto text-xs font-medium text-gray-400 hover:underline underline-offset-2"
        >
          Load More
        </Link>
      )}
    </div>
  );
};

const CommandItem: React.FC<{ children: ReactNode; link: string }> = ({ children, link }) => (
  <Link
    href={link}
    className="w-full flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-dark_primary_comp_hover p-1 rounded-sm transition-ease-300"
  >
    {children}
  </Link>
);

const CommandSeparator: React.FC = () => <div className="w-full h-px bg-gray-300"></div>;

const ProjectItem = ({ project }: { project: Project }) => (
  <CommandItem link={`/projects/${project.slug}`}>
    <Image
      crossOrigin="anonymous"
      width={50}
      height={50}
      alt="Project Pic"
      src={getProjectPicURL(project)}
      placeholder="blur"
      blurDataURL={getProjectPicHash(project)}
      className="h-6 rounded-md mr-1"
    />
    <div className="text-sm">{project.title}</div>
  </CommandItem>
);

const UserItem = ({ user }: { user: User }) => (
  <CommandItem link={`/users/${user.username}`}>
    <Image
      crossOrigin="anonymous"
      width={50}
      height={50}
      alt={'User Pic'}
      src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
      placeholder="blur"
      blurDataURL={user.profilePicBlurHash || 'no-hash'}
      className="w-6 h-6 rounded-full mr-1"
    />
    <div className="text-sm">{user.username}</div>
  </CommandItem>
);

const OpeningItem = ({ opening }: { opening: Opening }) => (
  <CommandItem link={`/openings?oid=${opening.id}`}>
    <Image
      crossOrigin="anonymous"
      width={50}
      height={50}
      alt={'User Pic'}
      src={getProjectPicURL(opening.project)}
      placeholder="blur"
      blurDataURL={getProjectPicHash(opening.project)}
      className="h-6 rounded-md mr-1"
    />
    <div className="text-sm">{opening.title}</div>
  </CommandItem>
);

const EventItem = ({ event }: { event: Event }) => (
  <CommandItem link={`/events/${event.id}`}>
    <Image
      crossOrigin="anonymous"
      width={50}
      height={15}
      alt={'User Pic'}
      src={`${EVENT_PIC_URL}/${event.coverPic}`}
      placeholder="blur"
      blurDataURL={
        event.blurHash
          ? event.blurHash == 'no-hash'
            ? EVENT_PIC_HASH_DEFAULT
            : event.blurHash
          : EVENT_PIC_HASH_DEFAULT
      }
      className="h-6 rounded-md mr-1"
    />
    <div className="text-sm">{event.title}</div>
  </CommandItem>
);

const OrgItem = ({ org }: { org: Organization }) => (
  <CommandItem link={`/organisations/${org.user.username}`}>
    <Image
      crossOrigin="anonymous"
      width={50}
      height={50}
      alt={'User Pic'}
      src={`${USER_PROFILE_PIC_URL}/${org.user.profilePic}`}
      placeholder="blur"
      blurDataURL={org.user.profilePicBlurHash || 'no-hash'}
      className="w-6 h-6 rounded-full mr-1"
    />
    <div className="text-sm">{org.title}</div>
  </CommandItem>
);

const CommunityItem = ({ community }: { community: Community }) => (
  <CommandItem link={`community/${community.id}`}>
    <Image
      crossOrigin="anonymous"
      width={50}
      height={50}
      alt={'User Pic'}
      src={`${COMMUNITY_PROFILE_PIC_URL}/${community.profilePic}`}
      placeholder="blur"
      blurDataURL={community.profilePicBlurHash || 'no-hash'}
      className="w-6 h-6 rounded-full mr-1"
    />
    <div className="text-sm">{community.title}</div>
  </CommandItem>
);

const SearchItem = ({ item, type }: { item: any; type: string }) => {
  switch (type) {
    case 'projects':
      return <ProjectItem project={item} />;
    case 'users':
      return <UserItem user={item} />;
    case 'openings':
      return <OpeningItem opening={item} />;
    case 'events':
      return <EventItem event={item} />;
    case 'organizations':
      return <OrgItem org={item} />;
    case 'communities':
      return <CommunityItem community={item} />;
    default:
      return <></>;
  }
};

export default FixedSearchBar;
