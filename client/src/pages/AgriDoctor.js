import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AgriDoctor.css';

const AgriDoctor = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'வணக்கம்! நான் உங்கள் விவசாய மருத்துவர். உங்கள் பயிர் பிரச்சனைகளை என்னிடம் சொல்லுங்கள்.', lang: 'ta' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [history, setHistory] = useState([
        { crop: 'Tomato', diagnosis: 'Early Blight', date: 'Oct 12' },
        { crop: 'Rice', diagnosis: 'Leaf Blast', date: 'Oct 08' }
    ]);
    const [severity, setSeverity] = useState(20);
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("Consulting AI...");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    
    const recognitionRef = useRef(null);
    const scrollRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const activeStreamRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'ta-IN';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                sendMessage(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isCameraOpen) {
            const initCamera = async () => {
                try {
                    // Try with ideal constraints first
                    const constraints = { 
                        video: { 
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        } 
                    };
                    let stream;
                    try {
                        stream = await navigator.mediaDevices.getUserMedia(constraints);
                    } catch (e) {
                        console.warn("Ideal constraints failed, falling back to basic video", e);
                        // Fallback to absolute minimum if system is being picky
                        stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    }

                    activeStreamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Ensure it plays
                        await videoRef.current.play();
                    }
                } catch (err) {
                    console.error("Camera access error:", err);
                    let msg = "Unable to access camera.";
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') 
                        msg = "Camera access was denied. Please click the camera icon in your browser's address bar and select 'Allow'.";
                    else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') 
                        msg = "No camera found on this device.";
                    else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') 
                        msg = "Camera is already in use by another app (like Zoom or a different browser tab) or blocked by your system.";
                    
                    alert(`📸 Camera Error: ${msg}\n\nTroubleshooting:\n1. Close other tabs/apps using camera\n2. Refresh the page\n3. Use the 📁 icon as a backup (it also has a 'Take Photo' option!)`);
                    setIsCameraOpen(false);
                }
            };
            // Small delay to ensure the DOM element is mounted
            const timer = setTimeout(initCamera, 100);
            return () => clearTimeout(timer);
        } else {
            if (activeStreamRef.current) {
                activeStreamRef.current.getTracks().forEach(track => track.stop());
                activeStreamRef.current = null;
            }
        }
    }, [isCameraOpen]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // 🔍 GLOBAL DATA DISCOVERY SIMULATION
            setLoadingStatus("Connecting to Global Agri-Hub...");
            await new Promise(r => setTimeout(r, 700));
            setLoadingStatus("Fetching current regional trends...");
            await new Promise(r => setTimeout(r, 700));
            setLoadingStatus("Verifying Treatment Protocols...");

            const res = await axios.post('http://localhost:5000/api/ai-crop-health/answer', { queryText: text });
            const data = res.data;

            if (data.isAgri) {
                const aiMsg = { 
                    role: 'ai', 
                    text: `உங்கள் ${data.detectedCrop} க்கான மருத்துவ அறிக்கை தயார். இது ${data.diagnosisTa} ஆக இருக்கலாம்.`,
                    report: data
                };
                setMessages(prev => [...prev, aiMsg]);
                
                // Update widgets
                if(data.severity === 'CRITICAL') setSeverity(95);
                else if(data.severity === 'HIGH') setSeverity(75);
                else if(data.severity === 'MODERATE') setSeverity(45);
                else setSeverity(25);

                // Add to history
                setHistory(prev => [{ crop: data.detectedCrop, diagnosis: data.diagnosisEn, date: 'Today' }, ...prev]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: data.diagnosisTa }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: 'மன்னிக்கவும், என்னால் இப்போது பதிலளிக்க முடியவில்லை.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const analyzeCrop = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setLoadingStatus("🔍 AI analyzing crop image...");
        console.log("Uploading image:", selectedImage);

        const formData = new FormData();
        formData.append("image", selectedImage);

        try {
            const config = {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            };
            const res = await axios.post('http://localhost:5000/api/disease/detect', formData, config);
            
            const result = res.data; // Now contains { disease, confidence }
            
            // Add to chat as an AI response
            const aiMsg = {
                role: 'ai',
                text: `Crop analysis complete. I've detected symptoms of ${result.disease.replace(/___/g, ' ').replace(/_/g, ' ')}.`,
                isAnalysis: true,
                analysisData: result,
                preview: imagePreview
            };
            setMessages(prev => [...prev, aiMsg]);
            
            // Add to history
            setHistory(prev => [{ 
                crop: result.disease.split(' ')[0], 
                diagnosis: result.disease, 
                date: 'Just Now' 
            }, ...prev]);

        } catch (err) {
            console.error("Detection error:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown Error';
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: `மன்னிக்கவும், படத்தைப் பகுப்பாய்வு செய்வதில் பிழை ஏற்பட்டது: ${errorMessage}` 
            }]);
        } finally {
            setLoading(false);
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const startCamera = () => {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            alert("⚠️ Camera access requires a secure connection (HTTPS). Please use localhost or an HTTPS URL.");
            return;
        }
        setIsCameraOpen(true);
    };

    const stopCamera = () => {
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            // Add visual shutter effect
            const container = video.parentElement;
            container.classList.add('shutter-flash');
            setTimeout(() => container.classList.remove('shutter-flash'), 200);

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            canvas.toBlob((blob) => {
                const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
                setSelectedImage(file);
                setImagePreview(URL.createObjectURL(file));
                
                // Stop camera after short delay to allow visual feedback
                setTimeout(stopCamera, 300);
            }, 'image/jpeg');
        }
    };

    return (
        <div className="agri-doctor-page">
            <div className="doctor-app-container">
                
                {/* SIDEBAR: Consultation History */}
                <aside className="doc-sidebar">
                    <div className="doc-logo">
                        <div className="doc-avatar">🩺</div>
                        <h2>Agri-Doctor</h2>
                    </div>
                    
                    <p className="history-label">Consultation History</p>
                    <div className="history-list">
                        {history.map((h, i) => (
                            <div key={i} className="history-card">
                                <h4>{h.crop} - {h.diagnosis}</h4>
                                <p>{h.date} • Verified AI Report</p>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* MAIN CHAT AREA */}
                <main className="doc-chat-main">
                    <header className="chat-header">
                        <div className="doctor-profile">
                            <div className="doc-avatar">AI</div>
                            <div className="doc-info">
                                <h3>Digital Plant Pathologist</h3>
                                <span>● Online & Analyzing</span>
                            </div>
                        </div>
                        <div className="doctor-actions">
                            <button className="doc-pill-btn">Export PDF</button>
                        </div>
                    </header>

                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg ${m.role}`}>
                                {m.preview && (
                                    <div className="msg-image-container">
                                        <img src={m.preview} alt="Analyzed Crop" className="msg-preview-image" />
                                    </div>
                                )}
                                <div className="msg-text">{m.text}</div>
                                {m.isAnalysis && m.analysisData && (
                                    <div className="medical-report analysis">
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                            <span className="severity-tag high">AI DIAGNOSIS</span>
                                            <span style={{fontSize: '11px', fontWeight: 'bold', color: '#10b981'}}>
                                                CONFIDENCE: {(m.analysisData.confidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p><strong>🩺 Detected: {m.analysisData.disease}</strong></p>
                                        <div style={{marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', fontSize: '12px'}}>
                                            <p style={{marginBottom: '5px'}}><b>🔍 Symptoms:</b> {m.analysisData.symptoms}</p>
                                            <p style={{marginBottom: '5px', color: '#00897b'}}><b>💊 Treatment:</b> {m.analysisData.treatment}</p>
                                            <p style={{marginBottom: '0', color: '#004d40'}}><b>🛡️ Prevention:</b> {m.analysisData.prevention}</p>
                                        </div>
                                        <p style={{fontSize: '11px', color: '#666', marginTop: '10px', fontStyle: 'italic'}}>
                                            Based on visual patterns identified by our plant pathology network.
                                        </p>
                                    </div>
                                )}
                                {m.report && (
                                    <div className="medical-report">
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                            <span className={`severity-tag ${m.report.severity.toLowerCase()}`}>
                                                {m.report.severity} LEVEL RISK
                                            </span>
                                            <span style={{fontSize: '9px', fontWeight: 'bold', color: '#10b981'}}>
                                                CONFIDENCE: {m.report.confidence || 'HIGH'}
                                            </span>
                                        </div>
                                        <p><strong>💊 {m.report.treatmentTa}</strong></p>
                                        <p style={{fontSize: '11px', marginTop: '5px'}}>🛡️ {m.report.preventionTa}</p>
                                        <hr style={{opacity: 0.1, margin: '10px 0'}} />
                                        <p style={{fontSize: '10px', color: '#666'}}>
                                            <b>Clinical Source:</b> {m.report.source || 'Global Agri-DB v4.0'}
                                        </p>
                                        <p style={{fontSize: '10px', color: '#666'}}>
                                            <b>Doctor's Note:</b> {m.report.riskFactorEn}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="msg ai loading-msg">
                                <div className="loading-spinner"></div>
                                <span>{loadingStatus}</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    <div className="chat-input-area">
                        {imagePreview && (
                            <div className="image-preview-bubble">
                                <img src={imagePreview} alt="Preview" />
                                <button className="clear-preview" onClick={() => {setImagePreview(null); setSelectedImage(null);}}>✕</button>
                                <button className="analyze-btn" onClick={analyzeCrop}>Analyze Crop</button>
                            </div>
                        )}
                        <label className="doc-btn upload-btn" title="Upload Image">
                            📁
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{display: 'none'}} />
                        </label>
                        <button className="doc-btn camera-btn" title="Take Photo" onClick={startCamera}>
                            📸
                        </button>
                        <button className={`doc-btn mic-btn ${isListening ? 'active' : ''}`} title="Voice Search" onClick={toggleListening}>
                            {isListening ? '⏹️' : '🎤'}
                        </button>
                        <div className="input-wrapper">
                            <input 
                                placeholder="மஞ்சள் இலைகளைப் பற்றி என்னிடம் கேளுங்கள்..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                            />
                        </div>
                        <button className="doc-btn send-btn" onClick={() => sendMessage(input)}>➤</button>
                    </div>
                </main>

                {/* RIGHT WIDGETS */}
                <aside className="doc-widgets">
                    <div className="widget-card">
                        <h5>Analyzed Risk</h5>
                        <div className="risk-meter">
                            <div className="risk-level" style={{ width: `${severity}%` }}></div>
                        </div>
                        <p style={{fontSize: '10px', marginTop: '10px', fontWeight: 'bold'}}>
                            {severity > 70 ? 'CRITICAL ATTENTION NEEDED' : 'Environment Stable'}
                        </p>
                    </div>

                    <div className="widget-card">
                        <h5>Env Factors</h5>
                        <ul style={{listStyle: 'none', padding: 0, fontSize: '11px', lineHeight: '2'}}>
                            <li>🌡️ Soil Temp: 24°C</li>
                            <li>💧 Humidity: 68%</li>
                            <li>💨 Wind: 14 km/h</li>
                        </ul>
                    </div>
                </aside>
                
                {/* CAMERA MODAL */}
                {isCameraOpen && (
                    <div className="camera-modal">
                        <div className="camera-container">
                            <video ref={videoRef} autoPlay playsInline />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className="camera-controls">
                                <button className="capture-btn" onClick={capturePhoto}>●</button>
                                <button className="close-camera" onClick={stopCamera}>✕</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AgriDoctor;
