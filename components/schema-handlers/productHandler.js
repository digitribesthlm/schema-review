// Product schema handler
export const handleProductFields = (schemaData) => {
  const fields = {}
  
  // Basic product fields
  if (schemaData.name) {
    fields.name = {
      value: schemaData.name,
      field_type: 'text',
      editable: true,
      description: 'Product name'
    }
  }
  
  if (schemaData.description) {
    fields.description = {
      value: schemaData.description,
      field_type: 'textarea',
      editable: true,
      description: 'Product description'
    }
  }

  if (schemaData.url) {
    fields.url = {
      value: schemaData.url,
      field_type: 'url',
      editable: true,
      description: 'Product page URL'
    }
  }

  // Brand information
  if (schemaData.brand) {
    if (typeof schemaData.brand === 'string') {
      fields.brand = {
        value: schemaData.brand,
        field_type: 'text',
        editable: true,
        description: 'Brand name'
      }
    } else if (schemaData.brand.name) {
      fields.brandName = {
        value: schemaData.brand.name,
        field_type: 'text',
        editable: true,
        description: 'Brand name'
      }
    }
  }

  // Product identifiers
  if (schemaData.sku) {
    fields.sku = {
      value: schemaData.sku,
      field_type: 'text',
      editable: true,
      description: 'Product SKU/Item number'
    }
  }

  if (schemaData.mpn) {
    fields.mpn = {
      value: schemaData.mpn,
      field_type: 'text',
      editable: true,
      description: 'Manufacturer Part Number'
    }
  }

  if (schemaData.gtin || schemaData.gtin13 || schemaData.gtin12 || schemaData.gtin8) {
    const gtinValue = schemaData.gtin || schemaData.gtin13 || schemaData.gtin12 || schemaData.gtin8
    fields.gtin = {
      value: gtinValue,
      field_type: 'text',
      editable: true,
      description: 'GTIN/Barcode number'
    }
  }

  // Category
  if (schemaData.category) {
    fields.category = {
      value: schemaData.category,
      field_type: 'text',
      editable: true,
      description: 'Product category'
    }
  }

  // Visual content
  if (schemaData.image) {
    const imageValue = Array.isArray(schemaData.image) ? schemaData.image.join(', ') : schemaData.image
    fields.image = {
      value: imageValue,
      field_type: 'textarea',
      editable: true,
      description: 'Product image URLs (one per line or comma-separated)'
    }
  }

  // Offers and pricing
  if (schemaData.offers) {
    if (schemaData.offers.price || schemaData.offers.lowPrice || schemaData.offers.highPrice) {
      const price = schemaData.offers.price || schemaData.offers.lowPrice || schemaData.offers.highPrice
      fields.price = {
        value: price,
        field_type: 'text',
        editable: true,
        description: 'Product price'
      }
    }
    
    if (schemaData.offers.priceCurrency) {
      fields.priceCurrency = {
        value: schemaData.offers.priceCurrency,
        field_type: 'text',
        editable: true,
        description: 'Price currency (e.g., USD, EUR, GBP)'
      }
    }
    
    if (schemaData.offers.availability) {
      const availabilityOptions = [
        'InStock',
        'OutOfStock', 
        'PreOrder',
        'Discontinued',
        'LimitedAvailability'
      ]
      fields.availability = {
        value: schemaData.offers.availability.replace('https://schema.org/', ''),
        field_type: 'select',
        editable: true,
        description: 'Product availability',
        options: availabilityOptions
      }
    }

    if (schemaData.offers.url) {
      fields.offerUrl = {
        value: schemaData.offers.url,
        field_type: 'url',
        editable: true,
        description: 'Purchase/offer URL'
      }
    }
  }

  // Physical properties
  if (schemaData.color) {
    const colorValue = Array.isArray(schemaData.color) ? schemaData.color.join(', ') : schemaData.color
    fields.color = {
      value: colorValue,
      field_type: 'text',
      editable: true,
      description: 'Product color(s)'
    }
  }

  if (schemaData.size) {
    fields.size = {
      value: schemaData.size,
      field_type: 'text',
      editable: true,
      description: 'Product size'
    }
  }

  if (schemaData.weight) {
    fields.weight = {
      value: schemaData.weight,
      field_type: 'text',
      editable: true,
      description: 'Product weight'
    }
  }

  // Manufacturer
  if (schemaData.manufacturer) {
    if (typeof schemaData.manufacturer === 'string') {
      fields.manufacturer = {
        value: schemaData.manufacturer,
        field_type: 'text',
        editable: true,
        description: 'Manufacturer name'
      }
    } else if (schemaData.manufacturer.name) {
      fields.manufacturerName = {
        value: schemaData.manufacturer.name,
        field_type: 'text',
        editable: true,
        description: 'Manufacturer name'
      }
    }
  }

  // Model
  if (schemaData.model) {
    fields.model = {
      value: schemaData.model,
      field_type: 'text',
      editable: true,
      description: 'Product model'
    }
  }

  // Rating information
  if (schemaData.aggregateRating) {
    if (schemaData.aggregateRating.ratingValue) {
      fields.ratingValue = {
        value: schemaData.aggregateRating.ratingValue,
        field_type: 'number',
        editable: true,
        description: 'Average rating value'
      }
    }
    
    if (schemaData.aggregateRating.bestRating) {
      fields.bestRating = {
        value: schemaData.aggregateRating.bestRating,
        field_type: 'number',
        editable: true,
        description: 'Best possible rating'
      }
    }
    
    if (schemaData.aggregateRating.reviewCount || schemaData.aggregateRating.ratingCount) {
      const count = schemaData.aggregateRating.reviewCount || schemaData.aggregateRating.ratingCount
      fields.reviewCount = {
        value: count,
        field_type: 'number',
        editable: true,
        description: 'Number of reviews/ratings'
      }
    }
  }

  return fields
}

export const getProductInitialFields = (schemaData) => {
  const initialFields = {}
  
  // Basic fields
  if (schemaData.name) initialFields.name = schemaData.name
  if (schemaData.description) initialFields.description = schemaData.description
  if (schemaData.url) initialFields.url = schemaData.url
  
  // Brand
  if (schemaData.brand) {
    if (typeof schemaData.brand === 'string') {
      initialFields.brand = schemaData.brand
    } else if (schemaData.brand.name) {
      initialFields.brandName = schemaData.brand.name
    }
  }
  
  // Identifiers
  if (schemaData.sku) initialFields.sku = schemaData.sku
  if (schemaData.mpn) initialFields.mpn = schemaData.mpn
  if (schemaData.gtin || schemaData.gtin13 || schemaData.gtin12 || schemaData.gtin8) {
    initialFields.gtin = schemaData.gtin || schemaData.gtin13 || schemaData.gtin12 || schemaData.gtin8
  }
  
  // Category and visuals
  if (schemaData.category) initialFields.category = schemaData.category
  if (schemaData.image) {
    initialFields.image = Array.isArray(schemaData.image) ? schemaData.image.join(', ') : schemaData.image
  }
  
  // Offers
  if (schemaData.offers) {
    if (schemaData.offers.price || schemaData.offers.lowPrice || schemaData.offers.highPrice) {
      initialFields.price = schemaData.offers.price || schemaData.offers.lowPrice || schemaData.offers.highPrice
    }
    if (schemaData.offers.priceCurrency) initialFields.priceCurrency = schemaData.offers.priceCurrency
    if (schemaData.offers.availability) {
      initialFields.availability = schemaData.offers.availability.replace('https://schema.org/', '')
    }
    if (schemaData.offers.url) initialFields.offerUrl = schemaData.offers.url
  }
  
  // Physical properties
  if (schemaData.color) {
    initialFields.color = Array.isArray(schemaData.color) ? schemaData.color.join(', ') : schemaData.color
  }
  if (schemaData.size) initialFields.size = schemaData.size
  if (schemaData.weight) initialFields.weight = schemaData.weight
  
  // Manufacturer and model
  if (schemaData.manufacturer) {
    if (typeof schemaData.manufacturer === 'string') {
      initialFields.manufacturer = schemaData.manufacturer
    } else if (schemaData.manufacturer.name) {
      initialFields.manufacturerName = schemaData.manufacturer.name
    }
  }
  if (schemaData.model) initialFields.model = schemaData.model
  
  // Ratings
  if (schemaData.aggregateRating) {
    if (schemaData.aggregateRating.ratingValue) initialFields.ratingValue = schemaData.aggregateRating.ratingValue
    if (schemaData.aggregateRating.bestRating) initialFields.bestRating = schemaData.aggregateRating.bestRating
    if (schemaData.aggregateRating.reviewCount || schemaData.aggregateRating.ratingCount) {
      initialFields.reviewCount = schemaData.aggregateRating.reviewCount || schemaData.aggregateRating.ratingCount
    }
  }
  
  return initialFields
}
