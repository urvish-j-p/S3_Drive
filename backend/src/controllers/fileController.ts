import { Request, Response } from 'express';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import File from '../models/file';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const key = `${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Store the key instead of the full URL
    const newFile = await File.create({
      originalName: file.originalname,
      key,
      fileType: file.mimetype,
      size: file.size,
    });

    res.status(201).json(newFile);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

export const getFiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    
    // Generate pre-signed URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: file.key,
        });
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
        
        return {
          ...file.toObject(),
          fileUrl: presignedUrl,
        };
      })
    );

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file.key,
    });

    await s3Client.send(command);
    await file.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};