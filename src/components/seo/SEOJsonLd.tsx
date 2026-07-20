import React from "react";

export interface SEOJsonLdProps {
  /**
   * Whether to render the Organization schema.
   */
  renderOrganization?: boolean;
  /**
   * Whether to render the Local Business schema.
   */
  renderLocalBusiness?: boolean;
  /**
   * Custom product data to render the Product schema.
   */
  productData?: {
    title: string;
    description: string;
    images: string[];
    sku: string;
    category?: string;
    fabric?: string;
    inStock: boolean;
    url?: string;
  };
  /**
   * Custom override for Organization Name.
   */
  organizationName?: string;
  /**
   * Custom override for Logo URL.
   */
  logoUrl?: string;
  /**
   * Custom override for Domain URL.
   */
  domainUrl?: string;
  /**
   * Custom override for Telephone number.
   */
  telephone?: string;
  /**
   * Custom override for Address.
   */
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  /**
   * Custom override for geographical coordinates.
   */
  geo?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * SEOJsonLd renders structured JSON-LD data for search engines.
 * It supports Organization, Local Business, and Product schemas.
 * XSS Security: JSON strings are sanitized using robust escaping to prevent script injection.
 */
export default function SEOJsonLd({
  renderOrganization = false,
  renderLocalBusiness = false,
  productData,
  organizationName = "Todi Creation",
  logoUrl = "https://todicreation.com/logo.png",
  domainUrl = "https://todicreation.com",
  telephone = "+91-99999-99999",
  address = {
    streetAddress: "L-1665-1666, Millennium Textile Market 1, Ring Road",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "395002",
    addressCountry: "IN",
  },
  geo = {
    latitude: 21.1702,
    longitude: 72.8311,
  },
}: SEOJsonLdProps) {
  // Extract individual fields to ensure stable dependency array for useMemo
  const addressStreet = address?.streetAddress;
  const addressLocality = address?.addressLocality;
  const addressRegion = address?.addressRegion;
  const addressPostalCode = address?.postalCode;
  const addressCountry = address?.addressCountry;

  const geoLatitude = geo?.latitude;
  const geoLongitude = geo?.longitude;

  const productTitle = productData?.title;
  const productDesc = productData?.description;
  const productImagesSerialized = productData?.images?.join(",");
  const productSku = productData?.sku;
  const productCategory = productData?.category;
  const productFabric = productData?.fabric;
  const productInStock = productData?.inStock;
  const productUrl = productData?.url;
  const shouldRenderProduct = !!productData;

  const productImages = React.useMemo(() => {
    return productData?.images || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productImagesSerialized]);

  const serializedSchemas = React.useMemo(() => {
    const schemas: Record<string, unknown>[] = [];

    // 1. Organization Schema
    if (renderOrganization) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${domainUrl}/#organization`,
        name: organizationName,
        url: domainUrl,
        logo: logoUrl,
        foundingDate: "2011",
        description: "B2B manufacturer and exporter of premium bridal ethnic wear, established in Surat, Gujarat in 2011. Trusted by 1700+ boutique partners across 17+ countries.",
        areaServed: ["IN", "GB", "AE", "MU", "ZA", "NZ", "LK", "BD", "FJ"],
        numberOfEmployees: { "@type": "QuantitativeValue", value: 135 },
        slogan: "To inspire the world to embrace Indian culture through premium ethnic fashion and exceptional craftsmanship.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: telephone,
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      });
    }

    // 2. Local Business Schema
    if (renderLocalBusiness) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${domainUrl}/#localbusiness`,
        name: organizationName,
        image: logoUrl,
        url: domainUrl,
        telephone: telephone,
        priceRange: "$$",
        foundingDate: "2011",
        description: "Wholesale manufacturer and exporter of bridal lehengas and ethnic wear. Factory at 2260, Millennium Textile Market 4, Surat. MOQ: 25 pieces.",
        hasMap: "https://maps.app.goo.gl/koqMeSJmArJTXvAp7",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            opens: "10:00",
            closes: "20:00",
          },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: addressStreet || "L-1665-1666, Millennium Textile Market 1, Ring Road",
          addressLocality: addressLocality || "Surat",
          addressRegion: addressRegion || "Gujarat",
          postalCode: addressPostalCode || "395002",
          addressCountry: addressCountry || "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: geoLatitude ?? 21.1702,
          longitude: geoLongitude ?? 72.8311,
        },
      });
    }

    // 3. Product Schema
    if (shouldRenderProduct) {
      const productSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productTitle || "Product",
        image: productImages.length > 0 ? productImages : [logoUrl],
        description: productDesc || "",
        sku: productSku || "N/A",
        offers: {
          "@type": "Offer",
          url: productUrl || domainUrl,
          itemCondition: "https://schema.org/NewCondition",
          availability: productInStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: organizationName,
          },
        },
      };

      if (productCategory) {
        productSchema.category = productCategory;
      }
      if (productFabric) {
        productSchema.material = productFabric;
      }

      schemas.push(productSchema);
    }

    return schemas.map((schema) => {
      const jsonString = JSON.stringify(schema);
      // Escape characters to prevent XSS (Next.js context-safe approach)
      const sanitizedJson = jsonString
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");

      return {
        type: schema["@type"] as string,
        content: sanitizedJson,
      };
    });
  }, [
    renderOrganization,
    renderLocalBusiness,
    organizationName,
    logoUrl,
    domainUrl,
    telephone,
    addressStreet,
    addressLocality,
    addressRegion,
    addressPostalCode,
    addressCountry,
    geoLatitude,
    geoLongitude,
    shouldRenderProduct,
    productTitle,
    productImages,
    productDesc,
    productSku,
    productInStock,
    productUrl,
    productCategory,
    productFabric,
  ]);

  if (serializedSchemas.length === 0) {
    return null;
  }

  return (
    <>
      {serializedSchemas.map((schema, index) => (
        <script
          key={`${schema.type}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema.content }}
        />
      ))}
    </>
  );
}
