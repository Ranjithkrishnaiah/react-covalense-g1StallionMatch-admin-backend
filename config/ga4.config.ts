import { registerAs } from '@nestjs/config';

export default registerAs('ga4', () => ({
  propertyId: parseInt(process.env.GA4_PROPERTY_ID),
}));
