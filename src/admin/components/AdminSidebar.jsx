import { useState } from 'react';

// ── MOCK DATA ───────────────────────────────────────────────────────────────
const initialUsers = [
  { id: 1, name: 'Saurav Mishra', email: 'saurav@wonderfloor.com', role: 'Super Admin', status: 'Active', lastActive: 'Just now', initials: 'SM', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 2, name: 'Arun Solanki', email: 'arun@wonderfloor.com', role: 'Content Manager', status: 'Active', lastActive: '2 hours ago', initials: 'AS', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 3, name: 'Pramod Sah', email: 'pramod@luxeandhardy.com', role: 'Admin', status: 'Active', lastActive: 'Yesterday', initials: 'PS', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 4, name: 'Marketing Team', email: 'marketing@wonderfloor.com', role: 'Viewer', status: 'Inactive', lastActive: '2 weeks ago', initials: 'MT', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const roleStyles = {
  'Super Admin': 'bg-purple-50 text-purple-700 border-purple-200',
  'Admin': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Content Manager': 'bg-blue-50 text-blue-700 border-blue-200',
  'Viewer': 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusStyles = {
  'Active': { container: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  'Inactive': { container: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter users by name, email, or role
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8 font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage team access and dashboard permissions.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] transition-all text-sm placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#0b9e7a] hover:bg-[#098264] text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-sm font-semibold shadow-sm shadow-[#0b9e7a]/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add user
          </button>
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Details</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const rs = roleStyles[user.role] || roleStyles['Viewer'];
                const ss = statusStyles[user.status] || statusStyles['Inactive'];

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* User Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${user.color}`}>
                          {user.initials}
                        </div>
                        <div>
                          <p className="text-[14px] text-slate-900 font-semibold leading-tight">{user.name}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${rs}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ss.container}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ss.dot}`} />
                        {user.status}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="px-5 py-4 text-[13px] text-slate-600 font-medium">
                      {user.lastActive}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer" title="Edit User">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer" title="Delete User">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 text-sm font-medium">
                    No users found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD USER MODAL (Conditional) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl flex flex-col">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add New User</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }} className="p-6 flex flex-col gap-5 bg-slate-50/40">
              
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input type="text" required placeholder="e.g. Jane Doe" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400 shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email Address</label>
                <input type="email" required placeholder="name@wonderfloor.com" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400 shadow-sm" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Temporary Password</label>
                <input type="password" required placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400 shadow-sm" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Assign Role</label>
                <div className="relative">
                  <select required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all appearance-none cursor-pointer shadow-sm">
                    <option value="Viewer">Viewer (Read Only)</option>
                    <option value="Content Manager">Content Manager (Uploads & Edits)</option>
                    <option value="Admin">Admin (Full Access minus Billing)</option>
                    <option value="Super Admin">Super Admin (All Access)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors shadow-sm shadow-[#0b9e7a]/10 cursor-pointer">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}