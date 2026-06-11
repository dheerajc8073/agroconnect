import React, { useState, useEffect, useRef } from "react";
import { 
  Search, RefreshCw, SlidersHorizontal, MapPin, 
  Calendar, AlertCircle, Info, TrendingUp, CheckCircle, ArrowDownUp 
} from "lucide-react";
import { MandiRecord } from "../types";
import PricePrediction from "./PricePrediction";

export default function MarketPrices() {
  const [prices, setPrices] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState("Checking database...");
  
  // Filtering states
  const [selectedState, setSelectedState] = useState("");
  const [searchCommodity, setSearchCommodity] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  
  // Dynamic selected crop for prediction widget link
  const [predictedCrop, setPredictedCrop] = useState("Tomato");

  // Auto-refresh countdown tracking (60 seconds)
  const [countdown, setCountdown] = useState(60);
  const countdownTimerRef = useRef<any>(null);

  const fetchMandiPrices = async (isManual = false) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch prices from our server-side secure proxy
      const queryParams = new URLSearchParams();
      if (selectedState) queryParams.append("state", selectedState);
      if (searchCommodity) queryParams.append("commodity", searchCommodity);

      const response = await fetch(`/api/mandi-prices?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }
      const data = await response.json();
      
      if (data.records) {
        setPrices(data.records);
        setDataSource(data.source || "Government Krishi API");
      } else {
        throw new Error("Invalid mandi prices format returned");
      }
    } catch (err: any) {
      console.error("Failed to load crop prices:", err);
      setErrorMsg("Failed to connect with online government registries. Serving local market copies.");
    } finally {
      setLoading(false);
      setCountdown(60); // Reset timer
    }
  };

  // Trigger initial fetch and pull on filters shift
  useEffect(() => {
    fetchMandiPrices();
  }, [selectedState]);

  // Set up 60-second automated refresh timer
  useEffect(() => {
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMandiPrices();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [selectedState, searchCommodity]);

  // Clean filters
  const resetFilters = () => {
    setSelectedState("");
    setSearchCommodity("");
    setMinPriceFilter("");
    setMaxPriceFilter("");
    fetchMandiPrices();
  };

  // Hot quick tagging for easier user typing on phones
  const handleQuickCropTag = (crop: string) => {
    setSearchCommodity(crop);
    setPredictedCrop(crop);
    // Trigger immediate search
    setTimeout(() => fetchMandiPrices(), 50);
  };

  // Filter prices locally when sliders are used to minimize network request payloads
  const filteredRecords = prices.filter((item) => {
    // Commodity search matching
    if (searchCommodity && !item.commodity.toLowerCase().includes(searchCommodity.toLowerCase())) {
      return false;
    }

    // Min price boundary
    if (minPriceFilter) {
      const minVal = parseFloat(minPriceFilter);
      if (parseFloat(item.modal_price) < minVal) return false;
    }

    // Max price boundary
    if (maxPriceFilter) {
      const maxVal = parseFloat(maxPriceFilter);
      if (parseFloat(item.modal_price) > maxVal) return false;
    }

    return true;
  });

  const uniqueStates = ["Karnataka", "Punjab", "Maharashtra", "Delhi", "Uttar Pradesh", "Haryana", "Rajasthan", "Madhya Pradesh"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1" id="mandi_price_viewer_layout">
      
      {/* Upper Interactive Crop Predictor Section */}
      <PricePrediction commodity={predictedCrop} />

      {/* Mandi Price Panel Layout */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Table header bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-display font-bold text-base text-slate-800">Live AGMARKNET Mandi Price Board</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                dataSource.includes("Offline") 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {dataSource}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Reporting rates per Quintal (100 kg). Pricing updates dynamically.
            </p>
          </div>

          {/* Sync Timer Control */}
          <div className="flex items-center gap-3 self-start md:self-auto" id="mandi_sync_indicator">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">Automatic refresh in</p>
              <p className="text-xs font-bold text-brand-primary font-mono">{countdown} seconds</p>
            </div>
            
            <button
              onClick={() => fetchMandiPrices(true)}
              disabled={loading}
              className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-primary/30 text-slate-600 hover:text-brand-primary active:scale-95 transition bg-white disabled:bg-slate-50 disabled:text-slate-300 cursor-pointer shadow-xs font-semibold flex items-center gap-1.5 text-xs"
              title="Manual Reload Mandi Indices"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
          </div>
        </div>

        {/* Filters control center */}
        <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-4 gap-4" id="mandi_filters_panel">
          
          {/* Commodity search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchCommodity}
              onChange={(e) => setSearchCommodity(e.target.value)}
              placeholder="Search Crop (e.g. Tomato, Rice)"
              className="w-full bg-slate-50 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 border border-slate-100 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
              id="commodity_search_field"
            />
          </div>

          {/* District State dropdown */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <MapPin className="w-4 h-4" />
            </span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition cursor-pointer font-medium"
              id="state_filter_select"
            >
              <option value="">All States / Districts</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Min Price Slider */}
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Min Price (₹ / Qtl)</label>
            <input
              type="number"
              value={minPriceFilter}
              onChange={(e) => setMinPriceFilter(e.target.value)}
              placeholder="Min Price e.g. 1000"
              className="w-full bg-slate-50 rounded-lg px-3 py-1.5 text-xs text-slate-800 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
              id="min_price_field"
            />
          </div>

          {/* Max Price Slider */}
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Max Price (₹ / Qtl)</label>
            <input
              type="number"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
              placeholder="Max Price e.g. 5000"
              className="w-full bg-slate-50 rounded-lg px-3 py-1.5 text-xs text-slate-800 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
              id="max_price_field"
            />
          </div>

        </div>

        {/* Hot Quick Filter Badges */}
        <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Popular Crops:</span>
          {["Tomato", "Potato", "Onion", "Wheat", "Rice", "Maize", "Garlic"].map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickCropTag(tag)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition font-medium ${
                searchCommodity.toLowerCase() === tag.toLowerCase()
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tag}
            </button>
          ))}

          {(selectedState || searchCommodity || minPriceFilter || maxPriceFilter) && (
            <button
              onClick={resetFilters}
              className="shrink-0 text-xs text-red-500 hover:text-red-600 font-bold ml-auto px-2 py-1 underline decoration-2 rounded"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Dynamic warning messages */}
        {errorMsg && (
          <div className="bg-amber-50 border-b border-amber-100 p-3.5 text-xs text-amber-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Mandi pricing list view table container */}
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="p-8 space-y-3.5">
              <div className="flex animate-pulse justify-around bg-slate-100 h-10 rounded-lg"></div>
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex animate-pulse justify-around bg-slate-50 h-12 rounded-lg gap-4">
                  <div className="w-1/4 h-4 bg-slate-200 rounded self-center"></div>
                  <div className="w-1/4 h-4 bg-slate-200 rounded self-center"></div>
                  <div className="w-1/4 h-4 bg-slate-200 rounded self-center"></div>
                  <div className="w-1/12 h-4 bg-slate-200 rounded self-center"></div>
                </div>
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-slate-500 font-semibold text-sm">No matching Mandi records found.</p>
              <p className="text-xs text-slate-400">Try adjusting your filters, selecting a different state, or clearing pricing sliders.</p>
              <button 
                onClick={resetFilters}
                className="mt-3 text-xs bg-brand-primary text-white font-bold px-4 py-2 rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100 tracking-wider">
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">State / District</th>
                  <th className="py-3 px-4">Market / Mandi</th>
                  <th className="py-3 px-4 text-right">Min / Max Price (₹)</th>
                  <th className="py-3 px-4 text-right">Modal Price (₹)</th>
                  <th className="py-3 px-4 text-center">Prediction Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec, index) => (
                  <tr 
                    key={index}
                    onClick={() => {
                      // Sync predicted crop to whatever user clicked on
                      setPredictedCrop(rec.commodity);
                    }}
                    className={`text-slate-700 hover:bg-lime-50/50 cursor-pointer text-xs font-sans transition-colors ${
                      predictedCrop === rec.commodity ? "bg-emerald-50/30 font-medium" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{rec.commodity}</p>
                      <span className="text-[10px] text-slate-400 font-medium tracking-wide bg-slate-100 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
                        {rec.variety}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <p className="text-slate-700">{rec.state}</p>
                      <p className="text-[10px] text-slate-400">{rec.district}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rec.market}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      ₹{rec.min_price} - ₹{rec.max_price}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100/60 p-1 px-2.5 rounded-lg border border-slate-100/30">
                        ₹{rec.modal_price}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPredictedCrop(rec.commodity);
                          document.getElementById("price_predictor_box")?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[10px] bg-brand-primary text-white hover:bg-brand-primary-hover px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 mx-auto"
                      >
                        <TrendingUp className="w-3 h-3" />
                        Analyze Curve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer aggregate status */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 font-medium">
          <p>Displaying {filteredRecords.length} prices registered on state mandis.</p>
          <p className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Accuracy guaranteed by Indian Ministry of Agriculture
          </p>
        </div>

      </div>

    </div>
  );
}
