import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/authentication/verify-email`;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setMessage("Thiếu token xác minh.");
        setStatus("error");
        return;
      }

      try {
        await axios.get(API_URL, {
          params: { token },
          withCredentials: false
        });
        setStatus("success");
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.";
        console.error("Verify failed:", errorMsg);
        setMessage(errorMsg);
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">

        {status === "loading" && (
          <>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Đang xác minh email...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-semibold mb-2 text-green-600">
              Xác minh thành công 🎉
            </h2>
            <p className="text-gray-600 mb-3">
              Email của bạn đã được xác minh. Bạn có thể đăng nhập.
            </p>
            <Link to="/login" className="text-green-600 underline hover:text-green-700 font-medium">
              Đi đến trang đăng nhập
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Liên kết không hợp lệ ❌
            </h2>
            <p className="text-gray-600 mb-3">
              {message || "Token đã hết hạn hoặc không hợp lệ."}
            </p>
            <Link to="/login" className="text-green-600 underline hover:text-green-700 font-medium">
              Quay lại trang đăng nhập
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
