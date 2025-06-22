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
  const [absenceViolators, setAbsenceViolators] = useState([]);
  const [hasForbidden, setHasForbidden] = useState(false);

  const [courseId, setCourseId] = useState(null);

  async function fetchCourseId() {
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/professor-course/${professorCourseId}`
      );
      if (!res.ok) throw new Error("فشل في جلب بيانات الكورس");
      const data = await res.json();
      setCourseId(data.courseId);
    } catch (err) {
      console.warn("خطأ في جلب courseId:", err.message);
    }
  }

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

  async function loadAbsenceViolators() {
    if (!courseId) {
      setError("لم يتم تحميل بيانات الكورس بعد.");
      return;
    }
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/Professor/course/${courseId}/absence-violators`
      );
      if (!res.ok) throw new Error("فشل في تحميل بيانات الغياب");
      const data = await res.json();
      setAbsenceViolators(data);
      const forbiddenExists = data.some((s) => s.status === "محروم");
      setHasForbidden(forbiddenExists);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تحميل التنبيهات");
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

  useEffect(() => {
    if (!professorCourseId) return;
    fetchCourseId();
    fetchStudents();
  }, [professorCourseId]);

  useEffect(() => {
    if (courseId) {
      loadAbsenceViolators();
    }
  }, [courseId]);

  function toggleNotifications() {
    if (!notificationsOpen) {
      loadAbsenceViolators();
    }
    setNotificationsOpen((open) => !open);
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">
          الطلاب المسجلون في الكورس
        </h1>

        <div className="relative">
          <button
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={toggleNotifications}
            disabled={!courseId}
            title={!courseId ? "جارٍ تحميل بيانات الكورس..." : ""}
          >
            <FaBell />
            عرض التنبيهات
          </button>

          {hasForbidden && (
            <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow">
              !
            </span>
          )}
        </div>
      </div>

      {/* التنبيهات - قائمة الطلاب المخالفين */}
      {notificationsOpen && (
        <div className="bg-gray-100 p-4 rounded-xl shadow-inner mb-6 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">
            قائمة الطلاب المخالفين لحضور الكورس
          </h2>
          {error && <p className="text-red-600">{error}</p>}
          {absenceViolators.length === 0 && !error && (
            <p className="text-gray-600 text-center">
              لا يوجد طلاب مخالفين للغياب.
            </p>
          )}

          <ul className="space-y-4">
            {absenceViolators.map((s) => (
              <li
                key={s.studentId}
                className="bg-white border border-gray-300 rounded p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <strong className="text-lg">{s.fullName}</strong>
                  <span
                    className={`font-bold ${
                      s.status === "محروم"
                        ? "text-red-600"
                        : s.status === "تحذير"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div>
                  <p>عدد الغيابات العملي: <strong>{s.practicalAbsenceCount}</strong></p>
                  <p>عدد الغيابات النظري: <strong>{s.theoreticalAbsenceCount}</strong></p>
                  <p>إجمالي عدد الغيابات: <strong>{s.totalAbsencesCount}</strong></p>
                </div>

                <div>
                  <p>نسبة الغياب العملي: <strong>{s.practicalAbsencePercentage}</strong></p>
                  <p>نسبة الغياب النظري: <strong>{s.theoreticalAbsencePercentage}</strong></p>
                  <p>النسبة الكلية للغياب: <strong>{s.totalAbsencePercentage}</strong></p>
                </div>

                <div>

                  <p>الحد المسموح للغياب الكلي: <strong>{s.allowedTotalPercentage}</strong></p>
                </div>

                <div>
                  <p>تفاصيل الغيابات في المواد:</p>
                  <ul className="list-disc list-inside">
                    {s.courses.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* زر حذف آخر غياب */}
                <button
                  className="ml-auto mt-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                  onClick={async () => {
                    setError(null);
                    setSuccessMsg(null);
                    try {
                      const res = await fetch(
                        `${API_BASE}/api/Professor/attendance/delete-latest?studentId=${s.studentId}&professorCourseId=${professorCourseId}`,
                        { method: "DELETE" }
                      );
                      if (!res.ok) throw new Error("فشل حذف الغياب");
                      await loadAbsenceViolators();
                      setSuccessMsg("تم حذف آخر غياب بنجاح.");
                    } catch (err) {
                      setError("حدث خطأ عند حذف الغياب");
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

      {/* رسائل الخطأ والنجاح */}
      {error && !notificationsOpen && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}

      {/* جدول الطلاب المسجلين */}
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
                      {removingId === student.studentId ? "جارٍ الحذف..." : "حذف"}
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
