import UploadAgent from "./agent";
import { UploadAgentOptions } from "./types";

export const createUploadAgent = (options: UploadAgentOptions): UploadAgent => {
  return new UploadAgent(options);
};
