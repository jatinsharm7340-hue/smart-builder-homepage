
import  { useState, useEffect, useRef } from 'react';
import {
  Home,
  PenTool,
  Calculator,
  Hammer,
  Users,
  Phone,
  Bot,
  HardHat,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  IndianRupee,
  Building2,
  Ruler,
  BedDouble,
  Bath,
  Car,
  Save,
  Loader2,
  Send,
  QrCode
} from 'lucide-react';

// --- FIREBASE IMPORTS & SETUP ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

let firebaseConfig = null;
let app = null;
let auth = null;
let db = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    firebaseConfig = JSON.parse(__firebase_config);
  }
} catch (e) {
  console.warn('Invalid __firebase_config, skipping Firebase init', e);
}

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase initialization failed, continuing without backend', e);
    app = null;
    auth = null;
    db = null;
  }
}

// --- MOCK DATA ---

const HOUSE_DESIGNS = [
  {
    id: 1,
    title: "Modern Minimalist Villa",
    image: "https://images.unsplash.com/photo-1600596542815-e328701102b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    area: 2400,
    floors: "Duplex",
    beds: 4,
    baths: 3,
    parking: 2,
    cost: "45L - 55L",
    style: "Modern",
    plotSize: "40x60"
  },
  {
    id: 2,
    title: "Contemporary Family Home",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    area: 1500,
    floors: "G+1",
    beds: 3,
    baths: 2,
    parking: 1,
    cost: "30L - 38L",
    style: "Traditional",
    plotSize: "30x50"
  },
  {
    id: 3,
    title: "Luxury Estate",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    area: 4500,
    floors: "Triplex",
    beds: 5,
    baths: 5,
    parking: 3,
    cost: "1.2Cr - 1.5Cr",
    style: "Luxury",
    plotSize: "50x80"
  },
  {
    id: 4,
    title: "Compact Urban Home",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    area: 1200,
    floors: "Single Floor",
    beds: 2,
    baths: 2,
    parking: 1,
    cost: "22L - 28L",
    style: "Modern",
    plotSize: "30x40"
  },
  {
    id: 5,
    title: "Spanish Hacienda",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    area: 3200,
    floors: "Duplex",
    beds: 4,
    baths: 4,
    parking: 2,
    cost: "60L - 75L",
    style: "Traditional",
    plotSize: "40x60"
  },
  {
    id: 6,
    title: "Eco-Green Smart Home",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    area: 2800,
    floors: "G+1",
    beds: 3,
    baths: 3,
    parking: 2,
    cost: "50L - 65L",
    style: "Luxury",
    plotSize: "40x50"
  }
];

const MATERIAL_DATA = {
  Basic: {
    cement: { brand: "Ultratech / Ambuja (PPC)", grade: "43 Grade", price: "₹380 - ₹400 / bag" },
    steel: { brand: "Local TMT / Kamdhenu", grade: "Fe 500", price: "₹65 - ₹70 / kg" },
    bricks: { brand: "Red Clay Bricks (Class B)", type: "Standard", price: "₹7 - ₹9 / pc" },
    flooring: { brand: "Local Ceramic Tiles", type: "Standard Ceramic", price: "₹40 - ₹60 / sqft" },
    paint: { brand: "Asian Paints Tractor Emulsion", type: "Basic Emulsion", price: "₹20 / sqft" },
    plumbing: { brand: "Supreme / Astral (PVC)", type: "Standard", price: "Low Range" },
    electrical: { brand: "Anchor / Polycab", type: "Standard wires", price: "Standard Range" }
  },
  Standard: {
    cement: { brand: "Ultratech / ACC (OPC)", grade: "53 Grade", price: "₹420 - ₹450 / bag" },
    steel: { brand: "Tata Tiscon / JSW", grade: "Fe 500D", price: "₹75 - ₹85 / kg" },
    bricks: { brand: "Fly Ash / AAC Blocks", type: "High Quality", price: "₹3500 / m³" },
    flooring: { brand: "Kajaria / Somany", type: "Vitrified Tiles", price: "₹80 - ₹120 / sqft" },
    paint: { brand: "Asian Paints Apcolite", type: "Premium Emulsion", price: "₹35 / sqft" },
    plumbing: { brand: "Ashirvad / Astral (CPVC)", type: "Mid-range", price: "Mid Range" },
    electrical: { brand: "Havells / Finolex", type: "Fire Retardant", price: "Mid Range" }
  },
  Premium: {
    cement: { brand: "Ultratech Premium / Lafarge", grade: "53 Grade +", price: "₹480+ / bag" },
    steel: { brand: "Tata Tiscon SD / JSW Neo", grade: "Fe 550D", price: "₹90+ / kg" },
    bricks: { brand: "Wienerberger / Porotherm", type: "Premium Blocks", price: "Premium Rates" },
    flooring: { brand: "Italian Marble / Granite", type: "Imported", price: "₹250+ / sqft" },
    paint: { brand: "Asian Paints Royale / Dulux Velvet", type: "Luxury Emulsion", price: "₹50+ / sqft" },
    plumbing: { brand: "Jaquar / Kohler", type: "High-end", price: "Premium Range" },
    electrical: { brand: "Schneider / Legrand", type: "Smart Home Ready", price: "Premium Range" }
  }
};

const COMPANIES = [
  { name: "BuildTech Solutions", rating: 4.8, specialization: "Modern Structures", contact: "+91 98765 43210" },
  { name: "GreenHome Constructors", rating: 4.6, specialization: "Eco-friendly", contact: "+91 98123 45678" },
  { name: "Urban Architects Group", rating: 4.9, specialization: "Luxury Villas", contact: "+91 99988 77766" },
  { name: "Reliable Civil Works", rating: 4.5, specialization: "Budget Housing", contact: "+91 88877 66655" }
];

// --- HELPER HOOKS ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- COMPONENTS ---

const Notification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center transform transition-all duration-500 translate-y-0 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <X className="h-5 w-5 mr-2" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative transform transition-all scale-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Share SmartHome</h3>
        <p className="text-gray-500 text-sm mb-6">Scan to open on your mobile device</p>

        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-100">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
              alt="App QR Code"
              className="w-48 h-48 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${copied
              ? 'bg-green-100 text-green-700'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
        >
          {copied ? (
            <><CheckCircle className="h-4 w-4 mr-2" /> Link Copied</>
          ) : (
            "Copy Link"
          )}
        </button>
      </div>
    </div>
  )
}

const ContactModal = ({ isOpen, onClose, user, context }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Save Inquiry/Lead
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'inquiries'), {
        ...formData,
        context: context || 'General Inquiry',
        createdAt: serverTimestamp(),
        status: 'new'
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', phone: '', message: '' });
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {context?.includes('Quote') ? 'Request a Quote' : 'Contact Us'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h4>
            <p className="text-gray-600">We will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                required
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-24"
                placeholder="I'm interested in..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span className="flex items-center">Send Request <Send className="ml-2 h-4 w-4" /></span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ setPage, currentPage, mobileMenuOpen, setMobileMenuOpen, onContactClick, onShareClick }) => (
  <nav className="bg-white shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}>
          <Building2 className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">SmartHome<span className="text-indigo-600">Builder</span></span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {['Home', 'Design', 'Budget', 'Materials', 'Designers'].map((item) => (
            <button
              key={item}
              onClick={() => setPage(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase())}
              className={`${currentPage === item.toLowerCase() ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'} transition-colors duration-200`}
            >
              {item}
            </button>
          ))}
          <div className="flex items-center space-x-2">
            <button
              onClick={onShareClick}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title="Share QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
            <button
              onClick={onContactClick}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <button onClick={onShareClick} className="text-gray-600 hover:text-indigo-600">
            <QrCode className="h-6 w-6" />
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-gray-900">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="md:hidden bg-white border-t border-gray-100 pb-4">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {['Home', 'Design', 'Budget', 'Materials', 'Designers'].map((item) => (
            <button
              key={item}
              onClick={() => { setPage(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase()); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => { onContactClick(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            Contact Support
          </button>
        </div>
      </div>
    )}
  </nav>
);

const Hero = ({ setPage }) => (
  <div className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
    {/* Background Pattern */}
    <div className="absolute inset-0 z-0 opacity-10"
      style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
    </div>

    <div className="relative z-10 text-center max-w-4xl mx-auto mb-16 mt-8">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
        Design Your Dream Home <br />
        <span className="text-indigo-600">Smart, Simple & Within Budget</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        From AI-generated floor plans to detailed material cost breakdowns, we help you build better.
      </p>
    </div>

    <div className="relative z-10 grid md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
      {/* AI Option */}
      <div onClick={() => setPage('design')} className="group bg-white rounded-2xl shadow-xl p-8 cursor-pointer border border-transparent hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
          <Bot className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">AI House Design</h3>
        <p className="text-gray-600 mb-6">
          Generate instant house designs based on your plot size, floors, rooms, and preferences using advanced AI.
        </p>
        <div className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
          Design with AI <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </div>

      {/* Professional Option */}
      <div onClick={() => setPage('designers')} className="group bg-white rounded-2xl shadow-xl p-8 cursor-pointer border border-transparent hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
          <Users className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Professional Designers</h3>
        <p className="text-gray-600 mb-6">
          Hire verified professional architects and designers to create customized house plans specifically for you.
        </p>
        <div className="flex items-center text-emerald-600 font-semibold group-hover:text-emerald-700">
          Hire a Designer <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </div>
    </div>
  </div>
);

const DesignPage = ({ setPage, setSelectedDesign, user, showNotify }) => {
  const [filterPlot, setFilterPlot] = useState('All');
  const [savingId, setSavingId] = useState(null);

  const handleSelectDesign = async (house) => {
    if (!user) return;
    setSavingId(house.id);

    // Save to Firestore
    try {
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'project', 'current');
      await setDoc(userRef, {
        selectedDesign: house,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSelectedDesign(house);
      showNotify("Design saved successfully!");
      setPage('budget');
    } catch (e) {
      console.error("Error saving design", e);
      showNotify("Error saving design.", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Generated House Designs</h2>
            <p className="text-gray-600 mt-2">AI-curated designs based on popular modern standards.</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <select
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterPlot}
              onChange={(e) => setFilterPlot(e.target.value)}
            >
              <option value="All">All Plot Sizes</option>
              <option value="30x40">30x40</option>
              <option value="40x60">40x60</option>
              <option value="50x80">50x80</option>
            </select>
            <button className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HOUSE_DESIGNS.filter(d => filterPlot === 'All' || d.plotSize.includes(filterPlot.replace('x', '')) || d.plotSize === filterPlot).map((house) => (
            <div key={house.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-56">
                <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                  {house.cost}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-medium text-white">
                  {house.style}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{house.title}</h3>
                <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                  <span className="flex items-center"><Ruler className="h-4 w-4 mr-1" /> {house.area} sqft</span>
                  <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" /> {house.floors}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col items-center">
                    <BedDouble className="h-5 w-5 text-indigo-500 mb-1" />
                    <span>{house.beds} Beds</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-gray-200">
                    <Bath className="h-5 w-5 text-indigo-500 mb-1" />
                    <span>{house.baths} Baths</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-gray-200">
                    <Car className="h-5 w-5 text-indigo-500 mb-1" />
                    <span>{house.parking} Park</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleSelectDesign(house)}
                    disabled={savingId === house.id}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md flex justify-center items-center disabled:bg-indigo-400"
                  >
                    {savingId === house.id ? <Loader2 className="animate-spin h-5 w-5" /> : <><span className="mr-2">Select & Continue</span> <ChevronRight className="h-5 w-5" /></>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BudgetPage = ({ selectedDesign, user, onRequestQuote, showNotify }) => {
  const [budget, setBudget] = useState(5000000);
  const [quality, setQuality] = useState('Standard');
  const [location, setLocation] = useState('Bangalore');
  const [isSyncing, setIsSyncing] = useState(false);

  const debouncedBudget = useDebounce(budget, 1000);
  const debouncedQuality = useDebounce(quality, 1000);
  const debouncedLocation = useDebounce(location, 1000);

  // Auto-Save Effect
  useEffect(() => {
    const saveData = async () => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'project', 'current');
        await setDoc(userRef, {
          budget: debouncedBudget,
          quality: debouncedQuality,
          location: debouncedLocation,
          updatedAt: serverTimestamp()
        }, { merge: true });
        // Optional: showNotify("Preferences saved", "success"); 
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setTimeout(() => setIsSyncing(false), 500);
      }
    };

    // Only save if values are initialized
    if (user) {
      saveData();
    }
  }, [debouncedBudget, debouncedQuality, debouncedLocation, user]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'project', 'current');
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.budget) setBudget(data.budget);
          if (data.quality) setQuality(data.quality);
          if (data.location) setLocation(data.location);
        }
      } catch (e) {
        console.error("Load failed", e);
      }
    };
    loadData();
  }, [user]);

  const materials = MATERIAL_DATA[quality] || MATERIAL_DATA['Standard'];

  const calculateQty = (baseQty, unit) => {
    if (!selectedDesign) return `${baseQty} ${unit}`;
    const multiplier = selectedDesign.area / 1000;
    return `${Math.ceil(baseQty * multiplier)} ${unit}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calculator className="h-8 w-8 text-indigo-600 mr-3" />
              Budget & Material Planner
            </h2>
            {isSyncing && (
              <span className="flex items-center text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">
                <Loader2 className="animate-spin h-3 w-3 mr-1" /> Saving...
              </span>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Budget</label>
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <span className="px-3 bg-gray-50 text-gray-500 border-r border-gray-300 h-full py-2">₹</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full px-4 py-2 focus:outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="10000000"
                    step="100000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full mt-2 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bangalore</option>
                    <option>Hyderabad</option>
                    <option>Jaipur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Construction Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Basic', 'Standard', 'Premium'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`py-2 px-1 text-sm rounded-lg border font-medium transition-all ${quality === q
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *Changes material brands & pricing
                </p>
              </div>
            </div>

            {/* Selected Design Summary */}
            <div className="md:col-span-2 bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex flex-col md:flex-row gap-6">
              {selectedDesign ? (
                <>
                  <img src={selectedDesign.image} alt="Selected" className="w-full md:w-48 h-32 object-cover rounded-lg shadow-sm" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedDesign.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{selectedDesign.style} Style • {selectedDesign.area} sqft</p>
                      </div>
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-indigo-600 shadow-sm border border-indigo-100">
                        {quality} Quality
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-2 rounded shadow-sm">
                        <span className="block text-gray-500 text-xs">Cement Req.</span>
                        <span className="font-semibold text-gray-800">{calculateQty(400, 'bags')}</span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-sm">
                        <span className="block text-gray-500 text-xs">Steel Req.</span>
                        <span className="font-semibold text-gray-800">{calculateQty(3.5, 'tons')}</span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-sm">
                        <span className="block text-gray-500 text-xs">Bricks Req.</span>
                        <span className="font-semibold text-gray-800">{calculateQty(15000, 'pcs')}</span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-sm">
                        <span className="block text-gray-500 text-xs">Est. Timeline</span>
                        <span className="font-semibold text-gray-800">6-8 Months</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full text-gray-500">
                  Select a design from the previous page to see breakdown.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Material Breakdown Table */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Material List Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Hammer className="h-5 w-5 mr-2 text-indigo-600" /> Material List & Pricing
            </h3>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs & Brand</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Cement', key: 'cement', icon: <Building2 size={16} /> },
                    { name: 'Steel / TMT', key: 'steel', icon: <PenTool size={16} /> },
                    { name: 'Bricks/Blocks', key: 'bricks', icon: <HardHat size={16} /> },
                    { name: 'Flooring', key: 'flooring', icon: <Ruler size={16} /> },
                    { name: 'Paints', key: 'paint', icon: <PenTool size={16} /> },
                    { name: 'Plumbing', key: 'plumbing', icon: <Bath size={16} /> },
                    { name: 'Electrical', key: 'electrical', icon: <Bot size={16} /> }
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        <span className="mr-2 text-indigo-400">{item.icon}</span> {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-semibold text-gray-800">{materials[item.key].brand}</div>
                        <div className="text-xs text-gray-500">{materials[item.key].type || materials[item.key].grade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-medium">
                        {materials[item.key].price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Companies & Contractors Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" /> Recommended Partners
            </h3>
            <div className="space-y-4">
              {COMPANIES.map((company, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-5 border border-transparent hover:border-indigo-500 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{company.name}</h4>
                    <span className="flex items-center text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded">
                      {company.rating} ★
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{company.specialization}</p>
                  <div className="flex items-center justify-between mt-4">
                    <button onClick={() => onRequestQuote(`${company.name} Profile`)} className="text-indigo-600 text-sm font-semibold hover:underline">View Profile</button>
                    <button onClick={() => onRequestQuote(`Contact: ${company.name}`)} className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors">
                      <Phone className="h-3 w-3 mr-1" /> Contact
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white text-center shadow-lg mt-6">
                <h4 className="font-bold text-lg mb-2">Need a verified contractor?</h4>
                <p className="text-indigo-100 text-sm mb-4">Get quotes from top 3 rated contractors in {location}.</p>
                <button
                  onClick={() => onRequestQuote(`General Contractor Quote for ${location}`)}
                  className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-gray-50 transition-colors w-full"
                >
                  Request Quotes
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Auth & Backend State
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState('');
  const [notification, setNotification] = useState(null);

  // Authentication Effect
  useEffect(() => {
    if (!auth) return; // skip auth-related logic when Firebase isn't initialized

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.warn('Auth initialization failed', e);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        // Attempt to restore session state if needed
        const restoreSession = async () => {
          try {
            const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'project', 'current');
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().selectedDesign) {
              setSelectedDesign(snap.data().selectedDesign);
            }
          } catch (e) { console.error("Restore failed", e) }
        };
        restoreSession();
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const showNotify = (msg, type = 'success') => {
    setNotification({ message: msg, type });
  };

  const handleOpenModal = (context) => {
    setModalContext(context || 'General Inquiry');
    setModalOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Hero setPage={setCurrentPage} />;
      case 'design':
      case 'designers':
        return (
          <DesignPage
            setPage={setCurrentPage}
            setSelectedDesign={setSelectedDesign}
            user={user}
            showNotify={showNotify}
          />
        );
      case 'budget':
        return (
          <BudgetPage
            selectedDesign={selectedDesign}
            user={user}
            onRequestQuote={handleOpenModal}
            showNotify={showNotify}
          />
        );
      default:
        return <Hero setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar
        setPage={setCurrentPage}
        currentPage={currentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onContactClick={() => handleOpenModal('Navbar Contact')}
        onShareClick={() => setShareModalOpen(true)}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        context={modalContext}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <main>
        {renderPage()}
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Building2 className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-white">SmartHome<span className="text-indigo-400">Builder</span></span>
            </div>
            <p className="text-gray-400 text-sm">
              Making home construction simple, transparent, and affordable for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('design')}>AI Designs</li>
              <li className="hover:text-white cursor-pointer" onClick={() => handleOpenModal('Footer: Contractors')}>Find Contractors</li>
              <li className="hover:text-white cursor-pointer" onClick={() => setCurrentPage('budget')}>Material Cost Calculator</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">Help Center</li>
              <li className="hover:text-white cursor-pointer" onClick={() => handleOpenModal('Footer: Contact')}>Contact Us</li>
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <div className="flex space-x-4">
              {/* Social placeholders */}
              <div className="h-8 w-8 bg-gray-700 rounded-full hover:bg-indigo-500 cursor-pointer transition-colors"></div>
              <div className="h-8 w-8 bg-gray-700 rounded-full hover:bg-indigo-500 cursor-pointer transition-colors"></div>
              <div className="h-8 w-8 bg-gray-700 rounded-full hover:bg-indigo-500 cursor-pointer transition-colors"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © 2024 SmartHome Builder. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
