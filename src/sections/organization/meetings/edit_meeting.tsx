import { APPLICATION_URL, ORG_URL } from '@/config/routes';
import { Meeting } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import moment from 'moment';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import PrimaryButton from '@/components/buttons/primary_btn';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Time from '@/components/form/time';
import Checkbox from '@/components/form/checkbox';
import Select from '@/components/form/select';
import { getFormattedTime, getInputFieldFormatTime } from '@/utils/funcs/time';
import patchHandler from '@/handlers/patch_handler';

interface Props {
  meeting: Meeting;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setMeeting: React.Dispatch<React.SetStateAction<Meeting>>;
  applicationID?: string;
}

const EditMeeting = ({ meeting, setShow, setMeeting, applicationID }: Props) => {
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description);
  const [tags, setTags] = useState<string[]>(meeting.tags);
  const [startTime, setStartTime] = useState(getInputFieldFormatTime(meeting.startTime));
  const [endTime, setEndTime] = useState(getInputFieldFormatTime(meeting.endTime));
  const [isOnline, setIsOnline] = useState(true);
  const [isOpenForMembers, setIsOpenForMembers] = useState(meeting.isOpenForMembers);
  const [allowExternalParticipants, setAllowExternalParticipants] = useState(meeting.allowExternalParticipants);
  const [frequency, setFrequency] = useState(meeting.frequency);
  const [date, setDate] = useState(meeting.date);
  const [day, setDay] = useState(meeting.day);
  const [isReoccurring, setIsReoccurring] = useState(meeting.frequency != 'none');

  const [mutex, setMutex] = useState(false);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const meetingDetailsValidator = () => {
    if (title.trim() == '') {
      Toaster.error('Enter Title');
      return false;
    }

    const start = moment(startTime);
    const end = moment(endTime);

    if (end.isSameOrBefore(start)) {
      Toaster.error('End Time cannot be before Start Time');
      return false;
    }

    const duration = moment.duration(end.diff(start));
    const hours = duration.asHours();

    if (hours > 5) {
      Toaster.error('Meetings cannot be longer than 5 hours');
      return false;
    }

    return true;
  };

  const formatSessionDate = (date: Date): string => {
    if (isReoccurring) return moment(date).format('HH:mm');
    return moment(date).format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (!applicationID && tags.length == 0) {
      Toaster.error('Tags cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new meeting');

    const URL = applicationID
      ? `${APPLICATION_URL}/meeting/${applicationID}`
      : `${ORG_URL}/${currentOrgID}/meetings/${meeting.id}`;

    const formData = {
      title,
      description,
      tags,
      startTime: isReoccurring ? startTime : getFormattedTime(startTime),
      endTime: isReoccurring ? endTime : getFormattedTime(endTime),
      frequency: isReoccurring ? frequency : 'none',
      day: isReoccurring ? day : '',
      date: isReoccurring ? date : -1,
      isOnline,
      isOpenForMembers,
      allowExternalParticipants,
    };

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      const editedMeeting: Meeting = res.data.meeting;
      setMeeting(prev => {
        return {
          ...prev,
          title: editedMeeting.title,
          description: editedMeeting.description,
          tags: editedMeeting.tags,
          startTime: editedMeeting.startTime,
          endTime: editedMeeting.endTime,
          frequency: editedMeeting.frequency,
          day: editedMeeting.day,
          date: editedMeeting.date,
        };
      });
      setShow(false);
      Toaster.stopLoad(toaster, 'Meeting Edited!', 1);
      return 1;
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
      return 0;
    }
  };

  useEffect(() => {
    setStartTime(formatSessionDate(meeting.startTime));
    setEndTime(formatSessionDate(meeting.endTime));

    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-1/2 -translate-y-1/2 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-6 rounded-lg px-2 py-10 max-md:p-5 font-primary border-[1px] border-primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold px-8 max-md:px-0">Meeting Details</div>
        <div className="w-full max-h-[540px] overflow-y-auto flex flex-col gap-4 px-8 max-md:px-0">
          <div className="w-full flex flex-col gap-4">
            <Input label="Meeting Title" val={title} setVal={setTitle} maxLength={50} required={true} />
            <TextArea label="Meeting Description" val={description} setVal={setDescription} maxLength={500} />
            {!applicationID && (
              <>
                <Tags label="Meeting Tags" tags={tags} setTags={setTags} maxTags={5} required={true} />
                <Checkbox label="Is the Meeting Reoccurring?" val={isReoccurring} setVal={setIsReoccurring} />
              </>
            )}
            {isReoccurring && (
              <Select
                label="Frequency"
                val={frequency}
                setVal={setFrequency}
                options={['daily', 'weekly', 'monthly']}
              />
            )}
            <div className="w-full flex max-md:flex-col justify-between gap-4">
              <div className="w-1/2 max-md:w-full">
                <Time
                  label="Start Time"
                  val={startTime}
                  setVal={setStartTime}
                  required={true}
                  includeDate={!isReoccurring}
                />
              </div>
              <div className="w-1/2 max-md:w-full">
                <Time
                  label="Expected End Time"
                  val={endTime}
                  setVal={setEndTime}
                  required={true}
                  includeDate={!isReoccurring}
                />
              </div>
            </div>
            {isReoccurring && frequency == 'weekly' && (
              <Select
                label="Day of Week"
                val={day}
                setVal={setDay}
                options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
              />
            )}
            {isReoccurring && frequency == 'monthly' && (
              <Select
                label="Day of Month"
                val={date}
                setVal={setDate}
                options={Array.from({ length: 30 }, (_, i) => i + 1)}
              />
            )}
            {/* <Checkbox label="Is the Meeting Online?" val={isOnline} setVal={setIsOnline} /> */}
            {isOnline && (
              <>
                <Checkbox
                  label="Is the Meeting Open for all Members?"
                  val={isOpenForMembers}
                  setVal={setIsOpenForMembers}
                />
                {!applicationID && (
                  <Checkbox
                    label="Do you want to allow External Participants?"
                    val={allowExternalParticipants}
                    setVal={setAllowExternalParticipants}
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div className="w-full flex justify-end px-8 max-md:px-0">
          <PrimaryButton
            onClick={async () => {
              const checker = meetingDetailsValidator();
              if (checker) handleSubmit();
            }}
            label="Submit"
            animateIn={false}
            disabled={mutex}
          />
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditMeeting;
