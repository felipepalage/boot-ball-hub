import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/authService';

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\/\d{4})(\d)/, '$1-$2');
};

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  empresaNome: z.string().min(2, 'Nome da empresa obrigatório'),
  empresaCnpj: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v.length === 14, 'CNPJ deve ter 14 dígitos'),
  empresaBairro: z.string().min(2, 'Bairro obrigatório'),
  empresaCidade: z.string().min(2, 'Cidade obrigatória'),
  empresaLogoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-white/60">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary aria-invalid:border-red-500';

const RegisterPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const cnpjValue = watch('empresaCnpj') ?? '';

  const onSubmit = async (data: FormValues) => {
    try {
      await authService.register({ ...data, empresaLogoUrl: data.empresaLogoUrl || undefined });
      toast.success('Conta criada com sucesso.');
      navigate('/');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel concluir o cadastro.'));
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.22),transparent_20%),linear-gradient(180deg,#09090b_0%,#111827_45%,#050505_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_460px]">
        <section className="hidden lg:block">
          <p className="text-xs uppercase tracking-[0.34em] text-white/55">Cadastro corporativo</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white">
            O cadastro da plataforma e exclusivo para empresas com CNPJ valido.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/72">
            Sua organizacao entra pelo CNPJ, publica seus times e passa a disputar amistosos sem depender de grupos e planilhas.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 flex justify-center">
            <img src={logo} alt="Boleiroffice" className="h-20 w-auto object-contain" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="Nome" error={errors.nome?.message}>
              <input type="text" {...register('nome')} placeholder="Seu nome" className={inputClass} aria-invalid={!!errors.nome} />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input type="email" {...register('email')} placeholder="seu@email.com" className={inputClass} aria-invalid={!!errors.email} />
            </Field>

            <Field label="Empresa" error={errors.empresaNome?.message}>
              <input type="text" {...register('empresaNome')} placeholder="Nome da empresa" className={inputClass} aria-invalid={!!errors.empresaNome} />
            </Field>

            <Field label="CNPJ" error={errors.empresaCnpj?.message}>
              <input
                type="text"
                inputMode="numeric"
                value={formatCnpj(cnpjValue)}
                onChange={(e) => setValue('empresaCnpj', e.target.value, { shouldValidate: true })}
                placeholder="00.000.000/0000-00"
                className={inputClass}
                aria-invalid={!!errors.empresaCnpj}
              />
            </Field>

            <Field label="Logo da empresa (opcional)" error={errors.empresaLogoUrl?.message}>
              <input type="url" {...register('empresaLogoUrl')} placeholder="https://..." className={inputClass} aria-invalid={!!errors.empresaLogoUrl} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bairro" error={errors.empresaBairro?.message}>
                <input type="text" {...register('empresaBairro')} placeholder="Bairro base" className={inputClass} aria-invalid={!!errors.empresaBairro} />
              </Field>
              <Field label="Cidade" error={errors.empresaCidade?.message}>
                <input type="text" {...register('empresaCidade')} placeholder="Cidade" className={inputClass} aria-invalid={!!errors.empresaCidade} />
              </Field>
            </div>

            <Field label="Senha" error={errors.senha?.message}>
              <input type="password" {...register('senha')} placeholder="••••••••" className={inputClass} aria-invalid={!!errors.senha} />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta empresarial'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-white/45">
            CPF nao e aceito neste cadastro. Use um CNPJ valido da empresa para continuar.
          </p>
          <p className="mt-6 text-center text-sm text-white/60">
            Ja tem conta?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Entrar
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
