import {
  setCoverPic,
  setOnboardingStatus,
  setProfilePic,
  setReduxLinks,
  setReduxName,
  setReduxTagline,
  userSelector,
} from '@/slices/userSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL, USER_URL } from '@/config/routes';
import { ArrowLeft, ArrowRight, Buildings, Camera, ImageSquare, MapPin, X } from '@phosphor-icons/react';
import Tags from '@/components/utils/edit_tags';
import Links from '@/components/utils/edit_links';
import { SERVER_ERROR } from '@/config/errors';
import patchHandler from '@/handlers/patch_handler';
import Toaster from '@/utils/toaster';
import Head from 'next/head';
import { resizeImage } from '@/utils/resize_image';
import { setHomeTab, setOnboarding } from '@/slices/feedSlice';
import { Id } from 'react-toastify';
import { ReactSVG } from 'react-svg';
import ProgressBar from '@/components/onboarding/progress_bar';
import OrgCard from '@/components/onboarding/org_card';
import DummyUserCard from '@/components/onboarding/dummy_user_card';
import { useRouter } from 'next/router';
import { College } from '@/types';
import Input from '@/components/form/input';
import { useTheme } from 'next-themes';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';

const Onboarding = () => {
  const [clickedOnBuild, setClickedOnBuild] = useState(false);
  const user = useSelector(userSelector);
  const [name, setName] = useState(user.name);
  const [tagline, setTagline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);

  const [userPic, setUserPic] = useState<File | null>(null);
  const [userPicView, setUserPicView] = useState(USER_PROFILE_PIC_URL + '/' + user.profilePic);
  const [userCoverPic, setUserCoverPic] = useState<File | null>(null);
  const [userCoverPicView, setUserCoverPicView] = useState(USER_COVER_PIC_URL + '/' + user.coverPic);

  const [location, setLocation] = useState('');
  const [school, setSchool] = useState('');

  const [schoolSearch, setSchoolSearch] = useState('');
  const [clickedOnNewCollege, setClickedOnNewCollege] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);

  const [mutex, setMutex] = useState(false);

  const [step, setStep] = useState(1);

  const dispatch = useDispatch();

  useEffect(() => {
    if (process.env.NODE_ENV != 'development') {
      const onboardingRedirect = sessionStorage.getItem('onboarding-redirect') || '';
      if (!onboardingRedirect.startsWith('signup') && !onboardingRedirect.startsWith('home'))
        window.location.replace('/organisation/home');
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
    if (tagline != user.tagline) formData.append('tagline', tagline.trim());
    tags.forEach(tag => formData.append('tags', tag));
    links.forEach(link => formData.append('links', link));

    const URL = `${USER_URL}/me?action=onboarding`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      dispatch(setProfilePic(res.data.user.profilePic));
      dispatch(setCoverPic(res.data.user.coverPic));
      if (name != user.name) dispatch(setReduxName(name));
      if (tagline != user.tagline) dispatch(setReduxTagline(tagline));
      dispatch(setReduxLinks(links));
      dispatch(setHomeTab(1));
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

  const router = useRouter();

  const handleSubmitProfileDetails = async (toaster: Id) => {
    const formData = new FormData();

    formData.append('location', location);
    formData.append('school', school);

    const URL = `${USER_URL}/me/profile`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Profile Ready!', 1);
      router.replace('/organisation/home');
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
        else if (tagline.trim() == '') Toaster.error('Tagline cannot be empty');
        else setStep(prev => prev + 1);
        break;
      case 2:
        if (tags.length < 1) Toaster.error('Add at least 1 Tag');
        else setStep(prev => prev + 1);
        break;
      case 3:
        setStep(prev => prev + 1);
        break;
      case 4:
        setStep(prev => prev + 1);
        break;
      default:
    }
  };

  useEffect(() => {
    if (schoolSearch === '') {
      setColleges([]);
      return;
    }

    const fetchColleges = async () => {
      try {
        const response = await fetch(`/api/colleges?query=${schoolSearch}`);
        const data = await response.json();
        setColleges(data);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };

    fetchColleges();
  }, [schoolSearch]);

  const { setTheme } = useTheme();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  }, []);

  return (
    <>
      <Head>
        <title>Onboarding | Interact</title>
      </Head>

      <div
        className={`w-screen h-screen ${!clickedOnBuild ? 'overflow-y-hidden' : 'overflow-y-auto'} transition-ease-500`}
      >
        {!clickedOnBuild && (
          <div className="w-screen h-screen fixed bg_onboarding transition-ease-500 animate-fade_1" />
        )}
        {!clickedOnBuild ? (
          <div className="glassMorphism animate-fade_2 page w-fit max-md:w-[90%] h-56 max-md:h-fit px-8 py-10 font-primary flex flex-col gap-8 justify-between rounded-lg shadow-xl hover:shadow-2xl transition-ease-300 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-2">
              <div className="text-5xl font-bold max-md:leading-tight">
                Welcome to{' '}
                <span className="bg-white px-2 rounded-md">
                  <span className="text-gradient">Interact!</span>
                </span>
                🌟
              </div>
              <div>Complete your Organisation Profile and get yourself discovered!</div>
            </div>

            <div className="w-full flex items-center justify-end gap-4">
              <div
                onClick={() => setClickedOnBuild(true)}
                className={`py-2 font-medium px-4 bg-white shadow-sm hover:pr-8 hover:shadow-lg ${
                  clickedOnBuild ? 'cursor-default' : 'cursor-pointer'
                } transition-ease-300 group rounded-lg`}
              >
                <div className="w-fit flex-center gap-1 relative">
                  <div className="text-sm text-primary_black"> Click here to get started!</div>
                  <ArrowRight
                    className="absolute -right-2 opacity-0 group-hover:-right-5 group-hover:opacity-100 text-primary_black transition-ease-300"
                    weight="bold"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-fit text-primary_black dark:text-white flex justify-between items-center max-md:px-4 font-primary">
            <div className="w-3/5 max-lg:w-full h-full p-8 max-md:px-2 font-primary flex flex-col gap-8 items-center">
              <div className="w-full flex justify-start items-center">
                <div className="hidden dark:flex">
                  <ReactSVG src="/onboarding_logo_dark.svg" />
                </div>
                <div className="static dark:hidden">
                  <ReactSVG src="/onboarding_logo.svg" />
                </div>
              </div>
              <div className="w-5/6 max-md:w-full">
                <ProgressBar step={step} setStep={setStep} />
              </div>
              <div className="w-5/6 max-md:w-full max-md:max-h-full flex flex-col gap-4 backdrop-blur-xl rounded-xl shadow-xl dark:shadow-gray-600 p-6 mt-4 animate-fade_half">
                <div className="w-full flex items-center justify-between flex-wrap">
                  <div className="text-3xl max-md:text-2xl font-bold">
                    {step == 1
                      ? 'Tell Us About Your Organisation'
                      : step == 2
                      ? 'Your area of work'
                      : step == 2.5 || step == 3
                      ? 'Attach Your Socials'
                      : step == 4 && 'Pin Your Spot'}
                  </div>
                  <div className="text-base max-md:text-base font-medium">
                    {step == 2 ? `(${tags.length}/10)` : step == 3 ? `(${links.length}/5)` : ''}
                  </div>
                </div>
                {step == 1 ? (
                  <form
                    className="w-full flex flex-col gap-4"
                    onSubmit={el => {
                      el.preventDefault();
                      handleIncrementStep();
                    }}
                  >
                    <Input
                      label="Name"
                      val={name}
                      setVal={setName}
                      maxLength={25}
                      required
                      labelClassName="text-sm capitalize text-primary_black mb-1"
                    />
                    <Input
                      label="Tagline"
                      val={tagline}
                      setVal={setTagline}
                      maxLength={25}
                      required
                      placeholder="Describe yourself in one line"
                      labelClassName="text-sm capitalize text-primary_black mb-1"
                    />
                    <Pictures
                      userPic={userPic}
                      setUserPic={setUserPic}
                      userCoverPic={userCoverPic}
                      setUserCoverPic={setUserCoverPic}
                      userPicView={userPicView}
                      setUserPicView={setUserPicView}
                      userCoverPicView={userCoverPicView}
                      setUserCoverPicView={setUserCoverPicView}
                    />
                  </form>
                ) : step == 2 ? (
                  <>
                    <div className="font-medium text-sm">
                      Add <span className="underline underline-offset-2">at least one</span> and help us find you the
                      right audience!
                    </div>
                    <Tags tags={tags} setTags={setTags} onboardingDesign={true} maxTags={10} suggestions={true} />
                  </>
                ) : step == 3 ? (
                  <>
                    <div className="font-medium text-sm">Almost Done!, Add links to your socials.</div>
                    <Links links={links} setLinks={setLinks} maxLinks={5} blackBorder={true} />
                  </>
                ) : (
                  step == 4 && (
                    <>
                      {clickedOnNewCollege ? (
                        <>
                          <div className="flex items-center gap-1 font-medium text-sm">
                            <ArrowLeft
                              onClick={() => {
                                setSchool('');
                                setClickedOnNewCollege(false);
                              }}
                              className="cursor-pointer"
                            />{' '}
                            Tell us about your college and we&apos;ll add it to the list!
                          </div>
                          <div className="w-full flex flex-col gap-2">
                            <div className="w-full flex flex-col gap-1">
                              <div className="text-xs ml-1 font-semibold uppercase text-black">
                                Name of your College?
                              </div>
                              <div className="w-full flex items-center gap-2 bg-[#ffffff40] border-[1px] border-black rounded-lg p-2">
                                <Buildings size={24} weight="duotone" />
                                <input
                                  className="grow bg-transparent text-lg max-md:text-base focus:outline-none"
                                  type="text"
                                  maxLength={50}
                                  value={school}
                                  onChange={el => setSchool(el.target.value)}
                                />
                              </div>
                            </div>

                            <div className="w-full flex flex-col gap-1">
                              <div className="text-xs ml-1 font-semibold uppercase text-black">
                                Which City is the College In?
                              </div>
                              <div className="w-full flex items-center gap-2 bg-[#ffffff40] border-[1px] border-black rounded-lg p-2">
                                <MapPin size={24} weight="duotone" />
                                <input
                                  className="grow bg-transparent text-lg max-md:text-base focus:outline-none"
                                  type="text"
                                  maxLength={50}
                                  value={location}
                                  onChange={el => setLocation(el.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-sm">
                            Tell us the name of your college to help us find your niche (optional)
                          </div>
                          <div className="w-full flex items-center gap-2 bg-[#ffffff40] border-[1px] border-black rounded-lg p-2">
                            <Buildings size={24} weight="duotone" />
                            {school != '' ? (
                              <div className="grow flex justify-between items-center">
                                <div className="text-lg cursor-default">{school}</div>
                                <X onClick={() => setSchool('')} className="cursor-pointer" />
                              </div>
                            ) : (
                              <input
                                className="grow bg-transparent text-lg max-md:text-base focus:outline-none"
                                type="text"
                                maxLength={50}
                                value={schoolSearch}
                                onChange={el => setSchoolSearch(el.target.value)}
                              />
                            )}
                          </div>
                          {school == '' && schoolSearch != '' && (
                            <div className="w-full flex flex-col gap-2">
                              {/* <div
                                onClick={() => setClickedOnNewCollege(true)}
                                className="w-fit h-5 text-sm font-medium hover-underline-animation after:bg-black dark:after:bg-white cursor-pointer"
                              >
                                College not present here?
                              </div> */}

                              <div className="w-full flex flex-wrap gap-2">
                                {colleges?.map(college => (
                                  <div
                                    key={college.name}
                                    onClick={() => {
                                      setSchool(college.name);
                                      setSchoolSearch(college.name);
                                      setLocation(college.city);
                                      setColleges([]);
                                    }}
                                    className="border-[1px] border-primary_black rounded-lg px-2 py-1 text-xs cursor-pointer"
                                  >
                                    {college.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="font-medium text-sm mt-4">
                        One Last Step!, Tell us where you are situated to help build your recommendations.
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
                  )
                )}
                <div className="w-full flex items-center justify-between mt-2">
                  {step != 1 ? (
                    <div
                      onClick={() => setStep(prev => prev - 1)}
                      className="w-fit py-2 flex-center gap-2 font-medium px-4 shadow-md hover:bg-primary_comp hover:shadow-lg transition-ease-500 rounded-lg cursor-pointer"
                    >
                      <ArrowLeft weight="bold" />
                      Back
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <div className="w-fit flex items-center gap-2">
                    {step != 4 ? (
                      <div
                        onClick={handleIncrementStep}
                        className="w-fit py-2 font-medium px-8 shadow-md bg-primary_comp hover:bg-primary_comp_hover hover:shadow-lg transition-ease-500 rounded-lg cursor-pointer"
                      >
                        {step == 3 ? (links.length > 0 ? 'Next' : 'Skip') : 'Next'}
                      </div>
                    ) : (
                      <div
                        onClick={handleSubmit}
                        className="w-fit py-2 font-medium px-6 shadow-md bg-primary_comp hover:bg-primary_comp_hover hover:shadow-lg transition-ease-500 rounded-lg cursor-pointer"
                      >
                        Complete
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-2/5 fixed top-0 right-0 h-full max-md:hidden overflow-clip flex-center flex-col gap-8 bg-slate-100">
              <div className="w-full h-full absolute -top-32 flex flex-col items-center gap-4 rotate-12 animate-fade_1">
                <div className="w-[250%] flex gap-4 animate-onboarding_dummy_user_card">
                  <DummyUserCard />
                  <DummyUserCard />
                  <DummyUserCard />
                  <DummyUserCard />
                </div>
                <div className="w-[250%] flex gap-4 animate-onboarding_dummy_user_card_backwards">
                  <DummyUserCard />
                  <DummyUserCard />
                  <DummyUserCard />
                  <DummyUserCard />
                </div>
                <div className="w-[250%] flex gap-4 animate-onboarding_dummy_user_card">
                  <DummyUserCard />
                  <DummyUserCard />
                  <DummyUserCard />
                  <DummyUserCard />
                </div>
              </div>

              <div className="w-1/2 z-10 flex-center flex-col">
                <OrgCard
                  name={name}
                  username={user.username}
                  tagline={tagline}
                  profilePic={userPicView}
                  coverPic={userCoverPicView}
                  tags={tags}
                  links={links}
                  location={location}
                  school={school}
                />
                <div className="w-full text-center text-xs font-medium text-gray-500 mt-2">
                  *This is how your organisation card will be displayed to other users
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Pictures = ({
  userPic,
  setUserPic,
  userCoverPic,
  setUserCoverPic,
  userPicView,
  setUserPicView,
  userCoverPicView,
  setUserCoverPicView,
}: {
  userPic: File | null;
  setUserPic: React.Dispatch<React.SetStateAction<File | null>>;
  userCoverPic: File | null;
  setUserCoverPic: React.Dispatch<React.SetStateAction<File | null>>;
  userPicView: string;
  setUserPicView: React.Dispatch<React.SetStateAction<string>>;
  userCoverPicView: string;
  setUserCoverPicView: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const user = useSelector(userSelector);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="border-t-[1px] border-gray-500 border-dashed"></div>
      <div className="font-medium text-sm">Select your Profile and Cover Pictures (Optional)</div>
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
              const resizedPic = await resizeImage(file, 900, 300);
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
              <Camera size={20} />
              <div className="text-sm"> Upload Profile Picture</div>
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
              <ImageSquare size={20} />
              <div className="text-sm"> Upload Cover Picture</div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgOnlyAndProtect(Onboarding);
