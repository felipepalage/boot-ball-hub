import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/authService';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

type FormValues = z.infer<typeof schema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await authService.login(data);
      toast.success('Login realizado com sucesso.');
      navigate('/');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Credenciais inválidas.'));
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.2),transparent_22%),linear-gradient(180deg,#09090b_0%,#111827_45%,#050505_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_420px]">
        <section className="hidden lg:block">
          <p className="text-xs uppercase tracking-[0.34em] text-white/55">Plataforma corporativa</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white">
            Organize amistosos entre empresas sem depender de planilhas e mensagens soltas.
          </h1>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 flex justify-center">
            <img src={logo} alt="Boleiroffice" className="h-24 w-auto object-contain" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-white/60">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="seu@email.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary aria-invalid:border-red-500"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-white/60">Senha</label>
              <input
                type="password"
                {...register('senha')}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary aria-invalid:border-red-500"
                aria-invalid={!!errors.senha}
              />
              {errors.senha && <p className="mt-1 text-xs text-red-400">{errors.senha.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Cadastre-se
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
