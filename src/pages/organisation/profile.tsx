import TabMenu from '@/components/common/tab_menu';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import { initialProfile, initialUser } from '@/types/initials';
import { ORG_URL, USER_COVER_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { navbarOpenSelector } from '@/slices/feedSlice';
import Posts from '@/screens/profile/posts';
import Projects from '@/screens/profile/projects';
import { Check, ImageSquare, PencilSimple, X } from '@phosphor-icons/react';
import { resizeImage } from '@/utils/resize_image';
import ProfileCardLoader from '@/components/loaders/profile_card';
import { SERVER_ERROR } from '@/config/errors';
import Loader from '@/components/common/loader';
import patchHandler from '@/handlers/patch_handler';
import { setReduxTagline } from '@/slices/userSlice';
import PostsLoader from '@/components/loaders/posts';
import Protect from '@/utils/wrappers/protect';
import WidthCheck from '@/utils/wrappers/widthCheck';
import About from '@/screens/profile/about';
import MyAbout from '@/screens/profile/my_about';
import OrgSidebar from '@/components/common/org_sidebar';
import Events from '@/screens/profile/events';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';
import OrgCard from '@/sections/profile/org_card';
import Reviews from '@/screens/profile/reviews';
import Openings from '@/screens/profile/opening';
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

  const currentOrgID = useSelector(currentOrgIDSelector);

  const getUser = () => {
    const URL = `${ORG_URL}/${currentOrgID}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUser(res.data.organization.user);
          setTagline(res.data.organization.user.tagline);
          setCoverPicView(`${USER_COVER_PIC_URL}/${res.data.organization.user.coverPic}`);
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

    const toaster = Toaster.startLoad('Updating the Organisation...');
    const formData = new FormData();

    if (field == 'coverPic' && coverPic) formData.append('coverPic', coverPic);
    else if (field == 'tagline') formData.append('tagline', tagline);

    const URL = `${ORG_URL}/${currentOrgID}`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const coverPic = res.data.user.coverPic;

      if (field == 'tagline') dispatch(setReduxTagline(tagline));
      setUser(prev => ({
        ...prev,
        tagline: field == 'tagline' ? tagline : prev.tagline,
        coverPic,
      }));
      Toaster.stopLoad(toaster, 'Organisation Details Updated', 1);

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
      <OrgSidebar index={9} />
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
                  const resizedPic = await resizeImage(file, 900, 500);
                  setCoverPicView(URL.createObjectURL(resizedPic));
                  setCoverPic(resizedPic);
                  setClickedOnCoverPic(true);
                } else Toaster.error('Only Image Files can be selected');
              }
            }}
          />

          {loading ? (
            <></>
          ) : clickedOnCoverPic && checkOrgAccess(ORG_SENIOR) ? (
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
                width={10000}
                height={10000}
                alt="/"
                src={coverPicView}
              />
            </div>
          ) : (
            <div>
              {checkOrgAccess(ORG_SENIOR) ? (
                <label
                  htmlFor="coverPic"
                  className="w-12 h-12 absolute top-1 right-4 mt-navbar rounded-full z-10 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
                >
                  <PencilSimple className="max-lg:hidden" color="black" size={24} />
                  <ImageSquare className="lg:hidden" color="black" size={24} />
                </label>
              ) : (
                <></>
              )}

              <Image
                crossOrigin="anonymous"
                priority={true}
                className={`${
                  open ? 'w-no_side_base_open' : 'w-no_side_base_close'
                } max-lg:w-screen h-64 cursor-default fixed top-navbar fade-img transition-ease-out-500 object-cover`}
                width={10000}
                height={10000}
                alt="/"
                src={coverPicView}
              />
            </div>
          )}

          {loading ? (
            <ProfileCardLoader width="400px" />
          ) : (
            <OrgCard user={user} setUser={setUser} tagline={tagline} coverPic={coverPic} />
          )}

          <div className={`grow flex flex-col gap-12 pt-12 max-lg:pt-0`}>
            {clickedOnTagline && checkOrgAccess(ORG_SENIOR) ? (
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
              <div
                onClick={() => {
                  if (!clickedOnCoverPic) setClickedOnTagline(true);
                }}
                className={`w-[90%] mx-auto relative group rounded-lg flex-center p-4 ${
                  checkOrgAccess(ORG_SENIOR) ? (!clickedOnCoverPic ? 'hover:bg-[#ffffff81] cursor-pointer' : '') : ''
                } transition-ease-300`}
              >
                {checkOrgAccess(ORG_SENIOR) ? (
                  <PencilSimple
                    className={`absolute opacity-0 ${
                      !clickedOnCoverPic ? 'group-hover:opacity-100' : ''
                    } top-2 right-2 transition-ease-300`}
                  />
                ) : (
                  <></>
                )}

                <div
                  className={`w-full h-fit font-bold text-5xl max-lg:text-3xl text-center dark:text-white ${
                    !clickedOnCoverPic ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {user.tagline == '' ? 'Tagline Here!' : user.tagline}
                </div>
              </div>
            )}

            <TabMenu
              items={['About', 'Posts', 'Projects', 'Events', 'Reviews','Openings']}
              active={active}
              setState={setActive}
              width={open ? '640px' : '720px'}
              sticky={true}
            />

            <div className={`${active === 0 ? 'block' : 'hidden'}`}>
              {loading ? (
                <Loader />
              ) : checkOrgAccess(ORG_SENIOR) ? (
                <MyAbout profile={user.profile ? user.profile : initialProfile} setUser={setUser} org={true} />
              ) : (
                <About profile={user.profile ? user.profile : initialProfile} org={true} />
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
              {loading ? <Loader /> : <Events orgID={currentOrgID} />}
            </div>
            <div className={`${active === 4 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <Reviews orgID={currentOrgID} />}
            </div>
            <div className={`${active === 5 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <Openings orgID={currentOrgID} />}
            </div>
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Profile));
