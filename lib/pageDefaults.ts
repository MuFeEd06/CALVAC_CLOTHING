// ─── Single source of truth for all page element defaults ─────
// Both the admin canvas and live page components import from here.
// x/y are % of viewport/canvas width/height (0–100).

export const HERO_DEFAULTS = [
  { id: 'model_image',   label: 'Hero Model Image',    visible: true, x: 33, y: 0,   width: 34, height: 100, isImage: true,  color: '#e2e2de', imageUrl: '', fontSize: 14, zoom: 1, objectPosition: 'top center' },
  { id: 'tag_left',      label: '//FASHION Tag',       visible: true, x: 3,  y: 10,  fontSize: 9,  color: '#aaaaaa', content: '//FASHION · SS 2026' },
  { id: 'headline_left', label: 'Left Headline',       visible: true, x: 2,  y: 17,  fontSize: 108, color: '#0d0d0d', content: 'where\n- style' },
  { id: 'est_rule',      label: 'EST. 2026 Rule',      visible: true, x: 2,  y: 46,  fontSize: 8,  color: '#aaaaaa', content: '—— EST. 2026' },
  { id: 'description',   label: 'Description Text',    visible: true, x: 2,  y: 54,  fontSize: 9,  color: '#555555', content: 'Explore curated collections, exclusive drops and everyday essentials all thoughtfully designed in one stylish shopping destination.' },
  { id: 'product_card',  label: 'Product Card',        visible: true, x: 2,  y: 72,  fontSize: 13, color: '#0d0d0d', content: 'Cargo Oversized Jacket', type: 'product_card' },
  { id: 'new_drop',      label: 'New Drop + Shop Now', visible: true, x: 2,  y: 87,  fontSize: 9,  color: '#0d0d0d', content: 'Collection 2026' },
  { id: 'tag_right',     label: 'Styled For Life',     visible: true, x: 68, y: 10,  fontSize: 9,  color: '#aaaaaa', content: 'Styled For Life. ——' },
  { id: 'headline_right',label: 'Right Headline',      visible: true, x: 65, y: 17,  fontSize: 108, color: '#0d0d0d', content: 'lives\n- now' },
  { id: 'avatars',       label: 'Avatar Cluster',      visible: true, x: 68, y: 52,  fontSize: 10, color: '#0d0d0d', content: '', type: 'avatars' },
  { id: 'orange_star',   label: 'Orange Star ✦',       visible: true, x: 70, y: 59,  fontSize: 20, color: '#f04e0f', content: '✦' },
  { id: 'stat',          label: '280K Stat',           visible: true, x: 67, y: 66,  fontSize: 64, color: '#0d0d0d', content: '280K' },
  { id: 'stat_label',    label: 'People We Inspire',   visible: true, x: 67, y: 76,  fontSize: 8,  color: '#aaaaaa', content: 'PEOPLE WE INSPIRE' },
  { id: 'scroll_ind',    label: 'Scroll Indicator',    visible: true, x: 96, y: 70,  fontSize: 8,  color: '#aaaaaa', content: '| SCROLL' },
]

export const FEATURED_DEFAULTS = [
  { id: 'headline',     label: 'Headline',          visible: true, x: 2,  y: 4,  fontSize: 82,  color: '#0d0d0d', content: 'All - about\nmoments ©26' },
  { id: 'star',         label: 'Orange Star ✦',     visible: true, x: 3,  y: 50, fontSize: 32,  color: '#f04e0f', content: '✦' },
  { id: 'custom_text',  label: 'Body Text',         visible: true, x: 2,  y: 62, fontSize: 13,  color: '#555555', content: 'Crafted for the bold.\nWorn by the few.' },
  { id: 'learn_more',   label: 'Learn More Button', visible: true, x: 2,  y: 82, fontSize: 10,  color: '#0d0d0d', content: 'LEARN MORE' },
  { id: 'main_image',   label: 'Main Image',        visible: true, x: 29, y: 2,  width: 36, height: 75, isImage: true, color: '#c8b890', imageUrl: '', fontSize: 14 },
  { id: 'caption1',     label: 'Caption 1',         visible: true, x: 29, y: 79, fontSize: 11,  color: '#aaaaaa', content: '©International - going distance 2026' },
  { id: 'description',  label: 'Description Text',  visible: true, x: 67, y: 2,  fontSize: 12,  color: '#777777', content: 'Where Elegance Meets\nSustainability Luxury\nMade Accessible' },
  { id: 'thumb_image',  label: 'Thumbnail Image',   visible: true, x: 87, y: 2,  width: 9,  height: 17, isImage: true, color: '#b8c0a8', imageUrl: '', fontSize: 14 },
  { id: 'price1',       label: 'Price 1',           visible: true, x: 76, y: 24, fontSize: 38,  color: '#0d0d0d', content: '($120)' },
  { id: 'product2_img', label: 'Product 2 Image',   visible: true, x: 66, y: 37, width: 30, height: 38, isImage: true, color: '#5a5050', imageUrl: '', fontSize: 14 },
  { id: 'caption2',     label: 'Caption 2',         visible: true, x: 67, y: 77, fontSize: 11,  color: '#aaaaaa', content: '©International - just do it 2026' },
  { id: 'price2',       label: 'Price / Discount',  visible: true, x: 76, y: 86, fontSize: 38,  color: '#0d0d0d', content: '(45%)' },
]

export const CATEGORIES_DEFAULTS = [
  { id: 'model_image', label: 'Category Image',    visible: true, x: 0,  y: 5,  width: 38, height: 88, isImage: true, color: '#e2e0dc', imageUrl: '', fontSize: 14 },
  { id: 'description', label: 'Description',       visible: true, x: 1,  y: 78, fontSize: 13, color: '#666666', content: "Every piece carries rhythm beyond clothing — it's motion and meaning where street energy meets." },
  { id: 'see_product', label: 'SEE PRODUCT btn',   visible: true, x: 1,  y: 90, fontSize: 9,  color: '#0d0d0d', content: 'SEE PRODUCT' },
  { id: 'cat_active',  label: 'Active Category',   visible: true, x: 42, y: 15, fontSize: 64, color: '#0d0d0d', content: 'accessories' },
  { id: 'cat2',        label: 'Category 2',        visible: true, x: 42, y: 30, fontSize: 46, color: '#aaaaaa', content: 'hoodies' },
  { id: 'cat3',        label: 'Category 3',        visible: true, x: 42, y: 42, fontSize: 36, color: '#ccccca', content: 'jackets' },
  { id: 'cat4',        label: 'Category 4',        visible: true, x: 42, y: 52, fontSize: 28, color: '#dddddc', content: 'pants' },
  { id: 'cat5',        label: 'Category 5',        visible: true, x: 42, y: 60, fontSize: 22, color: '#e8e8e5', content: 'tees' },
  { id: 'label',       label: '[CATEGORIES]',      visible: true, x: 42, y: 74, fontSize: 10, color: '#aaaaaa', content: '[CATEGORIES]' },
]

export const CAROUSEL_DEFAULTS = [
  { id: 'title',  label: 'Section Title',    visible: true, x: 3,  y: 5,  fontSize: 13, color: '#0d0d0d', content: '©calvac - jacket momento' },
  { id: 'year',   label: 'Year Tag',         visible: true, x: 3,  y: 14, fontSize: 12, color: '#aaaaaa', content: '2026' },
  { id: 'other',  label: '[Other] Tag',      visible: true, x: 12, y: 14, fontSize: 11, color: '#aaaaaa', content: '[Other]' },
  { id: 'wear',   label: '[Wear the Moment]',visible: true, x: 36, y: 85, fontSize: 11, color: '#ffffff', content: '[Wear the Moment]' },
  { id: 'card1',  label: 'Card 1 Image',     visible: true, x: 2,  y: 25, width: 14, height: 62, isImage: true, color: '#c8b890', imageUrl: '', fontSize: 14 },
  { id: 'card2',  label: 'Card 2 Image',     visible: true, x: 17, y: 22, width: 16, height: 68, isImage: true, color: '#a8b898', imageUrl: '', fontSize: 14 },
  { id: 'card3',  label: 'Card 3 (Active)',  visible: true, x: 34, y: 16, width: 20, height: 78, isImage: true, color: '#3e3e3e', imageUrl: '', fontSize: 14 },
  { id: 'card4',  label: 'Card 4 Image',     visible: true, x: 55, y: 22, width: 16, height: 68, isImage: true, color: '#90aea8', imageUrl: '', fontSize: 14 },
  { id: 'card5',  label: 'Card 5 Image',     visible: true, x: 72, y: 25, width: 14, height: 62, isImage: true, color: '#b8a888', imageUrl: '', fontSize: 14 },
  { id: 'card6',  label: 'Card 6 Image',     visible: true, x: 87, y: 28, width: 12, height: 55, isImage: true, color: '#9a9088', imageUrl: '', fontSize: 14 },
]

export const COLLECTIONS_DEFAULTS = [
  { id: 'intro',       label: 'Intro Text',           visible: true, x: 5,  y: 3,  fontSize: 12, color: '#777777', content: 'From enduring classics to daring statement pieces, our collections are crafted with intention.' },
  { id: 'model_image', label: 'Left Model Image',     visible: true, x: 1,  y: 12, width: 38, height: 55, isImage: true, color: '#d8d4cc', imageUrl: '', fontSize: 14 },
  { id: 'caption',     label: 'Caption',              visible: true, x: 1,  y: 70, fontSize: 11, color: '#aaaaaa', content: 'Being Part Of Our Journey.' },
  { id: 'feat_title',  label: 'Featured Title',       visible: true, x: 46, y: 4,  fontSize: 34, color: '#0d0d0d', content: 'Statement Pieces 2025' },
  { id: 'feat_desc',   label: 'Featured Description', visible: true, x: 46, y: 16, fontSize: 12, color: '#888888', content: 'Your go-to wardrobe staples, crafted for comfort and effortless style.' },
  { id: 'feat_btn',    label: 'GET STARTED btn',      visible: true, x: 46, y: 26, fontSize: 10, color: '#0d0d0d', content: 'GET STARTED' },
  { id: 'featured_img',label: 'Featured Thumbnail',   visible: true, x: 82, y: 4,  width: 14, height: 22, isImage: true, color: '#b8c8b8', imageUrl: '', fontSize: 14 },
  { id: 'col1',        label: 'Collection Row 1',     visible: true, x: 46, y: 42, fontSize: 30, color: '#555555', content: 'Everyday Essentials 2026' },
  { id: 'col2',        label: 'Collection Row 2',     visible: true, x: 46, y: 58, fontSize: 30, color: '#555555', content: 'Timeless Classics 2026' },
  { id: 'col3',        label: 'Collection Row 3',     visible: true, x: 46, y: 74, fontSize: 30, color: '#555555', content: 'Seasonal Collections 2025' },
]

export const FOOTER_DEFAULTS = [
  { id: 'headline',  label: 'Footer Headline', visible: true, x: 3,  y: 12, fontSize: 32, color: '#ffffff', content: 'Fast Selling Urban\n__Fashion Collection' },
  { id: 'email_row', label: 'Email Input Row', visible: true, x: 3,  y: 46, fontSize: 9,  color: '#555555', content: 'Send email to us' },
  { id: 'location',  label: 'Location',        visible: true, x: 35, y: 12, fontSize: 13, color: '#888888', content: 'Your Store Address\nCity, State' },
  { id: 'email',     label: 'Email',           visible: true, x: 35, y: 38, fontSize: 13, color: '#888888', content: 'hello@calvac.store' },
  { id: 'phone',     label: 'Call Us',         visible: true, x: 62, y: 12, fontSize: 13, color: '#888888', content: '+91 98765 43210' },
  { id: 'hours',     label: 'Open Time',       visible: true, x: 62, y: 34, fontSize: 13, color: '#888888', content: '08.00 - 11.00 pm' },
  { id: 'copyright', label: 'Copyright',       visible: true, x: 62, y: 90, fontSize: 11, color: '#444444', content: '© 2026 CALVAC. All rights reserved.' },
]

// ─── Mobile section element type ──────────────────────────────
export interface MobileElement {
  id: string
  label: string
  visible: boolean
  type: 'image' | 'text' | 'button' | 'color_block'
  content?: string
  imageUrl?: string
  fontSize?: number
  color?: string
  bgColor?: string
  hint?: string
}

export interface MobileSectionConfig {
  id: string
  label: string
  icon: string
  bgColor: string
  accentColor: string
  elements: MobileElement[]
}

// ─── Mobile section defaults ──────────────────────────────────
// These match what the live mobile homepage renders.
// The admin Mobile Editor saves overrides into page_configs._mobileSections.
// Live components read merged data via useMergedMobileConfig().
export const MOBILE_SECTION_DEFAULTS: Record<string, MobileSectionConfig> = {
  mobile_hero: {
    id: 'mobile_hero', label: 'Hero', icon: '①', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mh_tag',         label: '//Fashion Tag',    visible: true, type: 'text',   content: '//FASHION · SS 2026',                                          fontSize: 9,  color: '#aaaaaa' },
      { id: 'mh_headline',    label: 'Headline',         visible: true, type: 'text',   content: 'where\n- style\nlives\n- now',                                  fontSize: 72, color: '#0d0d0d' },
      { id: 'mh_model',       label: 'Hero Image',       visible: true, type: 'image',  imageUrl: '', color: '#e2e2de',  hint: 'Full-width hero image' },
      { id: 'mh_description', label: 'Description',      visible: true, type: 'text',   content: 'Explore curated collections, exclusive drops and everyday essentials.', fontSize: 13, color: '#555555' },
      { id: 'mh_cta',         label: 'Shop Now Button',  visible: true, type: 'button', content: 'Shop Now →',                                                   color: '#0d0d0d' },
      { id: 'mh_stat',        label: 'Stat Block',       visible: true, type: 'text',   content: '280K',                                                         fontSize: 52, color: '#0d0d0d' },
      { id: 'mh_stat_label',  label: 'Stat Label',       visible: true, type: 'text',   content: 'PEOPLE WE INSPIRE',                                            fontSize: 9,  color: '#aaaaaa' },
    ],
  },
  mobile_featured: {
    id: 'mobile_featured', label: 'Featured', icon: '②', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mf_headline',  label: 'Headline',          visible: true, type: 'text',   content: 'All - about\nmoments ©26',                     fontSize: 52, color: '#0d0d0d' },
      { id: 'mf_main_img',  label: 'Main Product Image',visible: true, type: 'image',  imageUrl: '', color: '#c8b890', hint: 'Primary featured product image' },
      { id: 'mf_caption1',  label: 'Caption 1',         visible: true, type: 'text',   content: '©International — going distance 2026',         fontSize: 11, color: '#aaaaaa' },
      { id: 'mf_price1',    label: 'Price 1',           visible: true, type: 'text',   content: '($120)',                                       fontSize: 36, color: '#0d0d0d' },
      { id: 'mf_prod2_img', label: 'Product 2 Image',   visible: true, type: 'image',  imageUrl: '', color: '#5a5050', hint: 'Second featured product image' },
      { id: 'mf_caption2',  label: 'Caption 2',         visible: true, type: 'text',   content: '©International — just do it 2026',             fontSize: 11, color: '#aaaaaa' },
      { id: 'mf_price2',    label: 'Price / Discount',  visible: true, type: 'text',   content: '(45%)',                                        fontSize: 36, color: '#0d0d0d' },
      { id: 'mf_cta',       label: 'Learn More Button', visible: true, type: 'button', content: 'LEARN MORE →',                                 color: '#0d0d0d' },
    ],
  },
  mobile_categories: {
    id: 'mobile_categories', label: 'Categories', icon: '③', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mc_heading',     label: 'Section Label',    visible: true, type: 'text',   content: '[CATEGORIES]',                                                    fontSize: 10, color: '#aaaaaa' },
      { id: 'mc_cat_image',   label: 'Category Image',   visible: true, type: 'image',  imageUrl: '', color: '#e2e0dc', hint: 'Image for the active category' },
      { id: 'mc_description', label: 'Description Text', visible: true, type: 'text',   content: "Every piece carries rhythm beyond clothing — it's motion and meaning where street energy meets.", fontSize: 13, color: '#666666' },
      { id: 'mc_cta',         label: 'SEE PRODUCT btn',  visible: true, type: 'button', content: 'SEE PRODUCT →',                                                   color: '#0d0d0d' },
    ],
  },
  mobile_carousel: {
    id: 'mobile_carousel', label: 'Carousel', icon: '④', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mcr_title', label: 'Section Title',    visible: true, type: 'text',  content: 'SHOP THE COLLECTIONS', fontSize: 20, color: '#0d0d0d' },
      { id: 'mcr_year',  label: 'Year Tag',         visible: true, type: 'text',  content: '2026',                 fontSize: 13, color: '#aaaaaa' },
      { id: 'mcr_card1', label: 'Card 1 Image',     visible: true, type: 'image', imageUrl: '', color: '#c8b890',  hint: 'Card 1 — hero card on mobile' },
      { id: 'mcr_card2', label: 'Card 2 Image',     visible: true, type: 'image', imageUrl: '', color: '#a8b898' },
      { id: 'mcr_card3', label: 'Card 3 Image',     visible: true, type: 'image', imageUrl: '', color: '#3e3e3e' },
      { id: 'mcr_card4', label: 'Card 4 Image',     visible: true, type: 'image', imageUrl: '', color: '#90aea8' },
      { id: 'mcr_card5', label: 'Card 5 Image',     visible: true, type: 'image', imageUrl: '', color: '#b8a888' },
      { id: 'mcr_card6', label: 'Card 6 Image',     visible: true, type: 'image', imageUrl: '', color: '#9a9088' },
      { id: 'mcr_wear',  label: '[Wear the Moment]',visible: true, type: 'text',  content: '[Wear the Moment]',   fontSize: 11, color: '#ffffff' },
    ],
  },
  mobile_collections: {
    id: 'mobile_collections', label: 'Collections', icon: '⑤', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mcl_intro',      label: 'Intro Text',       visible: true, type: 'text',   content: 'From enduring classics to daring statement pieces, our collections are crafted with intention.', fontSize: 12, color: '#777777' },
      { id: 'mcl_model_img',  label: 'Model Image',      visible: true, type: 'image',  imageUrl: '', color: '#d8d4cc', hint: 'Full-width model image' },
      { id: 'mcl_feat_title', label: 'Featured Title',   visible: true, type: 'text',   content: 'Statement Pieces 2025',                                 fontSize: 28, color: '#0d0d0d' },
      { id: 'mcl_feat_desc',  label: 'Featured Desc',    visible: true, type: 'text',   content: 'Your go-to wardrobe staples, crafted for comfort and effortless style.', fontSize: 12, color: '#888888' },
      { id: 'mcl_feat_btn',   label: 'GET STARTED btn',  visible: true, type: 'button', content: 'GET STARTED →',                                         color: '#0d0d0d' },
      { id: 'mcl_col1',       label: 'Collection Row 1', visible: true, type: 'text',   content: 'Everyday Essentials 2026',                              fontSize: 24, color: '#555555' },
      { id: 'mcl_col2',       label: 'Collection Row 2', visible: true, type: 'text',   content: 'Timeless Classics 2026',                                fontSize: 24, color: '#555555' },
      { id: 'mcl_col3',       label: 'Collection Row 3', visible: true, type: 'text',   content: 'Seasonal Collections 2025',                             fontSize: 24, color: '#555555' },
    ],
  },
  mobile_footer: {
    id: 'mobile_footer', label: 'Footer', icon: '⑥', bgColor: '#0d0d0d', accentColor: '#f04e0f',
    elements: [
      { id: 'mft_headline',  label: 'Headline',         visible: true, type: 'text', content: 'Fast Selling Urban\n__Fashion Collection', fontSize: 28, color: '#ffffff' },
      { id: 'mft_email_ph',  label: 'Email Placeholder',visible: true, type: 'text', content: 'Send email to us',                         fontSize: 13, color: '#555555' },
      { id: 'mft_location',  label: 'Location',         visible: true, type: 'text', content: 'Your Store Address\nCity, State',           fontSize: 13, color: '#888888' },
      { id: 'mft_email',     label: 'Email',            visible: true, type: 'text', content: 'hello@calvac.store',                       fontSize: 13, color: '#888888' },
      { id: 'mft_phone',     label: 'Phone',            visible: true, type: 'text', content: '+91 98765 43210',                          fontSize: 13, color: '#888888' },
      { id: 'mft_hours',     label: 'Open Time',        visible: true, type: 'text', content: '08.00 - 11.00 pm',                        fontSize: 13, color: '#888888' },
      { id: 'mft_copyright', label: 'Copyright',        visible: true, type: 'text', content: '© 2026 CALVAC. All rights reserved.',      fontSize: 11, color: '#444444' },
    ],
  },
}
