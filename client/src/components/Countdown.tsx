import { useEffect, useState } from "react";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({
  target,
  dark = false,
}: {
  target: Date;
  dark?: boolean;
}) {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const units = [
    { value: time.days, label: "Jours" },
    { value: time.hours, label: "Heures" },
    { value: time.minutes, label: "Min" },
    { value: time.seconds, label: "Sec" },
  ];

  const numColor = dark ? "text-white" : "#2C2118";
  const labelColor = dark ? "rgba(255,255,255,0.45)" : "#9C8A72";
  const dividerColor = dark ? "rgba(255,255,255,0.14)" : "rgba(196,170,128,0.3)";

  return (
    <div className="flex items-center gap-1">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center">
          <div className="text-center px-3">
            <p
              className="font-serif tabular-nums leading-none"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: dark ? "#FFFFFF" : "#2C2118" }}
            >
              {pad(unit.value)}
            </p>
            <p
              className="mt-1 text-[9px] uppercase tracking-[0.45em]"
              style={{ color: dark ? "rgba(255,255,255,0.45)" : "#9C8A72" }}
            >
              {unit.label}
            </p>
          </div>
          {i < units.length - 1 && (
            <span
              className="font-serif text-xl pb-4 select-none"
              style={{ color: dark ? "rgba(255,255,255,0.25)" : "rgba(196,170,128,0.5)" }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
