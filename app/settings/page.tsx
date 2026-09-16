"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ChevronLeft, User, Image as ImageIcon, LayoutGrid, Globe, 
  Volume2, VolumeX, Bell, MessageSquare, Shield, 
  Info, ChevronRight, Check, Star, Loader2, LogOut,
  HelpCircle, History, Atom, Trophy
} from "lucide-react";
import { fetcher } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Locale } from "@/lib/i18n";

// --- PERSISTENCE HOOK ---
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch (e) { console.error(e); }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) { console.error(e); }
  };
  return [storedValue, setValue] as const;
}

type SettingsView = "main" | "profile" | "avatar" | "categories" | "language" | "feedback" | "privacy" | "about";

interface AvatarOption {
  id: string;
  asset: string;
  gender: 'male' | 'female';
}

interface Category {
  id: number;
  name: string;
}

const getCategoryStyles = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('general')) return { bg: 'bg-blue-600', icon: <HelpCircle className="w-5 h-5 text-white" /> };
  if (normalized.includes('history')) return { bg: 'bg-amber-500', icon: <History className="w-5 h-5 text-white" /> };
  if (normalized.includes('science')) return { bg: 'bg-emerald-400', icon: <Atom className="w-5 h-5 text-white" /> };
  if (normalized.includes('geography')) return { bg: 'bg-rose-500', icon: <Globe className="w-5 h-5 text-white" /> };
  return { bg: 'bg-purple-600', icon: <Trophy className="w-5 h-5 text-white" /> };
};

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLang, mounted } = useLanguage();
  
  // --- SUB-VIEW DIRECTION MANAGEMENT ---
  const [activeView, setActiveView] = useState<SettingsView>("main");
  const [isSaving, setIsSaving] = useState(false);
  
  // --- USER DATA STATES ---
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState(""); // ✨ Added state for real display name
  const [selectedAvatar, setSelectedAvatar] = useState<string>("/images/avatars/m1.webp");
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // --- LOCAL PERSISTED CONFIGS ---
  const [soundEnabled, setSoundEnabled] = useLocalStorage("sound_enabled", true);
  const [notifications, setNotifications] = useLocalStorage("notifs_enabled", true);
  const [vibrationEnabled, setVibrationEnabled] = useLocalStorage("vibe_enabled", false);

  // --- FEEDBACK INTERACTION STATES ---
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("Report a Bug");
  const [feedbackText, setFeedbackText] = useState("");

  const maleCharacters: AvatarOption[] = [
    { id: 'm1', asset: '/images/avatars/m1.webp', gender: 'male' },
    { id: 'm2', asset: '/images/avatars/m2.webp', gender: 'male' },
    { id: 'm3', asset: '/images/avatars/m3.webp', gender: 'male' },
    { id: 'm4', asset: '/images/avatars/m4.webp', gender: 'male' },
    { id: 'm5', asset: '/images/avatars/m5.webp', gender: 'male' },
  ];

  const femaleCharacters: AvatarOption[] = [
    { id: 'f1', asset: '/images/avatars/f1.webp', gender: 'female' },
    { id: 'f2', asset: '/images/avatars/f2.webp', gender: 'female' },
    { id: 'f3', asset: '/images/avatars/f3.webp', gender: 'female' },
    { id: 'f4', asset: '/images/avatars/f4.webp', gender: 'female' },
    { id: 'f5', asset: '/images/avatars/f5.webp', gender: 'female' },
  ];

  // Lifecycle Data Mount
  useEffect(() => {
    const getInitialData = async () => {
      try {
        const userRes = await fetcher("/api/user");
        if (userRes?.data?.username) setUserName(userRes.data.username);
        if (userRes?.data?.name) setDisplayName(userRes.data.name); // ✨ Read display name from backend
        if (userRes?.data?.avatar) setSelectedAvatar(userRes.data.avatar);
        
        if (userRes?.data?.selectedCategories) {
          setSelectedCategories(userRes.data.selectedCategories.map((c: any) => c.id || c));
        } else if (userRes?.data?.categories) {
          setSelectedCategories(userRes.data.categories.map((c: any) => c.id || c));
        }

        const catRes = await fetcher("/api/categories/list");
        if (catRes?.status === 'success' && Array.isArray(catRes.data)) {
          setCategoriesList(catRes.data);
        } else if (catRes?.data && Array.isArray(catRes.data)) {
          setCategoriesList(catRes.data);
        } else {
          throw new Error("Fallback required");
        }
      } catch (e) { 
        console.error("Initial backend load missing database lists, using defaults", e); 
        setCategoriesList([
          { id: 1, name: 'General Knowledge' },
          { id: 2, name: 'History' },
          { id: 3, name: 'Science' },
          { id: 4, name: 'Geography' },
          { id: 5, name: 'Sports' }
        ]);
      }
    };
    getInitialData();
  }, []);

  // Update Username and Display Name
  const handleUpdateName = async () => {
    if (!userName.trim() || !displayName.trim()) return;
    setIsSaving(true);
    try {
      await fetcher("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ 
          username: userName,
          name: displayName, // ✨ Send display name down the pipeline
          avatar: selectedAvatar,
          category_ids: selectedCategories
        })
      });
      setActiveView("main");
    } catch (e) { 
      console.error("Save failed", e); 
    } finally { 
      setIsSaving(false); 
    }
  };

  // Update Avatar Profile Target
  const handleUpdateAvatar = async () => {
    setIsSaving(true);
    try {
      await fetcher("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ 
          username: userName,
          name: displayName,
          avatar: selectedAvatar,
          category_ids: selectedCategories
        })
      });
      setActiveView("main");
    } catch (e) {
      console.error("Failed to update avatar selection", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (id: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cId) => cId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Save Category Array Update Trigger
  const handleUpdateCategories = async () => {
    if (selectedCategories.length < 4) return;
    setIsSaving(true);
    try {
      await fetcher("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ 
          username: userName,
          name: displayName,
          avatar: selectedAvatar,
          category_ids: selectedCategories 
        })
      });
      setActiveView("main");
    } catch (e) {
      console.error("Failed to sync category options", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (activeView === "main") {
      router.back();
    } else {
      setActiveView("main");
    }
  };

  const renderAvatarGroup = (title: string, characters: AvatarOption[]) => (
    <div className="w-full mb-4 overflow-hidden">
      <div className="flex items-center gap-3 mb-3 px-1">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {characters.map((char) => {
          const isSelected = selectedAvatar === char.asset;
          return (
            <button
              type="button"
              key={char.id}
              onClick={() => setSelectedAvatar(char.asset)}
              className={`w-[110px] h-[110px] shrink-0 rounded-2xl transition-all duration-150 overflow-hidden border-4 snap-start relative ${
                isSelected 
                  ? 'border-emerald-500 scale-[1.02] shadow-lg shadow-emerald-500/20' 
                  : 'border-transparent bg-[#141b34] active:scale-[0.98]'
              }`}
            >
              <Image 
                src={char.asset} 
                alt={`${title} Avatar`} 
                width={110} 
                height={110} 
                className="w-full h-full object-cover pointer-events-none" 
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!mounted) return (
    <div className="min-h-screen bg-[#090d22] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#1cd05d] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090d22] text-white pb-28 select-none font-sans relative overflow-x-hidden">
      
      {/* HEADER MOUNT ELEMENT */}
      <header className="sticky top-0 bg-[#090d22]/90 backdrop-blur-md z-40 px-5 pt-6 pb-4 flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="w-10 h-10 bg-[#1cd05d] text-white rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-[0_3px_0_#15a34a]"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <h1 className="text-2xl font-black tracking-wide capitalize">
          {activeView === "main" ? t.settings : activeView === "profile" ? "Edit Profile" : activeView}
        </h1>
      </header>

      {/* ======================= MAIN DASHBOARD VIEW ======================= */}
      {activeView === "main" && (
        <main className="px-5 flex flex-col gap-6 mt-2">
          
          {/* PROFILE SEGMENT */}
          <section className="flex flex-col gap-2.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{t.profile_section}</h3>
            <div className="flex flex-col gap-2">
              <NavigationRow icon={<User size={20} className="text-[#3da4ff]" />} title="Profile Info" subtitle={displayName || userName || t.loading} onClick={() => setActiveView("profile")} />
              <NavigationRow icon={<ImageIcon size={20} className="text-[#3da4ff]" />} title="Avatar" subtitle="Change your profile avatar" onClick={() => setActiveView("avatar")} />
              <NavigationRow icon={<LayoutGrid size={20} className="text-[#3da4ff]" />} title="Categories" subtitle="Modify challenge tracks" onClick={() => setActiveView("categories")} />
              <NavigationRow icon={<Globe size={20} className="text-[#3da4ff]" />} title={t.language} subtitle={lang === "en" ? "English" : "አማርኛ"} onClick={() => setActiveView("language")} />
            </div>
          </section>

          {/* CONFIGURATION SEGMENT */}
          <section className="flex flex-col gap-2.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{t.appConfig}</h3>
            <div className="flex flex-col gap-2">
              <ToggleRow 
                icon={soundEnabled ? <Volume2 size={20} className="text-[#3cd093]" /> : <VolumeX size={20} className="text-[#3cd093]" />} 
                title={t.sounds} 
                enabled={soundEnabled} 
                onToggle={() => setSoundEnabled(!soundEnabled)} 
              />
              <ToggleRow icon={<VolumeX size={20} className="text-[#3cd093]" />} title="Vibration" enabled={vibrationEnabled} onToggle={() => setVibrationEnabled(!vibrationEnabled)} />
              <ToggleRow icon={<Bell size={20} className="text-[#3cd093]" />} title={t.reminders} enabled={notifications} onToggle={() => setNotifications(!notifications)} />
            </div>
          </section>

          {/* OTHER SEGMENT */}
          <section className="flex flex-col gap-2.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Other</h3>
            <div className="flex flex-col gap-2">
              <NavigationRow icon={<MessageSquare size={20} className="text-[#a78bfa]" />} title="Feedback" onClick={() => setActiveView("feedback")} />
              <NavigationRow icon={<Shield size={20} className="text-[#a78bfa]" />} title={t.privacy} onClick={() => setActiveView("privacy")} />
              <NavigationRow icon={<Info size={20} className="text-[#a78bfa]" />} title={t.about} onClick={() => setActiveView("about")} />
            </div>
          </section>

          {/* EXIT ACTION */}
          <div className="mt-4">
            <button 
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              className="w-full py-4 bg-transparent border-2 border-red-500/30 text-red-500 hover:bg-red-500/5 rounded-2xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <LogOut size={16} /> {t.exit}
            </button>
          </div>
        </main>
      )}

      {/* ======================= PROFILE DETAILS VIEW ======================= */}
      {activeView === "profile" && (
        <main className="px-5 flex flex-col gap-5 mt-4">
          {/* Input 1: Full Display Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white pl-1">Full Name</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#141b34] border border-white/5 rounded-2xl p-4 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#1cd05d] transition-all"
            />
          </div>

          {/* Input 2: Unique Username Handler */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white pl-1">Username</label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter unique username"
              className="w-full bg-[#141b34] border border-white/5 rounded-2xl p-4 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#1cd05d] transition-all"
            />
          </div>

          <button 
            disabled={isSaving}
            onClick={handleUpdateName} 
            className="w-full mt-2 py-4 bg-[#1cd05d] hover:opacity-90 text-white rounded-full font-black text-lg transition-transform active:scale-95 shadow-[0_4px_0_#15a34a] flex items-center justify-center"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : t.save}
          </button>
        </main>
      )}

      {/* ======================= AVATAR PICKER VIEW ======================= */}
      {activeView === "avatar" && (
        <main className="px-5 flex flex-col gap-6 mt-2">
          <div className="text-center py-2">
            <div className="w-20 h-20 bg-[#141b34] rounded-full mx-auto overflow-hidden border-2 border-emerald-500 mb-2 relative">
              {selectedAvatar && (
                <Image src={selectedAvatar} alt="Current Preview" fill className="object-cover" />
              )}
            </div>
            <h2 className="text-base font-bold text-white">Choose Your Character</h2>
          </div>

          <div className="flex flex-col gap-4">
            {renderAvatarGroup('Male', maleCharacters)}
            {renderAvatarGroup('Female', femaleCharacters)}
          </div>

          <button 
            disabled={isSaving || !selectedAvatar}
            onClick={handleUpdateAvatar} 
            className="w-full py-4 bg-[#1cd05d] text-white rounded-full font-black text-lg shadow-[0_4px_0_#15a34a] flex items-center justify-center disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : t.save}
          </button>
        </main>
      )}

      {/* ======================= CATEGORIES VIEW ======================= */}
      {activeView === "categories" && (
        <main className="px-5 flex flex-col gap-5 mt-2">
          <div className="text-left pl-1">
            <p className="text-xs text-slate-400 font-medium tracking-wide">Choose at least 4 topics</p>
          </div>
          
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              const ui = getCategoryStyles(cat.name);

              return (
                <button 
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`w-full bg-white rounded-2xl flex items-center overflow-hidden border-2 transition-all text-left relative h-16 ${
                    isSelected ? "border-emerald-500" : "border-transparent opacity-95"
                  }`}
                >
                  <div className={`w-16 h-full flex items-center justify-center shrink-0 ${ui.bg}`}>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      {ui.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 px-5 flex justify-between items-center">
                    <span className="text-slate-900 font-bold text-base">{cat.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button 
            disabled={isSaving || selectedCategories.length < 4}
            onClick={handleUpdateCategories} 
            className="w-full py-4 bg-[#1cd05d] text-white rounded-full font-black text-lg shadow-[0_4px_0_#15a34a] flex items-center justify-center disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : t.save}
          </button>
        </main>
      )}

      {/* ======================= LANGUAGE VIEWS ======================= */}
      {activeView === "language" && (
        <main className="px-5 flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-3">
            {[
              { label: "English", id: "en" },
              { label: "አማርኛ", id: "am" }
            ].map((l) => (
              <button 
                key={l.id} 
                onClick={() => { setLang(l.id as Locale); setTimeout(() => setActiveView("main"), 200); }} 
                className={`w-full p-5 rounded-2xl flex items-center justify-between border text-left transition-all ${
                  lang === l.id ? 'bg-[#141b34] border-[#1cd05d]' : 'bg-[#141b34] border-transparent'
                }`}
              >
                <span className="text-base font-bold text-white">{l.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lang === l.id ? "border-[#1cd05d]" : "border-slate-500"}`}>
                  {lang === l.id && <div className="w-2.5 h-2.5 bg-[#1cd05d] rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </main>
      )}

      {/* ======================= FEEDBACK SYSTEM ======================= */}
      {activeView === "feedback" && (
        <main className="px-5 flex flex-col gap-5 mt-2">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Help Us Make Teyaqi Better.</h2>
            <p className="text-xs text-slate-400 leading-relaxed">Found a bug or have an idea? We'd love to hear from you.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white">How has your experience been?</label>
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star size={28} className={star <= rating ? "text-[#1cd05d] fill-[#1cd05d]" : "text-slate-600"} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white">Feedback Types</label>
            <select 
              value={feedbackType} 
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-[#1c233d] border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none appearance-none"
            >
              <option>Report a Bug</option>
              <option>Content Suggestion</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white">Briefly describe your feedback</label>
            <textarea 
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your comment..."
              rows={4}
              className="w-full bg-[#1c233d] border border-white/5 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none resize-none"
            />
          </div>
          <button onClick={() => setActiveView("main")} className="w-full py-4 bg-[#1cd05d] text-white rounded-full font-black text-lg shadow-[0_4px_0_#15a34a]">
            Send Feedback
          </button>
        </main>
      )}

      {/* ======================= PRIVACY POLICY POLICY ======================= */}
      {activeView === "privacy" && (
        <main className="px-5 flex flex-col gap-4 mt-2">
          <p className="text-sm text-slate-400 leading-relaxed">{t.dataProtection}</p>
        </main>
      )}

      {/* ======================= ABOUT COMPONENT ======================= */}
      {activeView === "about" && (
        <main className="px-5 flex flex-col gap-6 mt-4 items-center text-center">
          <div className="w-20 h-20 bg-[#1cd05d] rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl">
            T
          </div>
          <h3 className="text-xl font-black text-white">Teyaqi v1.0.4</h3>
          <p className="text-slate-500 text-xs uppercase tracking-widest">{t.builtFor}</p>
        </main>
      )}

    </div>
  );
}

interface NavigationRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}

function NavigationRow({ icon, title, subtitle, onClick }: NavigationRowProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-[#141b34] p-4 rounded-2xl flex items-center justify-between border border-transparent active:bg-[#18213f] transition-all text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#090d22]/40 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-base font-bold text-white leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="w-8 h-8 bg-[#090d22]/30 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
        <ChevronRight size={16} strokeWidth={2.5} />
      </div>
    </button>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, title, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="w-full bg-[#141b34] p-4 rounded-2xl flex items-center justify-between border border-transparent transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#090d22]/40 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-base font-bold text-white">{title}</p>
      </div>
      
      <button 
        onClick={onToggle}
        className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 relative flex items-center ${enabled ? "bg-[#1cd05d]" : "bg-slate-700"}`}
      >
        <motion.div 
          animate={{ x: enabled ? 24 : 0 }} 
          className="w-6 h-6 bg-white rounded-full shadow-md" 
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}