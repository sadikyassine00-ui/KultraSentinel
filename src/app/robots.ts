import type { MetadataRoute } from 'next';

const LLM_USER_AGENTS = [
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
      ...LLM_USER_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: ['/', '/llms.txt', '/llms', '/llms-full.txt'],
        disallow: ['/api/', '/dashboard/', '/admin/', '/suspended/'],
      })),
    ],
    sitemap: 'https://usekultra.com/sitemap.xml',
  };
}
