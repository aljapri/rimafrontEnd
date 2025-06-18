import React from "react";

export default function Student() {
  // Sample courses data - you would typically fetch this from an API
  const courses = [
    { id: 1, title: "المنطق العائم" },
    { id: 2, title: "دارات منطقية" },
    { id: 3, title: "تحليل رياضي" }
  ];

  return (
    <div className="student-dashboard" lang="ar" dir="rtl">
      <header>
        <h1>مرحباً بك، الطالب</h1>
      </header>

      <div className="course-container">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-title">{course.title}</div>
            <div className="action-buttons">
              <button className="absence">الغيابات</button>
              <button className="warning">الإنذارات</button>
              <button className="notice">🔔</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}