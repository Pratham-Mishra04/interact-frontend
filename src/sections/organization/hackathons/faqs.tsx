import React, { useState } from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';
import { HackathonFAQ } from '@/types';

interface FAQManagerProps {
  faqs: HackathonFAQ[];
  addFAQ: (faq: HackathonFAQ) => void;
  editFAQ: (faq: HackathonFAQ) => void;
  deleteFAQ: (id: string) => void;
}

const FAQs: React.FC<FAQManagerProps> = ({ faqs, addFAQ, editFAQ, deleteFAQ }) => {
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
  };

  const handleAddOrEditFAQ = () => {
    if (!question.trim() || !answer.trim()) return;

    const faqData = { id: '', hackathonID: '', question, answer };

    if (isEditing !== null) {
      faqData.id = isEditing;

      editFAQ(faqData);
      setIsEditing(null);
    } else {
      addFAQ(faqData);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEditFAQ = (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsEditing(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    resetForm();
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 w-fit"
        onClick={() => setShowModal(true)}
      >
        <Plus size={20} />
        Add FAQ
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{isEditing !== null ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                &#x2715;
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="question" className="text-sm font-medium text-gray-300">
                  Question
                </label>
                <input
                  id="question"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your question"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="answer" className="text-sm font-medium text-gray-300">
                  Answer
                </label>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  maxLength={250}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter your answer"
                />
              </div>

              <button
                className="w-full mt-2 bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddOrEditFAQ}
                disabled={!question.trim() || !answer.trim()}
              >
                {isEditing !== null ? 'Save Changes' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {faqs.length > 0 ? (
        <div className="w-full flex flex-col gap-4">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 w-full">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{faq.question}</h3>
                  <p className="text-gray-400 mt-2 whitespace-pre-wrap">{faq.answer}</p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => handleEditFAQ(faq.id)}>
                    <Pencil className="text-blue-400 hover:text-blue-300 transition-colors" size={20} />
                  </button>
                  <button onClick={() => deleteFAQ(faq.id)}>
                    <Trash className="text-red-400 hover:text-red-300 transition-colors" size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          No FAQs added yet.
        </div>
      )}
    </div>
  );
};

export default FAQs;
