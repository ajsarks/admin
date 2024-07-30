import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-multi-date-picker';
import DayTimePicker from '../new/daypicker.jsx';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import { teamMemberInputs } from "../../formSource";
import "../new/form.scss";

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // This ensures all requests include credentials
});

const EditTeamMemberForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const [availability, setAvailability] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/teammembers/${id}`);
        setFormData(res.data);
        setAvailability(res.data.availability || []);
        setUnavailableDates(res.data.unavailableDates || []);
        setSelectedTeam({ value: res.data.team._id, label: res.data.team.name });
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
        const options = response.data.map(team => ({ value: team._id, label: team.name }));
        setTeamOptions(options);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? selectedOption.map(option => option.value) : [],
    }));
  };

  const handleTeamChange = (selectedOption) => {
    setSelectedTeam(selectedOption);
    setFormData((prevData) => ({
      ...prevData,
      team: selectedOption ? selectedOption.value : null,
    }));
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
      team: selectedTeam ? selectedTeam.value : null,
    };

    try {
      await axiosInstance.put(`/api/teammembers/${id}`, payload, {
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
          <h1>Edit Team Member</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={formData.img || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              {teamMemberInputs.filter(input => input.name !== 'team').map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.type === "select" ? (
                    <Select
                      name={input.name}
                      options={input.options}
                      isMulti={input.isMulti}
                      value={formData[input.name]?.map(value => ({ value, label: value })) || []}
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
                      value={formData[input.name] || ''}
                      onChange={handleChange}
                    />
                  )}
                </div>
              ))}
              <div className="formInput">
                <label>Team</label>
                <Select
                  name="team"
                  options={teamOptions}
                  value={selectedTeam}
                  onChange={handleTeamChange}
                />
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeamMemberForm;