import { FaGoogle } from "react-icons/fa"; // Ensure you have react-icons installed
import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import axios from 'axios';

const apiurl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const TeamMembersModal = ({ teamMemberIds }) => {
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (open) {
      const fetchTeamMembers = async () => {
        try {
          const memberPromises = teamMemberIds.map(id => axios.get(`${apiurl}/api/teammembers/${id}`));
          const memberResponses = await Promise.all(memberPromises);
          const members = memberResponses.map(response => response.data);
          setTeamMembers(members);
        } catch (error) {
          console.error('There was an error fetching the team members!', error.message, error.response ? error.response.data : null);
        }
      };

      fetchTeamMembers();
    }
  }, [open, teamMemberIds]);

  return (
    <div>
      <Button onClick={handleOpen}>View Team Members</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">Team Members</h2>
          <div id="modal-modal-description">
            {teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <p key={member._id}>{member.name}</p>
              ))
            ) : (
              <p>No team members found.</p>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
};

const CommentsModal = ({ comments }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>View Comments</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">Additional Comments</h2>
          <div id="modal-modal-description">
            <p>{comments || 'No additional comments.'}</p>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export const userColumns = [
  { field: "_id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={params.row.googleProfilePicture || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt="User Profile Picture"
          />
          {params.row.name}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },
  {
    field: "isAdmin",
    headerName: "Admin",
    width: 100,
  },
  {
    field: "isConfirmed",
    headerName: "Confirmed",
    width: 150,
  },
  {
    field: "googleId",
    headerName: "Google User",
    width: 150,
    renderCell: (params) => (
      params.value ? <FaGoogle style={{ color: '#db4437' }} /> : null
    ),
  },
];

export const classColumns = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "description", headerName: "Description", width: 300 },
  { field: "price", headerName: "Price", width: 100 },
  { field: "city", headerName: "City", width: 150 },
  { field: "type", headerName: "Type", width: 150 },
  { field: "daysrequired", headerName: "Days Required", width: 150 },
  { field: "oneLiner", headerName: "One Liner", width: 200 },
  { field: "supplies", headerName: "Supplies", width: 200 },
  {
    field: "photos",
    headerName: "Photos",
    width: 200,
    renderCell: (params) => (
      <div>
        {params.row.photos?.map((photo, index) => (
          <img key={index} src={photo} alt={`Class Photo ${index + 1}`} style={{ width: '50px', marginRight: '5px' }} />
        ))}
      </div>
    ),
  },
  { field: "teams", headerName: "Teams", width: 200 },
];

export const teamColumns = [
  { field: "_id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 200 },
  { field: "address", headerName: "Address", width: 300 },
  { field: "teamMembers", headerName: "Team Members", width: 200 },
];

export const teamMemberColumns = [
  { field: "_id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 200 },
  {
    field: "monthsAvailable",
    headerName: "Months Available",
    width: 215,
    renderCell: (params) => (
      <div>{params.row.monthsAvailable?.join(', ')}</div>
    ),
  },
  {
    field: "availability",
    headerName: "Availability",
    width: 300,
    renderCell: (params) => (
      <div>
        {params.row.availability?.map((avail, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <strong>{avail.day}:</strong> <br />
            {avail.timeRanges.map((range, i) => (
              <span key={i} style={{ display: 'block' }}>{range.start} - {range.end}</span>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    field: "unavailableDates",
    headerName: "Unavailable Dates",
    width: 300,
    renderCell: (params) => (
      <div>{params.row.unavailableDates?.map(date => new Date(date).toLocaleDateString()).join(', ')}</div>
    ),
  },
  {
    field: "team",
    headerName: "Team",
    width: 200,
    renderCell: (params) => (
      <div>{params.row.team?.name}</div>
    ),
  },
];

export const bookingColumns = [
  { field: "_id", headerName: "ID", width: 70 },
  {
    field: "date",
    headerName: "Date",
    width: 150,
    renderCell: (params) => (
      <div>
        {params.row.date?.map((date, index) => (
          <div key={index}>{new Date(date).toLocaleDateString()}</div>
        ))}
      </div>
    ),
  },
  {
    field: "time",
    headerName: "Time",
    width: 100,
  },
  {
    field: "teamMember",
    headerName: "Team Member",
    width: 200,
    renderCell: (params) => (
      <TeamMembersModal teamMemberIds={params.row.teamMember} />
    ),
  },
  {
    field: "classid",
    headerName: "Class ID",
    width: 200,
  },
  {
    field: "phonenumber",
    headerName: "Phone Number",
    width: 150,
  },
  {
    field: "userId",
    headerName: "User ID",
    width: 200,
  },
  {
    field: "name",
    headerName: "Name",
    width: 200,
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },
  {
    field: "location",
    headerName: "Location",
    width: 200,
  },
  {
    field: "isconfirmed",
    headerName: "Confirmed",
    width: 100,
    renderCell: (params) => (
      <div>{params.row.isconfirmed ? "Yes" : "No"}</div>
    ),
  },
  {
    field: "additionalcomments",
    headerName: "Additional Comments",
    width: 300,
    renderCell: (params) => (
      <CommentsModal comments={params.row.additionalcomments} />
    ),
  },
  {
    field: "classsetting",
    headerName: "Class Setting",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => (
      <div>{params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)}</div>
    ),
  },
];