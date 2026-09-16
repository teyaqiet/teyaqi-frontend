"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/api";

import WelcomeStep from "./components/WelcomeStep";
import AvatarStep from "./components/AvatarStep";
import CategoryStep from "./components/CategoryStep";

export default function OnboardingPage() {
const router = useRouter();

const [step, setStep] = useState(1);
const [dbCategories, setDbCategories] = useState([]);

const [selectedAvatar, setSelectedAvatar] = useState(null);
const [selectedGender, setSelectedGender] = useState("");
const [selectedCategories, setSelectedCategories] = useState([]);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const getTopBarText = () => {
switch (step) {
case 1:
return "Ohh... A New Challenger.";


  case 2:
    return "Every Challenger Needs An Identity.";

  case 3:
    return "Make Your Daily Challenges Yours.";

  default:
    return "";
}


};

const loadCategoriesData = async () => {
setLoading(true);
setError("");


try {
  const response = await fetcher("/api/categories/list");

  if (
    response &&
    response.status === "success" &&
    Array.isArray(response.data)
  ) {
    setDbCategories(response.data);
    setStep(3);
    return;
  }

  throw new Error(
    "Unable to load categories. The server returned an invalid response."
  );
} catch (err) {
  console.error("[Onboarding] Failed to load categories:", err);

  setError(
    err?.message ||
      "Unable to connect to the server. Please check your connection and try again."
  );
} finally {
  setLoading(false);
}


};

const handleAvatarSelection = (option) => {
if (!option) {
return;
}


setSelectedAvatar(option.asset || null);
setSelectedGender(option.gender || "");


};

const handleCategoryToggle = (id) => {
setSelectedCategories((previous) => {
if (previous.includes(id)) {
return previous.filter(
(categoryId) => categoryId !== id
);
}


  return [...previous, id];
});


};

const handleOnboardingSubmit = async () => {
if (!selectedAvatar || !selectedGender) {
setError("Please choose your avatar before continuing.");
return;
}


if (selectedCategories.length === 0) {
  setError("Please select at least one category.");
  return;
}

setLoading(true);
setError("");

try {
  const response = await fetcher("/api/user/onboard", {
    method: "POST",
    body: JSON.stringify({
      avatar: selectedAvatar,
      gender: selectedGender,
      category_ids: selectedCategories,
    }),
  });

  if (response && response.status === "success") {
    router.replace(
      "/quiz?challengeId=daily&autoStart=true"
    );
    return;
  }

  throw new Error(
    response?.message ||
      "Unable to complete onboarding."
  );
} catch (err) {
  console.error(
    "[Onboarding] Submission failed:",
    err
  );

  setError(
    err?.message ||
      "Onboarding failed. Please try again."
  );
} finally {
  setLoading(false);
}


};

const handleRetry = () => {
setError("");


if (step === 2) {
  loadCategoriesData();
} else if (step === 3) {
  loadCategoriesData();
}


};

return ( <div className="fixed inset-0 z-[9999] flex h-full w-full flex-col overflow-hidden bg-[#0b1426] font-sans text-white antialiased"> <div className="flex w-full items-center justify-between bg-[#22c55e] px-6 py-3.5 shadow-md select-none"> <span className="text-sm font-semibold tracking-wide text-white">
{getTopBarText()} </span>


    <div className="flex items-center gap-2">
      {[1, 2, 3].map((item) => {
        const isCurrent = step === item;

        return (
          <div
            key={item}
            className={`rounded-full bg-slate-950 transition-all duration-300 ${
              isCurrent
                ? "h-2 w-6"
                : "h-2 w-2 opacity-40"
            }`}
          />
        );
      })}
    </div>
  </div>

  {error && (
    <div className="mx-6 mt-4 flex flex-col items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs font-semibold text-red-400">
      <span>{error}</span>

      {(step === 2 || step === 3) && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={loading}
          className="mt-1 rounded-lg bg-red-500 px-4 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Reconnecting..."
            : "Retry Connection"}
        </button>
      )}
    </div>
  )}

  <div className="flex-1 overflow-y-auto">
    {step === 1 && (
      <WelcomeStep
        onNext={() => {
          setError("");
          setStep(2);
        }}
      />
    )}

    {step === 2 && (
      <AvatarStep
        selectedAvatar={selectedAvatar}
        onSelect={handleAvatarSelection}
        onNext={loadCategoriesData}
        onBack={() => {
          setError("");
          setStep(1);
        }}
      />
    )}

    {step === 3 && (
      <CategoryStep
        categories={dbCategories}
        selectedCategories={selectedCategories}
        onToggle={handleCategoryToggle}
        onSubmit={handleOnboardingSubmit}
        onBack={() => {
          setError("");
          setStep(2);
        }}
        loading={loading}
      />
    )}
  </div>
</div>


);
}
