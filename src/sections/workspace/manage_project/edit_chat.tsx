import React, { useEffect, useState } from 'react';
import { ArrowCircleLeft, CaretRight, Pen, Plus, X } from '@phosphor-icons/react';
import { GROUP_ADMIN } from '@/config/constants';
import Link from 'next/link';
import Image from 'next/image';
import moment from 'moment';
import { GROUP_CHAT_PIC_URL, MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { GroupChat, GroupChatMembership, Project } from '@/types';
import { initialGroupChatMembership } from '@/types/initials';
import EditMembership from './edit_chat_membership';
import AddChatMembers from './add_chat_members';
import { SERVER_ERROR } from '@/config/errors';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import deleteHandler from '@/handlers/delete_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setChats, userSelector } from '@/slices/userSlice';
import { setCurrentGroupChatID } from '@/slices/messagingSlice';
import ConfirmDelete from '@/components/common/confirm_delete';
import { resizeImage } from '@/utils/resize_image';

interface Props {
  chat: GroupChat;
  project: Project;
  setStateChats: React.Dispatch<React.SetStateAction<GroupChat[]>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditChat = ({ chat, project, setStateChats, setShow }: Props) => {
  const [clickedOnEditMembership, setClickedOnEditMembership] = useState(false);
  const [clickedEditUserMembership, setClickedEditUserMembership] = useState(initialGroupChatMembership);
  const [clickedOnAddMembers, setClickedOnAddMembers] = useState(false);

  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [showCoverPic, setShowCoverPic] = useState(chat.coverPic);

  const [title, setTitle] = useState(chat.title);
  const [description, setDescription] = useState(chat.description);
  const [groupPic, setGroupPic] = useState<File>();
  const [groupPicView, setGroupPicView] = useState<string>(`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`);

  const [mutex, setMutex] = useState(false);

  const chats = useSelector(userSelector).chats;

  const dispatch = useDispatch();

  useEffect(() => {
    setGroupPicView(`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`);
    setShowCoverPic(chat.coverPic);
  }, [chat]);

  const handleEdit = async () => {
    if (title.trim() == '') {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing Group Details');

    const URL = `${MESSAGING_URL}/group/project/${chat.id}`;

    const formData = new FormData();
    if (groupPic) formData.append('coverPic', groupPic);
    if (title != chat.title) formData.append('title', title);
    if (description != chat.description) formData.append('description', description);

    const res = await patchHandler(URL, formData, 'multipart/form-data');
    const editedChat = res.data.chat;
    if (res.statusCode === 200) {
      setStateChats(prev =>
        prev.map(c => {
          if (c.id == chat.id) return { ...c, title, description, coverPic: editedChat.coverPic };
          else return c;
        })
      );
      setShowCoverPic(editedChat.coverPic);
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

  const handleDelete = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Leaving Group');

    const URL = `${MESSAGING_URL}/group/project/${chat.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      setStateChats(prev => prev.filter(c => c.id != chat.id));
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
    <div className="sticky max-md:fixed top-[158px] max-md:top-navbar max-md:right-0 w-[45%] max-md:w-full max-h-[80vh] max-md:max-h-screen max-md:h-base max-md:z-50 max-md:backdrop-blur-2xl max-md:backdrop-brightness-90 overflow-y-auto flex flex-col gap-6 max-md:gap-8 bg-white dark:bg-transparent p-6 font-primary dark:text-white border-[1px] max-md:border-0 border-primary_btn  dark:border-dark_primary_btn rounded-lg max-md:rounded-none max-md:animate-fade_third z-20">
      {clickedOnEditMembership ? (
        <EditMembership
          membership={clickedEditUserMembership}
          setShow={setClickedOnEditMembership}
          setChats={setStateChats}
        />
      ) : (
        <></>
      )}
      {clickedOnAddMembers ? (
        <AddChatMembers setShow={setClickedOnAddMembers} chat={chat} project={project} setChats={setStateChats} />
      ) : (
        <></>
      )}
      {clickedOnDelete ? <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} /> : <></>}
      <div
        className={`w-full rounded-md flex ${
          clickedOnEdit ? 'items-start max-md:flex-col max-md:items-center' : 'items-center'
        } gap-4`}
      >
        <ArrowCircleLeft onClick={() => setShow(false)} className="md:hidden cursor-pointer" size={32} />
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
              className="relative w-14 h-14 max-md:w-32 max-md:h-32 rounded-full cursor-pointer"
              htmlFor="groupPic"
            >
              <div className="w-14 h-14 max-md:w-32 max-md:h-32 absolute top-0 right-0 rounded-full flex-center bg-white transition-ease-200 opacity-0 hover:opacity-50">
                <Pen color="black" size={24} />
              </div>
              <Image
                crossOrigin="anonymous"
                className="w-14 h-14 max-md:w-32 max-md:h-32 rounded-full object-cover"
                width={10000}
                height={10000}
                alt="/"
                src={groupPicView}
              />
            </label>
            <div className="grow flex flex-col pt-1 gap-2">
              <div className="w-full flex items-center justify-between pr-2">
                <input
                  type="text"
                  className="text-2xl max-md:text-center font-medium bg-transparent focus:outline-none"
                  autoFocus={true}
                  maxLength={25}
                  value={title}
                  onChange={el => setTitle(el.target.value)}
                />
                <div className="max-md:hidden flex gap-2">
                  <X onClick={() => setClickedOnEdit(false)} className="cursor-pointer" size={24} />
                  <CaretRight onClick={handleEdit} className="cursor-pointer" size={24} />
                </div>
              </div>

              <textarea
                className="text-sm bg-transparent focus:outline-none min-h-[64px] max-h-36"
                maxLength={250}
                autoFocus={true}
                placeholder="Description"
                value={description}
                onChange={el => setDescription(el.target.value)}
              />

              <div className="md:hidden w-full flex justify-end">
                <X onClick={() => setClickedOnEdit(false)} className="cursor-pointer" size={24} />
                <CaretRight onClick={handleEdit} className="cursor-pointer" size={24} />
              </div>
            </div>
          </>
        ) : (
          <>
            <Image
              crossOrigin="anonymous"
              width={10000}
              height={10000}
              alt={'User Pic'}
              src={`${GROUP_CHAT_PIC_URL}/${showCoverPic}`}
              className={'rounded-full w-14 h-14 cursor-pointer border-[1px] border-black'}
            />
            <div className="grow flex flex-col">
              <div className="w-full flex items-center justify-between pr-2">
                <div className="text-2xl font-medium">{chat.title}</div>
                <Pen onClick={() => setClickedOnEdit(true)} className="cursor-pointer" size={24} />
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
          <div
            onClick={() => setClickedOnAddMembers(true)}
            className="w-full h-12 p-4 bg-primary_comp dark:bg-dark_primary_comp_hover rounded-md flex items-center justify-between cursor-pointer"
          >
            <div className="">Add Members</div>
            <Plus size={24} />
          </div>
          {chat.memberships.map(m => {
            return (
              <div
                key={m.id}
                className="w-full p-4 dark:bg-dark_primary_comp_hover rounded-md flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Link href={`/explore/user/${m.user.username}`} className="rounded-full">
                    <Image
                      crossOrigin="anonymous"
                      width={10000}
                      height={10000}
                      alt={'User Pic'}
                      src={`${USER_PROFILE_PIC_URL}/${m.user.profilePic}`}
                      className="rounded-full w-12 h-12 dark:bg-dark_primary_comp_hover"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link href={`/explore/user/${m.user.username}`} className="text-lg font-medium">
                      {m.user.name}
                    </Link>
                    <div className="text-sm">{m.role}</div>
                  </div>
                </div>
                <Pen
                  onClick={() => {
                    setClickedEditUserMembership(m);
                    setClickedOnEditMembership(true);
                  }}
                  className="cursor-pointer"
                  size={18}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center opacity-75 text-sm">
        Created By{' '}
        <Link href={`/explore/user/${chat.user.username}`} className="font-semibold underline underline-offset-2">
          {chat.user.name}
        </Link>{' '}
        on {moment(chat.createdAt).format('DD MMM YYYY')}
      </div>

      <div
        onClick={() => setClickedOnDelete(true)}
        className="w-full py-4 text-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active text-primary_danger rounded-lg cursor-pointer transition-ease-300"
      >
        Delete Group
      </div>
    </div>
  );
};

export default EditChat;
