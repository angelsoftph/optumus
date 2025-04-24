"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import useLogout from "@/hooks/useLogout";
import { LogOut, Search, User } from "lucide-react";
import ThemeSwitcher from "./theme-switcher";
import SearchComponent from "@/components/search";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  isLoggedIn?: boolean;
  showSearch?: boolean;
  setShowSearch?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<HeaderProps> = ({
  isLoggedIn = true,
  showSearch,
  setShowSearch,
}) => {
  const logout = useLogout();

  return (
    <>
      {showSearch && (
        <SearchComponent
          showSearch={showSearch}
          setShowSearch={setShowSearch}
        />
      )}
      <header
        className={`flex justify-between bg-[#FDFBFB] items-center shadow-md`}
      >
        <div className="flex flex-row w-1/5 items-center p-4 gap-3">
          <Link href="/">
            <Image
              src="/logo.png"
              height={50}
              width={50}
              alt="Optumus Library"
              priority
            />
          </Link>
          <h1 className="text-xl font-semibold">Optumus Library</h1>
        </div>
        <div className="w-3/5 px-30 py-5"></div>
        <div className="flex flex-row w-1/5 items-center justify-end p-4 gap-4">
          {isLoggedIn ? (
            <>
              {setShowSearch && (
                <div
                  title="Search"
                  className="cursor-pointer"
                  onClick={() => setShowSearch((prev) => !prev)}
                >
                  <Search />
                </div>
              )}
              <div title="Themes" className="cursor-pointer">
                <ThemeSwitcher />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/u/124599?v=4"
                      className="cursor-pointer"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut />
                    <span onClick={logout}>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex flex-row gap-3">
              <Button className="px-5 py-1 pb-1.5 rounded-4xl bg-cyan-600 hover:bg-cyan-500 text-sm text-white cursor-pointer">
                <Link href="/login">Login</Link>
              </Button>
              <Button className="px-5 py-1 pb-1.5 rounded-4xl bg-yellow-600 hover:bg-yellow-500 text-sm text-white cursor-pointer">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
