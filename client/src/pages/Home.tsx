
import React, { useState, useEffect } from 'react';
import { MatchProfile } from '../types';
import { Badge, NeonButton } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/data';
import { Search, RotateCcw, X, Heart, CheckCircle2, GraduationCap, MessageSquarePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matchQueue, setMatchQueue] = useState<MatchProfile[]>([]);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (currentUser) {
      setMatchQueue(dataService.getMatchQueue(currentUser));
    }
  }, [currentUser]);

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right' && currentUser) {
        const matchedUser = matchQueue[currentSwipeIndex];
        dataService.addMatch(matchedUser, currentUser.id);
      }
      
      setSwipeDirection(null);
      
      // Infinite Loop Logic: If next index is out of bounds, reset to 0
      setCurrentSwipeIndex(prev => {
        const next = prev + 1;
        if (next >= matchQueue.length) {
          return 0; // Loop back to start
        }
        return next;
      });
    }, 300);
  };

  // Special Feature for Amity University, Raipur
  const showConfessionButton = currentUser?.university === 'Amity University, Raipur';

  if (!matchQueue.length) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in pb-24 md:pb-8 relative">
          {showConfessionButton && (
             <button 
               onClick={() => navigate('/confessions')}
               className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 bg-gray-900 border border-neon/50 text-neon px-4 py-2 rounded-full font-bold text-xs hover:bg-neon hover:text-white transition-all shadow-neon-sm animate-pulse"
             >
               <MessageSquarePlus className="w-4 h-4" /> Amity Confessions
             </button>
          )}
          <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 shadow-neon-sm">
             <Search className="w-12 h-12 text-neon" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white">No Matches Found</h2>
          <p className="text-gray-500 mb-8 max-w-md">There are no profiles matching your criteria right now.</p>
        </div>
    );
  }

  // Use modulo to safely access profile for rendering if needed, though logic above handles index reset
  const profile = matchQueue[currentSwipeIndex % matchQueue.length];

  return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden pb-28 md:pb-4">
         <div className="absolute inset-0 hidden md:block pointer-events-none opacity-20">
            <div className="absolute top-20 left-20 w-64 h-64 bg-neon rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-600 rounded-full blur-[120px]" />
         </div>

         {/* Confession Button - Just above cards as requested */}
         {showConfessionButton && (
            <div className="w-full max-w-sm md:w-[400px] mb-4 z-30">
                <button 
                onClick={() => navigate('/confessions')}
                className="w-full flex items-center justify-center gap-2 bg-gray-900/80 backdrop-blur border border-neon/30 text-white px-4 py-3 rounded-xl font-bold text-sm hover:border-neon hover:shadow-neon-sm transition-all group"
                >
                <MessageSquarePlus className="w-5 h-5 text-neon group-hover:scale-110 transition-transform" /> 
                <span className="group-hover:text-neon transition-colors">Go to Confession Page</span>
                </button>
            </div>
         )}

         <div className="relative w-full max-w-sm md:w-[400px] h-[55vh] md:h-[65vh] min-h-[400px] flex-shrink-0 mt-0">
            {/* Card Stack Visuals */}
            <div className="absolute inset-0 bg-gray-800 rounded-3xl transform scale-95 translate-y-4 opacity-50 border border-gray-700" />
            <div className="absolute inset-0 bg-gray-800 rounded-3xl transform scale-90 translate-y-8 opacity-30 border border-gray-700" />

            <div 
              className={`absolute inset-0 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden transition-all duration-500 ease-out ${
                swipeDirection === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : 
                swipeDirection === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : 
                'hover:scale-[1.02]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black z-10" />
              
              <div className="absolute inset-0 bg-[#080808] flex flex-col items-center justify-center overflow-hidden">
                 {profile.avatar ? (
                   <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover opacity-80" />
                 ) : (
                   <>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <span className="text-[10rem] font-black text-gray-800 select-none opacity-30 rotate-12 flex items-center justify-center w-full h-full">
                      {profile.anonymousId.slice(-2)}
                    </span>
                   </>
                 )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8 bg-gradient-to-t from-black via-black/90 to-transparent pt-20">
                 <div className="flex items-center justify-between mb-2">
                   <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">{profile.anonymousId}</h2>
                   <div className="flex flex-col items-end">
                     <span className="text-xl md:text-2xl font-bold text-neon">{profile.matchPercentage}%</span>
                     <span className="text-[10px] text-gray-500 uppercase tracking-wider">Match</span>
                   </div>
                 </div>

                 <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                    <GraduationCap className="w-3 h-3 text-neon" />
                    <span className="truncate max-w-[80%]">{profile.university}</span>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{profile.branch}</Badge>
                    <Badge>{profile.year}</Badge>
                    {profile.isVerified && (
                      <span className="px-2 py-1 bg-green-900/30 border border-green-800 rounded-full text-xs text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                 </div>

                 <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                   {profile.interests.slice(0, 4).map(i => (
                     <span key={i} className="text-neon text-xs md:text-sm font-bold bg-neon/10 px-2 py-1 rounded">#{i}</span>
                   ))}
                 </div>

                 <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-4 italic border-l-2 border-neon pl-3 line-clamp-3">"{profile.bio}"</p>
                 
                 <p className="text-gray-500 text-xs flex items-center gap-2 mt-2">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> 
                   Active recently • {profile.distance} away
                 </p>
              </div>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-8 mt-6 md:mt-8 z-30">
            <button 
              onClick={() => handleSwipe('left')}
              className="group relative p-5 md:p-6 rounded-full bg-gray-900/80 backdrop-blur border border-gray-700 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110 shadow-lg active:scale-95"
              aria-label="Pass"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button 
              onClick={() => handleSwipe('right')}
              className="group relative p-5 md:p-6 rounded-full bg-gray-900/80 backdrop-blur border border-neon text-neon hover:bg-neon hover:text-white hover:shadow-[0_0_30px_#ff007f] transition-all hover:scale-110 shadow-lg active:scale-95"
              aria-label="Like"
            >
              <Heart className="w-8 h-8 fill-current" />
            </button>
         </div>
      </div>
  );
};
