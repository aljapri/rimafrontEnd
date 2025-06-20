import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function ProfessorCourseDetails() {
  const { professorCourseId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState([]);

  const [hasForbidden, setHasForbidden] = useState(false); // 🔴 NEW STATE

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/professor-course/${professorCourseId}/students`
      );
      if (!res.ok) throw new Error("فشل في تحميل الطلاب");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!professorCourseId) return;
    fetchStudents();
    checkForbiddenStatus(); // 🟠 Check once on load
  }, [professorCourseId]);

  async function checkForbiddenStatus() {
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/professor-course/${professorCourseId}/students-attendance`
      );
      if (!res.ok) return;
      const data = await res.json();
      const hasAnyForbidden = data.some((s) => s.status === "ممنوع من التقديم");
      setHasForbidden(hasAnyForbidden); // 🔴 Set forbidden state
    } catch (err) {
      console.warn("خطأ في جلب بيانات التنبيهات:", err.message);
    }
  }

  async function removeStudent(studentId) {
    setRemovingId(studentId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/unenroll-student?studentId=${studentId}&professorCourseId=${professorCourseId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("فشل في حذف الطالب من الكورس");
      setSuccessMsg("تم حذف الطالب من الكورس.");
      fetchStudents();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء الحذف");
    } finally {
      setRemovingId(null);
    }
  }

  async function loadNotifications() {
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/professor-course/${professorCourseId}/students-attendance`
      );
      if (!res.ok) throw new Error("فشل تحميل الغياب");
      const data = await res.json();
      setAttendanceStatus(data);
      setNotificationsOpen(true);
    } catch (err) {
      alert("حدث خطأ أثناء تحميل التنبيهات");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">
          الطلاب المسجلون في الكورس
        </h1>

        {/* 🔔 Notification Button with Red Badge */}
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={loadNotifications}
          >
            <FaBell />
            عرض التنبيهات
          </button>

          {/* 🔴 Badge for Forbidden */}
          {hasForbidden && (
            <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow">
              !
            </span>
          )}
        </div>
      </div>

      {notificationsOpen && (
        <div className="bg-gray-100 p-4 rounded-xl shadow-inner mb-6">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">
            حالة الغياب حسب عدد الغيابات:
          </h2>
          <ul className="space-y-2">
            {attendanceStatus
              .filter(
                (s) =>
                  s.status === "تحذير: وصلت للحد المسموح" ||
                  s.status === "ممنوع من التقديم"
              )
              .map((s, i) => (
                <li
                  key={s.studentId || i}
                  className="text-gray-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold">{s.fullName}</span>:{" "}
                    <span className="font-semibold">
                      {s.absenceCount} غياب / الحد الأقصى {s.maxAllowed}
                    </span>{" "}
                    -{" "}
                    {s.status === "تحذير: وصلت للحد المسموح" ? (
                      <span className="text-yellow-600 font-bold">
                        ⚠️ {s.status}
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">
                        ⛔ {s.status}
                      </span>
                    )}
                  </div>
                  <button
                    className="ml-4 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `${API_BASE}/api/Professor/attendance/delete-latest?studentId=${s.studentId}&professorCourseId=${professorCourseId}`,
                          { method: "DELETE" }
                        );
                        if (!res.ok) throw new Error("فشل حذف الغياب");
                        loadNotifications();
                        alert("تم حذف آخر غياب بنجاح.");
                      } catch (err) {
                        alert("حدث خطأ عند حذف الغياب");
                      }
                    }}
                  >
                    حذف آخر غياب
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">
          جارٍ تحميل الطلاب...
        </p>
      ) : students.length === 0 ? (
        <p className="text-gray-600 text-center">
          لا يوجد طلاب مسجلين حتى الآن.
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">الاسم الكامل</th>
                <th className="px-6 py-3">البريد الإلكتروني</th>
                <th className="px-6 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={student.studentId || idx}
                  className="border-b hover:bg-indigo-50"
                >
                  <td className="px-6 py-3">{idx + 1}</td>
                  <td className="px-6 py-3">{student.fullName}</td>
                  <td className="px-6 py-3">{student.email}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => removeStudent(student.studentId)}
                      disabled={removingId === student.studentId}
                      className={`px-4 py-1 rounded text-white ${
                        removingId === student.studentId
                          ? "bg-gray-400"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {removingId === student.studentId
                        ? "جارٍ الحذف..."
                        : "حذف"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
