import { Link } from "react-router-dom";
import imgeConfig from "../config/imageConfig";
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signin() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const singinUser = useMutation({
    mutationFn: (data) => axios.post("https://react-project-ckcb.onrender.com/authRouter/singIn", data, { withCredentials: true }),
    onSuccess: (data) => {
      console.log(data)
      navigate('/')
    },
    onError: (error) => {
      console.log(error.response?.data);
    },
  })

  return (
    <div className="flex h-[450px] rounded-2xl m-8 overflow-hidden shadow-lg">
      <div className="w-1/2 bg-black/80 flex items-center justify-center p-8">
        <form className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="text"
            value={email}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <input
            type="password"
            value={password}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Your Password"
            className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              const data = {
                email,
                password
              }
              singinUser.mutate(data)
            }}
            className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Sign In
          </button>
        </form>
      </div>

      <div className="w-1/2 bg-black/50 flex items-center justify-center">
        <img
          src={imgeConfig.singinImage}
          alt="No Image"
          className="object-contain max-h-full"
        />
      </div>
    </div>

  );
}
