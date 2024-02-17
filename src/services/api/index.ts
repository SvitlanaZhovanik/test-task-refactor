import { AuthEndpoint } from "./endpoints/auth.endpoint";
import { FilesEndpoint } from "./endpoints/files.endpoint";


export const API = {
  auth: new AuthEndpoint(),
  files: new FilesEndpoint(),
}
