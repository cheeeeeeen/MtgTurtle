import { Card, Row, Col, Button, Typography, Divider } from 'antd';
import {
  PlayCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '@/components/SettingsPanel';
import ScoreBoard from '@/components/ScoreBoard';
import { useGameStore, FORMAT_OPTIONS } from '@/stores/gameStore';
import { getTodayUTCDate } from '@/engine/daily-challenge';

const { Title, Text } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const stats = useGameStore((s) => s.stats);
  const formatFilter = useGameStore((s) => s.formatFilter);

  const today = getTodayUTCDate();
  const dailyCompleted = localStorage.getItem(`daily_${today}`);

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
          {/* 游戏模式入口 */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                hoverable
                onClick={() => navigate('/game')}
                style={{ textAlign: 'center', height: '100%' }}
              >
                <PlayCircleOutlined
                  style={{ fontSize: 48, color: '#1677ff', marginBottom: 12 }}
                />
                <Title level={4}>自由模式</Title>
                <Text type="secondary">
                  随时开始猜牌<br />
                  当前赛制：{formatLabel}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="primary" block>
                    开始游戏
                  </Button>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                hoverable
                onClick={() => navigate('/daily')}
                style={{
                  textAlign: 'center',
                  height: '100%',
                  ...(dailyCompleted
                    ? { opacity: 0.7 }
                    : {}),
                }}
              >
                <CalendarOutlined
                  style={{ fontSize: 48, color: '#faad14', marginBottom: 12 }}
                />
                <Title level={4}>每日挑战</Title>
                <Text type="secondary">
                  {dailyCompleted
                    ? '今天已完成 ✅'
                    : `${today} 的挑战`}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="primary" block>
                    开始挑战
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>

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
