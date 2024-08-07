# DevCodes-SDK Upload Agent 🚀

The `devcodes-sdk/upload-server` provides functionality for handling file uploads, interacting with Amazon S3, and optimizing image files. This document explains how to install and use the provided functions.

> **Note**: This version is still in development and testing (beta). It may contain bugs and is not yet considered production-ready.

> **Note**: If you are encountering an `AccessDenied` error with `isPrivateAccess=false`, please review your bucket policy to ensure that the bucket is publicly accessible. To enable public access, navigate to the bucket's permissions tab and click on the "Block public access" settings. Then, **disable** the "Block all public access" option and save the changes.

## Features

- **Multiple S3 Clients**: Manage multiple S3 configurations and buckets within a single instance.
- **Image Optimization**: Automatically optimize images before uploading them to S3.
- **Public/Private File Uploads**: Support for uploading files with different access levels (public or private).
- **Pre-Signed URLs**: Generate pre-signed URLs for secure access to files in S3.
- **File Deletion**: Easily delete files from S3.

## Installation

To install the package, run:

```
npm install @devcodes-sdk/upload-server
```

## Setup

### Initialization

First, import and initialize the UploadAgent with the necessary options:

```
import UploadAgent from "@devcodes-sdk/server-upload";

const uploadAgent = new UploadAgent({
  s3: [
    {
      bucketName: "your-bucket-name",
      accessKey: "",
      bucketRegion: "",
      secretKey: "",
      isPrivateAccess: true, // Note: This setting does not override inline access permissions.
    },
  ],
}).create();

export const {
  uploadMiddleware,
  uploadFilesFromRequest,
  uploadFileToS3,
  generatePreSignedUrl,
  deleteFileFromS3,
} = uploadAgent;

```

### Multer Middleware - (uploadMiddleware)

This middleware handles file uploads with the following features:

#### Parameters:

- **allowedMimes** (Array): Specifies the allowed MIME types for uploaded files. For example, `["image/png"]` restricts uploads to PNG images only.
- **maxSize** (Number): Defines the maximum allowed file size in bytes. For instance, `10 * 1024 * 1024` sets a limit of `10 megabytes`.

#### Single vs. Array Uploads:

- **Single Upload**: When using `.single("file")`, the uploaded file is accessed via `req.file`.
- **Array Uploads**: When using `.array("files")`, the uploaded files are accessed via `req.files`.

The middleware returns the uploaded file(s) as a buffer, depending on whether a single file or multiple files are uploaded.

```
app.post(
  "/upload",
  uploadMiddleware({
    allowedMimes: ["image/png"],
    maxSize: 10 * 1024 * 1024,
  }).single("avatar"),
  async (req, res) => {
    try {
      // if .single("") is used, req.file will contain the file
      const file = req.file;

      // if .array("") is used, req.files will contain the files
      const files = req.files;
    } catch (error) {
      res.status(400).json({ message: error });
    }
  }
);
```

### Upload Files from Request - (uploadFilesFromRequest)

Processes files uploaded via an HTTP request and uploads them to S3.

- **Required**: `uploadMiddleware`

#### Parameters:

- **req:** (Express Request Object): The HTTP request object.
- **folder:** (String): S3 folder path. `// Node: It must start with '/' and not end with '/'`
- **isPrivateAccess:** (Boolean): Whether the file should be privately accessible.
- **bucketName:** (String): S3 bucket name.
- **imageOptimization:** (Boolean): Whether to optimize images.

```
app.post('/upload', uploadMiddleware.single('avatar'), async (req, res) => {
  try {
    const result = await uploadFilesFromRequest({
      req,
      folder: '/uploads',
      isPrivateAccess: true,
      bucketName: 'your-bucket-name',
      imageOptimization: true
    });
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
```

### Upload File to S3 - (uploadFileToS3)

Uploads a file directly to S3.

#### Parameters:

- **file:** (Buffer): File buffer.
- **folder:** (String): S3 folder path. `// Node: It must start with '/' and not end with '/'`
- **isPrivateAccess:** (Boolean): Whether the file should be privately accessible.
- **bucketName:** (String): S3 bucket name.
- **imageOptimization:** (Boolean): Whether to optimize images.

```
uploadFileToS3({
  file: fileBuffer,
  folder: '/uploads',
  isPrivateAccess: true,
  bucketName: 'your-bucket-name',
  imageOptimization: false
}).then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```

### Generate PreSignedURL - (generatePreSignedUrl)

Generates a pre-signed URL for accessing a file in S3.

#### Parameters:

- **key:** (String): S3 file key.
- **bucketName:** (String): S3 bucket name.
- **expiresIn:** (Number): URL expiration time in seconds.

```
generatePreSignedUrl({
  key: '/uploads/b5c9fecc-1dd0-457f-b55d-dba223050b27',
  bucketName: 'your-bucket-name',
  expiresIn: 60 // URL valid for 60 seconds
}).then(url => {
  console.log(url);
}).catch(error => {
  console.error(error);
});
```

### Delete File from S3 - (deleteFileFromS3)

Deletes a file from S3.

#### Parameters:

- **key:** (String): S3 file key.
- **bucketName:** (String): S3 bucket name.

```
deleteFileFromS3({
  key: '/uploads/b5c9fecc-1dd0-457f-b55d-dba223050b27',
  bucketName: 'your-bucket-name'
}).then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```
