import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useQueryClient,useMutation } from "@tanstack/react-query";

async function getOrderProductData(params) {
  try {
    let response = await axios.get(
      "http://localhost:4876/auth/getBuyProductdata",
      { withCredentials: true },
    );
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}

export default function OrderProduct() {
  return useQuery({
    queryKey: ["deleteBuyOrder"],
    queryFn: getOrderProductData,
  });
}




