import {useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {createArticleSeoMeta, createInlineArticleSchema, createInlineBreadcrumbSchema} from '~/lib/seo';
import {StructuredData} from '~/components/StructuredData';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, request}) => {
  if (!request) {
    return [
      {title: `Kaah | ${data?.article?.title ?? 'Article'}`},
      {name: 'description', content: 'Read our latest articles and blog posts at Kaah Supermarket.'}
    ];
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  return createArticleSeoMeta({
    article: data?.article,
    blog: data?.blog,
    pathname,
    searchParams: url.searchParams
  });
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params}) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  const article = blog.articleByHandle;

  return {article, blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article, blog} = useLoaderData();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  // Create structured data for the article
  const articleSchema = createInlineArticleSchema(article, blog);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: `/blogs/${blog?.handle || 'blog'}` },
    { name: article.title, url: `/blogs/${blog?.handle || 'blog'}/${article.handle}` }
  ];
  const breadcrumbSchema = createInlineBreadcrumbSchema(breadcrumbs);

  return (
    <div className="article">
      {/* Structured Data */}
      {articleSchema && <StructuredData schema={articleSchema} />}
      {breadcrumbSchema && <StructuredData schema={breadcrumbSchema} />}
      <h1>
        {title}
        <div>
          {publishedDate} &middot; {author?.name}
        </div>
      </h1>

      {image && <Image data={image} sizes="90vw" loading="eager" />}
      <div
        dangerouslySetInnerHTML={{__html: contentHtml}}
        className="article"
      />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      title
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
