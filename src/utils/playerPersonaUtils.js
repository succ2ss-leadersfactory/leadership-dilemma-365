import { seedPlayerPersonas } from '../data/seedPlayerPersonas';

function hashText(text = '') {
  return String(text).split('').reduce((sum, ch) => ((sum * 31) + ch.charCodeAt(0)) % 100000, 11);
}

export function getPersonaById(personaId) {
  return seedPlayerPersonas.find(persona => persona.personaId === personaId) || seedPlayerPersonas[0];
}

export function assignPlayerPersona(player, team) {
  const seed = hashText(`${player?.playerId || ''}-${player?.displayName || ''}-${team?.teamId || ''}`);
  return seedPlayerPersonas[seed % seedPlayerPersonas.length];
}

export function applyPersonaGrowthLens(profile, plan) {
  if (!profile || !plan) return plan;
  const persona = getPersonaById(profile.personaId);
  if (!persona) return plan;

  if (plan.direction === 'up') {
    const usePersonaCategory = plan.category !== persona.preferredGrowthCategory;
    return {
      ...plan,
      category: usePersonaCategory ? persona.preferredGrowthCategory : plan.category,
      reason: `${plan.reason} ${persona.growthNote}`,
      personaApplied: true,
      personaLabel: persona.personaLabel
    };
  }

  if (plan.direction === 'down') {
    const usePersonaCategory = plan.category !== persona.vulnerableCategory;
    return {
      ...plan,
      category: usePersonaCategory ? persona.vulnerableCategory : plan.category,
      reason: `${plan.reason} ${persona.shrinkNote}`,
      personaApplied: true,
      personaLabel: persona.personaLabel
    };
  }

  return plan;
}
