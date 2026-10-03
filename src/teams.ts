import { CATEGORIES, type Category } from './players';

export type TeamId = 'A' | 'B';

export interface Player {
  name: string;
  category: Category;
  playing: boolean;
  // Pre-assigned team, or null to let the picker place them.
  lock: TeamId | null;
  guest?: boolean;
}

export interface Teams {
  A: Player[];
  B: Player[];
  battingFirst: TeamId;
}

function shuffle<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const countIn = (team: Player[], category: Category) =>
  team.filter(p => p.category === category).length;

/**
 * Places locked players first, then deals the rest category by category so each
 * team gets a fair share of high performers, all rounders and batsmen while
 * keeping team sizes within one of each other.
 */
export function createTeams(players: Player[]): Teams {
  const playing = players.filter(p => p.playing);
  const teams: Record<TeamId, Player[]> = {
    A: playing.filter(p => p.lock === 'A'),
    B: playing.filter(p => p.lock === 'B'),
  };
  const unlocked = playing.filter(p => !p.lock);

  for (const { id } of CATEGORIES) {
    for (const player of shuffle(unlocked.filter(p => p.category === id))) {
      const { A, B } = teams;
      let target: TeamId;
      if (A.length !== B.length) target = A.length < B.length ? 'A' : 'B';
      else if (countIn(A, id) !== countIn(B, id)) target = countIn(A, id) < countIn(B, id) ? 'A' : 'B';
      else target = Math.random() < 0.5 ? 'A' : 'B';
      teams[target].push(player);
    }
  }

  return { ...teams, battingFirst: Math.random() < 0.5 ? 'A' : 'B' };
}
