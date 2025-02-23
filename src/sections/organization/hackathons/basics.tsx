import React, { useState } from 'react';
import Input from '@/components/form/input';
import Tags from '@/components/form/tags';
import Links from '@/components/form/links';
import Time from '@/components/form/time';
import { Hackathon } from '@/types';
import { PencilSimple } from '@phosphor-icons/react';
import { EVENT_PIC_URL } from '@/config/routes';
import { resizeImage } from '@/utils/resize_image';
import Toaster from '@/utils/toaster';
import Image from 'next/image';
import Checkbox from '@/components/form/checkbox';
import EditorInput from '@/components/form/editor-input';
import ImageEditorDialog, { handleImageInputChange, handleImageInputClick } from '@/components/image-editor/dialog';

interface BasicsProps {
  title: string;
  setTitle?: (title: string) => void;
  tagline: string;
  setTagline?: (tagline: string) => void;
  location: string;
  setLocation?: (location: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  description: string;
  setDescription?: React.Dispatch<React.SetStateAction<string>>;
  tags: string[];
  setTags?: (tags: string[]) => void;
  links: string[];
  setLinks?: (links: string[]) => void;
  isRestricted: boolean;
  setIsRestricted?: (isRestricted: boolean) => void;
  entryPassword?: string;
  setEntryPassword?: (entryPassword: string) => void;
  coverPic?: File;
  setCoverPic: (file: File | null) => void;
  isEditMode: boolean;
  onSave?: (updatedData: Partial<Hackathon>) => void;
}

const Basics: React.FC<BasicsProps> = ({
  title,
  setTitle,
  tagline,
  setTagline,
  location,
  setLocation,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  description,
  setDescription,
  tags,
  setTags,
  links,
  setLinks,
  isRestricted,
  setIsRestricted,
  entryPassword,
  setEntryPassword,
  coverPic,
  setCoverPic,
  isEditMode,
  onSave,
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localTagline, setLocalTagline] = useState(tagline);
  const [localLocation, setLocalLocation] = useState(location);
  const [localDescription, setLocalDescription] = useState(description);
  const [localTags, setLocalTags] = useState(tags);
  const [localLinks, setLocalLinks] = useState(links);
  const [localIsRestricted, setLocalIsRestricted] = useState(isRestricted);
  const [coverPicView, setCoverPicView] = useState(`${EVENT_PIC_URL}/${coverPic || 'default.jpg'}`);
  const [openImageEditor, setOpenImageEditor] = useState(false);

  const handleSave = () => {
    const updatedData: Partial<Hackathon> = {
      title: localTitle,
      tagline: localTagline,
      location: localLocation,
      description: localDescription,
      tags: localTags,
      links: localLinks,
      isRestricted: localIsRestricted,
    };

    if (onSave) onSave(updatedData);
  };

  return (
    <div className="w-full flex flex-col gap-8 max-lg:gap-4">
      {openImageEditor && coverPic && <ImageEditorDialog
        open={openImageEditor}
        setOpen={setOpenImageEditor}
        image={coverPic}
        aspectRatio={1920 / 720}
        handleUpdate={(file: File, view?: string)=>{
          if (view) setCoverPicView(view);
          setCoverPic(file);
        }}
      />}
      <div className="w-full relative group">
        <input
          type="file"
          className="hidden"
          id="coverPic"
          multiple={false}
          onClick={handleImageInputClick}
          onChange={e=>handleImageInputChange(e, (file: File)=>{
            setOpenImageEditor(()=>{
              setCoverPic(file);
              return true;
            });
          })}
        />
        <div className="w-full h-full relative group">
          <label
            htmlFor="coverPic"
            className="w-full h-full absolute top-0 right-0 rounded-lg z-10 flex-center transition-ease-200 cursor-pointer bg-[#ffffff00] hover:bg-[#ffffff30]"
          >
            <PencilSimple className="opacity-0 group-hover:opacity-100 transition-ease-200" size={32} />
          </label>
          <Image
            crossOrigin="anonymous"
            className="w-full rounded-lg"
            src={coverPicView}
            alt="Event Cover"
            width={1920}
            height={720}
          />
        </div>
      </div>
      <Input
        label="Title"
        val={isEditMode ? localTitle : title}
        setVal={isEditMode ? setLocalTitle : setTitle ? setTitle : () => {}}
        maxLength={25}
        required={true}
      />
      <Input
        label="Tagline"
        val={isEditMode ? localTagline : tagline}
        setVal={isEditMode ? setLocalTagline : setTagline ? setTagline : () => {}}
        maxLength={50}
        required={true}
      />
      <Input
        label="Location"
        val={isEditMode ? localLocation : location}
        setVal={isEditMode ? setLocalLocation : setLocation ? setLocation : () => {}}
        maxLength={25}
        placeholder="Online"
      />
      <div className="w-full flex justify-between gap-4">
        <div className="w-1/2">
          <Time label="Start Time" val={startTime} setVal={setStartTime} required={true} includeDate={true} />
        </div>
        <div className="w-1/2">
          <Time label="End Time" val={endTime} setVal={setEndTime} required={true} includeDate={true} />
        </div>
      </div>
      {isEditMode ? (
        <EditorInput label={'Description'} val={localDescription} setVal={setLocalDescription} maxLength={2500} />
      ) : setDescription ? (
        <EditorInput label={'Description'} val={description} setVal={setDescription} maxLength={2500} />
      ) : (
        <EditorInput editable={false} val={description} />
      )}
      <Tags
        label="Tags"
        tags={isEditMode ? localTags : tags}
        setTags={isEditMode ? setLocalTags : setTags ? setTags : () => {}}
        maxTags={10}
        required={true}
      />
      <Links
        label="Links"
        links={isEditMode ? localLinks : links}
        setLinks={isEditMode ? setLocalLinks : setLinks ? setLinks : () => {}}
        maxLinks={5}
      />
      <Checkbox
        label="Do you want to restrict this hackathon participation?"
        val={isEditMode ? localIsRestricted : isRestricted}
        setVal={isEditMode ? setLocalIsRestricted : setIsRestricted ? setIsRestricted : () => {}}
        caption={
          (isEditMode ? localIsRestricted : isRestricted)
            ? 'Only users with the password will be able to participate in this hackathon.'
            : 'The Hackathon is open to all users.'
        }
      />
      {isRestricted && !isEditMode && entryPassword != undefined && setEntryPassword && (
        <Input label="Entry Password" val={entryPassword} setVal={setEntryPassword} maxLength={25} required={true} />
      )}

      {isEditMode && (
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 w-fit"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default Basics;
