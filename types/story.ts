// types/story.ts
export type Page = {
  id: number;
  text: string;
  imageUrl: string;
  audioUrl?: string; // Optional for "Read to me" feature
};

export type Story = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  ageGroup: '3-5' | '6-8' | '9-12';
  category: 'Adventure' | 'Fairy Tale' | 'Science' | 'Moral';
  pages: Page[];
//   createdAt: string;
};