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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header với animation */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Thông báo với animation */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3 shadow-lg animate-slide-down ${
              message.type === 'success'
                ? 'bg-green-50/80 text-green-800 border-green-300'
                : 'bg-red-50/80 text-red-800 border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Profile Card với hiệu ứng đẹp hơn */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          {/* Header với gradient đẹp hơn */}
          <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-8">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/50 transition-transform group-hover:scale-105">
                  <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white"></div>
              </div>
              <div className="text-white flex-1">
                <h2 className="text-2xl font-bold mb-1 drop-shadow-md">
                  {formData.fullName || user?.fullName || 'Người dùng'}
                </h2>
                <p className="text-green-50 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {user?.email || 'email@example.com'}
                </p>
              </div>
              {!isEditing && !isLoadingProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Form với spacing đẹp hơn */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
              Thông tin chi tiết
            </h3>

            {isLoadingProfile ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ và tên */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                      isEditing
                        ? 'border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Email không thể thay đổi
                  </p>
                </div>

                {/* Số điện thoại */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                      isEditing
                        ? 'border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                {/* Địa chỉ */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Địa chỉ
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Nút hành động với hiệu ứng đẹp */}
            {isEditing && (
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 font-semibold hover:shadow-md"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-semibold flex items-center gap-2 hover:scale-105"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thống kê với hiệu ứng hover đẹp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vườn cây */}
          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800">Vườn cây</h4>
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-10 bg-green-200 rounded-xl w-20 animate-pulse"></div>
            ) : (
              <>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {stats.plantsCount}
                </p>
                <p className="text-sm text-gray-600 font-medium">Cây đang chăm sóc</p>
              </>
            )}
          </div>

          {/* Đơn hàng */}
          <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800">Đơn hàng</h4>
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-10 bg-blue-200 rounded-xl w-20 animate-pulse"></div>
            ) : (
              <>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stats.ordersCount}
                </p>
                <p className="text-sm text-gray-600 font-medium">Đơn đã hoàn thành</p>
              </>
            )}
          </div>

          {/* Thành viên */}
          <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800">Thành viên</h4>
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-10 bg-purple-200 rounded-xl w-24 animate-pulse"></div>
            ) : (
              <>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stats.memberSince}
                </p>
                <p className="text-sm text-gray-600 font-medium">Kể từ tham gia</p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;