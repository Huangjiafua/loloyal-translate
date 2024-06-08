
import { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SyncOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { useNavigate } from '@tanstack/react-router';

const { Header, Sider, Content } = Layout;

export const AppLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false);

  const handleSelect = (path: string) => {
    navigate({ to: path })
  }

  return <Layout>
    <SiderMenu collapsed={collapsed} onSelect={handleSelect} />
    <Layout>
      <MainContent collapsed={collapsed} onClick={() => setCollapsed(!collapsed)}>
        {children}
      </MainContent>
    </Layout>
  </Layout>
}


function SiderMenu({
  collapsed,
  onSelect
}: {
  collapsed: boolean
  onSelect: (key: string) => void
}) {
  const items = [
    {
      key: '1',
      icon: <UploadOutlined />,
      label: 'Upload',
    },
    {
      key: '/translate',
      icon: <SyncOutlined />,
      label: 'Translate',
    },
  ]

  return <Sider width={250} trigger={null} collapsed={collapsed}>
    <div className='flex items-center gap-4 p-2'>
      <img src="https://cdn.shopify.com/app-store/listing_images/90c0cbb40b9748b853b2851473234440/icon/COem9srGvYEDEAE=.png" alt="Logo" className='size-8' />
      <p className='text-white text-lg'>Loloyal</p>
    </div>
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['1']}
      items={items}
      onSelect={({ key }) => onSelect(key)}
    />
  </Sider>
}

function MainContent({
  collapsed,
  onClick,
  children,
}: {
  collapsed: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return <><Header style={{ padding: 0, background: colorBgContainer }}>
    <Button
      type="text"
      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={onClick}
      style={{
        fontSize: '16px',
        width: 64,
        height: 64,
      }}
    />
  </Header>
    <Content
      style={{
        margin: '24px 16px',
        padding: 24,
        minHeight: 'calc(100vh - 140px)',
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      {children}
    </Content></>
}