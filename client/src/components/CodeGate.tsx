import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "kecha2026_access";
const VALID_CODE = "kecha";

interface CodeGateProps {
  children: React.ReactNode;
}

export default function CodeGate({ children }: CodeGateProps) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [unlocked]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toLowerCase() === VALID_CODE) {
      setError(false);
      setRevealing(true);
      setTimeout(() => {
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* silent */ }
        setUnlocked(true);
      }, 800);
    } else {
      setError(true);
      setShaking(true);
      setCode("");
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      {!revealing ? (
        <motion.div
          key="gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#1C180F" }}
        >
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,170,128,0.09) 0%, transparent 70%)",
            }}
          />

          {/* Ornament top */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
            <div className="h-[1px] w-24" style={{ background: "linear-gradient(90deg, transparent, #C4AA80, transparent)" }} />
            <span className="text-[9px] uppercase tracking-[0.65em]" style={{ color: "#C4AA80" }}>
              Kecha 2026
            </span>
            <div className="h-[1px] w-24" style={{ background: "linear-gradient(90deg, transparent, #C4AA80, transparent)" }} />
          </div>

          <div className="relative flex w-full max-w-sm flex-col items-center px-8">
            {/* Monogram / logo area */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-script text-center leading-none"
              style={{ fontSize: "clamp(3rem, 14vw, 5rem)", color: "#C4AA80" }}
            >
              K & C
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-4 text-center text-[10px] uppercase tracking-[0.55em]"
              style={{ color: "rgba(196,170,128,0.5)" }}
            >
              Entrez votre code d'invitation
            </motion.p>

            {/* Code form */}
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              className="mt-10 w-full"
            >
              <motion.div
                animate={shaking ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.55 }}
                className="relative"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(false); }}
                  placeholder="Code"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full border bg-transparent py-4 text-center text-lg tracking-[0.35em] outline-none placeholder:opacity-30 transition-colors duration-200"
                  style={{
                    color: "#F0E6D0",
                    borderColor: error ? "rgba(220,80,80,0.5)" : "rgba(196,170,128,0.25)",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = error
                      ? "rgba(220,80,80,0.7)"
                      : "rgba(196,170,128,0.6)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = error
                      ? "rgba(220,80,80,0.5)"
                      : "rgba(196,170,128,0.25)")
                  }
                />
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-6 left-0 w-full text-center text-[10px] uppercase tracking-[0.4em]"
                      style={{ color: "rgba(220,100,100,0.85)" }}
                    >
                      Code incorrect
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <button
                type="submit"
                className="mt-10 w-full py-4 text-[10px] uppercase tracking-[0.55em] transition-all duration-200"
                style={{
                  background: "rgba(196,170,128,0.12)",
                  color: "#C4AA80",
                  border: "1px solid rgba(196,170,128,0.22)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(196,170,128,0.2)";
                  e.currentTarget.style.borderColor = "rgba(196,170,128,0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(196,170,128,0.12)";
                  e.currentTarget.style.borderColor = "rgba(196,170,128,0.22)";
                }}
              >
                Accéder à l'invitation
              </button>
            </motion.form>
          </div>

          {/* Bottom ornament */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
            <div className="h-[1px] w-16" style={{ background: "linear-gradient(90deg, transparent, #C4AA80, transparent)" }} />
          </div>
        </motion.div>
      ) : (
        /* Revealing overlay that fades out over the content */
        <motion.div
          key="reveal"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{ background: "#1C180F" }}
        />
      )}
    </AnimatePresence>
  );
}
