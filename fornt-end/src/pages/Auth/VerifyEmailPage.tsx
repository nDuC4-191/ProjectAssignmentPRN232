import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authService } from "../../services/auth.service";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired" | "already_verified">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      console.log("=== VERIFY EMAIL DEBUG ===");
      console.log("Token from URL:", token);
      console.log("Token length:", token?.length);
      
      if (!token) {
        console.error("❌ No token provided");
        setMessage("Thiếu token xác minh.");
        setStatus("error");
        return;
      }

      try {
        console.log("⏳ Calling authService.verifyEmail...");
        const response = await authService.verifyEmail(token);
        
        console.log("📦 Response received:", response);
        console.log("   - success:", response.success);
        console.log("   - message:", response.message);
        
        if (response.success === true) {
          console.log("✅ Verification successful!");
          setMessage(response.message || "Xác minh thành công!");
          setStatus("success");
        } else {
          console.warn("⚠️ Response success is not true:", response.success);
          setMessage(response.message || "Xác minh thất bại.");
          setStatus("error");
        }
      } catch (error: any) {
        console.error("❌ Verification failed:", error);
        console.error("   - Error message:", error.message);
        
        const errorMsg = error.message || "Token không hợp lệ hoặc đã hết hạn.";
        setMessage(errorMsg);
        
        // Xử lý các trường hợp cụ thể
        const lowerMsg = errorMsg.toLowerCase();
        
        // Token đã hết hạn
        if (lowerMsg.includes("hết hạn") || lowerMsg.includes("expired")) {
          console.log("⏰ Token expired");
          setStatus("expired");
        } 
        // Token đã được sử dụng hoặc không tồn tại (có thể đã verify rồi)
        else if (lowerMsg.includes("không tồn tại") || 
                 lowerMsg.includes("đã được sử dụng") ||
                 lowerMsg.includes("đã xác minh")) {
          console.log("♻️ Token already used");
          setStatus("already_verified");
        } 
        // Lỗi khác
        else {
          console.log("❌ Other error");
          setStatus("error");
        }
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">

        {/* LOADING STATE */}
        {status === "loading" && (
          <>
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Đang xác minh email...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <>
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">
              Xác minh thành công!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link 
              to="/login" 
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Đăng nhập ngay
            </Link>
          </>
        )}

        {/* ALREADY VERIFIED STATE (Token đã dùng) */}
        {status === "already_verified" && (
          <>
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="text-xl font-semibold mb-2 text-blue-600">
              Link đã được sử dụng
            </h2>
            <p className="text-gray-600 mb-4">
              Link xác minh này đã được sử dụng trước đó. 
              {" "}Nếu bạn đã xác minh email thành công, vui lòng đăng nhập.
            </p>
            <div className="space-y-3">
              <Link 
                to="/login" 
                className="block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Đăng nhập ngay
              </Link>
              <p className="text-sm text-gray-500 pt-2 border-t">
                Nếu bạn chưa xác minh email hoặc gặp vấn đề, vui lòng{" "}
                <Link to="/resend-verification" className="text-green-600 hover:underline font-medium">
                  yêu cầu gửi lại email xác minh
                </Link>
              </p>
            </div>
          </>
        )}

        {/* EXPIRED STATE */}
        {status === "expired" && (
          <>
            <div className="mb-4 text-5xl">⏰</div>
            <h2 className="text-xl font-semibold mb-2 text-orange-600">
              Link đã hết hạn
            </h2>
            <p className="text-gray-600 mb-4">
              Link xác minh đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh mới.
            </p>
            <div className="space-y-2">
              <Link 
                to="/resend-verification" 
                className="block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Gửi lại email xác minh
              </Link>
              <Link 
                to="/login" 
                className="block text-gray-600 hover:text-gray-800 font-medium"
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          </>
        )}

        {/* ERROR STATE (Lỗi khác) */}
        {status === "error" && (
          <>
            <div className="mb-4 text-5xl">❌</div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Xác minh thất bại
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <Link 
                to="/resend-verification" 
                className="block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Gửi lại email xác minh
              </Link>
              <Link 
                to="/login" 
                className="block text-gray-600 hover:text-gray-800 font-medium"
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}