import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { StaticRouter } from 'react-router';
import App from './App';
import { Providers } from './providers/Providers';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import '@/styles/global.css';

type PrerenderData = {
  url: string;
};

type HeadElement = {
  type: string;
  props: Record<string, string>;
};

type RouteHead = {
  title: string;
  description: string;
  elements: HeadElement[];
};

const ROUTE_HEAD: Record<string, RouteHead> = {
  '/': {
    title: 'HR Data | Job Search & Auto-Apply Platform',
    description:
      'HR Data is an Arabic-language job search and auto-apply platform for Saudi Arabia. Discover job listings, save opportunities, and send applications directly from your Gmail account using send-only access.',
    elements: [
      {
        type: 'meta',
        props: {
          name: 'keywords',
          content: 'وظائف، HR Data، توظيف، السعودية، تقديم آلي، بحث عن عمل، مسيرة مهنية',
        },
      },
      { type: 'meta', props: { name: 'robots', content: 'index, follow' } },
      { type: 'link', props: { rel: 'canonical', href: 'https://hrdatasa.com/' } },
      { type: 'meta', props: { property: 'og:title', content: 'HR Data | منصة التوظيف المباشر' } },
      {
        type: 'meta',
        props: {
          property: 'og:description',
          content: 'اكتشف وتتبع والتقديم على أفضل الوظائف بشكل آلي واحترافي مع منصة HR Data.',
        },
      },
      { type: 'meta', props: { property: 'og:type', content: 'website' } },
      { type: 'meta', props: { property: 'og:url', content: 'https://hrdatasa.com/' } },
      { type: 'meta', props: { property: 'og:site_name', content: 'HR Data' } },
      { type: 'meta', props: { property: 'og:locale', content: 'ar_SA' } },
      { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
      { type: 'meta', props: { name: 'twitter:title', content: 'HR Data | منصة التوظيف المباشر' } },
      {
        type: 'meta',
        props: {
          name: 'twitter:description',
          content: 'منصة ذكية للتقديم الآلي على الوظائف وتتبع مسارك المهني.',
        },
      },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy - HR Data',
    description: 'Privacy policy for HR Data platform. Learn how we handle your data and Gmail OAuth access.',
    elements: [
      { type: 'meta', props: { name: 'robots', content: 'index, follow' } },
      { type: 'link', props: { rel: 'canonical', href: 'https://hrdatasa.com/privacy' } },
      { type: 'meta', props: { property: 'og:title', content: 'Privacy Policy - HR Data' } },
      {
        type: 'meta',
        props: {
          property: 'og:description',
          content: 'Learn how HR Data handles account data, Gmail OAuth access, and Gmail send-only permissions.',
        },
      },
      { type: 'meta', props: { property: 'og:type', content: 'website' } },
      { type: 'meta', props: { property: 'og:url', content: 'https://hrdatasa.com/privacy' } },
      { type: 'meta', props: { property: 'og:site_name', content: 'HR Data' } },
      { type: 'meta', props: { property: 'og:locale', content: 'ar_SA' } },
      { type: 'meta', props: { name: 'twitter:card', content: 'summary' } },
      { type: 'meta', props: { name: 'twitter:title', content: 'Privacy Policy - HR Data' } },
      {
        type: 'meta',
        props: {
          name: 'twitter:description',
          content: 'How HR Data handles privacy, user data, and Gmail OAuth send-only access.',
        },
      },
    ],
  },
  '/terms': {
    title: 'Terms of Service - HR Data',
    description:
      'Terms of service for HR Data platform. Read our terms and conditions for using the job search and auto-apply service.',
    elements: [
      { type: 'meta', props: { name: 'robots', content: 'index, follow' } },
      { type: 'link', props: { rel: 'canonical', href: 'https://hrdatasa.com/terms' } },
      { type: 'meta', props: { property: 'og:title', content: 'Terms of Service - HR Data' } },
      {
        type: 'meta',
        props: {
          property: 'og:description',
          content: 'Read the terms and conditions for using HR Data job search and auto-apply services.',
        },
      },
      { type: 'meta', props: { property: 'og:type', content: 'website' } },
      { type: 'meta', props: { property: 'og:url', content: 'https://hrdatasa.com/terms' } },
      { type: 'meta', props: { property: 'og:site_name', content: 'HR Data' } },
      { type: 'meta', props: { property: 'og:locale', content: 'ar_SA' } },
      { type: 'meta', props: { name: 'twitter:card', content: 'summary' } },
      { type: 'meta', props: { name: 'twitter:title', content: 'Terms of Service - HR Data' } },
      {
        type: 'meta',
        props: {
          name: 'twitter:description',
          content: 'Terms and conditions for the HR Data job search and auto-apply platform.',
        },
      },
    ],
  },
};

const normalizeUrl = (url: string) => {
  const pathname = url.split('?')[0]?.split('#')[0] || '/';
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
};

const textFromReactNode = (node: ReactNode): string | null => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textFromReactNode).filter(Boolean).join('');
  }

  return null;
};

const getElementProps = (element: ReactElement<Record<string, unknown>>) => {
  const props: HeadElement['props'] = {};

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === 'children' || key === 'data-rh') {
      return;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      props[key] = String(value);
    }
  });

  return props;
};

const headElementsFromHelmet = (helmet: HelmetServerState | null | undefined) => {
  if (!helmet) {
    return [];
  }

  return [...helmet.meta.toComponent(), ...helmet.link.toComponent()].reduce<HeadElement[]>((elements, element) => {
    if (!isValidElement<Record<string, unknown>>(element) || typeof element.type !== 'string') {
      return elements;
    }

    elements.push({
      type: element.type,
      props: getElementProps(element),
    });

    return elements;
  }, []);
};

const titleFromHelmet = (helmet: HelmetServerState | null | undefined) => {
  const [titleElement] = helmet?.title.toComponent() ?? [];

  if (!isValidElement<{ children?: ReactNode }>(titleElement)) {
    return null;
  }

  return textFromReactNode(titleElement.props.children);
};

const ensureDescription = (elements: HeadElement[], description: string) => {
  const hasDescription = elements.some(
    (element) => element.type === 'meta' && element.props.name === 'description'
  );

  if (hasDescription) {
    return elements;
  }

  return [...elements, { type: 'meta', props: { name: 'description', content: description } }];
};

const elementKey = (element: HeadElement) => {
  return [
    element.type,
    element.props.name ?? '',
    element.props.property ?? '',
    element.props.rel ?? '',
    element.props.href ?? '',
  ].join(':');
};

const mergeHeadElements = (elements: HeadElement[], fallbackElements: HeadElement[]) => {
  const seen = new Set(elements.map(elementKey));
  const merged = [...elements];

  fallbackElements.forEach((element) => {
    const key = elementKey(element);

    if (!seen.has(key)) {
      seen.add(key);
      merged.push(element);
    }
  });

  return merged;
};

const stripInlineHeadElements = (html: string) => {
  let next = html;
  let previous: string;

  do {
    previous = next;
    next = next.replace(/^\s*(?:<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>)/i, '');
  } while (next !== previous);

  return next;
};

const closeReactServerMessagePorts = () => {
  const runtime = globalThis as typeof globalThis & {
    process?: { _getActiveHandles?: () => unknown[] };
  };
  const getActiveHandles = runtime.process?._getActiveHandles;

  if (!getActiveHandles) {
    return;
  }

  getActiveHandles().forEach((handle) => {
    const maybeMessagePort = handle as { constructor?: { name?: string }; close?: () => void };

    if (maybeMessagePort.constructor?.name === 'MessagePort') {
      maybeMessagePort.close?.();
    }
  });
};

export async function prerender(data: PrerenderData) {
  const url = normalizeUrl(data.url);
  const fallbackHead = ROUTE_HEAD[url] ?? ROUTE_HEAD['/'];
  const helmetContext: { helmet?: HelmetServerState | null } = {};

  const renderedHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary>
        <StaticRouter location={url}>
          <Providers>
            <App />
          </Providers>
        </StaticRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
  const html = stripInlineHeadElements(renderedHtml);

  const helmet = helmetContext.helmet;
  const title = titleFromHelmet(helmet) ?? fallbackHead.title;
  const elements = mergeHeadElements(
    ensureDescription(headElementsFromHelmet(helmet), fallbackHead.description),
    fallbackHead.elements
  );
  closeReactServerMessagePorts();

  return {
    html,
    links: new Set(['/privacy', '/terms']),
    head: {
      title,
      elements: new Set(elements),
    },
  };
}
