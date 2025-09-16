import cv2
import numpy as np
import os
from PIL import Image
from collections import defaultdict

# Define dataset and models path
DATASET_PATH = "dataset"
MODELS_PATH = "models"
MODEL_FILE = os.path.join(MODELS_PATH, "face_model.yml")

# Ensure "models" directory exists
os.makedirs(MODELS_PATH, exist_ok=True)

# Initialize face recognizer and Haar cascade
recognizer = cv2.face.LBPHFaceRecognizer_create()
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def get_images_and_labels():
    """Extracts face images and labels from the dataset directory."""
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset directory '{DATASET_PATH}' not found. Please collect dataset first.")
        return [], [], {}

    labels_dict = defaultdict(list)  # {label: [image1, image2, ...]}
    student_data = {}  # {roll_number: student_name}

    for student_folder in os.listdir(DATASET_PATH):
        folder_path = os.path.join(DATASET_PATH, student_folder)

        if not os.path.isdir(folder_path):
            continue  # Skip non-directory files

        try:
            roll_number, student_name = student_folder.split("_", 1)  # Extract roll number & name
            roll_number = int(roll_number)  # Ensure numeric roll number
            student_data[roll_number] = student_name
        except ValueError:
            print(f"⚠️ Skipping invalid folder name: {student_folder}")
            continue

        for image_name in os.listdir(folder_path):
            img_path = os.path.join(folder_path, image_name)

            try:
                image = Image.open(img_path).convert("L")  # Convert to grayscale
                image_np = np.array(image, "uint8")
            except Exception as e:
                print(f"⚠️ Skipping invalid image '{img_path}': {e}")
                continue

            faces = face_cascade.detectMultiScale(image_np)
            for (x, y, w, h) in faces:
                labels_dict[roll_number].append(image_np[y:y+h, x:x+w])  # Crop face and store

    # Flatten image list and labels for OpenCV training
    images, labels = [], []
    for roll_number, face_list in labels_dict.items():
        images.extend(face_list)
        labels.extend([roll_number] * len(face_list))

    return images, labels, student_data

# Load images and labels
faces, labels, student_data = get_images_and_labels()

if faces:
    recognizer.train(faces, np.array(labels))
    recognizer.save(MODEL_FILE)
    print(f"✅ Model trained and saved successfully in '{MODEL_FILE}'")
else:
    print("❌ No faces found. Please collect dataset first.")


