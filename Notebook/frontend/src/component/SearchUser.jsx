import React, { useState } from "react";
import { Search as SearchIcon, X, UserRound } from "lucide-react";
import SearchAccount from "../page/Account/SearchAccount";

export default function Search() {
    const [search, setSearch] = useState("");

    

    return (
        <div className="min-h-screen px-5 py-6">

            {/* Search Header */}
            <div className="mx-auto max-w-4xl">

                <div className="mb-7">
                    <h1 className="text-3xl font-bold tracking-tight text-[#241B24]">
                        Search
                    </h1>

                    <p className="mt-1 text-sm text-[#665761]">
                        Find people by name or username
                    </p>
                </div>
                <SearchAccount/>
            </div>
        </div>
    );
}