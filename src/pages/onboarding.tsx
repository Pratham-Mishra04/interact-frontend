import {
  setCoverPic,
  setOnboardingStatus,
  setProfilePic,
  setReduxBio,
  setReduxLinks,
  setReduxName,
  setReduxTagline,
  userSelector,
} from '@/slices/userSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL, USER_URL } from '@/config/routes';
import getDomainName from '@/utils/funcs/get_domain_name';
import getIcon from '@/utils/funcs/get_icon';
import { Camera, Check, ImageSquare, MapPin, X } from '@phosphor-icons/react';
import Tags from '@/components/utils/edit_tags';
import Links from '@/components/utils/edit_links';
import { SERVER_ERROR } from '@/config/errors';
import patchHandler from '@/handlers/patch_handler';
import Toaster from '@/utils/toaster';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { resizeImage } from '@/utils/resize_image';
import Protect from '@/utils/wrappers/protect';
import WidthCheck from '@/utils/wrappers/widthCheck';
import { setOnboarding } from '@/slices/feedSlice';
import { Id } from 'react-toastify';

const Onboarding = () => {
  const [clickedOnBuild, setClickedOnBuild] = useState(false);
  const user = useSelector(userSelector);
  const [name, setName] = useState(user.name);
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);

  const [userPic, setUserPic] = useState<File | null>();
  const [userPicView, setUserPicView] = useState(USER_PROFILE_PIC_URL + '/' + user.profilePic);
  const [userCoverPic, setUserCoverPic] = useState<File | null>();
  const [userCoverPicView, setUserCoverPicView] = useState(USER_COVER_PIC_URL + '/' + user.coverPic);

  const [location, setLocation] = useState('Vellore');

  const [mutex, setMutex] = useState(false);

  const [step, setStep] = useState(1);

  const router = useRouter();

  const dispatch = useDispatch();

  useEffect(() => {
    if (process.env.NODE_ENV != 'development') {
      const onboardingRedirect = sessionStorage.getItem('onboarding-redirect') || '';
      if (!onboardingRedirect.startsWith('signup') && !onboardingRedirect.startsWith('home')) router.replace('/home');
      return () => {
        if (onboardingRedirect) sessionStorage.removeItem('onboarding-redirect');
      };
    }
  }, []);

  const handleSubmit = async () => {
    if (location.trim() == '') {
      Toaster.error('Location cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Setting your Profile...');

    const formData = new FormData();
    if (userPic) formData.append('profilePic', userPic);
    if (userCoverPic) formData.append('coverPic', userCoverPic);
    if (name != user.name) formData.append('name', name.trim());
    if (bio != user.bio) formData.append('bio', bio.trim());
    if (tagline != user.tagline) formData.append('tagline', tagline.trim());
    tags.forEach(tag => formData.append('tags', tag));
    links.forEach(link => formData.append('links', link));

    const URL = `${USER_URL}/me?action=onboarding`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      dispatch(setProfilePic(res.data.user.profilePic));
      dispatch(setCoverPic(res.data.user.coverPic));
      if (name != user.name) dispatch(setReduxName(name));
      if (bio != user.bio) dispatch(setReduxBio(bio));
      if (tagline != user.tagline) dispatch(setReduxTagline(tagline));
      dispatch(setReduxLinks(links));
      dispatch(setOnboarding(true));
      dispatch(setOnboardingStatus(true));

      await handleSubmitProfileDetails(toaster);
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

  const handleSubmitProfileDetails = async (toaster: Id) => {
    const formData = new FormData();

    formData.append('location', location);

    const URL = `${USER_URL}/me/profile`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Profile Ready!', 1);
      router.replace('/home');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleIncrementStep = () => {
    switch (step) {
      case 1:
        if (name.trim() == '') Toaster.error('Name cannot be empty');
        else setStep(prev => prev + 1);
        break;
      case 2:
        if (tagline.trim() == '') Toaster.error('Tagline cannot be empty');
        else setStep(prev => prev + 1);
        break;
      case 3:
        setStep(prev => prev + 1);
        break;
      case 4:
        if (tags.length < 3) Toaster.error('Add at least 3 Tags');
        else setStep(prev => prev + 1);
        break;
      case 5:
        setStep(prev => prev + 1);
        break;
      case 6:
        //TODO fix enter UX issue
        // if (links.length < 1) Toaster.error('Add at least 1 Link');
        // else
        setStep(prev => prev + 1);
        break;
      case 7:
        // if (clickedOnNewCollege) handleAddCollege();
        setStep(prev => prev + 1);
        break;
      case 8:
        if (location.trim() == '') Toaster.error('Location cannot be empty');
        else setStep(prev => prev + 1);
        break;
      default:
    }
  };

  const steps: string[] = ['name', 'tagline', 'bio', 'skills', 'profilePic', 'socials', 'location'];

  return (
    <>
      <Head>
        <title>Onboarding | Interact</title>
      </Head>
      <div className="w-screen h-screen overflow-y-auto">
        {!clickedOnBuild ? (
          <div className="bg-slate-100 animate-fade_1 page w-fit max-md:w-[90%] h-64 max-md:h-72 px-8 py-10 font-primary flex flex-col justify-between rounded-lg shadow-xl hover:shadow-2xl transition-ease-300 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-2">
              <div className="text-5xl font-bold">
                Welcome to{' '}
                <span className="bg-white px-2 rounded-md">
                  <span className="text-gradient">Interact!</span>
                </span>
                🌟
              </div>
              <div>Complete your Profile and get yourself discovered!</div>
            </div>

            <div className="w-full flex items-center justify-end gap-4">
              <div
                onClick={() => setClickedOnBuild(true)}
                className={`py-2 font-medium px-4 backdrop-blur-xl hover:shadow-lg ${
                  clickedOnBuild ? 'cursor-default' : 'cursor-pointer'
                } transition-ease-300 rounded-xl`}
              >
                Let&apos;s get Started!
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex justify-between font-primary items-center absolute top-0 left-0 px-24 py-4 max-md:px-4 animate-fade_half">
            <div className="w-[90%] max-md:hidden flex flex-col absolute top-12 right-1/2 translate-x-1/2">
              <div className="w-full h-full relative">
                <div className="w-full flex justify-between z-[1]">
                  {steps.map((title, index) => (
                    <div key={index} className="flex flex-col gap-1 items-center relative">
                      <div
                        onClick={() => {
                          if (step - 1 > index) setStep(index + 1);
                        }}
                        className={`w-8 h-8 rounded-full flex-center ${
                          step - 1 > index
                            ? ' bg-blue-300 border-blue-200'
                            : step - 1 == index
                            ? 'bg-white border-primary_comp_hover'
                            : 'bg-white border-primary_comp'
                        } border-4 transition-ease-300 delay-500 ${step - 1 > index && 'cursor-pointer'}`}
                      >
                        <Check
                          className={`${step - 1 > index ? 'opacity-100' : 'opacity-0'} transition-ease-300 delay-300`}
                          weight="bold"
                        />
                      </div>
                      <div className="w-fit absolute -bottom-4 translate-y-1/2 text-sm font-medium">{title}</div>
                    </div>
                  ))}
                </div>
                <div
                  style={{ width: `${((step - 1) * 100) / (steps.length - 1)}%` }}
                  className="w-full h-2 bg-primary_comp_active absolute top-1/2 -translate-y-1/2 -z-[1] rounded-xl transition-ease-500"
                ></div>
                <div className="w-full h-2 bg-primary_comp_active absolute top-1/2 -translate-y-1/2 -z-[1] rounded-xl opacity-25"></div>
              </div>
            </div>
            <div className="w-1/2 max-md:w-full max-md:max-h-full flex flex-col gap-4 backdrop-blur-xl rounded-xl shadow-xl p-8 overflow-y-auto animate-fade_half">
              <div className="w-full flex items-center justify-between flex-wrap">
                <div className="text-5xl max-md:text-3xl font-bold">
                  {step == 1
                    ? "What's your name?"
                    : step == 2
                    ? 'Your One-Liner '
                    : step == 3
                    ? 'Tell Us About Yourself'
                    : step == 4
                    ? 'Your skills/interests'
                    : step == 5
                    ? 'Add a Profile Picture'
                    : step == 6
                    ? 'Attach Your Socials'
                    : step == 7
                    ? 'Pin Your Spot'
                    : ''}
                </div>
                <div className="text-base max-md:text-base font-medium">
                  {step == 1
                    ? `(${name.trim().length}/25)`
                    : step == 2
                    ? `(${tagline.trim().length}/25)`
                    : step == 3
                    ? `(${bio.trim().length}/500)`
                    : step == 4
                    ? `(${tags.length}/10)`
                    : step == 5
                    ? ''
                    : step == 6
                    ? `(${links.length}/3)`
                    : step == 7
                    ? `(${location.length}/25)`
                    : ''}
                </div>
              </div>

              {step == 1 ? (
                <form
                  className="w-full"
                  onSubmit={el => {
                    el.preventDefault();
                    handleIncrementStep();
                  }}
                >
                  <input
                    className="w-full bg-[#ffffff40] border-[1px] text-lg max-md:text-base border-black rounded-lg p-2 focus:outline-none"
                    type="text"
                    maxLength={25}
                    value={name}
                    onChange={el => setName(el.target.value)}
                  />
                </form>
              ) : step == 2 ? (
                <form
                  className="w-full"
                  onSubmit={el => {
                    el.preventDefault();
                    handleIncrementStep();
                  }}
                >
                  <input
                    className="w-full bg-[#ffffff40] placeholder:text-[#202020c6] border-[1px] text-lg max-md:text-base border-black rounded-lg p-2 focus:outline-none"
                    type="text"
                    maxLength={25}
                    placeholder="A Professional Tagline"
                    value={tagline}
                    onChange={el => setTagline(el.target.value)}
                  />
                </form>
              ) : step == 3 ? (
                <>
                  <textarea
                    className="bg-[#ffffff40] h-[96px] min-h-[96px] max-h-64 placeholder:text-[#202020c6] border-[1px] border-black rounded-lg p-2 focus:outline-none"
                    maxLength={500}
                    placeholder="Write yourself a short bio"
                    value={bio}
                    onChange={el => setBio(el.target.value)}
                  />
                </>
              ) : step == 4 ? (
                <>
                  <div className="font-medium text-sm">
                    Add <span className="underline underline-offset-2">at least three</span> and help us build your
                    recommendations!
                  </div>
                  <Tags tags={tags} setTags={setTags} onboardingDesign={true} maxTags={10} suggestions={true} />
                </>
              ) : step == 5 ? (
                <>
                  <input
                    type="file"
                    className="hidden"
                    id="userPic"
                    multiple={false}
                    onChange={async ({ target }) => {
                      if (target.files && target.files[0]) {
                        const file = target.files[0];
                        if (file.type.split('/')[0] == 'image') {
                          const resizedPic = await resizeImage(file, 500, 500);
                          setUserPicView(URL.createObjectURL(resizedPic));
                          setUserPic(resizedPic);
                        } else Toaster.error('Only Image Files can be selected');
                      }
                    }}
                  />
                  <input
                    type="file"
                    className="hidden"
                    id="userCoverPic"
                    multiple={false}
                    onChange={async ({ target }) => {
                      if (target.files && target.files[0]) {
                        const file = target.files[0];
                        if (file.type.split('/')[0] == 'image') {
                          const resizedPic = await resizeImage(file, 900, 500);
                          setUserCoverPicView(URL.createObjectURL(resizedPic));
                          setUserCoverPic(resizedPic);
                        } else Toaster.error('Only Image Files can be selected');
                      }
                    }}
                  />
                  <div className="w-full flex flex-col gap-1">
                    <div className="relative flex items-center gap-2 hover:bg-primary_comp transition-ease-300 p-2 rounded-md">
                      {userPic ? (
                        <div className="w-full flex flex-col gap-4 px-2 py-1">
                          <Image
                            crossOrigin="anonymous"
                            width={500}
                            height={500}
                            alt={'User Pic'}
                            src={userPicView}
                            className={`rounded-full md:hidden max-md:mx-auto w-32 h-32 cursor-default`}
                          />
                          <div className="w-full flex items-center gap-2">
                            <label className="grow cursor-pointer flex items-center gap-1" htmlFor="userPic">
                              <Camera size={24} />
                              {userPic.name}
                            </label>
                            <X
                              onClick={() => {
                                setUserPic(null);
                                setUserPicView(USER_PROFILE_PIC_URL + '/' + user.profilePic);
                              }}
                              className="cursor-pointer"
                              size={20}
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="w-full flex items-center gap-2 cursor-pointer" htmlFor="userPic">
                          <Camera size={24} />
                          <div> Upload Profile Picture</div>
                        </label>
                      )}
                    </div>
                    <div className="relative flex items-center gap-2 hover:bg-primary_comp transition-ease-300 p-2 rounded-md">
                      {userCoverPic ? (
                        <div className="w-full flex flex-col gap-4 px-2 py-1">
                          <Image
                            crossOrigin="anonymous"
                            width={500}
                            height={500}
                            alt={'User Pic'}
                            src={userCoverPicView}
                            className={`rounded-lg md:hidden max-md:mx-auto w-5/6 h-32 cursor-default`}
                          />
                          <div className="w-full flex items-center gap-2">
                            <label className="grow cursor-pointer flex items-center gap-1" htmlFor="userCoverPic">
                              <ImageSquare size={24} />
                              {userCoverPic.name}
                            </label>
                            <X
                              onClick={() => {
                                setUserPic(null);
                                setUserPicView(USER_PROFILE_PIC_URL + '/' + user.coverPic);
                              }}
                              className="cursor-pointer"
                              size={20}
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="w-full flex items-center gap-2 cursor-pointer" htmlFor="userCoverPic">
                          <ImageSquare size={24} />
                          <div> Upload Cover Picture</div>
                        </label>
                      )}
                    </div>
                  </div>
                </>
              ) : step == 6 ? (
                <>
                  <div className="font-medium text-sm">
                    Almost Done!, Add
                    {/* <span className="underline underline-offset-2">at least one</span>  */} links to your socials.
                  </div>
                  <Links links={links} setLinks={setLinks} maxLinks={3} blackBorder={true} />
                </>
              ) : step == 7 ? (
                <>
                  <div className="font-medium text-sm">
                    One Last Step!, Tell us where are are situated to help build your recommendations.
                  </div>
                  <div className="w-full flex items-center gap-2 bg-[#ffffff40] border-[1px] border-black rounded-lg p-2">
                    <MapPin size={24} weight="duotone" />
                    <input
                      className="grow bg-transparent text-lg max-md:text-base focus:outline-none"
                      type="text"
                      maxLength={25}
                      value={location}
                      onChange={el => setLocation(el.target.value)}
                    />
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className="w-full flex items-center justify-between">
                {step != 1 ? (
                  <div
                    onClick={() => setStep(prev => prev - 1)}
                    className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-[#ffffff40] hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                  >
                    prev
                  </div>
                ) : (
                  <div></div>
                )}
                <div className="w-fit flex items-center gap-2">
                  {step == 3 || step == 5 || step == 6 ? (
                    <div
                      onClick={handleIncrementStep}
                      className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-[#ffffff40] hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                    >
                      skip
                    </div>
                  ) : (
                    <div></div>
                  )}

                  {step != 7 ? (
                    <div
                      onClick={handleIncrementStep}
                      className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-[#ffffff40] hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                    >
                      continue
                    </div>
                  ) : (
                    <div
                      onClick={handleSubmit}
                      className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-[#ffffff40] hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                    >
                      complete
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`w-1/3 h-fit ${
                tagline ? 'pb-8' : 'pb-4'
              } gap-2 mt-4 shadow-2xl font-primary flex flex-col items-center animate-fade_half backdrop-blur-xl max-md:hidden rounded-md`}
            >
              <div className="w-full relative">
                <Image
                  crossOrigin="anonymous"
                  width={500}
                  height={500}
                  alt={'User Pic'}
                  src={userCoverPicView}
                  className="w-full h-44 rounded-t-md"
                />

                <div className="w-full flex items-center gap-2 absolute -translate-y-1/3 px-8">
                  <Image
                    crossOrigin="anonymous"
                    className="w-32 h-32 rounded-full border-4 border-white"
                    width={100}
                    height={100}
                    alt="Profile Pic"
                    src={userPicView}
                  />
                  <div className="w-full flex flex-col gap-1 pt-8">
                    <div className="text-3xl font-semibold line-clamp-1">{name}</div>
                    <div className="text-sm font-medium text-gray-600">@{user.username}</div>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col items-center gap-4 pt-20 px-8">
                {tagline && <div className="font-medium text-lg text-center break-words">{tagline}</div>}

                {bio && (
                  <>
                    <div className="w-full border-t-[1px] border-dashed border-primary_black"></div>
                    <div className="w-full text-sm text-center line-clamp-6">{bio}</div>
                  </>
                )}

                {tags.length > 0 && (
                  <>
                    <div className="w-full border-t-[1px] border-dashed border-primary_black"></div>
                    <div className="w-full gap-2 flex flex-wrap items-center justify-center">
                      {tags.map(tag => {
                        return (
                          <div
                            className="flex-center text-xs text-primary_black px-2 py-1 border-[1px] border-primary_black  rounded-md"
                            key={tag}
                          >
                            {tag}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {links.length > 0 && (
                  <div className="w-full gap-2 flex flex-wrap items-center justify-center">
                    {links.map((link, index) => {
                      return (
                        <Link
                          href={link}
                          target="_blank"
                          key={index}
                          className="w-fit h-8 border-[1px] text-primary_black border-primary_black rounded-lg text-sm px-2 py-4 flex items-center gap-2"
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
          </div>
        )}
      </div>
    </>
  );
};

export default Protect(Onboarding);
