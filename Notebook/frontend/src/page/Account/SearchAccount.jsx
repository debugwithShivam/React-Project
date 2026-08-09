import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SearchIcon, Search, X, UserRound } from 'lucide-react'
import { useSelector } from 'react-redux'
import UserSearchResult from './UserSearchResult'

export default function SearchAccount() {
    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState(query)

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedQuery(query)
        }, 500)
        return () => {
            clearTimeout(handle)
        }
    }, [query])

    async function searchUser({ queryKey }) {
        const [, searchQuery] = queryKey
        try {
            let response = await axios.get("http://localhost:5000/authRouter/searchUsers", {
                params: {
                    q: searchQuery
                }, withCredentials: true
            })
            return response.data.data
        } catch (error) {
            console.log(error)
        }
    }

    const { data = [], isLoading } = useQuery({
        queryKey: ['user', debouncedQuery],
        queryFn: searchUser,
        enabled: !!debouncedQuery.trim()
    })


    
    if (isLoading) return <h1>Loading...</h1>


    return (
        <>
            <div
                className="
                    relative
                    rounded-2xl
                    border
                    border-white/60
                    bg-[#FFF9F4]/85
                    shadow-lg
                    shadow-black/10
                    backdrop-blur-xl
                    "
            >

                <SearchIcon
                    size={21}
                    strokeWidth={2}
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#665761]
                        "
                />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search people..."
                    className="
                        h-14
                        w-full
                        rounded-2xl
                        bg-transparent
                        pl-12
                        pr-12
                        text-[16px]
                        font-medium
                        text-[#241B24]
                        outline-none
                        placeholder:text-[#8A7983]
                        "
                />

                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        rounded-full
                        p-1.5
                        text-[#665761]
                        transition
                        hover:bg-[#E8DDE5]
                        hover:text-[#241B24]
                        "
                    >
                        <X size={17} />
                    </button>
                )}
            </div>


            <div className="mt-6">

                {query && data.length === 0 && (
                    <div
                        className="
                        rounded-2xl
                        border
                        border-white/50
                        bg-[#FFF9F4]/70
                        px-6
                        py-12
                        text-center
                        shadow-lg
                        shadow-black/5
                        backdrop-blur-xl
                        "
                    >
                        <div
                            className="
                                mx-auto
                                mb-3
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-[#E8DDE5]
                                "
                        >
                            <SearchIcon
                                size={21}
                                className="text-[#5C4356]"
                            />
                        </div>

                        <h2 className="font-semibold text-[#241B24]">
                            No users found
                        </h2>

                        <p className="mt-1 text-sm text-[#71616B]">
                            Try searching with another name or username.
                        </p>
                    </div>
                )}


                {data.length > 0 && (
                    <div className="space-y-3">

                        {data.map((user) => (
                            <UserSearchResult
                            key={user._id}
                            user={user}
                            />
                        ))}

                    </div>
                )}


                {/* Empty initial state */}
                {!query && (
                    <div className="py-16 text-center">

                        <div
                            className="
                                mx-auto
                                mb-4
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#FFF9F4]/70
                                shadow-lg
                                "
                        >
                            <SearchIcon
                                size={28}
                                className="text-[#634C5D]"
                            />
                        </div>

                        <h2 className="text-lg font-semibold text-[#241B24]">
                            Find someone
                        </h2>

                        <p className="mt-1 text-sm text-[#71616B]">
                            Search by name or username
                        </p>

                    </div>
                )}

            </div>
        </>
    )
}
