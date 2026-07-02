import { useEffect, useState } from 'react';
import { Typography, Spin, Button, Row, Col } from 'antd';
import {
  ExperimentOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ChatPanel from '@/components/ChatPanel';
import CardReveal from '@/components/CardReveal';
import { useTurtleSoupStore } from '@/stores/turtleSoupStore';
import { selectCard } from '@/engine/card-selector';
import { getTurtleSoupExpiry } from '@/config/keys';

const { Title, Text } = Typography;

export default function TurtleSoupPage() {
  const navigate = useNavigate();
  const [showReveal, setShowReveal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const store = useTurtleSoupStore();

  // 启动游戏：选牌
  useEffect(() => {
    if (store.targetCard && store.status !== 'idle') return;

    let cancelled = false;
    async function init() {
      try {
        const card = await selectCard(null, (attempt, name, reason) => {
          if (!cancelled) {
            setLoadError(`第 ${attempt} 次重抽：${name}（${reason}）`);
          }
        });
        if (!cancelled) {
          store.setTargetCard(card);
          setLoading(false);
          setLoadError('');
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(`加载失败：${String(err)}`);
          setLoading(false);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // 游戏结束时展示结果
  useEffect(() => {
    if (store.status === 'won' || store.status === 'gaveUp') {
      setTimeout(() => setShowReveal(true), 600);
    }
  }, [store.status]);

  const handleGiveUp = () => {
    store.giveUp();
  };

  const handlePlayAgain = () => {
    setShowReveal(false);
    setLoading(true);
    store.reset();
    // 重新触发 useEffect
    setTimeout(() => {
      selectCard(null, (attempt, name, reason) => {
        setLoadError(`第 ${attempt} 次重抽：${name}（${reason}）`);
      }).then((card) => {
        store.setTargetCard(card);
        setLoading(false);
        setLoadError('');
      }).catch((err) => {
        setLoadError(`加载失败：${String(err)}`);
        setLoading(false);
      });
    }, 100);
  };

  const expiry = getTurtleSoupExpiry();

  // 加载中
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
          {loadError || '正在准备海龟汤...'}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
          退出
        </Button>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <ExperimentOutlined style={{ marginRight: 8, color: '#722ed1' }} />
            海龟汤模式
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            通过提问来推断卡牌 | 模式有效期至 {expiry || '未知'}
          </Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={18}>
          <ChatPanel
            messages={store.messages}
            questionCount={store.questionCount}
            maxQuestions={100}
            status={store.status}
            loadingMessage={store.loadingMessage}
            onSend={(content) => store.sendMessage(content)}
            onGiveUp={handleGiveUp}
          />
        </Col>
        <Col xs={24} md={6}>
          <div
            style={{
              padding: 16,
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
            }}
          >
            <Text strong>💡 提问技巧</Text>
            <ul style={{ paddingLeft: 20, marginTop: 8, fontSize: 13, color: '#666' }}>
              <li>直接输入牌名即可猜牌</li>
              <li>问颜色："它是红色的吗？"</li>
              <li>问类别："它是生物吗？"</li>
              <li>问费用："CMC大于3吗？"</li>
              <li>问异能："它有飞行吗？"</li>
              <li>问系列："它来自依尼翠吗？"</li>
              <li>裁判只回答：是/否/无法确定</li>
            </ul>
          </div>
        </Col>
      </Row>

      <CardReveal
        open={showReveal}
        card={store.targetCard}
        won={store.status === 'won'}
        guessCount={0}
        hintsRevealed={store.questionCount}
        score={0}
        onClose={() => setShowReveal(false)}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
