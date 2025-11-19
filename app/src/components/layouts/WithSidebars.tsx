import { Outlet } from "@tanstack/react-router";
import { LeftSidebar } from "@/components/home/sidebar/LeftSidebar";
import { RightSidebar } from "@/components/home/sidebar/RightSidebar";

export const WithSidebars = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <LeftSidebar />
        </div>
        <div className="col-span-7">
          <Outlet />
        </div>
        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};
