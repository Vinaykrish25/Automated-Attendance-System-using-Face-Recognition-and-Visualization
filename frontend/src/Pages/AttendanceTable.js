import React, { useEffect, useState } from "react";
import api from "../api";
import "../Styles/AttendanceTable.css";
import { FaEdit, FaSave, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AttendanceTable = () => {
  const [attendance, setAttendance] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const userRole = localStorage.getItem("userRole") || "student";

  const initialFilter = userRole === "admin"
    ? { rollNumber: "", name: "", date: "" }
    : { date: "" };

  const [filter, setFilter] = useState(initialFilter);

  // Restore filters and sorting
  useEffect(() => {
    const savedFilters = localStorage.getItem("attendanceFilters");
    const savedSortBy = localStorage.getItem("attendanceSortBy");
    const lastSaved = localStorage.getItem("lastSavedDate");

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (savedFilters && savedSortBy && lastSaved === today) {
      setFilter(JSON.parse(savedFilters));
      setSortBy(savedSortBy);
    } else {
      localStorage.removeItem("attendanceFilters");
      localStorage.removeItem("attendanceSortBy");
      localStorage.setItem("lastSavedDate", today);
      setFilter(initialFilter);
      setSortBy("name");
    }

    fetchAttendance();
  }, [initialFilter]);

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

  const handleFilterChange = (e) => {
    const updatedFilter = { ...filter, [e.target.name]: e.target.value };
    setFilter(updatedFilter);
    localStorage.setItem("attendanceFilters", JSON.stringify(updatedFilter));
    localStorage.setItem("lastSavedDate", new Date().toISOString().split("T")[0]);
  };

  const clearFilters = () => {
    setFilter(initialFilter);
    setSortBy("name");
    localStorage.removeItem("attendanceFilters");
    localStorage.removeItem("attendanceSortBy");
  };

  const handleSortChange = (criteria) => {
    setSortBy(criteria);
    localStorage.setItem("attendanceSortBy", criteria);
  };

  const handleEditClick = (record) => {
    setEditRow(record._id);
    setEditData({ ...record });
  };

  const handleInputChange = (e, period) => {
    setEditData({ ...editData, [period]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/attendance/update",
        {
          id: editData._id,
          updatedAttendance: editData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditRow(null);
      fetchAttendance();
    } catch (err) {
      console.error("Error updating attendance:", err);
    }
  };

  const filteredAttendance = attendance
    .filter((record) => {
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
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rollNumber") return a.rollNumber - b.rollNumber;
      if (sortBy === "date") return new Date(a.date) - new Date(b.date);
      return 0;
    });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAttendance);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "AttendanceRecords.xlsx");
  };

  return (
    <div className="attendance-table-container">
      <h2>Attendance Records 🗓️</h2>

      <div className="filter-section">
        {userRole === "admin" && (
          <>
            <input
              type="text"
              name="rollNumber"
              placeholder="Filter by Roll Number"
              value={filter.rollNumber}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Filter by Name"
              value={filter.name}
              onChange={handleFilterChange}
            />
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="rollNumber">Sort by Roll Number</option>
              <option value="date">Sort by Date</option>
            </select>
          </>
        )}
        <input
          type="date"
          name="date"
          placeholder="Filter by Date"
          value={filter.date}
          onChange={handleFilterChange}
        />
        <button className="clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="table-responsive">
        {filteredAttendance.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>1st Period</th>
                  <th>2nd Period</th>
                  <th>Break-time</th>
                  <th>3rd Period</th>
                  <th>4th Period</th>
                  <th>Lunch-time</th>
                  <th>5th Period</th>
                  <th>6th Period</th>
                  <th>7th Period</th>
                  {userRole === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={`${record.rollNumber}-${record.date}`}>
                    <td>{record.rollNumber}</td>
                    <td>{record.name}</td>
                    <td>{record.date}</td>
                    {[
                      "1st Period",
                      "2nd Period",
                      "Break-time",
                      "3rd Period",
                      "4th Period",
                      "Lunch-time",
                      "5th Period",
                      "6th Period",
                      "7th Period",
                    ].map((period) => {
                      const status = record[period];
                      const getColorClass = () => {
                        if (status === "Present") return "status-green";
                        if (status === "Absent") return "status-red";
                        if (status === "Not yet marked") return "status-yellow";
                        return "";
                      };
                      return (
                        <td key={record._id} className={getColorClass()}>
                          {editRow === record._id ? (
                            <input
                              type="text"
                              value={editData[period]}
                              onChange={(e) => handleInputChange(e, period)}
                            />
                          ) : (
                            status
                          )}
                        </td>
                      );
                    })}
                    {userRole === "admin" && (
                      <td>
                        {editRow === record._id ? (
                          <button className="save-btn" onClick={handleUpdate}>
                            <FaSave />
                          </button>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(record)}
                          >
                            <FaEdit />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Export Button */}
            <div className="export-btn-container">
              <button className="export-btn" onClick={exportToExcel}>
                <FaDownload /> Export to Excel
              </button>
            </div>
          </>
        ) : (
          !error && <h4>No attendance records found ....🔍</h4>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
