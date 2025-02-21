import React, { useState } from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';
import { HackathonPrize, HackathonTrack } from '@/types';

interface PrizeManagerProps {
  prizes: HackathonPrize[];
  addPrize: (prize: HackathonPrize) => void;
  editPrize: (prize: HackathonPrize) => void;
  deletePrize: (id: string) => void;
  tracks: HackathonTrack[];
}

const Prizes: React.FC<PrizeManagerProps> = ({ prizes, addPrize, editPrize, deletePrize, tracks }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [trackID, setTrackID] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingPrize, setDeletingPrize] = useState<string[]>([]);
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setTrackID('');
  };

  const handleAddOrEditPrize = () => {
    if (!title.trim() || !amount.trim()) return;

    const prizeData: HackathonPrize = {
      id: '',
      hackathonID: '',
      title,
      description,
      amount: Number(amount),
      hackathonTrackID: trackID || undefined,
    };

    if (isEditing) {
      prizeData.id = isEditing;

      editPrize(prizeData);
      setIsEditing(null);
    } else {
      addPrize(prizeData);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEditPrize = (id: string) => {
    const prize = prizes.find(p => p.id === id);
    if (!prize) return;

    setTitle(prize.title);
    setDescription(prize.description || '');
    setAmount(prize.amount.toString());
    setTrackID(prize.hackathonTrackID || '');
    setIsEditing(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    resetForm();
  };
  const handleDeletePrize = async (sponsorId: string) => {
    if (window.confirm('Are you sure you want to delete this prize?')) {
      // Add the sponsor ID to the deleting list immediately
      setDeletingPrize(prev => [...prev, sponsorId]);

      // Perform the delete operation
      await deletePrize(sponsorId);
    }
  };
  return (
    <div className="w-full flex flex-col gap-6 relative">
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 w-fit"
        onClick={() => setShowModal(true)}
      >
        <Plus size={20} />
        Add Prize
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Prize' : 'Add Prize'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                &#x2715;
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-300">
                  Prize Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  placeholder="Enter prize title"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white resize-none"
                  placeholder="Enter prize description"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="amount" className="text-sm font-medium text-gray-300">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  placeholder="Enter prize amount"
                />
              </div>

              {tracks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="trackID" className="text-sm font-medium text-gray-300">
                    Select Track (Optional)
                  </label>
                  <select
                    id="trackID"
                    value={trackID}
                    onChange={e => setTrackID(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  >
                    <option value="">Select a track</option>
                    {tracks.map(track => (
                      <option key={track.id} value={track.id}>
                        {track.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                className="w-full mt-2 bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200"
                onClick={handleAddOrEditPrize}
              >
                {isEditing ? 'Save Changes' : 'Add Prize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {prizes.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4">
          {prizes.map(prize => (
            <div
              key={prize.id}
              className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex flex-col w-full"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-lg">{prize.title}</h3>
                  <p className="text-gray-400">{prize.description}</p>
                  <p className="text-green-400 font-medium">{Number(prize.amount).toLocaleString()}</p>
                  {prize.hackathonTrackID && (
                    <p className="text-sm text-gray-500">
                      Track: {tracks.find(track => track.id === prize.hackathonTrackID)?.title}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => handleEditPrize(prize.id)}>
                    <Pencil className="text-blue-400 hover:text-blue-300 transition-colors" size={20} />
                  </button>
                  <button onClick={() => handleDeletePrize(prize.id)}>
                    <Trash className="text-red-400 hover:text-red-300 transition-colors" size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          No prizes available.
        </div>
      )}
    </div>
  );
};

export default Prizes;
