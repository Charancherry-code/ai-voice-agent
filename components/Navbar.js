"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4 shadow-lg flex justify-between items-center">
      {/* Left: Logo */}
      <div className="text-2xl font-bold tracking-wide text-blue-400">
        Murf AI
      </div>

      {/* Right: Nav Link */}
      <div>
        <Link href="/">
          <span className="text-lg hover:text-blue-400 transition duration-200">
            Home
          </span>
        </Link>
      </div>
    </nav>
  );
}

