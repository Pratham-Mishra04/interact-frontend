import React, { useState } from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';
import moment from 'moment';
import { HackathonRound } from '@/types';
import { initialHackathonRound } from '@/types/initials';
import { getInputFieldFormatTime } from '@/utils/funcs/time';

interface RoundManagerProps {
  rounds: HackathonRound[];
  addRound: (data: HackathonRound) => void;
  editRound: (data: HackathonRound) => void;
  deleteRound: (roundId: string) => void;
}

const Rounds: React.FC<RoundManagerProps> = ({ rounds, addRound, editRound, deleteRound }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formState, setFormState] = useState(initialHackathonRound);
  const [optionsMetric, setOptionsMetric] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: new Date(value),
    }));
  };

  const handleAddMetric = () => {
    setFormState(prev => ({
      ...prev,
      metrics: [
        ...(prev.metrics || []),
        { id: Date.now().toString(), hackathonRoundID: prev.id, title: '', type: 'text', options: [] },
      ],
    }));
  };

  const handleMetricChange = (index: number, field: string, value: string | string[]) => {
    if (field === 'options') {
      setOptionsMetric(value as string);
      value = (value as string).split(',').map(opt => opt.trim());
    }
    setFormState(prev => ({
      ...prev,
      metrics: prev.metrics.map((metric, i) => (i === index ? { ...metric, [field]: value } : metric)),
    }));
  };

  const handleDeleteMetric = (index: number) => {
    setFormState(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  };

  const handleAddOrEditRound = () => {
    if (isEditing) {
      formState.id = isEditing;

      editRound(formState);
    } else {
      addRound(formState);
    }
    setShowModal(false);
    setIsEditing(null);
    resetForm();
  };

  const handleEditRound = (round: HackathonRound) => {
    setFormState(round);
    setIsEditing(round.id);
    setShowModal(true);
  };

  const handleDeleteRound = async (sponsorId: string) => {
    if (window.confirm('Are you sure you want to delete this round?')) {
      // Perform the delete operation
      await deleteRound(sponsorId);
    }
  };

  const resetForm = () => {
    setFormState(initialHackathonRound);
    setOptionsMetric('');
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 w-fit"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        <Plus size={20} />
        Add Round
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Round' : 'Add Round'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                &#x2715;
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label htmlFor="startTime" className="text-sm font-medium text-gray-300">
                  Start Time
                </label>
                <input
                  id="startTime"
                  type="datetime-local"
                  name="startTime"
                  value={getInputFieldFormatTime(formState.startTime)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="endTime" className="text-sm font-medium text-gray-300">
                  End Time
                </label>
                <input
                  id="endTime"
                  type="datetime-local"
                  name="endTime"
                  value={getInputFieldFormatTime(formState.endTime)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="judgingStartTime" className="text-sm font-medium text-gray-300">
                  Judging Start Time
                </label>
                <input
                  id="judgingStartTime"
                  type="datetime-local"
                  name="judgingStartTime"
                  value={getInputFieldFormatTime(formState.judgingStartTime)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">Metrics</h4>
                  <button
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    onClick={handleAddMetric}
                  >
                    <Plus size={16} />
                    Add Metric
                  </button>
                </div>

                {formState.metrics?.map((metric, index) => (
                  <div key={index} className="flex flex-col gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <input
                          value={metric.title}
                          onChange={e => handleMetricChange(index, 'title', e.target.value)}
                          placeholder="Metric Title"
                          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                        />
                      </div>
                      <button onClick={() => handleDeleteMetric(index)} className="ml-2 mt-2">
                        <Trash className="text-red-400 hover:text-red-300 transition-colors" size={20} />
                      </button>
                    </div>

                    <textarea
                      value={metric.description || ''}
                      onChange={e => handleMetricChange(index, 'description', e.target.value)}
                      placeholder="Metric Description"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white resize-none"
                    />

                    <select
                      value={metric.type}
                      onChange={e => handleMetricChange(index, 'type', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="boolean">Boolean</option>
                    </select>

                    {metric.type === 'select' && (
                      <textarea
                        value={optionsMetric}
                        onChange={e => handleMetricChange(index, 'options', e.target.value)}
                        placeholder="Options (comma separated)"
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                className="w-full mt-2 bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddOrEditRound}
                disabled={formState.metrics?.length === 0}
              >
                {isEditing ? 'Save Changes' : 'Add Round'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rounds.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4">
          {rounds.map(round => (
            <div
              key={round.id}
              className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex flex-col w-full"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">Round</h3>
                  <p className="text-gray-400 mt-1">Start: {moment(round.startTime).format('YYYY-MM-DD HH:mm')}</p>
                  <p className="text-gray-400">End: {moment(round.endTime).format('YYYY-MM-DD HH:mm')}</p>
                  <p className="text-gray-400">
                    Judging: {moment(round.judgingStartTime).format('YYYY-MM-DD HH:mm')} -{' '}
                    {moment(round.endTime).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => handleEditRound(round)} aria-label="Edit round">
                    <Pencil className="text-blue-400 hover:text-blue-300 transition-colors" size={20} />
                  </button>
                  <button onClick={() => handleDeleteRound(round.id)} aria-label="Delete round">
                    <Trash className="text-red-400 hover:text-red-300 transition-colors" size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-bold text-white">Metrics:</h4>
                <div className="mt-2 space-y-2">
                  {round.metrics?.map((metric, index) => (
                    <div key={index} className="text-sm bg-gray-800 p-3 rounded-lg">
                      <p className="font-bold text-white">{metric.title}</p>
                      <p className="text-gray-400">{metric.description}</p>
                      <p className="text-gray-500">Type: {metric.type}</p>
                      {metric.type === 'select' && (
                        <p className="text-gray-500">Options: {metric.options?.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          No rounds added yet.
        </div>
      )}
    </div>
  );
};

export default Rounds;
