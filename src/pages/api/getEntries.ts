
import { contentfulClient } from "../../lib/contentful";
import type { APIRoute } from 'astro';
import type { Asset, AssetDetails, EntryFieldTypes, } from "contentful";

interface PritelPosts {
  contentTypeId: "pritel",
  fields: {
    title: EntryFieldTypes.Text,
    slug: EntryFieldTypes.Text,
    publishedAt: EntryFieldTypes.Date,
    summary: EntryFieldTypes.RichText,
    tableOfContents: EntryFieldTypes.Object,
    pdfFile: EntryFieldTypes.AssetLink,
    thumbnail: EntryFieldTypes.AssetLink,

  }
}



export const GET: APIRoute = async ( { url } ) => {

    const skip = parseInt(url.searchParams.get('skip') || '0');

    const limit = ( skip > 0 ) ? 8 : 7;

    const entries = await contentfulClient.getEntries<PritelPosts>({
      content_type: "pritel",
      limit: limit,
      skip,
      order: ['-fields.publishedAt'],
    });

    const posts = entries.items.map( ( item ) => {

        const { title, slug, publishedAt, summary, tableOfContents, pdfFile, thumbnail } = item.fields;
        const formatter = new Intl.DateTimeFormat('cs', { month: 'long' });
        const monthName = formatter.format(new Date( publishedAt ));
        const year = publishedAt.split("-")[0];
        const link = (pdfFile as Asset)?.fields?.file?.url as string;
        const thumbnailAsset = (thumbnail as Asset);
        const thumbnailUrl = thumbnailAsset.fields.file?.url as string;
        const thumbnailWidth = (thumbnailAsset?.fields?.file?.details as AssetDetails)?.image?.width ?? 0;
        const thumbnailHeight = (thumbnailAsset?.fields?.file?.details as AssetDetails)?.image?.height ?? 0;

        return {
            title,
            slug,
            monthName,
            year,
            link,
            thumbnailWidth,
            thumbnailHeight,
            thumbnailUrl,
        }; 
    })


    return new Response(
      JSON.stringify( posts ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

};