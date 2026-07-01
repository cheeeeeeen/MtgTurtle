import { Layout as AntLayout, Typography } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content } = AntLayout;
const { Title } = Typography;

export default function Layout() {
  const navigate = useNavigate();

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#1a1a2e',
          padding: '0 24px',
          height: 56,
        }}
      >
        <Title
          level={4}
          style={{
            color: '#fff',
            margin: 0,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={() => navigate('/')}
        >
          🐢 万智牌海龟汤
        </Title>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
}
