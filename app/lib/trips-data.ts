// D:\Wayloft Holidays\wayloftholidays\app\lib\trips-data.ts

export type TripHighlight = {
  name: string;
  image: string; // put images in /public/trips/spots/
  description: string;
};

export type Trip = {
  slug: string;
  title: string;
  subtitle: string;
  image: string; // big background image
  thumb: string; // small square image for details page
  about: string;
  highlights: TripHighlight[]; // ✅ new
};

export const trips: Trip[] = [
  {
    slug: "morocco",
    title: "Morocco",
    subtitle: "Souks, riads, Sahara sunsets, and spice-in-the-air streets.",
    image: "/trips/morocco.jpg",
    thumb: "/trips/spots/morocco-marrakech.jpg",
    about:
      "Morocco is a culturally rich destination that appeals to travellers seeking authenticity, character, and memorable experiences. Shaped by Arab, Berber, and European influences, it offers historic cities, vibrant medinas, dramatic landscapes, and a strong sense of local life, making it ideal for culturally curious and experience-focused travellers.",
    highlights: [
      {
        name: "Marrakech Medina",
        image: "/trips/spots/morocco-marrakech.jpg",
        description:
          "A captivating imperial city filled with colour, energy, and history. Explore its historic medina, elegant palaces, and peaceful gardens, wander through lively souks, and experience the atmosphere of its iconic squares that bring Moroccan culture to life.",
      },
      {
        name: "Fes",
        image: "/trips/spots/morocco-fes.jpg",
        description:
          "The cultural and spiritual heart of Morocco, home to one of the world’s oldest universities. Wander through the medieval medina, visit historic madrasas and tanneries, and experience centuries-old craftsmanship.",
      },
      {
        name: "Sahara Desert",
        image: "/trips/spots/morocco-sahara.jpg",
        description:
          "An unforgettable landscape of golden sand dunes and open horizons. Enjoy camel rides, dramatic sunsets, overnight stays in traditional Berber camps, and star-filled desert skies.",
      },
      {
        name: "Aït Ben Haddou",
        image: "/trips/spots/morocco-ait-ben-haddou.jpg",
        description:
          "A UNESCO World Heritage Site and ancient fortified village showcasing traditional earthen architecture. Walk through historic kasbahs and learn about its role along ancient caravan routes.",
      },{
        name: "Chefchaouen",
        image: "/trips/spots/morocco-chefchaouen.jpg",
        description:
          "A peaceful mountain town famous for its blue-washed streets and relaxed pace. Stroll through the medina, enjoy scenic viewpoints, and experience local Rif Mountain culture.",
      },{
        name: "Essaouira",
        image: "/trips/spots/morocco-essaouira.jpg",
        description:
          "A charming coastal town known for its historic ramparts, fishing harbour, and laid-back seaside vibe. Explore the old medina, enjoy fresh seafood, and take in Atlantic Ocean views.",
      },{
        name: "Casablanca",
        image: "/trips/spots/morocco-casablanca.jpg",
        description:
          "Morocco’s modern economic centre, blending contemporary city life with iconic landmarks. Visit the impressive Hassan II Mosque and enjoy the Atlantic coastline.",
      },
    ],
  },
  {
    slug: "albania",
    title: "Albania",
    subtitle: "Hidden beaches, mountain drives, and calm coastal towns.",
    image: "/trips/albania.jpg",
    thumb: "/trips/albania-square.jpg",
    about:
      "Albania is seriously underrated. Think turquoise water, quiet beaches, mountain views, and affordable luxury. It’s best for relaxed travellers who still want that ‘wow’ scenery.",
    highlights: [
      {
        name: "Ksamil Beaches",
        image: "/trips/spots/albania-ksamil.jpg",
        description:
          "Turquoise water and a laid-back beach vibe. Perfect for slow mornings, light lunches, and a swim that actually feels like a reset.",
      },
      {
        name: "Berat (City of a Thousand Windows)",
        image: "/trips/spots/albania-berat.jpg",
        description:
          "A charming historic town with calm streets and beautiful views. Ideal for a cultural day that feels cosy and not exhausting.",
      },
      {
        name: "Theth National Park",
        image: "/trips/spots/albania-theth.jpg",
        description:
          "Mountains, fresh air, and that ‘I’m really living’ feeling. Great if you want one nature-heavy day without turning it into a hardcore trek trip.",
      },
    ],
  },
  {
    slug: "montenegro",
    title: "Montenegro",
    subtitle: "Old towns, sea views, and slow luxury by the bay.",
    image: "/trips/montenegro.jpg",
    thumb: "/trips/montenegro-square.jpg",
    about:
      "Montenegro is a hidden gem where dramatic mountains meet the Adriatic Sea. Medieval towns, alpine lakes, and unspoiled coastline combine to offer travellers a mix of history, culture, and natural beauty in a compact, accessible destination.",
    highlights: [
      {
        name: "Kotor",
        image: "/trips/spots/montenegro-kotor.jpg",
        description:
          "A medieval town set in a stunning bay and framed by steep mountains. Wander narrow streets, admire historic churches, and climb the fortress for breathtaking panoramic harbour views.",
      },
      {
        name: "Budva",
        image: "/trips/spots/montenegro-budva.jpg",
        description:
          "A lively coastal town blending history with seaside leisure. Explore the walled old town, stroll along sandy beaches, and enjoy the lively vibrant promenade.",
      },
      {
        name: "Perast",
        image: "/trips/spots/montenegro-perast.jpg",
        description:
          "A tranquil Baroque town along the Bay of Kotor. Walk along the waterfront, admire elegant palaces, and take boat trips to the nearby historic islets of Our Lady of the Rocks and St. George.",
      },{
        name: "Sveti Stefan",
        image: "/trips/spots/montenegro-sveti-stefan.jpg",
        description:
          "A small fortified island village connected to the mainland by a narrow causeway. Stroll through narrow streets, admire the pink stone buildings, and enjoy striking coastal sea views.",
      },{
        name: "Durmitor National Park",
        image: "/trips/spots/montenegro-durmitor.jpg",
        description:
          "A mountainous region of jagged peaks, glacial lakes, and deep canyons. Hike scenic trails, photograph dramatic landscapes, and experience the breathtaking Tara River Canyon.",
      },{
        name: "Skadar Lake",
        image: "/trips/spots/montenegro-skadar.jpg",
        description:
          "The largest lake in Montenegro. Take boat rides, explore wetlands and traditional villages, and spot the rich birdlife along its calm waters and peaceful shores.",
      },
    ],
  },
  {
    slug: "jordan",
    title: "Jordan",
    subtitle: "Petra magic, Wadi Rum skies, and Dead Sea calm.",
    image: "/trips/jordan.jpg",
    thumb: "/trips/spots/jordan-petra.jpg",
    about:
      "Jordan is a welcoming destination known for its rich history, stunning landscapes and warm hospitality. From ancient cities and vast deserts to relaxing wellness experiences, Jordan offers a perfect mix of culture, adventure and relaxation for all types of travellers.",
    highlights: [
      {
        name: "Petra",
        image: "/trips/spots/jordan-petra.jpg",
        description:
          "An ancient city carved into rose-red cliffs, showcasing remarkable temples, royal tombs and hidden passageways shaped over centuries. Visitors walk through the Siq to reach the iconic Treasury and explore surrounding monuments within one of the world’s most significant archaeological sites.",
      },
      {
        name: "Wadi Rum",
        image: "/trips/spots/jordan-wadirum.jpg",
        description:
          "A vast desert landscape of dramatic sandstone mountains and open valleys, known for its natural beauty and Bedouin heritage. Experiences include scenic jeep safaris, camel rides, sunset viewpoints and overnight stays in traditional Bedouin camps under star filled skies.",
      },
      {
        name: "Dead Sea",
        image: "/trips/spots/jordan-deadsea.jpg",
        description:
          "The lowest point on Earth, renowned for its mineral-rich waters and therapeutic mud in a calm, scenic setting. Travellers can float effortlessly on the water, enjoy natural mud treatments and relax with wellness and spa experiences along the shoreline.",
      },{
        name: "Amman",
        image: "/trips/spots/jordan-amman.jpg",
        description:
          "Jordan’s vibrant capital blending ancient history with modern city life. Visitors can explore the Citadel and Roman Theatre, walk through local markets, enjoy food tours and experience authentic Jordanian culture in cafés and neighbourhoods across the city.",
      },{
        name: "Jerash",
        image: "/trips/spots/jordan-jerash.jpg",
        description:
          "Discover Jerash, one of the best-preserved Roman cities in the region. Walk along its grand colonnaded streets, admire majestic temples and arches, and explore ancient theatres that showcase the scale and elegance of Roman architecture.",
      },
    ],
  },
  {
    slug: "turkey",
    title: "Turkey",
    subtitle: "Cappadocia balloons, bazaars, and blue coastlines.",
    image: "/trips/turkey.jpg",
    thumb: "/trips/turkey-square.jpg",
    about:
      "Turkey is one of the world’s most visited destinations, offering a rich blend of history, culture, and diverse landscapes. From iconic cities and ancient ruins to unique natural wonders and scenic coastlines, it attracts travellers from around the globe seeking memorable experiences.",
    highlights: [
      {
        name: "Istanbul",
        image: "/trips/spots/turkey-istanbul.jpg",
        description:
          "A city that connects Europe and Asia, blending historic landmarks with modern life. Visitors can explore Hagia Sophia, the Blue Mosque, Topkapi Palace, stroll through the Grand Bazaar, and experience the city’s vibrant atmosphere.",
      },
      {
        name: "Cappadocia",
        image: "/trips/spots/turkey-cappadocia.jpg",
        description:
          "A distinctive region of volcanic landscapes and rock-cut settlements. Experiences include sunrise hot-air balloon flights, exploring underground cities, walking through scenic valleys, and staying in traditional cave hotels.",
      },
      {
        name: "Ephesus",
        image: "/trips/spots/turkey-ephesus.jpg",
        description:
          "One of the best-preserved ancient Roman cities in the Mediterranean. Visitors walk along marble streets, admire monumental theatres and temples, and gain insight into the scale of Roman civilisation.",
      },{
        name: "Pamukkale and Hierapolis",
        image: "/trips/spots/turkey-pamukkale.jpg",
        description:
          "Known for its white travertine terraces formed by mineral-rich thermal waters. The site is complemented by the ancient city of Hierapolis, where Roman baths, temples, and a vast necropolis add historical depth to the landscape.",
      },{
        name: "Antalya",
        image: "/trips/spots/turkey-antalya.jpg",
        description:
          "A Mediterranean destination combining coastal scenery with historic heritage. Highlights include the old town of Kaleiçi, ancient harbours, nearby archaeological sites, and scenic beaches.",
      },{
        name: "Bodrum",
        image: "/trips/spots/turkey-bodrum.jpg",
        description:
          "A coastal town known for its marina, beaches, and medieval castle. The town offers a relaxed seaside atmosphere alongside cultural landmarks and historic sites.",
      },{
        name: "Göbekli Tepe",
        image: "/trips/spots/turkey-gobeklitepe.jpg",
        description:
          "One of the world’s oldest known archaeological sites, dating back over 11,000 years. The site features massive stone pillars arranged in circular formations, offering rare insight into early human civilisation and ritual practices.",
      },{
        name: "Konya",
        image: "/trips/spots/turkey-konya.jpg",
        description:
          "A historic city known for its spiritual and cultural heritage. Konya is closely associated with the poet Rumi and the Mevlevi Order, with key sites including the Mevlana Museum and traditional Seljuk architecture.",
      },
    ],
  },
  {
    slug: "tunisia",
    title: "Tunisia",
    subtitle: "Mediterranean charm, desert scenes, and culture-rich days.",
    image: "/trips/tunisia.jpg",
    thumb: "/trips/spots/tunisia-carthage.jpg",
    about:
      "A diverse North African destination blending ancient history, Mediterranean charm, and desert landscapes. From Roman ruins and historic medinas to Sahara dunes and coastal towns, Tunisia offers rich culture, heritage, and authentic travel experiences.",
    highlights: [
      {
        name: "Tunis & Carthage",
        image: "/trips/spots/tunisia-carthage.jpg",
        description:
          "The capital region blending modern life with ancient history. Visitors can explore the historic Medina of Tunis, admire Roman ruins at Carthage, and see world-famous mosaics at the Bardo Museum.",
      },
      {
        name: "Sidi Bou Said",
        image: "/trips/spots/tunisia-sidibousaid.jpg",
        description:
          "A picturesque coastal village known for its white-and-blue streets and Mediterranean charm. Visitors can stroll the narrow lanes, enjoy sea views, and relax in traditional cafés.",
      },
      {
        name: "Dougga",
        image: "/trips/spots/tunisia-dougga.jpg",
        description:
          "One of North Africa’s best-preserved Roman cities. Walk among temples, theatres, and ancient monuments set in a scenic hilltop landscape.",
      },{
        name: "El Djem",
        image: "/trips/spots/tunisia-eldjem.jpg",
        description:
          "Home to one of the largest Roman amphitheatres in the world. Visitors can explore the monumental arena and learn about Tunisia’s Roman history.",
      },{
        name: "Sahara Desert",
        image: "/trips/spots/tunisia-sahara.jpg",
        description:
          "A vast desert of golden sand dunes and oases. Visitors can take camel rides, enjoy sunset vistas, and spend nights under star-filled skies in traditional Berber camps.",
      },{
        name: "Kairouan",
        image: "/trips/spots/tunisia-kairouan.jpg",
        description:
          "A sacred city and UNESCO World Heritage Site. Explore the Great Mosque, wander through historic streets, and discover centuries of Islamic culture.",
      },{
        name: "Sousse",
        image: "/trips/spots/tunisia-sousse.jpg",
        description:
          "A vibrant coastal town blending history and beach life. Visitors can explore the medina, walk the ribat walls, and enjoy Mediterranean coastal views.",
      },{
        name: "Djerba",
        image: "/trips/spots/tunisia-djerba.jpg",
        description:
          "A serene island known for its sandy beaches, traditional villages, and rich culture. Visitors can explore markets, historic sites, and the coastal scenery.",
      },{
        name: "Matmata",
        image: "/trips/spots/tunisia-matmata.jpg",
        description:
          "A unique Berber village famous for its underground homes carved into the desert. Visitors can experience local architecture and desert culture.",
      },
    ],
  },
];

export function getTripBySlug(slug: string) {
  return trips.find((t) => t.slug === slug);
}
