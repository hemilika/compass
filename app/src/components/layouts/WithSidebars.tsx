import { Outlet } from "@tanstack/react-router";
import { LeftSidebar } from "@/components/home/sidebar/LeftSidebar";
import { RightSidebar } from "@/components/home/sidebar/RightSidebar";

export const WithSidebars = () => {
  return (
    <div className="mx-auto p-2">
      <div className="grid grid-cols-14 gap-4">
        <div className="col-span-3">
          <LeftSidebar />
        </div>
        <div className="col-span-8">
          <Outlet />
        </div>
        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};
