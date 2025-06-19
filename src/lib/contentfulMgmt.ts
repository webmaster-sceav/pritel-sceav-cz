import { createClient } from 'contentful-management';

const client = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
});

const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);

export const environment = await space.getEnvironment(
    process.env.CONTENTFUL_ENVIRONMENT_ID || 'master'
);