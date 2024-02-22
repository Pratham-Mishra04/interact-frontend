import TabMenu from '@/components/common/tab_menu';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React, { useEffect, useState } from 'react';
import { initialProfile, initialUser } from '@/types/initials';
import { USER_COVER_PIC_URL, USER_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { navbarOpenSelector } from '@/slices/feedSlice';
import Posts from '@/screens/profile/posts';
import Projects from '@/screens/profile/projects';
import ProfileCard from '@/sections/profile/profile_card';
import { Check, ImageSquare, Pen, PencilSimple, X } from '@phosphor-icons/react';
import { resizeImage } from '@/utils/resize_image';
import ProfileCardLoader from '@/components/loaders/profile_card';
import { SERVER_ERROR } from '@/config/errors';
import Loader from '@/components/common/loader';
import patchHandler from '@/handlers/patch_handler';
import { setReduxTagline } from '@/slices/userSlice';
import PostsLoader from '@/components/loaders/posts';
import Protect from '@/utils/wrappers/protect';
import WidthCheck from '@/utils/wrappers/widthCheck';
import About from '@/screens/profile/my_about';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';

const Profile = () => {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  const [tagline, setTagline] = useState('');
  const [coverPic, setCoverPic] = useState<File>();
  const [coverPicView, setCoverPicView] = useState(`${USER_COVER_PIC_URL}/${user.coverPic}`);
  const open = useSelector(navbarOpenSelector);

  const [clickedOnTagline, setClickedOnTagline] = useState(false);
  const [clickedOnCoverPic, setClickedOnCoverPic] = useState(false);

  const getUser = () => {
    const URL = `${USER_URL}/me`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUser(res.data.user);
          setTagline(res.data.user.tagline);
          setCoverPicView(`${USER_COVER_PIC_URL}/${res.data.user.coverPic}`);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const dispatch = useDispatch();

  const handleSubmit = async (field: string) => {
    if (tagline.trim() == '') {
      Toaster.error('Tagline Cannot be empty', 'validation_toaster');
      return;
    }

    const toaster = Toaster.startLoad('Updating your Profile...');
    const formData = new FormData();

    if (field == 'coverPic' && coverPic) formData.append('coverPic', coverPic);
    else if (field == 'tagline') formData.append('tagline', tagline);

    const URL = `${USER_URL}/me`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const coverPic = res.data.user.coverPic;

      if (field == 'tagline') dispatch(setReduxTagline(tagline));
      setUser(prev => ({
        ...prev,
        tagline: field == 'tagline' ? tagline : prev.tagline,
        coverPic,
      }));
      Toaster.stopLoad(toaster, 'Profile Updated', 1);

      if (field == 'coverPic') setClickedOnCoverPic(false);
      else if (field == 'tagline') setClickedOnTagline(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    const tag = new URLSearchParams(window.location.search).get('tag');

    if (action && tag && action == 'edit' && tag == 'tagline') setClickedOnTagline(true);
  }, [window.location.search]);

  interface SaveBtnProps {
    setter: React.Dispatch<React.SetStateAction<boolean>>;
    field: string;
  }

  const SaveBtn = ({ setter, field }: SaveBtnProps) => {
    const checker = () => {
      if (field == 'tagline') return tagline == user.tagline;
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

  return (
    <BaseWrapper title="Profile">
      <Sidebar index={7} />
      <MainWrapper>
        <div className="w-full max-lg:w-full flex max-lg:flex-col transition-ease-out-500 font-primary">
          <input
            type="file"
            className="hidden"
            id="coverPic"
            multiple={false}
            onChange={async ({ target }) => {
              if (target.files && target.files[0]) {
                const file = target.files[0];
                if (file.type.split('/')[0] == 'image') {
                  const resizedPic = await resizeImage(file, 900, 300);
                  setCoverPicView(URL.createObjectURL(resizedPic));
                  setCoverPic(resizedPic);
                  setClickedOnCoverPic(true);
                } else Toaster.error('Only Image Files can be selected');
              }
            }}
          />

          {loading ? (
            <></>
          ) : clickedOnCoverPic ? (
            <div>
              <div
                onClick={() => handleSubmit('coverPic')}
                className="w-10 h-10 absolute top-1 right-12 mt-navbar rounded-full z-20 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
              >
                <Check color="black" size={24} />
              </div>
              <div
                onClick={() => {
                  setCoverPicView(`${USER_COVER_PIC_URL}/${user.coverPic}`);
                  setCoverPic(undefined);
                  setClickedOnCoverPic(false);
                }}
                className="w-10 h-10 absolute top-1 right-1 mt-navbar rounded-full z-20 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
              >
                <X color="black" size={24} />
              </div>
              <Image
                crossOrigin="anonymous"
                className={`${
                  open ? 'w-no_side_base_open' : 'w-no_side_base_close'
                } max-lg:w-screen h-64 cursor-default fixed top-navbar fade-img transition-ease-out-500 object-cover`}
                width={500}
                height={500}
                alt="/"
                src={coverPicView}
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="coverPic"
                className="w-12 h-12 absolute top-1 right-4 mt-navbar rounded-full z-10 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
              >
                <PencilSimple className="max-lg:hidden" color="black" size={24} />
                <ImageSquare className="lg:hidden" color="black" size={24} />
              </label>

              <Image
                crossOrigin="anonymous"
                priority={true}
                className={`${
                  open ? 'w-no_side_base_open' : 'w-no_side_base_close'
                } max-lg:w-screen h-64 cursor-default fixed top-navbar fade-img transition-ease-out-500 object-cover`}
                width={500}
                height={500}
                alt="/"
                src={coverPicView}
              />
            </div>
          )}

          {loading ? (
            <ProfileCardLoader width="400px" />
          ) : (
            <ProfileCard user={user} setUser={setUser} tagline={tagline} coverPic={coverPic} />
          )}

          <div className={`grow flex flex-col gap-12 pt-12 max-lg:pt-0`}>
            {clickedOnTagline ? (
              <div className="w-[90%] mx-auto z-50">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                  Tagline ({tagline.trim().length}/25)
                </div>
                <input
                  value={tagline}
                  onChange={el => setTagline(el.target.value)}
                  placeholder="Add a Professional One Liner"
                  maxLength={25}
                  className="w-full h-fit focus:outline-none font-bold text-5xl max-lg:text-3xl text-center dark:text-white bg-transparent z-10"
                />
                <SaveBtn setter={setClickedOnTagline} field="tagline" />
              </div>
            ) : (
              <>
                {loading ? (
                  <></>
                ) : (
                  <div
                    onClick={() => {
                      if (!clickedOnCoverPic) setClickedOnTagline(true);
                    }}
                    className={`w-[90%] mx-auto relative group rounded-lg flex-center p-4 ${
                      !clickedOnCoverPic ? 'hover:bg-[#ffffff81] cursor-pointer' : ''
                    } transition-ease-300`}
                  >
                    <PencilSimple
                      className={`absolute opacity-0 ${
                        !clickedOnCoverPic ? 'group-hover:opacity-100' : ''
                      } top-2 right-2 transition-ease-300`}
                    />
                    <div
                      className={`w-full h-fit font-bold text-5xl max-lg:text-3xl text-center dark:text-white ${
                        !clickedOnCoverPic ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      {user.tagline == '' ? 'Add a tagline!' : user.tagline}
                    </div>
                  </div>
                )}
              </>
            )}

            <TabMenu
              items={['About', 'Posts', 'Projects', 'Collaborating']}
              active={active}
              setState={setActive}
              width={'640px'}
              sticky={true}
            />

            <div className={`${active === 0 ? 'block' : 'hidden'}`}>
              {loading ? (
                <Loader />
              ) : (
                <About profile={user.profile ? user.profile : initialProfile} setUser={setUser} />
              )}
            </div>
            <div className={`${active === 1 ? 'block' : 'hidden'}`}>
              {loading ? (
                <div className="w-[45vw] mx-auto max-lg:w-[85%] max-md:w-screen max-lg:px-4 pb-2">
                  <PostsLoader />
                </div>
              ) : (
                <Posts userID={user.id} />
              )}
            </div>
            <div className={`${active === 2 ? 'block' : 'hidden'}`}>
              {loading ? <Loader /> : <Projects userID={user.id} displayOnProfile={true} />}
            </div>
            <div className={`${active === 3 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <Projects userID={user.id} contributing={true} />}
            </div>
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Profile);
