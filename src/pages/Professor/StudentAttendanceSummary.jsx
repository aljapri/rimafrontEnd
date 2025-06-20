import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaBell, FaChevronDown, FaChevronUp } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function StudentAttendanceSummary() {
  const { studentId } = useParams();
  console.log(studentId);
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
        setHasForbidden(data.some((a) => a.status?.includes("ممنوع")));
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
    if (status.includes("ممنوع")) return "text-red-600";
    if (status.includes("تحذير")) return "text-yellow-600";
    return "text-green-600";
  };
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-6xl w-full text-center font-bold mb-20">مرحبا بك ايها الطالب</h1>
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-2xl font-bold text-indigo-700">ملخص الحضور والغياب</h1>
  
        <div className="relative group">
          <FaBell className="text-yellow-500 text-2xl cursor-pointer" />
          {(hasWarning || hasForbidden) && (
            <>
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                !
              </span>
  
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg p-3 text-right z-10 hidden group-hover:block">
                <h3 className="text-md font-bold text-red-600 mb-2">تنبيهات:</h3>
                {attendance
                  .filter((item) => item.status?.includes("ممنوع") || item.status?.includes("تحذير"))
                  .map((item, i) => (
                    <div key={i} className="mb-2 border-b pb-2 last:border-none">
                      <p className="text-sm font-semibold text-gray-800">{item.courseName}</p>
                      <p className="text-xs text-gray-600">
                        الغيابات: {item.absenceCount} / الحد: {item.maxAllowed}
                      </p>
                      <p className={`text-xs font-bold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
  
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <p className="text-gray-500 animate-pulse">جارٍ تحميل البيانات...</p>
      ) : (
        <div className="space-y-4">
          {attendance.map((item, idx) => {
            const status = item.status || "";
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="border rounded-xl shadow-md">
                <button
                  className="w-full px-5 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition rounded-t-xl"
                  onClick={() => toggleExpand(idx)}
                >
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{item.courseName}</h2>
                    <span className={`text-sm font-semibold ${getStatusColor(status)}`}>{status}</span>
                  </div>
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
  
                {isExpanded && (
                  <div className="px-5 py-4 bg-white rounded-b-xl border-t">
                    <p className="text-sm text-gray-700 mb-1">
                      عدد الغيابات: <span className="font-bold">{item.absenceCount ?? 0}</span>
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      الحد المسموح به: <span className="font-bold">{item.maxAllowed ?? 0}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      الحالة:{" "}
                      <span className={`font-bold ${getStatusColor(status)}`}>{status}</span>
                    </p>
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
