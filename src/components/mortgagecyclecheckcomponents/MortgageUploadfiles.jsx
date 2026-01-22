import React, { useState, useRef } from "react";
import notificationIcon from "../../assets/images/note_i.png";
import uploadIcon from "../../assets/images/upload_icon.png";
import eyeIcon from "../../assets/images/eye.png";
import closeIcon from "../../assets/images/up_close.png";
import cameraIcon from "../../assets/images/camera.png"; 

// MortgageFileErrorPopup
import MortgageFileErrorPopup from './MortgageFileErrorPopup';
import MortgageConversionFreePopup from './MortgageConversionFreePopup';


const MortgageUploadfiles = () => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // 🔹 Regular file upload
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`❌ ${file.name} is larger than 5MB`);
        return false;
      }
      if (!["application/pdf", "image/jpeg", "image/jpg"].includes(file.type)) {
        alert(`❌ ${file.name} must be PDF or JPG`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = ""; // reset input
  };

  // 🔹 Open camera
  const handleClickCamera = () => {
    cameraInputRef.current.click();
  };

  // 🔹 Handle captured photo
  const handleCameraChange = (e) => {
    const photoFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...photoFiles]);
    e.target.value = "";
  };

  // 🔹 Delete and view
  const handleDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleView = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  return (
    <div className="mortgage_uploadfiles">
      {/* Header */}
      <div className="check_nav d_flex d_flex_ac d_flex_jc">
        <span className="title">העלאת קבצים</span>
        <span className="number">2</span>
      </div>

      <div className="note">
        <img src={notificationIcon} alt="" /> נא לעלות את מסמכי המשכנתא הנוכחית שלכם
      </div>

      <div className="upload_file_box">

        {/* MortgageFileErrorPopup */}
        <MortgageFileErrorPopup />
        <MortgageConversionFreePopup />

        <div className="uploaded_list">
          <h3>ניתן להוסיף קבצים נוספים</h3>

          {/* Default file when none uploaded */}
          {files.length === 0 && (
            <div className="file_item">
              <span className="file_name">Clearance Schedule.pdf</span>
              <button className="view_btn">
                <img src={eyeIcon} alt="view" />
              </button>
              <button className="delete_btn">
                <img src={closeIcon} alt="remove" />
              </button>
            </div>
          )}

          {/* Uploaded files list */}
          {files.length > 0 &&
            files.map((file, index) => (
              <div className="file_item" key={index}>
                <span className="file_name">{file.name}</span>
                <button className="view_btn" onClick={() => handleView(file)}>
                  <img src={eyeIcon} alt="view" />
                </button>
                <button className="delete_btn" onClick={() => handleDelete(index)}>
                  <img src={closeIcon} alt="remove" />
                </button>
              </div>
            ))}
        </div>

        {/* 📂 Regular Upload */}
        <label className="upload_area">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg"
            onChange={handleFileChange}
            hidden
          />
          <span>
            נא לטעון קובץ <br /> pdf / jpg <br /> עד 5 MB
          </span>
          <div>
            <img src={uploadIcon} alt="upload" />
          </div>
        </label>

        {/* 📸 Camera Upload */}
        <div className="camera_upload_box" onClick={handleClickCamera}>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraChange}
            hidden
          />
          <span className="camera_text">
            נא לצלם את המסמך <br /> הקפידו על סביבה מוארת
          </span>
          <img src={cameraIcon} alt="camera" className="camera_icon" />
        </div>
      </div>
    </div>
  );
};

export default MortgageUploadfiles;
