export type WeaknessType = 'resistance' | 'normal' | 'weak';

export interface DamageInput {
  // 1. Character Stats (From Screen)
  totalAttack: number;
  damageMultPercent: number;
  elementalMultPercent: number;
  critMultPercent: number;
  critBasePercent: number;

  // 2. Skill & Combat
  skillCoeffPercent: number;
  finalDamageBonusPercent: number;
  otherMultipliers: number[];
  isCritical: boolean;

  // 3. Enemy & Debuffs
  enemyDefenseValue: number;
  increasedDamageTakenPercent: number;
  defenseReductionPercent: number;
  piercePercent: number;
  additionalDefenseCoeffPercent: number;
  windsweptPercent: number;
  weaknessType: WeaknessType;
}

/**
 * Converte um valor em porcentagem inteira para multiplicador decimal.
 * Exemplo: 50 -> 0.5
 */
export function normalizePercent(value: number): number {
  return value / 100;
}

/**
 * ⓐ Attack Power Calculation (A)
 * Usando o Total Attack direto da tela de status.
 */
export function calcAttackPower(input: DamageInput): number {
  return input.totalAttack;
}

/**
 * ⓑ Damage Bonus Calculation (B)
 * B = 100% + DamageMult + ElementalMult + IncreasedDamageTakenByEnemy
 */
export function calcDamageBonus(input: DamageInput): number {
  return 1 + input.damageMultPercent + input.elementalMultPercent + input.increasedDamageTakenPercent;
}

/**
 * ⓒ Enemy Defense Calculation (C)
 * DefenseCoeff = (100% + additionalDefenseCoeffPercent) * (100% - piercePercent) - defenseReductionPercent
 * C = 1 - { EnemyDefenseValue * [DefenseCoeff] } / { EnemyDefenseValue * [DefenseCoeff] + 1400 }
 */
export function calcEnemyDefense(input: DamageInput): number {
  let defCoeff = (1 + input.additionalDefenseCoeffPercent) * (1 - input.piercePercent) - input.defenseReductionPercent;
  
  // Windswept entra multiplicando o fator de defesa
  defCoeff = defCoeff * (1 - input.windsweptPercent);
  
  // Garante que o coeficiente não seja negativo
  defCoeff = Math.max(0, defCoeff);

  const effectiveDef = input.enemyDefenseValue * defCoeff;
  const c = 1 - (effectiveDef) / (effectiveDef + 1400);
  
  // Garante que C esteja entre 0 e 1
  return Math.max(0, Math.min(1, c));
}

/**
 * ⓓ Critical Calculation (D)
 * Se não for crítico, o multiplicador é 1 (100%).
 * Se for crítico: D = 100% + CritDamageBase% * (CritDamageTotal% - 100%)
 */
export function calcCritical(input: DamageInput): number {
  if (!input.isCritical) return 1;
  return 1 + input.critBasePercent * (input.critMultPercent - 1);
}

/**
 * ⓔ Skill Coefficient (E)
 * E = skillCoeffMultiplier
 */
export function calcSkillCoeff(input: DamageInput): number {
  return input.skillCoeffPercent;
}

/**
 * ⓕ Weakness Coefficient (F)
 * Resistance: 50% => 0.5 | Normal: 100% => 1.0 | Weakness: 120% => 1.2
 */
export function calcWeaknessCoeff(input: DamageInput): number {
  switch (input.weaknessType) {
    case 'resistance': return 0.5;
    case 'weak': return 1.2;
    case 'normal':
    default: return 1.0;
  }
}

/**
 * ⓖ Final Damage Bonus (G)
 * G = 1 + finalDamageBonusPercent
 */
export function calcFinalDamageBonus(input: DamageInput): number {
  return 1 + input.finalDamageBonusPercent;
}

/**
 * ⓗ Other Coefficients (H)
 * H = produto de todos os multiplicadores extras
 */
export function calcOtherCoeffs(input: DamageInput): number {
  if (!input.otherMultipliers || input.otherMultipliers.length === 0) {
    return 1;
  }
  return input.otherMultipliers.reduce((acc, val) => acc * val, 1);
}

/**
 * ⓘ Random Range Coefficient
 * Retorna o min e max baseado no dano base
 */
export function calcRandomRange(baseDamage: number, min = 0.95, max = 1.05): { min: number; max: number } {
  return {
    min: baseDamage * min,
    max: baseDamage * max
  };
}

/**
 * Função principal que calcula o dano final e retorna todas as partes
 */
export function calcFinalDamage(input: DamageInput) {
  const A = calcAttackPower(input);
  const B = calcDamageBonus(input);
  const C = calcEnemyDefense(input);
  const D = calcCritical(input);
  const E = calcSkillCoeff(input);
  const F = calcWeaknessCoeff(input);
  const G = calcFinalDamageBonus(input);
  const H = calcOtherCoeffs(input);

  const baseDamage = A * B * C * D * E * F * G * H;
  const { min: minDamage, max: maxDamage } = calcRandomRange(baseDamage);

  return {
    A, B, C, D, E, F, G, H,
    baseDamage,
    minDamage,
    maxDamage
  };
}
