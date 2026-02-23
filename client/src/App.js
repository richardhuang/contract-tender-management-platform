import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ShopOutlined,
  ReconciliationOutlined,
  TeamOutlined,
  LineChartOutlined,
  UserOutlined
} from '@ant-design/icons';

import 'antd/dist/reset.css';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

// Mock components for different sections
const Dashboard = () => <div className="dashboard">Dashboard Content</div>;
const Contracts = () => <div className="contracts">Contracts Management</div>;
const Tenders = () => <div className="tenders">Tenders Management</div>;
const Vendors = () => <div className="vendors">Vendors Management</div>;
const Bids = () => <div className="bids">Bids Management</div>;
const Reports = () => <div className="reports">Reports & Analytics</div>;
const UserProfile = () => <div className="user-profile">User Profile</div>;

const App = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedMenu, setSelectedMenu] = React.useState('dashboard');

  const menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
    { key: 'contracts', icon: <FileTextOutlined />, label: 'Contracts' },
    { key: 'tenders', icon: <ReconciliationOutlined />, label: 'Tenders' },
    { key: 'vendors', icon: <ShopOutlined />, label: 'Vendors' },
    { key: 'bids', icon: <TeamOutlined />, label: 'Bids' },
    { key: 'reports', icon: <LineChartOutlined />, label: 'Reports' },
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  const renderContent = () => {
    switch(selectedMenu) {
      case 'dashboard': return <Dashboard />;
      case 'contracts': return <Contracts />;
      case 'tenders': return <Tenders />;
      case 'vendors': return <Vendors />;
      case 'bids': return <Bids />;
      case 'reports': return <Reports />;
      case 'profile': return <UserProfile />;
      default: return <Dashboard />;
    }
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {collapsed ? 'CTP' : 'Contract Platform'}
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={['dashboard']}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key)}
          />
        </Sider>
        <Layout className="site-layout">
          <Header
            className="site-layout-background"
            style={{
              padding: 0,
              background: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: '20px'
            }}
          >
            <div style={{ paddingLeft: '20px', fontSize: '18px', fontWeight: 'bold' }}>
              {selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}
            </div>
            <div>
              <span>Welcome, User!</span>
            </div>
          </Header>
          <Content style={{ margin: '16px 16px', overflow: 'initial' }}>
            <div
              className="site-layout-background"
              style={{
                padding: 24,
                textAlign: 'center',
              }}
            >
              {renderContent()}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Contract and Tender Management Platform ©{new Date().getFullYear()} Created by Development Team
          </Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;