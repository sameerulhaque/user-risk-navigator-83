
import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      <main className="flex-1">
        <div className="container py-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container text-sm text-muted-foreground text-center">
          Risk Scoring Platform &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
