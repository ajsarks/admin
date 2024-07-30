import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ClassIcon from "@mui/icons-material/Class"; // Class icon for Classes
import GroupIcon from "@mui/icons-material/Group"; // Group icon for Teams
import PersonAddIcon from "@mui/icons-material/PersonAdd"; // PersonAdd icon for Team Members
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // Calendar icon for Bookings
import InsertChartIcon from "@mui/icons-material/InsertChart";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety"; // Health icon for System Health
import BookIcon from "@mui/icons-material/Book"; // Book icon for Logs
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/auth";
import { useContext, useEffect } from "react";

const Sidebar = () => {
  const { dispatch: darkModeDispatch } = useContext(DarkModeContext);
  const { dispatch: authDispatch } = useContext(AuthContext);

  const handleLogout = () => {
    authDispatch({ type: 'LOGOUT' });
  };

  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    console.log("Dark mode state:", darkMode);
  }, [darkMode]);

  const handleDarkModeToggle = (mode) => {
    console.log("Toggling dark mode to:", mode);
    darkModeDispatch({ type: mode });
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">CodePulseAdmin</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <li>
            <Link to="/" style={{ textDecoration: "none" }}>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <p className="title">LISTS</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Users</span>
            </li>
          </Link>
          <Link to="/classes" style={{ textDecoration: "none" }}>
            <li>
              <ClassIcon className="icon" />
              <span>Classes</span>
            </li>
          </Link>
          <Link to="/teams" style={{ textDecoration: "none" }}>
            <li>
              <GroupIcon className="icon" />
              <span>Teams</span>
            </li>
          </Link>
          <Link to="/teammembers" style={{ textDecoration: "none" }}>
            <li>
              <PersonAddIcon className="icon" />
              <span>Team Members</span>
            </li>
          </Link>
          <Link to="/booking" style={{ textDecoration: "none" }}>
            <li>
              <CalendarTodayIcon className="icon" />
              <span>Bookings</span>
            </li>
          </Link>
          <p className="title">USEFUL</p>
          <li>
            <InsertChartIcon className="icon" />
            <span>Stats</span>
          </li>
          <li>
            <NotificationsNoneIcon className="icon" />
            <span>Notifications</span>
          </li>
          <p className="title">SERVICE</p>
          <li>
            <HealthAndSafetyIcon className="icon" />
            <span>System Health</span>
          </li>
          <li>
            <BookIcon className="icon" />
            <span>Logs</span>
          </li>
          <li>
            <SettingsIcon className="icon" />
            <span>Settings</span>
          </li>
          <p className="title">USER</p>
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <li>
              <AccountCircleIcon className="icon" />
              <span>Profile</span>
            </li>
          </Link>
          <li onClick={handleLogout}>
            <ExitToAppIcon className="icon" />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      <div className="bottom">
        <div
          className="colorOption"
          onClick={() => handleDarkModeToggle("LIGHT")}
        ></div>
        <div
          className="colorOption"
          onClick={() => handleDarkModeToggle("DARK")}
        ></div>
      </div>
    </div>
  );
};

export default Sidebar;