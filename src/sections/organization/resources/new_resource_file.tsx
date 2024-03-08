import React, { useState } from 'react';
import { ORG_URL } from '@/config/routes';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import postHandler from '@/handlers/post_handler';
import { ResourceBucket, ResourceFile } from '@/types';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { X } from '@phosphor-icons/react';
import isURL from 'validator/lib/isURL';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  resourceBucketID: string;
  resourceFiles: ResourceFile[];
  setResourceFiles: React.Dispatch<React.SetStateAction<ResourceFile[]>>;
  setResourceBuckets?: React.Dispatch<React.SetStateAction<ResourceBucket[]>>;
  setClickedResourceBucket?: React.Dispatch<React.SetStateAction<ResourceBucket>>;
}
const NewResourceFile = ({
  setShow,
  resourceBucketID,
  resourceFiles,
  setResourceFiles,
  setResourceBuckets,
  setClickedResourceBucket,
}: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLink, setFileLink] = useState('');

  const [mutex, setMutex] = useState(false);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleAddFile = async () => {
    if (title == '') {
      Toaster.error('Title cannot be empty');
      return;
    }
    if (!selectedFile && fileLink == '') {
      Toaster.error('File cannot be empty');
      return;
    }

    if (fileLink != '' && !isURL(fileLink)) {
      Toaster.error('Enter a valid Link');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Uploading File to the Bucket..');

    const URL = `${ORG_URL}/${currentOrgID}/resource/${resourceBucketID}/file`;

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    if (selectedFile) formData.append('file', selectedFile);
    formData.append('link', fileLink);

    const res = await postHandler(URL, formData, 'multipart/form-data');
    if (res.statusCode === 201) {
      setResourceFiles([res.data.resourceFile, ...resourceFiles]);
      if (setResourceBuckets)
        setResourceBuckets(prev =>
          prev.map(r => {
            if (r.id == resourceBucketID) return { ...r, noFiles: r.noFiles + 1 };
            else return r;
          })
        );
      if (setClickedResourceBucket)
        setClickedResourceBucket(prev => {
          return { ...prev, noFiles: prev.noFiles + 1 };
        });
      Toaster.stopLoad(toaster, 'File Uploaded to the Bucket!', 1);
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  return (
    <>
      <div className="w-[60%] absolute bg-white border-2 border-primary_text shadow-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] p-6 rounded-xl flex flex-col gap-4 animate-fade_third">
        <h1 className="text-2xl font-bold">Upload File</h1>
        <div className="w-full h-fit flex flex-col gap-4">
          <Input label="Resource File Title" val={title} setVal={setTitle} maxLength={50} required={true} />
          <TextArea label="Resource File Description" val={description} setVal={setDescription} maxLength={500} />
        </div>
        <input
          type="file"
          className="resource-input-field"
          hidden
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              const file = files[0];
              if (file.size > 5 * 1024 * 1024) Toaster.error('File cannot be larger than 5 MB');
              else setSelectedFile(file);
            }
          }}
        />
        <div className="flex flex-col gap-4 items-center mt-4">
          <div
            className={`${selectedFile ? 'w-1/2 scale-110' : 'w-1/3'} ${
              fileLink == '' ? 'cursor-pointer hover:bg-primary_text hover:text-white' : 'cursor-default opacity-60'
            } flex-center text-center text-primary_text rounded-lg p-2 px-6 border-2 border-primary_text transition-ease-300`}
            onClick={() => {
              if (fileLink == '') {
                const input_el = document.querySelector('.resource-input-field') as HTMLInputElement | HTMLElement;
                input_el?.click();
              }
            }}
          >
            <div className="w-full">
              {selectedFile
                ? selectedFile.name.length > 30
                  ? `${selectedFile.name.substring(0, 25)}...`
                  : `${selectedFile.name}`
                : 'Upload a File'}
            </div>
            {selectedFile && (
              <X
                onClick={el => {
                  el.stopPropagation();
                  setSelectedFile(null);
                }}
              />
            )}
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[45%] h-[1px] bg-gray-200"></div>
            <div className="w-[10%] text-center text-sm max-lg:text-xs text-gray-400">or</div>
            <div className="w-[45%] h-[1px] bg-gray-200"></div>
          </div>
          {selectedFile ? (
            <div className="w-1/3 text-primary_text text-center rounded-lg p-2 px-6 border-2 border-primary_text opacity-60 cursor-default">
              Enter Link to the file
            </div>
          ) : (
            <input
              type="text"
              className="w-1/3 focus:w-1/2 focus:scale-110 bg-transparent focus:outline-none text-sm focus:text-base text-primary_text text-center rounded-lg p-2 px-6 border-2 border-primary_text transition-ease-300"
              placeholder="Enter Link to the file"
              maxLength={25}
              value={fileLink}
              onChange={el => setFileLink(el.target.value)}
            />
          )}
        </div>
        <div className="w-full flex justify-end self-end">
          <div
            className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg border-2 border-primary_text text-primary_text"
            onClick={handleAddFile}
          >
            Add
          </div>
        </div>
      </div>
      <div
        className="overlay w-full h-full fixed top-0 left-0 bg-backdrop rounded-xl animate-fade_third"
        onClick={() => setShow(false)}
      ></div>
    </>
  );
};

export default NewResourceFile;
