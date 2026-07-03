import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slugify';

describe('slugify', () => {
  it('converte para minúsculas', () => {
    expect(slugify('BOLEIROFFICE')).toBe('boleiroffice');
  });

  it('remove acentos', () => {
    expect(slugify('Empresa Ação')).toBe('empresa-acao');
  });

  it('substitui espaços por hífens', () => {
    expect(slugify('Time da Empresa')).toBe('time-da-empresa');
  });

  it('remove caracteres especiais', () => {
    expect(slugify('Time! @Teste#')).toBe('time-teste');
  });

  it('remove hífens duplicados', () => {
    expect(slugify('Time   da   Empresa')).toBe('time-da-empresa');
  });

  it('remove hífens no início e fim', () => {
    expect(slugify('  Time  ')).toBe('time');
  });

  it('lida com string vazia', () => {
    expect(slugify('')).toBe('');
  });

  it('preserva números', () => {
    expect(slugify('Time 2 FC')).toBe('time-2-fc');
  });
});
