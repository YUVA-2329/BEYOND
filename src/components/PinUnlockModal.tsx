import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldCheck, KeyRound } from 'lucide-react';

interface PinUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  isUnlocked: boolean;
}

export const PinUnlockModal: React.FC<PinUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  isUnlocked,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4) {
        if (nextPin === '0000') {
          setTimeout(() => {
            onUnlockSuccess();
            onClose();
            setPin('');
          }, 200);
        } else {
          setErrorMsg('Incorrect PIN. Enter 0000 to unlock.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#111715] border border-white/10 rounded-3xl p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
          {isUnlocked ? <Unlock size={28} /> : <Lock size={28} />}
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          {isUnlocked ? 'Editor Mode Active' : 'Enter PIN to Edit'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {isUnlocked
            ? 'You have full explorer publishing and editing privileges enabled.'
            : 'Type "0000" on your keyboard or tap the keypad below to unlock publishing and editing rights.'}
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-[#00E599] scale-110 shadow-[0_0_10px_#00E599]'
                  : 'bg-white/10 border border-white/20'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium mb-4 animate-shake">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95 text-lg font-bold text-white transition-all flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95 text-lg font-bold text-white transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <KeyRound size={13} className="text-[#00E599]" />
          <span>Default Master Access PIN is: <strong className="text-white font-mono">0000</strong></span>
        </div>
      </div>
    </div>
  );
};
