import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./new.scss";

import { userInputs, classInputs, teamInputs } from "../../formSource";
import UserForm from "./newuser";
import ClassForm from "./class";
import TeamForm from "./team";

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const New = ({ formType }) => {
  const [formData, setFormData] = useState({});
  const [availability, setAvailability] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get('/api/teams');
        const options = response.data.map(team => ({ value: team.name, label: team.name }));
        setTeamOptions(options);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleClassSubmit = async (e) => {
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

    let imageUrls = [];
    if (formData.photos && formData.photos.length > 0) {
      const uploadPromises = Array.from(formData.photos).map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "upload"); // Replace 'upload' with your actual preset name
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/codepulse/image/upload",
          data
        );
        const { url } = uploadRes.data;
        return url;
      });

      imageUrls = await Promise.all(uploadPromises);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called'); // Debug log

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

    console.log('Payload:', payload); // Debug log

    const endpoint = formType === 'team' 
      ? '/api/teams' 
      : formType === 'user' 
        ? '/api/auth/register' 
        : `/api/${formType}`;
    try {
      await axiosInstance.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Redirect to the appropriate page after submission
      navigate(`/${formType === 'team' ? 'teams' : formType === 'user' ? 'users' : formType}`);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  let inputs;
  let title;
  let FormComponent;

  switch (formType) {
    case "user":
      inputs = userInputs;
      title = "New User";
      FormComponent = UserForm;
      break;
    case "class":
      inputs = classInputs;
      title = "New Class";
      FormComponent = ClassForm;
      break;
    case "team":
      inputs = teamInputs;
      title = "New Team";
      FormComponent = TeamForm;
      break;
    default:
      inputs = [];
      title = "New Form";
      break;
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={formData.photos && formData.photos.length > 0 ? URL.createObjectURL(formData.photos[0]) : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
              alt=""
            />
          </div>
          <div className="right">
            <FormComponent
              inputs={inputs}
              handleSubmit={formType === 'class' ? handleClassSubmit : handleSubmit}
              handleChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              availability={availability}
              setAvailability={setAvailability}
              unavailableDates={unavailableDates}
              setUnavailableDates={setUnavailableDates}
              teamOptions={teamOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;