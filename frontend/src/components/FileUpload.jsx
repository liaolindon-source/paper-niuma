import React, { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ accept, onUpload, label, description }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setFile(file);
    if (onUpload) {
      onUpload(file);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onUpload) {
      onUpload(null);
    }
  };

  return (
    <div className="file-upload-wrapper">
      {label && <label className="label">{label}</label>}
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        {!file ? (
          <div className="upload-prompt">
            <UploadCloud size={48} className="upload-icon" />
            <p className="upload-text">点击或拖拽文件到此处</p>
            {description && <p className="upload-desc">{description}</p>}
          </div>
        ) : (
          <div className="file-info">
            <File size={32} className="file-icon" />
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button className="btn-clear" onClick={clearFile}>
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
