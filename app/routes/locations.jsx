import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {PageHeader} from '~/components/PageHeader';
import React from 'react';

/**
 * Meta function for SEO
 */
export const meta = () => {
  return [
    {title: 'Our Store Locations | Kaah Supermarket'},
    {description: 'Find your nearest KAAH Supermarket location with contact details, opening hours, and directions.'},
  ];
};

/**
 * Query to fetch location metaobjects
 */
const LOCATIONS_METAOBJECTS_QUERY = `#graphql
  query LocationsMetaobjects($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "location", first: 10) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;

/**
 * Loader function to fetch location data
 * @param {import('@shopify/remix-oxygen').LoaderFunctionArgs} args
 */
export async function loader({context}) {
  try {
    // For now, use hardcoded data until metaobjects are set up
    const locationsData = {
      company_name: "KAAH Supermarket",
      locations: [
        {
          branch_name: "KAAH Secunda",
          address: {
            street: "Horwood Street",
            city: "Secunda",
            province: "Mpumalanga",
            postal_code: "2302",
            country: "South Africa"
          },
          contact: {
            phone: [
              "017 880 0399",
              "076 969 6416"
            ],
            email: "uzile@kaah.co.za"
          },
          hours: {
            monday: "7:00 AM - 7:00 PM",
            tuesday: "7:00 AM - 7:00 PM",
            wednesday: "7:00 AM - 7:00 PM",
            thursday: "7:00 AM - 7:00 PM",
            friday: "7:00 AM - 7:00 PM",
            saturday: "7:00 AM - 7:00 PM",
            sunday: "7:00 AM - 7:00 PM"
          }
        },
        {
          branch_name: "KAAH Bronkhorstspruit",
          address: {
            street: "18 Lanham Street",
            city: "Bronkhorstspruit",
            province: "Gauteng",
            postal_code: "1020",
            country: "South Africa"
          },
          contact: {
            phone: [
              "013 880 1534",
              "076 969 6416"
            ],
            email: "bronkhorstspruit@kaah.co.za"
          },
          hours: {
            monday: "7:00 AM - 7:00 PM",
            tuesday: "7:00 AM - 7:00 PM",
            wednesday: "7:00 AM - 7:00 PM",
            thursday: "7:00 AM - 7:00 PM",
            friday: "7:00 AM - 7:00 PM",
            saturday: "7:00 AM - 7:00 PM",
            sunday: "7:00 AM - 7:00 PM"
          }
        },
        {
          branch_name: "KAAH Rustenburg",
          address: {
            street: "16914 Tlou Street",
            city: "Rustenburg",
            province: "North West",
            postal_code: "0309",
            country: "South Africa"
          },
          contact: {
            phone: [
              "013 880 1534",
              "076 969 6416"
            ],
            email: "boitekong@kaah.co.za"
          },
          hours: {
            monday: "7:00 AM - 7:00 PM",
            tuesday: "7:00 AM - 7:00 PM",
            wednesday: "7:00 AM - 7:00 PM",
            thursday: "7:00 AM - 7:00 PM",
            friday: "7:00 AM - 7:00 PM",
            saturday: "7:00 AM - 7:00 PM",
            sunday: "7:00 AM - 7:00 PM"
          }
        },
        {
          branch_name: "KAAH Potchefstroom",
          address: {
            street: "70 Rivier Street",
            city: "Potchefstroom",
            province: "North West",
            postal_code: "2531",
            country: "South Africa"
          },
          contact: {
            phone: [
              "013 880 1534",
              "076 969 6416"
            ],
            email: "potchefstroom@kaah.co.za"
          },
          hours: {
            monday: "7:00 AM - 7:00 PM",
            tuesday: "7:00 AM - 7:00 PM",
            wednesday: "7:00 AM - 7:00 PM",
            thursday: "7:00 AM - 7:00 PM",
            friday: "7:00 AM - 7:00 PM",
            saturday: "7:00 AM - 7:00 PM",
            sunday: "7:00 AM - 7:00 PM"
          }
        }
      ],
      online_store: {
        website: "KAAH.co.za",

      },
      general_contact: {
        email: "admin@kaah.co.za"
      }
    };

    // Try to fetch metaobjects if they exist
    let metaobjects = null;
    try {
      const {metaobjects: fetchedMetaobjects} = await context.storefront.query(LOCATIONS_METAOBJECTS_QUERY);
      metaobjects = fetchedMetaobjects;
    } catch (error) {
      console.error('Error fetching location metaobjects:', error);
      // Continue with hardcoded data
    }

    return json({
      locationsData,
      metaobjects
    });
  } catch (error) {
    console.error('Error loading locations data:', error);
    return json({
      locationsData: null,
      metaobjects: null,
      error: 'Failed to load locations data'
    });
  }
}

/**
 * LocationCard component to display a single location
 */
function LocationCard({location}) {
  const {branch_name, address, contact, hours} = location;
  const [showHours, setShowHours] = React.useState(false);

  const toggleHours = () => {
    setShowHours(!showHours);
  };

  return (
    <div className="location-card">
      <div className="location-header">
        <h3>{branch_name}</h3>
      </div>
      <div className="location-content">
        <div className="location-address">
          <h4>
            <i className="fas fa-map-marker-alt"></i>
            Address
          </h4>
          <p>{address.street}</p>
          <p>{address.city}, {address.province}</p>
          <p>{address.postal_code}</p>
          <p>{address.country}</p>
        </div>

        <div className="location-contact">
          <h4>
            <i className="fas fa-phone-alt"></i>
            Contact
          </h4>
          {contact.phone.map((phone, index) => (
            <p key={index}>
              <i className="fas fa-phone" style={{marginRight: '8px', fontSize: '12px'}}></i>
              <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            </p>
          ))}
          <p>
            <i className="fas fa-envelope" style={{marginRight: '8px', fontSize: '12px'}}></i>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
        </div>

        <div className={`location-hours ${showHours ? 'hours-expanded' : 'hours-collapsed'}`}>
          <div className="hours-header" onClick={toggleHours}>
            <h4>
              <i className="fas fa-clock"></i>
              Opening Hours
            </h4>
            <button
              className="hours-toggle-btn"
              aria-label={showHours ? "Hide opening hours" : "Show opening hours"}
              title={showHours ? "Hide opening hours" : "Show opening hours"}
              onClick={(e) => {
                e.stopPropagation(); // Prevent double triggering with parent onClick
                toggleHours();
              }}
            >
              <i className={`fas ${showHours ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          </div>
          <div className="hours-content">
            <div className="hours-grid">
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Monday:
                </span>
                {hours.monday}
              </p>
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Tuesday:
                </span>
                {hours.tuesday}
              </p>
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Wednesday:
                </span>
                {hours.wednesday}
              </p>
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Thursday:
                </span>
                {hours.thursday}
              </p>
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Friday:
                </span>
                {hours.friday}
              </p>
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Saturday:
                </span>
                {hours.saturday}
              </p>
              <p>
                <span>
                  <i className="fas fa-calendar-day" style={{marginRight: '5px', fontSize: '12px'}}></i>
                  Sunday:
                </span>
                {hours.sunday}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Locations page component
 */
export default function LocationsRoute() {
  const {locationsData, metaobjects} = useLoaderData();

  // If we have metaobjects data, we would parse it here
  // For now, use the hardcoded data

  return (
    <div className="locations-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-heading">Our Store Locations</h1>
          <p className="page-subheading">Find your nearest KAAH Supermarket location below. We look forward to serving you!</p>
        </div>
      </div>

      <div className="locations-grid">
        {locationsData?.locations.map((location, index) => (
          <LocationCard key={index} location={location} />
        ))}
      </div>

      <div className="online-store-info">
        <h3>Online Shopping</h3>
        <p>
          <i className="fas fa-shopping-cart" style={{marginRight: '8px', color: 'var(--primary-color)'}}></i>
          Shop online at <a href={`https://${locationsData?.online_store.website}`} target="_blank" rel="noopener noreferrer">{locationsData?.online_store.website}</a>
        </p>

        <p>
          <i className="fas fa-envelope" style={{marginRight: '8px', color: 'var(--primary-color)'}}></i>
          For general inquiries: <a href={`mailto:${locationsData?.general_contact.email}`}>{locationsData?.general_contact.email}</a>
        </p>
        <div className="online-store-cta">
          <a href="/" className="shop-now-btn">
            <span>Visit Our Online Store</span>
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
