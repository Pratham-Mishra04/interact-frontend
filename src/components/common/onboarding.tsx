import { setOnboarding } from '@/slices/feedSlice';
import { ArrowLeft, ArrowRight, SignIn, X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSwipeable } from 'react-swipeable';

const Onboarding = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const dispatch = useDispatch();

  const swipeHandler = useSwipeable({
    onSwipedLeft: () => {
      if (index != 3) setIndex(prev => prev + 1);
      else dispatch(setOnboarding(false));
    },
    onSwipedRight: () => {
      if (index != 0) setIndex(prev => prev - 1);
    },
  });
  return (
    <>
      <div
        {...swipeHandler}
        className={`fixed ${
          index == 0
            ? 'top-[40%]'
            : index == 1
            ? 'top-[45%]'
            : index == 2
            ? 'top-[48%]'
            : index == 3
            ? 'top-[45%]'
            : 'top-1/2'
        } w-[45%] max-lg:w-3/4 h-fit md:max-h-[85%] max-md:h-screen max-md:w-screen max-md:top-0 bg-white dark:bg-dark_primary_comp flex flex-col max-lg:justify-between gap-4 max-lg:gap-8 rounded-lg p-10 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn dark:border-dark_primary_btn right-1/2 shadow-2xl translate-x-1/2 md:-translate-y-1/2 animate-fade_third z-50 max-lg:z-[60] transition-ease-500`}
      >
        {(() => {
          switch (index) {
            case 0:
              return (
                <div className="w-full flex flex-col gap-4">
                  <div className="font-bold text-4xl text-gray-800 dark:text-white">
                    Welcome to <span className="text-gradient">Interact!</span> 🚀
                  </div>
                  <div className="font-medium">
                    Excited to have you on board! 🌟 Let&apos;s embark on a journey of collaboration and creativity.
                    Ever wondered what makes <span className="text-gradient font-bold text-lg">Interact</span> unique?
                    Let&apos;s dive in! 🚀
                  </div>
                </div>
              );
            case 1:
              return (
                <div className="w-full flex flex-col gap-4">
                  <div className="font-bold text-4xl text-gray-800 dark:text-white">
                    What&apos;s <span className="text-gradient font-bold">Interact</span> All About? 🔍
                  </div>
                  <div className="font-medium flex flex-col gap-2">
                    <div>
                      At <span className="text-gradient font-bold">Interact</span>, we believe in the power of
                      collaboration. It&apos;s not just a social media platform; it&apos;s your canvas to{' '}
                      <span className="underline underline-offset-2">showcase projects</span>,{' '}
                      <span className="underline underline-offset-2">find like-minded collaborators</span>, and turn
                      ideas into reality! ✨
                    </div>
                    <div>
                      Whether you&apos;re seeking projects to join or talented individuals for your endeavors,{' '}
                      <span className="text-gradient font-bold">Interact</span> is your go-to destination. But wait,
                      there&apos;s more – <span className="underline underline-offset-2">managing your projects</span>{' '}
                      has never been this seamless! Create tasks, assign them, and communicate effectively through group
                      chats.
                    </div>
                    <div className="text-lg font-semibold">Let the collaboration begin! 🚀</div>
                  </div>
                </div>
              );
            case 2:
              return (
                <div className="w-full flex flex-col gap-4">
                  <div className="font-bold text-4xl text-gray-800 dark:text-white">Navigating the Tabs 📑</div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Home:</span>{' '}
                      <span>
                        Your personalized feed awaits! Catch up on posts from those you follow. And for a bit of
                        serendipity, explore the &quot;Discover&quot; subsection for trending content – because who
                        doesn&apos;t love a good trend? 📈
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Explore:</span>{' '}
                      <span>
                        The heart of discovery! Whether it&apos;s projects, openings, or checking out new users, this is
                        where the magic happens. Find inspiration, connect with new faces, and explore the diverse
                        talents within the Interact community. 🔍
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Workspace:</span>{' '}
                      <span>
                        Your project&apos;s command center! From creating and editing projects to managing openings and
                        tasks, find it all in one organized space. Need a brainstorming session? Initiate a group chat
                        and watch your ideas come to life! 💡
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Invitations:</span>{' '}
                      <span>
                        Your backstage pass to collaboration! All invitations, be it to join an external group chat or a
                        project, are neatly organized here. Stay in the loop with what&apos;s happening and never miss
                        an opportunity to connect. 🎟️
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Bookmark:</span>{' '}
                      <span>
                        Found something you love while exploring? Bookmark it, and it&apos;ll be waiting for you in the
                        Bookmark tab. Easy peasy! 📚
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Organisation:</span>{' '}
                      <span>
                        This tab will be available after you join organisations, and will be used to dive into whole
                        another realm of organisation management ✨
                      </span>
                    </div>
                  </div>
                </div>
              );
            case 3:
              return (
                <div className="w-full flex flex-col gap-4">
                  <div className="font-bold text-4xl text-gray-800 dark:text-white">Ready to Dive In? 🏁</div>

                  <div className="font-medium flex flex-col gap-2">
                    <div>
                      Now that you&apos;ve got the lay of the land, it&apos;s time to explore{' '}
                      <span className="text-gradient font-bold text-lg">Interact!</span>
                    </div>
                    <div>
                      Unleash your creativity, connect with amazing individuals, and let the collaboration flow. Dive
                      into your personalized feed, explore new horizons, manage your projects, and stay on top of
                      invitations and bookmarks.
                    </div>
                    <div>
                      And, if you ever run into a hiccup or just wanna say hi, we&apos;re just a message away! ✉️
                    </div>

                    <div>
                      Happy collaborating,and welcome to the{' '}
                      <span className="text-lg text-gradient font-semibold">Interact community!</span>👋
                    </div>
                  </div>
                </div>
              );
            default:
              return <></>;
          }
        })()}
        <div className="w-full flex justify-between items-center">
          {index == 0 ? (
            <div></div>
          ) : (
            <ArrowLeft onClick={() => setIndex(prev => prev - 1)} className="cursor-pointer" weight="bold" size={24} />
          )}
          {index == 3 ? (
            <SignIn onClick={() => dispatch(setOnboarding(false))} className="cursor-pointer" weight="bold" size={30} />
          ) : (
            <ArrowRight onClick={() => setIndex(prev => prev + 1)} className="cursor-pointer" weight="bold" size={24} />
          )}
        </div>
      </div>
      <div className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third cursor-default z-30 max-lg:z-[51]"></div>
    </>
  );
};

export default Onboarding;
