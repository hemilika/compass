import { Posts } from "@/components/home/posts";
import { LeftSidebar } from "@/components/home/sidebar/left-sidebar";
import { RightSidebar } from "@/components/home/sidebar/right-sidebar";

const HomePage = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <LeftSidebar />
        </div>
        <div className="col-span-7">
          <Posts />
        </div>
        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
