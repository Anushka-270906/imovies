import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, User } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getUsers();
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load registered users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          Registered Users & Roles
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Directory of registered moviegoers and administrative staff.
        </p>
      </div>

      <div className="bg-[#161F30] rounded-2xl border border-[#222F46] overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Retrieving registered members..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-[#222F46]">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Reservations Placed</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222F46]/70 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#222F46] flex items-center justify-center font-bold text-white uppercase text-xs">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-bold text-white text-sm">{u.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {u.bookingsCount || 0} bookings
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
