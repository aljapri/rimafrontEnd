import React, { useState } from "react";

const initialState = {
  name: "",
  practicalHours: 0,
  theoreticalHours: 0,
  maxAbsenceLimit: 5,
  maxAbsenceLimitPractical: 0,
  maxAbsenceLimitTheoretical: 0,
  fullAttendance: 0, // changed to number
};

export default function CreateCourse() {
  const [form, setForm] = useState(initialState);
  const [courseType, setCourseType] = useState("both");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const finalForm = {
      ...form,
      practicalHours: courseType !== "theoretical" ? Number(form.practicalHours) : 0,
      theoreticalHours: courseType !== "practical" ? Number(form.theoreticalHours) : 0,
      maxAbsenceLimitPractical: courseType !== "theoretical" ? Number(form.maxAbsenceLimitPractical) : 0,
      maxAbsenceLimitTheoretical: courseType !== "practical" ? Number(form.maxAbsenceLimitTheoretical) : 0,
      totalHours:
        (courseType !== "theoretical" ? Number(form.practicalHours) : 0) +
        (courseType !== "practical" ? Number(form.theoreticalHours) : 0),
      fullAttendance: Number(form.fullAttendance), // ensure it's a number
    };

    try {
      const res = await fetch("http://localhost:5000/api/Admin/add-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm),
      });

      if (!res.ok) throw new Error("Failed to create course");

      setSuccess("Course created successfully!");
      setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Course</h2>
      {success && <p className="text-green-600 mb-2">{success}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold">Course Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-semibold">Course Type</label>
        <select
          value={courseType}
          onChange={(e) => setCourseType(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="both">Both Practical and Theoretical</option>
          <option value="practical">Practical Only</option>
          <option value="theoretical">Theoretical Only</option>
        </select>

        {(courseType === "practical" || courseType === "both") && (
          <>
            <label className="block mb-2 font-semibold">Practical Hours</label>
            <input
              type="number"
              name="practicalHours"
              value={form.practicalHours}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2 font-semibold">Practical absence rate            </label>
            <input
              type="number"
              name="maxAbsenceLimitPractical"
              value={form.maxAbsenceLimitPractical}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
          </>
        )}

        {(courseType === "theoretical" || courseType === "both") && (
          <>
            <label className="block mb-2 font-semibold">Theoretical Hours</label>
            <input
              type="number"
              name="theoreticalHours"
              value={form.theoreticalHours}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2 font-semibold"> theoretical absence rate  </label>
            <input
              type="number"
              name="maxAbsenceLimitTheoretical"
              value={form.maxAbsenceLimitTheoretical}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
          </>
        )}

        {/* <label className="block mb-2 font-semibold">Max Total Absence Limit</label>
        <input
          type="number"
          name="maxAbsenceLimit"
          value={form.maxAbsenceLimit}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        /> */}

        <label className="block mb-2 font-semibold">Permissible percentage of absence        </label>
        <input
          type="number"
          name="fullAttendance"
          value={form.fullAttendance}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
