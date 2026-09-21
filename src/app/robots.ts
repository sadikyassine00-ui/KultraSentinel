import type { MetadataRoute } from 'next';

const AI_SEARCH_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Google-Extended',
  'GoogleOther',
  'Applebot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  'Cohere-ai',
  'MistralBot',
  'Amazonbot',
  'Bytespider',
  'CCBot',
  'Diffbot',
  'DeepSeekBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/llms', '/llms-full.txt'],
        disallow: ['/api/', '/dashboard/', '/admin/', '/suspended/'],
      },
      {
        userAgent: AI_SEARCH_AGENTS,
        allow: ['/', '/llms.txt', '/llms', '/llms-full.txt'],
        disallow: ['/api/', '/dashboard/', '/admin/', '/suspended/'],
      },
    ],
    sitemap: 'https://www.usekultra.com/sitemap.xml',
  };
}
