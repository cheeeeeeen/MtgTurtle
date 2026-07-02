import { useState } from 'react';
import { Row, Col, Button, Space, Spin, Typography, List, Tag, Alert } from 'antd';
import {
  FlagOutlined,
  ReloadOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import GuessInput from './GuessInput';
import HintPanel from './HintPanel';
import CardReveal from './CardReveal';
import ScoreBoard from './ScoreBoard';

const { Text } = Typography;

export default function GameBoard() {
  const navigate = useNavigate();
  const [showReveal, setShowReveal] = useState(false);

  const status = useGameStore((s) => s.status);
  const loadingMessage = useGameStore((s) => s.loadingMessage);
  const targetCard = useGameStore((s) => s.targetCard);
  const hintsRevealed = useGameStore((s) => s.hintsRevealed);
  const guesses = useGameStore((s) => s.guesses);
  const hintEngine = useGameStore((s) => s.hintEngine);
  const stats = useGameStore((s) => s.stats);
  const startGame = useGameStore((s) => s.startGame);
  const submitGuess = useGameStore((s) => s.submitGuess);
  const giveUp = useGameStore((s) => s.giveUp);
  const getScoreFn = useGameStore((s) => s.getScore);

  // 当游戏结束时展示结果
  const handleGuess = async (input: string) => {
    if (status !== 'playing') return;
    const correct = await submitGuess(input);
    if (correct) {
      setTimeout(() => setShowReveal(true), 600);
    }
  };

  const handleGiveUp = () => {
    giveUp();
    setShowReveal(true);
  };

  const handlePlayAgain = () => {
    setShowReveal(false);
    startGame();
  };

  // 加载状态
  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <Text
          type="secondary"
          style={{ display: 'block', marginTop: 16, fontSize: 14 }}
        >
          {loadingMessage || '正在准备游戏...'}
        </Text>
      </div>
    );
  }

  // 空闲状态（尚未开始）
  if (status === 'idle') {
    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Text
              type="secondary"
              style={{ fontSize: 16, display: 'block', marginBottom: 24 }}
            >
              随机一张万智牌，根据提示猜出它的名字
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => startGame()}
            >
              开始游戏
            </Button>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <ScoreBoard stats={stats} />
        </Col>
      </Row>
    );
  }

  // 游戏中
  return (
    <>
      <Row gutter={[24, 24]}>
        {/* 左侧：主游戏区 */}
        <Col xs={24} md={16}>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
              >
                退出
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handlePlayAgain}
                disabled={status === 'playing'}
              >
                重新开始
              </Button>
              {status === 'playing' && (
                <Button
                  danger
                  icon={<FlagOutlined />}
                  onClick={handleGiveUp}
                >
                  放弃
                </Button>
              )}
            </Space>
          </div>

          {/* 猜测输入 */}
          <GuessInput
            onGuess={handleGuess}
            disabled={status !== 'playing'}
            guessCount={guesses.length}
          />

          {/* 猜测历史 */}
          {guesses.length > 0 && (
            <List
              size="small"
              header={<Text strong>猜测记录</Text>}
              bordered
              style={{ marginBottom: 16 }}
              dataSource={[...guesses].reverse()}
              renderItem={(g, i) => (
                <List.Item>
                  <Space>
                    <Tag color={g.isCorrect ? 'success' : 'error'}>
                      {g.isCorrect ? '✓ 正确' : '✗'}
                    </Tag>
                    <Text delete={!g.isCorrect}>{g.input}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      #{guesses.length - i}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          )}

          {/* 状态提示 */}
          {status === 'won' && !showReveal && (
            <Alert
              message="恭喜猜对！"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          {status === 'gaveUp' && !showReveal && (
            <Alert
              message={`答案是：${
                targetCard?.atomic_official_name ||
                targetCard?.atomic_translated_name ||
                targetCard?.name
              }`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Col>

        {/* 右侧：提示面板 */}
        <Col xs={24} md={8}>
          <HintPanel
            hints={hintsRevealed}
            totalAvailable={hintEngine?.totalCount() ?? 0}
            remaining={hintEngine?.remainingCount() ?? 0}
          />
        </Col>
      </Row>

      {/* 答案揭晓 Modal */}
      <CardReveal
        open={showReveal}
        card={targetCard}
        won={status === 'won'}
        guessCount={guesses.length}
        hintsRevealed={hintsRevealed.length}
        score={getScoreFn().score}
        onClose={() => setShowReveal(false)}
        onPlayAgain={handlePlayAgain}
      />
    </>
  );
}
