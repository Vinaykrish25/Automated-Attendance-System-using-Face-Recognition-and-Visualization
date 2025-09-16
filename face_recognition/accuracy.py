import cv2
import os
from sklearn.metrics import accuracy_score

# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("models/face_model.yml")  # adjust path if needed
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

# Path to test dataset
test_data_dir = "test_dataset"  # folder containing test images like 101.jpg, 102.jpg

# Actual vs Predicted
y_true = []
y_pred = []

for filename in os.listdir(test_data_dir):
    if filename.endswith(".jpg") or filename.endswith(".png"):
        path = os.path.join(test_data_dir, filename)
        actual_label = int(os.path.splitext(filename)[0])  # roll number from filename

        img = cv2.imread(path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) == 0:
            print(f"No face detected in {filename}")
            y_true.append(actual_label)
            y_pred.append(-1)  # unknown
            continue

        for (x, y, w, h) in faces:
            roi_gray = gray[y:y + h, x:x + w]
            predicted_label, confidence = recognizer.predict(roi_gray)
            y_true.append(actual_label)
            y_pred.append(predicted_label)
            print(f"{filename}: Predicted {predicted_label} (Actual {actual_label}) Confidence: {confidence}")
            break  # Only first face

# Accuracy
acc = accuracy_score(y_true, y_pred)
print(f"\n✅ Recognition Accuracy: {acc * 100:.2f}%")

# Optional: Show confusion matrix
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

cm = confusion_matrix(y_true, y_pred, labels=sorted(set(y_true)))
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=sorted(set(y_true)))
disp.plot()
plt.title("Confusion Matrix")
plt.show()
