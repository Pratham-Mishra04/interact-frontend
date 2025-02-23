import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React, { useEffect, useState } from 'react';
import { initialProfile, initialUser as initialUserObj } from '@/types/initials';
import { BACKEND_URL, EXPLORE_URL, USER_COVER_PIC_URL, USER_PROFILE_PIC_URL, USER_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import Posts from '@/screens/profile/posts';
import Projects from '@/screens/profile/projects';
import { GetServerSidePropsContext } from 'next/types';
import ProfileCard from '@/sections/explore/profile_card';
import MyProfileCard from '@/sections/profile/profile_card';
import ProfileCardLoader from '@/components/loaders/profile_card';
import { SERVER_ERROR } from '@/config/errors';
import Loader from '@/components/common/loader';
import About from '@/screens/profile/about';
import MyAbout from '@/screens/profile/my_about';
import { setReduxTagline, userSelector } from '@/slices/userSlice';
import MenuBar from '@/components/common/menu_bar';
import PrimeWrapper from '@/wrappers/prime';
import SideBarWrapper from '@/wrappers/side';
import patchHandler from '@/handlers/patch_handler';
import { useDispatch } from 'react-redux';
import { resizeImage } from '@/utils/resize_image';
import { Check, ImageSquare, PencilSimple, X } from '@phosphor-icons/react';
import SaveButton from '@/components/buttons/save_btn';
import axios from 'axios';
import { User } from '@/types';
import { generateSEOProps } from '@/lib/seo';
import { NextSeoProps } from 'next-seo';
import ImageEditorDialog, {
  handleImageInputChange, handleImageInputClick
} from '@/components/image-editor/dialog';

interface Props {
  initialUser: User | null;
  err: string | null;
  seoProps: NextSeoProps;
}

const UserComponent = ({ initialUser, err, seoProps }: Props) => {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState(initialUser || initialUserObj);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);

  const [tagline, setTagline] = useState('');
  const [coverPic, setCoverPic] = useState<File>();
  const [coverPicView, setCoverPicView] = useState(`${USER_COVER_PIC_URL}/${user?.coverPic}`);
  const [openImageEditor, setOpenImageEditor] = useState(false);

  const loggedInUser = useSelector(userSelector);

  const [clickedOnTagline, setClickedOnTagline] = useState(false);
  const [clickedOnCoverPic, setClickedOnCoverPic] = useState(false);

  const getUser = (user: User) => {
    setLoading(true);
    const URL = user.username == loggedInUser.username ? `${USER_URL}/me` : `${EXPLORE_URL}/users/${user.username}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUser(res.data.user);
          setOrganizations(res.data.organizations);

          if (user.username == loggedInUser.username) {
            setTagline(res.data.user.tagline);
            setCoverPicView(`${USER_COVER_PIC_URL}/${res.data.user.coverPic}`);
          }

          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(() => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    if (err) Toaster.error(err, 'error_toaster');
    else if (initialUser) getUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    if (user.isOrganization) window.location.replace(`/organisations/${user.username}`);
  }, [user]);

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
    const action = new URLSearchParams(window.location.search).get('action');
    const tag = new URLSearchParams(window.location.search).get('tag');

    if (action && tag && action == 'edit' && tag == 'tagline') setClickedOnTagline(true);
  }, [window.location.search]);

  const CoverPhoto = ({ src, blurDataURL }: { src: string; blurDataURL: string }) => (
    <Image
      crossOrigin="anonymous"
      priority={true}
      width={1920}
      height={600}
      alt="User Pic"
      src={src}
      placeholder="blur"
      blurDataURL={blurDataURL || 'no-hash'}
      className="w-full cursor-default absolute fade-img -z-10 rounded-lg"
    />
  );

  return (
    <BaseWrapper title={`${user.name}`} seoProps={seoProps}>
      <Sidebar index={-1} />
      <MainWrapper restrictWidth sidebarLayout>
        <div className="w-2/3 max-md:w-full relative">
          {user.username == loggedInUser.username ? (
            <>
              {openImageEditor && coverPic && <ImageEditorDialog
                open={openImageEditor}
                setOpen={setOpenImageEditor}
                image={coverPic}
                aspectRatio={900 / 300}
                handleUpdate={(file: File, view?: string)=>{
                  if (view) setCoverPicView(view);
                  setCoverPic(file);
                  setClickedOnCoverPic(true);
                }}
              />}
              <input
                type="file"
                className="hidden"
                id="coverPic"
                multiple={false}
                onClick={handleImageInputClick}
                onChange={e=>handleImageInputChange(e, (file: File)=>{
                  setOpenImageEditor(()=>{
                    setCoverPic(file);
                    return true;
                  });
                })}
              />
              {clickedOnCoverPic ? (
                <div>
                  <div
                    onClick={() => handleSubmit('coverPic')}
                    className="w-10 h-10 absolute top-1 right-12 rounded-full z-20 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
                  >
                    <Check color="black" size={20} />
                  </div>
                  <div
                    onClick={() => {
                      setCoverPicView(`${USER_COVER_PIC_URL}/${user.coverPic}`);
                      setCoverPic(undefined);
                      setClickedOnCoverPic(false);
                    }}
                    className="w-10 h-10 absolute top-1 right-1 rounded-full z-20 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
                  >
                    <X color="black" size={20} />
                  </div>
                  <CoverPhoto src={coverPicView} blurDataURL="" />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="coverPic"
                    className="w-10 h-10 absolute top-2 right-2 rounded-full z-10 flex-center bg-white transition-ease-200 cursor-pointer opacity-50 hover:opacity-75"
                  >
                    <PencilSimple className="max-lg:hidden" color="black" size={20} />
                    <ImageSquare className="lg:hidden" color="black" size={20} />
                  </label>
                  <CoverPhoto src={`${USER_COVER_PIC_URL}/${user.coverPic}`} blurDataURL={user.coverPicBlurHash} />
                </div>
              )}
            </>
          ) : (
            <CoverPhoto src={`${USER_COVER_PIC_URL}/${user.coverPic}`} blurDataURL={user.coverPicBlurHash} />
          )}

          <div className="w-full h-24 md:my-12 font-bold text-5xl max-lg:text-3xl flex-center text-center dark:text-white">
            {user.username == loggedInUser.username ? (
              clickedOnTagline ? (
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
                  <SaveButton
                    setter={setClickedOnTagline}
                    field="tagline"
                    handleSubmit={handleSubmit}
                    checker={() => tagline == user.tagline}
                  />
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (!clickedOnCoverPic) setClickedOnTagline(true);
                  }}
                  className={`w-[90%] mx-auto relative group rounded-lg flex-center p-4 ${
                    !clickedOnCoverPic ? 'hover:bg-[#ffffff81] cursor-pointer' : ''
                  }`}
                >
                  <PencilSimple
                    className={`absolute opacity-0 ${
                      !clickedOnCoverPic ? 'group-hover:opacity-100' : ''
                    } top-2 right-2 transition-ease-300`}
                    color="black"
                    size={24}
                  />
                  <div
                    className={`w-full h-fit font-bold text-5xl max-lg:text-3xl text-center dark:text-white ${
                      !clickedOnCoverPic ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {user.tagline == '' ? 'Add a tagline!' : user.tagline}
                  </div>
                </div>
              )
            ) : (
              user.tagline
            )}
          </div>

          <MenuBar items={['About', 'Posts', 'Projects', 'Collaborating']} active={active} setState={setActive} />
          {active == 0 ? (
            <PrimeWrapper index={0} maxIndex={2}>
              {loading ? (
                <Loader />
              ) : user.username == loggedInUser.username ? (
                <MyAbout profile={user.profile ? user.profile : initialProfile} setUser={setUser} />
              ) : (
                <About profile={user.profile || initialProfile} organizations={organizations} />
              )}
            </PrimeWrapper>
          ) : active == 1 ? (
            <PrimeWrapper index={1} maxIndex={2}>
              {loading ? <Loader /> : <Posts userID={user.id} />}
            </PrimeWrapper>
          ) : active == 2 ? (
            <PrimeWrapper index={2} maxIndex={2}>
              {loading ? <Loader /> : <Projects userID={user.id} displayOnProfile={user.id == loggedInUser.id} />}
            </PrimeWrapper>
          ) : (
            active == 3 && (
              <PrimeWrapper index={3} maxIndex={3}>
                {loading ? <Loader /> : <Projects userID={user.id} contributing={true} />}
              </PrimeWrapper>
            )
          )}
        </div>
        <SideBarWrapper>
          {err ? (
            <ProfileCardLoader />
          ) : user.username == loggedInUser.username ? (
            <MyProfileCard user={user} setUser={setUser} />
          ) : (
            <ProfileCard user={user} />
          )}
        </SideBarWrapper>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default UserComponent;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { username } = context.query;

  try {
    const response = await axios.get(`${BACKEND_URL}${EXPLORE_URL}/quick/item?username=${username}`, {
      headers: {
        'X-API-KEY': process.env.API_TOKEN,
      },
    });

    const user: User = response.data.user || initialUserObj;
    const seoProps: NextSeoProps = generateSEOProps(
      {
        id: user.username,
        title: user.name,
        description: user.profile?.description || 'Interact User',
        createdAt: new Date(user.createdAt) || new Date(),
        imageUrl: `${USER_PROFILE_PIC_URL}/${user.profilePic}`,
      },
      'user'
    );

    return {
      props: {
        initialUser: response.data.user,
        err: response.data.message || null,
        seoProps,
      },
    };
  } catch (error: any) {
    //TODO token expired error
    return {
      props: {
        initialUser: null,
        err: error?.response.data.message || null,
        seoProps: {},
      },
    };
  }
}
