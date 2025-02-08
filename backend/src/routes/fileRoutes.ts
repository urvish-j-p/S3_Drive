import express from 'express';
import multer from 'multer';
import { uploadFile, getFiles, deleteFile } from '../controllers/fileController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadFile);
router.get('/files', getFiles);
router.delete('/files/:id', deleteFile);

export default router;