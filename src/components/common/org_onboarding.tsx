import { setOnboarding } from '@/slices/feedSlice';
import { ArrowLeft, ArrowRight, SignIn, X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSwipeable } from 'react-swipeable';

const OrgOnboarding = () => {
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
            ? 'top-[48%]'
            : index == 4
            ? 'top-[45%]'
            : 'top-1/2'
        } max-md:top-12 w-[45%] max-lg:w-3/4 max-md:w-[90%] h-fit max-md:h-5/6 bg-white dark:bg-dark_primary_comp flex flex-col max-lg:justify-between gap-4 max-lg:gap-8 rounded-lg p-10 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 shadow-2xl translate-x-1/2 md:-translate-y-1/2 animate-fade_third z-50 max-lg:z-[60] transition-ease-500`}
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
                  <div className="font-bold text-4xl text-gray-800 dark:text-white">
                    What&apos;s in for <span className="text-gradient font-bold">Organisations?</span> 🌐
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Enhanced Exposure:</span>{' '}
                      <span>
                        Elevate your organisation&apos;s visibility within the student community and beyond. Showcase
                        your projects, events, and achievements on a platform designed to attract like-minded
                        individuals. 🚀
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">
                        Effortless Project Management:
                      </span>{' '}
                      <span>
                        Simplify project coordination with{' '}
                        <span className="text-gradient font-bold">Interact&apos;s</span> intuitive project management
                        tools. From task assignments to real-time updates, manage your organisation&apos;s projects
                        seamlessly. 🛠️
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Events Amplification:</span>{' '}
                      <span>
                        Promote your organisation&apos;s events to a targeted audience.{' '}
                        <span className="text-gradient font-bold">Interact&apos;s</span>
                        &quot;Events&quot; feature allows you to reach students interested in your organisation&apos;s
                        activities, ensuring maximum participation. 📢
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">
                        Task Assignment Made Easy:
                      </span>{' '}
                      <span>
                        Break down hefty jobs into manageable tasks and assign them to specific members with just a few
                        clicks. Ensure everyone knows their responsibilities, fostering accountability. ✅
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">
                        Real-time Progress Updates:
                      </span>{' '}
                      <span>
                        Stay informed on project progress with real-time updates. Members can mark tasks as complete,
                        providing a transparent view of accomplishments and pending work. 📊
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">
                        Centralized Communication:
                      </span>{' '}
                      <span>
                        Keep all communication within the organisation organized and accessible. No more scattered
                        emails or confusing threads—<span className="text-gradient font-bold">Interact</span> provides a
                        central hub for all communication needs. 🗣️
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Sustainable Growth:</span>{' '}
                      <span>
                        Create a sustainable model for growth. <span className="text-gradient font-bold">Interact</span>{' '}
                        provides the tools for long-term success, ensuring your organisation remains vibrant and
                        impactful throughout the academic year. 🌱
                      </span>
                    </div>
                  </div>
                </div>
              );
            case 3:
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
                      <span className="font-medium underline underline-offset-2 text-lg">Post:</span>{' '}
                      <span>
                        Manage your posts and keep your followers engaged. Share updates, thoughts, and exciting news!
                        📝
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Projects:</span>{' '}
                      <span>
                        Your project&apos;s command center! From creating and editing projects to managing openings and
                        tasks, find it all in one organized space. Need a brainstorming session? Initiate a group chat
                        and see your ideas come to life! 💡
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Events:</span>{' '}
                      <span>
                        Promote and manage your events. Reach a targeted audience and ensure maximum participation! 🗓️
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Tasks:</span>{' '}
                      <span>
                        Break down complex jobs into manageable tasks and keep everyone accountable. Effortless task
                        management! ✅
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Chats:</span>{' '}
                      <span>
                        Manage and organize your chats seamlessly. Whether it&apos;s internal discussions or
                        collaboration with external groups, keep everything neatly organized. Stay in the loop and never
                        miss an opportunity to connect! 💬
                      </span>
                    </div>

                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">Members:</span>{' '}
                      <span>
                        Manage your organisation&apos;s members. Add, remove, and organize your team effortlessly! 👥
                      </span>
                    </div>
                    <div>
                      <span className="font-medium underline underline-offset-2 text-lg">History:</span>{' '}
                      <span>
                        See a detailed history of what&apos;s happening in the organisation. Stay informed about changes
                        and updates! 📜
                      </span>
                    </div>
                  </div>
                </div>
              );
            case 4:
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
          {index == 4 ? (
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

export default OrgOnboarding;
