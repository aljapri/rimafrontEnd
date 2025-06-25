import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function AddAttendance() {
  const { professorCourseId } = useParams();
  const [students, setStudents] = useState([]);
  const [attending, setAttending] = useState({});
  const [messages, setMessages] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch(
          `${API_BASE}/api/Professor/professor-course/${professorCourseId}/students`
        );
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        alert("فشل تحميل الطلاب.");
      }
    }
    loadStudents();
  }, [professorCourseId]);

  const handleAttendanceClick = (studentId, isPresent) => {
    setAttending((prev) => ({ ...prev, [studentId]: isPresent }));
    // Clear message when changing attendance status
    setMessages((prev) => ({ ...prev, [studentId]: "" }));
  };

  const handleSubmit = async (studentId) => {
    const isPresent = attending[studentId];
    if (isPresent === undefined) {
      setMessages((prev) => ({
        ...prev,
        [studentId]: "الرجاء اختيار حالة الحضور.",
      }));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/Professor/record-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          professorCourseId,
          isPresent,
          notes: "",
          sessionDate: date
        }),
      });

      if (!res.ok) {
        // Check if the error is due to duplicate attendance
        if (res.status === 409 ) {
          throw new Error("هذا الطالب مسجل حضوره لهذا التاريخ بالفعل");
        }
        throw new Error("");
      }

      setMessages((prev) => ({
        ...prev,
        [studentId]: "تم إرسال الحضور بنجاح.",
      }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [studentId]: err.message || "حدث خطأ أثناء الإرسال.",
      }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-800">
        تسجيل الحضور والغياب
      </h1>

      <div className="mb-6 text-center">
        <label className="block mb-2 font-medium text-gray-700">تاريخ الحصة:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            // Clear all messages when date changes
            setMessages({});
          }}
          className="border border-gray-300 rounded px-4 py-2"
        />
      </div>

      {students.length === 0 ? (
        <p className="text-gray-500 text-center">لا يوجد طلاب.</p>
      ) : (
        <table className="w-full text-sm text-left text-gray-700 mb-4">
          <thead className="bg-indigo-100">
            <tr>
              <th className="px-4 py-2">الاسم</th>
              <th className="px-4 py-2">الإجراء</th>
              <th className="px-4 py-2">إرسال</th>
              <th className="px-4 py-2">الرسالة</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentId} className="border-b">
                <td className="px-4 py-2">{student.fullName}</td>
                <td className="px-4 py-2 space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded text-white ${
                      attending[student.studentId] === true
                        ? "bg-green-700"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    onClick={() => handleAttendanceClick(student.studentId, true)}
                  >
                    حاضر
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded text-white ${
                      attending[student.studentId] === false
                        ? "bg-red-700"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                    onClick={() => handleAttendanceClick(student.studentId, false)}
                  >
                    غائب
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleSubmit(student.studentId)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded"
                    disabled={attending[student.studentId] === undefined}
                  >
                    تسجيل
                  </button>
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`${messages[student.studentId]?.includes("نجاح") ? "text-green-600" : "text-red-600"}`}>
                    {messages[student.studentId]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}