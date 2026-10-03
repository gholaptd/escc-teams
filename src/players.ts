export type Category = 'high' | 'allrounder' | 'batsman';

export const CATEGORIES: { id: Category; label: string; short: string }[] = [
  { id: 'high', label: 'High performer', short: 'HP' },
  { id: 'allrounder', label: 'All rounder', short: 'AR' },
  { id: 'batsman', label: 'Batsman', short: 'BAT' },
];

// Club roster. Edit the default category here so it applies on every device;
// changes made in the app are saved only in that browser.
export const MEMBERS: { name: string; category: Category }[] = [
  { name: 'Amol', category: 'allrounder' },
  { name: 'Amit', category: 'allrounder' },
  { name: 'Paresh', category: 'allrounder' },
  { name: 'Nilesh', category: 'allrounder' },
  { name: 'Chaitu', category: 'allrounder' },
  { name: 'Kunal', category: 'allrounder' },
  { name: 'Yo', category: 'allrounder' },
  { name: 'Parag', category: 'allrounder' },
  { name: 'Anuj', category: 'allrounder' },
  { name: 'Sayantan', category: 'allrounder' },
  { name: 'Parijat', category: 'allrounder' },
  { name: 'Pritam', category: 'allrounder' },
  { name: 'Sohail', category: 'allrounder' },
  { name: 'Atul', category: 'allrounder' },
  { name: 'Venky', category: 'allrounder' },
];
