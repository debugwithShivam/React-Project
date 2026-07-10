import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getOrderProductData(params) {
  try {
    let response = await axios.get(
      "http://localhost:4876/auth/getBuyProductdata",
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
