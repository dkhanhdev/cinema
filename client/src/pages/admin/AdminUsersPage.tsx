import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { User, UserRole } from '../../types';
import { useToastStore } from '../../stores/useToastStore';
import { Users, Search, Shield, UserX, UserCheck, RefreshCw, Trash2 } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const toast = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res: any = await axiosClient.get('/users', {
        params: { search: search || undefined, role: roleFilter || undefined },
      });
      setUsers(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await axiosClient.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Cập nhật quyền người dùng thành công!');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật quyền');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axiosClient.put(`/users/${userId}/role`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await axiosClient.delete(`/users/${userId}`);
      toast.success('Xóa người dùng thành công!');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa người dùng');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
            <Shield className="w-4 h-4" />
            Admin Security & RBAC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quản Lý Người Dùng & Phân Quyền
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="flex gap-2 w-full sm:max-w-md"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, email, sđt..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm</span>
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">-- Tất cả vai trò --</option>
          <option value="USER">Khách hàng (USER)</option>
          <option value="STAFF">Nhân viên (STAFF)</option>
          <option value="ADMIN">Quản trị viên (ADMIN)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Người Dùng</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Vai Trò (Role)</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-neutral-800/40 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={u.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                    />
                    <span className="font-bold text-white">{u.fullName}</span>
                  </td>
                  <td className="py-3.5 px-4">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono">{u.phone || '-'}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value as UserRole)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        u.role === UserRole.ADMIN
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                          : u.role === UserRole.STAFF
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                      }`}
                    >
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.isActive !== false
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {u.isActive !== false ? 'Hoạt Động' : 'Đã Khóa'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
