import React, { useState, useEffect } from "react";
import { 
  Home as HomeIcon, ShoppingBag, MessageSquare, PlusCircle, Sprout, 
  Sun, CloudRain, Droplet, Wind, Languages, Shield, ChevronRight, 
  HelpCircle, AlertCircle, RefreshCw, Volume2, Moon, Landmark 
} from "lucide-react";

// Components
import VoiceAssistant from "./components/VoiceAssistant";
import MarketPrices from "./components/MarketPrices";
import Marketplace from "./components/Marketplace";
import FarmingTips from "./components/FarmingTips";
import SellForm from "./components/SellForm";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "market" | "assistant" | "sell" | "tips">("home");
  const [marketSubTab, setMarketSubTab] = useState<"mandi" | "p2p">("mandi");
  const [currentLang, setCurrentLang] = useState<"en" | "kn" | "hi">("en");
  const [darkMode, setDarkMode] = useState(false);

  // Localization strings
  const strings = {
    en: {
      appName: "AgroConnect",
      slogan: "Smart Farming Platform",
      homeTitle: "Krishi Dashboard",
      welcome: "Welcome back, Farmer!",
      weatherTitle: "Farm Weather & Soil Conditions",
      tempLabel: "Air Temp",
      moistureLabel: "Soil Moisture",
      rainLabel: "Rain Prob.",
      sowingAdvisory: "Advisory: Perfect day for Kharif oilseed sowing. High soil moisture retention.",
      quickQA: "Quick Farming Q&A",
      askNow: "Ask AgroConnect AI",
      mandiHighs: "Mandi Price Highlights",
      mandiDesc: "Modal price index per Quintal (100 kg)",
      allRights: "AgroConnect © 2026. Empowering Indian Farmers direct.",
      marketPriceToggle: "State Mandi Rates",
      marketplaceToggle: "Farmer Marketplace",
      sellCrop: "Post Your Crop",
      tipsTitle: "Seasonal Sustainable Practices",
      assistantTab: "AI Voice Assistant"
    },
    kn: {
      appName: "ಅಗ್ರೋಕನೆಕ್ಟ್",
      slogan: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವೇದಿಕೆ",
      homeTitle: "ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      welcome: "ನಮಸ್ಕಾರ, ರೈತ ಬಾಂಧವರೇ!",
      weatherTitle: "ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ",
      tempLabel: "ತಾಪಮಾನ",
      moistureLabel: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
      rainLabel: "ಮಳೆ ಸಾಧ್ಯತೆ",
      sowingAdvisory: "ಸಲಹೆ: ಮುಂಗಾರು ಬೆಳೆ ಬಿತ್ತನೆಗೆ ಸೂಕ್ತ ಸಮಯ. ಮಣ್ಣಿನಲ್ಲಿ ಉತ್ತಮ ತೇವಾಂಶವಿದೆ.",
      quickQA: "ಶೀಘ್ರ ಕೃಷಿ ಪ್ರಶ್ನೋತ್ತರ",
      askNow: "ಧ್ವನಿ ಸಹಾಯಕರನ್ನು ಕೇಳಿ",
      mandiHighs: "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮುಖ್ಯಾಂಶಗಳು",
      mandiDesc: "ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್ (100 ಕೆಜಿ) ಸರಾಸರಿ ಬೆಲೆಗಳು",
      allRights: "ಅಗ್ರೋಕನೆಕ್ಟ್ © 2026. ಭಾರತೀಯ ರೈತರ ನೇರ ಸಬಲೀಕರಣಕ್ಕಾಗಿ.",
      marketPriceToggle: "ಸರಕಾರಿ ಮಂಡಿ ಬೆಲೆಗಳು",
      marketplaceToggle: "ರೈತರ ಆನ್ಲೈನ್ ಮಾರುಕಟ್ಟೆ",
      sellCrop: "ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ",
      tipsTitle: "ಸಾವಯವ ಕೃಷಿ ಸಲಹೆಗಳು",
      assistantTab: "ಧ್ವನಿ ಸಹಾಯಕ"
    },
    hi: {
      appName: "एग्रोकनेक्ट",
      slogan: "स्मार्ट कृषि मंच",
      homeTitle: "कृषि डैशबोर्ड",
      welcome: "स्वागत है, किसान भाई!",
      weatherTitle: "मौसम और मिट्टी की स्थिति",
      tempLabel: "वायु तापमान",
      moistureLabel: "मिट्टी नमी",
      rainLabel: "वर्षा की संभावना",
      sowingAdvisory: "सलाह: खरीफ फसलों की बुआई के लिए सही मौसम। मिट्टी में इष्टतम नमी है।",
      quickQA: "कृषि प्रश्न उत्तर",
      askNow: "एग्रोकनेक्ट से पूछें",
      mandiHighs: "मुख्य मण्डी बाजार दरें",
      mandiDesc: "औसत मूल्य प्रति क्विंटल (100 केंचुआ)",
      allRights: "एग्रोकनेक्ट © 2026. भारतीय किसानों का सीधा सशक्तिकरण।",
      marketPriceToggle: "सरकारी मण्डी भाव",
      marketplaceToggle: "किसान सीधा बाजार",
      sellCrop: "फसल सूची पोस्ट करें",
      tipsTitle: "टिकाऊ जैविक खेती के नियम",
      assistantTab: "वॉयस असिस्टेंट"
    }
  };

  const t = strings[currentLang];

  // Backup mock weather for instant load
  const [weather, setWeather] = useState({
    temp: 31,
    moisture: "Good (44%)",
    rain: "15%",
    wind: "11 km/h"
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${darkMode ? 'dark bg-[#18110E] text-[#FCFAF7]' : 'bg-[#FCFAF6] text-[#2F1E19]'}`} id="app_root_layout">
      
      {/* 1. Header Toolbar Panel */}
      <header className={`sticky top-0 z-30 border-b transition-colors shadow-xs ${darkMode ? 'bg-[#211512]/95 border-[rgba(250,241,230,0.1)]' : 'bg-white/95 backdrop-blur-md border-[rgba(211,84,53,0.12)]'}`} id="app_header_bar">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5">
            <div className="bg-[#D35435] p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight text-[#D35435] leading-none">
                {t.appName}
              </h1>
              <p className="text-[10px] font-bold text-[#A96350] mt-0.5 tracking-wider uppercase">
                {t.slogan}
              </p>
            </div>
          </div>

          {/* Right Toolbar controls */}
          <div className="flex items-center gap-3" id="header_toolbar_controls">
            
            {/* Dark Mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition cursor-pointer ${darkMode ? 'bg-[#3A241F]/60 border-[rgba(250,241,230,0.15)] text-amber-350' : 'bg-[#FAF1E6]/60 border-[rgba(211,84,53,0.12)] text-[#D35435] hover:bg-[#FAF1E6]'}`}
              title="Toggle Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <div className={`flex items-center gap-1 p-1 rounded-full border transition ${darkMode ? 'bg-[#3A241F] border-[rgba(250,241,230,0.15)]' : 'bg-[#FAF1E6] border-[rgba(211,84,53,0.12)]'}`} id="header_lang_switcher">
              <Languages className="w-3.5 h-3.5 text-[#D35435] ml-2 shrink-0 opacity-70" />
              
              <button
                onClick={() => setCurrentLang("kn")}
                className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full transition duration-300 ${currentLang === 'kn' ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#D35435] hover:bg-[#D35435]/15'}`}
              >
                KN
              </button>
              
              <button
                onClick={() => setCurrentLang("hi")}
                className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full transition duration-300 ${currentLang === 'hi' ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#D35435] hover:bg-[#D35435]/15'}`}
              >
                HI
              </button>

              <button
                onClick={() => setCurrentLang("en")}
                className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full transition duration-300 ${currentLang === 'en' ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#D35435] hover:bg-[#D35435]/15'}`}
              >
                EN
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* 1.5 Live Mandi Prices Horizontal Sliding Ticker - Terracotta Clay */}
      <div className={`h-11 flex items-center border-b transition-colors overflow-hidden select-none text-xs gap-4 ${darkMode ? 'bg-[#D35435] text-white border-[rgba(250,241,230,0.15)]' : 'bg-[#D35435] text-[#FAF1E6] border-[rgba(211,84,53,0.12)]'}`} id="mandi_prices_marquee_ticker">
        <div className="flex items-center gap-1.5 shrink-0 font-bold uppercase tracking-widest text-[9px] pl-6 py-1 bg-[#D35435] z-10 shadow-[8px_0_12px_rgba(211,84,53,0.9)]">
          <span>Live Mandi Prices</span>
          <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee font-medium py-1">
            <span>Tomato (Bengaluru): ₹4,200/qtn ↑</span>
            <span>Onion (Nashik): ₹2,850/qtn ↓</span>
            <span>Wheat (Indore): ₹2,420/qtn -</span>
            <span>Potato (Agra): ₹1,100/qtn ↑</span>
            <span>Chilli (Guntur): ₹18,400/qtn ↑</span>
            {/* Repeated once for infinite marquee seamlessness */}
            <span>Tomato (Bengaluru): ₹4,200/qtn ↑</span>
            <span>Onion (Nashik): ₹2,850/qtn ↓</span>
            <span>Wheat (Indore): ₹2,420/qtn -</span>
            <span>Potato (Agra): ₹1,100/qtn ↑</span>
            <span>Chilli (Guntur): ₹18,400/qtn ↑</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Page Render Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-24" id="main_content_area">
        
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === "home" && (
          <div className="space-y-6" id="home_dashboard_tab">
            
            {/* Quick Greeting */}
            <div className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-black text-xl text-[#2F1E19] dark:text-[#FAF1E6]">{t.welcome}</h2>
                <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] mt-1 font-medium">Ready your seeds and check instant Mandi pricing today.</p>
              </div>
              <div className="bg-[#FAF1E6] dark:bg-[#3A241F]/80 text-[#D35435] dark:text-[#FAF1E6] px-3.5 py-2 rounded-xl border border-[rgba(211,84,53,0.15)] flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold shadow-2xs">
                <Shield className="w-4 h-4 text-[#D35435] dark:text-[#FAF1E6]" />
                Verified Farmer Account
              </div>
            </div>

            {/* Weather & Soil Advisory Widget */}
            <div className="glass-card p-5 rounded-3xl space-y-4" id="home_weather_widget">
              <div className="flex items-center justify-between border-b border-[rgba(211,84,53,0.12)] pb-2.5">
                <h3 className="font-display font-black text-sm text-[#2F1E19] dark:text-[#FAF1E6] flex items-center gap-1.5">
                  <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin" style={{animationDuration: "25s"}} />
                  {t.weatherTitle}
                </h3>
                <span className="text-[10px] font-bold text-[#D35435] dark:text-[#FAF1E6] bg-[#FAF1E6] dark:bg-[#3A241F] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live Sowing Quality
                </span>
              </div>

              {/* Grid indices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/80 dark:bg-[#3A241F]/40 border border-[rgba(211,84,53,0.12)] p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] text-[#6B4B3E] dark:text-[#C2A398] font-bold uppercase">{t.tempLabel}</span>
                  <p className="text-lg font-mono font-bold text-[#2F1E19] dark:text-[#FAF1E6] flex items-baseline gap-0.5">
                    {weather.temp}°C 
                    <span className="text-[10px] font-sans font-normal text-slate-400">Delhi</span>
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-[#3A241F]/40 border border-[rgba(211,84,53,0.12)] p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] text-[#6B4B3E] dark:text-[#C2A398] font-bold uppercase">{t.moistureLabel}</span>
                  <p className="text-lg font-sans font-extrabold text-[#2F1E19] dark:text-[#FAF1E6]">{weather.moisture}</p>
                </div>

                <div className="bg-white/80 dark:bg-[#3A241F]/40 border border-[rgba(211,84,53,0.12)] p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] text-[#6B4B3E] dark:text-[#C2A398] font-bold uppercase">{t.rainLabel}</span>
                  <p className="text-lg font-mono font-bold text-[#2F1E19] dark:text-[#FAF1E6]">{weather.rain}</p>
                </div>

                <div className="bg-white/80 dark:bg-[#3A241F]/40 border border-[rgba(211,84,53,0.12)] p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] text-[#6B4B3E] dark:text-[#C2A398] font-bold uppercase">Wind velocity</span>
                  <p className="text-lg font-mono font-bold text-[#2F1E19] dark:text-[#FAF1E6]">{weather.wind}</p>
                </div>
              </div>

              {/* Sowing advisory notification comment */}
              <div className="bg-[#FAF1E6] dark:bg-[#3a241f]/50 p-3.5 rounded-2xl border border-[rgba(211,84,53,0.15)] flex items-start gap-2.5 text-xs text-[#D35435] dark:text-[#FAF1E6]">
                <AlertCircle className="w-4.5 h-4.5 text-[#D35435] dark:text-[#FAF1E6] shrink-0 mt-0.5" />
                <p className="font-bold">{t.sowingAdvisory}</p>
              </div>
            </div>

            {/* Quick access launchers split panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Launcher: Voice Assistant */}
              <div 
                onClick={() => setActiveTab("assistant")}
                className="glass-card p-5 rounded-3xl hover:border-[#D35435] shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 flex justify-between items-center group"
              >
                <div className="space-y-2">
                  <span className="p-1 px-2.5 text-[9px] font-bold bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] dark:text-[#FAF1E6] rounded-md uppercase">
                    Speech Assistant
                  </span>
                  <h3 className="font-display font-black text-sm text-[#2F1E19] dark:text-[#FAF1E6] group-hover:text-[#D35435] transition">
                    {t.askNow}
                  </h3>
                  <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] leading-normal max-w-xs font-medium">
                    Press mic and talk in Kannada, Hindi, or English. Get crop cure advice dynamically.
                  </p>
                </div>
                <div className="bg-[#D35435] text-white p-3.5 rounded-xl shadow-md group-hover:scale-105 transition shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Launcher: Crop Rotation Tips */}
              <div 
                onClick={() => setActiveTab("tips")}
                className="glass-card p-5 rounded-3xl hover:border-[#D35435] shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 flex justify-between items-center group"
              >
                <div className="space-y-2">
                  <span className="p-1 px-2.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-md uppercase font-bold">
                    Sustainable Kheti
                  </span>
                  <h3 className="font-display font-black text-sm text-[#2F1E19] dark:text-[#FAF1E6] group-hover:text-[#D35435] transition">
                    Organic farming recipes
                  </h3>
                  <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] leading-normal max-w-xs font-medium">
                    Check out alternate crop rotation protocols, compost mixtures, and bio-manures.
                  </p>
                </div>
                <div className="bg-[#D35435]/90 text-white p-3.5 rounded-xl shadow-md group-hover:scale-105 transition shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Home summary of mandi prices */}
            <div className="glass-card rounded-3xl p-5 space-y-4" id="home_price_highlight">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-black text-[#2F1E19] dark:text-[#FAF1E6] text-sm">
                    {t.mandiHighs}
                  </h3>
                  <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] mt-0.5">{t.mandiDesc}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("market");
                    setMarketSubTab("mandi");
                  }}
                  className="text-xs text-[#D35435] dark:text-[#FAF1E6] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Analyze predictions
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* highlights horizontal slider cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { crop: "🍅 Tomato", price: "₹2,800/qtn", change: "Up +₹450" },
                  { crop: "🌾 Wheat", price: "₹2,350/qtn", change: "Stable" },
                  { crop: "🧅 Red Onion", price: "₹2,600/qtn", change: "Up +₹200" },
                  { crop: "🍚 Basmati Rice", price: "₹5,000/qtn", change: "Up +₹300" }
                ].map((highlight, index) => (
                  <div key={index} className="bg-[#FAF1E6]/40 dark:bg-[#3A241F]/30 border border-[rgba(211,84,53,0.12)] p-3 rounded-2xl space-y-1 text-center">
                    <p className="text-xs font-bold text-[#2F1E19] dark:text-[#FAF1E6]">{highlight.crop}</p>
                    <p className="text-base font-black font-mono text-[#D35435] dark:text-[#FAF1E6]">{highlight.price}</p>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md inline-block">
                      {highlight.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MARKET DASHBOARD */}
        {activeTab === "market" && (
          <div className="space-y-5" id="market_tab_area">
            
            {/* Embedded dual toggle layouts buttons */}
            <div className={`flex p-1 rounded-2xl self-center max-w-sm w-full mx-auto shadow-xs border transition-colors ${darkMode ? 'bg-[#3A241F] border-[rgba(250,241,230,0.15)]' : 'bg-[#FAF1E6]/80 border-[rgba(211,84,53,0.15)]'}`} id="market_sub_nav">
              <button
                onClick={() => setMarketSubTab("mandi")}
                className={`flex-1 text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketSubTab === 'mandi' 
                    ? 'bg-[#D35435] text-white shadow-sm' 
                    : `${darkMode ? 'text-[#FAF1E6]/80 hover:bg-[#201511]' : 'text-[#D35435] hover:bg-[#FAF1E6]'}`
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                {t.marketPriceToggle}
              </button>
              <button
                onClick={() => setMarketSubTab("p2p")}
                className={`flex-1 text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketSubTab === 'p2p' 
                    ? 'bg-[#D35435] text-white shadow-sm' 
                    : `${darkMode ? 'text-[#FAF1E6]/80 hover:bg-[#201511]' : 'text-[#D35435] hover:bg-[#FAF1E6]'}`
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {t.marketplaceToggle}
              </button>
            </div>

            {/* Display sub-component depending on tab */}
            {marketSubTab === "mandi" ? (
              <MarketPrices />
            ) : (
              <Marketplace onGoToSellTab={() => setActiveTab("sell")} />
            )}

          </div>
        )}

        {/* TAB 3: ASSISTANT */}
        {activeTab === "assistant" && (
          <VoiceAssistant 
            currentLang={currentLang}
            setCurrentLang={setCurrentLang}
          />
        )}

        {/* TAB 4: SELL FORM */}
        {activeTab === "sell" && (
          <SellForm 
            onSuccessRedirect={() => {
              // Redirect to marketplace tab after success listing posting
              setActiveTab("market");
              setMarketSubTab("p2p");
            }}
          />
        )}

        {/* TAB 5: TIPS */}
        {activeTab === "tips" && (
          <FarmingTips />
        )}

      </main>

      {/* 3. Global Fixed Bottom Navigation Tab bar (farmers love thumb-friendly bottom navs) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors shadow-lg ${darkMode ? 'bg-[#211512]/95 border-[rgba(250,241,230,0.15)] backdrop-blur-md' : 'bg-white/95 border-[rgba(211,84,53,0.12)] backdrop-blur-md'}`} id="app_bottom_nav">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-around">
          
          {/* Nav Item: Home */}
          <button
            onClick={() => setActiveTab("home")}
            className="flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer"
            id="tab_trigger_home"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition duration-300 ${
              activeTab === 'home' 
                ? 'bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] dark:text-[#FAF1E6] shadow-xs border border-[rgba(211,84,53,0.15)] scale-105' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[#D35435] dark:hover:text-[#FAF1E6]'
            }`}>
              <HomeIcon className="w-5 h-5 shrink-0" />
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-wider transition-colors duration-300 ${activeTab === 'home' ? 'text-[#D35435] dark:text-[#FAF1E6]' : 'text-slate-400'}`}>
              Home
            </span>
          </button>

          {/* Nav Item: Market */}
          <button
            onClick={() => setActiveTab("market")}
            className="flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer"
            id="tab_trigger_market"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition duration-300 ${
              activeTab === 'market' 
                ? 'bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] dark:text-[#FAF1E6] shadow-xs border border-[rgba(211,84,53,0.15)] scale-105' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[#D35435] dark:hover:text-[#FAF1E6]'
            }`}>
              <ShoppingBag className="w-5 h-5 shrink-0" />
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-wider transition-colors duration-300 ${activeTab === 'market' ? 'text-[#D35435] dark:text-[#FAF1E6]' : 'text-slate-400'}`}>
              Market
            </span>
          </button>

          {/* Nav Item: Assistant (Speaker) */}
          <button
            onClick={() => setActiveTab("assistant")}
            className="flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer"
            id="tab_trigger_assistant"
            title="Launch voice bot"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition duration-300 shadow-sm ${
              activeTab === 'assistant' 
                ? 'bg-[#D35435] text-white scale-110 ring-4 ring-[#FAF1E6]' 
                : 'bg-[#D35435]/90 text-white hover:bg-[#D35435]'
            }`}>
              <MessageSquare className="w-5 h-5 shrink-0" />
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-wider transition-colors duration-300 ${activeTab === 'assistant' ? 'text-[#D35435] dark:text-[#FAF1E6]' : 'text-slate-400'}`}>
              Speaker
            </span>
          </button>

          {/* Nav Item: Sell */}
          <button
            onClick={() => setActiveTab("sell")}
            className="flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer"
            id="tab_trigger_sell"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition duration-300 ${
              activeTab === 'sell' 
                ? 'bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] dark:text-[#FAF1E6] shadow-xs border border-[rgba(211,84,53,0.15)] scale-105' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[#D35435] dark:hover:text-[#FAF1E6]'
            }`}>
              <PlusCircle className="w-5 h-5 shrink-0" />
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-wider transition-colors duration-300 ${activeTab === 'sell' ? 'text-[#D35435] dark:text-[#FAF1E6]' : 'text-slate-400'}`}>
              Sell
            </span>
          </button>

          {/* Nav Item: Tips */}
          <button
            onClick={() => setActiveTab("tips")}
            className="flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer"
            id="tab_trigger_tips"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition duration-300 ${
              activeTab === 'tips' 
                ? 'bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] dark:text-[#FAF1E6] shadow-xs border border-[rgba(211,84,53,0.15)] scale-105' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[#D35435] dark:hover:text-[#FAF1E6]'
            }`}>
              <Sprout className="w-5 h-5 shrink-0" />
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-wider transition-colors duration-300 ${activeTab === 'tips' ? 'text-[#D35435] dark:text-[#FAF1E6]' : 'text-slate-400'}`}>
              Organic
            </span>
          </button>

        </div>
      </nav>

      {/* Footer disclaimer summary */}
      <footer className={`py-5 border-t text-center text-[10px] font-mono select-none px-4 mb-20 ${darkMode ? 'bg-[#211512] border-[rgba(250,241,230,0.12)] text-[#A37B70]' : 'bg-[#FAF1E6]/30 border-[rgba(211,84,53,0.12)] text-[#6B4B3E]'}`}>
        <p className="max-w-md mx-auto">{t.allRights}</p>
      </footer>

    </div>
  );
}
