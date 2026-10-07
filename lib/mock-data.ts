import { Story } from "@/types/story";

export const MOCK_STORIES: Story[] = [
  {
    id: "1",
    title: "The Astronaut Cat",
    description: "Follow Luna as she travels through the Milky Way.",
    coverImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
    author: "Captain Whiskers",
    ageGroup: "6-8",
    category: "Adventure",
    likes: 42,
    pages: [
      {
        id: 1,
        text: "Once upon a time, there was a cat named Luna who dreamed of the stars.",
        imageUrl: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
      },
      {
        id: 2,
        text: "She built a rocket out of cardboard boxes and tuna cans. 3... 2... 1... Blast off!",
        imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800",
      },
      {
        id: 3,
        text: "Luna looked out the window. The Earth looked like a big blue marble below.",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      },
    ],
  },
  {
    id: "2",
    title: "Milo and the Moon",
    description: "A little explorer discovers a magical secret on the moon.",
    coverImage: "https://images.unsplash.com/photo-1534791547706-7b7b5e6f6c2b?w=800",
    author: "Storyland",
    ageGroup: "3-5",
    category: "Fairy Tale",
    likes: 31,
    pages: [
      {
        id: 1,
        text: "Milo looked at the moon every night and wondered what was hiding there.",
        imageUrl: "https://images.unsplash.com/photo-1534791547706-7b7b5e6f6c2b?w=800",
      },
      {
        id: 2,
        text: "One night, a tiny silver door appeared in the moonlight.",
        imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800",
      },
    ],
  },
  {
    id: "3",
    title: "The Little Ocean Scientist",
    description: "Dive under the sea and discover amazing ocean creatures.",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    author: "Dr. Blue",
    ageGroup: "9-12",
    category: "Science",
    likes: 27,
    pages: [
      {
        id: 1,
        text: "Sara put on her diving mask and jumped into the bright blue ocean.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      },
      {
        id: 2,
        text: "She discovered colorful fish swimming around a beautiful coral reef.",
        imageUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800",
      },
    ],
  },
];
