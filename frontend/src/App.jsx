import React, { useState, useEffect } from 'react';
import { Upload, message, Table, Button, Card, Space, Typography, Spin, Image, Modal, List } from 'antd';
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
  FileUnknownOutlined,
  PlayCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;
const { Title } = Typography;

function App() {
  const [fileList, setFileList] = useState([]);
  const [uploadList, setUploadList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/files');
      setFileList(response.data);
    } catch (error) {
      message.error('Failed to fetch files');
    } finally {
      setLoading(false);
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
      
      setUploadList(newFileList.slice(-5));
      
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
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
    window.open(fileUrl, '_blank');
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const renderPreviewContent = (file) => {
    if (!file) return null;

    if (file.fileType.startsWith('image/')) {
      return <Image src={file.fileUrl} style={{ width: '100%' }} />;
    }

    if (file.fileType.startsWith('video/')) {
      return (
        <video controls style={{ width: '100%' }}>
          <source src={file.fileUrl} type={file.fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.fileType.startsWith('audio/')) {
      return (
        <audio controls style={{ width: '100%' }}>
          <source src={file.fileUrl} type={file.fileType} />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    if (file.fileType === 'application/pdf') {
      return (
        <iframe
          src={file.fileUrl}
          style={{ width: '100%', height: '80vh' }}
          title="PDF Preview"
        />
      );
    }

    return (
      <div className="text-center p-8">
        {getFileIcon(file.fileType)}
        <h3 className="mt-4 text-lg font-semibold">{file.originalName}</h3>
        <p className="text-gray-500 mt-2">
          {formatFileSize(file.size)} • {file.fileType}
        </p>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(file.fileUrl, file.originalName)}
          className="mt-4"
        >
          Download
        </Button>
      </div>
    );
  };

  const getFileTypeIcon = (fileType) => {
    const iconStyle = {
      width: isMobile ? '32px' : '40px',
      height: isMobile ? '32px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      borderRadius: '4px',
      border: '1px solid #d9d9d9'
    };

    if (fileType.startsWith('image/')) {
      return (
        <div style={iconStyle}>
          <PictureOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#1890ff' }} />
        </div>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <div style={iconStyle}>
          <VideoCameraOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#ff4d4f' }} />
        </div>
      );
    }

    if (fileType.startsWith('audio/')) {
      return (
        <div style={iconStyle}>
          <AudioOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#722ed1' }} />
        </div>
      );
    }

    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return (
        <div style={iconStyle}>
          <FileExcelOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#52c41a' }} />
        </div>
      );
    }

    if (fileType.includes('pdf')) {
      return (
        <div style={iconStyle}>
          <FilePdfOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#fa541c' }} />
        </div>
      );
    }

    if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <div style={iconStyle}>
          <FileWordOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#2f54eb' }} />
        </div>
      );
    }

    if (fileType.includes('zip') || fileType.includes('compressed')) {
      return (
        <div style={iconStyle}>
          <FileZipOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#faad14' }} />
        </div>
      );
    }

    if (fileType.includes('text/')) {
      return (
        <div style={iconStyle}>
          <FileTextOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#13c2c2' }} />
        </div>
      );
    }

    return (
      <div style={iconStyle}>
        <FileUnknownOutlined style={{ fontSize: isMobile ? '18px' : '24px', color: '#8c8c8c' }} />
      </div>
    );
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
      width: isMobile ? 60 : 80,
      align: 'center',
      render: (_, record) => getFileTypeIcon(record.fileType),
    },
    {
      title: 'File Name',
      dataIndex: 'originalName',
      key: 'originalName',
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{text}</span>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            className="hover:text-blue-500"
          />
        </div>
      ),
    },
    {
      title: 'Size',
      key: 'size',
      width: 120,
      responsive: ['md'],
      render: (_, record) => formatFileSize(record.size),
    },
    {
      title: 'Uploaded',
      key: 'createdAt',
      width: 150,
      responsive: ['lg'],
      render: (_, record) => new Date(record.createdAt).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: isMobile ? 100 : 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.fileUrl, record.originalName)}
            className="hover:scale-105 transition-transform"
            size={isMobile ? "small" : "middle"}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            className="hover:scale-105 transition-transform"
            size={isMobile ? "small" : "middle"}
          />
        </Space>
      ),
    },
  ];

  const renderMobileList = () => (
    <List
      dataSource={fileList}
      renderItem={(file) => (
        <List.Item
          className="p-4 hover:bg-gray-50"
        >
          <div className="flex items-center w-full">
            <div className="mr-3">
              {getFileTypeIcon(file.fileType)}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium truncate">{file.originalName}</span>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(file)}
                  className="hover:text-blue-500"
                  size="small"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
              </div>
            </div>
            <Space size="small" className="ml-2">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(file.fileUrl, file.originalName)}
                className="hover:scale-105 transition-transform"
                size="small"
              />
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(file._id)}
                className="hover:scale-105 transition-transform"
                size="small"
              />
            </Space>
          </div>
        </List.Item>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="text-center mb-4 sm:mb-8">S3Drive</Title>
        
        <Card className="mb-4 sm:mb-8 shadow-md">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: isMobile ? '36px' : '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text text-base sm:text-lg">Click or drag files to upload</p>
            <p className="ant-upload-hint text-gray-500 text-sm">
              Support for single or bulk upload
            </p>
          </Dragger>
        </Card>

        <Card className="shadow-md">
          <Spin spinning={loading} tip="Loading files...">
            {isMobile ? renderMobileList() : (
              <Table
                columns={columns}
                dataSource={fileList}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                className="file-table"
                scroll={{ x: true }}
              />
            )}
          </Spin>
        </Card>

        <Modal
          open={previewVisible}
          title={previewFile?.originalName}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={isMobile ? '100%' : 800}
          style={{ top: isMobile ? 0 : 100 }}
          className={isMobile ? 'full-screen-modal' : ''}
        >
          {renderPreviewContent(previewFile)}
        </Modal>
      </div>
    </div>
  );
}

export default App;