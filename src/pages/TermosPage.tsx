import { LegalLayout } from '@/components/LegalLayout';

const TermosPage = () => (
  <LegalLayout titulo="Termos de Uso" atualizadoEm="julho de 2026">
    <p>
      Estes Termos regem o uso da plataforma <strong>Boleiroffice</strong> ("plataforma"), destinada à organização de
      partidas e campeonatos de futebol entre empresas. Ao criar uma conta ou usar a plataforma, você concorda com estes Termos.
    </p>

    <h2>1. Cadastro e conta</h2>
    <p>
      O cadastro é destinado a empresas, mediante CNPJ válido. Você é responsável pela veracidade das informações e por
      manter a confidencialidade das suas credenciais de acesso. Atividades realizadas na sua conta são de sua responsabilidade.
    </p>

    <h2>2. Uso adequado</h2>
    <p>Você concorda em não:</p>
    <ul>
      <li>inserir dados falsos, ofensivos ou de terceiros sem autorização;</li>
      <li>tentar acessar áreas ou dados de outras empresas indevidamente;</li>
      <li>usar a plataforma para fins ilícitos ou que violem direitos de terceiros.</li>
    </ul>

    <h2>3. Conteúdo inserido</h2>
    <p>
      Times, jogadores, resultados, gols e demais dados inseridos são de responsabilidade da empresa usuária. Você concede à
      plataforma o direito de armazenar e processar esses dados para prestar o serviço (ranking, estatísticas, feed).
    </p>

    <h2>4. Disponibilidade</h2>
    <p>
      Empenhamo-nos para manter a plataforma disponível, mas o serviço é fornecido "no estado em que se encontra", podendo
      haver interrupções para manutenção ou por fatores fora do nosso controle.
    </p>

    <h2>5. Limitação de responsabilidade</h2>
    <p>
      Na máxima extensão permitida em lei, a plataforma não se responsabiliza por perdas indiretas decorrentes do uso ou da
      indisponibilidade do serviço.
    </p>

    <h2>6. Alterações</h2>
    <p>Estes Termos podem ser atualizados. Mudanças relevantes serão comunicadas na plataforma.</p>

    <h2>7. Contato</h2>
    <p>
      Dúvidas sobre estes Termos: <a href="mailto:contato@boleiroffice.com">contato@boleiroffice.com</a>.
    </p>

    <p className="pt-4 text-xs text-white/40">
      Este documento é um modelo inicial. Recomendamos revisão por um profissional jurídico antes do uso comercial.
    </p>
  </LegalLayout>
);

export default TermosPage;
