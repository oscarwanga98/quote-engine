import axios from "axios";
import { DEFAULT_CONFIG } from "../config/constants.js";

export const downloadImage = async (url) => {
  const response = await axios({
    method: "GET",
    url,
    responseType: "arraybuffer",
    timeout: DEFAULT_CONFIG.TIMEOUT,
  });
  return Buffer.from(response.data, "binary");
};
