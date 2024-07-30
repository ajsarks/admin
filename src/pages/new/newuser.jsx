import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./form.scss";

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const UserForm = ({ inputs }) => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch teams dynamically if needed
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get('/api/teams');
        const teams = response.data.map(team => ({ value: team._id, label: team.name }));
        setFormData(prevFormData => ({
          ...prevFormData,
          teams: teams
        }));
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, selectedOptions) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: selectedOptions.map(option => option.value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/register', formData);
      console.log('Response:', response.data);
      // Redirect to /users after successful submission
      navigate('/users');
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>New User</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={formData.photos && formData.photos.length > 0 ? URL.createObjectURL(formData.photos[0]) : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.type === "checkbox" ? (
                    <input
                      type={input.type}
                      name={input.name}
                      checked={formData[input.name] || false}
                      onChange={handleChange}
                    />
                  ) : input.type === "select" ? (
                    <select
                      name={input.name}
                      multiple={input.isMulti}
                      value={formData[input.name] || []}
                      onChange={(e) => handleSelectChange(input.name, Array.from(e.target.selectedOptions, option => ({ value: option.value, label: option.label })))}
                    >
                      {input.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={input.type}
                      name={input.name}
                      placeholder={input.placeholder}
                      value={formData[input.name] || ''}
                      onChange={handleChange}
                    />
                  )}
                </div>
              ))}
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;