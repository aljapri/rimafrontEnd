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

  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/Professor/Student/${studentId}/attendance-summary`);
        if (!res.ok) throw new Error("فشل في تحميل بيانات الحضور");
        const data = await res.json();
        setAttendance(data);
        setHasWarning(data.some((a) => a.status?.includes("تحذير")));
        setHasForbidden(data.some((a) => a.status?.includes("محروم")));
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
    if (status.includes("تحذير")) return "text-yellow-600";
    return "text-green-600";
  };

  const isNonZeroPercentage = (value) => {
    return value && value !== "0.0%" && value !== "0%";
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-5xl text-center font-bold mb-16">مرحبا بك أيها الطالب</h1>

      <div className="flex justify-between items-center mb-8 relative">
        <h2 className="text-3xl font-bold text-indigo-700">ملخص الحضور والغياب</h2>
        <div className="relative group">
          <FaBell className="text-yellow-500 text-3xl cursor-pointer" />
          {(hasWarning || hasForbidden) && (
            <>
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
                !
              </span>
              <div className="absolute right-0 mt-3 w-80 bg-white border rounded-lg shadow-lg p-4 text-right z-20 hidden group-hover:block">
                <h3 className="text-lg font-bold text-red-600 mb-3">تنبيهات:</h3>
                {attendance
                  .filter((item) => item.status?.includes("محروم") || item.status?.includes("تحذير"))
                  .map((item, i) => (
                    <div key={i} className="mb-3 border-b pb-2 last:border-none">
                      <p className="text-md font-semibold text-gray-800">{item.name}</p>
                      <p className={`text-sm font-bold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {error && <div className="text-red-600 text-center mb-6">{error}</div>}
      {loading ? (
        <p className="text-gray-500 animate-pulse text-center">جارٍ تحميل البيانات...</p>
      ) : (
        <>
          {attendance.length === 0 && (
            <p className="text-center text-gray-500">لا توجد بيانات حضور لعرضها</p>
          )}

          <div className="space-y-6">
            {attendance.map((item, idx) => {
              const status = item.status || "";
              const isExpanded = expandedIndex === idx;

              const maxAllowedAbsenceCount = Math.round(
                (parseFloat(item.allowedTotalPercentage.replace("%", "")) / 100) * item.fullAttendance
              );

              return (
                <div key={item.courseId} className="border rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full px-6 py-5 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition rounded-t-xl focus:outline-none"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                      <p className={`text-base font-semibold ${getStatusColor(status)}`}>
                        الحالة: {status}
                      </p>
                    </div>
                    <div className="text-gray-600 text-xl">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 py-5 bg-white rounded-b-xl border-t border-gray-200 space-y-6 text-right">
                      <div className="grid grid-cols-2 gap-4">
                        {item.practicalHours > 0 && (
                          <div><strong>عدد الساعات العملية:</strong> {item.practicalHours}</div>
                        )}
                        {item.theoreticalHours > 0 && (
                          <div><strong>عدد الساعات النظرية:</strong> {item.theoreticalHours}</div>
                        )}
                        
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {item.practicalAbsenceCount > 0 && (
                          <div><strong>عدد الغيابات العملية:</strong> {item.practicalAbsenceCount}</div>
                        )}
                        {isNonZeroPercentage(item.practicalAbsencePercentage) && (
                          <div><strong>نسبة الغياب العملي:</strong> {item.practicalAbsencePercentage}</div>
                        )}
                        {item.theoreticalAbsenceCount > 0 && (
                          <div><strong>عدد الغيابات النظرية:</strong> {item.theoreticalAbsenceCount}</div>
                        )}
                        {isNonZeroPercentage(item.theoreticalAbsencePercentage) && (
                          <div><strong>نسبة الغياب النظري:</strong> {item.theoreticalAbsencePercentage}</div>
                        )}
                        {item.totalAbsences > 0 && (
                          <div><strong>إجمالي الغيابات:</strong> {item.totalAbsences}</div>
                        )}
                        {isNonZeroPercentage(item.totalAbsencePercentage) && (
                          <div><strong>النسبة الكلية للغياب:</strong> {item.totalAbsencePercentage}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {isNonZeroPercentage(item.allowedPracticalPercentage) && (
                          <div><strong>النسبة المسموح بها للغياب العملي:</strong> {item.allowedPracticalPercentage}</div>
                        )}
                        {isNonZeroPercentage(item.allowedTheoreticalPercentage) && (
                          <div><strong>النسبة المسموح بها للغياب النظري:</strong> {item.allowedTheoreticalPercentage}</div>
                        )}
                        {isNonZeroPercentage(item.allowedTotalPercentage) && (
                          <div><strong>النسبة الكلية المسموحة:</strong> {item.allowedTotalPercentage}</div>
                        )}
                      </div>

                      {item.attendanceDetails?.length > 0 && (
                        <div>
                          <strong>تفاصيل الحضور:</strong>
                          <ul className="list-disc list-inside mt-1 text-gray-700">
                            {item.attendanceDetails.map((detail, i) => (
                              <li key={i}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
