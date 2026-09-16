"use client";
import { useState, useEffect } from "react";
import SocialView from "@/components/social/SocialView";
import { ArrowLeft, Loader2, Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFriends } from "@/context/FriendContext";
import { fetcher } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function SocialPage() {
  const router = useRouter();
  const { sendRequest, friends, outgoingRequests, processingId, refresh, loading, setLoading } = useFriends();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Local tracker for manual refreshes
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Trigger initial data synchronization on mount safely
  useEffect(() => {
    if (typeof setLoading === "function") {
      setLoading(true);
    }
    refresh();
  }, [refresh, setLoading]);

  // Handle explicit manual tracking refresh actions
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Debounced search logic for querying application users
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetcher(`/api/friends/search?username=${searchTerm}`);
          setSearchResults(response?.data || []); 
        } catch (err) {
          console.error("Search Error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSendRequest = async (userId: number) => {
    const success = await sendRequest(userId);
    if (success) {
      setStatus({ type: 'success', msg: 'REQUEST SENT SUCCESSFULLY' });
      setSearchTerm("");
      setSearchResults([]);
      setTimeout(() => setStatus(null), 2000);
    } else {
      setStatus({ type: 'error', msg: 'CONNECTION FAILED' });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // Combine state configurations to check if the loader should actively cover the feeds window
  const isListLoading = loading || isRefreshing;

  return (
    <div className="min-h-screen w-full bg-[#090d22] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Top Header Row matching mockup */}
      <div className="max-w-md w-full mx-auto px-5 pt-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="w-12 h-12 bg-[#3cd093] rounded-xl flex items-center justify-center text-[#090d22] transition-all active:scale-95 hover:opacity-90"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <h1 className="text-3xl font-black tracking-tight">Social hub</h1>
        </div>
        
        <button 
          onClick={handleManualRefresh} 
          disabled={isListLoading}
          className="p-2 text-[#3cd093] hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-6 h-6 ${isListLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Global Status Notification Banner */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`max-w-md mx-auto w-[calc(100%-2.5rem)] mt-3 mx-5 p-3 rounded-xl text-center text-xs font-bold tracking-wide ${
              status.type === 'success' ? 'bg-[#3cd093]/20 text-[#3cd093]' : 'bg-red-500/20 text-red-500'
            }`}
          >
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Box Area */}
      <div className="max-w-md w-full mx-auto px-5 pt-6 pb-2 z-30 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-[#3cd093] animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by username..." 
            className="w-full bg-[#1b2341] border border-transparent focus:border-[#3cd093]/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none transition-all placeholder:text-slate-400 text-white"
          />
        </div>

        {/* Search Inline Dropdown Interface */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-5 right-5 mt-2 space-y-2 bg-[#141b34] border border-white/5 p-2 rounded-2xl shadow-2xl z-50 max-h-[40vh] overflow-y-auto no-scrollbar"
            >
              {searchResults.map((user) => {
                // Check if they are already your friend, or if you have already sent an outgoing request
                const isAlreadyFriend = friends.some(f => f.id === user.id);
                const isAlreadyRequested = outgoingRequests.some(r => r.friend_id === user.id || r.id === user.id);
                const isProcessing = processingId === user.id;

                // Disable if friend, already requested, or if the loader is running
                const shouldDisableButton = isAlreadyFriend || isAlreadyRequested || isProcessing;

                return (
                  <div key={user.id} className="flex items-center justify-between bg-[#1b2341] p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#3da4ff] rounded-xl flex items-center justify-center text-white font-bold relative overflow-hidden shrink-0">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="text-sm font-black tracking-tight">
                          {(user.username || "WA").substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.username}</p>
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => !shouldDisableButton && handleSendRequest(user.id)}
                      disabled={shouldDisableButton}
                      className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wide transition-all ${
                        shouldDisableButton 
                          ? 'bg-white/10 text-slate-400 cursor-default' 
                          : 'bg-[#3cd093] text-[#090d22] hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-spin mx-auto" />
                      ) : isAlreadyFriend ? (
                        "Friends"
                      ) : isAlreadyRequested ? (
                        "Pending"
                      ) : (
                        "Add Friend"
                      )}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container List Feed */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar">
        {isListLoading ? (
          <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400 gap-3 text-sm font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#3cd093]" />
            <span>Syncing hub lists...</span>
          </div>
        ) : (
          <SocialView />
        )}
      </div>
    </div>
  );
}