import { useState, useRef, useCallback } from 'react';

export function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!supported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Parse amount from speech: "teen sau rupaye", "300", "five hundred"
      let amount = '';
      let items = transcript;

      const numMatch = transcript.match(/\d+(\.\d+)?/);
      if (numMatch) {
        amount = numMatch[0];
        items = transcript.replace(numMatch[0], '').replace(/rupay[ae]?/gi, '').trim();
      }

      // Hindi word numbers
      const hindiNumbers = {
        'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
        'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
        'bis': 20, 'tees': 30, 'chalis': 40, 'pachas': 50,
        'saath': 70, 'assi': 80, 'nabbe': 90,
        'sau': 100, 'hazaar': 1000,
      };

      if (!amount) {
        const words = transcript.toLowerCase().split(' ');
        let total = 0;
        let current = 0;
        words.forEach((w) => {
          if (hindiNumbers[w] !== undefined) {
            if (w === 'sau') { current = (current || 1) * 100; }
            else if (w === 'hazaar') { total += (current || 1) * 1000; current = 0; }
            else { current += hindiNumbers[w]; }
          }
        });
        total += current;
        if (total > 0) amount = String(total);
      }

      if (onResult) onResult({ transcript, amount, items });
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, startListening, stopListening };
}
