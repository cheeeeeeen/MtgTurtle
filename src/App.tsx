import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import GamePage from '@/pages/GamePage';
import DailyPage from '@/pages/DailyPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,   // 30 分钟
      gcTime: 60 * 60 * 1000,       // 1 小时
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
          },
        }}
      >
        <BrowserRouter basename="/MtgTurtle">
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/daily" element={<DailyPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
