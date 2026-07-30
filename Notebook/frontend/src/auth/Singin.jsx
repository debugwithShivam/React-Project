import { Link } from "react-router-dom";
import imgeConfig from "../config/imageConfig";

export default function Signin() {
  return (
    <div className="flex h-85 rounded-2xl m-8">
      <div className="w-full  rounded-tl-2xl rounded-bl-2xl bg-black/80"></div>
      <div className="w-full  rounded-tr-2xl rounded-br-2xl bg-black/50 flex  justify-center pt-3">
        <img
          src={imgeConfig.singinImage}
          className=" object-contain"
          alt="No Image"
        />
      </div>
    </div>
  );
}
