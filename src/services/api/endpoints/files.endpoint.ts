import { InternalFileType } from "../../../modules/choose-plan-page/interactor";
import { ApiFile } from "../types";

async function mockGetFiles(): Promise<GetFilesResponse> {
  const mockFile: ApiFile = {
    id: "1",
    size: 1024, // file size in bytes
    filename: "test.pdf",
    created_at: new Date(),
    aws_url: "/files/test.pdf", // replace with actual URL
    internal_type: InternalFileType.PDF, // replace with your desired type
  };

  const mockResponse: ApiFile[] = [mockFile];

  // Simulate an async delay (optional)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {files: mockResponse};
}
export class FilesEndpoint {
  async getFiles() {
    const request = await mockGetFiles();
    return request;
  }

  async downloadFile(fileId: ApiFile["id"]) {
    return { format: InternalFileType.PDF, filename: "dummy.pdf", url: "/files/test.pdf" };
  }

  async editedFile(fileId: ApiFile["id"]) {
    return { format: InternalFileType.PDF, filename: "dummy.pdf", url: "/files/test.pdf" };
  }
}

export interface GetFilesResponse {
  files: ApiFile[];
}

export interface DownloadFileResponse {
  format: InternalFileType;
  filename: string;
  url: string;
}

export interface GetEditedFileResponse extends DownloadFileResponse {}

interface UploadLinkResponse {
  filename: string;
  url: string;
}

interface UploadFileToBucket {
  uploadLink: string;
  file: File;
}
