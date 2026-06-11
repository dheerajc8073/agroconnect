import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Send, Volume2, VolumeX, MessageSquare, 
  Languages, Loader2, Sparkles, Trash2, AlertCircle, HelpCircle 
} from "lucide-react";
import { Message, MessageRole } from "../types";

interface VoiceAssistantProps {
  currentLang: "en" | "kn" | "hi";
  setCurrentLang: (lang: "en" | "kn" | "hi") => void;
}

export default function VoiceAssistant({ currentLang, setCurrentLang }: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getWelcomeMessage(currentLang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: "AgroConnect System",
      confidence: "100%"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null); // message ID being spoken
  const [micError, setMicError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setIsListening(false);
          await handleSendMessage(transcript, true);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setMicError("Microphone access is blocked. Please unlock microphone permissions in browser settings.");
        } else {
          setMicError(`Voice capture error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [currentLang]);

  // Handle auto-scroll to bottom of chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Adjust Speech recognition language code dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      if (currentLang === "kn") recognitionRef.current.lang = "kn-IN";
      else if (currentLang === "hi") recognitionRef.current.lang = "hi-IN";
      else recognitionRef.current.lang = "en-IN";
    }
    
    // Reset initial message but maintain chat context
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{
          id: "welcome",
          role: "assistant",
          content: getWelcomeMessage(currentLang),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: "AgroConnect System",
          confidence: "100%"
        }];
      }
      return prev;
    });
  }, [currentLang]);

  function getWelcomeMessage(lang: "en" | "kn" | "hi") {
    switch (lang) {
      case "kn":
        return "ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರೋಕನೆಕ್ಟ್ ಕೃಷಿ ಧ್ವನಿ ಸಹಾಯಕ. ಬೆಳೆ ರೋಗಗಳು, ಗೊಬ್ಬರ ಬಳಕೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿಯ ಬಗ್ಗೆ ನನಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ. ಕೆಳಗಿನ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲೇ ಮಾತನಾಡಿ!";
      case "hi":
        return "नमस्कार! मैं एग्रोकनेक्ट कृषि वॉयस असिस्टेंट हूँ। आप मुझसे फसल रोग, खाद, सिंचाई या जैविक खेती के बारे में सवाल पूछ सकते हैं। माइक दबाकर सीधे अपनी भाषा में बोलें!";
      default:
        return "Namaskar! Welcome to AgroConnect. I am your farming assistant. Speak to me by pressing the mic button below, or type your farming questions about diseases, fertilizers, and crop prices.";
    }
  }

  // Toggle speech synthesis read out aloud
  const handleToggleSpeak = (messageId: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this device.");
      return;
    }

    if (isSpeaking === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(messageId);

    // Filter markdown symbols out of the spoken text
    const cleanText = text
      .replace(/[*#_\-\[\]()]/g, "")
      .replace(/[0-9]+\.\s/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    let targetLangCode = "en-IN";
    if (currentLang === "hi") targetLangCode = "hi-IN";
    if (currentLang === "kn") targetLangCode = "kn-IN";
    utterance.lang = targetLangCode;

    // Search and lock optimal localized browser voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(currentLang));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsSpeaking(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Launch microphone capture
  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setMicError("Web Speech Recognition API is not supported in this browser. Please use Chrome or Safari, or type your query in the input box.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Clear speak audio
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech Rec already active:", err);
      }
    }
  };

  // Post Query to Express Backend Proxy
  const handleSendMessage = async (textToSend: string, wasVoice = false) => {
    const textClean = textToSend.trim();
    if (!textClean) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user" as MessageRole,
      content: textClean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voiceInput: wasVoice
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsProcessing(true);
    setMicError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textClean, lang: currentLang })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as MessageRole,
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || "AgroConnect AI Core",
        confidence: data.confidence || "90%"
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Automatically speak out the AI response if it was asked via sound coordinates
      if (wasVoice && !("speechSynthesis" in window === false)) {
        setTimeout(() => {
          handleToggleSpeak(assistantMsg.id, assistantMsg.content);
        }, 400);
      }

    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as MessageRole,
        content: currentLang === "kn" 
          ? "ಕ್ಷಮಿಸಿ, ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ಅಡಚಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ." 
          : currentLang === "hi"
            ? "क्षमा करें, जवाब मिलने में समस्या हुई है। कृपया पुनः प्रयास करें।"
            : "I am having trouble connecting to the satellite. Please try asking again in a few moments.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: "Local Recovery",
        confidence: "Low"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Do you want to reset your conversation history?")) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: getWelcomeMessage(currentLang),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: "AgroConnect System",
          confidence: "100%"
        }
      ]);
    }
  };

  const quickQuestions = {
    kn: [
      { text: "ಟೊಮ್ಯಾಟೊ ಎಲೆಗಳು ಹಳದಿ ದಾಹ ಮತ್ತು ಕಪ್ಪು ಚುಕ್ಕೆಗಳಾಗುತ್ತಿವೆ, ಪರಿಹಾರವೇನು?", label: "🍅 ಟೊಮ್ಯಾಟೊ ರೋಗ" },
      { text: "ಭತ್ತದ ಬೆಳೆಗೆ ಎಷ್ಟು ಪ್ರಮಾಣದ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?", label: "🌾 ಭತ್ತದ ಗೊಬ್ಬರ" },
      { text: "ಕಡಿಮೆ ಮಳೆಯಲ್ಲಿ ಸಾವಯವ ತೇವಾಂಶ ಸಂರಕ್ಷಣೆ ಹೇಗೆ?", label: "💧 ತೇವಾಂಶ ಉಳಿಸಿ" },
      { text: "ಬೇವಿನ ಹಿಂಡಿ ಉಪಯೋಗಿಸಿ ಸಾವಯವ ಕೀಟನಾಶಕ ಮಾಡುವುದು ಹೇಗೆ?", label: "🍃 ಸಾವಯವ ಕೀಟನಾಶಕ" }
    ],
    hi: [
      { text: "टमाटर के पत्तों पर पीले धब्बे और काले छल्ले पड़ रहे हैं, क्या इलाज है?", label: "🍅 टमाटर रोग" },
      { text: "धान (चावल) की फसल के लिए सबसे बढ़िया जैविक खाद कौन सी है?", label: "🌾 धान की खाद" },
      { text: "बारिश के पानी को संचित करने और टपक सिंचाई के फायदे क्या हैं?", label: "💧 ड्रिप सिंचाई" },
      { text: "नीम का तेल और गौमूत्र से कीटनाशक बनाने की विधि?", label: "🍃 जैविक कीटनाशक" }
    ],
    en: [
      { text: "My tomato crop leaves are turning yellow with dark target spots. What pesticide is best?", label: "🍅 Tomato Spotted Fungus" },
      { text: "What is the recommended dose of NPK fertilizers for Paddy per acre?", label: "🌾 Paddy Fertilizer" },
      { text: "How can I implement water-saving drip irrigation in dry soil?", label: "💧 Water Conservation" },
      { text: "Tell me simple step-by-step instructions for vermicomposting.", label: "🍃 Vermicomposting" }
    ]
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-md border max-w-4xl mx-auto" id="agro_assistant_layout">
      
      {/* Header bar */}
      <div className="p-4 border-b border-[rgba(211,84,53,0.12)] bg-[#FAF1E6]/40 dark:bg-[#3A241F]/20 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="bg-[#D35435] text-white p-2 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-black text-[#2F1E19] dark:text-[#FAF1E6] text-sm leading-tight">AgroConnect AI Assistant</h2>
            <p className="text-[10px] text-[#D35435] dark:text-[#FAF1E6] font-extrabold flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Voice & Text Q&A Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language shortcuts */}
          <div className="bg-[#FAF1E6]/80 dark:bg-[#3A241F]/80 p-0.5 rounded-xl flex items-center border border-[rgba(211,84,53,0.15)] gap-0.5" id="assistant_lang_switch">
            <button 
              onClick={() => setCurrentLang("kn")}
              className={`text-[10px] px-2 py-1 rounded-lg font-bold transition duration-300 ${currentLang === 'kn' ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#D35435] hover:bg-[#D35435]/10'}`}
              title="Kannada"
            >
              KN
            </button>
            <button 
              onClick={() => setCurrentLang("hi")}
              className={`text-[10px] px-2 py-1 rounded-lg font-bold transition duration-300 ${currentLang === 'hi' ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#D35435] hover:bg-[#D35435]/10'}`}
              title="Hindi"
            >
              HI
            </button>
            <button 
              onClick={() => setCurrentLang("en")}
              className={`text-[10px] px-2 py-1 rounded-lg font-bold transition duration-300 ${currentLang === 'en' ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#D35435] hover:bg-[#D35435]/10'}`}
              title="English"
            >
              EN
            </button>
          </div>

          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-lg hover:bg-[#FAF1E6]/50 transition cursor-pointer" 
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mic Warning Indicator */}
      {micError && (
        <div className="bg-red-50 border-b border-red-100 p-3 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Microphone Notice</p>
            <p className="text-red-600 mt-0.5">{micError}</p>
          </div>
        </div>
      )}

      {/* Main scrolling chat list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            id={`chat_bubble_${message.id}`}
          >
            <div className={`p-4 rounded-2xl shadow-xs ${
              message.role === 'user' 
                ? 'bg-[#D35435] text-white rounded-br-none' 
                : 'bg-white/95 dark:bg-[#3A241F]/60 text-[#2F1E19] dark:text-[#FAF1E6] border border-[rgba(211,84,53,0.15)] rounded-bl-none'
            }`}>
              {/* Message Content */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-sm">
                {message.content}
              </div>

              {/* Source & Controls inside AI message bubbles */}
              {message.role === "assistant" && (
                <div className="mt-2.5 pt-2 border-t border-[rgba(211,84,53,0.12)] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#D35435]/10 text-[#D35435] dark:bg-[#FAF1E6]/10 dark:text-[#FAF1E6] font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                      {message.source}
                    </span>
                    <span>Conf: {message.confidence}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleToggleSpeak(message.id, message.content)}
                    className={`p-1.5 rounded-full text-[#D35435] dark:text-[#FAF1E6] transition hover:bg-[#FAF1E6] dark:hover:bg-[#3a241f] cursor-pointer ${isSpeaking === message.id ? 'bg-[#FAF1E6] dark:bg-[#3a241f] animate-pulse text-[#D35435]' : ''}`}
                    title={isSpeaking === message.id ? "Stop Speaking" : "Listen Response Aloud (Text to Speech)"}
                  >
                    {isSpeaking === message.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
              {message.timestamp}
              {message.voiceInput && <span className="bg-[#FAF1E6] text-[#D35435] dark:bg-[#3A241F] dark:text-[#FAF1E6] px-1.5 py-0.5 rounded-full text-[9px] font-bold">Voice Input</span>}
            </span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex max-w-[85%] mr-auto items-start">
            <div className="bg-white/95 dark:bg-[#3A241F]/60 border border-[rgba(211,84,53,0.15)] p-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-[#D35435] animate-spin" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#2F1E19] dark:text-[#FAF1E6]">AgroConnect AI thinking...</p>
                <div className="flex gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E2B7A8] animate-bounce" style={{animationDelay: "0ms"}}></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D35435] animate-bounce" style={{animationDelay: "200ms"}}></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E2B7A8] animate-bounce" style={{animationDelay: "400ms"}}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick click suggestions for farmers */}
      <div className="p-2.5 border-t border-[rgba(211,84,53,0.12)] bg-[#FAF1E6]/20">
        <p className="text-[11px] text-[#6B4B3E] dark:text-[#DFA695] font-bold px-2 mb-1.5 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-[#6B4B3E] dark:text-[#DFA695]" />
          Click a quick question to ask AgroConnect:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-thin">
          {quickQuestions[currentLang].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.text, false)}
              className="shrink-0 text-xs font-bold bg-white/75 dark:bg-[#3A241F]/40 border border-[rgba(211,84,53,0.12)] text-[#2F1E19] dark:text-[#FAF1E6] px-3.5 py-1.5 rounded-full hover:bg-[#FAF1E6] hover:border-[#D35435]/30 hover:text-[#D35435] transition duration-300 shadow-xs cursor-pointer"
              id={`quick_q_${currentLang}_${idx}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Control Center */}
      <div className="bg-[#FAF1E6]/30 dark:bg-[#3A241F]/20 border-t border-[rgba(211,84,53,0.12)] p-3 flex items-center gap-3">
        {/* Animated Speech Recognition Mic Trigger */}
        <button
          onClick={handleStartListening}
          className={`relative p-4 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer ${
            isListening 
              ? 'bg-red-500 text-white mic-active-pulse ring-4 ring-red-100' 
              : 'bg-[#D35435] text-white hover:bg-[#AF3F24] active:scale-95 shadow-md hover:shadow'
          }`}
          id="assistant_mic_button"
          title={isListening ? "Stop listening" : "Speak to virtual assistant (Hold / click)"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          
          {isListening && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2F1E19] text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap shadow-md z-20">
              LISTENING...
            </span>
          )}
        </button>

        {/* Text Input Panel */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue, false);
          }}
          className="flex-1 flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isListening || isProcessing}
            placeholder={
              isListening 
                ? "Microphone is recording... speak clearly" 
                : currentLang === 'kn' 
                  ? "ನನ್ನನ್ನು ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ..." 
                  : currentLang === 'hi' 
                    ? "कृषि प्रश्न यहाँ पूछें..." 
                    : "Ask crop or fertilizer advice..."
            }
            className="flex-1 bg-[#FAF1E6]/40 dark:bg-[#3A241F]/30 border border-[rgba(211,84,53,0.15)] rounded-full px-4.5 py-2.5 text-sm text-[#2F1E19] dark:text-[#FAF1E6] placeholder-[#A96350] focus:outline-none focus:ring-2 focus:ring-[#D35435] focus:bg-white dark:focus:bg-[#3A241F]/85 transition"
            id="assistant_text_input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isListening || isProcessing}
            className="p-3 rounded-full bg-[#D35435] text-white hover:bg-[#AF3F24] disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 transition duration-300 cursor-pointer shrink-0"
            id="assistant_send_button"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
