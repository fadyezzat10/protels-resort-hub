import AdminLayout from "./AdminLayout";
import { useState } from "react";
import { Download, Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const INITIAL_SUBSCRIBERS = [
  { id: 1, email: "john.doe@example.com", subscribedAt: "2024-02-06", status: "Subscribed" },
  { id: 2, email: "sarah.smith@test.com", subscribedAt: "2024-02-05", status: "Subscribed" },
  { id: 3, email: "marketing@agency.com", subscribedAt: "2024-02-04", status: "Unsubscribed" },
  { id: 4, email: "guest@hotel.com", subscribedAt: "2024-02-01", status: "Subscribed" },
];

export default function NewsletterPage() {
  const [subscribers] = useState(INITIAL_SUBSCRIBERS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Newsletter</h2>
          <p className="text-gray-500">Manage your newsletter subscribers and campaigns.</p>
        </div>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-brand-blue rounded-full">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Subscribers</p>
              <h3 className="text-2xl font-bold text-gray-900">1,284</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-full">
              <span className="text-xl font-bold">+</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">New This Month</p>
              <h3 className="text-2xl font-bold text-gray-900">142</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search subscribers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Email Address</th>
              <th className="px-6 py-4 font-medium text-gray-600">Subscribed Date</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                <td className="px-6 py-4 text-gray-600">{sub.subscribedAt}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    sub.status === "Subscribed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  )}>
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

