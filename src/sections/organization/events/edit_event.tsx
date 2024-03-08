import CoverPic from '@/components/utils/new_cover';
import { ORG_URL } from '@/config/routes';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Event } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import { X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import isArrEdited from '@/utils/funcs/check_array_edited';
import patchHandler from '@/handlers/patch_handler';
import { SERVER_ERROR } from '@/config/errors';
import Select from '@/components/form/select';
import Input from '@/components/form/input';
import Time from '@/components/form/time';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Links from '@/components/form/links';
import PrimaryButton from '@/components/buttons/primary_btn';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  event: Event;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EditEvent = ({ setShow, event, setEvents }: Props) => {
  const [description, setDescription] = useState(event.description);
  const [tagline, setTagline] = useState(event.tagline);
  const [category, setCategory] = useState(event.category);
  const [tags, setTags] = useState<string[]>(event.tags || []);
  const [links, setLinks] = useState<string[]>(event.links || []);
  const [location, setLocation] = useState(event.location);
  const [startTime, setStartTime] = useState(moment(event.startTime).format('YYYY-MM-DDTHH:mm'));
  const [endTime, setEndTime] = useState(moment(event.endTime).format('YYYY-MM-DDTHH:mm'));
  const [image, setImage] = useState<File>();

  const [mutex, setMutex] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const handleSubmit = async () => {
    if (description.trim() == '') {
      Toaster.error('Enter Description');
      return;
    }
    if (category.trim() == '' || category == 'Select Category') {
      Toaster.error('Select Category');
      return;
    }
    if (tags.length == 0) {
      Toaster.error('Tags cannot be empty');
      return;
    }

    const start = moment(startTime);
    const end = moment(endTime);

    if (end.isBefore(start)) {
      Toaster.error('Enter A Valid End Time');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing the event...');

    const formData = new FormData();

    if (tagline != event.tagline) formData.append('tagline', tagline);
    if (description != event.description) formData.append('description', description);
    if (isArrEdited(tags, event.tags)) tags.forEach(tag => formData.append('tags', tag));
    if (isArrEdited(links, event.links)) links.forEach(link => formData.append('links', link));
    if (category != event.category) formData.append('category', category);
    if (location != event.location) formData.append('location', location == '' ? 'Online' : location);
    if (!start.isSame(event.startTime)) formData.append('startTime', start.format('YYYY-MM-DDTHH:mm:ss[Z]'));
    if (!end.isSame(event.endTime)) formData.append('endTime', end.format('YYYY-MM-DDTHH:mm:ss[Z]'));
    if (image) formData.append('coverPic', image);

    const URL = `${ORG_URL}/${currentOrg.id}/events/${event.id}`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const eventData: Event = res.data.event;
      setEvents(prev =>
        prev.map(e => {
          if (e.id == event.id)
            return {
              ...e,
              tagline: eventData.tagline,
              description: eventData.description,
              tags: eventData.tags,
              links: eventData.links,
              location: eventData.location,
              startTime: eventData.startTime,
              endTime: eventData.endTime,
              coverPic: eventData.coverPic,
              category: eventData.category,
            };
          else return e;
        })
      );
      Toaster.stopLoad(toaster, 'Event Edited', 1);
      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      if (res.data.message) {
        Toaster.stopLoad(toaster, res.data.message, 0);
      } else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-10 max-lg:top-0 w-1/2 max-lg:w-screen h-[90%] max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col justify-between rounded-lg px-12 py-8 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        <X
          onClick={() => setShow(false)}
          className="lg:hidden absolute top-2 right-2 cursor-pointer"
          weight="bold"
          size={32}
        />
        <div className="w-full">
          <CoverPic setSelectedFile={setImage} type="Event" initialImage={event.coverPic} />
        </div>
        <div className="w-full flex flex-col justify-between gap-2">
          <div className="w-full text-primary_black flex flex-col gap-6 pb-8 max-lg:pb-4">
            <Select label="Event Category" val={category} setVal={setCategory} options={categories} required={true} />
            <Input label="Event Tagline" val={tagline} setVal={setTagline} maxLength={50} required={true} />
            <Input label="Event Location" val={location} setVal={setLocation} maxLength={25} placeholder="Online" />
            <div className="w-full flex justify-between gap-4">
              <div className="w-1/2">
                <Time label="Start Time" val={startTime} setVal={setStartTime} required={true} />
              </div>
              <div className="w-1/2">
                <Time label="End Time" val={endTime} setVal={setEndTime} required={true} />
              </div>
            </div>
            <TextArea label="Event Description" val={description} setVal={setDescription} maxLength={2500} />
            <Tags label="Event Tags" tags={tags} setTags={setTags} maxTags={10} required={true} />
            <Links label="Event Links" links={links} setLinks={setLinks} maxLinks={3} />
          </div>
          <div className="w-full flex max-lg:justify-center justify-end">
            <PrimaryButton onClick={handleSubmit} label="Edit Event" animateIn={true} />
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:w-[105vw] max-lg:h-[105vh] fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditEvent;
