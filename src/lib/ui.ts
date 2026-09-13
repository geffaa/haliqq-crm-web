// Shared Tailwind class strings so every field/button across CRM tabs looks
// and behaves the same (same fix for the dark-mode text/placeholder bug).
export const inputCls =
  "rounded-lg border border-[#E9E4F2] bg-[#F7F5FB] px-3.5 py-2.5 text-[14.5px] text-[#141220] outline-none focus:border-[#7C40D4] placeholder:text-[#7B7589] min-w-[160px]";
export const primaryBtnCls =
  "rounded-lg px-5 h-[42px] text-[14.5px] font-bold text-white bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
export const ghostBtnCls =
  "rounded-lg px-4 h-[42px] text-[14.5px] font-semibold text-[#7B7589] cursor-pointer transition-colors hover:text-[#141220]";
export const dangerBtnCls =
  "text-[13px] font-semibold text-[#E0517A] cursor-pointer transition-transform hover:scale-105 active:scale-95";
