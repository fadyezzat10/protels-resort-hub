import AdminLayout from "./AdminLayout";
import { Users, Mail, TrendingUp, Calendar } from "lucide-react";

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">Dashboard</h2>
        <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Bookings" 
          value="1,284" 
          change="+12%" 
          icon={Calendar} 
          color="blue"
        />
        <StatsCard 
          title="Active Users" 
          value="42" 
          change="+2" 
          icon={Users} 
          color="green"
        />
        <StatsCard 
          title="Newsletter Subs" 
          value="892" 
          change="+24" 
          icon={Mail} 
          color="purple"
        />
        <StatsCard 
          title="Revenue" 
          value="$124k" 
          change="+8%" 
          icon={TrendingUp} 
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Mockup */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-brand-blue">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New booking received</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-brand-blue">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Users className="w-5 h-5 mb-2 text-brand-blue" />
              <span className="text-sm font-medium">Add New User</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Mail className="w-5 h-5 mb-2 text-brand-blue" />
              <span className="text-sm font-medium">Send Newsletter</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Calendar className="w-5 h-5 mb-2 text-brand-blue" />
              <span className="text-sm font-medium">View Bookings</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatsCard({ title, value, change, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">{change}</span>
      </div>
      <h3 className="text-2xl font-bold text-brand-blue mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}
