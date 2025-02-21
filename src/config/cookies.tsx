import { cookiesDisabledSelector, setCookiesDisabled } from '@/slices/feedSlice';
import { X } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CookiesCheck = () => {
  var cookieEnabled = navigator.cookieEnabled;
  if (!cookieEnabled) {
    document.cookie = 'cookie';
    cookieEnabled = document.cookie.indexOf('cookie') != -1;
  }

  useEffect(() => {
    if ((document.documentElement.style.overflowY = 'auto')) {
      document.documentElement.style.overflowY = 'hidden';
      document.documentElement.style.height = '100vh';

      return () => {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
      };
    }
  }, []);

  const show = useSelector(cookiesDisabledSelector);
  const dispatch = useDispatch();
  const setShow = (val: boolean) => {
    dispatch(setCookiesDisabled(val));
  };

  if (!cookieEnabled && show)
    return (
      <>
        <div className="fixed top-48 max-md:top-20 w-1/3 max-lg:w-5/6 h-fit py-4 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-2 max-lg:gap-0 rounded-lg p-8 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 shadow-lg translate-x-1/2 animate-fade_third z-50 max-lg:z-[60]">
          <div className="w-full flex justify-end">
            <X className="cursor-pointer" onClick={() => setShow(false)} size={32} />
          </div>
          <div className="w-full max-lg:h-56 lg:flex-1 flex flex-col justify-between">
            <div className="w-full flex flex-col gap-4">
              <div className="font-semibold text-4xl text-gray-800 dark:text-white">We Need Cookies! 🍪</div>
              <div className="font-medium text-sm">
                It looks like our site is feeling a bit needy without cookies. Make them happy by enabling cookies –
                they&apos;re the unsung heroes storing your login info. If not, brace yourself for a dramatic exit in 15
                minutes. 😱 #CookieDrama
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setShow(false)}
          className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-30 max-lg:z-[51]"
        ></div>
      </>
    );
  dispatch(setCookiesDisabled(false));
  return <></>;
};

export default CookiesCheck;
