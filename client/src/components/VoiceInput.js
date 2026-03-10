'use client';

import { useState, useCallback, useEffect } from 'react';

const VoiceInput = ({
  onSmartFill,
  label = 'Smart Fill',
  language = 'ta-IN' // Tamil
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasSupport(
        'webkitSpeechRecognition' in window ||
        'SpeechRecognition' in window
      );
    }
  }, []);

  // 🚀 AI-LEVEL TAMIL → GRAMMATICAL ENGLISH PARSER
  const parseTamilFarmerSpeech = useCallback((rawText) => {
    const text = rawText.toLowerCase().trim();

    // Tamil Phonetic + Script → English Dictionary (Expanded)
    const tamilProducts = {
      'urulaikizhangu': 'Potato', 'உருளைக்கிழங்கு': 'Potato', 'urulai': 'Potato', 'potato': 'Potato',
      'thakkali': 'Tomato', 'தக்காளி': 'Tomato', 'tomato': 'Tomato',
      'vengayam': 'Onion', 'வெங்காயம்': 'Onion', 'onion': 'Onion',
      'kathirikkai': 'Brinjal', 'கத்தரிக்காய்': 'Brinjal', 'brinjal': 'Brinjal', 'eggplant': 'Brinjal',
      'murungakkai': 'Drumstick', 'முருங்கைக்காய்': 'Drumstick', 'drumstick': 'Drumstick',
      'vendakkai': "Lady's Finger", 'வெண்டைக்காய்': "Lady's Finger", 'okra': "Lady's Finger",
      'kothamalli': 'Coriander', 'கொத்தமல்லி': 'Coriander', 'coriander': 'Coriander',
      'arisi': 'Rice', 'அரிசி': 'Rice', 'rice': 'Rice',
      'godhuma': 'Wheat', 'கோதுமை': 'Wheat', 'wheat': 'Wheat',
      'maampazham': 'Mango', 'மாம்பழம்': 'Mango', 'mango': 'Mango',
      'vaazhai': 'Banana', 'வாழைப்பழம்': 'Banana', 'banana': 'Banana',
      'carrot': 'Carrot', 'கேரட்': 'Carrot',
      'beans': 'Beans', 'பீன்ஸ்': 'Beans',
      'appil': 'Apple', 'ஆப்பிள்': 'Apple', 'apple': 'Apple'
    };

    const categories = {
      'kaaykari': 'vegetables', 'காய்கறி': 'vegetables', 'vegetable': 'vegetables',
      'pazham': 'fruits', 'பழம்': 'fruits', 'fruit': 'fruits',
      'thaniyam': 'grains', 'தானியம்': 'grains', 'grain': 'grains'
    };

    const locations = {
      'perambalur': 'Perambalur', 'பெரம்பலூர்': 'Perambalur',
      'trichy': 'Trichy', 'திருச்சி': 'Trichy',
      'chennai': 'Chennai', 'சென்னை': 'Chennai',
      'madurai': 'Madurai', 'மதுரை': 'Madurai',
      'salem': 'Salem', 'சேலம்': 'Salem'
    };

    const units = {
      'kilo': 'kg', 'கிலோ': 'kg', 'kg': 'kg',
      'gram': 'gram', 'கிராம்': 'gram',
      'liter': 'liter', 'லிட்டர்': 'liter'
    };

    // GRAMMAR INTELLIGENCE - Extract numbers
    const numbers = text.match(/(\d+(?:\.\d+)?)/g) || [];
    const price = numbers[0] || '';
    const stock = numbers[1] || '';

    let productName = '';
    let category = '';
    let location = '';
    let unit = 'kg';

    // Smart Match Logic
    for (const [key, val] of Object.entries(tamilProducts)) {
      if (text.includes(key)) { productName = val; break; }
    }

    for (const [key, val] of Object.entries(categories)) {
      if (text.includes(key)) { category = val; break; }
    }

    for (const [key, val] of Object.entries(locations)) {
      if (text.includes(key)) { location = val; break; }
    }

    for (const [key, val] of Object.entries(units)) {
      if (text.includes(key)) { unit = val; break; }
    }

    // Auto-detect category if missing
    if (productName && !category) {
      if (['Potato', 'Tomato', 'Onion', 'Brinjal', 'Drumstick', "Lady's Finger", 'Coriander', 'Carrot', 'Beans'].includes(productName)) category = 'vegetables';
      if (['Mango', 'Banana', 'Apple'].includes(productName)) category = 'fruits';
      if (['Rice', 'Wheat'].includes(productName)) category = 'grains';
    }

    const smartData = {};
    if (productName) smartData.name = productName;
    if (category) smartData.category = category;
    if (price) smartData.pricePerKg = price;
    if (stock) smartData.stockKg = stock;
    if (location) smartData.location = location;
    if (unit) smartData.unit = unit;
    if (text) smartData.description = `Harvested fresh ${productName} from ${location || 'local farms'}. Quality guaranteed.`;

    return {
      singleField: productName || rawText,
      smartData,
      confidence: Object.keys(smartData).length,
      rawText
    };
  }, []);

  const startListening = useCallback(() => {
    if (!hasSupport || isListening) return;

    try {
      setError(null);
      setIsListening(true);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = language; // ta-IN for Tamil
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        const parsed = parseTamilFarmerSpeech(transcript);

        if (onSmartFill) {
          onSmartFill(parsed);
        }

        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setError('மைக் அனுமதி தரவும் (Allow microphone)');
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setError('Voice unavailable');
    }
  }, [hasSupport, isListening, language, parseTamilFarmerSpeech, onSmartFill]);

  if (typeof window === 'undefined' || !hasSupport) return null;

  return (
    <div className="voice-ai-wrapper">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`
          group relative p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-600 
          text-white font-bold text-lg shadow-2xl hover:shadow-purple-lg hover:scale-105
          transition-all duration-300 border-4 border-purple-200 hover:border-purple-300
          ${isListening ? 'animate-pulse ring-4 ring-purple-400' : 'hover:from-purple-700 hover:to-emerald-700'}
        `}
        title="Tamil AI Voice → Perfect English Forms"
      >
        {isListening ? (
          <>
            <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-2xl"></div>
            <span className="relative flex items-center gap-2">
              🎙️ AI Listening...
            </span>
          </>
        ) : (
          <>
            🤖 AI Tamil Voice
            <span className="absolute -top-3 -right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow-lg">
              MAGIC ✨
            </span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-800 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-600 font-bold">×</button>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
