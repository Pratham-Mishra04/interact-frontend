import { USER_PROFILE_PIC_URL, USER_URL } from '@/config/routes';
import { User } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Tags from '@/components/utils/edit_tags';
import Toaster from '@/utils/toaster';
import { resizeImage } from '@/utils/resize_image';
import { Check, PencilSimple, X } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import patchHandler from '@/handlers/patch_handler';
import { resetReduxLinks, setCoverPic, setProfilePic, setReduxLinks, setReduxName } from '@/slices/userSlice';
import Links from '@/components/utils/edit_links';
import getDomainName from '@/utils/funcs/get_domain_name';
import getIcon from '@/utils/funcs/get_icon';
import Link from 'next/link';
import isArrEdited from '@/utils/funcs/check_array_edited';
import Connections from '../explore/connections_view';
import { SERVER_ERROR } from '@/config/errors';
import CopyClipboardButton from '@/components/buttons/copy_clipboard_btn';
import { SidePrimeWrapper } from '@/wrappers/side';
import TooltipIcon from '@/components/common/tooltip_icon';
import { AtSign } from 'lucide-react';
import ImageEditorDialog, {
  handleImageInputChange, handleImageInputClick
} from '@/components/image-editor/dialog';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const ProfileCard = ({ user, setUser }: Props) => {
  const [name, setName] = useState(user.name);
  const [tags, setTags] = useState(user.tags || []);
  const [links, setLinks] = useState(user.links || []);
  const [userPic, setUserPic] = useState<File>();
  const [userPicView, setUserPicView] = useState<string>(`${USER_PROFILE_PIC_URL}/${user.profilePic}`);

  const [mutex, setMutex] = useState(false);

  const [clickedOnFollowers, setClickedOnFollowers] = useState(false);
  const [clickedOnFollowing, setClickedOnFollowing] = useState(false);

  const [clickedOnName, setClickedOnName] = useState(false);
  const [clickedOnTags, setClickedOnTags] = useState(false);
  const [clickedOnLinks, setClickedOnLinks] = useState(false);
  const [clickedOnProfilePic, setClickedOnProfilePic] = useState(false);
  const [openImageEditor, setOpenImageEditor] = useState<boolean>(false);

  const dispatch = useDispatch();

  const handleSubmit = async (field: string) => {
    if (name.trim() == '') {
      Toaster.error('Name Cannot be empty', 'validation_toaster');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating your Profile...');
    const formData = new FormData();

    if (field == 'userPic' && userPic) formData.append('profilePic', userPic);
    else if (field == 'name') formData.append('name', name);
    else if (field == 'tags') tags.forEach(tag => formData.append('tags', tag));
    else if (field == 'links') links.forEach(link => formData.append('links', link));

    const URL = `${USER_URL}/me`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const profilePic = res.data.user.profilePic;
      const coverPic = res.data.user.coverPic;
      dispatch(setProfilePic(profilePic));
      dispatch(setCoverPic(coverPic));
      if (field == 'name') dispatch(setReduxName(name));
      else if (field == 'links') {
        if (links.length > 0) dispatch(setReduxLinks(links));
        else dispatch(resetReduxLinks());
      }
      setUser(prev => ({
        ...prev,
        name: field == 'name' ? name : prev.name,
        tags: field == 'tags' ? tags : prev.tags,
        links: field == 'links' ? links : prev.links,
        profilePic,
        coverPic,
      }));
      Toaster.stopLoad(toaster, 'Profile Updated', 1);

      if (field == 'name') setClickedOnName(false);
      else if (field == 'userPic') setClickedOnProfilePic(false);
      else if (field == 'tags') setClickedOnTags(false);
      else if (field == 'links') setClickedOnLinks(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  interface SaveBtnProps {
    setter: React.Dispatch<React.SetStateAction<boolean>>;
    field: string;
  }

  const SaveBtn = ({ setter, field }: SaveBtnProps) => {
    const checker = () => {
      if (field == 'name') return name == user.name || name.trim() == '';
      else if (field == 'tags') return !isArrEdited(tags, user.tags) || tags.length == 0;
      else if (field == 'links') return !isArrEdited(links, user.links) || links.length == 0;
      return true;
    };
    return (
      <div className="w-full flex text-sm justify-end gap-2 mt-2">
        <div
          onClick={() => setter(false)}
          className="border-[1px] border-primary_black flex-center rounded-full w-20 p-1 cursor-pointer"
        >
          Cancel
        </div>
        {checker() ? (
          <div className="bg-primary_black bg-opacity-50 text-white flex-center rounded-full w-16 p-1 cursor-default">
            Save
          </div>
        ) : (
          <div
            onClick={() => handleSubmit(field)}
            className="bg-primary_black text-white flex-center rounded-full w-16 p-1 cursor-pointer"
          >
            Save
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    const tag = new URLSearchParams(window.location.search).get('tag');

    if (action && tag && action == 'edit') {
      switch (tag) {
        case 'name':
          setClickedOnName(true);
          break;
        case 'tags':
          setClickedOnTags(true);
          break;
        case 'links':
          setClickedOnLinks(true);
          break;
      }
    }
  }, [window.location.search]);

  return (
    <>
      {clickedOnFollowers ? <Connections type="followers" user={user} setShow={setClickedOnFollowers} /> : <></>}
      {clickedOnFollowing ? <Connections type="following" user={user} setShow={setClickedOnFollowing} /> : <></>}
      {openImageEditor && userPic && <ImageEditorDialog
        open={openImageEditor}
        setOpen={setOpenImageEditor}
        image={userPic}
        circularCrop
        handleUpdate={(file: File, view?: string)=>{
            if (view) setUserPicView(view);
            setUserPic(file);
            setClickedOnProfilePic(true);
        }}
      />}
      <SidePrimeWrapper stickTop>
        <div className="w-full flex-center flex-col gap-4 py-2">
          <div className="absolute group top-4 right-4">
            <TooltipIcon
              label="Copy Profile Link"
              icon={<CopyClipboardButton url={`/users/${user.username}?external=true`} iconOnly />}
              includeBorder
            />
          </div>
          <input
            type="file"
            className="hidden"
            id="userPic"
            accept="image/*"
            multiple={false}
            onClick={handleImageInputClick}
            onChange={e=>handleImageInputChange(e, (file: File)=>{
              setOpenImageEditor(()=>{
                setUserPic(file);
                return true;
              });
            })}
          />
          {clickedOnProfilePic ? (
            <div className="relative">
              <div className="w-56 h-56 border-2 border-dashed border-primary_black dark:border-gray-400 max-md:w-40 max-md:h-40 absolute -top-4 -right-4 animate-spin rounded-full"></div>
              <div
                onClick={() => handleSubmit('userPic')}
                className="w-48 h-24 max-md:w-32 max-md:h-32 absolute border-b-2 border-black top-0 right-0 rounded-tl-full rounded-tr-full flex-center bg-white transition-ease-200 cursor-pointer opacity-0 hover:opacity-50"
              >
                <Check color="black" size={32} />
              </div>
              <div
                onClick={() => {
                  setClickedOnProfilePic(false);
                  setUserPicView(`${USER_PROFILE_PIC_URL}/${user.profilePic}`);
                  setUserPic(undefined);
                }}
                className="w-48 h-24 max-md:w-32 max-md:h-32 absolute border-b-2 border-black bottom-0 right-0 rotate-180 rounded-tl-full rounded-tr-full flex-center bg-white transition-ease-200 cursor-pointer opacity-0 hover:opacity-50"
              >
                <X color="black" size={32} />
              </div>
              <Image
                crossOrigin="anonymous"
                className="w-48 h-48 rounded-full object-cover transition-ease-200 cursor-pointer max-md:w-32 max-md:h-32"
                width={200}
                height={200}
                alt="/"
                src={userPicView}
              />
            </div>
          ) : (
            <label className="relative" htmlFor="userPic">
              <div className="w-48 h-48 max-md:w-32 max-md:h-32 absolute top-0 right-0 rounded-full flex-center bg-white transition-ease-200 cursor-pointer opacity-0 hover:opacity-50">
                <PencilSimple color="black" size={32} />
              </div>
              <Image
                crossOrigin="anonymous"
                className="w-48 h-48 rounded-full object-cover transition-ease-200 cursor-pointer max-md:w-32 max-md:h-32"
                width={200}
                height={200}
                alt="/"
                src={userPicView}
              />
            </label>
          )}

          {clickedOnName ? (
            <div className="w-full">
              <div className="text-xs ml-1 font-medium uppercase text-gray-500">Name ({name.trim().length}/25)</div>
              <input
                maxLength={25}
                value={name}
                onChange={el => setName(el.target.value)}
                placeholder="Interact User"
                className="w-full text-primary_black dark:text-white focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg text-2xl p-2 font-semibold bg-transparent"
              />
              <SaveBtn setter={setClickedOnName} field="name" />
            </div>
          ) : (
            <div
              onClick={() => setClickedOnName(true)}
              className="w-full relative group rounded-lg flex-center flex-col p-2 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover  cursor-pointer transition-ease-300"
            >
              <PencilSimple className="absolute opacity-0 group-hover:opacity-100 top-2 right-2 transition-ease-300" />
              <div className="text-3xl max-md:text-2xl text-center font-bold text-gradient">{user.name}</div>
              <div className="flex items-center gap-0.5 text-sm max-md:text-xs text-slate-900 dark:text-neutral-300 mt-0.5 py-0.5 px-3 bg-slate-100 dark:bg-neutral-800 rounded-xl text-center font-medium">
                <AtSign size={13} className={'mt-0.5'} />
                <p>{user.username}</p>
              </div>
            </div>
          )}

          <div className="w-full flex justify-center text-lg gap-6">
            <div onClick={() => setClickedOnFollowers(true)} className="flex gap-1 cursor-pointer">
              <div className="font-bold">{user.noFollowers}</div>
              <div>Follower{user.noFollowers != 1 ? 's' : ''}</div>
            </div>
            <div onClick={() => setClickedOnFollowing(true)} className="flex gap-1 cursor-pointer">
              <div className="font-bold">{user.noFollowing}</div>
              <div>Following</div>
            </div>
          </div>

          <div className="w-full h-[1px] border-t-[1px] border-gray-500 border-dashed"></div>

          <div className="w-full flex flex-col gap-8 mt-2">
            {clickedOnTags ? (
              <div className="w-full flex flex-col gap-2">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Skills ({tags.length || 0}/10)</div>
                <Tags tags={tags} setTags={setTags} maxTags={10} suggestions={true} />
                <SaveBtn setter={setClickedOnTags} field="tags" />
              </div>
            ) : (
              <div>
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Skills</div>

                <div
                  onClick={() => setClickedOnTags(true)}
                  className={`w-full relative group rounded-lg flex-center p-4 ${
                    !user.tags || user.tags?.length == 0
                      ? 'bg-primary_comp'
                      : 'hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover '
                  } cursor-pointer transition-ease-300`}
                >
                  <PencilSimple
                    className={`absolute opacity-0 ${
                      !user.tags || user.tags?.length == 0 ? 'opacity-100' : 'group-hover:opacity-100'
                    } top-2 right-2 transition-ease-300`}
                  />
                  {!user.tags || user.tags?.length == 0 ? (
                    <div className="text-gray-400">Click here to add Skills!</div>
                  ) : (
                    <div
                      className={`w-full flex flex-wrap items-center ${
                        user.tags?.length == 1 ? 'justify-start' : 'justify-center'
                      } gap-2`}
                    >
                      {user.tags &&
                        user.tags.map(tag => {
                          return (
                            <div
                              className="flex-center text-xs px-2 py-1 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-full cursor-pointer"
                              key={tag}
                            >
                              {tag}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
            {clickedOnLinks ? (
              <div className="w-full flex flex-col gap-2">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Links ({links.length || 0}/5)</div>
                <Links links={links} setLinks={setLinks} maxLinks={5} />
                <SaveBtn setter={setClickedOnLinks} field="links" />
              </div>
            ) : (
              <div>
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Links</div>

                <div
                  onClick={() => setClickedOnLinks(true)}
                  className={`w-full relative group rounded-lg flex-center p-4 ${
                    !user.links || user.links?.length == 0
                      ? 'bg-primary_comp'
                      : 'hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover '
                  } cursor-pointer transition-ease-300`}
                >
                  <PencilSimple
                    className={`absolute opacity-0 ${
                      !user.links || user.links?.length == 0 ? 'opacity-100' : 'group-hover:opacity-100'
                    } top-2 right-2 transition-ease-300`}
                  />
                  {!user.links || user.links?.length == 0 ? (
                    <div className="text-gray-400">Click here to add Links!</div>
                  ) : (
                    <div
                      className={`w-full h-fit flex flex-wrap items-center ${
                        user.links?.length == 1 ? 'justify-start' : 'justify-center'
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
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidePrimeWrapper>
    </>
  );
};

export default ProfileCard;
