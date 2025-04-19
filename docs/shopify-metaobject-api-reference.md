# Shopify Metaobject API Reference

This document provides reference information for working with Shopify Metaobjects via the Admin API.

## Overview

Shopify Metaobjects allow you to create custom content types for your store. This API reference focuses on the operations needed to manage promotion card metaobjects.

## Authentication

All API requests require authentication using an Admin API access token:

```
X-Shopify-Access-Token: your-admin-api-access-token
```

## GraphQL Endpoint

```
https://your-store.myshopify.com/admin/api/2023-07/graphql.json
```

## Common Operations

### 1. Create a Metaobject Definition

This mutation creates a new metaobject definition for promotion cards:

```graphql
mutation CreateMetaobjectDefinition {
  metaobjectDefinitionCreate(
    definition: {
      name: "Promotion Card"
      apiId: "promotion_card"
      description: "Cards for promotional content on the homepage"
      fieldDefinitions: [
        {
          name: "Title"
          apiId: "title"
          type: {
            name: "single_line_text_field"
          }
          required: true
        },
        {
          name: "Subtitle"
          apiId: "subtitle"
          type: {
            name: "single_line_text_field"
          }
        },
        # Add other field definitions here
      ]
    }
  ) {
    metaobjectDefinition {
      id
      name
      apiId
    }
    userErrors {
      field
      message
    }
  }
}
```

### 2. Create a Metaobject Entry

This mutation creates a new promotion card entry:

```graphql
mutation CreatePromotionCard {
  metaobjectCreate(
    metaobject: {
      type: "promotion_card"
      fields: [
        {
          key: "title"
          value: "Sale of the Month"
        },
        {
          key: "subtitle"
          value: "BEST DEALS"
        },
        {
          key: "background_color"
          value: "#2980b9"
        },
        {
          key: "text_color"
          value: "white"
        },
        {
          key: "link"
          value: "/collections/monthly-deals"
        },
        {
          key: "countdown_days"
          value: "00"
        },
        {
          key: "countdown_hours"
          value: "02"
        },
        {
          key: "countdown_mins"
          value: "18"
        },
        {
          key: "countdown_secs"
          value: "46"
        }
      ]
    }
  ) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}
```

### 3. Query Metaobject Entries

This query fetches all promotion card metaobjects:

```graphql
query GetPromotionCards {
  metaobjects(type: "promotion_card", first: 10) {
    edges {
      node {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
}
```

### 4. Update a Metaobject Entry

This mutation updates an existing promotion card:

```graphql
mutation UpdatePromotionCard {
  metaobjectUpdate(
    id: "gid://shopify/Metaobject/123456789"
    metaobject: {
      fields: [
        {
          key: "title"
          value: "Updated Sale Title"
        },
        {
          key: "background_color"
          value: "#3498db"
        }
      ]
    }
  ) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}
```

### 5. Delete a Metaobject Entry

This mutation deletes a promotion card:

```graphql
mutation DeletePromotionCard {
  metaobjectDelete(id: "gid://shopify/Metaobject/123456789") {
    deletedId
    userErrors {
      field
      message
    }
  }
}
```

## Field Types Reference

When creating metaobject definitions, you can use these field types:

| Field Type | API Name | Description |
|------------|----------|-------------|
| Single line text | `single_line_text_field` | Short text content |
| Multi-line text | `multi_line_text_field` | Longer text content |
| Number | `number_integer` | Integer values |
| Decimal | `number_decimal` | Decimal values |
| Date | `date` | Date values |
| Date and time | `date_time` | Date and time values |
| URL | `url` | URL values |
| Boolean | `boolean` | True/false values |
| Color | `color` | Color values |
| Product | `product_reference` | Reference to a product |
| Variant | `variant_reference` | Reference to a product variant |
| File | `file_reference` | Reference to a file |
| Media | `media` | Reference to media (images, videos) |
| Collection | `collection_reference` | Reference to a collection |
| Metaobject | `metaobject_reference` | Reference to another metaobject |
| Rating | `rating` | Rating values |
| List | `list.single_line_text_field` | List of values (prefix with `list.`) |

## Error Handling

All mutations return a `userErrors` field that contains any errors that occurred during the operation. Always check this field to ensure your operation was successful.

Example error response:

```json
{
  "data": {
    "metaobjectCreate": {
      "metaobject": null,
      "userErrors": [
        {
          "field": ["metaobject", "fields", "0", "value"],
          "message": "Title cannot be blank"
        }
      ]
    }
  }
}
```

## Best Practices

1. **Use Descriptive Names**: Choose clear, descriptive names for your metaobject definitions and fields
2. **Validate Input**: Always validate user input before sending it to the API
3. **Handle Errors**: Always check for and handle errors returned by the API
4. **Use Pagination**: When fetching large numbers of metaobjects, use pagination to improve performance
5. **Cache Results**: Consider caching API results to reduce the number of API calls

## Further Reading

- [Shopify Metaobjects Documentation](https://shopify.dev/api/admin-graphql/current/objects/Metaobject)
- [Shopify Admin API Reference](https://shopify.dev/api/admin-graphql)
- [GraphQL API Best Practices](https://shopify.dev/api/usage/best-practices)
