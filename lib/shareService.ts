import { toBlob } from "html-to-image";

export const shareAsImage = async (
  elementRef: React.RefObject<HTMLDivElement>, 
  rank: number | string
) => {
  if (!elementRef.current) return;

  try {
    const blob = await toBlob(elementRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#050810",
    });

    if (!blob) return;

    const tg = (window as any).Telegram?.WebApp;
    const botUsername = "TeyaqiBot"; 
    
    // Ensure rank is just the number (strips any accidental file extensions)
    const displayRank = String(rank).split('-').pop()?.replace(".png", "") || rank;

    // YOUR REQUESTED FORMAT
    const shareText = `I'm ranked #${displayRank} on Teyaqi! Can you beat my score? Play Now on @${botUsername} 🏆`;

    // 1. MOBILE: Native Share (Directly attaches image to Telegram)
    const file = new File([blob], `rank-${displayRank}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Teyaqi",
        text: shareText,
      });
      return;
    }

    // 2. DESKTOP/FALLBACK: Download + Text Link
    const link = document.createElement("a");
    link.download = `teyaqi-rank.png`;
    link.href = URL.createObjectURL(blob);
    link.click();

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
    }

    if (tg) {
      // Uses the clean share URL without the 'url=' prefix
      const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;
      tg.openTelegramLink(shareUrl);
    }

  } catch (err) {
    console.error("Share failed:", err);
  }
};