import { createLazyFileRoute } from '@tanstack/react-router'
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';

export const Route = createLazyFileRoute('/upload/')({
  component: UploadPage
})

const props: UploadProps = {
  name: 'file',
  multiple: true,
  directory: true,
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
}

const { Dragger } = Upload;

function UploadPage() {
  return <div>
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
    </Dragger></div>
}