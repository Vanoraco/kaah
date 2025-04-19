import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';

// Default background colors for slides if not specified in metaobjects
const DEFAULT_BG_COLORS = ["#1A237E", "#0a5f38", "#5d4037"];

// Default discount texts if not specified in metaobjects
const DEFAULT_DISCOUNTS = [
  "EXCLUSIVE OFFERS UP TO 40% OFF",
  "BUY ONE GET ONE FREE",
  "FREE SHIPPING ON ORDERS OVER $50"
];

export function SlideshowBanner({ bannerCollections, bannerMetaobjects, bannerArticles, bannerProducts }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Determine which data source to use and process accordingly
  let slides;
  if (bannerMetaobjects && bannerMetaobjects.nodes && bannerMetaobjects.nodes.length > 0) {
    // Use metaobjects if available (highest priority)
    slides = processMetaobjectData(bannerMetaobjects);
  } else if (bannerArticles && bannerArticles.blog && bannerArticles.blog.articles.nodes.length > 0) {
    // Use blog articles if available (second priority)
    slides = processArticleData(bannerArticles);
  } else if (bannerProducts && bannerProducts.nodes && bannerProducts.nodes.length > 0) {
    // Use products if available (third priority)
    slides = processProductData(bannerProducts);
  } else {
    // Fall back to collections or default data
    slides = processCollectionData(bannerCollections);
  }

  // Process metaobject data into slides
  function processMetaobjectData(metaobjects) {
    return metaobjects.nodes.map((metaobject, index) => {
      // Create a map of field keys to values for easier access
      const fieldMap = {};
      metaobject.fields.forEach(field => {
        fieldMap[field.key] = field.value;
        if (field.key === 'image' && field.reference && field.reference.image) {
          fieldMap.imageUrl = field.reference.image.url;
        }
      });

      return {
        id: metaobject.id,
        title: fieldMap.title || 'New Arrivals',
        subtitle: fieldMap.subtitle || '',
        discount: fieldMap.discount_text || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length],
        image: fieldMap.imageUrl || '/images/hero-bg.jpg',
        link: fieldMap.link || `/collections/all`,
        bgColor: fieldMap.background_color || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length]
      };
    });
  }

  // Process blog article data into slides
  function processArticleData(articleData) {
    return articleData.blog.articles.nodes.map((article, index) => {
      // Extract subtitle from tags if available
      let subtitle = '';
      if (article.tags && article.tags.length > 0) {
        subtitle = article.tags[0];
      }

      // Use excerpt as discount text
      const discount = article.excerpt || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length];

      // Extract background color from tags if available (format: bg:#RRGGBB)
      let bgColor = DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length];
      if (article.tags) {
        const bgTag = article.tags.find(tag => tag.startsWith('bg:'));
        if (bgTag) {
          bgColor = bgTag.substring(3);
        }
      }

      return {
        id: article.id,
        title: article.title,
        subtitle: subtitle,
        discount: discount,
        image: article.image?.url || '/images/hero-bg.jpg',
        link: `/blogs/banner-slides/${article.handle}`,
        bgColor: bgColor
      };
    });
  }

  // Process product data into slides
  function processProductData(productData) {
    return productData.nodes.map((product, index) => {
      // Create a map of metafield keys to values for easier access
      const metafieldMap = {};
      if (product.metafields) {
        product.metafields.forEach(field => {
          metafieldMap[field.key] = field.value;
        });
      }

      return {
        id: product.id,
        title: product.title,
        subtitle: metafieldMap.banner_subtitle || '',
        discount: metafieldMap.banner_discount || product.description || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length],
        image: product.featuredImage?.url || '/images/hero-bg.jpg',
        link: `/products/${product.handle}`,
        bgColor: metafieldMap.banner_bg_color || DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length]
      };
    });
  }

  // Process collection data into slides (or use fallback data)
  function processCollectionData(collections) {
    // If no collections data is available, use fallback data
    if (!collections || !collections.nodes || collections.nodes.length === 0) {
      return [
        {
          id: 1,
          title: "New Arrivals",
          subtitle: "Summer Collection",
          discount: DEFAULT_DISCOUNTS[0],
          image: "/images/hero-bg.jpg",
          link: "/collections/all",
          bgColor: DEFAULT_BG_COLORS[0]
        },
        {
          id: 2,
          title: "Special Deals",
          subtitle: "Limited Time Offer",
          discount: DEFAULT_DISCOUNTS[1],
          image: "/images/hero-bg.jpg",
          link: "/collections/all",
          bgColor: DEFAULT_BG_COLORS[1]
        },
        {
          id: 3,
          title: "Premium Selection",
          subtitle: "Best Sellers",
          discount: DEFAULT_DISCOUNTS[2],
          image: "/images/hero-bg.jpg",
          link: "/collections/all",
          bgColor: DEFAULT_BG_COLORS[2]
        }
      ];
    }

    // Map collection data to slide format
    return collections.nodes.map((collection, index) => {
      // Split the title into main title and subtitle if it contains a pipe character
      const titleParts = collection.title.split('|');
      const title = titleParts[0].trim();
      const subtitle = titleParts.length > 1 ? titleParts[1].trim() : '';

      // Use the collection description as discount text if available
      const discount = collection.description || DEFAULT_DISCOUNTS[index % DEFAULT_DISCOUNTS.length];

      return {
        id: collection.id,
        title: title,
        subtitle: subtitle,
        discount: discount,
        image: collection.image?.url || "/images/hero-bg.jpg",
        link: `/collections/${collection.handle}`,
        bgColor: DEFAULT_BG_COLORS[index % DEFAULT_BG_COLORS.length]
      };
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="slideshow-banner">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundColor: slide.bgColor }}
          >
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <h2>{slide.subtitle}</h2>
              <div className="discount-badge">
                <span>{slide.discount}</span>
              </div>
              <Link to={slide.link} className="shop-now-btn">
                Shop now <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="slide-image">
              <div className="slide-image-container">
                <img src={slide.image} alt={`${slide.title} ${slide.subtitle}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="slideshow-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
