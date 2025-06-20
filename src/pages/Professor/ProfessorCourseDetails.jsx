import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUsers } from "react-icons/fa";

export default function ProfessorCourseDetails() {
  const { professorCourseId } = useParams(); // ⬅️ must match route in your Router

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!professorCourseId) return;

    async function fetchStudents() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/Professor/professor-course/${professorCourseId}/students`);
        if (!res.ok) throw new Error("فشل في جلب الطلاب");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message || "حدث خطأ");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [professorCourseId]);

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-12">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-800">
        الطلاب المسجلون في الكورس
      </h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">جاري التحميل...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-600 text-center">لا يوجد طلاب مسجلين حتى الآن.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">الاسم الكامل</th>
                <th className="px-6 py-3">البريد الإلكتروني</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.studentId || index} className="border-b hover:bg-indigo-50">
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{student.fullName}</td>
                  <td className="px-6 py-3">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
