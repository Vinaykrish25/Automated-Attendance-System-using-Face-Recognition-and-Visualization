// src/pages/AttendanceVisualization.js
import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import api from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../Styles/AttendanceVisualization.css";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  ArcElement, // for Pie charts
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Define initial filter objects:
const initialAdminFilter = { rollNumber: "", name: "", date: "" };
const initialDateFilter = { date: "" };

const AttendanceVisualization = () => {
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState("");
  const userRole = localStorage.getItem("userRole") || "student";

  // Separate filter states for each chart
  const [filterChart1, setFilterChart1] = useState(
    userRole === "admin" ? initialAdminFilter : initialDateFilter
  );
  const [filterChart2, setFilterChart2] = useState(
    userRole === "admin" ? initialAdminFilter : initialDateFilter
  );
  const [filterChart3, setFilterChart3] = useState(initialDateFilter);
  const [filterChart4, setFilterChart4] = useState(initialDateFilter);
  const [filterChart5, setFilterChart5] = useState(
    userRole === "admin" ? initialAdminFilter : initialDateFilter
  );
  const [filterChart6, setFilterChart6] = useState(initialDateFilter);
  const [filterChart7, setFilterChart7] = useState(
    userRole === "admin" ? initialAdminFilter : initialDateFilter
  );
  const [filterChart8, setFilterChart8] = useState(
    userRole === "admin" ? initialAdminFilter : initialDateFilter
  );

  // For the single student pie chart (chart 8)
  const [selectedStudent, setSelectedStudent] = useState("");

  // Fetch attendance data on mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/attendance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching attendance");
      }
    };
    fetchAttendance();
  }, []);

  // Helper: get unique values from filtered attendance data
  const getUniqueValues = (data, key) => {
    return [...new Set(data.map((record) => record[key]))];
  };

  // Helper function to apply a filter object to attendance data
  const applyFilter = (attendance, filter, userRole) => {
    return attendance.filter((record) => {
      if (userRole === "admin") {
        const matchRoll = filter.rollNumber
          ? record.rollNumber.toString().includes(filter.rollNumber)
          : true;
        const matchName = filter.name
          ? record.name.toLowerCase().includes(filter.name.toLowerCase())
          : true;
        const matchDate = filter.date ? record.date === filter.date : true;
        return matchRoll && matchName && matchDate;
      } else {
        return filter.date ? record.date === filter.date : true;
      }
    });
  };

  // ---------- Chart 1: Bar Chart - Absent Periods by Student ----------
  const filteredData1 = applyFilter(attendance, filterChart1, userRole);
  const studentNames = getUniqueValues(filteredData1, "name");
  const absentCountsByStudent = studentNames.map((name) => {
    const recs = filteredData1.filter((rec) => rec.name === name);
    let totalAbsent = 0;
    recs.forEach((rec) => {
      [
        "1st Period",
        "2nd Period",
        "3rd Period",
        "4th Period",
        "5th Period",
        "6th Period",
        "7th Period",
      ].forEach((period) => {
        if (rec[period] === "Absent") totalAbsent += 1;
      });
    });
    return totalAbsent;
  });
  const barDataStudent = {
    labels: studentNames,
    datasets: [
      {
        label: "Total Absent Periods",
        data: absentCountsByStudent,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // ---------- Chart 2: Bar Chart - Absences by Period ----------
  const filteredData2 = applyFilter(attendance, filterChart2, userRole);
  const studentNames2 = getUniqueValues(filteredData2, "name");
  const presentCountsByStudent = studentNames2.map((name) => {
    const recs = filteredData2.filter((rec) => rec.name === name);
    let totalPresent = 0;
    recs.forEach((rec) => {
      [
        "1st Period",
        "2nd Period",
        "3rd Period",
        "4th Period",
        "5th Period",
        "6th Period",
        "7th Period",
      ].forEach((period) => {
        if (rec[period] === "Present") totalPresent += 1;
      });
    });
    return totalPresent;
  });
  const barDataStudent2 = {
    labels: studentNames2,
    datasets: [
      {
        label: "Total Present Periods",
        data: presentCountsByStudent,
        backgroundColor: "rgba(99, 174, 255, 0.6)",
      },
    ],
  };

  // ---------- Chart 3: Line Chart - Overall Attendance Trend by Date ----------
  const filteredData3 = applyFilter(attendance, filterChart3, userRole);
  const dates = getUniqueValues(filteredData3, "date").sort();
  const presentByDate = dates.map((date) => {
    const recs = filteredData3.filter((rec) => rec.date === date);
    let totalPresent = 0;
    recs.forEach((rec) => {
      [
        "1st Period",
        "2nd Period",
        "3rd Period",
        "4th Period",
        "5th Period",
        "6th Period",
        "7th Period",
      ].forEach((period) => {
        if (rec[period] === "Present") totalPresent += 1;
      });
    });
    return totalPresent;
  });
  const lineDataOverall = {
    labels: dates,
    datasets: [
      {
        label: "Total Present",
        data: presentByDate,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  // ---------- Chart 4: Line Chart - Present and Absent Trend ----------
  const filteredData4 = applyFilter(attendance, filterChart4, userRole);
  const dates4 = getUniqueValues(filteredData4, "date").sort();
  const presentAbsentByDate = dates4.map((date) => {
    const recs = filteredData4.filter((rec) => rec.date === date);
    let totalPresent = 0;
    let totalAbsent = 0;
    recs.forEach((rec) => {
      [
        "1st Period",
        "2nd Period",
        "3rd Period",
        "4th Period",
        "5th Period",
        "6th Period",
        "7th Period",
      ].forEach((period) => {
        if (rec[period] === "Present") totalPresent += 1;
        if (rec[period] === "Absent") totalAbsent += 1;
      });
    });
    return { present: totalPresent, absent: totalAbsent };
  });
  const lineDataAbsentPresentPeriod = {
    labels: dates4,
    datasets: [
      {
        label: "Present",
        data: presentAbsentByDate.map((item) => item.present),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Absent",
        data: presentAbsentByDate.map((item) => item.absent),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  // ---------- Chart 5: Stacked Bar Chart - Attendance Composition per Student ----------
  const filteredData5 = applyFilter(attendance, filterChart5, userRole);
  const stackedDataByStudent = studentNames.map((name) => {
    const recs = filteredData5.filter((rec) => rec.name === name);
    let presentCount = 0,
      absentCount = 0;
    recs.forEach((rec) => {
      [
        "1st Period",
        "2nd Period",
        "3rd Period",
        "4th Period",
        "5th Period",
        "6th Period",
        "7th Period",
      ].forEach((period) => {
        if (rec[period] === "Present") presentCount += 1;
        if (rec[period] === "Absent") absentCount += 1;
      });
    });
    return { present: presentCount, absent: absentCount };
  });
  const stackedBarDataStudent = {
    labels: studentNames,
    datasets: [
      {
        label: "Present",
        data: stackedDataByStudent.map((item) => item.present),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Absent",
        data: stackedDataByStudent.map((item) => item.absent),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // ---------- Chart 6: Stacked Bar Chart - Daily Attendance Composition ----------
  const filteredData6 = applyFilter(attendance, filterChart6, userRole);
  const stackedDataByDate = dates.map((date) => {
    const recs = filteredData6.filter((rec) => rec.date === date);
    let totalPresent = 0,
      totalAbsent = 0;
    recs.forEach((rec) => {
      [
        "1st Period",
        "2nd Period",
        "3rd Period",
        "4th Period",
        "5th Period",
        "6th Period",
        "7th Period",
      ].forEach((period) => {
        if (rec[period] === "Present") totalPresent += 1;
        if (rec[period] === "Absent") totalAbsent += 1;
      });
    });
    return { present: totalPresent, absent: totalAbsent };
  });
  const stackedBarDataDate = {
    labels: dates,
    datasets: [
      {
        label: "Present",
        data: stackedDataByDate.map((item) => item.present),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Absent",
        data: stackedDataByDate.map((item) => item.absent),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // ---------- Chart 7: Pie Chart - Overall Attendance Proportions (all students) ----------
  const filteredData7 = applyFilter(attendance, filterChart7, userRole);
  let overallPresent = 0,
    overallAbsent = 0;
  filteredData7.forEach((rec) => {
    [
      "1st Period",
      "2nd Period",
      "3rd Period",
      "4th Period",
      "5th Period",
      "6th Period",
      "7th Period",
    ].forEach((period) => {
      if (rec[period] === "Present") overallPresent += 1;
      if (rec[period] === "Absent") overallAbsent += 1;
    });
  });
  const pieDataOverall = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [overallPresent, overallAbsent],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  // ---------- Chart 8: Pie Chart - Single Student Attendance Proportions ----------
  const filteredData8 = applyFilter(attendance, filterChart8, userRole);
  let singleStudentAttendance = [];
  if (userRole === "admin") {
    if (selectedStudent) {
      singleStudentAttendance = filteredData8.filter(
        (rec) =>
          rec.name === selectedStudent ||
          rec.rollNumber.toString() === selectedStudent
      );
    } else if (studentNames.length > 0) {
      singleStudentAttendance = filteredData8.filter(
        (rec) => rec.name === studentNames[0]
      );
    }
  } else {
    singleStudentAttendance = filteredData8;
  }
  let studentPresent = 0,
    studentAbsent = 0;
  singleStudentAttendance.forEach((rec) => {
    [
      "1st Period",
      "2nd Period",
      "3rd Period",
      "4th Period",
      "5th Period",
      "6th Period",
      "7th Period",
    ].forEach((period) => {
      if (rec[period] === "Present") studentPresent += 1;
      if (rec[period] === "Absent") studentAbsent += 1;
    });
  });
  const pieDataStudent = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [studentPresent, studentAbsent],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  const handleExportDashboard = async () => {
    const chartCanvases = document.querySelectorAll(".chart-section canvas");
    if (!chartCanvases.length) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < chartCanvases.length; i += 2) {
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.style.background = "white";
      container.style.padding = "20px";
      container.style.width = "1000px";

      [0, 1].forEach((offset) => {
        if (chartCanvases[i + offset]) {
          const canvas = chartCanvases[i + offset];
          const imgDataUrl = canvas.toDataURL("image/png");

          const img = document.createElement("img");
          img.src = imgDataUrl;
          img.style.marginBottom = "30px";
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          container.appendChild(img);
        }
      });

      document.body.appendChild(container);
      const canvasImage = await html2canvas(container, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvasImage.toDataURL("image/jpeg", 1.0);

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
      document.body.removeChild(container);
    }

    pdf.save("attendance_dashboard.pdf");
  };

  const dataLabelPluginOptions = {
    datalabels: {
      anchor: "end",
      align: "top",
      formatter: (value) => value,
      color: "black",
      font: { weight: 800 },
    },
  };

  // const pieLabelPluginOptions = {
  //   datalabels: {
  //     formatter: (value, context) => {
  //       const label = context.chart.data.labels[context.dataIndex];
  //       return `${label}: ${value}`;
  //     },
  //     color: "black",
  //     font: { weight: 800 },
  //   },
  // };

  const StudentNameHeading = ({ name }) =>
    name ? <h5 className="selected-student-name">Student: {name}</h5> : null;

  return (
    <div className="attendance-visualization">
      <h2>Attendance Visualization 📶</h2>

      {/* Chart 1: Absent Periods by Student */}
      <div className="chart-section">
        <h3>Absent Periods by Student</h3>
        <div className="filter-section">
          {userRole === "admin" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Filter by Roll Number"
                value={filterChart1.rollNumber}
                onChange={(e) =>
                  setFilterChart1({
                    ...filterChart1,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <input
                type="text"
                name="name"
                placeholder="Filter by Name"
                value={filterChart1.name}
                onChange={(e) =>
                  setFilterChart1({
                    ...filterChart1,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </>
          )}
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart1.date}
            onChange={(e) =>
              setFilterChart1({
                ...filterChart1,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart1(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        <Bar
          data={barDataStudent}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Absent Periods by Student" },
              midPointLine: {},
              dataLabelPluginOptions,
            },
          }}
        />
      </div>

      {/* Chart 2: Absences by Period */}
      <div className="chart-section">
        <h3>Present Periods by Student</h3>
        <div className="filter-section">
          {userRole === "admin" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Filter by Roll Number"
                value={filterChart2.rollNumber}
                onChange={(e) =>
                  setFilterChart2({
                    ...filterChart2,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <input
                type="text"
                name="name"
                placeholder="Filter by Name"
                value={filterChart2.name}
                onChange={(e) =>
                  setFilterChart2({
                    ...filterChart2,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </>
          )}
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart2.date}
            onChange={(e) =>
              setFilterChart2({
                ...filterChart2,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart2(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        <Bar
          data={barDataStudent2}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Present Periods by Student" },
              midPointLine: {},
              dataLabelPluginOptions,
            },
          }}
        />
      </div>

      {/* Chart 3: Overall Attendance Trend (Line Chart) */}
      <div className="chart-section">
        <h3>Overall Attendance Trend</h3>
        <div className="filter-section">
          {userRole === "admin" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Filter by Roll Number"
                value={filterChart3.rollNumber}
                onChange={(e) =>
                  setFilterChart3({
                    ...filterChart3,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <input
                type="text"
                name="name"
                placeholder="Filter by Name"
                value={filterChart3.name}
                onChange={(e) =>
                  setFilterChart3({
                    ...filterChart3,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </>
          )}
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart3.date}
            onChange={(e) =>
              setFilterChart3({
                ...filterChart3,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart3(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        <Line
          data={lineDataOverall}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Overall Attendance Trend" },
            },
          }}
        />
      </div>

      {/* Chart 4: Absent and Present Trend (Line Chart) */}
      <div className="chart-section">
        <h3>Absent and Present Trend</h3>
        <div className="filter-section">
          {userRole === "admin" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Filter by Roll Number"
                value={filterChart4.rollNumber}
                onChange={(e) =>
                  setFilterChart4({
                    ...filterChart4,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <input
                type="text"
                name="name"
                placeholder="Filter by Name"
                value={filterChart4.name}
                onChange={(e) =>
                  setFilterChart4({
                    ...filterChart4,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </>
          )}
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart4.date}
            onChange={(e) =>
              setFilterChart4({
                ...filterChart4,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart4(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        <Line
          data={lineDataAbsentPresentPeriod}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Absent and Present Trend" },
            },
          }}
        />
      </div>

      {/* Chart 5: Stacked Bar Chart - Attendance Composition per Student */}
      <div className="chart-section">
        <h3>Attendance Composition per Student</h3>
        <div className="filter-section">
          {userRole === "admin" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Filter by Roll Number"
                value={filterChart5.rollNumber}
                onChange={(e) =>
                  setFilterChart5({
                    ...filterChart5,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <input
                type="text"
                name="name"
                placeholder="Filter by Name"
                value={filterChart5.name}
                onChange={(e) =>
                  setFilterChart5({
                    ...filterChart5,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </>
          )}
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart5.date}
            onChange={(e) =>
              setFilterChart5({
                ...filterChart5,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart5(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        <Bar
          data={stackedBarDataStudent}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Attendance Composition per Student",
              },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
          }}
        />
      </div>

      {/* Chart 6: Stacked Bar Chart - Daily Attendance Composition */}
      <div className="chart-section">
        <h3>Daily Attendance Composition</h3>
        <div className="filter-section">
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart6.date}
            onChange={(e) =>
              setFilterChart6({
                ...filterChart6,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() => setFilterChart6(initialDateFilter)}
          >
            Clear Filter
          </button>
        </div>
        <Bar
          data={stackedBarDataDate}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Daily Attendance Composition" },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
          }}
        />
      </div>

      {/* Chart 7: Pie Chart - Overall Attendance Proportions */}
      <div className="chart-section">
        <h3>Overall Attendance Proportions</h3>
        <div className="filter-section">
          {userRole === "admin" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Filter by Roll Number"
                value={filterChart7.rollNumber}
                onChange={(e) =>
                  setFilterChart7({
                    ...filterChart7,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <input
                type="text"
                name="name"
                placeholder="Filter by Name"
                value={filterChart7.name}
                onChange={(e) =>
                  setFilterChart7({
                    ...filterChart7,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </>
          )}
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart7.date}
            onChange={(e) =>
              setFilterChart7({
                ...filterChart7,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart7(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        <Pie
          data={pieDataOverall}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Overall Attendance Proportions" },
            },
          }}
        />
      </div>

      {/* Chart 8: Pie Chart - Single Student Attendance Proportions */}
      <div className="chart-section">
        <h3>Single Student Attendance Proportions</h3>
        <div className="filter-section">
          <input
            type="date"
            name="date"
            placeholder="Filter by Date"
            value={filterChart8.date}
            onChange={(e) =>
              setFilterChart8({
                ...filterChart8,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilterChart8(
                userRole === "admin" ? initialAdminFilter : initialDateFilter
              )
            }
          >
            Clear Filter
          </button>
        </div>
        {userRole === "admin" && (
          <div className="student-selector">
            <label>Select Student: </label>
            <select
              onChange={(e) => setSelectedStudent(e.target.value)}
              value={selectedStudent}
            >
              <option value="">--Select--</option>
              {studentNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
        <Pie
          data={pieDataStudent}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text:
                  userRole === "admin"
                    ? "Single Student Attendance Proportions"
                    : "Your Attendance Proportions",
              },
            },
          }}
        />
        <StudentNameHeading name={selectedStudent || studentNames[0]} />
      </div>

      {error && <p className="error">{error}</p>}
      {attendance.length === 0 && !error && (
        <h4>No attendance records found....🔍</h4>
      )}
      <button
        className="export-btn"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 9999,
        }}
        onClick={handleExportDashboard}
      >
        Export Dashboard
      </button>
    </div>
  );
};

export default AttendanceVisualization;
