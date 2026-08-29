import { Story } from "@/types/story";

export const MOCK_STORIES: Story[] = [
  {
    id: '1',
    title: "The Astronaut Cat",
    description: "Follow Luna as she travels through the Milky Way.",
    coverImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
    author: "Captain Whiskers",
    ageGroup: '6-8',
    category: 'Adventure',
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
      }
    ]
  },
  // ... you can add more pages to the Dragon story later!
];