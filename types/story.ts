export type Page = {
  id: number;
  text: string;
  imageUrl: string;
  audioUrl?: string;
};

export type Story = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  ageGroup: "3-5" | "6-8" | "9-12";
  category: "Adventure" | "Fairy Tale" | "Science" | "Moral";
  pages: Page[];
  likes: number;
};

export type MembershipStatus = "member" | "waiting";

export type Parent = {
  id: string;
  name: string;
  email: string;
  password: string;
  verified: boolean;

  /**
   * @vuega.se accounts are automatically members.
   * All other verified accounts are placed on the waiting list.
   */
  membershipStatus: MembershipStatus;
};