import { LegalLayout } from '@/components/LegalLayout';

const PrivacidadePage = () => (
  <LegalLayout titulo="Política de Privacidade" atualizadoEm="julho de 2026">
    <p>
      Esta Política explica como o <strong>Boleiroffice</strong> trata dados pessoais, em conformidade com a
      <strong> Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
    </p>

    <h2>1. Dados que coletamos</h2>
    <ul>
      <li><strong>Cadastro:</strong> nome, e-mail, senha (armazenada de forma criptografada), nome e CNPJ da empresa, bairro/cidade.</li>
      <li><strong>Uso:</strong> times, jogadores, partidas, resultados, gols, confirmações de presença e interações no feed.</li>
      <li><strong>Técnicos:</strong> dados essenciais de sessão para manter você conectado.</li>
    </ul>

    <h2>2. Finalidade e base legal</h2>
    <p>
      Usamos os dados para operar a plataforma (autenticação, ranking, estatísticas, notificações) — com base na
      <strong> execução do contrato</strong> e no <strong>legítimo interesse</strong> de oferecer o serviço.
    </p>

    <h2>3. Compartilhamento</h2>
    <p>
      Não vendemos seus dados. Podemos usar provedores de infraestrutura (hospedagem) estritamente para operar o serviço.
      Dados de ranking e resultados podem ser exibidos publicamente dentro da plataforma.
    </p>

    <h2>4. Armazenamento e segurança</h2>
    <p>
      Adotamos medidas técnicas razoáveis (senhas criptografadas, acesso restrito por empresa). Nenhum sistema é 100% imune,
      mas trabalhamos para proteger seus dados.
    </p>

    <h2>5. Seus direitos (art. 18 da LGPD)</h2>
    <ul>
      <li>confirmação e acesso aos seus dados;</li>
      <li>correção de dados incompletos ou desatualizados;</li>
      <li>eliminação dos dados tratados com seu consentimento;</li>
      <li>portabilidade e informação sobre compartilhamento.</li>
    </ul>
    <p>Para exercer, entre em contato pelo e-mail abaixo.</p>

    <h2>6. Armazenamento local (cookies)</h2>
    <p>
      Usamos o armazenamento local do navegador apenas para manter sua sessão e preferências — não usamos cookies de
      rastreamento publicitário.
    </p>

    <h2>7. Retenção</h2>
    <p>Mantemos os dados enquanto sua conta estiver ativa. Você pode solicitar a exclusão a qualquer momento.</p>

    <h2>8. Encarregado / contato</h2>
    <p>
      Solicitações sobre privacidade: <a href="mailto:privacidade@boleiroffice.com">privacidade@boleiroffice.com</a>.
    </p>

    <p className="pt-4 text-xs text-white/40">
      Este documento é um modelo inicial. Recomendamos revisão por um profissional jurídico antes do uso comercial.
    </p>
  </LegalLayout>
);

export default PrivacidadePage;
