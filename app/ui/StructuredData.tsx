const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://nomads-of-aditya.vercel.app";

export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Nomads of Aditya",
        description:
          "Journeys, people, places and thoughts from Aditya Valvi.",
        publisher: {
          "@id": `${siteUrl}/#person`,
        },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Aditya Valvi",
        url: siteUrl,
        description:
          "Traveller, storyteller and creator behind Nomads of Aditya.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
