import React, { useState } from "react";

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const serverUrl = "http://127.0.0.1:5000";  // ✅ Backend URL

  // Handle file selection
  const handleFileChange = (event) => {
    setVideo(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!video) {
      setMessage("Please select a video to upload.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("video", video);

    try {
      // ✅ Upload & Get Prediction
      const response = await fetch(`${serverUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setMessage(`✅ Prediction: ${data.prediction}`);
    } catch (error) {
      setMessage("❌ Upload failed. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="video-upload-container">
      <h2>Upload a Video for Violence Detection</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VideoUpload;
