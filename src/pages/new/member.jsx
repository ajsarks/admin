import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-multi-date-picker';
import DayTimePicker from './daypicker';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import "./form.scss";

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const TeamMemberForm = ({ inputs, availability, setAvailability, unavailableDates, setUnavailableDates }) => {
  const [info, setInfo] = useState({});
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
    setInfo((prev) => ({ ...prev, [name]: selectedOption }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!info.name || !info.teams || !info.monthsAvailable || availability.length === 0) {
      alert("Please fill out all required fields: name, team, months available, and availability.");
      return;
    }

    const formData = {
      name: info.name,
      monthsAvailable: info.monthsAvailable ? info.monthsAvailable.map(month => month.value) : [],
      availability,
      unavailableDates: unavailableDates ? unavailableDates.map(date => date.format()) : [],
      teamName: info.teams[0].value,
    };

    console.log('Formatted Payload:', formData); // Debug log

    try {
      await axiosInstance.post('/api/teammembers', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      navigate('/teammembers');
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
          <h1>New Team Member</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={onSubmit}>
              {inputs && inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.type === "select" ? (
                    <Select
                      name={input.name}
                      options={input.label === 'Teams' ? teamOptions : input.options}
                      isMulti={input.isMulti}
                      onChange={(selectedOption) => handleSelectChange(input.name, selectedOption)}
                    />
                  ) : input.type === "availability" ? (
                    <DayTimePicker availability={availability} setAvailability={setAvailability} />
                  ) : input.type === "unavailableDates" ? (
                    <DatePicker
                      multiple
                      value={unavailableDates}
                      onChange={setUnavailableDates}
                    />
                  ) : (
                    <input
                      type={input.type}
                      name={input.name}
                      placeholder={input.placeholder}
                      onChange={handleInputChange}
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

export default TeamMemberForm;