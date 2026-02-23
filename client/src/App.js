import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ShopOutlined,
  ReconciliationOutlined,
  TeamOutlined,
  LineChartOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

import 'antd/dist/antd.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContractsPage from './pages/ContractsPage';
import TendersPage from './pages/TendersPage';
import VendorsPage from './pages/VendorsPage';

const { Header, Content, Footer, Sider } = Layout;

// Mock components for different sections
const Dashboard = () => <div className="dashboard" style={{ padding: 24, textAlign: 'center' }}>
  <h2>合同和招标管理平台</h2>
  <p>欢迎使用第三方合同和招标管理平台</p>
  <div style={{ marginTop: 20 }}>
    <p>选择左侧菜单中的功能模块开始使用：</p>
    <ul style={{ textAlign: 'left', display: 'inline-block' }}>
      <li><b>合同管理</b>: 创建、编辑、跟踪合同</li>
      <li><b>招标管理</b>: 发布、管理招标项目</li>
      <li><b>供应商管理</b>: 管理供应商信息和评价</li>
    </ul>
  </div>
</div>;

const Bids = () => <div className="bids" style={{ padding: 24, textAlign: 'center' }}>投标管理功能</div>;
const Reports = () => <div className="reports" style={{ padding: 24, textAlign: 'center' }}>报告与分析功能</div>;

const AppContent = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = React.useState(false);
  // Set default selected key based on current route
  const [selectedMenu, setSelectedMenu] = React.useState(() => {
    const path = location.pathname;
    if (path === '/contracts') return 'contracts';
    if (path === '/tenders') return 'tenders';
    if (path === '/vendors') return 'vendors';
    if (path === '/bids') return 'bids';
    if (path === '/reports') return 'reports';
    return 'dashboard';
  });

  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/contracts') setSelectedMenu('contracts');
    else if (path === '/tenders') setSelectedMenu('tenders');
    else if (path === '/vendors') setSelectedMenu('vendors');
    else if (path === '/bids') setSelectedMenu('bids');
    else if (path === '/reports') setSelectedMenu('reports');
    else setSelectedMenu('dashboard');
  }, [location.pathname]);

  const menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: '仪表板' },
    { key: 'contracts', icon: <FileTextOutlined />, label: '合同管理' },
    { key: 'tenders', icon: <ReconciliationOutlined />, label: '招标管理' },
    { key: 'vendors', icon: <ShopOutlined />, label: '供应商管理' },
    { key: 'bids', icon: <TeamOutlined />, label: '投标管理' },
    { key: 'reports', icon: <LineChartOutlined />, label: '报告分析' },
  ];

  const renderContent = () => {
    switch(selectedMenu) {
      case 'dashboard': return <Dashboard />;
      case 'contracts': return <ContractsPage />;
      case 'tenders': return <TendersPage />;
      case 'vendors': return <VendorsPage />;
      case 'bids': return <Bids />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  const handleLogout = () => {
    logout();
  };

  // User menu for dropdown
  const userMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: '个人资料',
          icon: <UserOutlined />,
          onClick: () => setSelectedMenu('profile')
        },
        {
          key: 'logout',
          label: '退出登录',
          icon: <LogoutOutlined />,
          onClick: handleLogout
        }
      ]}
    />
  );

  // Don't show the layout if on login/register page
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          {collapsed ? 'CTP' : '合同管理平台'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[selectedMenu]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            setSelectedMenu(key);
            if (key === 'dashboard') {
              window.location.href = '/';
            } else {
              window.location.href = '/' + key;
            }
          }}
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
            {selectedMenu === 'dashboard' && '仪表板'}
            {selectedMenu === 'contracts' && '合同管理'}
            {selectedMenu === 'tenders' && '招标管理'}
            {selectedMenu === 'vendors' && '供应商管理'}
            {selectedMenu === 'bids' && '投标管理'}
            {selectedMenu === 'reports' && '报告分析'}
          </div>
          <div>
            {user ? (
              <Dropdown overlay={userMenu} trigger={['click']}>
                <Button type="link" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                  <UserOutlined /> 欢迎, {user.first_name || user.username}!
                </Button>
              </Dropdown>
            ) : (
              <span>请登录</span>
            )}
          </div>
        </Header>
        <Content style={{ margin: '16px 16px', overflow: 'initial' }}>
          <div
            className="site-layout-background"
            style={{
              padding: 0,
              textAlign: 'center',
            }}
          >
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          合同和招标管理平台 ©{new Date().getFullYear()} 开发团队
        </Footer>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/contracts" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/tenders" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/vendors" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/bids" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;