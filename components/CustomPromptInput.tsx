import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CustomPromptInputProps {
  onSubmit: (prompt: string) => void;
  onClose: () => void;
  initialPrompt?: string;
  title?: string;
  placeholder?: string;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ 
  onSubmit, 
  onClose, 
  initialPrompt = '',
  title = 'Create Your Own Transformation',
  placeholder = "Example: Turn me into a wizard with a magical staff and flowing robes..."
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  
  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full bg-black/90 backdrop-blur-xl rounded-t-3xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-6" />
        
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-4">
          Type what you'd like to see. Be creative and specific!
        </p>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/40 rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoFocus
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              prompt.trim()
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomPromptInput;