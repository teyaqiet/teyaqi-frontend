"use client";

import React, { useState } from 'react';
import { useFriends } from '@/context/FriendContext';
import { X, Loader2, AlertTriangle, Clock, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialView() {
  const { 
    friends = [], 
    incomingRequests = [], 
    outgoingRequests = [], 
    acceptRequest, 
    deleteRequest, 
    unfriend,
    processingId,
    loading 
  } = useFriends();

  const [confirmTarget, setConfirmTarget] = useState<{id: number, username: string} | null>(null);
  const [visibleFriendsCount, setVisibleFriendsCount] = useState(10);

  const handleUnfriend = async () => {
    if (confirmTarget) {
      await unfriend(confirmTarget.id);
      setConfirmTarget(null);
    }
  };

  const handleLoadMore = () => {
    setVisibleFriendsCount(prev => prev + 10);
  };

  if (loading && friends.length === 0 && incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3cd093] animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading Grid Matrix...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-2 pb-24">
      
      {/* 1. OUTBOUND SECTION (Request Sent) */}
      <AnimatePresence>
        {outgoingRequests.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-white tracking-wide">Request Sent</h3>
            <div className="flex flex-col gap-2">
              {outgoingRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between bg-[#141b34] p-4 rounded-2xl border border-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#3da4ff] rounded-xl flex items-center justify-center text-white font-bold relative overflow-hidden shrink-0">
                      {req.avatar || req.user?.avatar ? (
                        <img 
                          src={req.avatar || req.user?.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover absolute inset-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : null}
                      <span className="text-sm font-black">
                        {(req.username || req.user?.username || "WA").substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-white leading-tight">{req.username || req.user?.username}</p>
                      <p className="text-xs text-slate-400">@{req.username || req.user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#3da4ff]/10 text-[#3da4ff] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </div>
                    <button 
                      onClick={() => deleteRequest(req.friendship_id)}
                      disabled={processingId === req.friendship_id}
                      className="w-8 h-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-all"
                    >
                      {processingId === req.friendship_id ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* 2. INBOUND SECTION (Request Receive) */}
      <AnimatePresence>
        {incomingRequests.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-white tracking-wide">Request Receive</h3>
            <div className="flex flex-col gap-2">
              {incomingRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between bg-[#141b34] p-4 rounded-2xl border border-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#3da4ff] rounded-xl flex items-center justify-center text-white font-bold relative overflow-hidden shrink-0">
                      {req.avatar || req.user?.avatar ? (
                        <img 
                          src={req.avatar || req.user?.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover absolute inset-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : null}
                      <span className="text-sm font-black">
                        {(req.username || req.user?.username || "WA").substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-white leading-tight">{req.username || req.user?.username}</p>
                      <p className="text-xs text-slate-400">@{req.username || req.user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => acceptRequest(req.id)}
                      disabled={processingId === req.id}
                      className="bg-[#3cd093] text-[#090d22] px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-1 hover:opacity-90 transition-all"
                    >
                      {processingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} strokeWidth={3} /> Accept</>}
                    </button>
                    <button 
                      onClick={() => deleteRequest(req.friendship_id)}
                      disabled={processingId === req.friendship_id}
                      className="w-8 h-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-all"
                    >
                      {processingId === req.friendship_id ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* 3. FRIENDS LIST NODES VIEW */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-white tracking-wide">Friends</h3>
        
        {friends.length === 0 ? (
          <div className="text-center py-12 bg-[#141b34] rounded-3xl border border-dashed border-white/5">
            <p className="text-slate-400 text-xs font-medium">No friends added yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {friends.slice(0, visibleFriendsCount).map((friend: any) => {
                const targetUser = friend.user ? friend.user : friend;
                const userAvatar = targetUser.avatar || targetUser.avatar_url || friend.avatar;
                const displayName = targetUser.username || targetUser.name || "Warrior";

                return (
                  <div key={friend.id} className="bg-[#141b34] p-4 rounded-2xl flex flex-col justify-between border border-transparent hover:border-white/5 transition-all">
                    
                    <div className="flex flex-col items-start gap-2.5">
                      <div className="w-12 h-12 bg-[#3da4ff] rounded-xl flex items-center justify-center text-white font-bold relative overflow-hidden shadow-sm shrink-0">
                        {userAvatar ? (
                          <img 
                            src={userAvatar} 
                            alt={`${displayName}'s avatar`} 
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => { 
                              (e.target as HTMLElement).style.display = 'none'; 
                            }}
                          />
                        ) : null}
                        <span className="text-sm font-black select-none">
                          {displayName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="truncate w-full">
                        <p className="text-base font-black text-white truncate leading-none mb-1">{displayName}</p>
                        <p className="text-xs text-slate-400 truncate">@{displayName}</p>
                      </div>
                    </div>

                    {/* Button trigger for unfriend confirm flow matching mockup style */}
                    <div className="mt-4">
                      <button 
                        onClick={() => setConfirmTarget({ id: friend.id, username: displayName })}
                        className="bg-[#3cd093] text-[#090d22] text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wide transition-all active:scale-95 hover:opacity-90"
                      >
                        Unfriend
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {friends.length > visibleFriendsCount && (
              <button
                onClick={handleLoadMore}
                className="w-full mt-4 py-4 flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-white/70 hover:text-white rounded-2xl border border-white/5 font-bold text-sm tracking-wide transition-all active:scale-[0.99]"
              >
                <RefreshCw size={16} className="text-[#3cd093]" />
                Load More
              </button>
            )}
          </>
        )}
      </section>

      {/* MODAL VIEW CONFIRMATION WINDOW */}
      <AnimatePresence>
        {confirmTarget && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmTarget(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#141b34] border border-white/10 p-6 rounded-[2rem] z-[101] shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Remove Friend?</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Are you sure you want to unfriend <span className="text-[#3cd093] font-bold">@{confirmTarget.username}</span>?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  <button 
                    onClick={() => setConfirmTarget(null)}
                    className="py-3 px-4 rounded-xl bg-white/5 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUnfriend}
                    disabled={processingId === confirmTarget.id}
                    className="py-3 px-4 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    {processingId === confirmTarget.id ? <Loader2 size={16} className="animate-spin" /> : "Unfriend"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}