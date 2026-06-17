import { useRef, useState } from 'react';
import { File, UploadCloud, X } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ accept, onUpload, label, description }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files?.[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    if (event.target.files?.[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const handleFile = (nextFile) => {
    setFile(nextFile);
    onUpload?.(nextFile);
  };

  const clearFile = (event) => {
    event.stopPropagation();
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onUpload?.(null);
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
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />

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
