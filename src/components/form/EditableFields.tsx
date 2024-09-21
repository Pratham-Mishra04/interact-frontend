import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import patchHandler from '@/handlers/patch_handler';
import { Hackathon, HackathonPrize, HackathonSponsor, HackathonTrack } from '@/types';
import Toaster from '@/utils/toaster';
import { FloppyDisk, Link, Medal, PencilSimple, Trash } from '@phosphor-icons/react';
import { Dispatch, SetStateAction, useState } from 'react';

const boxWrapperClass = 'w-full px-4 py-2 bg-[#E6E7EB70] relative rounded-md';

export function EditableTrackBox({
  val,
  setVal,
  track,
  index,
}: {
  val: Hackathon;
  track: HackathonTrack;
  index: number;
  setVal: Dispatch<SetStateAction<Hackathon>>;
}) {
  const [isEditable, setIsEditable] = useState(false);
  const [trackData, setTrackData] = useState(track);
  return (
    <div className={`${boxWrapperClass}`}>
      <div className="flex items-center gap-1 absolute top-2 right-2">
        <button
          className="bg-white rounded-md text-black p-1  border-[1px] border-[#dedede]"
          onClick={() => {
            setIsEditable(!isEditable);
          }}
        >
          {!isEditable && <PencilSimple size={16} />}
          {isEditable && <FloppyDisk size={16} />}
        </button>
        <button
          className="bg-white rounded-md text-black p-1  border-[1px] border-[#dedede]"
          onClick={() => {
            setVal({ ...val, tracks: val.tracks.filter((_, i) => i !== index) });
          }}
        >
          <Trash size={16} />
        </button>
      </div>
      {isEditable && (
        <section className=" w-full h-full flex flex-col gap-2">
          <div className="flex flex-col gap-0">
            <h2>Title</h2>
            <input
              className="text-base bg-[#dedede]  p-1"
              value={trackData.title}
              placeholder="Track name"
              onChange={e => {
                setVal({
                  ...val,
                  tracks: val.tracks.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)),
                });
                setTrackData({ ...trackData, title: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-0">
            <h2>Description</h2>
            <textarea
              className="text-sm bg-[#dedede]  p-1"
              value={trackData.description}
              placeholder="Track name"
              onChange={e => {
                setVal({
                  ...val,
                  tracks: val.tracks.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)),
                });
                setTrackData({ ...trackData, description: e.target.value });
              }}
            />
          </div>
        </section>
      )}
      {!isEditable && (
        <section className=" w-full h-full">
          <h1 className="text-xl font-semibold">{trackData.title}</h1>
          <p>{trackData.description}</p>
        </section>
      )}
    </div>
  );
}
interface EditableBoxProps {
  val: Hackathon;
  setVal: Dispatch<SetStateAction<Hackathon>>;
  placeholder: string;
  type?: 'text' | 'number' | 'email';
  maxLength?: number;
  className?: string;
  field: string;
}

export function EditableBox({
  val,
  setVal,
  placeholder,
  type = 'text',
  maxLength = 50,
  className,
  field,
}: EditableBoxProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [mutex, setMutex] = useState(false);
  const handleEditDetail = async (data: any): Promise<number> => {
    if (mutex) return 0;
    setMutex(true);
    const toaster = Toaster.startLoad('Updating Details...');

    const URL = `${ORG_URL}/${val.organizationID}/hackathons/${val.id}`;
    const res = await patchHandler(URL, data);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Details Updated!', 1);
      setMutex(false);
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
  return (
    <div className={`${boxWrapperClass}`}>
      <button
        className="bg-white rounded-md text-black p-1 absolute top-2 right-2 border-[1px] border-[#dedede]"
        disabled={mutex}
        onClick={() => {
          setIsEditable(!isEditable);
          if (isEditable) {
            handleEditDetail({ field: val[field as keyof Hackathon] });
          }
        }}
      >
        {!isEditable && <PencilSimple size={16} />}
        {isEditable && <FloppyDisk size={16} />}
      </button>

      {isEditable && (
        <input
          value={val[field as keyof Hackathon]?.toString() || ''}
          onChange={e => {
            const details = { ...val, [field]: e.target.value };
            setVal(details);
          }}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          className={`w-full h-full bg-transparent border-0 outline-none focus:outline-none focus:border-0 ${className}`}
        />
      )}
      {!isEditable && (
        <span className={`w-full h-full  ${className}`}>{val[field as keyof Hackathon]?.toString() || ''}</span>
      )}
    </div>
  );
}
export function EditableSponsorBox({
  val,
  setVal,
  sponsor,
  index,
}: {
  val: Hackathon;
  sponsor: HackathonSponsor;
  index: number;
  setVal: Dispatch<SetStateAction<Hackathon>>;
}) {
  const [isEditable, setIsEditable] = useState(false);
  const [sponsorData, setSponsorData] = useState(sponsor);
  const [mutex, setMutex] = useState(false);
  const handleEditSponsor = async (
    sponsorID: string,
    data: { name: string; link: string; title: string; description: string }
  ): Promise<number> => {
    if (mutex) return 0;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating the Sponsor...');

    const URL = `${ORG_URL}/${val.organizationID}/hackathons/sponsor/${sponsorID}`;
    const res = await patchHandler(URL, data);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Sponsor Updated!', 1);
      setMutex(false);
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
  const handleDeleteSponsor = async () => {
    const URL = `${ORG_URL}/${val.organizationID}/hackathons/sponsor/${sponsorData.id}`;

    const res = await deleteHandler(URL);
    const toaster = Toaster.startLoad('Deleting Sponsor...');
    if (res.statusCode === 204) {
      setVal({ ...val, sponsors: val.sponsors.filter((_, i) => i !== index) });
      Toaster.stopLoad(toaster, 'Sponsor Deleted!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };
  return (
    <div className={`${boxWrapperClass}`}>
      <div className="flex items-center gap-1 absolute top-2 right-2">
        <button
          className="bg-white rounded-md text-black p-1  border-[1px] border-[#dedede]"
          onClick={() => {
            if (isEditable && sponsorData.id) {
              handleEditSponsor(sponsorData.id, {
                name: sponsorData.name,
                link: sponsorData.link || '',
                title: sponsorData.title || '',
                description: sponsorData.description || '',
              });
            }
            setIsEditable(!isEditable);
          }}
          disabled={mutex}
        >
          {!isEditable && <PencilSimple size={16} />}
          {isEditable && <FloppyDisk size={16} />}
        </button>
        <button
          className="bg-white rounded-md text-black p-1  border-[1px] border-[#dedede]"
          onClick={handleDeleteSponsor}
        >
          <Trash size={16} />
        </button>
      </div>
      {isEditable && (
        <section className=" w-full h-full flex flex-col gap-1">
          <input
            className="font-semibold text-base bg-[#dedede]  p-1"
            value={sponsorData.name}
            placeholder="Sponsor name"
            onChange={e => {
              setVal({
                ...val,
                sponsors: val.sponsors.map((s, i) => (i === index ? { ...s, name: e.target.value } : s)),
              });
              setSponsorData({ ...sponsorData, name: e.target.value });
            }}
          />
          <input
            className="font-semibold text-sm bg-[#dedede]  p-1"
            value={sponsorData.link}
            placeholder="Link"
            onChange={e => {
              setVal({
                ...val,
                sponsors: val.sponsors.map((s, i) => (i === index ? { ...s, link: e.target.value } : s)),
              });
              setSponsorData({ ...sponsorData, link: e.target.value });
            }}
          />
          <input
            className="font-semibold text-sm bg-[#dedede]  p-1"
            value={sponsorData.title}
            placeholder="Sponsor title"
            onChange={e => {
              setVal({
                ...val,
                sponsors: val.sponsors.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)),
              });
              setSponsorData({ ...sponsorData, title: e.target.value });
            }}
          />
          <textarea
            value={sponsorData.description}
            className="text-xs bg-[#dedede] p-1"
            onChange={e => {
              setVal({
                ...val,
                sponsors: val.sponsors.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)),
              });
              setSponsorData({ ...sponsorData, description: e.target.value });
            }}
          ></textarea>
        </section>
      )}
      {!isEditable && (
        <section className=" w-full h-full">
          <span className="flex items-center gap-1">
            <p className="font-semibold text-lg">{sponsorData.name}</p>
            <a href={sponsorData.link} target="_blank">
              <Link size={20} />
            </a>
          </span>
          <p className="text-sm -mt-1">{sponsorData.title}</p>
          <p className="text-xs">
            {sponsorData?.description && sponsorData?.description?.length > 50
              ? sponsorData?.description?.slice(0, 30) + '...'
              : sponsorData.description}
          </p>
        </section>
      )}
    </div>
  );
}
export function EditableFAQBox({
  val,
  setVal,
  faq,
  index,
}: {
  val: Hackathon;
  faq: {
    id?: string;
    question: string;
    answer: string;
  };
  index: number;
  setVal: Dispatch<SetStateAction<Hackathon>>;
}) {
  const [isEditable, setIsEditable] = useState(false);
  const [faqData, setFaqData] = useState(faq);
  const [mutex, setMutex] = useState(false);
  const handleEditFAQ = async (faqID: string, data: { question: string; answer: string }): Promise<number> => {
    if (mutex) return 0;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating the FAQ...');

    const URL = `${ORG_URL}/${val.organizationID}/hackathons/faq/${val.id}`;
    const res = await patchHandler(URL, data);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'FAQ Updated!', 1);
      setMutex(false);
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
  const handleDeleteFaq = async () => {
    const URL = `${ORG_URL}/${val.organizationID}/hackathons/faq/${faqData.id}`;

    const res = await deleteHandler(URL);
    const toaster = Toaster.startLoad('Deleting FAQ...');
    if (res.statusCode === 204) {
      setVal({ ...val, faqs: val.faqs.filter((_, i) => i !== index) });
      Toaster.stopLoad(toaster, 'FAQ Deleted!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };
  return (
    <div className={`${boxWrapperClass}`}>
      <div className="flex items-center gap-1 absolute top-2 right-2">
        <button
          className="bg-white rounded-md text-black p-1  border-[1px] border-[#dedede]"
          disabled={mutex}
          onClick={() => {
            if (isEditable && faqData.id) {
              handleEditFAQ(faqData.id, {
                question: faqData.question,
                answer: faqData.answer,
              });
            }
            setIsEditable(!isEditable);
          }}
        >
          {!isEditable && <PencilSimple size={16} />}
          {isEditable && <FloppyDisk size={16} />}
        </button>
        <button className="bg-white rounded-md text-black p-1  border-[1px] border-[#dedede]" onClick={handleDeleteFaq}>
          <Trash size={16} />
        </button>
      </div>
      {isEditable && (
        <section className=" w-full h-full flex flex-col gap-2">
          <div className="flex flex-col gap-0">
            <h2>Question</h2>
            <textarea
              value={faqData.question}
              className="text-xs bg-[#dedede] p-1"
              onChange={e => {
                setVal({
                  ...val,
                  faqs: val.faqs.map((s, i) => (i === index ? { ...s, question: e.target.value } : s)),
                });
                setFaqData({ ...faqData, question: e.target.value });
              }}
            ></textarea>
          </div>
          <div className="flex flex-col gap-0">
            <h2>Answer</h2>{' '}
            <textarea
              value={faqData.answer}
              className="text-xs bg-[#dedede] p-1"
              onChange={e => {
                setVal({
                  ...val,
                  faqs: val.faqs.map((s, i) => (i === index ? { ...s, answer: e.target.value } : s)),
                });
                setFaqData({ ...faqData, answer: e.target.value });
              }}
            ></textarea>
          </div>
        </section>
      )}
      {!isEditable && (
        <section className=" w-full h-full mt-8">
          <p className="font-semibold text-base">{faqData.question}</p>
          <p className="text-sm -mt-1">{faqData.answer}</p>
        </section>
      )}
    </div>
  );
}
