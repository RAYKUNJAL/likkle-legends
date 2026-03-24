import { createPostAdmin, generateSlug, calculateReadTime, BlogPost } from "@/lib/services/blog";
import { getTattooOpenAI } from "@/lib/tattoo-ai";

type TopicIdea = {
  topic: string;
  keywords: string[];
  angle: string;
};

type GeneratedPost = {
  title: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
  tags: string[];
};

const fallbackIdeas: TopicIdea[] = [
  {
    topic: "best tattoo shop in island city",
    keywords: ["best tattoo shop island city", "tattoo shop island city", "custom tattoos island city"],
    angle: "Local buyer intent and artist trust",
  },
  {
    topic: "first tattoo aftercare guide",
    keywords: ["tattoo aftercare", "first tattoo healing", "tattoo aftercare tips"],
    angle: "Education for first-time clients with a booking CTA",
  },
  {
    topic: "small tattoo ideas for couples",
    keywords: ["small tattoo ideas", "matching tattoos", "flash tattoo ideas"],
    angle: "Tie the post to the 2 for $100 flash offer",
  },
  {
    topic: "half sleeve tattoo planning guide",
    keywords: ["half sleeve tattoo ideas", "half sleeve tattoo cost", "half sleeve tattoo planning"],
    angle: "Tie the post to the $500 half-sleeve offer",
  },
];

function fallbackPost(idea: TopicIdea): GeneratedPost {
  const title =
    idea.topic === "half sleeve tattoo planning guide"
      ? "How to Plan a Half Sleeve Tattoo Without Wasting Money"
      : `What Clients Should Know About ${idea.topic}`;

  const content = `
    <h2>${title}</h2>
    <p>${idea.topic} is a high-intent search for people who are close to booking. This article should answer their core questions fast and move them toward a consult.</p>
    <h3>What most clients want to know</h3>
    <ul>
      <li>How the design process works</li>
      <li>What affects pricing and timing</li>
      <li>What to bring to a consultation</li>
      <li>How to choose the right offer or appointment path</li>
    </ul>
    <h3>How Island City Tattoos can help</h3>
    <p>Island City Tattoos uses a consult-first process for larger custom work and a separate conversion path for quick flash tattoos. That structure helps clients get matched to the right service faster.</p>
    <h3>Next step</h3>
    <p>Use the online consult funnel to describe placement, style, budget, and timing. For smaller flash work, ask about the 2 for $100 offer. For larger concept work, start with the $500 half-sleeve booking path.</p>
  `.trim();

  return {
    title,
    excerpt: `A booking-focused SEO article covering ${idea.topic} with clear consult guidance and offer positioning.`,
    content,
    meta_description: `Learn about ${idea.topic}, what affects your booking path, and how to choose the right tattoo consult at Island City Tattoos.`,
    keywords: idea.keywords,
    tags: ["tattoo shop", "tattoo consult", "tattoo booking", "tattoo aftercare", "island city tattoos"],
  };
}

export async function researchTattooTopics(): Promise<TopicIdea[]> {
  const openai = getTattooOpenAI();
  if (!openai) {
    return fallbackIdeas;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an SEO strategist for a tattoo studio. Return JSON with an `ideas` array. Each item must include topic, keywords, and angle. Focus on local tattoo intent, first-time client questions, design planning, aftercare, and booking conversion.",
        },
        {
          role: "user",
          content:
            "Research 6 daily SEO topics for Island City Tattoos that can drive bookings for custom pieces, half sleeves, and flash specials.",
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackIdeas;
    }

    const parsed = JSON.parse(raw) as { ideas?: TopicIdea[] };
    return parsed.ideas && parsed.ideas.length > 0 ? parsed.ideas : fallbackIdeas;
  } catch {
    return fallbackIdeas;
  }
}

export async function generateTattooSeoPost(idea: TopicIdea): Promise<GeneratedPost> {
  const openai = getTattooOpenAI();
  if (!openai) {
    return fallbackPost(idea);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write high-conversion SEO content for a tattoo studio. Return JSON with title, excerpt, content, meta_description, keywords, and tags. The content field must be HTML with h2, h3, p, ul, and li elements. The article should move readers toward a consultation or booking.",
        },
        {
          role: "user",
          content: `Write a tattoo SEO article for topic "${idea.topic}" with angle "${idea.angle}" and target keywords: ${idea.keywords.join(", ")}.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackPost(idea);
    }

    const parsed = JSON.parse(raw) as Partial<GeneratedPost>;
    return {
      title: parsed.title || fallbackPost(idea).title,
      excerpt: parsed.excerpt || fallbackPost(idea).excerpt,
      content: parsed.content || fallbackPost(idea).content,
      meta_description: parsed.meta_description || fallbackPost(idea).meta_description,
      keywords: parsed.keywords && parsed.keywords.length > 0 ? parsed.keywords : idea.keywords,
      tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : fallbackPost(idea).tags,
    };
  } catch {
    return fallbackPost(idea);
  }
}

export async function runDailyTattooSeoAgent(): Promise<{
  idea: TopicIdea;
  post: GeneratedPost;
  savedPost: BlogPost | null;
}> {
  const ideas = await researchTattooTopics();
  const idea = ideas[Math.floor(Math.random() * ideas.length)] || fallbackIdeas[0];
  const post = await generateTattooSeoPost(idea);

  let savedPost: BlogPost | null = null;
  try {
    savedPost = await createPostAdmin({
      title: post.title,
      slug: generateSlug(post.title),
      excerpt: post.excerpt,
      content: post.content,
      meta_title: post.title,
      meta_description: post.meta_description,
      keywords: post.keywords,
      category: "tattoo",
      tags: post.tags,
      author_name: "Island City SEO Agent",
      status: "published",
      published_at: new Date().toISOString(),
      ai_generated: true,
      ai_prompt: idea.topic,
      ai_model: "gpt-4o-mini",
      read_time_minutes: calculateReadTime(post.content),
    });
  } catch {
    savedPost = null;
  }

  return { idea, post, savedPost };
}
