import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Navbar } from '@/components/Navbar';
import { NotificationBell } from '@/components/NotificationBell';
import { authService } from '@/services/authService';

// Rotas carregadas sob demanda (code-splitting) — reduz o bundle inicial.
const HomePage = lazy(() => import('./pages/HomePage'));
const TimesPage = lazy(() => import('./pages/TimesPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const RankingPage = lazy(() => import('./pages/RankingPage'));
const CriarDesafioPage = lazy(() => import('./pages/CriarDesafioPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TimeProfilePage = lazy(() => import('./pages/TimeProfilePage'));
const EmpresaProfilePage = lazy(() => import('./pages/EmpresaProfilePage'));
const DisponibilidadePage = lazy(() => import('./pages/DisponibilidadePage'));
const CalendarioPage = lazy(() => import('./pages/CalendarioPage'));
const TemporadasPage = lazy(() => import('./pages/TemporadasPage'));
const MuralPage = lazy(() => import('./pages/MuralPage'));
const FinanceiroPage = lazy(() => import('./pages/FinanceiroPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const QuadrasPage = lazy(() => import('./pages/QuadrasPage'));
const TorneiosPage = lazy(() => import('./pages/TorneiosPage'));
const TorneioDetalhePage = lazy(() => import('./pages/TorneioDetalhePage'));
const DesafioDetalhePage = lazy(() => import('./pages/DesafioDetalhePage'));
const JogadorPerfilPage = lazy(() => import('./pages/JogadorPerfilPage'));
const ArtilhariaPage = lazy(() => import('./pages/ArtilhariaPage'));
const AmistosoPage = lazy(() => import('./pages/AmistosoPage'));
const EstatisticasPage = lazy(() => import('./pages/EstatisticasPage'));
const TermosPage = lazy(() => import('./pages/TermosPage'));
const PrivacidadePage = lazy(() => import('./pages/PrivacidadePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
        <Suspense
          fallback={
            <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
              Carregando…
            </div>
          }
        >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/termos" element={<TermosPage />} />
          <Route path="/privacidade" element={<PrivacidadePage />} />
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
          <Route path="/estatisticas" element={<ProtectedRoute><AppLayout><EstatisticasPage /></AppLayout></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><AppLayout><CalendarioPage /></AppLayout></ProtectedRoute>} />
          <Route path="/temporadas" element={<ProtectedRoute><AppLayout><TemporadasPage /></AppLayout></ProtectedRoute>} />
          <Route path="/mural" element={<ProtectedRoute><AppLayout><MuralPage /></AppLayout></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><AppLayout><FinanceiroPage /></AppLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminPage /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
