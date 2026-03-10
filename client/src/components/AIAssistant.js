'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, Search, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [hasSupport, setHasSupport] = useState(false);
    const navigate = useNavigate();
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            setHasSupport(!!SpeechRecognition);
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
            }
        }
    }, []);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleCommand = useCallback((text) => {
        const cmd = text.toLowerCase();

        // Commands in Tamil and English
        if (cmd.includes('dashboard') || cmd.includes('டேஷ்போர்டு') || cmd.includes('நிர்வாகம்')) {
            setResponse('Sure! Opening your dashboard.');
            speak('Sure! Opening your dashboard.');
            setTimeout(() => navigate('/farmer-dashboard'), 1500);
            return;
        }

        if (cmd.includes('cart') || cmd.includes('வண்டி') || cmd.includes('கூடை')) {
            setResponse('Showing your shopping cart.');
            speak('Showing your shopping cart.');
            setTimeout(() => navigate('/cart'), 1500);
            return;
        }

        if (cmd.includes('tomato') || cmd.includes('தக்காளி')) {
            setResponse('Finding fresh tomatoes for you!');
            speak('Finding fresh tomatoes for you!');
            setTimeout(() => navigate('/products?q=tomato'), 1500);
            return;
        }

        if (cmd.includes('potato') || cmd.includes('உருளைக்கிழங்கு')) {
            setResponse('Searching for potatoes.');
            speak('Searching for potatoes.');
            setTimeout(() => navigate('/products?q=potato'), 1500);
            return;
        }

        if (cmd.includes('onion') || cmd.includes('வெங்காயம்')) {
            setResponse('I found some onions from local farms.');
            speak('I found some onions from local farms.');
            setTimeout(() => navigate('/products?q=onion'), 1500);
            return;
        }

        setResponse("I'm not sure how to help with that yet, but I'm learning! You can ask to see your dashboard or search for products.");
        speak("I'm not sure how to help with that yet, but I'm learning!");
    }, [navigate]);

    const startListening = () => {
        if (!recognitionRef.current || isListening) return;

        setTranscript('');
        setResponse('');
        setIsListening(true);

        recognitionRef.current.onresult = (event) => {
            const current = event.resultIndex;
            const resultText = event.results[current][0].transcript;
            setTranscript(resultText);

            if (event.results[current].isFinal) {
                setIsListening(false);
                handleCommand(resultText);
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    if (!hasSupport) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Assistant Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-purple-600 text-white shadow-2xl hover:scale-110 transition-all duration-300"
                >
                    <Sparkles className="h-8 w-8 animate-pulse" />
                    <span className="absolute -top-12 right-0 scale-0 group-hover:scale-100 transition-all duration-300 bg-white text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-emerald-100 whitespace-nowrap">
                        Ask AI Assistant
                    </span>
                </button>
            )}

            {/* Expanded Assistant UI */}
            {isOpen && (
                <div className="flex flex-col w-[350px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-emerald-50 overflow-hidden animate-in fade-in zoom-in duration-300 origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-emerald-600 to-purple-600 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-bold">Farmer AI Assistant</span>
                        </div>
                        <button onClick={() => { setIsOpen(false); stopListening(); }} className="hover:bg-white/20 p-1 rounded-full transition">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 p-6 space-y-4 min-h-[250px] max-h-[400px] overflow-y-auto bg-emerald-50/30">
                        {transcript && (
                            <div className="flex justify-end">
                                <div className="bg-white px-4 py-2 rounded-2xl rounded-tr-none shadow-sm border border-emerald-100 text-sm text-emerald-900 max-w-[80%]">
                                    "{transcript}"
                                </div>
                            </div>
                        )}

                        {(response || isListening) && (
                            <div className="flex justify-start">
                                <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl rounded-tl-none shadow-md text-sm max-w-[80%] flex items-center gap-2">
                                    {isListening ? (
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    ) : (
                                        response
                                    )}
                                </div>
                            </div>
                        )}

                        {!transcript && !response && !isListening && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 animate-pulse">
                                    <Mic className="h-8 w-8" />
                                </div>
                                <p className="text-emerald-900/60 text-sm">
                                    Click the mic and say:<br />
                                    <span className="font-semibold italic text-emerald-700">"Go to dashboard"</span> or<br />
                                    <span className="font-semibold italic text-emerald-700">"Show me tomatoes"</span>
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button onClick={() => handleCommand('dashboard')} className="p-2 bg-white rounded-xl text-[10px] border border-emerald-100 flex items-center gap-1 hover:bg-emerald-50 transition">
                                        <LayoutDashboard className="h-3 w-3" /> Dashboard
                                    </button>
                                    <button onClick={() => handleCommand('tomato')} className="p-2 bg-white rounded-xl text-[10px] border border-emerald-100 flex items-center gap-1 hover:bg-emerald-50 transition">
                                        <Search className="h-3 w-3" /> Search Tomato
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Main Action */}
                    <div className="p-6 bg-white border-t border-emerald-100 flex flex-col items-center gap-4">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`
                h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                ${isListening ? 'bg-red-500 scale-110' : 'bg-emerald-600 hover:bg-emerald-700'}
                text-white
              `}
                        >
                            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                        </button>
                        <p className="text-xs font-medium text-emerald-900/50">
                            {isListening ? 'Listening...' : 'Tap to speak'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
