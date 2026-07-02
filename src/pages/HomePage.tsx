import { Card, Row, Col, Button, Typography, Divider } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '@/components/SettingsPanel';
import ScoreBoard from '@/components/ScoreBoard';
import { useGameStore, FORMAT_OPTIONS } from '@/stores/gameStore';

const { Title, Text } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const stats = useGameStore((s) => s.stats);
  const formatFilter = useGameStore((s) => s.formatFilter);

  const formatLabel =
    FORMAT_OPTIONS.find((f) => f.code === formatFilter)?.name || '全部赛制';

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>🐢 万智牌海龟汤</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          根据提示猜出万智牌的名字！支持中英文
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card
            hoverable
            onClick={() => navigate('/game')}
            style={{ textAlign: 'center', marginBottom: 16 }}
          >
            <PlayCircleOutlined
              style={{ fontSize: 48, color: '#1677ff', marginBottom: 12 }}
            />
            <Title level={4}>开始游戏</Title>
            <Text type="secondary">
              随机一张万智牌，根据提示猜出它的名字<br />
              当前赛制：{formatLabel}
            </Text>
            <div style={{ marginTop: 12 }}>
              <Button type="primary" size="large" block>
                开始游戏
              </Button>
            </div>
          </Card>

          <Divider />

          <SettingsPanel />
        </Col>

        <Col xs={24} md={8}>
          <ScoreBoard stats={stats} />
        </Col>
      </Row>
    </div>
  );
}
