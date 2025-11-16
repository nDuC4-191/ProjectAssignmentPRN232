import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string;
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
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
  });

  const [stats, setStats] = useState<UserStats>({
    plantsCount: 0,
    ordersCount: 0,
    memberSince: '',
  });

  // Load dữ liệu user
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  // Fetch thống kê user
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;

      setIsLoadingStats(true);
      try {
        const token = localStorage.getItem('token');
        
        // Gọi API stats từ backend .NET
        const statsResponse = await fetch(`http://localhost:5239/api/profile/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Stats data:', statsData); // Debug

          const { plantsCount, ordersCount, createdAt } = statsData.data;

          // Tính thời gian tham gia
          const memberSince = calculateMembershipDuration(createdAt);

          setStats({
            plantsCount: plantsCount || 0,
            ordersCount: ordersCount || 0,
            memberSince: memberSince,
          });
        } else {
          // Nếu API stats chưa có, fallback về cách cũ
          throw new Error('Stats API not available');
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        
        // Fallback: Fetch riêng lẻ nếu API stats chưa có
        try {
          const token = localStorage.getItem('token');
          
          const [plantsRes, ordersRes] = await Promise.all([
            fetch(`http://localhost:5239/api/user-plants`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`http://localhost:5239/api/orders/my-orders`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);

          const plantsData = await plantsRes.json();
          const ordersData = await ordersRes.json();

          const completedOrders = ordersData.data 
            ? ordersData.data.filter((order: any) => 
                order.status === 'Completed' || 
                order.status === 'completed' ||
                order.status === 'Delivered' ||
                order.status === 'delivered'
              )
            : [];

          const memberSince = calculateMembershipDuration(user.createdAt);

          setStats({
            plantsCount: Array.isArray(plantsData.data) ? plantsData.data.length : 0,
            ordersCount: completedOrders.length,
            memberSince: memberSince,
          });
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setStats({
            plantsCount: 0,
            ordersCount: 0,
            memberSince: 'N/A',
          });
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Tính thời gian thành viên
  const calculateMembershipDuration = (createdAt: string | undefined): string => {
    if (!createdAt) return 'N/A';

    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;

      if (years > 0) {
        return months > 0 ? `${years} năm ${months} tháng` : `${years} năm`;
      } else if (months > 0) {
        return days > 0 ? `${months} tháng ${days} ngày` : `${months} tháng`;
      } else {
        return `${days} ngày`;
      }
    } catch (error) {
      return 'N/A';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // Gọi API .NET để update profile
      const response = await fetch('http://localhost:5239/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          avatarUrl: formData.avatarUrl
        })
      });

      if (!response.ok) {
        throw new Error('Cập nhật thất bại');
      }
      
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại!' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
    setMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{formData.fullName || 'Người dùng'}</h2>
              <p className="text-green-100">{formData.email}</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Thông tin chi tiết</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-md ${
                  isEditing 
                    ? 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500' 
                    : 'border-gray-200 bg-gray-50'
                } outline-none transition`}
                placeholder="Nhập họ tên"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled={true}
                className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 outline-none cursor-not-allowed"
                placeholder="email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-md ${
                  isEditing 
                    ? 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500' 
                    : 'border-gray-200 bg-gray-50'
                } outline-none transition`}
                placeholder="0123456789"
              />
            </div>

            {/* Địa chỉ */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md ${
                  isEditing 
                    ? 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500' 
                    : 'border-gray-200 bg-gray-50'
                } outline-none transition resize-none`}
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
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

      {/* Additional Info Cards */}
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
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
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
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
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
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
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