import cv2
import numpy as np
import datetime
import os
import requests

# Load trained model and Haar cascade
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("models/face_model.yml")  
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Load student data
dataset_path = "dataset"
student_data = {int(folder.split("_")[0]): folder.split("_")[1] for folder in os.listdir(dataset_path)}

# API URLs
BACKEND_API_URL = "http://localhost:5001/api/attendance/mark"
CHECK_ATTENDANCE_API_URL = "http://localhost:5001/api/attendance/"

# Adjust brightness dynamically
def adjust_brightness(image):
    avg_brightness = np.mean(image)
    beta = 100 - avg_brightness  
    return cv2.convertScaleAbs(image, alpha=1.0, beta=beta)

# Define time periods
time_periods = [
    "1st Period", "2nd Period", "Break-time", "3rd Period", 
    "4th Period", "Lunch-time", "5th Period", "6th Period", "7th Period"
]
time_slots = {
    "1st Period": ("09:05", "10:00"),
    "2nd Period": ("10:00", "10:55"),
    "Break-time": ("10:55", "11:15"),
    "3rd Period": ("11:15", "12:10"),
    "4th Period": ("12:10", "13:05"),
    "Lunch-time": ("13:05", "13:45"),
    "5th Period": ("13:45", "14:40"),
    "6th Period": ("14:40", "15:25"),
    "7th Period": ("15:25", "16:05")
}

# Get the current period
def get_current_period():
    now = datetime.datetime.now().strftime("%H:%M")
    for period, (start, end) in time_slots.items():
        if start <= now <= end:
            return period
    return None  

# Get attendance status for a specific period
def get_attendance_status(roll_number, date, period):
    try:
        response = requests.get(f"{CHECK_ATTENDANCE_API_URL}?rollNumber={roll_number}&date={date}&period={period}")
        if response.status_code == 200:
            return response.json().get("status")
    except Exception as e:
        print(f"❌ Error checking attendance: {e}")
    return None

# Mark attendance in the database
def mark_attendance(roll_number, student_name, date, period, status):
    try:
        response = requests.post(BACKEND_API_URL, json={
            "rollNumber": roll_number,
            "name": student_name,
            "date": date,
            "period": period,
            "status": status
        })
        if response.status_code == 200:
            print(f"✅ Attendance marked: {student_name} (Roll: {roll_number}) - {period}: {status}")
        else:
            print(f"❌ Failed to mark attendance: {response.json()}")
    except Exception as e:
        print(f"❌ Error sending data to backend: {e}")

# Open webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = adjust_brightness(frame)  
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=6, minSize=(100, 100))

    current_period = get_current_period()
    now = datetime.datetime.now()
    date = now.strftime("%Y-%m-%d")

    if not current_period:
        cv2.putText(frame, "Outside Scheduled Periods", (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    else:
        if current_period in ["Break-time", "Lunch-time"]:
            mark_attendance(roll_number, student_name, date, current_period, current_period)
            print(f"📌 {current_period} - No attendance marking required.")
        else:
            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                roll_number, confidence = recognizer.predict(face_roi)

                if confidence < 80:
                    student_name = student_data.get(roll_number, "Unknown")
                    current_period_index = time_periods.index(current_period)

                    # ✅ **Check and update all previous periods**
                    for i in range(current_period_index):
                        prev_period = time_periods[i]
                        if prev_period not in ["Break-time", "Lunch-time"]:
                            prev_status = get_attendance_status(roll_number, date, prev_period)
                            if not prev_status or prev_status in ["", "Not yet marked"]:  
                                mark_attendance(roll_number, student_name, date, prev_period, "Absent")

                    # ✅ **Mark current period as "Present"**
                    mark_attendance(roll_number, student_name, date, current_period, "Present")

                    # ✅ **Ensure future periods are only updated if needed**
                    for future_period in time_periods[current_period_index + 1:]:
                        if future_period in ["Break-time", "Lunch-time"]:
                            mark_attendance(roll_number, student_name, date, future_period, future_period)
                            
                    # ✅ Color coding for current status
                    color = (0, 255, 0)  # Default to green for Present
                    current_status = "Present"
                    if current_status == "Absent":
                        color = (0, 0, 255)
                    elif current_status == "Not yet marked":
                        color = (0, 255, 255)

                    text = f"{student_name} (Roll No: {roll_number}) - {current_period}"
                    cv2.putText(frame, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    cv2.imshow("Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
print("✅ Attendance monitoring completed successfully!")
