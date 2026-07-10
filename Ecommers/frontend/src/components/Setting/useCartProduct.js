import axios from "axios";
import { useQuery } from "@tanstack/react-query";

async function getCartData() {
  const response = await axios.get(
    "http://localhost:4876/auth/getCartProduct",
    { withCredentials: true } // agar backend cookie se user pehchanta hai, yeh zaroori hai
  );
  return response.data.data;
}

export default function useCartProduct() {
  return useQuery({
    queryKey: ["cartdata"],
    queryFn: getCartData,
  });
}
