import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { userColumns, classColumns, teamColumns, teamMemberColumns, bookingColumns } from "../../datatablesource";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import axios from "axios";

const apiurl = process.env.REACT_APP_API_URL;

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: apiurl,
  withCredentials: true, // This ensures all requests include credentials
});

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [openAvailability, setOpenAvailability] = useState(false);
  const [openUnavailability, setOpenUnavailability] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openTeamMembers, setOpenTeamMembers] = useState(false);
  const [openBookingTeamMembers, setOpenBookingTeamMembers] = useState(false);
  const [openClassTeams, setOpenClassTeams] = useState(false);

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedOneLiner, setSelectedOneLiner] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);

  const fetchPath = path === "classes" ? `${apiurl}/api/classes/all` : `${apiurl}/api/${path}`;
  const { data } = useFetch(fetchPath);

  useEffect(() => {
    setList(data);
  }, [data]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/${path}/${id}`);
      setList(list.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      await axiosInstance.put(`/api/booking/confirm/${id}`);
      setSuccessMessage(`Booking with ID: ${id} confirmed`);
      // Optionally, update the list or show a success message
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await axiosInstance.put(`/api/booking/cancel/${id}`);
      setSuccessMessage(`Booking with ID: ${id} canceled`);
      setList(list.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamMemberAvailabilityOpen = async (teamMemberId) => {
    try {
      const response = await axiosInstance.get(`/api/teammembers/${teamMemberId}`);
      setSelectedTeamMember(response.data);
      setOpenAvailability(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamMemberUnavailabilityOpen = async (teamMemberId) => {
    try {
      const response = await axiosInstance.get(`/api/teammembers/${teamMemberId}`);
      setSelectedTeamMember(response.data);
      setOpenUnavailability(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDescriptionOpen = (description, oneLiner) => {
    setSelectedDescription(description);
    setSelectedOneLiner(oneLiner);
    setOpenDetails(true);
  };

  const handleCloseAvailability = () => setOpenAvailability(false);
  const handleCloseUnavailability = () => setOpenUnavailability(false);
  const handleCloseDetails = () => setOpenDetails(false);
  const handleCloseTeamMembers = () => setOpenTeamMembers(false);
  const handleCloseBookingTeamMembers = () => setOpenBookingTeamMembers(false);
  const handleCloseClassTeams = () => setOpenClassTeams(false);

  const handleTeamMembersOpen = async (teamMemberIds) => {
    try {
      const idsArray = Array.isArray(teamMemberIds) ? teamMemberIds : [teamMemberIds];
      const teamMembers = await Promise.all(
        idsArray.map(async (memberId) => {
          const response = await axiosInstance.get(`/api/teammembers/${memberId}`);
          return response.data;
        })
      );
      setSelectedTeamMembers(teamMembers);
      setOpenTeamMembers(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamsOpen = async (teamIds) => {
    try {
      const teamDetails = await Promise.all(
        teamIds.map(async (teamId) => {
          const teamResponse = await axiosInstance.get(`/api/teams/${teamId}`);
          const team = teamResponse.data;
          const teamMembers = await Promise.all(
            team.teamMembers.map(async (memberId) => {
              const memberResponse = await axiosInstance.get(`/api/teammembers/${memberId}`);
              return memberResponse.data.name;
            })
          );
          return { ...team, teamMembers };
        })
      );
      setSelectedTeams(teamDetails);
      setOpenClassTeams(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassOpen = async (classId) => {
    try {
      const response = await axiosInstance.get(`/api/classes/${classId}`);
      setSelectedDescription(response.data.description);
      setSelectedOneLiner(response.data.oneLiner);
      setOpenDetails(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamMembersInBookingOpen = async (teamMemberIds) => {
    try {
      console.log("Opening booking team members modal...");
      const idsArray = Array.isArray(teamMemberIds) ? teamMemberIds : [teamMemberIds];
      const teamMembers = await Promise.all(
        idsArray.map(async (memberId) => {
          const response = await axiosInstance.get(`/api/teammembers/${memberId}`);
          return response.data.name;
        })
      );
      console.log("Fetched team members:", teamMembers);
      setSelectedTeamMembers(teamMembers);
      setOpenBookingTeamMembers(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getColumns = () => {
    switch (path) {
      case "users":
        return userColumns;
      case "classes":
        return classColumns.map((col) => {
          if (col.field === "description" || col.field === "oneLiner") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleDescriptionOpen(params.row.description, params.row.oneLiner)}>
                  View Details
                </Button>
              ),
            };
          }
          if (col.field === "teams") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleTeamsOpen(params.row.teams)}>
                  View Teams
                </Button>
              ),
            };
          }
          return col;
        });
      case "teams":
        return teamColumns.map((col) => {
          if (col.field === "teamMembers") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleTeamMembersOpen(params.row.teamMembers)}>
                  View Team Members
                </Button>
              ),
            };
          }
          return col;
        });
      case "teammembers":
        return teamMemberColumns.map((col) => {
          if (col.field === "availability") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleTeamMemberAvailabilityOpen(params.row._id)}>
                  View Availability
                </Button>
              ),
            };
          }
          if (col.field === "unavailableDates") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleTeamMemberUnavailabilityOpen(params.row._id)}>
                  View Unavailability
                </Button>
              ),
            };
          }
          return col;
        });
      case "booking":
        return bookingColumns.map((col) => {
          if (col.field === "classId") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleClassOpen(params.row.classId)}>
                  View Class
                </Button>
              ),
            };
          }
          if (col.field === "teamMembers") {
            return {
              ...col,
              renderCell: (params) => (
                <Button onClick={() => handleTeamMembersInBookingOpen(params.row.teamMembers)}>
                  View Team Members
                </Button>
              ),
            };
          }
          return col;
        });
      default:
        return [];
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 400,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/${path}/${params.row._id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row._id)}
            >
              Delete
            </div>
            {path === "booking" && (
              <>
                <div
                  className="confirmButton"
                  onClick={() => handleConfirmBooking(params.row._id)}
                >
                  Confirm Booking
                </div>
                <div
                  className="cancelButton"
                  onClick={() => handleCancelBooking(params.row._id)}
                >
                  Cancel Booking
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const currentDate = new Date();

  const pendingBookings = list.filter(booking => booking.status === 'pending' && booking.date && booking.date[1] && new Date(booking.date[1]) >= currentDate);
  const confirmedBookings = list.filter(booking => booking.status === 'confirmed' && booking.date && booking.date[1] && new Date(booking.date[1]) >= currentDate);
  const pastBookings = list.filter(booking => booking.date && booking.date[1] && new Date(booking.date[1]) < currentDate);
  const cancelledBookings = list.filter(booking => booking.status === 'cancelled');

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
        <Link to={`/${path}/new`} className="link">
          Add New
        </Link>
      </div>

      {path === "booking" && (
        <>
          <h2>Pending Bookings</h2>
          <DataGrid
            className="datagrid"
            rows={pendingBookings}
            columns={getColumns().concat(actionColumn)}
            pageSize={9}
            rowsPerPageOptions={[9]}
            checkboxSelection
            getRowId={(row) => row._id}
          />

          <h2>Confirmed Bookings</h2>
          <DataGrid
            className="datagrid"
            rows={confirmedBookings}
            columns={getColumns().concat(actionColumn)}
            pageSize={9}
            rowsPerPageOptions={[9]}
            checkboxSelection
            getRowId={(row) => row._id}
          />

          <h2>Past Bookings</h2>
          <DataGrid
            className="datagrid"
            rows={pastBookings}
            columns={getColumns().concat(actionColumn)}
            pageSize={9}
            rowsPerPageOptions={[9]}
            checkboxSelection
            getRowId={(row) => row._id}
          />

          <h2>Cancelled Bookings</h2>
          <DataGrid
            className="datagrid"
            rows={cancelledBookings}
            columns={getColumns().concat(actionColumn)}
            pageSize={9}
            rowsPerPageOptions={[9]}
            checkboxSelection
            getRowId={(row) => row._id}
          />
        </>
      )}

      {path !== "booking" && (
        <DataGrid
          className="datagrid"
          rows={list}
          columns={getColumns().concat(actionColumn)}
          pageSize={9}
          rowsPerPageOptions={[9]}
          checkboxSelection
          getRowId={(row) => row._id}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert onClose={() => setSuccessMessage("")} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Class Teams Modal */}
      <Modal
        open={openClassTeams}
        onClose={handleCloseClassTeams}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Class Teams
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedTeams.map((team) => (
              <div key={team._id}>
                <strong>Team Name:</strong> {team.name}
                <br />
                <strong>Team Members:</strong>
                <ul>
                  {team.teamMembers.length > 0 ? (
                    team.teamMembers.map((memberName, index) => (
                      <li key={index}>{memberName}</li>
                    ))
                  ) : (
                    <li>No team members</li>
                  )}
                </ul>
              </div>
            ))}
          </Typography>
        </Box>
      </Modal>

      {/* Availability Modal */}
      <Modal
        open={openAvailability}
        onClose={handleCloseAvailability}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Availability
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedTeamMember?.availability.map((avail, index) => (
              <div key={index}>
                <strong>{avail.day}:</strong> {avail.timeRanges.map((range, i) => (
                  <span key={i}>{range.start} - {range.end}{i < avail.timeRanges.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            ))}
          </Typography>
        </Box>
      </Modal>

      {/* Unavailability Modal */}
      <Modal
        open={openUnavailability}
        onClose={handleCloseUnavailability}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Unavailability
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedTeamMember?.unavailableDates.map((date, index) => (
              <div key={index}>{new Date(date).toLocaleDateString()}</div>
            ))}
          </Typography>
        </Box>
      </Modal>

      {/* Class Details Modal */}
      <Modal
        open={openDetails}
        onClose={handleCloseDetails}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Class Details
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <div>
              <strong>Description:</strong> {selectedDescription}
              <br />
              <strong>One Liner:</strong> {selectedOneLiner}
            </div>
          </Typography>
        </Box>
      </Modal>

      {/* Team Members Modal */}
      <Modal
        open={openTeamMembers}
        onClose={handleCloseTeamMembers}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Team Members
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedTeamMembers.map((member) => (
              <div key={member._id}>
                <strong>ID:</strong> {member._id}
                <br />
                <strong>Name:</strong> {member.name}
              </div>
            ))}
          </Typography>
        </Box>
      </Modal>

      {/* Booking Team Members Modal */}
      <Modal
        open={openBookingTeamMembers}
        onClose={handleCloseBookingTeamMembers}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Booking Team Members
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedTeamMembers.map((id, index) => (
              <div key={index}>
                <strong>ID:</strong> {id}
              </div>
            ))}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default Datatable;