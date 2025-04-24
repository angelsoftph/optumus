"use client";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SearchProps = {
  showSearch?: boolean;
  setShowSearch?: (open: boolean) => void;
};

const SearchComponent: React.FC<SearchProps> = ({
  showSearch,
  setShowSearch,
}) => {
  return (
    <Dialog open={showSearch} onOpenChange={setShowSearch}>
      <DialogOverlay className="fixed inset-0 bg-gray-300/10 backdrop-blur-sm z-40" />
      <DialogContent
        className="
          fixed
          left-1/2
          top-1/2
          transform
          -translate-x-1/2
          -translate-y-1/2
          bg-white
          rounded-sm
          shadow-lg
          p-0
          z-50
          lg:min-w-[60%]
        "
      >
        <DialogTitle className="hidden">Search</DialogTitle>
        <Search className="absolute top-[10px] left-[10px]" />
        <Input
          type="text"
          id="search"
          className="w-full rounded-sm h-[44px] p-4 indent-6"
          placeholder="Search..."
        />
      </DialogContent>
    </Dialog>
  );
};

export default SearchComponent;
