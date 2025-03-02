import React, { useState } from "react";

const App = () => {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const serverUrl = "http://127.0.0.1:5000"; // ✅ Flask backend URL

  // Handle file selection
  const handleFileChange = (event) => {
    setVideo(event.target.files[0]);
  };

  // Handle file upload using Fetch API
  const handleUpload = async () => {
    if (!video) {
      setMessage("❌ Please select a video to upload.");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await fetch(`${serverUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setMessage(`✅ Upload successful! Saved at: ${data.file_path}`);
    } catch (error) {
      setMessage("❌ Upload failed. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1>Video Upload</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default App;
