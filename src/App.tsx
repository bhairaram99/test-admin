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
  Loader2
} from 'lucide-react';

interface Registration {
  _id: string;
  name: string;
  phone: string;
  city: string;
  description: string;
  createdAt: string;
}

const API_BASE_URL = "http://localhost:3001";

function App() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.includes(searchTerm) ||
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Sidebar Overlay (Desktop Only) */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-slate-900 text-white hidden md:block">
          <div className="p-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              Admin Panel
            </h1>
          </div>
          <nav className="mt-6 px-4">
            <div className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg text-white font-medium">
              <Users className="h-5 w-5" />
              Registrations
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Workshop Registrations</h2>
              <p className="text-slate-500 text-sm">View and manage all your workshop participants</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Participants</p>
                  <p className="text-2xl font-bold text-slate-900">{data.length}</p>
                </div>
              </div>
            </div>
            {/* Add more stats if needed */}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, phone or city..." 
                  className="pl-10 pr-4 py-2 w-full bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">User Details</th>
                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold">Submission</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-slate-500">Loading data...</p>
                      </td>
                    </tr>
                  )}
                  {!loading && filteredData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                        No registrations found matching your search.
                      </td>
                    </tr>
                  )}
                  {filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm group-hover:bg-white group-hover:shadow-sm transition-all text-uppercase">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{item._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-3.5 w-3.5" />
                            +91 {item.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 capitalize">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {item.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-start gap-2 max-w-xs">
                          <FileText className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0" />
                          <p className="text-slate-600 truncate group-hover:whitespace-normal group-hover:line-clamp-none line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Mockup */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <p>Showing {filteredData.length} of {data.length} results</p>
              <div className="flex items-center gap-2">
                <button className="p-1 border bg-white rounded-md disabled:opacity-50" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-1 border bg-white rounded-md disabled:opacity-50" disabled>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
