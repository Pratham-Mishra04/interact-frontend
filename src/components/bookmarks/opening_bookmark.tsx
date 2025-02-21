import { PROJECT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import BookmarkComponent, { BookmarkConfig } from './bookmark';
import { OpeningBookmark } from '@/types';
import { getProjectPicURL } from '@/utils/funcs/safe_extract';

interface Props {
  bookmark: OpeningBookmark;
  setBookmark: React.Dispatch<React.SetStateAction<OpeningBookmark>>;
  setClick: React.Dispatch<React.SetStateAction<boolean>>;
  handleEdit: (bookmarkID: string, title: string) => Promise<number>;
  handleDelete: (bookmarkID: string) => Promise<void>;
}

export const openingBookmarkConfig = {
  itemsKey: 'openingItems',
  itemIDKey: 'openingID',
  itemTitleKey: 'title',
  itemCountLabel: 'Opening',
  getImageSrc: (item: any) => {
    if (item.opening.projectID) return getProjectPicURL(item.opening.project);
    return `${USER_PROFILE_PIC_URL}/${item.opening.organization?.user?.profilePic || ''}`;
  },
  getBlurDataURL: () => 'no-hash',
};

const OpeningsBookmarkComponent = ({ bookmark, setClick, setBookmark, handleEdit, handleDelete }: Props) => (
  <BookmarkComponent
    bookmark={bookmark}
    setClick={setClick}
    setBookmark={setBookmark}
    handleEdit={handleEdit}
    handleDelete={handleDelete}
    config={openingBookmarkConfig as BookmarkConfig}
  />
);

export default OpeningsBookmarkComponent;
