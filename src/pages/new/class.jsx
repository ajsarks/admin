import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined'; // Ensure the icon is imported correctly
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import "./form.scss";
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Error compressing image:", error);
    return file;
  }
};

const uploadFile = async (file) => {
  console.log(`Compressing ${file.name}`);
  const compressedFile = await compressImage(file);
  console.log(`Compressed ${file.name} from ${file.size} to ${compressedFile.size} bytes`);

  const data = new FormData();
  data.append("file", compressedFile);
  data.append("upload_preset", "upload");

  try {
    console.log(`Uploading ${file.name}`);
    const uploadRes = await axios.post(
      "https://api.cloudinary.com/v1_1/codepulse/image/upload",
      data,
      {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`${file.name} upload progress: ${percentCompleted}%`);
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log(`Upload completed for ${file.name}`);
    return uploadRes.data.url;
  } catch (error) {
    console.error(`Error uploading ${file.name}:`, error);
    throw error;
  }
};

const ClassForm = ({ inputs, availability, setAvailability, unavailableDates, setUnavailableDates }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [info, setInfo] = useState({});
  const [error, setError] = useState("");
  const [teamOptions, setTeamOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get("/api/teams");
        const options = response.data.map(team => ({ value: team.name, label: team.name }));
        setTeamOptions(options);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? (Array.isArray(selectedOption) ? selectedOption.map(option => option.value) : selectedOption.value) : '';
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFiles];
      if (updatedFiles.length > 5) {
        setError("You can only upload a maximum of 5 images.");
        return prevFiles;
      }
      setError("");
      return updatedFiles.slice(0, 5);
    });
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const formattedUnavailableDates = unavailableDates.map(date => {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      } else {
        return new Date(date).toISOString().split('T')[0];
      }
    });

    const payload = {
      ...info,
      availability,
      unavailableDates: formattedUnavailableDates,
    };

    if (files.length > 0) {
      try {
        console.log(`Uploading ${files.length} files in parallel`);
        const uploadPromises = files.map(file => uploadFile(file));
        const imageUrls = await Promise.all(uploadPromises);
        payload.photos = imageUrls;
        console.log('All files uploaded successfully');
      } catch (err) {
        console.error("Error uploading images:", err);
        setError("Error uploading images. Please try again.");
        return;
      }
    }

    try {
      await axiosInstance.post('/api/classes', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Redirect to the appropriate page after submission
      navigate('/classes');
    } catch (err) {
      console.error('Error submitting class form:', err);
      setError("Error submitting form. Please try again.");
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>New Class</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmitForm}>
              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.type === "select" ? (
                    <Select
                      name={input.label.toLowerCase().replace(/\s+/g, '')}
                      options={input.label === 'Teams' ? teamOptions : input.options}
                      isMulti={input.isMulti}
                      onChange={(selectedOption) => handleSelectChange(input.label.toLowerCase().replace(/\s+/g, ''), selectedOption)}
                    />
                  ) : (
                    <input
                      type={input.type}
                      name={input.label.toLowerCase().replace(/\s+/g, '')}
                      placeholder={input.placeholder}
                      onChange={(e) => {
                        setInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
                      }}
                    />
                  )}
                </div>
              ))}
              <div className="formInput">
                <label htmlFor="file">
                  Select Images: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {error && <p className="error">{error}</p>}
                {files.length > 0 && (
                  <div>
                    <p>{files.length} file(s) selected:</p>
                    <ul>
                      {files.map((file, index) => (
                        <li key={index}>
                          {file.name}
                          <button type="button" onClick={() => handleRemoveFile(index)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassForm;
