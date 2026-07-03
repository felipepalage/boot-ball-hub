import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Navbar } from '@/components/Navbar';
import { NotificationBell } from '@/components/NotificationBell';
import { authService } from '@/services/authService';
import HomePage from './pages/HomePage';
import TimesPage from './pages/TimesPage';
import FeedPage from './pages/FeedPage';
import RankingPage from './pages/RankingPage';
import CriarDesafioPage from './pages/CriarDesafioPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TimeProfilePage from './pages/TimeProfilePage';
import EmpresaProfilePage from './pages/EmpresaProfilePage';
import DisponibilidadePage from './pages/DisponibilidadePage';
import CalendarioPage from './pages/CalendarioPage';
import TemporadasPage from './pages/TemporadasPage';
import MuralPage from './pages/MuralPage';
import FinanceiroPage from './pages/FinanceiroPage';
import AdminPage from './pages/AdminPage';
import QuadrasPage from './pages/QuadrasPage';
import TorneiosPage from './pages/TorneiosPage';
import TorneioDetalhePage from './pages/TorneioDetalhePage';
import DesafioDetalhePage from './pages/DesafioDetalhePage';
import JogadorPerfilPage from './pages/JogadorPerfilPage';
import ArtilhariaPage from './pages/ArtilhariaPage';
import AmistosoPage from './pages/AmistosoPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="fixed right-4 top-4 z-40">
      <NotificationBell />
    </div>
    {children}
    <FloatingActionButton />
    <Navbar />
  </>
);

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/times/:timeId/:slug?" element={<TimeProfilePage />} />
          <Route path="/empresas/:empresaId/:slug?" element={<EmpresaProfilePage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
          <Route path="/times" element={<ProtectedRoute><AppLayout><TimesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><AppLayout><FeedPage /></AppLayout></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><AppLayout><RankingPage /></AppLayout></ProtectedRoute>} />
          <Route path="/desafios/novo" element={<ProtectedRoute><AppLayout><CriarDesafioPage /></AppLayout></ProtectedRoute>} />
          <Route path="/quadras" element={<ProtectedRoute><AppLayout><QuadrasPage /></AppLayout></ProtectedRoute>} />
          <Route path="/torneios" element={<ProtectedRoute><AppLayout><TorneiosPage /></AppLayout></ProtectedRoute>} />
          <Route path="/torneios/:id" element={<ProtectedRoute><AppLayout><TorneioDetalhePage /></AppLayout></ProtectedRoute>} />
          <Route path="/desafios/:id" element={<ProtectedRoute><AppLayout><DesafioDetalhePage /></AppLayout></ProtectedRoute>} />
          <Route path="/jogadores/:id/perfil" element={<AppLayout><JogadorPerfilPage /></AppLayout>} />
          <Route path="/artilharia" element={<ProtectedRoute><AppLayout><ArtilhariaPage /></AppLayout></ProtectedRoute>} />
          <Route path="/amistoso" element={<ProtectedRoute><AppLayout><AmistosoPage /></AppLayout></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><AppLayout><CalendarioPage /></AppLayout></ProtectedRoute>} />
          <Route path="/temporadas" element={<ProtectedRoute><AppLayout><TemporadasPage /></AppLayout></ProtectedRoute>} />
          <Route path="/mural" element={<ProtectedRoute><AppLayout><MuralPage /></AppLayout></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><AppLayout><FinanceiroPage /></AppLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminPage /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
