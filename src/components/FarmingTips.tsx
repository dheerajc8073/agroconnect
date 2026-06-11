import React, { useState, useEffect } from "react";
import { 
  Leaf, Droplet, Sprout, Layers, Compass, HelpCircle, 
  Sparkles, Loader2, BookOpen, Sunrise, Check, ChevronRight, AlertCircle 
} from "lucide-react";

export default function FarmingTips() {
  const [plannerCrop, setPlannerCrop] = useState("");
  const [plannerResult, setPlannerResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "organic" | "water" | "rotation" | "soil">("all");

  const currentMonthIdx = new Date().getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonth = monthNames[currentMonthIdx];

  const getSeasonalAdvisory = (monthIdx: number) => {
    // Determine Kharif (June-October), Rabi (November-February), Zaid (March-May) advice
    if (monthIdx >= 5 && monthIdx <= 9) {
      return {
        season: "Kharif sowing (Monsoon Season)",
        crops: "Paddy, Maize, Cotton, Soybean, Tur",
        tips: [
          "Avoid direct nitrogen fertilizer application during excessive heavy downpours to prevent environmental runoff.",
          "Check field bunds to lock monsoon stormwater, reducing supplemental tube-well pumping hours.",
          "Sow seeds only after receiving more than 50-60mm of cumulative rainfall for optimal root moisture."
        ]
      };
    } else if (monthIdx >= 10 || monthIdx <= 1) {
      return {
        season: "Rabi sowing (Winter Crop Season)",
        crops: "Wheat, Mustard, Chickpea, Potato, Barley",
        tips: [
          "Execute light micro-irrigation at root-crown initiation stage (approx 20-22 days of sowing) for superior grain counts.",
          "Implement organic mulch using paddy residue/wheat straw to insulate seeds against freezing nighttime air.",
          "Prevent seed-borne loose smut in Wheat by treating with Trichoderma powder (10g / kg)."
        ]
      };
    } else {
      return {
        season: "Zaid summer sowing (Short Dry Season)",
        crops: "Moong dhal, Cucumbers, Watermelon, Groundnut, Vegetables",
        tips: [
          "Focus on early morning sprinkler runs to protect delicate leafy vines from afternoon heatwaves.",
          "Utilize organic neem powder mixed into weeding soil as a cooling deterrent for soil mites.",
          "Implement high-density drip piping paths to reduce standard evaporative transpiration losses."
        ]
      };
    }
  };

  const adaptiveAdvisory = getSeasonalAdvisory(currentMonthIdx);

  // Call assistant proxy to formulate crop plans
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerCrop.trim()) return;

    setIsGenerating(true);
    setPlannerResult(null);

    const promptMessage = `Provide 4 short, highly practical, bullet-points-only guidelines on organic and sustainable kheti (farming) specifically for growing: ${plannerCrop}. Mention fertilizer choice, water saving, and organic pest prevention. Keep language english, simple, clear, and direct.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: promptMessage, lang: "en" })
      });

      if (res.ok) {
        const data = await res.json();
        setPlannerResult(data.response);
      } else {
        throw new Error();
      }
    } catch (err) {
      setPlannerResult("Failed to generate plan. Please try again when server is online.");
    } finally {
      setIsGenerating(false);
    }
  };

  const staticTips = [
    {
      id: "1",
      category: "organic",
      title: "Jeevamrutha Organic Bio-Fertilizer",
      summary: "Homemade soil health enhancer using local cow products.",
      steps: [
        "Take 10kg local desi cow dung and 10L desi cow urine.",
        "Add 2kg jaggery (organic sugar), 2kg pulse powder, and 1kg forest soil.",
        "Mix in 200L of fresh water in a shaded drum plastic cylinder.",
        "Stir twice daily for 7 days. Dilute 1:10 and sprinkle directly on base of soil."
      ],
      icon: Leaf,
      benefit: "Enhances soil microbial counts, fully replacing costly synthetic NPK chemicals."
    },
    {
      id: "2",
      category: "water",
      title: "Sustainable System of Rice Intensification (SRI)",
      summary: "90% seed saving and 40% water conservation for paddy farmers.",
      steps: [
        "Sow young seedlings (10-12 days old) rather than aged nursery ones.",
        "Plant single seedlings per hill with wide grid alignment instead of dense bunches.",
        "Conduct alternate dry and wet irrigation cycles, avoiding constant stagnant flooding.",
        "Use manual rotary weeders to aerate top mud and suppress soil pests."
      ],
      icon: Droplet,
      benefit: "Saves massive pumping electricity, water table reserves, and boosts harvest weight by 20%."
    },
    {
      id: "3",
      category: "rotation",
      title: "Pigeon Pea & Maize Intercropping Rotation",
      summary: "Harness atmospheric nitrogen directly into Maize crops.",
      steps: [
        "Plant 2 rows of Pigeon Pea (Tur dhal) for every 4 rows of Maize (Maize/Makka).",
        "Legume roots develop symbiotic nodules that absorb nitrogen gas from air.",
        "Post-harvest, leaves and stems of Pigeon Peas double as organic soil manure.",
        "Rotate fields next cycle with deep-rooted oilseeds to keep insects guessing."
      ],
      icon: Sprout,
      benefit: "Safeguards fields from single-crop failure and minimizes direct nitrogen fertilizer cost."
    },
    {
      id: "4",
      category: "soil",
      title: "Pond Silt Application & Mulching",
      summary: "Add natural minerals from dry local river lake beds back to clay fields.",
      steps: [
        "Collect black clay silt from dried local village lakes during summer nights.",
        "Spread 5-10 trolley trips per acre on dried clay soils.",
        "Incorporate wheat straw or dry sugarcane trash to create a 3-inch top mulching layer.",
        "Reduces summer soil temperature, maximizing earthworm biological activity."
      ],
      icon: Compass,
      benefit: "Boosts water retaining capacity by up to 50%, ensuring crop safety during dry spells."
    }
  ];

  const filteredTips = activeCategory === "all" ? staticTips : staticTips.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1" id="tips_layout_root">
      
      {/* 1. Dynamic seasonal advisory overlay based on client calendar */}
      <div className="bg-amber-50/80 dark:bg-[#3A241F]/40 rounded-3xl p-5 border border-amber-200/40 dark:border-[rgba(211,84,53,0.15)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-150 dark:bg-[#3A241F] text-amber-850 dark:text-amber-300 p-2.5 rounded-xl shrink-0">
            <Sunrise className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-black text-sm text-[#2F1E19] dark:text-[#FAF1E6] flex items-center gap-1.5 leading-snug">
              Seasonal Advisory — {currentMonth} Calendar
            </h2>
            <p className="text-xs text-[#2F1E19] dark:text-[#E2CDAF] font-bold mt-1">
              {adaptiveAdvisory.season} | Suitable Crops: <span className="text-[#D35435] font-extrabold">{adaptiveAdvisory.crops}</span>
            </p>
            <ul className="mt-2 space-y-1.5">
              {adaptiveAdvisory.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-[#2F1E19]/80 dark:text-[#FCFAF7]/80 flex items-start gap-1.5 leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-[#D35435] shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Live AI Green Plan generator */}
      <div className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6" id="ai_tips_architect">
        
        {/* Planner Left text */}
        <div className="md:col-span-1 space-y-3">
          <span className="p-1 px-2 text-[10px] bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] font-black rounded uppercase tracking-wide inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D35435]" />
            AI Farming Consultant
          </span>
          <h2 className="font-display font-black text-base text-[#2F1E19] dark:text-[#FAF1E6]">Generate Your Organic Farm Planner</h2>
          <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] leading-relaxed">
            Type any Indian crop (e.g., Mustard, Chilli, Turmeric, Garlic) to get instant bespoke sustainable checklists.
          </p>
          
          <form onSubmit={handleGeneratePlan} className="space-y-2.5 pt-2">
            <input
              type="text"
              value={plannerCrop}
              onChange={(e) => setPlannerCrop(e.target.value)}
              placeholder="Enter crop (e.g. Chilli)"
              required
              className="w-full bg-[#FCFAF6] dark:bg-[#1E1310] rounded-xl px-4 py-2.5 text-xs text-[#2F1E19] dark:text-[#FCFAF7] placeholder-[#6B4B3E]/60 border border-[rgba(211,84,53,0.15)] focus:outline-none focus:ring-2 focus:ring-[#D35435] transition"
            />
            <button
              type="submit"
              disabled={isGenerating || !plannerCrop}
              className="w-full py-2 bg-brand-primary hover:bg-[#AF3F24] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Consulting database...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Request Custom Advice
                </>
              )}
            </button>
          </form>
        </div>

        {/* Planner Right outputs */}
        <div className="md:col-span-2 bg-[#FCFAF6]/60 dark:bg-[#1E1310]/60 rounded-2xl p-4 border border-[rgba(211,84,53,0.1)] flex flex-col justify-center min-h-[160px]">
          {isGenerating ? (
            <div className="space-y-2.5 p-2 flex flex-col justify-center items-center py-6">
              <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">Formulating organic NPK and irrigation targets for {plannerCrop}...</p>
            </div>
          ) : plannerResult ? (
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-1">
                <Leaf className="w-4 h-4 text-brand-primary" />
                Sustainable Kheti Model: {plannerCrop}
              </h3>
              <div className="text-xs text-[#2F1E19] dark:text-[#FCFAF7] leading-relaxed whitespace-pre-line bg-white dark:bg-[#2F1E19] p-4 rounded-xl border border-[rgba(211,84,53,0.12)] shadow-2xs font-sans font-medium">
                {plannerResult}
              </div>
              <p className="text-[10px] text-slate-400 text-right leading-none">Powered by AgroConnect OpenRouter AI</p>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 space-y-1">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300 pointer-events-none" />
              <p className="text-xs font-semibold">Bespoke agricultural guides will appear here.</p>
              <p className="text-[10px]">Provide a crop name to trigger model analyses.</p>
            </div>
          )}
        </div>

      </div>

      {/* 3. Sustainable category filters */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display font-black text-base text-[#2F1E19] dark:text-[#FAF1E6]">Krishi Sustainable Knowledge Bank</h2>
            <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] mt-0.5">Explore detailed step-by-step preparations for offline success</p>
          </div>
          
          <div className="flex items-center gap-1 bg-[#FAF1E6] dark:bg-[#3A241F] p-0.5 rounded-xl border border-[rgba(211,84,53,0.12)]" id="tips_filters">
            {[
              { id: "all", label: "All Topics" },
              { id: "organic", label: "Organic" },
              { id: "water", label: "Water Saving" },
              { id: "rotation", label: "Rotation" },
              { id: "soil", label: "Soil Health" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${activeCategory === cat.id ? 'bg-[#D35435] text-white shadow-xs' : 'text-[#6B4B3E] dark:text-[#DFA695] hover:text-[#D35435]'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories checklist list layout grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="static_best_practices">
          {filteredTips.map((tip) => {
            const IconComp = tip.icon;
            return (
              <div 
                key={tip.id}
                className="glass-card rounded-3xl p-5 hover:border-brand-primary/40 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Title heading */}
                  <div className="flex items-center gap-2.5">
                    <div className="bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] p-2 rounded-lg">
                      <IconComp className="w-5 h-5 text-[#D35435] dark:text-[#FAF1E6]" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm text-[#2F1E19] dark:text-[#FAF1E6]">{tip.title}</h4>
                      <p className="text-[10px] text-[#D35435] font-black tracking-wide uppercase">{tip.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] italic mt-1 leading-normal">
                    &quot;{tip.summary}&quot;
                  </p>

                  {/* Progressive implementation checkpoints */}
                  <div className="space-y-1.5 pt-2">
                    {tip.steps.map((st, i) => (
                      <p key={i} className="text-xs text-[#2F1E19]/85 dark:text-[#FCFAF7]/85 flex items-start gap-1.5 leading-relaxed">
                        <span className="font-mono text-[9px] font-bold bg-[#FAF1E6] dark:bg-[#3A241F] text-[#D35435] dark:text-[#FAF1E6] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {st}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3.5 mt-4 border-t border-[rgba(211,84,53,0.12)] bg-[#FAF1E6]/40 dark:bg-[#3A241F]/40 -mx-5 -mb-5 p-4 rounded-b-3xl">
                  <p className="text-[10px] text-[#2F1E19] dark:text-[#FCFAF7] flex items-start gap-1.5 leading-relaxed">
                    <span className="font-extrabold underline text-brand-primary uppercase shrink-0">Krishi Benefit:</span>
                    <span className="font-semibold">{tip.benefit}</span>
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
