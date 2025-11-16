// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
  avatarUrl?: string | null;
}

interface UserStats {
  plantsCount: number;
  ordersCount: number;
  memberSince: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<UserProfile>({
    fullName: '',
    phone: '',
    address: '',
    avatarUrl: null,
  });

  const [stats, setStats] = useState<UserStats>({
    plantsCount: 0,
    ordersCount: 0,
    memberSince: '',
  });

  // === LẤY PROFILE TỪ API ===
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) return;

      setIsLoadingProfile(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5239/api/UserProfile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Không thể tải thông tin');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const { fullName, phone, address, avatarUrl } = result.data;
          setFormData({
            fullName: fullName || '',
            phone: phone || '',
            address: address || '',
            avatarUrl: avatarUrl || null,
          });
        }
      } catch (error: any) {
        console.error('Lỗi tải profile:', error);
        setMessage({ type: 'error', text: error.message || 'Không thể tải thông tin cá nhân' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user?.userId]);

  // === LẤY STATS TỪ API ===
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.userId) return;

      setIsLoadingStats(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5239/api/UserProfile/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Không thể tải thống kê');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const { plantsCount, ordersCount, memberSince: createdAt } = result.data;
          setStats({
            plantsCount: plantsCount || 0,
            ordersCount: ordersCount || 0,
            memberSince: formatMemberSince(createdAt),
          });
        }
      } catch (error: any) {
        console.error('Lỗi tải stats:', error);
        setStats({ plantsCount: 0, ordersCount: 0, memberSince: 'N/A' });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.userId]);

  // === ĐỊNH DẠNG THỜI GIAN THÀNH VIÊN ===
  const formatMemberSince = (createdAt: string | null): string => {
    if (!createdAt) return 'N/A';

    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;

      if (years > 0) return `${years} năm${months > 0 ? ` ${months} tháng` : ''}`;
      if (months > 0) return `${months} tháng${days > 0 ? ` ${days} ngày` : ''}`;
      return `${days} ngày`;
    } catch {
      return 'N/A';
    }
  };

  // === XỬ LÝ INPUT ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // === CẬP NHẬT PROFILE ===
  const handleSubmit = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5239/api/UserProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          avatarUrl: formData.avatarUrl || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Cập nhật thất bại');
      }

      setMessage({ type: 'success', text: result.message || 'Cập nhật thành công!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Lỗi hệ thống!' });
    } finally {
      setIsSaving(false);
    }
  };

  // === HỦY CHỈNH SỬA ===
  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header xanh lá */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">
                {formData.fullName || user?.fullName || 'Người dùng'}
              </h2>
              <p className="text-green-100 text-sm">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Thông tin chi tiết</h3>
            {!isEditing && !isLoadingProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>

          {isLoadingProfile ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md outline-none transition ${
                    isEditing
                      ? 'border-gray-300 focus:border-green-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 outline-none cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md outline-none transition ${
                    isEditing
                      ? 'border-gray-300 focus:border-green-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md outline-none transition resize-none ${
                    isEditing
                      ? 'border-gray-300 focus:border-green-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Nút hành động */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Vườn cây */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">Vườn cây</h4>
          </div>
          {isLoadingStats ? (
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold text-green-600">{stats.plantsCount} cây</p>
              <p className="text-sm text-gray-500 mt-1">Đang chăm sóc</p>
            </>
          )}
        </div>

        {/* Đơn hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">Đơn hàng</h4>
          </div>
          {isLoadingStats ? (
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold text-blue-600">{stats.ordersCount} đơn</p>
              <p className="text-sm text-gray-500 mt-1">Đã hoàn thành</p>
            </>
          )}
        </div>

        {/* Thành viên */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">Thành viên</h4>
          </div>
          {isLoadingStats ? (
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold text-purple-600">{stats.memberSince}</p>
              <p className="text-sm text-gray-500 mt-1">Kể từ tham gia</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;