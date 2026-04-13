import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Phone, 
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  Trash2,
  Edit2,
  X,
  Check,
  ArrowRight,
  Menu,
  Bell,
  Calendar,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Custom Toast System ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Registration {
  _id: string;
  name: string;
  phone: string;
  city: string;
  description: string;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function App() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Edit State
  const [editingItem, setEditingItem] = useState<Registration | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "", city: "", description: "" });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Failed to fetch registrations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanent delete this registration?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(item => item._id !== id));
        setActiveMenu(null);
        showToast("Registration deleted successfully", "success");
      }
    } catch (error) {
      showToast("Error deleting registration", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        const result = await res.json();
        setData(data.map(item => item._id === editingItem._id ? result.data : item));
        setEditingItem(null);
        showToast("Data updated successfully!", "success");
      }
    } catch (error) {
      showToast("Update failed", "error");
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) return;
    
    try {
      const exportData = data.map(item => ({
        ID: item._id,
        Name: item.name,
        Phone: item.phone,
        City: item.city,
        Description: item.description,
        'Registered At': new Date(item.createdAt).toLocaleString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      XLSX.writeFile(workbook, `Workshop_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("Excel file downloaded!", "success");
    } catch (error: any) {
      showToast("Export failed. Please check console.", "error");
      console.error("Export error:", error.message);
    }
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.includes(searchTerm) ||
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-800 font-sans relative selection:bg-blue-100">
      
      {/* --- Toast Container --- */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[9999] flex flex-col gap-3 w-[90%] md:w-auto">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-full duration-300 ${
              t.type === 'success' ? 'bg-white border-green-100 text-green-700' : 
              t.type === 'error' ? 'bg-white border-red-100 text-red-700' : 
              'bg-white border-blue-100 text-blue-700'
            }`}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              t.type === 'success' ? 'bg-green-50' : t.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              {t.type === 'success' ? <Check className="h-4 w-4" /> : t.type === 'error' ? <X className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </div>
            <p className="text-sm font-bold">{t.message}</p>
          </div>
        ))}
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0F172A] text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight">AUTO FUNNEL</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          w-72 fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-white flex flex-col shrink-0 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-10 lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  AUTO FUNNEL
                </h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden h-8 w-8 flex items-center justify-center bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-2xl font-bold border border-blue-600/20 transition-all duration-300">
                <Users className="h-5 w-5" />
                Registrations
              </button>
            </nav>
          </div>
          
          <div className="mt-auto p-8 border-t border-white/5">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 mb-1">Signed in as</p>
                <p className="text-sm font-bold text-white">Admin User</p>
             </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-5 md:p-10 lg:p-12 min-w-0">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-sm font-medium mb-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-900">Registrations</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Workshop Participants</h2>
              <p className="text-slate-500 mt-2 font-medium text-sm md:text-base tracking-tight">Monitoring {data.length} real-time registrations.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={fetchData}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 md:px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 text-xs md:text-sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Refresh</span>
              </button>
              <button 
                onClick={exportToExcel}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 md:px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 text-xs md:text-sm"
              >
                <Download className="h-4 w-4 text-blue-400" />
                <span className="hidden xs:inline">Export</span>
                <span className="hidden md:inline">Data</span>
              </button>
            </div>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                  <Users className="h-7 w-7" />
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">Active</div>
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total Registrations</p>
              <h3 className="text-3xl font-black text-slate-900">{data.length}</h3>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-visible relative">
            <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, phone or city..." 
                  className="pl-12 pr-6 py-4 w-full bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest px-4">
                <Filter className="h-4 w-4" /> Filters
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-6 text-nowrap">Participant</th>
                    <th className="px-8 py-6 text-nowrap">Contact Details</th>
                    <th className="px-8 py-6 text-nowrap">Location</th>
                    <th className="px-8 py-6 text-nowrap">Status</th>
                    <th className="px-8 py-6 text-nowrap">Message</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                           <p className="font-bold text-slate-500">Syncing database...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <p className="text-3xl">🏜️</p>
                           <p className="font-bold text-slate-500">No matching registrations found.</p>
                           <button onClick={() => setSearchTerm("")} className="text-blue-600 font-bold text-sm mt-2 hover:underline">Clear search</button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.map((item, index) => (
                    <tr key={item._id} className="hover:bg-blue-50/30 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-tr from-slate-100 to-white rounded-2xl flex items-center justify-center font-black text-slate-700 text-lg border border-slate-200 shadow-sm transition-transform group-hover:scale-105 group-hover:border-blue-200 group-hover:text-blue-600 uppercase">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">REF: {item._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                            <span className="text-blue-500 px-1.5 py-0.5 bg-blue-50 rounded text-[10px] font-black uppercase">+91</span>
                            {item.phone}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                            <Clock className="h-3 w-3" />
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full w-fit group-hover:bg-white group-hover:border-blue-100 transition-colors">
                          <MapPin className="h-3 w-3 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-slate-600 font-bold text-[11px] capitalize">{item.city}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-xs font-black text-green-600 uppercase tracking-widest">Verified</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs relative group/msg">
                          <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 group-hover:text-slate-900 transition-colors italic">
                            "{item.description}"
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
                          className="h-10 w-10 flex items-center justify-center hover:bg-white hover:shadow-xl rounded-xl transition-all border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-900"
                        >
                          < MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {/* Actions Menu Popup - REDESIGNED */}
                        {activeMenu === item._id && (
                          <div className="absolute right-12 top-10 w-44 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setEditFormData({ name: item.name, phone: item.phone, city: item.city, description: item.description });
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all border-l-4 border-transparent hover:border-blue-600"
                            >
                              <Edit2 className="h-4 w-4" /> Edit Profile
                            </button>
                            <div className="h-px bg-slate-50 my-1 mx-2" />
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all border-l-4 border-transparent hover:border-red-600"
                            >
                              <Trash2 className="h-4 w-4" /> Remove User
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Participants Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {loading ? (
                <div className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                     <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                     <p className="font-bold text-slate-500">Syncing database...</p>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                     <p className="text-3xl">🏜️</p>
                     <p className="font-bold text-slate-500">No matching registrations found.</p>
                     <button onClick={() => setSearchTerm("")} className="text-blue-600 font-bold text-sm mt-2 hover:underline">Clear search</button>
                  </div>
                </div>
              ) : (
                filteredData.map((item, index) => (
                  <div key={item._id} className="p-6 bg-white space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-tr from-slate-100 to-white rounded-2xl flex items-center justify-center font-black text-slate-700 text-lg border border-slate-200 uppercase">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">REF: {item._id.slice(-6)}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
                          className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {activeMenu === item._id && (
                          <div className="absolute right-0 top-12 w-44 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden">
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setEditFormData({ name: item.name, phone: item.phone, city: item.city, description: item.description });
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-700 active:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" /> Edit Profile
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 active:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" /> Remove User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                        <p className="text-sm font-bold text-slate-900">{item.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="text-sm font-bold text-slate-900 capitalize">{item.city}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl italic text-sm text-slate-500 font-medium">
                      "{item.description}"
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-[10px] font-black text-green-600 uppercase">Verified Participant</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN')}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Redesign */}
            <div className="px-6 md:px-10 py-8 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-400">
                Displaying <span className="text-slate-900 font-black">{filteredData.length}</span> results
              </p>
              <div className="flex items-center gap-4">
                <button className="h-10 px-4 border-2 border-slate-200 bg-white rounded-xl font-black text-[11px] text-slate-400 uppercase disabled:opacity-30 disabled:pointer-events-none" disabled>
                   Prev
                </button>
                <div className="flex items-center gap-1.5 font-black text-xs">
                   1 / 1
                </div>
                <button className="h-10 px-4 border-2 border-slate-200 bg-white rounded-xl font-black text-[11px] text-slate-400 uppercase disabled:opacity-30 disabled:pointer-events-none" disabled>
                   Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Edit Modal - PREMIUM REDESIGN --- */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl md:rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/50 h-full md:h-auto overflow-y-auto">
            <div className="relative p-6 md:p-10 pb-4 md:pb-6">
              <button 
                onClick={() => setEditingItem(null)}
                className="absolute right-4 top-4 md:right-8 md:top-8 h-10 w-10 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Edit2 className="h-5 w-5 md:h-6 md:w-6" />
                 </div>
                 <h3 className="text-xl md:text-3xl font-black tracking-tight text-slate-900">Edit User Details</h3>
              </div>
              <p className="text-slate-500 font-medium text-xs md:text-base">Update profile information for <span className="text-blue-600 font-bold">{editingItem.name}</span></p>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 md:p-10 pt-2 md:pt-4 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800"
                    placeholder="Enter name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800"
                    placeholder="Enter phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Location</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800"
                  placeholder="Enter city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal Goal / Description</label>
                <textarea 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800 h-32 resize-none"
                  placeholder="Tell us about your goal..."
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-8 py-4 md:py-5 bg-slate-100 text-slate-600 rounded-[20px] md:rounded-[24px] font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-8 py-4 md:py-5 bg-blue-600 text-white rounded-[20px] md:rounded-[24px] font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
                >
                  <Check className="h-4 w-4" /> 
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
