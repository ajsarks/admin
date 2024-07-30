import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { DataGrid } from "@mui/x-data-grid";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

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

const Single = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate(); // Import useNavigate
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const handleOpen = (title, data) => {
    setModalTitle(title);
    setModalData(data);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiurl}/api/${type}/${id}`);
        setData(res.data);
        if (type === "users") {
          const bookingsRes = await axios.get(`${apiurl}/api/booking/user/${id}`);
          const bookingsData = await Promise.all(
            bookingsRes.data.map(async (booking) => {
              const teamMembersRes = await Promise.all(
                booking.teamMember.map(async (memberId) => {
                  const memberRes = await axios.get(`${apiurl}/api/teammembers/${memberId}`);
                  return memberRes.data.name;
                })
              );
              return {
                ...booking,
                teamMemberNames: teamMembersRes,
              };
            })
          );
          setBookings(bookingsData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [type, id]);

  const bookingColumns = [
    { field: "_id", headerName: "ID", width: 200 },
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
    { field: "time", headerName: "Time", width: 100 },
    { field: "classid", headerName: "Class ID", width: 200 },
    { field: "phonenumber", headerName: "Phone Number", width: 150 },
    { field: "location", headerName: "Location", width: 200 },
    {
      field: "teamMemberNames",
      headerName: "Team Members",
      width: 300,
      renderCell: (params) => (
        <Button onClick={() => handleOpen("Team Members", params.row.teamMemberNames)}>
          View Team Members
        </Button>
      ),
    },
    { field: "isconfirmed", headerName: "Confirmed", width: 100, renderCell: (params) => (params.row.isconfirmed ? "Yes" : "No") },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1),
    },
    {
      field: "additionalcomments",
      headerName: "Additional Comments",
      width: 300,
      renderCell: (params) => <Button onClick={() => handleOpen("Additional Comments", params.row.additionalcomments)}>View Comments</Button>,
    },
  ];

  const renderDetails = () => {
    switch (type) {
      case "users":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Email:</span>
              <span className="itemValue">{data.email}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Phone:</span>
              <span className="itemValue">{data.phone}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Address:</span>
              <span className="itemValue">{data.address}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Country:</span>
              <span className="itemValue">{data.country}</span>
            </div>
            <h2 className="title">Bookings</h2>
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={bookings}
                columns={bookingColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                getRowId={(row) => row._id}
              />
            </div>
          </>
        );
      case "classes":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Description:</span>
              <span className="itemValue">{data.description}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Price:</span>
              <span className="itemValue">${data.price}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">City:</span>
              <span className="itemValue">{data.city}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Type:</span>
              <span className="itemValue">{data.type}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Days Required:</span>
              <span className="itemValue">{data.daysrequired}</span>
            </div>
            <Button onClick={() => handleTeamsOpen(data.teams)}>View Teams</Button>
          </>
        );
      case "teams":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Address:</span>
              <span className="itemValue">{data.address}</span>
            </div>
            <Button onClick={() => handleTeamMembersOpen(data.teamMembers)}>View Team Members</Button>
          </>
        );
      case "teammembers":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Availability:</span>
              <span className="itemValue">{data.availability.map((avail, index) => (
                <div key={index}>
                  <strong>{avail.day}:</strong> {avail.timeRanges.map((range, i) => (
                    <span key={i}>{range.start} - {range.end}{i < avail.timeRanges.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              ))}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Unavailable Dates:</span>
              <span className="itemValue">{data.unavailableDates.map(date => new Date(date).toLocaleDateString()).join(', ')}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Team:</span>
              <span className="itemValue">{data.team?.name}</span>
            </div>
          </>
        );
      case "booking":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Date:</span>
              <span className="itemValue">{data.date?.map(date => new Date(date).toLocaleDateString()).join(', ')}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Time:</span>
              <span className="itemValue">{data.time}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">User ID:</span>
              <span className="itemValue">{data.userId}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Location:</span>
              <span className="itemValue">{data.location}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Confirmed:</span>
              <span className="itemValue">{data.isconfirmed ? "Yes" : "No"}</span>
            </div>
            <div className="detailItem">
              <span className="itemKey">Status:</span>
              <span className="itemValue">{data.status}</span>
            </div>
            <Button onClick={() => handleTeamMembersOpen(data.teamMember)}>View Team Members</Button>
            <Button onClick={() => handleOpen("Additional Comments", data.additionalcomments)}>View Comments</Button>
          </>
        );
      default:
        return null;
    }
  };

  const handleTeamMembersOpen = async (teamMemberIds) => {
    try {
      const idsArray = Array.isArray(teamMemberIds) ? teamMemberIds : [teamMemberIds];
      const teamMembers = await Promise.all(
        idsArray.map(async (memberId) => {
          const response = await axios.get(`${apiurl}/api/teammembers/${memberId}`);
          return response.data.name;
        })
      );
      setModalData(teamMembers);
      setModalTitle("Team Members");
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamsOpen = async (teamIds) => {
    try {
      const idsArray = Array.isArray(teamIds) ? teamIds : [teamIds];
      const teams = await Promise.all(
        idsArray.map(async (teamId) => {
          const response = await axios.get(`${apiurl}/api/teams/${teamId}`);
          return response.data.name;
        })
      );
      setModalData(teams);
      setModalTitle("Teams");
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = () => {
    navigate(`/${type}/edit/${id}`);
  };

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <div className="editButton" onClick={handleEdit}>Edit</div>
            <h1 className="title">Information</h1>
            <div className="item">
              {data && (
                <>
                  <img
                    src={data.img || "https://via.placeholder.com/150"}
                    alt=""
                    className="itemImg"
                  />
                  <div className="details">
                    <h1 className="itemTitle">{data.name || data.title}</h1>
                    {renderDetails()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">{modalTitle}</h2>
          <div id="modal-modal-description">
            {Array.isArray(modalData) ? (
              modalData.length > 0 ? (
                modalData.map((item, index) => <p key={index}>{item}</p>)
              ) : (
                <p>No data found.</p>
              )
            ) : (
              <p>{modalData || 'No additional comments.'}</p>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Single;