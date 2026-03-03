export interface StarterStoryPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
}

export interface StarterStory {
  id: string;
  title: string;
  summary: string;
  cover_image_url: string;
  content_json: {
    pages: StarterStoryPage[];
    glossary: { word: string; meaning: string }[];
  };
  reading_time_minutes: number;
  tier_required: string;
}

export const STARTER_STORIES: StarterStory[] = [
  {
    id: "starter-story-1",
    title: "Anansi and the Mango Tree",
    summary: "A clever spider learns patience and sharing under a sweet mango tree.",
    cover_image_url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900&q=75",
    reading_time_minutes: 5,
    tier_required: "free",
    content_json: {
      pages: [
        { pageNumber: 1, text: "Anansi the spider saw a mango tree heavy with fruit." },
        { pageNumber: 2, text: "He wanted them all, but the mangoes were still green." },
        { pageNumber: 3, text: "Anansi waited, watering the roots and singing island songs." },
        { pageNumber: 4, text: "When the mangoes ripened, he shared with his friends." },
        { pageNumber: 5, text: "Everyone feasted and thanked Anansi for his patience." }
      ],
      glossary: [
        { word: "Anansi", meaning: "A clever spider from Caribbean folklore." }
      ]
    }
  },
  {
    id: "starter-story-2",
    title: "R.O.T.I. and the Counting Crabs",
    summary: "R.O.T.I. helps a child count crabs along the shore.",
    cover_image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75",
    reading_time_minutes: 4,
    tier_required: "free",
    content_json: {
      pages: [
        { pageNumber: 1, text: "R.O.T.I. rolled to the beach with a big smile." },
        { pageNumber: 2, text: "Tiny crabs popped up and scurried in the sand." },
        { pageNumber: 3, text: "Together they counted: one, two, three, four, five." },
        { pageNumber: 4, text: "Each crab waved a claw and the waves clapped along." }
      ],
      glossary: []
    }
  },
  {
    id: "starter-story-3",
    title: "Dilly Doubles Finds the Rhythm",
    summary: "Dilly Doubles teaches a friend to clap the beat.",
    cover_image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=75",
    reading_time_minutes: 4,
    tier_required: "free",
    content_json: {
      pages: [
        { pageNumber: 1, text: "Dilly Doubles heard steelpan music in the village square." },
        { pageNumber: 2, text: "He clapped a slow beat and asked a friend to join." },
        { pageNumber: 3, text: "They found the rhythm together, clap-clap, stomp-stomp." },
        { pageNumber: 4, text: "Everyone danced as the sun set over the island." }
      ],
      glossary: []
    }
  }
];
