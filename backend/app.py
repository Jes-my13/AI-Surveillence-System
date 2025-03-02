import os
import torch
import torch.nn as nn
import torchvision.models.video as models
import torchvision.transforms as transforms
import cv2

# ✅ Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_path = os.path.abspath("mc3_18_epoch6.pth")  # Ensure correct path

# 🔥 Check if model exists
if not os.path.exists(model_path):
    raise FileNotFoundError(f"🚨 Model file not found at {model_path}")

# ✅ Initialize mc3_18 Model
model = models.mc3_18(pretrained=False)  # Don't load ImageNet weights
model.fc = nn.Sequential(nn.Dropout(0.5), nn.Linear(model.fc.in_features, 2))

# ✅ Load Checkpoint & Adjust Keys
checkpoint = torch.load(model_path, map_location=device)
new_state_dict = {k.replace("_orig_mod.", "").replace("module.", ""): v for k, v in checkpoint.items()}
model.load_state_dict(new_state_dict, strict=False)  # Allow flexible loading

model = model.to(device)
model.eval()  # ✅ Set model to inference mode

# ✅ Preprocessing Function (Extract Frames from Video)
def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert to RGB
        frame = cv2.resize(frame, (112, 112))  # Resize each frame
        frame = torch.tensor(frame, dtype=torch.float32).permute(2, 0, 1) / 255.0  # Normalize
        frames.append(frame)

        if len(frames) >= 8:  # Ensure at least 8 frames
            break

    cap.release()

    if len(frames) < 8:
        return "Error: Video too short (< 8 frames)", None

    # ✅ Fix Shape: Change (8, 3, 112, 112) to (3, 8, 112, 112)
    video_tensor = torch.stack(frames)  # Shape: (8, 3, 112, 112)
    video_tensor = video_tensor.permute(1, 0, 2, 3)  # Change to (3, 8, 112, 112)
    print(f"Input shape: {video_tensor.shape}")

    return None, video_tensor.unsqueeze(0).to(device)  # Final Shape: (1, 3, 8, 112, 112)

# ✅ Run Model on a Local Video
video_path = "C:\\Users\\DELL\\Documents\\crime_det\\backend\\uploads\\958.mp4"  # Change this to your video file path
error, video_tensor = process_video(video_path)
if error:
    print(f"❌ Error: {error}")
else:
    with torch.no_grad():
        output = model(video_tensor)
        prediction = torch.argmax(output, dim=1).item()

    result = "Violence" if prediction == 0 else "Non-Violence"
    print(f"✅ Prediction: {result}")
