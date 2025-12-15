import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Cloud } from 'lucide-react';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  delay?: number; // milliseconds
}

export function useAutoSave({ onSave, delay = 2000 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<number>(Date.now());

  const triggerSave = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set status to indicate changes
    setStatus('idle');

    // Schedule save
    timeoutRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await onSave();
        setStatus('saved');
        lastSavedRef.current = Date.now();
        
        // Reset to idle after showing "saved" for 2 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setStatus('idle');
      }
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerSave, status, lastSaved: lastSavedRef.current };
}

// Auto-save indicator component
export function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-sm"
        >
          {status === 'saving' && (
            <>
              <Cloud className="h-4 w-4 animate-pulse text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Saving...</span>
            </>
          )}
          {status === 'saved' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Check className="h-4 w-4 text-[#4AFFA8]" />
              </motion.div>
              <span className="text-gray-600 dark:text-gray-400">Saved</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
