interface ActionFooterProps {
  onLaunchGame: () => void;
  disabled: boolean;
}

export default function ActionFooter({ onLaunchGame, disabled }: ActionFooterProps) {
  return (
    <div className="w-full fixed bottom-0 left-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-900 px-6 py-5 flex justify-center items-center z-50">
      <button
        onClick={onLaunchGame}
        disabled={disabled}
        className={`
          w-full max-w-md py-4 rounded-2xl font-black text-xl tracking-wide uppercase select-none transition-all duration-150 border-b-4
          ${
            disabled
              ? "bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed"
              : "bg-white text-[#1cd05d] border-slate-300 active:border-b-0 active:mt-[4px] hover:bg-slate-50 shadow-md"
          }
        `}
      >
        Play
      </button>
    </div>
  );
}