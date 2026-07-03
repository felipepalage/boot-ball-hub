import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '@/lib/api-error';

describe('getApiErrorMessage', () => {
  it('retorna o fallback quando o erro não tem resposta', () => {
    const result = getApiErrorMessage(new Error('network'), 'Erro padrão');
    expect(result).toBe('Erro padrão');
  });

  it('retorna message da API quando presente', () => {
    const error = { response: { data: { message: 'Credenciais inválidas.' } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('Credenciais inválidas.');
  });

  it('retorna detail quando message não existe', () => {
    const error = { response: { data: { detail: 'Campo obrigatório.' } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('Campo obrigatório.');
  });

  it('retorna title quando message e detail não existem', () => {
    const error = { response: { data: { title: 'Bad Request' } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('Bad Request');
  });

  it('retorna o primeiro erro do campo errors quando presente', () => {
    const error = {
      response: {
        data: {
          errors: { Email: ['Email inválido.', 'Outro erro'] },
        },
      },
    };
    expect(getApiErrorMessage(error, 'fallback')).toBe('Email inválido.');
  });

  it('retorna fallback quando data está vazio', () => {
    const error = { response: { data: {} } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('retorna fallback quando a resposta é null', () => {
    const error = { response: null };
    expect(getApiErrorMessage(error, 'sem resposta')).toBe('sem resposta');
  });
});
