import { useEffect, useState } from 'react';

let lastHintTime = 0;
const HINT_COOLDOWN = 30000; // 30 seconds

export function useAylaHint(triggerCondition: boolean, getHint: () => string): string | null {
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (triggerCondition && Date.now() - lastHintTime > HINT_COOLDOWN) {
      const newHint = getHint();
      setHint(newHint);
      lastHintTime = Date.now();
      console.log(`Ayla Hint: ${newHint}`);
    }
  }, [triggerCondition, getHint]);

  return hint;
}
