import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import ClassForm from "./pages/new/class";
import TeamForm from "./pages/new/team";
import TeamMemberForm from "./pages/new/member";
import UserForm from "./pages/new/newuser";
import EditUserForm from "./pages/edit/user";
import EditClassForm from "./pages/edit/class";
import EditTeamForm from "./pages/edit/team";
import EditTeamMemberForm from "./pages/edit/member";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./style/dark.scss";
import { useContext, useState } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/auth";
import { userColumns, classColumns, teamColumns, teamMemberColumns, bookingColumns } from "./datatablesource";
import { userInputs, classInputs, teamInputs, teamMemberInputs } from "./formSource";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  // States for TeamMemberForm
  const [availability, setAvailability] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="users">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={userColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single type="users" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <UserForm inputs={userInputs} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <EditUserForm />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="classes">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={classColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single type="classes" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <ClassForm 
                      inputs={classInputs}
                      availability={availability}
                      setAvailability={setAvailability}
                      unavailableDates={unavailableDates}
                      setUnavailableDates={setUnavailableDates}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <EditClassForm />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="teams">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={teamColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single type="teams" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <TeamForm inputs={teamInputs} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <EditTeamForm />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="teammembers">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={teamMemberColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single type="teammembers" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <TeamMemberForm
                      inputs={teamMemberInputs}
                      availability={availability}
                      setAvailability={setAvailability}
                      unavailableDates={unavailableDates}
                      setUnavailableDates={setUnavailableDates}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <EditTeamMemberForm />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="booking">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={bookingColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single type="booking" />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
