import { useState, useRef, useEffect } from 'react';
import { Input, Button, Space, Tag, Typography, Spin } from 'antd';
import { SendOutlined, FlagOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ChatMessage } from '@/types/card';

const { Text } = Typography;

interface ChatPanelProps {
  messages: ChatMessage[];
  questionCount: number;
  maxQuestions: number;
  status: string;
  loadingMessage: string;
  onSend: (content: string) => void;
  onGiveUp: () => void;
}

export default function ChatPanel({
  messages,
  questionCount,
  maxQuestions,
  status,
  loadingMessage,
  onSend,
  onGiveUp,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const isPlaying = status === 'playing';

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !isPlaying) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      {/* 顶部状态栏 */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Tag icon={<QuestionCircleOutlined />} color="purple">
            海龟汤模式
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提问 {questionCount}/{maxQuestions}
          </Text>
        </Space>
        {isPlaying && (
          <Button size="small" danger icon={<FlagOutlined />} onClick={onGiveUp}>
            放弃
          </Button>
        )}
      </div>

      {/* 消息列表 */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 16,
          background: '#fafafa',
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && isPlaying && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">
              向裁判提问，推断出这张万智牌是什么。<br />
              你可以问关于颜色、费用、类别、异能、系列等任何问题。<br />
              裁判只会回答「是」「否」「无法确定」。
            </Text>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 14px',
                borderRadius: 12,
                background:
                  msg.isCorrectGuess
                    ? '#f6ffed'
                    : msg.role === 'user'
                      ? '#1677ff'
                      : msg.content === '是'
                        ? '#f6ffed'
                        : msg.content === '否'
                          ? '#fff2f0'
                          : '#fff',
                color:
                  msg.isCorrectGuess
                    ? '#389e0d'
                    : msg.role === 'user'
                      ? '#fff'
                      : msg.content === '是'
                        ? '#389e0d'
                        : msg.content === '否'
                          ? '#cf1322'
                          : '#333',
                border: msg.role === 'assistant' ? '1px solid #e8e8e8' : 'none',
                fontSize: 14,
                lineHeight: 1.6,
                wordBreak: 'break-word',
              }}
            >
              {msg.role === 'assistant' && !msg.isCorrectGuess && (
                <Text
                  strong
                  style={{
                    fontSize: 12,
                    color: '#999',
                    display: 'block',
                    marginBottom: 2,
                  }}
                >
                  裁判
                </Text>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {loadingMessage && (
          <div style={{ textAlign: 'center', padding: 8 }}>
            <Spin size="small" /> <Text type="secondary">{loadingMessage}</Text>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          size="large"
          placeholder={
            isPlaying
              ? '提问或直接猜牌名（支持中英文）...'
              : '游戏已结束'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          disabled={!isPlaying}
          maxLength={200}
          suffix={
            <Text type="secondary" style={{ fontSize: 11 }}>
              {input.length}/200
            </Text>
          }
        />
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!isPlaying || !input.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  );
}
