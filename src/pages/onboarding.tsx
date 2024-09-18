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
import Image from 'next/image';
import { EXPLORE_URL, USER_COVER_PIC_URL, USER_PROFILE_PIC_URL, USER_URL } from '@/config/routes';
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
import UserCard from '@/components/onboarding/user_card';
import DummyUserCard from '@/components/onboarding/dummy_user_card';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import { useRouter } from 'next/router';
import { collegesData } from 'src/utils/colleges';
import { College } from '@/types';
import postHandler from '@/handlers/post_handler';
import fuzzysort from 'fuzzysort';

const Onboarding = () => {
  const [clickedOnBuild, setClickedOnBuild] = useState(false);
  const user = useSelector(userSelector);
  const [name, setName] = useState(user.name);
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [gender, setGender] = useState('');

  const [userPic, setUserPic] = useState<File | null>();
  const [userPicView, setUserPicView] = useState(USER_PROFILE_PIC_URL + '/' + user.profilePic);
  const [userCoverPic, setUserCoverPic] = useState<File | null>();
  const [userCoverPicView, setUserCoverPicView] = useState(USER_COVER_PIC_URL + '/' + user.coverPic);

  const [location, setLocation] = useState('Vellore');
  const [school, setSchool] = useState('');

  const [schoolSearch, setSchoolSearch] = useState('');
  const [clickedOnNewCollege, setClickedOnNewCollege] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);

  const [mutex, setMutex] = useState(false);

  const [step, setStep] = useState(1);

  const dispatch = useDispatch();

  const handleAddCollege = () => {
    const URL = `${EXPLORE_URL}/colleges`;
    postHandler(URL, { name: school, city: location }, 'multipart/form-data');
    setClickedOnNewCollege(false);
  };

  useEffect(() => {
    if (process.env.NODE_ENV != 'development') {
      const onboardingRedirect = sessionStorage.getItem('onboarding-redirect') || '';
      if (!onboardingRedirect.startsWith('signup') && !onboardingRedirect.startsWith('home'))
        window.location.replace('/home');
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
    if (bio != user.bio) formData.append('description', bio.trim());
    if (tagline != user.tagline) formData.append('tagline', tagline.trim());
    if (gender != '') formData.append('gender', gender);
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
        else setStep(prev => prev + 0.5);
        break;
      case 2.5:
        if (gender == '') Toaster.error('Select a Gender');
        else setStep(prev => prev + 0.5);
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
        // if (links.length < 1) Toaster.error('Add at least 1 Link');
        // else
        setStep(prev => prev + 1);
        break;
      case 7:
        if (location.trim() == '') Toaster.error('Location cannot be empty');
        else setStep(prev => prev + 1);
        break;
      case 8:
        if (clickedOnNewCollege) handleAddCollege();
        setStep(prev => prev + 1);
        break;
      default:
    }
  };

  useEffect(() => {
    if (schoolSearch == '') setColleges([]);
    else {
      const results = fuzzysort.go(schoolSearch, collegesData, { key: 'fuzzy', limit: 10 });
      setColleges(results.map(result => result.obj));
    }
  }, [schoolSearch]);

  return (
    <>
      <Head>
        <title>Onboarding | Interact</title>
      </Head>
      {/* <div className="w-screen h-screen bg-wavy bg-moving-gradient z-50"></div> */}
      <div
        className={`w-screen h-screen ${
          !clickedOnBuild ? 'bg-moving-gradient overflow-y-hidden' : 'overflow-y-auto'
        } transition-ease-500`}
      >
        {!clickedOnBuild && <ReactSVG className="w-screen h-screen fixed opacity-25" src="/pattern.svg" />}
        {!clickedOnBuild ? (
          <div className="glassMorphism animate-fade_1 page w-fit max-md:w-[90%] h-56 max-md:h-72 px-8 py-10 font-primary flex flex-col justify-between rounded-lg shadow-xl hover:shadow-2xl transition-ease-300 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-2">
              <div className="text-5xl font-bold max-md:leading-tight">
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
                className={`py-2 font-medium px-4 backdrop-blur-xl shadow-sm hover:pr-8 hover:shadow-lg ${
                  clickedOnBuild ? 'cursor-default' : 'cursor-pointer'
                } transition-ease-300 group rounded-lg`}
              >
                <div className="w-fit flex gap-1 relative">
                  <div className="text-sm"> Let&apos;s get Started!</div>
                  <ArrowRight
                    className="absolute -right-2 opacity-0 group-hover:-right-5 group-hover:opacity-100 transition-ease-300"
                    weight="bold"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex justify-between items-center max-md:px-4 font-primary ">
            <div className="w-3/5 max-lg:w-full h-full p-12 max-md:px-2 font-primary flex flex-col gap-16 items-center">
              <div className="w-full flex justify-start items-center gap-1">
                <ReactSVG src="/onboarding_logo.svg" />
                {/* <div className="text-gradient text-xl font-semibold">Onboarding</div> */}
              </div>
              <div className="w-5/6 max-md:w-full">
                <ProgressBar step={step} setStep={setStep} />
              </div>
              <div className="w-5/6 max-md:w-full max-md:max-h-full flex flex-col gap-4 backdrop-blur-xl rounded-xl shadow-xl p-8 mt-8 animate-fade_half">
                <div className="w-full flex items-center justify-between flex-wrap">
                  <div className={`${step == 2 ? 'text-4xl' : 'text-5xl'} max-md:text-3xl font-bold`}>
                    {step == 1
                      ? "What's your name?"
                      : step == 2
                      ? 'Describe yourself in one line '
                      : step == 2.5 || step == 3
                      ? 'Tell Us About Yourself'
                      : step == 4
                      ? 'Your skills/interests'
                      : step == 5
                      ? 'Add a Profile Picture'
                      : step == 6
                      ? 'Attach Your Socials'
                      : step == 7
                      ? 'Pin Your Spot'
                      : step == 8 && 'About Your College'}
                  </div>
                  <div className="text-base max-md:text-base font-medium">
                    {step == 1
                      ? `(${name.trim().length}/25)`
                      : step == 2
                      ? `(${tagline.trim().length}/25)`
                      : step == 3
                      ? `(${bio.trim().length}/1500)`
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
                ) : step == 2.5 ? (
                  <>
                    <div className="font-medium text-sm">Please select your gender</div>
                    <div className="flex flex-col items-start gap-4 overflow-hidden rounded-md p-6 shadow-sm shadow-[#00000050]">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-[50px] w-[50px] items-center justify-center">
                          <input
                            type="radio"
                            id="radio"
                            name="gender"
                            value={gender}
                            checked={gender == 'male'}
                            onClick={() => setGender('male')}
                            className="peer z-10 h-full w-full cursor-pointer opacity-0"
                          />
                          <div className="absolute h-full w-full rounded-full bg-blue-100 p-4 shadow-sm shadow-[#00000050] ring-blue-400 duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-blue-200 duration-500 peer-checked:scale-[500%]"></div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50px"
                            height="50px"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="absolute stroke-blue-400"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M15.5631 16.1199C14.871 16.81 13.9885 17.2774 13.0288 17.462C12.0617 17.6492 11.0607 17.5459 10.1523 17.165C8.29113 16.3858 7.07347 14.5723 7.05656 12.5547C7.04683 11.0715 7.70821 9.66348 8.8559 8.72397C10.0036 7.78445 11.5145 7.4142 12.9666 7.71668C13.9237 7.9338 14.7953 8.42902 15.4718 9.14008C16.4206 10.0503 16.9696 11.2996 16.9985 12.6141C17.008 13.9276 16.491 15.1903 15.5631 16.1199Z"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path d="M14.9415 8.60977C14.6486 8.90266 14.6486 9.37754 14.9415 9.67043C15.2344 9.96332 15.7093 9.96332 16.0022 9.67043L14.9415 8.60977ZM18.9635 6.70907C19.2564 6.41617 19.2564 5.9413 18.9635 5.64841C18.6706 5.35551 18.1958 5.35551 17.9029 5.64841L18.9635 6.70907ZM16.0944 5.41461C15.6802 5.41211 15.3424 5.74586 15.3399 6.16007C15.3374 6.57428 15.6711 6.91208 16.0853 6.91458L16.0944 5.41461ZM18.4287 6.92872C18.8429 6.93122 19.1807 6.59747 19.1832 6.18326C19.1857 5.76906 18.8519 5.43125 18.4377 5.42875L18.4287 6.92872ZM19.1832 6.17421C19.1807 5.76001 18.8429 5.42625 18.4287 5.42875C18.0145 5.43125 17.6807 5.76906 17.6832 6.18326L19.1832 6.17421ZM17.6973 8.52662C17.6998 8.94082 18.0377 9.27458 18.4519 9.27208C18.8661 9.26958 19.1998 8.93177 19.1973 8.51756L17.6973 8.52662ZM16.0022 9.67043L18.9635 6.70907L17.9029 5.64841L14.9415 8.60977L16.0022 9.67043ZM16.0853 6.91458L18.4287 6.92872L18.4377 5.42875L16.0944 5.41461L16.0853 6.91458ZM17.6832 6.18326L17.6973 8.52662L19.1973 8.51756L19.1832 6.17421L17.6832 6.18326Z"></path>
                          </svg>
                        </div>
                        <div className="relative flex h-[50px] w-[50px] items-center justify-center">
                          <input
                            type="radio"
                            id="radio"
                            name="gender"
                            value={gender}
                            checked={gender == 'female'}
                            onClick={() => setGender('female')}
                            className="peer z-10 h-full w-full cursor-pointer opacity-0"
                          />
                          <div className="absolute h-full w-full rounded-full bg-pink-100 p-2 shadow-sm shadow-[#00000050] ring-pink-400 duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-pink-200 duration-500 peer-checked:scale-[500%]"></div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="35px"
                            height="35px"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="absolute fill-pink-400"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M20 9C20 13.0803 16.9453 16.4471 12.9981 16.9383C12.9994 16.9587 13 16.9793 13 17V19H14C14.5523 19 15 19.4477 15 20C15 20.5523 14.5523 21 14 21H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V21H10C9.44772 21 9 20.5523 9 20C9 19.4477 9.44772 19 10 19H11V17C11 16.9793 11.0006 16.9587 11.0019 16.9383C7.05466 16.4471 4 13.0803 4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9ZM6.00365 9C6.00365 12.3117 8.68831 14.9963 12 14.9963C15.3117 14.9963 17.9963 12.3117 17.9963 9C17.9963 5.68831 15.3117 3.00365 12 3.00365C8.68831 3.00365 6.00365 5.68831 6.00365 9Z"
                            ></path>
                          </svg>
                        </div>
                        <div className="relative flex h-[50px] w-[50px] items-center justify-center">
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={gender == 'none-binary'}
                            onClick={() => setGender('none-binary')}
                            className="peer z-10 h-full w-full cursor-pointer opacity-0"
                          />
                          <div className="absolute h-full w-full rounded-full bg-purple-100 p-2 shadow-sm shadow-[#00000050] ring-purple-400 duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-purple-200 duration-500 peer-checked:scale-[500%]"></div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            width="40px"
                            height="40px"
                            viewBox="0 0 512 512"
                            version="1.1"
                            className="absolute fill-purple-400"
                          >
                            <g id="drop" transform="translate(42.666667, 70.248389)">
                              <path d="M226.597,200.834611 L296.853333,271.084945 L353.819,271.084 L326.248389,243.503223 L356.418278,213.333333 L435.503223,292.418278 L356.418278,371.503223 L326.248389,341.333333 L353.82,313.751 L279.163435,313.751611 L196.418,231.011611 L226.597,200.834611 Z M356.418278,1.42108547e-14 L435.503223,79.0849447 L356.418278,158.169889 L326.248389,128 L353.82,100.418 L296.853333,100.418278 L83.503232,313.751611 L-1.0658141e-13,313.751611 L-1.03968831e-13,271.084945 L65.8133333,271.084945 L279.163435,57.7516113 L353.82,57.751 L326.248389,30.1698893 L356.418278,1.42108547e-14 Z M83.503232,57.7516113 L166.248,140.490611 L136.069,170.667611 L65.8133333,100.418278 L-1.0658141e-13,100.418278 L-1.0658141e-13,57.7516113 L83.503232,57.7516113 Z"></path>
                            </g>
                          </svg>
                        </div>
                        <div className="relative flex h-[50px] w-[50px] items-center justify-center">
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={gender == 'none'}
                            onClick={() => setGender('none')}
                            className="peer z-10 h-full w-full cursor-pointer opacity-0"
                          />
                          <div className="absolute h-full w-full rounded-full bg-neutral-100 p-2 shadow-sm shadow-[#00000050] ring-neutral-400 duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-neutral-200 duration-500 peer-checked:scale-[500%]"></div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50px"
                            height="50px"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="absolute stroke-neutral-400"
                          >
                            <path
                              id="Vector"
                              d="M8.19531 8.76498C8.42304 8.06326 8.84053 7.43829 9.40137 6.95899C9.96221 6.47968 10.6444 6.16501 11.373 6.0494C12.1017 5.9338 12.8486 6.02202 13.5303 6.3042C14.2119 6.58637 14.8016 7.05166 15.2354 7.64844C15.6691 8.24521 15.9295 8.95008 15.9875 9.68554C16.0455 10.421 15.8985 11.1581 15.5636 11.8154C15.2287 12.4728 14.7192 13.0251 14.0901 13.4106C13.4611 13.7961 12.7377 14.0002 12 14.0002V14.9998M12.0498 19V19.1L11.9502 19.1002V19H12.0498Z"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : step == 3 ? (
                  <>
                    <textarea
                      className="bg-[#ffffff40] h-[96px] min-h-[96px] max-h-64 placeholder:text-[#202020c6] border-[1px] border-black rounded-lg p-2 focus:outline-none"
                      maxLength={1500}
                      placeholder="Write yourself a bio"
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
                    <Tags tags={tags} setTags={setTags} onboardingDesign={true} maxTags={5} suggestions={true} />
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
                  step == 8 && (
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
                                className="w-fit h-5 text-sm font-medium hover-underline-animation after:bg-black cursor-pointer"
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
                    </>
                  )
                )}
                <div className="w-full flex items-center justify-between">
                  {step != 1 ? (
                    <div
                      onClick={() =>
                        setStep(prev => {
                          if (prev == 2.5 || prev == 3) return prev - 0.5;
                          return prev - 1;
                        })
                      }
                      className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-primary_comp hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
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
                        className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-primary_comp hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                      >
                        skip
                      </div>
                    ) : (
                      <div></div>
                    )}

                    {step != 8 ? (
                      <div
                        onClick={handleIncrementStep}
                        className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-primary_comp hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                      >
                        continue
                      </div>
                    ) : (
                      <div
                        onClick={handleSubmit}
                        className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-primary_comp hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
                      >
                        complete
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

              <div className="w-5/6 z-10">
                <UserCard
                  name={name}
                  username={user.username}
                  tagline={tagline}
                  bio={bio}
                  profilePic={userPicView}
                  coverPic={userCoverPicView}
                  tags={tags}
                  links={links}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NonOrgOnlyAndProtect(Onboarding);
