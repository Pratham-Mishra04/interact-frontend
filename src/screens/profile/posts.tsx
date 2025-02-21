import NoUserItems from '@/components/fillers/user_items';
import PostComponent from '@/components/home/post';
import RePostComponent from '@/components/home/repost';
import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, POST_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Post } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostsLoader from '@/components/loaders/posts';
import Masonry from 'react-masonry-css';
import Loader from '@/components/common/loader';
import Mascot from '@/components/fillers/mascot';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';

interface Props {
  userID: string;
  org?: boolean;
}

const Posts = ({ userID, org = false }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const user = useSelector(userSelector);

  const getPosts = () => {
    setLoading(true);
    const URL =
      user.id == userID
        ? `${POST_URL}/me?page=${page}&limit=${10}`
        : `${EXPLORE_URL}/users/posts/${userID}?page=${page}&limit=${10}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const addedPosts = [...posts, ...(res.data.posts || [])];
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
    getPosts();
  }, [userID]);

  return page == 1 && loading ? (
    <PostsLoader />
  ) : org ? (
    posts.length > 0 ? (
      <InfiniteScroll
        className="w-full max-md:px-2"
        dataLength={posts.length}
        next={getPosts}
        hasMore={hasMore}
        loader={<Loader />}
      >
        {posts.map((post, index) => (
          <div key={post.id} className={`${index != 0 && index != 1 && 'mt-4'} ${index == 0 && 'max-md:mb-4'}`}>
            {post.rePost ? (
              <RePostComponent key={post.id} setFeed={setPosts} post={post} org={true} />
            ) : (
              <PostComponent key={post.id} setFeed={setPosts} post={post} org={true} />
            )}
          </div>
        ))}
      </InfiniteScroll>
    ) : (
      <div className="w-5/6 mx-auto pb-base_padding">
        <Mascot message="This organization is as quiet as a library at midnight. Shh, no posts yet." />
      </div>
    )
  ) : (
    <InfiniteScroll
      className="w-full flex flex-col gap-2"
      dataLength={posts.length}
      next={getPosts}
      hasMore={hasMore}
      loader={<PostsLoader />}
    >
      {posts.length === 0 ? (
        <NoUserItems />
      ) : (
        posts.map(post => {
          if (post.rePost) return <RePostComponent key={post.id} post={post} setFeed={setPosts} />;
          else return <PostComponent key={post.id} post={post} setFeed={setPosts} />;
        })
      )}
    </InfiniteScroll>
  );
};

export default Posts;
