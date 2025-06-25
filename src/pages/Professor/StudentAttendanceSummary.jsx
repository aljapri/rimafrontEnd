import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaBell, FaChevronDown, FaChevronUp } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function StudentAttendanceSummary() {
  const { studentId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hasWarning, setHasWarning] = useState(false);
  const [hasForbidden, setHasForbidden] = useState(false);

  const getStudentStatus = (student) => {
    const practical =
      student.practicalAbsenceCount *
      student.maxAbsenceLimitPractical;
    const theoretical =
      student.theoreticalAbsenceCount *
      student.maxAbsenceLimitTheoretical;
    const total = practical + theoretical;
    const limit = student.fullAttendance;
    console.log(total);
    if (total > limit) return "محروم";
    if (total === limit) return "على الحد";
    return "نظامي";
  };

  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/Professor/Student/${studentId}/attendance-summary`
        );
        if (!res.ok) throw new Error("فشل في تحميل بيانات الحضور");
        const data = await res.json();
        setAttendance(data);
        console.log(data)
        setHasWarning(data.some((a) => getStudentStatus(a) === "على الحد"));
        setHasForbidden(data.some((a) => getStudentStatus(a) === "محروم"));
      } catch (err) {
        setError(err.message || "حدث خطأ");
      } finally {
        setLoading(false);
      }
    }
    if (studentId) loadAttendance();
  }, [studentId]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getStatusColor = (status) => {
    if (status.includes("محروم")) return "text-red-600";
    if (status.includes("على الحد")) return "text-yellow-600";
    return "text-green-600";
  };

  const isNonZeroPercentage = (value) => {
    return value && value !== "0.0%" && value !== "0%";
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 px-6 py-8 bg-white shadow-xl rounded-3xl">
      <h1 className="text-4xl md:text-5xl text-center font-bold mb-14 text-gray-800 leading-snug">
        مرحباً بك أيها الطالب 👨‍🎓
      </h1>

      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-semibold text-indigo-700">
          📋 ملخص الحضور والغياب
        </h2>

        <div className="relative group">
          <FaBell className="text-3xl text-yellow-500 cursor-pointer animate-pulse" />
          {(hasWarning || hasForbidden) && (
            <>
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                !
              </span>
              <div className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-lg p-4 text-right z-20 hidden group-hover:block">
                <h3 className="text-lg font-bold text-red-600 mb-2">🚨 تنبيهات</h3>
                {attendance
                  .filter(
                    (item) =>
                      getStudentStatus(item) === "محروم" ||
                      getStudentStatus(item) === "على الحد"
                  )
                  .map((item, i) => (
                    <div key={i} className="mb-3 border-b pb-2 last:border-none">
                      <p className="text-base font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p
                        className={`text-sm font-semibold ${getStatusColor(
                          getStudentStatus(item)
                        )}`}
                      >
                        {getStudentStatus(item)}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-center text-red-600 font-semibold mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">
          ⏳ جارٍ تحميل البيانات...
        </p>
      ) : attendance.length === 0 ? (
        <p className="text-center text-gray-400">لا توجد بيانات لعرضها حالياً.</p>
      ) : (
        <div className="space-y-6">
          {attendance.map((item, idx) => {
            const status = getStudentStatus(item);
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={item.courseId}
                className="border border-gray-200 rounded-2xl shadow-sm transition duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex justify-between items-center px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-t-2xl focus:outline-none"
                >
                  <div className="text-left">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      📘 {item.name}
                    </h3>
                    <p
                      className={`text-sm md:text-base font-medium mt-1 ${getStatusColor(
                        status
                      )}`}
                    >
                      الحالة: {status}
                    </p>
                  </div>
                  <div className="text-xl text-gray-500">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-white px-6 py-6 rounded-b-2xl text-right border-t border-gray-100 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                      {item.practicalHours > 0 && (
                        <div>
                          <strong>📌 عدد الساعات العملية:</strong>{" "}
                          {item.practicalHours}
                        </div>
                      )}
                      {item.theoreticalHours > 0 && (
                        <div>
                          <strong>📌 عدد الساعات النظرية:</strong>{" "}
                          {item.theoreticalHours}
                        </div>
                      )}
                      {item.practicalAbsenceCount > 0 && (
                        <div>
                          <strong>🚫 عدد الغيابات العملية:</strong>{" "}
                          {item.practicalAbsenceCount}
                        </div>
                      )}
                      {item.theoreticalAbsenceCount > 0 && (
                        <div>
                          <strong>🚫 عدد الغيابات النظرية:</strong>{" "}
                          {item.theoreticalAbsenceCount}
                        </div>
                      )}
                      {item.totalAbsences > 0 && (
                        <div>
                          <strong>📊 إجمالي الغيابات:</strong>{" "}
                          {item.totalAbsences}
                        </div>
                      )}
                    </div>

                    <hr className="my-3 border-gray-200" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                      {isNonZeroPercentage(item.allowedPracticalPercentage) && (
                        <div>
                          ✅ النسبة المسموح بها للغياب العملي:{" "}
                          <strong>{item.allowedPracticalPercentage}</strong>
                        </div>
                      )}
                      {isNonZeroPercentage(item.allowedTheoreticalPercentage) && (
                        <div>
                          ✅ النسبة المسموح بها للغياب النظري:{" "}
                          <strong>{item.allowedTheoreticalPercentage}</strong>
                        </div>
                      )}
                      <div>
                        ✅ النسبة الكلية المسموح بها:{" "}
                        <strong>{item.fullAttendance}%</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
