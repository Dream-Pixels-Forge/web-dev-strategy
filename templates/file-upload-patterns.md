# File Upload Patterns

This template provides patterns for implementing file uploads, including multipart uploads, validation, cloud storage integration, and image processing.

## Basic File Upload with Multer

### 1. Local Storage Upload
```javascript
// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
```

### 2. Single File Upload Route
```javascript
// routes/upload.js
const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    }
  });
});

module.exports = router;
```

### 3. Multiple Files Upload
```javascript
// routes/upload.js
router.post('/upload/multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path
  }));

  res.json({
    message: 'Files uploaded successfully',
    files
  });
});
```

## AWS S3 Upload Pattern

### 1. S3 Upload Service
```javascript
// services/s3Service.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

class S3Service {
  async uploadFile(file, folder = 'uploads') {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const result = await s3.upload(params).promise();

      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket
      };
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async deleteFile(key) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn
    };

    return s3.getSignedUrl('getObject', params);
  }
}

module.exports = new S3Service();
```

### 2. S3 Upload Route
```javascript
// routes/upload.js
const express = require('express');
const multer = require('multer');
const s3Service = require('../services/s3Service');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const router = express.Router();

router.post('/upload/s3', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await s3Service.uploadFile(req.file);

    res.json({
      message: 'File uploaded to S3 successfully',
      file: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Frontend Upload Patterns

### 1. React File Upload Component
```javascript
// components/FileUpload.jsx
import { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedFile(data.file);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,application/pdf"
      />

      {file && (
        <div className="file-info">
          <p>Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {uploadedFile && (
        <div className="success">
          <p>File uploaded successfully!</p>
          <p>Filename: {uploadedFile.filename}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
```

### 2. Drag and Drop Upload
```javascript
// components/DragDropUpload.jsx
import { useState, useRef } from 'react';

function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024;
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      return isValidSize && isValidType;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Upload successful:', data);
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>Drag and drop files here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/gif"
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Selected Files:</h3>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span>{file.name}</span>
              <button onClick={() => removeFile(index)}>Remove</button>
            </div>
          ))}
          <button onClick={uploadFiles}>Upload All</button>
        </div>
      )}
    </div>
  );
}

export default DragDropUpload;
```

## Image Processing with Sharp

```javascript
// services/imageService.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageService {
  async processImage(file, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      const outputPath = path.join(
        'uploads',
        'processed',
        `${Date.now()}-${file.originalname}`
      );

      await sharp(file.buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

      return {
        path: outputPath,
        filename: path.basename(outputPath)
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async createThumbnail(file) {
    const outputPath = path.join(
      'uploads',
      'thumbnails',
      `thumb-${Date.now()}-${file.originalname}`
    );

    await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'cover'
      })
      .toFile(outputPath);

    return outputPath;
  }

  async generateMultipleSizes(file) {
    const sizes = {
      thumbnail: { width: 200, height: 200 },
      medium: { width: 800, height: 600 },
      large: { width: 1920, height: 1080 }
    };

    const results = {};

    for (const [name, dimensions] of Object.entries(sizes)) {
      const outputPath = path.join(
        'uploads',
        name,
        `${Date.now()}-${file.originalname}`
      );

      await sharp(file.buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(outputPath);

      results[name] = outputPath;
    }

    return results;
  }
}

module.exports = new ImageService();
```

## Upload Progress Tracking

```javascript
// components/FileUploadWithProgress.jsx
import { useState } from 'react';
import axios from 'axios';

function FileUploadWithProgress() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      console.log('Upload complete');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={uploading || !file}>
        Upload
      </button>

      {uploading && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadWithProgress;
```

## Direct Browser to S3 Upload (Presigned URL)

```javascript
// Backend - Generate presigned URL
router.post('/upload/presigned-url', async (req, res) => {
  const { filename, filetype } = req.body;
  const key = `uploads/${uuidv4()}-${filename}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: filetype,
    ACL: 'public-read'
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    res.json({
      uploadUrl,
      key,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Frontend - Upload directly to S3
async function uploadToS3(file) {
  // Get presigned URL
  const response = await fetch('/api/upload/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      filetype: file.type
    })
  });

  const { uploadUrl, fileUrl } = await response.json();

  // Upload directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });

  return fileUrl;
}
```
