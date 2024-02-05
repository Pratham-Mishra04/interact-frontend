import PostComponent from '@/components/home/post';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { Announcement, Poll, Post } from '@/types';
import Toaster from '@/utils/toaster';
import { Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import NewPost from '@/sections/home/new_post';
import ProfileCard from '@/sections/home/profile_card';
import { navbarOpenSelector } from '@/slices/feedSlice';
import RePostComponent from '@/components/home/repost';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import NoFeed from '@/components/empty_fillers/feed';
import { SERVER_ERROR } from '@/config/errors';
import PostsLoader from '@/components/loaders/posts';
import PollCard from '@/components/organization/poll_card';
import { initialOrganization } from '@/types/initials';
import AnnouncementCard from '@/components/organization/announcement';

const Feed = () => {
  const [feed, setFeed] = useState<(Post | Announcement | Poll)[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [clickedOnNewPost, setClickedOnNewPost] = useState(false);
  const [loading, setLoading] = useState(true);

  let profilePic = useSelector(userSelector).profilePic;

  const open = useSelector(navbarOpenSelector);

  const getFeed = () => {
    const URL = `/feed/combined?page=${page}&limit=${5}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const addedFeed = [...feed, ...(res.data.feed || [])];
          if (addedFeed.length === feed.length) setHasMore(false);
          setFeed(addedFeed);
          setPage(prev => prev + 1);
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

  useEffect(() => {
    getFeed();
    profilePic = profilePic == '' ? 'default.jpg' : profilePic;
  }, []);

  return (
    <div className={`w-full max-md:w-[95%] max-md:mx-auto flex ${open ? 'gap-2' : 'gap-12'} transition-ease-out-500`}>
      {clickedOnNewPost ? <NewPost setFeed={setFeed} setShow={setClickedOnNewPost} /> : <></>}
      {/* Create a New Post */}
      <div className="w-[50vw] px-6 max-lg:w-[80vw] max-md:px-0 max-md:w-screen flex flex-col gap-2">
        <div
          onClick={() => setClickedOnNewPost(true)}
          className="w-full h-taskbar mx-auto shadow-md hover:shadow-lg transition-ease-300 text-gray-400 dark:text-gray-200 bg-white dark:bg-gradient-to-l dark:from-dark_primary_gradient_start dark:to-dark_primary_gradient_end px-4 max-md:px-2 py-3 rounded-lg cursor-pointer border-gray-300 border-[1px] dark:border-0 dark:hover:shadow-outer dark:shadow-outer flex justify-between items-center"
        >
          <div className="flex gap-2 items-center">
            <Image
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-full"
              width={50}
              height={50}
              alt="user"
              src={`${USER_PROFILE_PIC_URL}/${profilePic}`}
            />
            <div className="font-primary">Create a post</div>
          </div>
          <Plus
            size={36}
            className="flex-center rounded-full hover:bg-primary_comp_hover dark:hover:bg-[#e9e9e933] p-2 transition-ease-300"
            weight="regular"
          />
        </div>

        {loading ? (
          <PostsLoader />
        ) : (
          <>
            {feed.length === 0 ? (
              <NoFeed />
            ) : (
              <InfiniteScroll
                className="flex flex-col gap-4 dark:gap-0"
                dataLength={feed.length}
                next={getFeed}
                hasMore={hasMore}
                loader={<PostsLoader />}
              >
                {feed.map(item => {
                  if ('noImpressions' in item) {
                    if (item.isRePost) return <RePostComponent key={item.id} setFeed={setFeed} post={item} />;
                    else return <PostComponent key={item.id} setFeed={setFeed} post={item} />;
                  } else if ('totalVotes' in item) {
                    return (
                      <PollCard
                        key={item.id}
                        poll={item}
                        organisation={item.organization || initialOrganization}
                        setPolls={setFeed}
                      />
                    );
                  } else return <AnnouncementCard key={item.id} announcement={item} />;
                })}
              </InfiniteScroll>
            )}
          </>
        )}
      </div>
      <ProfileCard />
    </div>
  );
};

export default Feed;
