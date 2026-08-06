import {Navigate, Route, Routes} from "react-router"
import LoginPage from "../pages/LoginPage";
import WorkspaceSetupPage from "../pages/WorkspaceSetupPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage"
import ProjectBoardPage from "../pages/ProjectBoardPage";
import MembersPage from "../pages/MembersPage";
import TeamsPage from "../pages/TeamsPage";
import ProjectsPage from "../pages/ProjectsPage";
import MyTasksPage from "../pages/MyTasksPage";
import SettingsPage from "../pages/SettingsPage";


function AppRouter(){
return(
    <Routes>
        <Route path="/login" element = {<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/setup-workspace" element={<WorkspaceSetupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:projectId/board" element={<ProjectBoardPage />} />
        <Route path="/" element = {<Navigate to="/login" replace />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
    </Routes>
)

}

export default AppRouter;
