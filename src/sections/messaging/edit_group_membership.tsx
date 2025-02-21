import { MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Chat, ChatMembership } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import Image from 'next/image';
import { X } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import moment from 'moment';
import Link from 'next/link';
import patchHandler from '@/handlers/patch_handler';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface Props {
  membership: ChatMembership;
  setChat?: React.Dispatch<React.SetStateAction<Chat>>;
  setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
  trigger?: React.ReactNode;
}

const EditMembership = ({ membership, setChat, setChats, trigger }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mutex, setMutex] = useState(false);

  const handleChangeRole = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Changing Role on the User');

    const URL = `${MESSAGING_URL}/group/role/${membership.chatID}`;

    const formData = {
      userID: membership.userID,
      isAdmin: !membership.isAdmin,
    };

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      if (setChat)
        setChat(prev => {
          return {
            ...prev,
            memberships: prev.memberships.map(m => {
              if (m.id == membership.id) {
                return { ...m, isAdmin: !m.isAdmin };
              } else return m;
            }),
          };
        });
      else if (setChats)
        setChats(prev =>
          prev.map(chat => {
            if (chat.id == membership.chatID) {
              return {
                ...chat,
                memberships: chat.memberships.map(m => {
                  if (m.id == membership.id) return { ...m, role: (m.isAdmin = !m.isAdmin) };
                  else return m;
                }),
              };
            } else return chat;
          })
        );
      setIsDialogOpen(false);
      Toaster.stopLoad(toaster, 'Role Changed of the User', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  const handleRemove = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Remove Member from Group');

    const URL = `${MESSAGING_URL}/group/members/remove${membership.chatID}`;

    const formData = {
      userID: membership.userID,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 204) {
      if (setChat)
        setChat(prev => {
          return {
            ...prev,
            memberships: prev.memberships.filter(m => m.id != membership.id),
          };
        });
      else if (setChats)
        setChats(prev =>
          prev.map(chat => {
            if (chat.id == membership.chatID) {
              return {
                ...chat,
                memberships: chat.memberships.filter(m => m.id != membership.id),
              };
            } else return chat;
          })
        );
      setIsDialogOpen(false);
      Toaster.stopLoad(toaster, 'Member Removed from Group', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DrawerTrigger>{trigger}</DrawerTrigger>
      <DrawerContent className="p-4 space-y-4">
        <div className="w-full flex items-center gap-4">
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
            className="rounded-full w-14 h-14 dark:bg-dark_primary_comp_hover"
          />
          <div className="flex flex-col">
            <div className="text-xl font-medium">{membership.user.name}</div>
            <div className="text-sm">Joined {moment(membership.createdAt).format('DD MMM YYYY')}</div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-1">
            {/* <Link
              href={`/users/${membership.user.username}`}
              className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active rounded-lg transition-ease-300"
            >
              Info
            </Link> */}
            <div
              onClick={handleChangeRole}
              className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active rounded-lg cursor-pointer transition-ease-300"
            >
              {!membership.isAdmin ? 'Make Group Admin' : 'Make Group Member'}
            </div>
          </div>
          <div
            onClick={handleRemove}
            className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active text-primary_danger rounded-lg cursor-pointer transition-ease-300"
          >
            Remove From Group
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditMembership;
