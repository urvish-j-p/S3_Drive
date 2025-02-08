import React, { useState, useEffect } from 'react';
import { Upload, message, Table, Button, Card, Space, Typography } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;
const { Title } = Typography;

function App() {
  const [fileList, setFileList] = useState([]);
  const [uploadList, setUploadList] = useState([]);
  
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files');
      setFileList(response.data);
    } catch (error) {
      message.error('Failed to fetch files');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'http://localhost:5000/api/upload',
    fileList: uploadList,
    onChange(info) {
      const { status } = info.file;
      const newFileList = [...info.fileList];
      
      // Limit the number of files shown in upload list
      setUploadList(newFileList.slice(-5));
      
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        // Clear the upload list when file is done
        setUploadList(prev => prev.filter(file => file.uid !== info.file.uid));
        fetchFiles();
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove(file) {
      setUploadList(prev => prev.filter(item => item.uid !== file.uid));
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`);
      message.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      message.error('Failed to delete file');
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    // Open in new tab for preview/download
    window.open(fileUrl, '_blank');
  };

  const getFileIcon = (fileType) => {
    const iconStyle = { fontSize: '24px' };
    
    if (fileType.startsWith('image/')) {
      return <PictureOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    }
    if (fileType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
    }
    if (fileType.startsWith('audio/')) {
      return <AudioOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
    }
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileExcelOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    }
    if (fileType.includes('pdf')) {
      return <FilePdfOutlined style={{ ...iconStyle, color: '#fa541c' }} />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileWordOutlined style={{ ...iconStyle, color: '#2f54eb' }} />;
    }
    if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileZipOutlined style={{ ...iconStyle, color: '#faad14' }} />;
    }
    if (fileType.includes('text/')) {
      return <FileTextOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
    }
    return <FileUnknownOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      title: 'Type',
      key: 'type',
      width: 70,
      align: 'center',
      render: (_, record) => getFileIcon(record.fileType),
    },
    {
      title: 'File Name',
      dataIndex: 'originalName',
      key: 'originalName',
      render: (text) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Size',
      key: 'size',
      width: 120,
      render: (_, record) => formatFileSize(record.size),
    },
    {
      title: 'Uploaded',
      key: 'createdAt',
      width: 150,
      render: (_, record) => new Date(record.createdAt).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.fileUrl, record.originalName)}
            className="hover:scale-105 transition-transform"
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            className="hover:scale-105 transition-transform"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="text-center mb-8">S3Drive</Title>
        
        <Card className="mb-8 shadow-md">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text text-lg">Click or drag files to upload</p>
            <p className="ant-upload-hint text-gray-500">
              Support for single or bulk upload
            </p>
          </Dragger>
        </Card>

        <Card className="shadow-md">
          <Table
            columns={columns}
            dataSource={fileList}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            className="file-table"
          />
        </Card>
      </div>
    </div>
  );
}

export default App;