
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/data';
import { Confession } from '../types';
import { NeonButton } from '../components/Common';
import { ArrowLeft, Image as ImageIcon, Send, Heart, Crown, MessageCircle, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export const Confessions: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Comments State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      // Filter confessions by the current user's university
      setConfessions(dataService.getConfessions(currentUser.university));
    }
  }, [currentUser]);

  const refreshConfessions = () => {
    if (currentUser) {
        setConfessions(dataService.getConfessions(currentUser.university));
    }
  };

  const handlePost = () => {
    if (!newText.trim() && !newImage) return;
    if (!currentUser) return;

    setIsPosting(true);

    // Simulate network delay
    setTimeout(() => {
        const confession: Confession = {
            id: Date.now().toString(),
            userId: currentUser.anonymousId,
            text: newText,
            imageUrl: newImage || undefined,
            timestamp: Date.now(),
            likes: 0,
            comments: [],
            university: currentUser.university
        };

        dataService.addConfession(confession);
        refreshConfessions();
        setNewText('');
        setNewImage(null);
        setIsPosting(false);
    }, 1000);
  };

  const handleImageClick = () => {
    if (currentUser?.isPremium) {
      document.getElementById('confession-image-input')?.click();
    } else {
      setIsPremiumModalOpen(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await authService.uploadAvatar(file);
      setNewImage(base64);
    }
  };

  const handleLike = (id: string) => {
    dataService.likeConfession(id);
    refreshConfessions();
  };

  const buyPremium = () => {
    // Simulate buying premium
    setIsPremiumModalOpen(false);
    // Optimistically update user to premium for this session
    updateProfile({ isPremium: true });
    alert("Welcome to Premium! You can now post images.");
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = (confessionId: string) => {
      const text = commentInputs[confessionId];
      if (!text?.trim() || !currentUser) return;

      dataService.addComment(confessionId, text, currentUser.anonymousId);
      setCommentInputs(prev => ({ ...prev, [confessionId]: '' }));
      refreshConfessions();
      
      // Ensure expanded so they see their new comment
      setExpandedComments(prev => ({ ...prev, [confessionId]: true }));
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-900 flex items-center gap-4 bg-black/90 backdrop-blur z-20 shrink-0">
        <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            Confessions <span className="bg-neon text-white text-[10px] px-2 py-0.5 rounded-full">BETA</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono truncate max-w-[250px]">{currentUser?.university}</p>
        </div>
      </div>

      {/* Feed - Fixed Height Container with Scrolling */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-32">
        {confessions.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
                <p>No confessions yet. Be the first to spill the tea! ☕</p>
            </div>
        ) : (
            confessions.map(conf => (
            <div key={conf.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">?</span>
                    </div>
                    <span className="text-sm font-bold text-gray-400">{conf.userId}</span>
                </div>
                <span className="text-[10px] text-gray-600">{new Date(conf.timestamp).toLocaleDateString()}</span>
                </div>
                
                <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{conf.text}</p>
                
                {conf.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-800">
                        <img src={conf.imageUrl} alt="Confession" className="w-full h-auto object-cover max-h-96" />
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => handleLike(conf.id)}
                            className="flex items-center gap-2 text-gray-500 hover:text-neon transition-colors text-xs font-bold group"
                        >
                            <Heart className="w-4 h-4 group-hover:fill-neon" /> {conf.likes}
                        </button>
                        <button 
                            onClick={() => toggleComments(conf.id)}
                            className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors text-xs font-bold"
                        >
                            <MessageCircle className="w-4 h-4" /> {conf.comments?.length || 0}
                            {expandedComments[conf.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {expandedComments[conf.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-800/30 animate-fade-in">
                        {/* List */}
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {conf.comments && conf.comments.length > 0 ? (
                                conf.comments.map(comment => (
                                    <div key={comment.id} className="bg-gray-800/30 p-3 rounded-xl">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs font-bold text-gray-400">{comment.userId}</span>
                                            <span className="text-[10px] text-gray-600">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{comment.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-600 text-center py-2">No comments yet. Be the first!</p>
                            )}
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:border-neon outline-none"
                                placeholder="Add a comment..."
                                value={commentInputs[conf.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [conf.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(conf.id)}
                            />
                            <button 
                                onClick={() => handleCommentSubmit(conf.id)}
                                disabled={!commentInputs[conf.id]?.trim()}
                                className="p-2 bg-neon/10 text-neon rounded-full hover:bg-neon hover:text-white transition-colors disabled:opacity-30"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            ))
        )}
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className="p-4 bg-black border-t border-gray-900 pb-safe shrink-0 z-20">
        <div className="bg-gray-900 rounded-2xl p-2 border border-gray-800 focus-within:border-neon transition-colors">
            {newImage && (
                <div className="relative w-20 h-20 mb-2 ml-2">
                    <img src={newImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button 
                        onClick={() => setNewImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg"
                    >
                        <X className="w-3 h-3 text-white" />
                    </button>
                </div>
            )}
            <div className="flex gap-2 items-end">
                <textarea 
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    placeholder="Type your confession anonymously..."
                    className="flex-1 bg-transparent text-white px-4 py-3 outline-none resize-none h-14 text-sm"
                />
                <div className="flex items-center gap-2 pb-2 pr-2">
                    <button 
                        onClick={handleImageClick}
                        className={`p-2 rounded-full transition-colors hover:bg-gray-800`}
                        title={currentUser?.isPremium ? "Add Image" : "Premium Feature"}
                    >
                        <ImageIcon className={`w-5 h-5 ${currentUser?.isPremium ? 'text-gray-400 hover:text-white' : 'text-yellow-500/70'}`} />
                    </button>
                    <input 
                        id="confession-image-input" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                    />
                    <button 
                        onClick={handlePost}
                        disabled={!newText.trim() && !newImage || isPosting}
                        className="p-2 bg-neon rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-sm"
                    >
                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Premium Modal */}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border border-yellow-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/50">
                    <Crown className="w-8 h-8 text-yellow-500" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2">Unlock Premium</h3>
                <p className="text-gray-400 text-sm mb-8">
                    Post image confessions, see who liked your profile, and get unlimited swipes.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={buyPremium}
                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl font-bold text-black hover:scale-105 transition-transform shadow-lg uppercase tracking-wide"
                    >
                        Get Premium - ₹9/week
                    </button>
                    <button 
                        onClick={() => setIsPremiumModalOpen(false)}
                        className="w-full py-3 text-gray-500 hover:text-white text-sm font-medium"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
