import AdminLayout from "./AdminLayout";
import { useState } from "react";
import { Plus, Trash2, Edit2, Shield } from "lucide-react";

// Mock data
const INITIAL_USERS = [
  { id: 1, name: "Admin User", email: "admin@protels.com", role: "Super Admin", status: "Active" },
  { id: 2, name: "Hotel Manager", email: "manager@protels.com", role: "Manager", status: "Active" },
  { id: 3, name: "Content Editor", email: "editor@protels.com", role: "Editor", status: "Active" },
];

const ROLES = ["Super Admin", "Manager", "Editor", "Viewer"];

export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Editor" });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: Date.now(), status: "Active" }]);
    setShowModal(false);
    setNewUser({ name: "", email: "", role: "Editor" });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Users & Roles</h2>
          <p className="text-gray-500">Manage system users and their access permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-gold text-brand-blue px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-brand-gold/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Name</th>
              <th className="px-6 py-4 font-medium text-gray-600">Email</th>
              <th className="px-6 py-4 font-medium text-gray-600">Role</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-gray-400 hover:text-brand-blue transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium bg-brand-blue text-white rounded-md hover:bg-brand-blue/90"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
