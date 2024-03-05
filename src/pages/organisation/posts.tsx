import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import OrgSidebar from '@/components/common/org_sidebar';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Post from '@/components/home/post';
import NewPost from '@/sections/home/new_post';
import { Info, Plus } from '@phosphor-icons/react';
import { EXPLORE_URL } from '@/config/routes';
import NoFeed from '@/components/empty_fillers/feed';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostComponent from '@/components/home/post';
import RePostComponent from '@/components/home/repost';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';
import Masonry from 'react-masonry-css';
import Loader from '@/components/common/loader';
import WidthCheck from '@/utils/wrappers/widthCheck';
import AccessTree from '@/components/organization/access_tree';

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [clickedOnNewPost, setClickedOnNewPost] = useState(false);
  const [clickedOnInfo, setClickedOnInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentOrg = useSelector(currentOrgSelector);

  const getFeed = () => {
    const URL = `${EXPLORE_URL}/users/posts/${currentOrg.userID}?page=${page}&limit=${10}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const addedPosts = [...posts, ...res.data.posts];
          if (addedPosts.length === posts.length) setHasMore(false);
          setPosts(addedPosts);
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
  }, []);

  return (
    <BaseWrapper title={`Posts | ${currentOrg.title}`}>
      <OrgSidebar index={2} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-2 max-md:px-2 p-base_padding">
          <div className="w-full flex justify-between items-center">
            <div className="w-fit text-6xl font-semibold dark:text-white font-primary">Posts</div>
            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_SENIOR) && (
                <Plus
                  onClick={() => setClickedOnNewPost(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              )}
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>

          <div className="w-full max-md:w-full mx-auto flex flex-col items-center gap-4">
            {clickedOnNewPost && <NewPost setFeed={setPosts} setShow={setClickedOnNewPost} org={true} />}
            {clickedOnInfo && <AccessTree type="post" setShow={setClickedOnInfo} />}
            {loading ? (
              <Loader />
            ) : (
              <div className="w-full">
                {posts.length === 0 ? (
                  <NoFeed />
                ) : (
                  <InfiniteScroll
                    className="w-full"
                    dataLength={posts.length}
                    next={getFeed}
                    hasMore={hasMore}
                    loader={<Loader />}
                  >
                    <Masonry
                      breakpointCols={{ default: posts.length == 1 ? 1 : 2, 768: 1 }}
                      className="masonry-grid"
                      columnClassName="masonry-grid_column"
                    >
                      {posts.map(post => (
                        <div key={post.id} className="mt-4">
                          {post.rePost ? (
                            <RePostComponent key={post.id} setFeed={setPosts} post={post} org={true} />
                          ) : (
                            <PostComponent key={post.id} setFeed={setPosts} post={post} org={true} />
                          )}
                        </div>
                      ))}
                    </Masonry>
                  </InfiniteScroll>
                )}
              </div>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Posts));
