import React, { useState, useEffect } from "react";
import { 
  PlusCircle, MapPin, Layers, Coins, MessageCircle, 
  Search, SlidersHorizontal, User, Sparkles, Filter, Info 
} from "lucide-react";
import { Listing } from "../types";

interface MarketplaceProps {
  onGoToSellTab?: () => void;
}

export default function Marketplace({ onGoToSellTab }: MarketplaceProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error("Error fetching marketplace listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setMaxPrice("");
    setSelectedState("");
  };

  // Extract unique locations state-level for filtering
  const states = Array.from(new Set(listings.map(l => {
    const parts = l.location.split(",");
    return parts[parts.length - 1]?.trim() || "";
  }).filter(Boolean)));

  // Filter listings
  const filteredListings = listings.filter((item) => {
    // Search query Matching Name / Farmer / Description
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.cropName.toLowerCase().includes(q);
      const matchFarmer = item.farmerName.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      if (!matchName && !matchFarmer && !matchLoc && !matchDesc) return false;
    }

    // Crop category filter
    if (selectedType && item.cropType !== selectedType) {
      return false;
    }

    // State location filter
    if (selectedState && !item.location.toLowerCase().includes(selectedState.toLowerCase())) {
      return false;
    }

    // Price ceiling filter
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      if (parseFloat(item.price) > maxVal) return false;
    }

    return true;
  });

  const getWhatsAppLink = (listing: Listing) => {
    // Standardize phone number by removing any non-digits
    let cleanedPhone = listing.phone.replace(/\D/g, "");
    
    // Ensure 10-digit number is prefixed with India country code 91
    if (cleanedPhone.length === 10) {
      cleanedPhone = "91" + cleanedPhone;
    } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      // already has 91
    } else if (cleanedPhone.length > 10) {
      // Just leave as-is or prefix if necessary
    } else {
      // default fallback
      cleanedPhone = "91" + cleanedPhone;
    }

    const message = `Namaskar ${listing.farmerName}, I saw your AgroConnect listing for "${listing.cropName}" (${listing.quantity} available at ₹${listing.price}/kg in ${listing.location}). Is this still available?`;
    return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
  };

  const cropTypes = ["Grain", "Vegetable", "Fruit", "Spices", "Pulses", "Oilseeds", "Other"];

  return (
    <div className="space-y-5 max-w-6xl mx-auto p-1" id="mktp_root_panel">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#3B6D11] to-lime-800 rounded-3xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-6 opacity-10 pointer-events-none">
          <Layers className="w-48 h-48" />
        </div>
        
        <div className="max-w-md space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-lime-900/65 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-lime-100">
            <Sparkles className="w-3.5 h-3.5" />
            100% Peer-to-Peer
          </div>
          <h1 className="font-display font-bold text-xl leading-tight">Farmer-to-Farmer Green Marketplace</h1>
          <p className="text-xs text-lime-50/90 leading-relaxed">
            Eliminate commission brokers. Sell your fresh harvests directly to wholesalers, retailers, or neighboring communities in India!
          </p>
          <div className="pt-2">
            {onGoToSellTab && (
              <button
                onClick={onGoToSellTab}
                className="bg-white text-[#3B6D11] hover:bg-lime-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition duration-300 flex items-center gap-1.5 cursor-pointer"
                id="mktp_banner_sell_btn"
              >
                <PlusCircle className="w-4 h-4" />
                Post Your Farm Crop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="glass-card rounded-3xl p-5 space-y-4" id="mktp_filter_card">
        
        {/* Row 1 search and state */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Key query */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C6E4E] dark:text-[#9FB38F]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop or farmer name..."
              className="w-full bg-[#EAF3DE]/30 dark:bg-[#1E330A]/30 border border-[rgba(59,109,17,0.15)] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#1A2E05] dark:text-[#EAF3DE] focus:outline-none focus:ring-2 focus:ring-[#3B6D11] transition"
              id="mktp_search_query"
            />
          </div>

          {/* Type */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C6E4E] dark:text-[#9FB38F]">
              <Layers className="w-4 h-4" />
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#EAF3DE]/30 dark:bg-[#1E330A]/30 border border-[rgba(59,109,17,0.15)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A2E05] dark:text-[#EAF3DE] focus:outline-none focus:ring-2 focus:ring-[#3B6D11] transition cursor-pointer font-medium"
              id="mktp_crop_type_selector"
            >
              <option value="" className="text-slate-800">All Crop Types</option>
              {cropTypes.map(t => (
                <option key={t} value={t} className="text-slate-800">{t}</option>
              ))}
            </select>
          </div>

          {/* Max Price limit */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C6E4E] dark:text-[#9FB38F]">
              <Coins className="w-4 h-4" />
            </span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Maximum Price (₹ per kg)"
              className="w-full bg-[#EAF3DE]/30 dark:bg-[#1E330A]/30 border border-[rgba(59,109,17,0.15)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A2E05] dark:text-[#EAF3DE] focus:outline-none focus:ring-2 focus:ring-[#3B6D11] transition"
              id="mktp_max_price"
            />
          </div>

        </div>

        {/* Row 2 State tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[rgba(59,109,17,0.12)]">
          <span className="text-[10px] text-[#5C6E4E] dark:text-[#9FB38F] font-bold uppercase mr-1 flex items-center gap-1">
            <Filter className="w-2.5 h-2.5" />
            Origin State:
          </span>
          {["Punjab", "Karnataka", "Maharashtra", "Tamil Nadu", "Haryana"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(selectedState === st ? "" : st)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition duration-300 ${
                selectedState === st 
                  ? 'bg-[#3B6D11] text-white border-[#3B6D11] shadow-xs' 
                  : 'bg-[#EAF3DE]/30 dark:bg-[#1E330A]/30 text-[#5C6E4E] dark:text-[#B2C5A0] border-[rgba(59,109,17,0.15)] hover:bg-[#EAF3DE]/60'
              }`}
            >
              {st}
            </button>
          ))}

          {(searchQuery || selectedType || maxPrice || selectedState) && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Main product card grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="glass-card rounded-3xl overflow-hidden p-3 space-y-3 animate-pulse">
              <div className="h-36 bg-slate-200/50 dark:bg-[#1e330a]/40 rounded-2xl"></div>
              <div className="h-4 bg-slate-200/50 dark:bg-[#1e330a]/40 rounded w-2/3"></div>
              <div className="h-4 bg-slate-200/50 dark:bg-[#1e330a]/40 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200/50 dark:bg-[#1e330a]/40 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 bg-[#EAF3DE]/60 dark:bg-[#1E330A] text-[#3B6D11] rounded-full flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-[#1A2E05] dark:text-[#EAF3DE] font-semibold text-sm">No marketplace postings match your filters.</p>
          <p className="text-xs text-[#5C6E4E] dark:text-[#B2C5A0] leading-normal">
            Be the first to list crops in your area! Complete the quick form on the Sell tab to connect with immediate wholesale buyers.
          </p>
          <button
            onClick={onGoToSellTab}
            className="bg-[#3B6D11] text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-[#2F580E] shadow-xs transition duration-300 inline-block cursor-pointer"
          >
            Create First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="mktp_listing_grid">
          {filteredListings.map((item) => (
            <div 
              key={item.id}
              className="glass-card hover:border-[#3B6D11] rounded-3xl overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group"
              id={`marketplace_card_${item.id}`}
            >
              {/* Image banner */}
              <div className="relative h-40 bg-[#EAF3DE]/20 overflow-hidden shrink-0">
                <img 
                  src={item.imageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400"} 
                  alt={item.cropName} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Crop Type badge overlay */}
                <span className="absolute top-2 left-2 bg-[#1A2E05]/95 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  {item.cropType}
                </span>

                {/* Price element overlay */}
                <div className="absolute bottom-2 right-2 bg-[#3B6D11] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs font-mono flex items-baseline gap-0.5 leading-none">
                  ₹{item.price}
                  <span className="text-[10px] font-normal font-sans opacity-90">/kg</span>
                </div>
              </div>

              {/* Card body content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                   <h3 className="font-display font-bold text-sm text-[#1A2E05] dark:text-[#EAF3DE] line-clamp-1 leading-snug group-hover:text-[#3B6D11] transition">
                     {item.cropName}
                  </h3>
                  
                  {/* Farmer profile and origin */}
                  <div className="flex items-center gap-1 text-[11px] text-[#5C6E4E] dark:text-[#B2C5A0] mt-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium mr-1.5 line-clamp-1">{item.farmerName}</span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0"></span>
                    <MapPin className="w-3 h-3 text-[#3B6D11] shrink-0 ml-1" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <p className="text-xs text-[#5C6E4E] dark:text-[#9FB38F] mt-2.5 line-clamp-2 leading-relaxed">
                    {item.description || "Fresh crop available now for harvest and pick-up."}
                  </p>
                </div>

                {/* Foot indicators */}
                <div className="pt-3.5 mt-3 border-t border-[rgba(59,109,17,0.12)] flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[9px] text-[#5C6E4E] dark:text-[#9FB38F] font-bold uppercase">STOCK QTY</p>
                    <p className="text-xs font-bold text-[#1A2E05] dark:text-[#EAF3DE] font-mono mt-0.5">{item.quantity}</p>
                  </div>

                  {/* Immediate WhatsApp link */}
                  <a
                    href={getWhatsAppLink(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 font-bold text-xs px-3 py-2 rounded-xl border border-emerald-200/50 transition cursor-pointer"
                    id={`wa_link_button_${item.id}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-100" />
                    Contact
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Sustainable marketplace guidelines */}
      <div className="bg-[#EAF3DE]/30 dark:bg-[#1E330A]/20 p-4.5 rounded-2xl border border-[rgba(59,109,17,0.12)] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#3B6D11] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#5C6E4E] dark:text-[#B2C5A0] leading-normal">
          <p className="font-semibold text-[#1A2E05] dark:text-[#EAF3DE]">Secure Direct Trade Agreement Policy</p>
          <p className="mt-0.5">
            AgroConnect provides contact linking capabilities purely for Indian farmers. We process zero trade commissions. Buyers and sellers should confirm quality parameters, grade certification, transport arrangements, and bank accounts prior to cargo dispatch. Do not send deposits to unknown third-parties.
          </p>
        </div>
      </div>

    </div>
  );
}
