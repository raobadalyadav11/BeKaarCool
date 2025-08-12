export const generateProductSEO = (product: any) => {
  const baseTitle = product.name
  const category = product.category
  const brand = product.brand || 'BeKaarCool'
  
  return {
    title: `${baseTitle} - Buy Online at ${brand} | Best ${category}`,
    description: product.description.length > 160 
      ? product.description.substring(0, 157) + '...'
      : product.description,
    keywords: [
      ...product.name.toLowerCase().split(' '),
      category.toLowerCase(),
      brand.toLowerCase(),
      'buy online',
      'india',
      ...(product.tags || [])
    ].filter(Boolean),
    canonical: `/products/${product.slug}`,
    openGraph: {
      title: `${baseTitle} - ${brand}`,
      description: product.description.substring(0, 160),
      image: product.images?.[0] || '/placeholder.jpg',
      type: 'product',
      price: product.price,
      currency: 'INR',
      availability: product.stock > 0 ? 'in stock' : 'out of stock'
    }
  }
}

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}