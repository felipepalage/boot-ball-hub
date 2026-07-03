import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDateTime,
  getStatusLabel,
  getLevelLabel,
} from '@/lib/formatters';
import { DesafioStatus } from '@/types';

describe('formatDate', () => {
  it('formata data ISO para padrão br', () => {
    expect(formatDate('2025-06-15')).toBe('15/06/2025');
  });
});

describe('formatTime', () => {
  it('retorna apenas hh:mm', () => {
    expect(formatTime('15:30:00')).toBe('15:30');
  });

  it('retorna hh:mm quando já está no formato certo', () => {
    expect(formatTime('09:00')).toBe('09:00');
  });
});

describe('formatDateTime', () => {
  it('concatena data e hora corretamente', () => {
    expect(formatDateTime('2025-06-15', '15:30:00')).toBe('15/06/2025 às 15:30');
  });
});

describe('getStatusLabel', () => {
  it('retorna Aberto para status 0', () => {
    expect(getStatusLabel(DesafioStatus.Aberto)).toBe('Aberto');
  });

  it('retorna Aceito para status 1', () => {
    expect(getStatusLabel(DesafioStatus.Aceito)).toBe('Aceito');
  });

  it('retorna Finalizado para status correspondente', () => {
    expect(getStatusLabel(DesafioStatus.Finalizado)).toBe('Finalizado');
  });

  it('retorna Desconhecido para status inválido', () => {
    expect(getStatusLabel(999)).toBe('Desconhecido');
  });
});

describe('getLevelLabel', () => {
  it('retorna Nível 1 para nível 1', () => {
    expect(getLevelLabel(1)).toBe('Nível 1');
  });

  it('retorna Nível 5 para nível 5', () => {
    expect(getLevelLabel(5)).toBe('Nível 5');
  });

  it('retorna Nível N para nível fora do mapa', () => {
    expect(getLevelLabel(10)).toBe('Nível 10');
  });
});
