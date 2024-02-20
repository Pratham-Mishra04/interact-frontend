import Sentences from '@/components/utils/edit_sentences';
import Tags from '@/components/utils/edit_tags';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { College, Profile, User } from '@/types';
import { collegesData } from '@/utils/colleges';
import isArrEdited from '@/utils/funcs/check_array_edited';
import Toaster from '@/utils/toaster';
import { Buildings, CalendarBlank, Certificate, Envelope, MapPin, PencilSimple, Phone, X } from '@phosphor-icons/react';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  profile: Profile;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  org?: boolean;
}

const About = ({ profile, setUser, org = false }: Props) => {
  const [school, setSchool] = useState(profile.school || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [yog, setYOG] = useState(profile.yearOfGraduation || 0);

  const [description, setDescription] = useState(profile.description || '');
  const [hobbies, setHobbies] = useState(profile.hobbies || []);
  const [areas, setAreas] = useState(profile.areasOfCollaboration || []);

  const [email, setEmail] = useState(profile.email || '');
  const [phoneNo, setPhoneNo] = useState(profile.phoneNo || '');
  const [location, setLocation] = useState(profile.location || '');

  const [mutex, setMutex] = useState(false);

  const [clickedOnSchool, setClickedOnSchool] = useState(false);
  const [clickedOnDegree, setClickedOnDegree] = useState(false);
  const [clickedOnYOG, setClickedOnYOG] = useState(false);
  const [clickedOnDescription, setClickedOnDescription] = useState(false);
  const [clickedOnHobbies, setClickedOnHobbies] = useState(false);
  const [clickedOnAreas, setClickedOnAreas] = useState(false);
  const [clickedOnEmail, setClickedOnEmail] = useState(false);
  const [clickedOnPhoneNo, setClickedOnPhoneNo] = useState(false);
  const [clickedOnLocation, setClickedOnLocation] = useState(false);

  const [schoolSearch, setSchoolSearch] = useState('');

  const [colleges, setColleges] = useState<College[]>([]);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = async (field: string) => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating your Profile...');
    const formData = new FormData();

    if (field == 'school') formData.append('school', school);
    else if (field == 'degree') formData.append('degree', degree);
    else if (field == 'yog') formData.append('yog', String(yog));
    else if (field == 'email') formData.append('email', email);
    else if (field == 'phoneNo') formData.append('phoneNo', phoneNo);
    else if (field == 'location') formData.append('location', location);
    else if (field == 'description') formData.append('description', description.replace(/\n{3,}/g, '\n\n'));
    else if (field == 'hobbies') hobbies.forEach(hobby => formData.append('hobbies', hobby));
    else if (field == 'areas') areas.forEach(area => formData.append('areas', area));

    const URL = org ? `${ORG_URL}/${currentOrgID}/me` : `${USER_URL}/me`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const profile = res.data.profile;
      setUser(prev => ({
        ...prev,
        profile,
      }));
      Toaster.stopLoad(toaster, 'Profile Updated', 1);

      if (field == 'school') setClickedOnSchool(false);
      else if (field == 'degree') setClickedOnDegree(false);
      else if (field == 'yog') setClickedOnYOG(false);
      else if (field == 'description') setClickedOnDescription(false);
      else if (field == 'hobbies') setClickedOnHobbies(false);
      else if (field == 'areas') setClickedOnAreas(false);
      else if (field == 'email') setClickedOnEmail(false);
      else if (field == 'phoneNo') setClickedOnPhoneNo(false);
      else if (field == 'location') setClickedOnLocation(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  useEffect(() => {
    if (schoolSearch == '') setColleges([]);
    else {
      const results = fuzzysort.go(schoolSearch, collegesData, { key: 'fuzzy', limit: 10 });
      setColleges(results.map(result => result.obj));
    }
  }, [schoolSearch]);

  interface SaveBtnProps {
    setter: React.Dispatch<React.SetStateAction<boolean>>;
    field: string;
  }

  const SaveBtn = ({ setter, field }: SaveBtnProps) => {
    const checker = () => {
      if (field == 'school') return school == profile.school;
      else if (field == 'degree') return degree == profile.degree;
      else if (field == 'yog') return yog == profile.yearOfGraduation || yog < 1980;
      else if (field == 'description') return description == profile.description;
      else if (field == 'email') return email == profile.email;
      else if (field == 'phoneNo') return phoneNo == profile.phoneNo;
      else if (field == 'location') return location == profile.location;
      else if (field == 'hobbies') return !isArrEdited(hobbies, profile.hobbies);
      else if (field == 'areas') return !isArrEdited(areas, profile.areasOfCollaboration);
      return true;
    };
    return (
      <div className="w-full flex text-sm justify-end gap-2 mt-2">
        <div
          onClick={() => setter(false)}
          className="border-[1px] border-primary_black flex-center rounded-full w-20 p-1 cursor-pointer"
        >
          Cancel
        </div>
        {checker() ? (
          <div className="bg-primary_black bg-opacity-50 text-white flex-center rounded-full w-16 p-1 cursor-default">
            Save
          </div>
        ) : (
          <div
            onClick={() => handleSubmit(field)}
            className="bg-primary_black text-white flex-center rounded-full w-16 p-1 cursor-pointer"
          >
            Save
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[640px] max-md:w-screen text-primary_black mx-auto flex flex-col gap-4 max-md:px-6 pb-8">
      {!org ? (
        <>
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex justify-between items-center flex-wrap gap-4">
              <div
                className={`w-fit min-w-[80%] flex gap-2 ${
                  clickedOnSchool ? 'items-start' : 'items-center'
                } text-xl font-medium`}
              >
                <Buildings weight="bold" size={24} />

                {clickedOnSchool ? (
                  <div className="w-full">
                    <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                      College Name ({school.trim().length}/25)
                    </div>
                    {school != '' ? (
                      <div className="w-full relative group rounded-lg p-2 flex justify-between items-center bg-gray-100">
                        <div className="text-lg cursor-default">{school}</div>
                        <X
                          onClick={() => {
                            setSchool('');
                            setSchoolSearch('');
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    ) : (
                      <input
                        className="w-full text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-2 font-semibold bg-transparent"
                        type="text"
                        maxLength={50}
                        value={schoolSearch}
                        onChange={el => setSchoolSearch(el.target.value)}
                      />
                    )}
                    <SaveBtn setter={setClickedOnSchool} field="school" />

                    {school == '' && schoolSearch != '' && (
                      <div className="w-full flex flex-col gap-2">
                        <div className="w-fit h-5 text-sm font-medium cursor-default">Suggestions</div>

                        <div className="w-full flex flex-wrap gap-2">
                          {colleges?.map(college => (
                            <div
                              key={college.name}
                              onClick={() => {
                                setSchool(college.name);
                                setSchoolSearch(college.name);
                                setLocation(college.city);
                                setColleges([]);
                              }}
                              className="border-[1px] border-primary_black rounded-lg px-2 py-1 text-xs cursor-pointer"
                            >
                              {college.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => setClickedOnSchool(true)}
                    className={`w-fit relative group rounded-lg p-2 pr-10 ${
                      profile.school.trim() == '' ? 'bg-gray-100' : 'hover:bg-gray-100'
                    } cursor-pointer transition-ease-300`}
                  >
                    <PencilSimple
                      className={`absolute ${
                        profile.school.trim() == '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }  -translate-y-1/2 top-1/2 right-2 transition-ease-300`}
                    />
                    {profile.school.trim() == '' ? (
                      <div className="text-sm font-normal">Add College Name</div>
                    ) : (
                      <div>{profile.school}</div>
                    )}
                  </div>
                )}
              </div>
              {profile.school != '' ? (
                <div
                  className={`flex items-center ${
                    yog == 0 ? 'flex-row-reverse gap-2' : 'gap-1 max-md:flex-row-reverse'
                  }`}
                >
                  {clickedOnYOG ? (
                    <div className="w-fit">
                      <div className="text-xs ml-1 font-medium uppercase text-gray-500">Graduation Year</div>
                      <input
                        value={yog}
                        type="number"
                        onChange={el => setYOG(Number(el.target.value))}
                        placeholder="2023"
                        className="w-fit text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-2 font-semibold bg-transparent"
                      />
                      <SaveBtn setter={setClickedOnYOG} field="yog" />
                    </div>
                  ) : (
                    <div
                      onClick={() => setClickedOnYOG(true)}
                      className={`w-fit relative group rounded-lg p-2 ${
                        profile.yearOfGraduation == 0
                          ? 'bg-gray-100 pr-8'
                          : 'hover:bg-gray-100 pl-8 max-md:pr-8 max-md:pl-0'
                      } cursor-pointer transition-ease-300`}
                    >
                      <PencilSimple
                        className={`absolute ${
                          profile.yearOfGraduation == 0
                            ? 'opacity-100 right-2'
                            : 'opacity-0 group-hover:opacity-100 md:left-2 max-md:right-2'
                        } -translate-y-1/2 top-1/2 transition-ease-300`}
                      />
                      {profile.yearOfGraduation == 0 ? (
                        <div className="text-sm">Add Degree Completion Year</div>
                      ) : (
                        <div>{profile.yearOfGraduation}</div>
                      )}
                    </div>
                  )}

                  <CalendarBlank weight="bold" size={24} />
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="w-full flex gap-2 items-center text-lg">
              <Certificate weight="bold" size={24} />

              {clickedOnDegree ? (
                <div className="w-3/4">
                  <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                    Degree Name ({degree.trim().length}/25)
                  </div>
                  <input
                    maxLength={25}
                    value={degree}
                    onChange={el => setDegree(el.target.value)}
                    placeholder="Bachelors in Interacting"
                    className="w-full text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-2 font-semibold bg-transparent"
                  />
                  <SaveBtn setter={setClickedOnDegree} field="degree" />
                </div>
              ) : (
                <div
                  onClick={() => setClickedOnDegree(true)}
                  className={`w-fit relative group rounded-lg p-2 pr-10 ${
                    profile.degree.trim() == '' ? 'bg-gray-100' : 'hover:bg-gray-100'
                  } cursor-pointer transition-ease-300`}
                >
                  <PencilSimple
                    className={`absolute ${
                      profile.degree.trim() == '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }  -translate-y-1/2 top-1/2 right-2 transition-ease-300`}
                  />
                  {profile.degree.trim() == '' ? (
                    <div className="text-sm">Add Degree Name</div>
                  ) : (
                    <div>{profile.degree}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
        </>
      ) : (
        <></>
      )}

      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex justify-between items-center flex-wrap gap-4">
          <div className="w-fit flex gap-2 items-center text-xl font-medium">
            <Envelope weight="regular" size={24} />

            {clickedOnEmail ? (
              <div className="w-fit z-10">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Public Email</div>
                <input
                  value={email}
                  onChange={el => setEmail(el.target.value)}
                  placeholder="Email"
                  className="w-full text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-2 text-sm font-medium bg-transparent"
                />
                <SaveBtn setter={setClickedOnEmail} field="email" />
              </div>
            ) : (
              <div
                onClick={() => setClickedOnEmail(true)}
                className={`w-fit relative group rounded-lg p-2 pr-10 ${
                  profile.email.trim() == '' ? 'bg-gray-100' : 'hover:bg-gray-100'
                } cursor-pointer transition-ease-300`}
              >
                <PencilSimple
                  className={`absolute ${
                    profile.email.trim() == '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }  -translate-y-1/2 top-1/2 right-2 transition-ease-300`}
                />
                {profile.email.trim() == '' ? (
                  <div className="text-sm font-normal">Add Public Email</div>
                ) : (
                  <div>{profile.email}</div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center max-md:flex-row-reverse">
            {clickedOnPhoneNo ? (
              <div className="w-fit z-10">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Public Phone Number</div>
                <input
                  value={phoneNo}
                  type="string"
                  onChange={el => setPhoneNo(el.target.value)}
                  className="w-fit text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-2 text-sm font-medium bg-transparent"
                />
                <SaveBtn setter={setClickedOnPhoneNo} field="phoneNo" />
              </div>
            ) : (
              <div
                onClick={() => setClickedOnPhoneNo(true)}
                className={`w-fit relative group rounded-lg p-2 pl-10 max-md:pr-8 max-md:pl-0 ${
                  profile.phoneNo == '' ? 'bg-gray-100' : 'hover:bg-gray-100'
                } cursor-pointer transition-ease-300`}
              >
                <PencilSimple
                  className={`absolute ${
                    profile.phoneNo == '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }  -translate-y-1/2 top-1/2 md:left-2 max-md:right-2 transition-ease-300`}
                  size={20}
                />
                {profile.phoneNo == '' ? (
                  <div className="text-sm">Add Public Phone No</div>
                ) : (
                  <div>{profile.phoneNo}</div>
                )}
              </div>
            )}

            <Phone weight="regular" size={20} />
          </div>
        </div>
        {!org && (
          <div className="w-full flex gap-2 items-center text-lg">
            <MapPin weight="regular" size={24} />

            {clickedOnLocation ? (
              <div className="w-3/4 z-10">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                  Location ({location.trim().length}/25)
                </div>
                <input
                  maxLength={25}
                  value={location}
                  onChange={el => setLocation(el.target.value)}
                  className="w-full text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-2 font-semibold bg-transparent"
                />
                <SaveBtn setter={setClickedOnLocation} field="location" />
              </div>
            ) : (
              <div
                onClick={() => setClickedOnLocation(true)}
                className={`w-fit relative group rounded-lg p-2 pr-10 ${
                  profile.location.trim() == '' ? 'bg-gray-100' : 'hover:bg-gray-100'
                } cursor-pointer transition-ease-300`}
              >
                <PencilSimple
                  className={`absolute ${
                    profile.location.trim() == '' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }  -translate-y-1/2 top-1/2 right-2 transition-ease-300`}
                />
                {profile.location.trim() == '' ? (
                  <div className="text-sm">Add Location</div>
                ) : (
                  <div>{profile.location}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>

      {clickedOnDescription ? (
        <div className="w-full">
          <div className="text-xs ml-1 font-medium uppercase text-gray-500">
            Descriptive Bio ({description.trim().length}/1500)
          </div>
          <textarea
            value={description}
            onChange={el => setDescription(el.target.value)}
            placeholder="add a professional bio"
            maxLength={1500}
            className="w-full min-h-[200px] max-h-[320px] focus:outline-none text-primary_black border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg p-2 text-sm bg-transparent"
          />
          <SaveBtn setter={setClickedOnDescription} field="description" />
        </div>
      ) : (
        <div
          onClick={() => setClickedOnDescription(true)}
          className={`w-full relative group rounded-lg flex-center p-4 max-md:p-0 ${
            profile.description.trim() == '' ? 'bg-gray-100' : 'hover:bg-gray-100'
          } cursor-pointer transition-ease-300`}
        >
          <PencilSimple
            className={`absolute opacity-0 ${
              profile.description.trim() == '' ? 'opacity-100' : 'group-hover:opacity-100'
            } top-2 right-2 transition-ease-300`}
          />
          {profile.description.trim() == '' ? (
            <div className="">Click here to add a Descriptive Bio!</div>
          ) : (
            <div className={`whitespace-pre-wrap max-md:text-sm cursor-pointer`}>{profile.description}</div>
          )}
        </div>
      )}
      <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
      <div className="w-full flex flex-col gap-2">
        {clickedOnAreas ? (
          <div className="w-full flex flex-col gap-2">
            <div className="text-sm font-medium uppercase">
              {org ? 'Areas of Work' : 'Preferred Areas of Collaboration'} ({areas.length || 0}/10)
            </div>
            <Tags tags={areas} setTags={setAreas} maxTags={10} />
            <SaveBtn setter={setClickedOnAreas} field="areas" />
          </div>
        ) : (
          <>
            <div className="text-sm font-medium uppercase">
              {org ? 'Areas of Work' : 'Preferred Areas of Collaboration'}
            </div>

            <div
              onClick={() => setClickedOnAreas(true)}
              className={`w-full relative group rounded-lg flex-center p-4 ${
                !profile.areasOfCollaboration || profile.areasOfCollaboration?.length == 0
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-100'
              } cursor-pointer transition-ease-300`}
            >
              <PencilSimple
                className={`absolute opacity-0 ${
                  !profile.areasOfCollaboration || profile.areasOfCollaboration?.length == 0
                    ? 'opacity-100'
                    : 'group-hover:opacity-100'
                } top-2 right-2 transition-ease-300`}
              />
              {!profile.areasOfCollaboration || profile.areasOfCollaboration.length == 0 ? (
                <div className="">Click here to edit!</div>
              ) : (
                <div className="w-full flex flex-wrap gap-4">
                  {profile.areasOfCollaboration.map((el, i) => (
                    <div
                      key={i}
                      className="border-gray-500 border-[1px] border-dashed p-2 text-sm rounded-lg flex-center"
                    >
                      <div className="" style={{ userSelect: 'none' }}>
                        {el}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
      <div className="w-full flex flex-col gap-2">
        <div className="text-sm font-medium uppercase">Achievements</div>
      </div> */}

      <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>

      {clickedOnHobbies ? (
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium uppercase">
            {org ? 'Message Board' : 'Hobbies and Interest'} ({hobbies.length || 0}/5)
          </div>
          <Sentences sentences={hobbies} setSentences={setHobbies} maxSentences={5} />
          <SaveBtn setter={setClickedOnHobbies} field="hobbies" />
        </div>
      ) : (
        <div onClick={() => setClickedOnHobbies(true)} className="w-full flex flex-col gap-2">
          <div className="w-full flex justify-between group cursor-pointer">
            <div className="text-sm font-medium uppercase">{org ? 'Message Board' : 'Hobbies and Interest'}</div>
            <PencilSimple className={`opacity-0 group-hover:opacity-100 transition-ease-300`} />
          </div>

          {!profile.hobbies || profile.hobbies.length == 0 ? (
            <div className="text-center py-4 bg-gray-100 rounded-lg cursor-pointer">Click here to edit!</div>
          ) : (
            <div className="w-full flex flex-wrap">
              {profile.hobbies.map((el, i) => (
                <div
                  key={i}
                  className="text-sm hover:bg-white p-3 py-2 rounded-lg cursor-pointer hover:scale-105 transition-ease-500"
                >
                  {el}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default About;
