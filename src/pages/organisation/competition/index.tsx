import React, { useEffect, useState } from 'react';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import OrgSidebar from '@/components/common/org_sidebar';
import { HackathonTrack, HackathonPrize, HackathonRound, HackathonSponsor, HackathonFAQ } from '@/types';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import postHandler from '@/handlers/post_handler';
import moment from 'moment';
import { ORG_URL } from '@/config/routes';
import { getFormattedTime } from '@/utils/funcs/time';
import { Timeline } from '@/components/ui/timeline';
import GlowButton from '@/components/buttons/glow_btn';
import { Button } from '@/components/ui/button';
import Tracks from '@/sections/organization/hackathons/tracks';
import Prizes from '@/sections/organization/hackathons/prizes';
import Rounds from '@/sections/organization/hackathons/rounds';
import FAQs from '@/sections/organization/hackathons/faqs';
import Sponsors from '@/sections/organization/hackathons/sponsors';
import Basics from '@/sections/organization/hackathons/basics';
import { uniqueId } from 'lodash';
import Teams from '@/sections/organization/hackathons/teams';
import { useRouter } from 'next/router';
import { Id } from 'react-toastify';
import patchHandler from '@/handlers/patch_handler';
import AdditionalDetails from '@/sections/organization/hackathons/additional';

const NewHackathon: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [teamFormationStartTime, setTeamFormationStartTime] = useState('');
  const [teamFormationEndTime, setTeamFormationEndTime] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [tracks, setTracks] = useState<HackathonTrack[]>([]);
  const [prizes, setPrizes] = useState<HackathonPrize[]>([]);
  const [rounds, setRounds] = useState<HackathonRound[]>([]);
  const [sponsors, setSponsors] = useState<HackathonSponsor[]>([]);
  const [faqs, setFaqs] = useState<HackathonFAQ[]>([]);
  const [allowEditDuringJudging, setAllowEditDuringJudging] = useState(false);
  const [enableGithubIntegration, setEnableGithubIntegration] = useState(false);
  const [enableFigmaIntegration, setEnableFigmaIntegration] = useState(false);
  const [enableAutoCodeReviews, setEnableAutoCodeReviews] = useState(false);
  const [makeProjectsPublic, setMakeProjectsPublic] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [entryPassword, setEntryPassword] = useState('');

  const currentOrg = useSelector(currentOrgSelector);

  const router = useRouter();

  const addFAQ = (faq: HackathonFAQ) => {
    setFaqs(prev => [...prev, { ...faq, id: uniqueId() }]);
  };

  const editFAQ = (faq: HackathonFAQ) => {
    setFaqs(prev => prev.map(f => (f.id === faq.id ? faq : f)));
  };

  const deleteFAQ = (id: string) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id));
  };

  const addRound = (round: HackathonRound) => {
    setRounds(prev => [...prev, { ...round, id: uniqueId(), hackathonID: 'your-hackathon-id' }]);
  };

  const addSponsor = (sponsor: HackathonSponsor) => {
    setSponsors(prev => [...prev, { ...sponsor, id: uniqueId() }]);
  };

  const editSponsor = (sponsor: HackathonSponsor) => {
    setSponsors(prev => prev.map(s => (s.id === sponsor.id ? sponsor : s)));
  };

  const deleteSponsor = (sponsorId: string) => {
    setSponsors(prev => prev.filter(sponsor => sponsor.id !== sponsorId));
  };

  const editRound = (round: HackathonRound) => {
    setRounds(prev => prev.map(r => (r.id === round.id ? round : r)));
  };

  const deleteRound = (roundId: string) => {
    setRounds(prev => prev.filter(round => round.id !== roundId));
  };

  const addTrack = (data: HackathonTrack) => {
    setTracks(prev => [...prev, { id: uniqueId(), hackathonID: '', title: data.title, description: data.description }]);
  };

  const editTrack = (track: HackathonTrack) => {
    setTracks(prev => prev.map(t => (t.id === track.id ? track : t)));
  };

  const deleteTrack = (trackId: string) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  };

  const addPrize = (prize: HackathonPrize) => {
    setPrizes(prev => [...prev, { ...prize, id: uniqueId() }]);
  };

  const editPrize = (prize: HackathonPrize) => {
    setPrizes(prev => prev.map(p => (p.id === prize.id ? prize : p)));
  };

  const deletePrize = (id: string) => {
    setPrizes(prev => prev.filter(prize => prize.id !== id));
  };

  const eventDetailsValidator = () => {
    if (title.trim() === '') {
      Toaster.error('Enter Title');
      return false;
    }
    if (tagline.trim() === '') {
      Toaster.error('Enter Tagline');
      return false;
    }
    if (description.trim() === '') {
      Toaster.error('Enter Description');
      return false;
    }
    if (tags.length < 3) {
      Toaster.error('Add at least 3 tags');
      return false;
    }
    if (startTime === '') {
      Toaster.error('Enter Start Time');
      return false;
    }
    if (endTime === '') {
      Toaster.error('Enter End Time');
      return false;
    }

    const start = moment(startTime);
    const end = moment(endTime);

    if (start.isSameOrBefore(moment())) {
      Toaster.error('Start Time cannot be before current time.');
      return false;
    }
    if (end.isSameOrBefore(start)) {
      Toaster.error('End Time cannot be before Start Time');
      return false;
    }

    if (rounds.length === 0) {
      Toaster.error('Add at least one round');
      return false;
    }

    if (tracks.length === 0) {
      Toaster.error('Add at least one track');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!eventDetailsValidator() || !validateRounds() || !validateTeamFormationTimes()) return;

    const formData = {
      title,
      tagline,
      description,
      tags,
      links,
      location,
      startTime: getFormattedTime(startTime),
      endTime: getFormattedTime(endTime),
      teamFormationStartTime: getFormattedTime(teamFormationStartTime),
      teamFormationEndTime: getFormattedTime(teamFormationEndTime),
      minTeamSize: Number(minTeamSize),
      maxTeamSize: Number(maxTeamSize),
      tracks,
      prizes,
      rounds: rounds.map(round => ({
        ...round,
        startTime: getFormattedTime(round.startTime),
        endTime: getFormattedTime(round.endTime),
        judgingStartTime: getFormattedTime(round.judgingStartTime),
      })),
      sponsors,
      faqs,
      allowEditDuringJudging,
      enableGithubIntegration,
      enableFigmaIntegration,
      enableAutoCodeReviews,
      makeProjectsPublic,
      isRestricted,
      entryPassword,
    };

    const toaster = Toaster.startLoad('Adding the event...');

    const URL = `${ORG_URL}/${currentOrg.id}/hackathons`;

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      localStorage.removeItem(`hackathon-draft-${currentOrg.id}`);
      if (image) handleSubmitImage(res.data.event.hackathonID, toaster);
      else {
        Toaster.stopLoad(toaster, 'Competition Created!', 1);
        router.push(`/organisation/events`);
      }
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleSubmitImage = async (hackathonID: string, toaster: Id) => {
    if (!image) return;

    const formData = new FormData();
    formData.append('coverPic', image);

    const URL = `${ORG_URL}/${currentOrg.id}/hackathons/${hackathonID}/cover`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');
    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Competition Created!', 1);
    } else if (res.statusCode === 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }

    router.push(`/organisation/events`);
  };

  const handleSaveDraft = () => {
    const formData = {
      title,
      description,
      tagline,
      tags,
      links,
      location,
      startTime,
      endTime,
      teamFormationStartTime,
      teamFormationEndTime,
      minTeamSize,
      maxTeamSize,
      tracks,
      prizes,
      rounds,
      sponsors,
      faqs,
      allowEditDuringJudging,
      enableGithubIntegration,
      enableFigmaIntegration,
      enableAutoCodeReviews,
      makeProjectsPublic,
      isRestricted,
      entryPassword,
    };

    localStorage.setItem(`hackathon-draft-${currentOrg.id}`, JSON.stringify(formData));
    Toaster.success('Draft saved!');
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setTagline('');
    setTags([]);
    setLinks([]);
    setLocation('');
    setStartTime('');
    setEndTime('');
    setTeamFormationStartTime('');
    setTeamFormationEndTime('');
    setImage(null);
    setMinTeamSize(2);
    setMaxTeamSize(5);
    setTracks([]);
    setPrizes([]);
    setRounds([]);
    setSponsors([]);
    setFaqs([]);
    setAllowEditDuringJudging(false);
    setEnableGithubIntegration(false);
    setEnableFigmaIntegration(false);
    setEnableAutoCodeReviews(false);
    setMakeProjectsPublic(true);
    setIsRestricted(false);
    setEntryPassword('');
  };

  useEffect(() => {
    const savedData = localStorage.getItem(`hackathon-draft-${currentOrg.id}`);
    if (savedData) {
      const formData = JSON.parse(savedData);
      setTitle(formData.title || '');
      setDescription(formData.description || '');
      setTagline(formData.tagline || '');
      setTags(formData.tags || []);
      setLinks(formData.links || []);
      setLocation(formData.location || '');
      setStartTime(formData.startTime || '');
      setEndTime(formData.endTime || '');
      setTeamFormationStartTime(formData.teamFormationStartTime || '');
      setTeamFormationEndTime(formData.teamFormationEndTime || '');
      setMinTeamSize(Number(formData.minTeamSize) || 2);
      setMaxTeamSize(Number(formData.maxTeamSize) || 5);
      setTracks(formData.tracks || []);
      setPrizes(formData.prizes || []);
      setRounds(formData.rounds || []);
      setSponsors(formData.sponsors || []);
      setFaqs(formData.faqs || []);
      setAllowEditDuringJudging(formData.allowEditDuringJudging || false);
      setEnableGithubIntegration(formData.enableGithubIntegration || false);
      setEnableFigmaIntegration(formData.enableFigmaIntegration || false);
      setEnableAutoCodeReviews(formData.enableAutoCodeReviews || false);
      setMakeProjectsPublic(formData.makeProjectsPublic || true);
      setIsRestricted(formData.isRestricted || false);
      setEntryPassword(formData.entryPassword || '');
    }
  }, [currentOrg.id]);

  const validateRounds = () => {
    const hackathonStart = moment(startTime);
    const hackathonEnd = moment(endTime);
    const teamFormationEnd = moment(teamFormationEndTime);

    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      const roundStart = moment(round.startTime);
      const roundEnd = moment(round.endTime);
      const judgingStart = moment(round.judgingStartTime);

      if (roundStart.isBefore(hackathonStart) || roundEnd.isAfter(hackathonEnd)) {
        Toaster.error(`Round ${i + 1} is outside the hackathon start or end time.`);
        return false;
      }

      if (roundStart.isBefore(teamFormationEnd)) {
        Toaster.error(`Round ${i + 1} starts before team formation ends.`);
        return false;
      }

      if (judgingStart.isBefore(roundStart) || judgingStart.isAfter(roundEnd)) {
        Toaster.error(`Judging time for round ${i + 1} is not within the round's start and end times.`);
        return false;
      }

      if (i > 0) {
        const previousRoundEnd = moment(rounds[i - 1].endTime);
        if (roundStart.isBefore(previousRoundEnd)) {
          Toaster.error(`Round ${i + 1} overlaps with the previous round.`);
          return false;
        }
      }
    }

    return true;
  };

  const validateTeamFormationTimes = () => {
    const hackathonStart = moment(startTime);
    const hackathonEnd = moment(endTime);
    const teamFormationStart = moment(teamFormationStartTime);
    const teamFormationEnd = moment(teamFormationEndTime);

    if (!teamFormationStart.isBetween(hackathonStart, hackathonEnd)) {
      Toaster.error('Team Formation Start Time is not between hackathon timings.');
      return false;
    }

    if (!teamFormationEnd.isBetween(hackathonStart, hackathonEnd)) {
      Toaster.error('Team Formation End Time is not between hackathon timings.');
      return false;
    }

    return true;
  };

  const screens = [
    {
      title: 'Basics',
      content: (
        <div className="container mx-auto px-4 ">
          <Basics
            title={title}
            setTitle={setTitle}
            tagline={tagline}
            setTagline={setTagline}
            location={location}
            setLocation={setLocation}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            description={description}
            setDescription={setDescription}
            tags={tags}
            setTags={setTags}
            links={links}
            setLinks={setLinks}
            setCoverPic={setImage}
            isRestricted={isRestricted}
            setIsRestricted={setIsRestricted}
            entryPassword={entryPassword}
            setEntryPassword={setEntryPassword}
            isEditMode={false}
          />
        </div>
      ),
    },
    {
      title: 'Tracks',
      content: (
        <div className="container mx-auto px-4 ">
          <Tracks tracks={tracks} addTrack={addTrack} editTrack={editTrack} deleteTrack={deleteTrack} />
        </div>
      ),
    },
    {
      title: 'Prizes',
      content: (
        <div className="container mx-auto px-4">
          <Prizes prizes={prizes} addPrize={addPrize} editPrize={editPrize} deletePrize={deletePrize} tracks={tracks} />
        </div>
      ),
    },
    {
      title: 'Teams',
      content: (
        <div className="container mx-auto px-4 ">
          <Teams
            minTeamSize={minTeamSize}
            setMinTeamSize={setMinTeamSize}
            maxTeamSize={maxTeamSize}
            setMaxTeamSize={setMaxTeamSize}
            teamFormationStartTime={new Date(teamFormationStartTime)}
            setTeamFormationStartTime={setTeamFormationStartTime}
            teamFormationEndTime={new Date(teamFormationEndTime)}
            setTeamFormationEndTime={setTeamFormationEndTime}
          />
        </div>
      ),
    },
    {
      title: 'Rounds',
      content: (
        <div className="container mx-auto px-4">
          <Rounds rounds={rounds} addRound={addRound} editRound={editRound} deleteRound={deleteRound} />
        </div>
      ),
    },
    {
      title: 'Sponsors',
      content: (
        <div className="container mx-auto px-4">
          <Sponsors
            sponsors={sponsors}
            addSponsor={addSponsor}
            editSponsor={editSponsor}
            deleteSponsor={deleteSponsor}
          />
        </div>
      ),
    },
    {
      title: 'FAQs',
      content: (
        <div className="container mx-auto px-4">
          <FAQs faqs={faqs} addFAQ={addFAQ} editFAQ={editFAQ} deleteFAQ={deleteFAQ} />
        </div>
      ),
    },
    {
      title: 'Additional Details',
      content: (
        <div className="container mx-auto px-4">
          <AdditionalDetails
            github={enableGithubIntegration}
            setGithub={setEnableGithubIntegration}
            figma={enableFigmaIntegration}
            setFigma={setEnableFigmaIntegration}
            autoCodeReview={enableAutoCodeReviews}
            setAutoCodeReview={setEnableAutoCodeReviews}
            projectEditing={allowEditDuringJudging}
            setProjectEditing={setAllowEditDuringJudging}
            projectPublic={makeProjectsPublic}
            setProjectPublic={setMakeProjectsPublic}
          />
        </div>
      ),
    },
  ];

  return (
    <BaseWrapper title={`Events | ${currentOrg.title}`}>
      <OrgSidebar index={12} />
      <MainWrapper>
        <div className="w-full bg-gray-50 dark:bg-neutral-900 h-full flex flex-col gap-2 px-6 pb-10 justify-between">
          <Timeline data={screens} />
          <div className="w-full flex items-center justify-between">
            <div className="w-fit flex-center gap-2">
              <Button onClick={handleResetForm} className="w-fit" variant="outline">
                Reset Form
              </Button>
              <Button onClick={handleSaveDraft} className="w-fit">
                Save this Draft
              </Button>
            </div>
            <GlowButton label="Submit Your Competition" onClick={handleSubmit} />
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NewHackathon;
