import React, { useState } from "react";
import { 
  Plus, Coins, Phone, User, MapPin, Layers, Loader2, 
  Sparkles, AlertCircle, CheckCircle, ArrowRight, Image 
} from "lucide-react";
import { Listing } from "../types";

interface SellFormProps {
  onSuccessRedirect: () => void;
}

export default function SellForm({ onSuccessRedirect }: SellFormProps) {
  // Form fields
  const [cropName, setCropName] = useState("");
  const [cropType, setCropType] = useState("Grain");
  const [farmerName, setFarmerName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPresetImage, setSelectedPresetImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // High quality Unsplash farm templates to aid fast listing uploading
  const presetImages = [
    { label: "🌾 Paddy / Rice", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400" },
    { label: "🍅 Tomatoes", url: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400" },
    { label: "🧅 Onions", url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa630?auto=format&fit=crop&q=80&w=400" },
    { label: "🥔 Potatoes", url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400" },
    { label: "🌶️ Chillies / Peppers", url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400" },
    { label: "🥭 Fruits / General", url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Form inputs validation parameters
    if (!cropName.trim()) return setErr("Please specify crop name.");
    if (!farmerName.trim()) return setErr("Please state farmer name.");
    if (!quantity.trim()) return setErr("Please enter the available stock volume (quantity).");
    
    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      return setErr("Please provide a valid price per kg greater than 0.");
    }

    // Phone index parameters validation
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return setErr("Please enter a valid 10-digit Indian Mobile phone number.");
    }

    if (!location.trim()) {
      return setErr("Please supply harvest location (e.g. Mandya, Karnataka).");
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName,
          cropType,
          farmerName,
          quantity,
          price: priceVal.toString(),
          phone: cleanPhone,
          location,
          description,
          imageUrl: selectedPresetImage || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400"
        })
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      setSuccess(true);
      
      // Reset form variables
      setCropName("");
      setFarmerName("");
      setQuantity("");
      setPrice("");
      setPhone("");
      setLocation("");
      setDescription("");
      setSelectedPresetImage("");

      // Trigger redirect after a short visual delay
      setTimeout(() => {
        setSuccess(false);
        onSuccessRedirect();
      }, 1800);

    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not post crop listing. Please verify server connection.");
    } finally {
      setLoading(false);
    }
  };

  const setErr = (text: string) => {
    setErrorMessage(text);
    setLoading(false);
  };

  const cropTypes = ["Grain", "Vegetable", "Fruit", "Spices", "Pulses", "Oilseeds", "Other"];

  return (
    <div className="max-w-xl mx-auto p-1" id="sell_form_layout">
      
      <div className="glass-card rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Heading information text */}
        <div>
          <h2 className="font-display font-black text-lg text-[#2F1E19] dark:text-[#FAF1E6] flex items-center gap-1.5 leading-snug">
            <Plus className="w-5 h-5 text-[#D35435]" />
            Sell Your Harvest Direct
          </h2>
          <p className="text-xs text-[#6B4B3E] dark:text-[#DFA695] mt-1 leading-relaxed">
            Fill out this quick form. Your crop will immediately appear on the AgroConnect market feed. Buyers will contact you directly on WhatsApp!
          </p>
        </div>

        {/* Success Modal Notification overlay */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-xs text-emerald-800">Crop Posted Successfully!</p>
              <p className="text-[11px] text-emerald-600">Redirecting you to the market board to view post...</p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 animate-pulse ml-auto" />
          </div>
        )}

        {/* Failure notifications banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-100 p-3.5 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Check form fields:</p>
              <p className="text-red-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Input form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="crop_upload_form">
          
          {/* Section: Crop details */}
          <div className="space-y-3.5">
            <h3 className="text-[10px] text-[#D35435] dark:text-[#E2CDAF] font-bold uppercase tracking-wider border-b border-[rgba(211,84,53,0.12)] pb-1">1. Crop Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Crop Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  Crop name *
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Basmati Rice, Red Chilli"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
                  id="form_crop_name"
                />
              </div>

              {/* Crop Category */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Category *
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white cursor-pointer transition"
                  id="form_crop_type"
                >
                  {cropTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Available volume stock */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5">
                  Available Quantity *
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 5000 kg, 3 Tonnes"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
                  id="form_crop_qty"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  Price (₹ per kg) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 45"
                  required
                  min="1"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
                  id="form_crop_price"
                />
              </div>

            </div>
          </div>

          {/* Section: Farmer Contact details */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-[10px] text-[#D35435] dark:text-[#E2CDAF] font-bold uppercase tracking-wider border-b border-[rgba(211,84,53,0.12)] pb-1">2. Farmer & Contact Info</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Farmer Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Farmer Name *
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
                  id="form_farmer_name"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit Mobile e.g. 9876543210"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
                  id="form_farmer_phone"
                />
              </div>

            </div>

            {/* Location */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Mandi / Farm Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mandya, Karnataka"
                required
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition"
                id="form_farmer_location"
              />
            </div>
          </div>

          {/* Section: Description & presets */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-[10px] text-[#D35435] dark:text-[#E2CDAF] font-bold uppercase tracking-wider border-b border-[rgba(211,84,53,0.12)] pb-1">3. Crop Photo & Details</h3>
            
            {/* Description comment */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 mb-1.5">
                Description / Condition
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe moisture level, seed variety, post-harvest drying status, organic certifications..."
                rows={3}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white transition resize-none"
                id="form_crop_desc"
              />
            </div>

            {/* Photo presetting triggers */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-slate-400" />
                Select Photo Accent / Preset image *
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="preset_image_selector">
                {presetImages.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setSelectedPresetImage(p.url)}
                    className={`p-2 rounded-lg text-xs font-medium border text-left transition relative flex items-center gap-2 overflow-hidden ${
                      selectedPresetImage === p.url
                        ? 'bg-lime-50 text-brand-primary border-brand-primary ring-2 ring-brand-primary/10'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate flex-1 relative z-10">{p.label}</span>
                    <span className="h-6 w-6 rounded overflow-hidden shrink-0 block relative z-10">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Final listing creation upload buttons triggers */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2.5 font-bold text-xs text-white bg-brand-primary hover:bg-brand-primary-hover active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              id="form_submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Publishing on AgroConnect...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Publish Crop Listing
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
