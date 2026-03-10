import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {

  // ================= VOICE ASSISTANT LOGIC =================
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech Recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN"; // Change to "ta-IN" for Tamil default

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("You said:", command);

        speak("You said " + command);

        // English Commands
        if (command.includes("add product")) {
          speak("Opening add product page");
          window.location.href = "/add-product";
        } 
        else if (command.includes("orders")) {
          speak("Opening your orders page");
          window.location.href = "/orders";
        } 
        else if (command.includes("dashboard")) {
          speak("Opening dashboard");
          window.location.href = "/dashboard";
        }

        // Tamil Commands
        else if (command.includes("பொருள் சேர்க்க")) {
          speak("பொருள் சேர்க்கும் பக்கம் திறக்கப்படுகிறது");
          window.location.href = "/add-product";
        } 
        else if (command.includes("ஆர்டர்")) {
          speak("உங்கள் ஆர்டர்கள் திறக்கப்படுகிறது");
          window.location.href = "/orders";
        }

        setListening(false);
      };

      window.startVoiceRecognition = () => {
        setListening(true);
        recognition.start();
      };
    }
  }, []);

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
  };

  // ================= UI START =================

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      <main>

        {/* Section 1 */}
        <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-6 tracking-tight">
            Our Mission
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FarmDirect was founded with a simple goal: to create a fairer,
            more transparent food system that benefits both farmers and consumers.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 border-t border-b border-gray-100 py-12">
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">10,000+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Happy Buyers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Regions Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">1M+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kg Produce Sold</div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-emerald-50/50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-emerald-950 mb-4">Our Values</h2>
            <p className="text-gray-500">The principles that guide everything we do</p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-gray-600 text-lg leading-relaxed">
            FarmDirect started in 2023 with a vision to connect farmers directly
            with buyers and eliminate middlemen.
          </div>
        </section>

      </main>

      {/* ================= FLOATING VOICE BUTTON ================= */}
      <button
        onClick={() => window.startVoiceRecognition()}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-5 rounded-full shadow-xl hover:bg-emerald-700 transition"
      >
        {listening ? "🎙 Listening..." : "🎤"}
      </button>

      <Footer />
    </div>
  );
}

export default About;