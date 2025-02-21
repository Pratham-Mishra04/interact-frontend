import React, { useState } from 'react';
import { CaretRight, Pen, Plus, X } from '@phosphor-icons/react';
import Link from 'next/link';
import Image from 'next/image';
import moment from 'moment';
import { GROUP_CHAT_PIC_URL, INVITATION_URL, MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Chat } from '@/types';
import { initialChatMembership, initialInvitation } from '@/types/initials';
import EditMembership from './edit_group_membership';
import AddGroupMembers from './add_group_members';
import { SERVER_ERROR } from '@/config/errors';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import deleteHandler from '@/handlers/delete_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setChats, userSelector } from '@/slices/userSlice';
import ConfirmDelete from '@/components/common/confirm_delete';
import { resizeImage } from '@/utils/resize_image';
import Report from '@/components/common/report';
import { setCurrentChatID } from '@/slices/messagingSlice';
import { getSelfMembership } from '@/utils/funcs/messaging';
import getInvitationStatus, { getInvitationStatusColor } from '@/utils/funcs/invitation';
import Checkbox from '@/components/form/checkbox';

interface Props {
  chat: Chat;
  setChat?: React.Dispatch<React.SetStateAction<Chat>>;
  setStateChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  access: boolean;
}

const GroupInfo = ({ chat, setChat, setStateChats, setShow, access }: Props) => {
  const [clickedEditUserMembership, setClickedEditUserMembership] = useState(initialChatMembership);
  const [clickedOnWithdrawInvitation, setClickedOnWithdrawInvitation] = useState(false);
  const [clickedInvitationToWithdraw, setClickedInvitationToWithdraw] = useState(initialInvitation);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnExit, setClickedOnExit] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const [title, setTitle] = useState(chat.title);
  const [description, setDescription] = useState(chat.description);
  const [isAdminOnly, setIsAdminOnly] = useState(chat.isAdminOnly);
  const [groupPic, setGroupPic] = useState<File>();
  const [groupPicView, setGroupPicView] = useState<string>(`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`);

  const [mutex, setMutex] = useState(false);

  const chats = useSelector(userSelector).chats;

  const dispatch = useDispatch();

  const handleWithdrawInvitation = async () => {
    const toaster = Toaster.startLoad('Withdrawing Invitation...');

    const URL = `${INVITATION_URL}/withdraw/${clickedInvitationToWithdraw.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setChat)
        setChat(prev => {
          return {
            ...prev,
            invitations: prev.invitations.filter(inv => inv.id != clickedInvitationToWithdraw.id),
          };
        });
      setClickedOnWithdrawInvitation(false);
      Toaster.stopLoad(toaster, 'Invitation Withdrawn', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleEdit = async () => {
    if (title.trim() == '') {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing Group Details');

    const URL = `${MESSAGING_URL}/group/${chat.id}`;

    const formData = new FormData();
    if (groupPic) formData.append('coverPic', groupPic);
    if (title != chat.title) formData.append('title', title);
    if (description != chat.description) formData.append('description', description);
    formData.append('adminOnly', String(isAdminOnly));

    const res = await patchHandler(URL, formData, 'multipart/form-data');
    if (res.statusCode === 200) {
      const editedChat = res.data.chat;
      if (setChat)
        setChat(prev => {
          return {
            ...prev,
            title,
            description,
            coverPic: editedChat.coverPic,
          };
        });
      else if (setStateChats)
        setStateChats(prev =>
          prev.map(c => {
            if (c.id == chat.id) return { ...c, title, description, coverPic: editedChat.coverPic };
            else return c;
          })
        );
      setGroupPic(undefined);
      setClickedOnEdit(false);
      Toaster.stopLoad(toaster, 'Group Details Edited!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  const handleExit = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Leaving Group');

    const URL = `${MESSAGING_URL}/group/leave/${chat.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      dispatch(setChats(chats.filter(chatID => chatID != chat.id)));
      dispatch(setCurrentChatID(''));
      Toaster.stopLoad(toaster, 'Group Left', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  const handleDelete = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Leaving Group');

    const URL = `${MESSAGING_URL}/group/${chat.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      if (setStateChats) setStateChats(prev => prev.filter(c => c.id != chat.id));
      if (chats.includes(chat.id)) dispatch(setChats(chats.filter(chatID => chatID != chat.id)));
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Group Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      {clickedOnWithdrawInvitation && (
        <ConfirmDelete
          setShow={setClickedOnWithdrawInvitation}
          handleDelete={handleWithdrawInvitation}
          title="Confirm Withdraw?"
        />
      )}
      <div className="w-full h-full overflow-y-auto thin_scrollbar flex flex-col gap-4">
        {clickedOnExit && <ConfirmDelete setShow={setClickedOnExit} handleDelete={handleExit} title="Confirm Exit?" />}
        {clickedOnReport && <Report setShow={setClickedOnReport} />}
        {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />}

        <div className="w-full flex items-center justify-between p-2">
          <div className="text-3xl font-semibold">Group Info</div>
          <X onClick={() => setShow(false)} className="cursor-pointer" size={32} />
        </div>

        <div
          className={`w-full rounded-md flex ${
            clickedOnEdit ? 'items-start max-lg:flex-col max-lg:items-center' : 'items-center'
          } gap-4 px-4`}
        >
          {clickedOnEdit ? (
            <>
              <input
                type="file"
                className="hidden"
                id="groupPic"
                multiple={false}
                onChange={async ({ target }) => {
                  if (target.files && target.files[0]) {
                    const file = target.files[0];
                    if (file.type.split('/')[0] == 'image') {
                      const resizedPic = await resizeImage(file, 500, 500);
                      setGroupPicView(URL.createObjectURL(resizedPic));
                      setGroupPic(resizedPic);
                    } else Toaster.error('Only Image Files can be selected');
                  }
                }}
              />
              <label
                className="relative w-14 h-14 max-lg:w-32 max-lg:h-32 rounded-full cursor-pointer"
                htmlFor="groupPic"
              >
                <div className="w-14 h-14 max-lg:w-32 max-lg:h-32 absolute top-0 right-0 rounded-full flex-center bg-white transition-ease-200 opacity-0 hover:opacity-50">
                  <Pen color="black" size={24} />
                </div>
                <Image
                  crossOrigin="anonymous"
                  className="w-14 h-14 max-lg:w-32 max-lg:h-32 rounded-full object-cover"
                  width={50}
                  height={50}
                  alt="/"
                  src={groupPicView}
                />
              </label>
              <div className="w-[calc(100%-56px)] flex flex-col pt-1 gap-2">
                <div className="w-full flex items-center justify-between pr-2">
                  <input
                    type="text"
                    className="text-2xl max-lg:text-center font-medium bg-transparent focus:outline-none"
                    autoFocus={true}
                    maxLength={25}
                    value={title}
                    onChange={el => setTitle(el.target.value)}
                  />
                  <div className="max-lg:hidden flex gap-2">
                    <X onClick={() => setClickedOnEdit(false)} className="cursor-pointer" size={24} />
                    <CaretRight onClick={handleEdit} className="cursor-pointer" size={24} />
                  </div>
                </div>

                <textarea
                  className="text-sm bg-transparent focus:outline-none min-h-[64px] max-h-36"
                  maxLength={250}
                  placeholder="Group Description"
                  value={description}
                  onChange={el => setDescription(el.target.value)}
                />

                <Checkbox val={isAdminOnly} setVal={setIsAdminOnly} label="Admin Only Chat" />

                <div className="lg:hidden w-full flex justify-end">
                  <X onClick={() => setClickedOnEdit(false)} className="cursor-pointer" size={24} />
                  <CaretRight onClick={handleEdit} className="cursor-pointer" size={24} />
                </div>
              </div>
            </>
          ) : (
            <>
              <Image
                crossOrigin="anonymous"
                className="w-14 h-14 rounded-full object-cover"
                width={50}
                height={50}
                alt="/"
                src={`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`}
              />
              <div className="grow flex flex-col">
                <div className="w-full flex items-center justify-between pr-2">
                  <div className="text-2xl font-medium">{chat.title}</div>
                  {access && <Pen onClick={() => setClickedOnEdit(true)} className="cursor-pointer" size={24} />}
                </div>

                <div className="text-sm">{chat.description}</div>
              </div>
            </>
          )}
        </div>

        <div className="w-full  rounded-md flex flex-col gap-4 p-4">
          <div className="text-xl font-semibold">
            {chat.memberships.length} Participant{chat.memberships.length == 1 ? '' : 's'}
          </div>
          <div className="w-full flex flex-col gap-1">
            {access && <AddGroupMembers chat={chat} setChat={setChat} setChats={setStateChats} />}
            {chat.memberships.map(m => {
              return (
                <div
                  key={m.id}
                  className="w-full py-2 dark:p-4 dark:bg-dark_primary_comp_hover rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Link href={`/users/${m.user.username}`} className="rounded-full">
                      <Image
                        crossOrigin="anonymous"
                        width={50}
                        height={50}
                        alt={'User Pic'}
                        src={`${USER_PROFILE_PIC_URL}/${m.user.profilePic}`}
                        className="rounded-full w-10 h-10"
                      />
                    </Link>
                    <div className="flex flex-col">
                      <Link href={`/users/${m.user.username}`} className="text-lg font-medium">
                        {m.user.name}
                      </Link>
                      <div className="text-xs">{m.isAdmin ? 'Admin' : 'Member'}</div>
                    </div>
                  </div>
                  {access && getSelfMembership(chat).id != m.id && (
                    <EditMembership
                      membership={clickedEditUserMembership}
                      setChat={setChat}
                      setChats={setStateChats}
                      trigger={
                        <Pen onClick={() => setClickedEditUserMembership(m)} className="cursor-pointer" size={20} />
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!chat.projectID && !chat.organizationID && (
          <div className="w-full  rounded-md flex flex-col gap-4 p-4">
            <div className="text-xl font-semibold">
              {chat.invitations.length} Invitation{chat.invitations.length == 1 ? '' : 's'}
            </div>
            <div className="w-full flex flex-col gap-1">
              {chat.invitations.map(invitation => {
                return (
                  <div
                    key={invitation.id}
                    className="w-full py-2 dark:p-4 dark:bg-dark_primary_comp_hover rounded-md flex items-center justify-between"
                  >
                    <Link href={`/users/${invitation.user.username}`} className="flex items-center gap-2">
                      <Image
                        crossOrigin="anonymous"
                        width={50}
                        height={50}
                        alt={'User Pic'}
                        src={`${USER_PROFILE_PIC_URL}/${invitation.user.profilePic}`}
                        className="rounded-full w-10 h-10"
                      />

                      <div className="flex flex-col">
                        <div className="text-lg font-medium">{invitation.user.name}</div>
                        <div className="text-xs">@{invitation.user.username}</div>
                      </div>
                    </Link>
                    {invitation.status == 0 ? (
                      access && (
                        <div
                          onClick={() => {
                            setClickedInvitationToWithdraw(invitation);
                            setClickedOnWithdrawInvitation(true);
                          }}
                          className="text-xs text-primary_danger cursor-pointer"
                        >
                          Withdraw Invitation
                        </div>
                      )
                    ) : (
                      <div
                        className="w-fit px-3 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: getInvitationStatusColor(invitation.status) }}
                      >
                        {getInvitationStatus(invitation.status)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {chat.isAdminOnly && (
          <div className="text-center opacity-75 text-xs">
            This is an <span className="font-semibold">Admin Only</span> chat.
          </div>
        )}

        <div className="text-center opacity-75 text-sm">
          Created By{' '}
          <Link
            href={`/users/${chat.user.username}`}
            target="_blank"
            className="font-semibold underline underline-offset-2"
          >
            {chat.user.name}
          </Link>{' '}
          on {moment(chat.createdAt).format('DD MMM YYYY')}
        </div>

        <div className="w-full  rounded-md flex flex-col gap-1 p-4">
          {chats.includes(chat.id) && (
            <>
              <div
                onClick={() => setClickedOnExit(true)}
                className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active text-primary_danger rounded-lg cursor-pointer transition-ease-300"
              >
                Exit Group
              </div>
              <div
                onClick={() => setClickedOnReport(true)}
                className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active text-primary_danger rounded-lg cursor-pointer transition-ease-300"
              >
                Report Group
              </div>
            </>
          )}
          {access && (chat.projectID || chat.organizationID) && (
            <div
              onClick={() => setClickedOnDelete(true)}
              className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active text-primary_danger rounded-lg cursor-pointer transition-ease-300"
            >
              Delete Group
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupInfo;
