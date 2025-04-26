import cv2
import os
import numpy as np

# Load Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Create dataset directory if not exists
dataset_path = "dataset"
if not os.path.exists(dataset_path):
    os.makedirs(dataset_path)

# Capture student details (roll number and name)
roll_number = input("Enter Student Roll Number: ")
student_name = input("Enter Student Name: ")
student_folder = os.path.join(dataset_path, f"{roll_number}_{student_name}")

# Create student-specific directory
if not os.path.exists(student_folder):
    os.makedirs(student_folder)

# Initialize webcam
cap = cv2.VideoCapture(0)
count = 0

def adjust_brightness(image):
    avg_brightness = np.mean(image)
    beta = 100 - avg_brightness  # Adjust brightness dynamically
    return cv2.convertScaleAbs(image, alpha=1.0, beta=beta)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = adjust_brightness(frame)  # Adjust brightness
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        count += 1
        face = gray[y:y+h, x:x+w]
        cv2.imwrite(f"{student_folder}/{count}.jpg", face)
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

    cv2.imshow("Face Detection", frame)

    if count >= 500:  # Capture 500 images per student
        break

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
print(f"Dataset collected for {student_name} (Roll No: {roll_number})")
