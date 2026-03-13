import React, { useState, useEffect, useRef } from 'react';
import './AiPriceAdvisor.css';

const AiPriceAdvisor = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('ta-IN'); // Default to Tamil

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language;

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                fetchPriceAdvice(text);
            };

            recognitionRef.current.onerror = (event) => {
                setError("Speech recognition error: " + event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            setError("Web Speech API is not supported in this browser.");
        }
    }, [language]);

    const startListening = () => {
        if (!recognitionRef.current) return;
        setError(null);
        setResult(null);
        setTranscript('');
        setIsListening(true);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
    };

    const fetchPriceAdvice = async (queryText) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/ai-price/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    queryText, 
                    preferredLanguage: language === 'ta-IN' ? 'Tamil' : 'English' 
                })
            });

            const data = await response.json();
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || "Failed to get advice");
            }
        } catch (err) {
            setError("Connection error. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-price-container">
            <div className="advisor-card">
                <h1 className="advisor-title">AgriForge AI</h1>
                <p className="advisor-subtitle">Speak a crop name to get real-time price & advice</p>

                <div className="language-toggle">
                    <button 
                        className={`lang-btn ${language === 'ta-IN' ? 'active' : ''}`}
                        onClick={() => setLanguage('ta-IN')}
                    >
                        Tamil
                    </button>
                    <button 
                        className={`lang-btn ${language === 'en-US' ? 'active' : ''}`}
                        onClick={() => setLanguage('en-US')}
                    >
                        English
                    </button>
                </div>

                <div className="voice-section">
                    <button 
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        {isListening ? '🛑' : '🎤'}
                    </button>
                    {isListening && <p className="listening-text">Listening...</p>}
                </div>

                {transcript && (
                    <div className="transcript-area">
                        "{transcript}"
                    </div>
                )}

                {loading && <p>Thinking... Thinking... 🤖</p>}
                {error && <p className="error-text" style={{color: '#ff6b6b'}}>{error}</p>}

                {result && (
                    <div className="result-section">
                        <div className="price-badge">
                            ₹{result.currentPrice} per {result.unit}
                        </div>
                        <p><strong>Market:</strong> {result.market}</p>
                        
                        <div className="advice-card">
                            <h4>
                                <span className={`status-indicator status-${result.status.replace(' ', '-')}`}></span>
                                {result.status}
                            </h4>
                            <p style={{marginBottom: '10px'}}><strong>EN:</strong> {result.aiAdviceEn}</p>
                            <p><strong>TA:</strong> {result.aiAdviceTa}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiPriceAdvisor;
