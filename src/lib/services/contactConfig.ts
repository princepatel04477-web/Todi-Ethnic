import contactConfigJson from "./contactConfig.json";

export interface ContactConfig {
  ownerName: string;
  phoneNumber: string;
  whatsAppNumber: string;
  businessEmail: string;
  googleMapUrl: string;
  googleMapSearchUrl: string;
  address: string;
  businessHours: string;
  heroHeading: string;
  heroSubtitle: string;
  ctaText: string;
  whyPartner: { title: string; description: string; icon: string }[];
  faqs: { question: string; answer: string }[];
}

export function getContactConfig(): ContactConfig {
  return contactConfigJson as ContactConfig;
}
