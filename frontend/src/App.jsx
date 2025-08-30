import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/convert`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(error.error || "Conversion failed");
      }
    } catch (error) {
      alert("Error converting file: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>PDF to PNG Converter</h1>
      <form onSubmit={handleSubmit}>
        <div className="upload-area">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            id="file-input"
          />
          <label htmlFor="file-input">
            {file ? file.name : "Choose PDF file"}
          </label>
        </div>
        <button type="submit" disabled={!file || loading}>
          {loading ? "Converting..." : "Convert to PNG"}
        </button>
      </form>
    </div>
  );
}

export default App;
