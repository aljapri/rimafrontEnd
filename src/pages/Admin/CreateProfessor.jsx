import React, { useState } from "react";

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  specialization: "",
};

export default function CreateProfessor() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Basic validation function
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/Admin/create-professor-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log(res);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Email all ready uses ");
      }

      setSuccessMsg("Professor created successfully!");
      setFormData(initialFormState);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Professor</h1>

      {successMsg && (
        <div className="mb-4 p-3 text-green-800 bg-green-100 rounded">{successMsg}</div>
      )}

      {errors.submit && (
        <div className="mb-4 p-3 text-red-800 bg-red-100 rounded">{errors.submit}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <label className="block mb-2 font-semibold text-gray-700" htmlFor="fullName">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          id="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full p-3 border rounded ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3`}
          placeholder="Enter full name"
          aria-invalid={errors.fullName ? "true" : "false"}
          aria-describedby="fullName-error"
        />
        {errors.fullName && (
          <p className="text-red-600 text-sm mb-3" id="fullName-error">
            {errors.fullName}
          </p>
        )}

        {/* Email */}
        <label className="block mb-2 font-semibold text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full p-3 border rounded ${
            errors.email ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3`}
          placeholder="Enter email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby="email-error"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mb-3" id="email-error">
            {errors.email}
          </p>
        )}

        {/* Password */}
        <label className="block mb-2 font-semibold text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full p-3 border rounded ${
            errors.password ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3`}
          placeholder="Enter password"
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby="password-error"
        />
        {errors.password && (
          <p className="text-red-600 text-sm mb-3" id="password-error">
            {errors.password}
          </p>
        )}

        {/* Specialization */}
        <label className="block mb-2 font-semibold text-gray-700" htmlFor="specialization">
          Specialization
        </label>
        <input
          type="text"
          name="specialization"
          id="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className={`w-full p-3 border rounded ${
            errors.specialization ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6`}
          placeholder="Enter specialization"
          aria-invalid={errors.specialization ? "true" : "false"}
          aria-describedby="specialization-error"
        />
        {errors.specialization && (
          <p className="text-red-600 text-sm mb-6" id="specialization-error">
            {errors.specialization}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Creating..." : "Create Professor"}
        </button>
      </form>
    </div>
  );
}
