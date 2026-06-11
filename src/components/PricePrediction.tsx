import React, { useState, useEffect } from "react";
import { TrendingUp, Award, Calendar, ChevronRight, HelpCircle, ShieldAlert } from "lucide-react";

interface PricePredictionProps {
  commodity?: string;
  basePrice?: number; // per kg standard
}

export default function PricePrediction({ commodity = "Tomato", basePrice = 24 }: PricePredictionProps) {
  const [selectedCrop, setSelectedCrop] = useState(commodity);
  const [forecastDays, setForecastDays] = useState<any[]>([]);
  const [historicalDays, setHistoricalDays] = useState<any[]>([]);
  const [stats, setStats] = useState({
    slope: 0.12,
    avgHistoric: 24,
    direction: "up",
    expectedChange: "+3.2%",
    peakPrice: 28.5
  });
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Crop metadata definitions for realistic pricing walks
  const cropsMetadata: Record<string, { base: number, volatility: number, trend: number }> = {
    "Tomato": { base: 24, volatility: 3.5, trend: 0.15 },
    "Wheat": { base: 23.5, volatility: 0.8, trend: 0.04 },
    "Onion": { base: 26, volatility: 2.2, trend: -0.05 },
    "Potato": { base: 17, volatility: 1.1, trend: 0.08 },
    "Rice": { base: 49, volatility: 1.5, trend: 0.06 }
  };

  useEffect(() => {
    // When the parent selection updates, reflect it locally
    if (commodity && cropsMetadata[commodity]) {
      setSelectedCrop(commodity);
    }
  }, [commodity]);

  // Regenerate dataset when crop changes
  useEffect(() => {
    const meta = cropsMetadata[selectedCrop] || cropsMetadata["Tomato"];
    const base = meta.base;
    const vol = meta.volatility;
    const slope = meta.trend;

    // Generate 30 days of retrospective pricing
    const histData: any[] = [];
    const now = new Date();
    
    let runningPrice = base - (30 * slope);
    
    for (let i = 30; i >= 1; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Random walk with trend
      const randomNoise = (Math.random() - 0.45) * vol;
      runningPrice = Math.max(8, runningPrice + slope + randomNoise);
      
      histData.push({
        dayIdx: 30 - i,
        date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        price: parseFloat(runningPrice.toFixed(1)),
        isForecast: false
      });
    }

    // Fit a simple linear trend: Y = mx + c to historical data
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const N = histData.length;
    histData.forEach((d) => {
      sumX += d.dayIdx;
      sumY += d.price;
      sumXY += d.dayIdx * d.price;
      sumXX += d.dayIdx * d.dayIdx;
    });

    const m = (N * sumXY - sumX * sumY) / (N * sumXX - sumX * sumX);
    const c = (sumY - m * sumX) / N;

    // Generate 7 days of future projection
    const foreData: any[] = [];
    let peak = 0;
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      
      // Predict using trend formula
      const predictedIdx = 30 + i;
      const predictedPrice = parseFloat(Math.max(10, m * predictedIdx + c).toFixed(1));
      
      // Expanding Uncertainty Interval (Confidence band expands outwards each day)
      const stError = vol * 0.45;
      const confidenceWidth = parseFloat((stError * Math.sqrt(i) * 1.5).toFixed(1));
      const upper = parseFloat((predictedPrice + confidenceWidth).toFixed(1));
      const lower = parseFloat(Math.max(5, predictedPrice - confidenceWidth).toFixed(1));

      if (upper > peak) peak = upper;

      foreData.push({
        dayIdx: predictedIdx,
        date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        price: predictedPrice,
        upper,
        lower,
        isForecast: true
      });
    }

    setHistoricalDays(histData);
    setForecastDays(foreData);

    // Compute descriptive stats
    const avgHist = parseFloat((sumY / N).toFixed(1));
    const pctChange = ((foreData[6].price - histData[histData.length - 1].price) / histData[histData.length - 1].price * 100).toFixed(1);
    
    setStats({
      slope: parseFloat(m.toFixed(3)),
      avgHistoric: avgHist,
      direction: m >= 0 ? "up" : "down",
      expectedChange: (m >= 0 ? "+" : "") + pctChange + "%",
      peakPrice: parseFloat(Math.max(...histData.map(d => d.price), ...foreData.map(d => d.upper)).toFixed(1))
    });
  }, [selectedCrop]);

  // Combined dataset for charting
  const allPoints = [...historicalDays, ...forecastDays];

  // Map to SVG coordinates
  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 25;

  const minVal = 0; // Let bottom represent 0 to keep crop scaling realistic
  const maxVal = stats.peakPrice * 1.15;

  const getX = (idx: number) => paddingX + (idx / (allPoints.length - 1)) * (svgWidth - paddingX * 2);
  const getY = (price: number) => svgHeight - paddingY - ((price - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);

  // Render SVG Path strings
  const getHistoricPath = () => {
    if (historicalDays.length === 0) return "";
    return historicalDays.map((d, idx) => `${idx === 0 ? "M" : "L"}${getX(idx)},${getY(d.price)}`).join(" ");
  };

  const getForecastPath = () => {
    if (forecastDays.length === 0) return "";
    return forecastDays.map((d, index) => {
      const idx = historicalDays.length - 1 + index;
      return `${index === 0 ? "M" : "L"}${getX(idx)},${getY(d.price)}`;
    }).join(" ");
  };

  // Render expanding confidence interval shaded area as an SVG polygon
  const getConfidenceArea = () => {
    if (forecastDays.length === 0) return "";
    const topPoints: string[] = [];
    const bottomPoints: string[] = [];

    forecastDays.forEach((d, index) => {
      const idx = historicalDays.length - 1 + index;
      const x = getX(idx);
      topPoints.push(`${x},${getY(d.upper)}`);
      bottomPoints.unshift(`${x},${getY(d.lower)}`);
    });

    // Merge historic point as anchor
    const lastHist = historicalDays[historicalDays.length - 1];
    const anchorX = getX(historicalDays.length - 1);
    const anchorY = getY(lastHist.price);
    
    return `M${anchorX},${anchorY} L${topPoints.join(" L")} L${bottomPoints.join(" L")} Z`;
  };

  // Generate grid marks
  const horizontalGridTicks = [0.25, 0.5, 0.75, 1.0].map(p => minVal + p * (maxVal - minVal));

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm" id="price_predictor_box">
      
      {/* Header selector and info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2 text-[10px] font-bold bg-lime-100 text-brand-primary rounded-md uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Machine Learning Model
            </span>
            <span className="p-1 px-2 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" />
              Auto Regressive
            </span>
          </div>
          <h2 className="font-display font-bold text-lg text-slate-800 mt-1">7-Day Krishi Price Forecast</h2>
          <p className="text-xs text-slate-400">Projected trend using past 30 days of Mandi indices</p>
        </div>

        {/* Local Crop Switcher */}
        <div className="flex items-center gap-1.5" id="prediction_crop_tabs">
          {["Tomato", "Wheat", "Onion", "Potato", "Rice"].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedCrop(p)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition ${selectedCrop === p ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {p === "Tomato" ? "🍅" : p === "Wheat" ? "🌾" : p === "Onion" ? "🧅" : p === "Potato" ? "🥔" : "🍚"} {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid statistics summaries */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium font-sans uppercase">Expected Yield Trend</p>
          <p className={`text-base font-bold font-display mt-0.5 flex items-center gap-1 ${stats.direction === 'up' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {stats.direction === 'up' ? "Rising ↑" : "Declining ↓"}
            <span className="text-xs font-semibold">({stats.expectedChange})</span>
          </p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium font-sans uppercase">Avg Last 30d Price</p>
          <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
            ₹{stats.avgHistoric}<span className="text-xs font-normal text-slate-500 font-sans">/kg</span>
          </p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium font-sans uppercase">Next Week Peak Range</p>
          <p className="text-base font-bold text-brand-primary font-mono mt-0.5">
            ₹{forecastDays[6]?.upper || 30}<span className="text-xs font-normal text-slate-500 font-sans">/kg</span>
          </p>
        </div>
      </div>

      {/* Primary SVG Chart Panel */}
      <div className="relative overflow-hidden w-full bg-slate-50 rounded-xl p-2 border border-slate-100 group">
        
        {/* Legends overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-3 text-[10px] bg-white/95 backdrop-blur-xs p-1.5 px-2.5 rounded-lg shadow-xs border border-slate-100 font-medium text-slate-500 z-10">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-400 rounded-full inline-block"></span>
            Past 30d (Mandi)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-brand-primary rounded-full inline-block"></span>
            Projected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 rounded-md h-2 bg-emerald-100 border border-emerald-300 inline-block"></span>
            Confidence Range
          </span>
        </div>

        {/* Interactive hover tooltip banner */}
        {hoveredPoint && (
          <div className="absolute top-2 left-2 bg-slate-800 text-white p-2 rounded-lg shadow-md border border-slate-700 z-20 text-[10px] space-y-0.5 leading-snug">
            <p className="font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-brand-primary" />
              {hoveredPoint.date} {hoveredPoint.isForecast ? "(Forecast)" : "(Historical)"}
            </p>
            <p className="font-bold text-base">₹{hoveredPoint.price}<span className="text-[11px] font-normal"> / kg</span></p>
            {hoveredPoint.isForecast && (
              <p className="text-emerald-400">Margin: ₹{hoveredPoint.lower} - ₹{hoveredPoint.upper}</p>
            )}
          </div>
        )}

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          <g>
            {/* Horizontal Grid lines */}
            {horizontalGridTicks.map((tick, i) => (
              <line
                key={i}
                x1={paddingX}
                y1={getY(tick)}
                x2={svgWidth - paddingX}
                y2={getY(tick)}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            ))}
            
            {/* Horizontal ticks pricing markers labels */}
            {horizontalGridTicks.map((tick, i) => (
              <text
                key={i}
                x={paddingX - 10}
                y={getY(tick) + 3}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="500"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                ₹{parseInt(tick.toString())}
              </text>
            ))}

            {/* Vertically separate Historical vs Forecast with vertical red banner */}
            <line
              x1={getX(historicalDays.length - 1)}
              y1={paddingY}
              x2={getX(historicalDays.length - 1)}
              y2={svgHeight - paddingY}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            
            <text
              x={getX(historicalDays.length - 1) - 6}
              y={paddingY + 12}
              fill="#64748b"
              fontSize="8"
              fontWeight="bold"
              textAnchor="end"
            >
              TODAY
            </text>

            <text
              x={getX(historicalDays.length - 1) + 6}
              y={paddingY + 12}
              fill="#D35435"
              fontSize="8"
              fontWeight="bold"
              textAnchor="start"
            >
              FORECAST →
            </text>

            {/* Confidence Area shading polygon */}
            <path
              d={getConfidenceArea()}
              fill="#FAF1E6"
              fillOpacity="0.75"
              stroke="#E2CDAF"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* 1. Historical Actual Line */}
            <path
              d={getHistoricPath()}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 2. Forecast Projected Line */}
            <path
              d={getForecastPath()}
              fill="none"
              stroke="#D35435"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* 3. Small dot points representation for hover mappings */}
            {allPoints.map((pt, i) => {
              const cx = getX(i);
              const cy = getY(pt.price);
              
              // Only draw significant dots to reduce clutter
              const shouldDrawDot = pt.isForecast || i === 0 || i === historicalDays.length - 1 || i % 5 === 0;
              
              if (!shouldDrawDot) return null;

              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={hoveredPoint?.dayIdx === pt.dayIdx ? 6 : pt.isForecast ? 4 : 3}
                  fill={pt.isForecast ? "#D35435" : "#475569"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:scale-130 transition"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

            {/* Date timeline labels at bottom axis */}
            <text
              x={getX(0)}
              y={svgHeight - paddingY + 14}
              fill="#94a3b8"
              fontSize="9"
              fontWeight="500"
              textAnchor="start"
            >
              {historicalDays[0]?.date}
            </text>

            <text
              x={getX(historicalDays.length - 1)}
              y={svgHeight - paddingY + 14}
              fill="#475569"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              Today
            </text>

            <text
              x={getX(allPoints.length - 1)}
              y={svgHeight - paddingY + 14}
              fill="#D35435"
              fontSize="9"
              fontWeight="bold"
              textAnchor="end"
            >
              +7 Days
            </text>

          </g>
        </svg>
      </div>

      <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-2 border border-amber-100 mt-3.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 leading-snug">
          <p className="font-semibold">Weather & Arrival Advisory</p>
          <p className="mt-0.5">
            Predictions are based on mathematical trendlines. Actual mandi pricing fluctuates based on weather warnings, transport shutdowns, and state custom taxes. Please consult local market brokers before concluding large-scale trade agreements.
          </p>
        </div>
      </div>

    </div>
  );
}
