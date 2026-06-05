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

const ROUTE_HEAD: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'HR Data - Job Search & Auto-Apply Platform',
    description:
      'HR Data is an Arabic-language job search and application automation platform for job seekers in Saudi Arabia. Users can discover job listings, save opportunities, upload a CV, and send job application emails directly from their connected Gmail account using Gmail send-only access.',
  },
  '/privacy': {
    title: 'Privacy Policy - HR Data',
    description: 'Privacy policy for HR Data platform. Learn how we handle your data and Gmail OAuth access.',
  },
  '/terms': {
    title: 'Terms of Service - HR Data',
    description:
      'Terms of service for HR Data platform. Read our terms and conditions for using the job search and auto-apply service.',
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
  const elements = ensureDescription(headElementsFromHelmet(helmet), fallbackHead.description);
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
