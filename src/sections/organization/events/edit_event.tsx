import Links from '@/components/utils/edit_links';
import Tags from '@/components/utils/edit_tags';
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

    const start = moment(startTime);
    const end = moment(endTime);

    if (start.isBefore(moment())) {
      Toaster.error('Enter A Valid Start Time');
      return;
    }
    if (end.isBefore(start)) {
      Toaster.error('Enter A Valid End Time');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding the event...');

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
      Toaster.stopLoad(toaster, 'Event Added', 1);
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
            <select
              onChange={el => setCategory(el.target.value)}
              className="w-1/2 max-lg:w-full h-12 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-nonetext-sm rounded-lg block p-2"
            >
              {categories.map((c, i) => {
                return (
                  <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                    {c}
                  </option>
                );
              })}
            </select>

            <div>
              <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                Event Tagline ({tagline.trim().length}/50)
              </div>
              <input
                value={tagline}
                onChange={el => setTagline(el.target.value)}
                maxLength={50}
                type="text"
                className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                placeholder="Write your Tagline here..."
              />
            </div>

            <div>
              <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                Event Location ({location.trim().length}/25)
              </div>
              <input
                value={location}
                onChange={el => setLocation(el.target.value)}
                maxLength={25}
                type="text"
                className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                placeholder="Online"
              />
            </div>

            <div className="w-full flex justify-between gap-4">
              <div className="w-1/2">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Start Time</div>
                <input
                  value={startTime}
                  onChange={el => {
                    setStartTime(el.target.value);
                  }}
                  type="datetime-local"
                  className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                />
              </div>
              <div className="w-1/2">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">End Time</div>
                <input
                  value={endTime}
                  onChange={el => setEndTime(el.target.value)}
                  type="datetime-local"
                  className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                Event Description ({description.trim().length}/1000)
              </div>
              <textarea
                value={description}
                onChange={el => setDescription(el.target.value)}
                maxLength={1000}
                className="w-full min-h-[80px] max-h-80 bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                placeholder="Explain your event"
              />
            </div>

            <div>
              <div className="text-xs ml-1 font-medium uppercase text-gray-500">Event Tags ({tags.length || 0}/10)</div>
              <Tags tags={tags} setTags={setTags} maxTags={10} />
            </div>

            <div>
              <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                Event Links ({links.length || 0}/3)
              </div>
              <Links links={links} setLinks={setLinks} maxLinks={3} />
            </div>
          </div>

          <div className="w-full flex max-lg:justify-center justify-end">
            <button
              onClick={handleSubmit}
              className="w-44 h-12 bg-primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active rounded-lg flex-center font-medium text-lg transition-ease-300"
            >
              Edit Event
            </button>
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
