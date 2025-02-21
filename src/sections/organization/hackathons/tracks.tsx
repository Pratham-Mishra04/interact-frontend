import React, { useState } from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';
import { HackathonTrack } from '@/types';

interface TrackManagerProps {
  tracks: HackathonTrack[];
  addTrack: (data: HackathonTrack) => void;
  editTrack: (data: HackathonTrack) => void;
  deleteTrack: (trackId: string) => void;
}

const Tracks: React.FC<TrackManagerProps> = ({ tracks, addTrack, editTrack, deleteTrack }) => {
  const [trackName, setTrackName] = useState('');
  const [trackDescription, setTrackDescription] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const handleAddOrEditTrack = () => {
    if (!trackName.trim() || !trackDescription.trim()) return;

    const trackData: HackathonTrack = {
      id: '',
      hackathonID: '',
      title: trackName,
      description: trackDescription,
    };

    if (isEditing !== null) {
      trackData.id = isEditing;
      editTrack(trackData);
      setIsEditing(null);
    } else {
      addTrack(trackData);
    }

    setTrackName('');
    setTrackDescription('');
    setShowModal(false);
  };

  const handleEditTrack = (track: HackathonTrack) => {
    setTrackName(track.title);
    setTrackDescription(track.description || '');
    setIsEditing(track.id);
    setShowModal(true);
  };

  const handleDeleteTrack = async (sponsorId: string) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      deleteTrack(sponsorId);
    }
  };
  return (
    <div className="w-full flex flex-col gap-6 relative">
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 w-fit"
        onClick={() => setShowModal(true)}
      >
        <Plus size={20} />
        Add Track
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{isEditing !== null ? 'Edit Track' : 'Add Track'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                &#x2715;
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Track Title</label>
                <input
                  value={trackName}
                  onChange={e => setTrackName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter track title"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Track Description</label>
                <textarea
                  value={trackDescription}
                  onChange={e => setTrackDescription(e.target.value)}
                  maxLength={250}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter track description"
                />
              </div>

              <button
                className="w-full mt-2 bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddOrEditTrack}
                disabled={!trackName.trim() || !trackDescription.trim()}
              >
                {isEditing !== null ? 'Save Changes' : 'Add Track'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tracks.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4">
          {tracks.map((track: HackathonTrack) => (
            <div
              key={track.id}
              className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex flex-col w-full"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">{track.title}</h3>
                  <p className="text-gray-400 mt-1">{track.description}</p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => handleEditTrack(track)}>
                    <Pencil className="text-blue-400 hover:text-blue-300 transition-colors" size={20} />
                  </button>
                  <button onClick={() => handleDeleteTrack(track.id)}>
                    <Trash className="text-red-400 hover:text-red-300 transition-colors" size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          Minimum 1 Track is required.
        </div>
      )}
    </div>
  );
};

export default Tracks;
