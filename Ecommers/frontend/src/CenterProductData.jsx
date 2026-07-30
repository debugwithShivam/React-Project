import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getProductData() {
  const response = await axios.get(
    "http://localhost:4876/auth/getProduct"
  );

  return response.data.data;
}

export function useProducts() {
  return useQuery({
    queryKey: ["productData"],
    queryFn: getProductData,
  });
}
