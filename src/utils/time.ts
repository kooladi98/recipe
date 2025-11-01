export const mmss = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const stepProgressPercent = (remainingSec: number, durationSec: number) => {
  const elapsed = Math.max(0, durationSec - remainingSec);
  return Math.round((elapsed / Math.max(1, durationSec)) * 100);
};

export const overallProgressPercent = (overallRemainingSec: number, totalDurationSec: number) => {
  const elapsed = Math.max(0, totalDurationSec - overallRemainingSec);
  return Math.round((elapsed / Math.max(1, totalDurationSec)) * 100);
};
