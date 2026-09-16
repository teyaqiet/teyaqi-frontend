"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { fetcher } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoriesResponse {
  status: string;
  data: Category[];
}

interface OnboardingGridProps {
  onSave: (categoryIds: number[]) => Promise<boolean>;
}

export default function OnboardingGrid({
  onSave,
}: OnboardingGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {
  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetcher<{
        status: string;
        data: Category[];
      }>("/api/categories/list");

      if (
        response?.status === "success" &&
        Array.isArray(response.data)
      ) {
        setCategories(response.data);
      } else {
        throw new Error("Invalid categories response.");
      }
    } catch (err) {
      console.error("Failed loading categories:", err);

      setCategories([]);

      setError(
        "Could not load available topics. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  loadCategories();
}, []);

  // ============================================================
  // SELECT / DESELECT
  // ============================================================

  const handleToggle = (id: number) => {
    if (submitting) return;

    // Already selected → remove
    if (selectedIds.includes(id)) {
      setSelectedIds((current) =>
        current.filter((item) => item !== id)
      );
      return;
    }

    // Maximum of 5 selections
    if (selectedIds.length >= 5) {
      return;
    }

    setSelectedIds((current) => [...current, id]);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (selectedIds.length < 5 || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const success = await onSave(selectedIds);

      if (!success) {
        throw new Error("Failed to save onboarding choices.");
      }

      // onSave succeeded.
      // Parent component is responsible for moving to the map.
    } catch (err) {
      console.error("Onboarding submission failed:", err);

      setError(
        "Failed to lock in choices. Please check your connection and try again."
      );

      setSubmitting(false);
    }
  };

  const isButtonDisabled =
    selectedIds.length < 5 || submitting;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-slate-200">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />

        <p className="text-xs text-slate-400 uppercase tracking-wider">
          Loading available topics...
        </p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-24 text-white">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-3 text-blue-400">
          <Sparkles className="w-6 h-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2">
          Choose Your Pillars
        </h1>

        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Select at least{" "}
          <span className="text-blue-400 font-bold">
            5 fields
          </span>{" "}
          to populate your daily question deck.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />

          <p>{error}</p>
        </div>
      )}

      {/* No Categories */}
      {!error && categories.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-500">
          No topics are currently available.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {categories.map((category) => {
          const isSelected =
            selectedIds.includes(category.id);

          const isDisabled =
            !isSelected &&
            selectedIds.length >= 5;

          return (
            <button
              key={category.id}
              type="button"
              disabled={isDisabled || submitting}
              onClick={() =>
                handleToggle(category.id)
              }
              className={`
                relative overflow-hidden
                text-left p-4 rounded-xl border
                transition-all duration-300
                bg-slate-900/40
                backdrop-blur-md
                group
                ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              style={{
                borderColor: isSelected
                  ? "rgba(59,130,246,0.5)"
                  : "rgba(255,255,255,0.05)",

                boxShadow: isSelected
                  ? "0 0 20px rgba(59,130,246,0.15)"
                  : "none",
              }}
            >
              {/* Selected Background */}
              <div
                className={`
                  absolute inset-0
                  bg-gradient-to-br
                  from-blue-500/10
                  to-transparent
                  transition-opacity duration-300
                  ${
                    isSelected
                      ? "opacity-100"
                      : "opacity-0"
                  }
                `}
              />

              <div className="relative z-10 flex flex-col justify-between h-16">

                {/* Icon + Check */}
                <div className="flex items-center justify-between">

                  <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-200">
                    {category.icon || "💡"}
                  </span>

                  <div
                    className={`
                      w-5 h-5 rounded-full border
                      flex items-center justify-center
                      transition-all duration-300
                      ${
                        isSelected
                          ? "bg-blue-500 border-blue-400 scale-110"
                          : "border-white/10 bg-black/20"
                      }
                    `}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{
                            scale: 0,
                            rotate: -45,
                          }}
                          animate={{
                            scale: 1,
                            rotate: 0,
                          }}
                          exit={{
                            scale: 0,
                          }}
                        >
                          <Check className="w-3 h-3 text-white stroke-[3.5]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Name */}
                <span className="font-bold text-sm tracking-wide text-slate-200 group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-50 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={handleSubmit}
          className={`
            w-full py-4 rounded-xl
            font-bold tracking-wide uppercase text-sm
            transition-all duration-300
            flex items-center justify-center gap-2
            ${
              isButtonDisabled
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            }
          `}
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Initialize Map ({selectedIds.length}/5)
            </>
          )}
        </button>
      </div>
    </div>
  );
}