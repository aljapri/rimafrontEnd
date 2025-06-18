import React, { useState } from "react";

const USER_TYPES = [
  { value: "student", label: "طالب", iconClass: "icon-graduation" },
  { value: "professor", label: "عضو هيئة تدريس", iconClass: "icon-user-tie" }
];

export default function Login() {
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSwitch = (type) => {
    setUserType(type);
    setFormData({ email: "", password: "" });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);

    const payload = {
      email: formData.email,
      password: formData.password,
      userType
    };

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (response.status === 403) {
          throw new Error("هذا الحساب غير مصرح له بالدخول كـ " + 
            (userType === "student" ? "طالب" : "عضو هيئة تدريس"));
        } else {
          throw new Error(data.message || "حدث خطأ أثناء محاولة تسجيل الدخول");
        }
      }

      // Save authentication info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.user.role);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Redirect based on user type
      const role = data.user.role.toLowerCase();
      if (role === "professor") window.location.href = "/professor/dashboard";
      else window.location.href = "/student";

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4"
      dir="rtl"
      lang="ar"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
          <p className="text-indigo-100 mt-1">سجل الدخول للوصول إلى حسابك</p>
        </div>

        {/* User Type Switch */}
        <nav className="flex border-b border-gray-200" aria-label="Tabs">
          {USER_TYPES.map(({ value, label, iconClass }) => (
            <button
              key={value}
              onClick={() => handleSwitch(value)}
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                userType === value
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <i className={iconClass}></i>
              {label}
            </button>
          ))}
        </nav>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded flex items-start gap-2">
              <i className="icon-warning text-red-500 mt-0.5"></i>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <i className="icon-envelope mr-1"></i> البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="أدخل البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              <i className="icon-lock mr-1"></i> كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className={showPassword ? "icon-eye" : "icon-eye-blocked"}></i>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="icon-spinner animate-spin"></i> جاري تسجيل الدخول...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="icon-enter"></i> تسجيل الدخول
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
          <div className="flex flex-col space-y-2">

            <p className="text-xs text-gray-600">
              ليس لديك حساب؟{" "}
              <a href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
                إنشاء حساب جديد
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}