import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

interface PredictCategoryPayload {
  title: string;
  description?: string;
}

interface PredictCategoryResponse {
  categoryId: string;
  confidence: number;
}

export function predictCategory(payload: PredictCategoryPayload) {
  return axios
    .post<ResponseBody<PredictCategoryResponse>>(
      ENDPOINTS.predictCategory,
      payload
    )
    .then((res) => res.data);
}
