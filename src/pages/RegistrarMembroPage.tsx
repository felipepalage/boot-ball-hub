import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { conviteService } from '@/services/conviteService';
import { getApiErrorMessage } from '@/lib/api-error';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary';

const RegistrarMembroPage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  useDocumentTitle('Entrar na empresa');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { data: info, isLoading, isError } = useQuery({
    queryKey: ['convite', token],
    queryFn: () => conviteService.getInfo(token),
    enabled: !!token,
    retry: false,
  });

  const podeEnviar = nome.trim().length >= 2 && email.includes('@') && senha.length >= 6;

  const enviar = async () => {
    setEnviando(true);
    try {
      await conviteService.aceitar(token, { nome: nome.trim(), email: email.trim(), senha });
      toast.success('Conta criada! Bem-vindo.');
      navigate('/app');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Não foi possível concluir o convite.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.2),transparent_22%),linear-gradient(180deg,#09090b_0%,#111827_45%,#050505_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Boleiroffice" className="h-20 w-auto" />
          <h1 className="mt-4 text-2xl font-black text-white">Entrar numa empresa</h1>
          {info && <p className="mt-1 text-sm text-white/60">Você foi convidado para <strong className="text-white">{info.empresaNome}</strong></p>}
        </div>

        {isLoading && <p className="text-center text-white/50">Carregando…</p>}
        {isError && (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/50">
            Convite inválido ou expirado. Peça um novo link para a empresa.
          </div>
        )}

        {info && (
          <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (podeEnviar) enviar();
              }}
            >
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className={inputClass} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className={inputClass} />
              <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="Senha (mín. 6 caracteres)" className={inputClass} />
              <button
                type="submit"
                disabled={enviando || !podeEnviar}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {enviando ? 'Entrando...' : 'Entrar na empresa'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-white/40">
              Já tem conta? <Link to="/login" className="font-semibold text-primary">Entrar</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrarMembroPage;
