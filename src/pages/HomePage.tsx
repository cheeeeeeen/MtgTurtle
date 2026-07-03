import { Card, Row, Col, Button, Typography, Divider, Space } from 'antd';
import { MessageOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '@/components/SettingsPanel';
import ScoreBoard from '@/components/ScoreBoard';
import { useGameStore, FORMAT_OPTIONS } from '@/stores/gameStore';

const { Title, Text, Paragraph } = Typography;

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
          <Card
            size="small"
            title={
              <span>
                <MessageOutlined style={{ marginRight: 8 }} />
                联系与反馈
              </span>
            }
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" size={4}>
              <Text>
                作者：<Text strong>木叶狐</Text>
              </Text>
              <Text>
                QQ：<Text copyable>1357487975</Text>
              </Text>
              <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                如果你遇到了 Bug、发现提示不准确，或者有新的玩法建议，
                欢迎来找我交流。每一条反馈都会帮助这个小游戏变得更好。
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
