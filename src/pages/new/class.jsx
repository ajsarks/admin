import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined'; // Ensure the icon is imported correctly
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import "./form.scss";
import { useNavigate } from 'react-router-dom';

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const ClassForm = ({ inputs, availability, setAvailability, unavailableDates, setUnavailableDates }) => {
  const [files, setFiles] = useState([]);
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
    if (e.target.files.length > 5) {
      setError("You can only upload a maximum of 5 images.");
    } else {
      setFiles(e.target.files);
      setError("");
    }
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

    let imageUrls = [];
    if (files.length > 0) {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Add file type validation
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }
        // Add file size validation (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "your_upload_preset"); // Replace with your actual preset name

        try {
          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", // Replace with your actual cloud name
            data
          );
          return uploadRes.data.url;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }
      });

      try {
        imageUrls = await Promise.all(uploadPromises);
      } catch (error) {
        setError("Error uploading one or more images. Please try again.");
        return; // Stop form submission if there's an upload error
      }
    }

    payload.photos = imageUrls;

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
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {error && <p className="error">{error}</p>}
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