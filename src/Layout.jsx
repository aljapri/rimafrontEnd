
import { Outlet } from "react-router-dom";


export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <main className="flex-grow">
        <Outlet />
      </main>

    </div>
  );
}
