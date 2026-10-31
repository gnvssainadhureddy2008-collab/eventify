const MEDIA = "https://media.base44.com/images/public/6ae05b5cfcc35efd01470954";

// One distinct, on-theme photograph per destination. Nothing here is shared
// between unrelated celebrations.
export const IMAGES = {
  hero: `${MEDIA}/239e9dfae_generated_image.png`,
  wedding: `${MEDIA}/d635717da_generated_image.png`,
  birthday: `${MEDIA}/bed8e92ae_generated_image.png`,
  anniversary: `${MEDIA}/d508d4632_generated_image.png`,
  engagement: `${MEDIA}/1b04e9da7_generated_image.png`,
  graduation: `${MEDIA}/760ce088b_generated_image.png`,
  babyShower: `${MEDIA}/cb3e260d3_generated_image.png`,
  bridalShower: `${MEDIA}/596273b85_generated_image.png`,
  housewarming: `${MEDIA}/1ce64c24e_generated_image.png`,
  farewell: `${MEDIA}/c7f680516_generated_image.png`,
  reunion: `${MEDIA}/0f5fff833_generated_image.png`,
  collegeFestival: `${MEDIA}/964349e7a_generated_image.png`,
  corporate: `${MEDIA}/b8727f32e_generated_image.png`,
  conference: `${MEDIA}/fb1031bb4_generated_image.png`,
  workshop: `${MEDIA}/cf171735c_generated_image.png`,
  community: `${MEDIA}/11c0e7cf1_generated_image.png`,
  culturalFestival: `${MEDIA}/f130f0bd0_generated_image.png`,
  religious: `${MEDIA}/f25857cb3_generated_image.png`,
  charity: `${MEDIA}/5129615b7_generated_image.png`,
  retirement: `${MEDIA}/e79d38fb1_generated_image.png`,
  custom: `${MEDIA}/0a7acb2ed_generated_image.png`,
};

export const EVENT_TYPES = [
  { label: "Wedding", image: IMAGES.wedding, venueKeywords: ["banquet hall", "wedding venue", "resort", "lawn"] },
  { label: "Birthday", image: IMAGES.birthday, venueKeywords: ["party hall", "restaurant", "activity space"] },
  { label: "Anniversary", image: IMAGES.anniversary, venueKeywords: ["restaurant", "banquet hall", "rooftop"] },
  { label: "Engagement", image: IMAGES.engagement, venueKeywords: ["banquet hall", "hotel", "rooftop"] },
  { label: "Graduation", image: IMAGES.graduation, venueKeywords: ["auditorium", "convention centre", "hotel"] },
  { label: "Baby Shower", image: IMAGES.babyShower, venueKeywords: ["party hall", "restaurant", "banquet"] },
  { label: "Bridal Shower", image: IMAGES.bridalShower, venueKeywords: ["cafe", "party hall", "hotel"] },
  { label: "Housewarming", image: IMAGES.housewarming, venueKeywords: ["community hall", "party hall", "catering"] },
  { label: "Farewell", image: IMAGES.farewell, venueKeywords: ["restaurant", "banquet hall", "club"] },
  { label: "Reunion", image: IMAGES.reunion, venueKeywords: ["restaurant", "banquet hall", "resort"] },
  { label: "College Festival", image: IMAGES.collegeFestival, venueKeywords: ["auditorium", "convention centre", "open ground"] },
  { label: "Corporate Event", image: IMAGES.corporate, venueKeywords: ["conference hall", "hotel", "business centre"] },
  { label: "Conference or Seminar", image: IMAGES.conference, venueKeywords: ["convention centre", "auditorium", "hotel"] },
  { label: "Workshop", image: IMAGES.workshop, venueKeywords: ["coworking space", "studio", "conference room"] },
  { label: "Community Gathering", image: IMAGES.community, venueKeywords: ["community hall", "park", "cultural centre"] },
  { label: "Cultural Festival", image: IMAGES.culturalFestival, venueKeywords: ["cultural centre", "auditorium", "open ground"] },
  { label: "Religious Celebration", image: IMAGES.religious, venueKeywords: ["community hall", "temple hall", "banquet"] },
  { label: "Charity or Fundraising Event", image: IMAGES.charity, venueKeywords: ["hotel ballroom", "club", "convention centre"] },
  { label: "Retirement Party", image: IMAGES.retirement, venueKeywords: ["restaurant", "banquet hall", "club"] },
  { label: "Other / Custom Event", image: IMAGES.custom, venueKeywords: ["event venue", "banquet hall", "hotel"] },
];

export const EVENT_TYPE_LABELS = EVENT_TYPES.map((t) => t.label);

export function typeMeta(label) {
  return EVENT_TYPES.find((t) => t.label === label) || EVENT_TYPES[EVENT_TYPES.length - 1];
}

// The photo a celebration type falls back to when an event has no cover image
// of its own, or the stored one no longer loads.
export function categoryImage(label) {
  return typeMeta(label).image;
}

export function displayType(event) {
  if (!event) return "";
  if (event.event_type === "Other / Custom Event") {
    return event.custom_type?.trim() || "Custom Event";
  }
  return event.event_type;
}

export const THEMES = [
  "Timeless elegance",
  "Warm ivory & gold",
  "Blush romance",
  "Garden botanical",
  "Modern minimal",
  "Royal plum",
  "Vintage charm",
  "Festive traditional",
];

export const VENDOR_STATUSES = ["Not Started", "Contacted", "Booked", "Paid"];