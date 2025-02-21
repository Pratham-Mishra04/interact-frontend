import React, { useEffect, useState } from 'react';
import SidebarItem from './sidebar_item';
import {
  ArrowLineLeft,
  Bell,
  Buildings,
  CalendarDots,
  Envelope,
  Gear,
  HouseLine,
  ReadCvLogo,
  RocketLaunch,
  UserCircle,
} from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { navbarOpenSelector, toggleNavbarOpen } from '@/slices/feedSlice';
import useUserStateFetcher from '@/hooks/user_fetcher';
import BottomBar from './bottombar';
import { resetUser, userSelector } from '@/slices/userSlice';
import { resetConfig } from '@/slices/configSlice';
import { currentOrgSelector, resetCurrentOrg } from '@/slices/orgSlice';
import Cookies from 'js-cookie';
import ConfirmDelete from './confirm_delete';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import Theme from '@/sections/settings/theme';
interface Props {
  index: number;
}

const Sidebar = ({ index }: Props) => {
  const [active, setActive] = useState(index);

  const open = useSelector(navbarOpenSelector);
  const user = useSelector(userSelector);

  const dispatch = useDispatch();

  const [clickedOnLogout, setClickedOnLogout] = useState(false);

  const handleLogout = () => {
    dispatch(resetUser());
    dispatch(resetConfig());
    dispatch(resetCurrentOrg());
    Cookies.remove('id');
    Cookies.remove('token');

    window.location.replace('/login');
  };

  const userFetcher = useUserStateFetcher();

  useEffect(() => {
    if (user.id != '') userFetcher();
  }, []);

  return (
    <>
      {clickedOnLogout && (
        <ConfirmDelete
          setShow={setClickedOnLogout}
          handleDelete={handleLogout}
          title="Logout?"
          subtitle="sad to see you go :("
          titleSize="6xl"
        />
      )}
      <div
        className={`${
          open ? 'w-sidebar_open' : 'w-sidebar_close'
        } h-base overflow-y-auto overflow-x-hidden thin_scrollbar bg-sidebar border-gray-300 border-r-[1px] dark:border-0 dark:bg-dark_sidebar backdrop-blur-sm pt-[40px] fixed mt-navbar py-6 flex flex-col justify-between pl-[30px] transition-ease-out-500 max-lg:hidden`}
      >
        <div className="w-full flex flex-col gap-2">
          <SidebarItem index={1} title="Home" icon={<HouseLine size={24} />} active={active} setActive={setActive} />
          <SidebarItem
            index={2}
            title="Projects"
            icon={<RocketLaunch size={24} />}
            active={active}
            setActive={setActive}
          />
          <SidebarItem
            index={3}
            title="Events"
            icon={<CalendarDots size={24} />}
            active={active}
            setActive={setActive}
          />
          <SidebarItem
            index={4}
            title="Organisations"
            icon={<Buildings size={24} />}
            active={active}
            setActive={setActive}
          />
          <SidebarItem
            index={5}
            title="Openings"
            icon={<ReadCvLogo size={24} />}
            active={active}
            setActive={setActive}
          />
        </div>
        {/* {user.id != '' && user.organizationMemberships && user.organizationMemberships.length > 0 && <Organisations />} */}
        {user.id != '' && (
          <div className="w-fit py-8 border-y-2 border-gray-300 dark:border-dark_primary_btn flex flex-col gap-2">
            <SidebarItem
              index={7}
              title="Profile"
              url={`/users/${user.username}`}
              icon={<UserCircle size={24} />}
              active={active}
              setActive={setActive}
            />
            <SidebarItem
              index={10}
              title="Invitations"
              icon={<Envelope size={24} />}
              active={active}
              setActive={setActive}
            />
            <SidebarItem index={9} title="Settings" icon={<Gear size={24} />} active={active} setActive={setActive} />
            {/* {open && <Theme />} */}
          </div>
        )}

        <ArrowLineLeft
          onClick={() => dispatch(toggleNavbarOpen())}
          className={`cursor-pointer ml-2 mt-2 ${
            open ? 'rotate-0' : '-rotate-180'
          } text-gray-500 dark:text-white transition-ease-500`}
          size={24}
        />

        {/* <Profile /> */}
      </div>
      <BottomBar index={index} />
    </>
  );
};

export default Sidebar;

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Profile = () => {
  const open = useSelector(navbarOpenSelector);
  const user = useSelector(userSelector);
  return (
    <div className="w-[220px]">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            className={`${
              open ? 'w-[220px]' : 'w-10 '
            } h-10 p-[8.5px] rounded-lg hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover text-gray-500 dark:text-white relative font-primary font-medium items-center transition-ease-out-500`}
          >
            {
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${
                  open ? 'opacity-100 left-[64px]' : 'opacity-0 left-[0px] animate-shrink'
                } transition-ease-500`}
              >
                {user.name}
              </div>
            }
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[220px] -right-10">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Organisations = () => {
  const navbarOpen = useSelector(navbarOpenSelector);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const user = useSelector(userSelector);
  const currentOrg = useSelector(currentOrgSelector);

  const organisations = user.organizationMemberships.map(m => {
    return {
      label: m.organization.title,
      value: m.organization.title.toLowerCase(),
    };
  });

  return (
    <div
      className={`${
        navbarOpen ? 'w-[220px]' : 'w-10 '
      } h-10 p-[8.5px] rounded-lg hover:bg-primary_comp dark:hover:bg-[#0000002b] text-gray-500 dark:text-white relative font-primary font-medium items-center transition-ease-out-500`}
    >
      <Buildings size={24} />

      <div
        className={`absolute top-1/2 -translate-y-1/2 ${
          navbarOpen ? 'opacity-100 left-[64px]' : 'opacity-0 left-[0px] animate-shrink'
        } transition-ease-500`}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex-center justify-between">
              {value ? organisations.find(framework => framework.value === value)?.label : 'Organisations'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search" />
              <CommandList>
                <CommandEmpty>No organisations found.</CommandEmpty>
                <CommandGroup>
                  {organisations.map(o => {
                    const membership = user.organizationMemberships.filter(m => m.organization.title == o.label)[0];
                    return (
                      <CommandItem
                        key={o.value}
                        value={o.value}
                        onSelect={currentValue => {
                          setValue(currentValue === value ? '' : currentValue);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        {currentOrg.title === o.label ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Image
                            crossOrigin="anonymous"
                            width={25}
                            height={25}
                            alt={''}
                            src={`${USER_PROFILE_PIC_URL}/${membership?.organization?.user?.profilePic}`}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        {o.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
