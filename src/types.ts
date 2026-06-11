export interface Listing {
  id: string;
  cropName: string;
  farmerName: string;
  quantity: string;
  price: string; // Price per kg in INR
  location: string; // District, State
  phone: string; // WhatsApp mobile number
  cropType: string; // Grain, Vegetable, Fruit, Spices, Pulses, Oilseeds, Other
  description?: string;
  imageUrl?: string;
}

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  voiceInput?: boolean;
  source?: string;
  confidence?: string;
}

export interface SustainableTip {
  id: string;
  title: string;
  category: "organic" | "water" | "rotation" | "soil";
  iconName: string;
  content: string;
  seasonalRecs: {
    months: string[];
    benefit: string;
  };
}
