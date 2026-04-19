import multer from 'multer';

// Using memory storage because we want to upload directly to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
