import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import { classInputs } from "../../formSource";
import "../new/form.scss";
import { useNavigate, useParams } from 'react-router-dom';

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const EditClassForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/classes/${id}`);
        setFormData(res.data);
        setAvailability(res.data.availability || []);
        setUnavailableDates(res.data.unavailableDates || []);
        setFiles(res.data.photos || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get(`/api/teams`);
        const options = response.data.map(team => ({ value: team.name, label: team.name }));
        setTeamOptions(options);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? (Array.isArray(selectedOption) ? selectedOption.map(option => option.value) : selectedOption.value) : '';
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedUnavailableDates = unavailableDates.map(date => {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      } else {
        return new Date(date).toISOString().split('T')[0];
      }
    });

    const payload = {
      ...formData,
      availability,
      unavailableDates: formattedUnavailableDates,
    };

    try {
      // Handle file uploads
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          if (typeof file === 'string') {
            // If the file is already a URL, keep it as is
            return file;
          }
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");
          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/codepulse/image/upload",
            data
          );
          return uploadRes.data.url;
        });

        const imageUrls = await Promise.all(uploadPromises);
        payload.photos = imageUrls;
      }

      // Submit the updated class data
      await axiosInstance.put(`/api/classes/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      navigate('/classes');
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Edit Class</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={files.length > 0 && files[0] instanceof File ? URL.createObjectURL(files[0]) : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              {classInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.type === "select" ? (
                    <Select
                      name={input.label.toLowerCase().replace(/\s+/g, '')}
                      options={input.label === 'Teams' ? teamOptions : input.options}
                      isMulti={input.isMulti}
                      value={Array.isArray(formData[input.label.toLowerCase().replace(/\s+/g, '')]) ? formData[input.label.toLowerCase().replace(/\s+/g, '')].map(value => ({ value, label: value })) : []}
                      onChange={(selectedOption) => handleSelectChange(input.label.toLowerCase().replace(/\s+/g, ''), selectedOption)}
                    />
                  ) : (
                    <input
                      type={input.type}
                      name={input.label.toLowerCase().replace(/\s+/g, '')}
                      placeholder={input.placeholder}
                      value={formData[input.label.toLowerCase().replace(/\s+/g, '')] || ''}
                      onChange={handleChange}
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
                          {typeof file === 'string' ? file : file.name}
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

export default EditClassForm;