/** Marketing copy and conversion content for the homepage and product pages. */

export interface Benefit {
  title: string;
  body: string;
}

export interface TrustItem {
  title: string;
  body: string;
  /** Short emoji/symbol used as an icon stand-in (no photo assets). */
  icon: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  country: string;
  stars: 5;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const HERO = {
  title: 'The Allergy Card That Can Save Your Life',
  subtitle:
    'Free food allergy translation cards in dozens of languages - so you can show restaurant staff exactly what you cannot eat, anywhere in the world. Print at home, show on your phone, or order a durable plastic card on a necklace.',
  primaryCta: 'Create My Card',
  primaryHref: '/cards/milk/english',
  secondaryCta: 'See How It Works',
  secondaryHref: '#how-it-works',
};

export const OUTCOME = {
  title: 'Never struggle to explain your allergy again',
  lead:
    'You are not buying a piece of plastic. You are buying peace of mind - the confidence to sit down at a restaurant abroad and know the kitchen understands.',
  points: [
    'Clear communication when language fails',
    'Less fear before every meal on a trip',
    'A simple card staff can read in seconds',
  ],
};

export const BENEFITS: Benefit[] = [
  {
    title: 'Communicate instantly',
    body: 'Restaurant staff see your allergy in their language - and English on the back - without guessing or translating under pressure.',
  },
  {
    title: 'Travel with confidence',
    body: 'No more relying on Google Translate at the table. Hand them the card and keep the focus on a safe meal.',
  },
  {
    title: 'Personalized for you',
    body: 'Choose your allergen, your language, and an optional name on the card. Built for real dietary emergencies, not generic warnings.',
  },
  {
    title: 'Durable when you need it',
    body: 'Print free at home, show fullscreen on your phone, or order a waterproof plastic card designed for everyday travel - including a durable necklace option when you order physical cards.',
  },
];

export const HOW_IT_WORKS = [
  {
    title: 'Choose allergy and language',
    body: 'Pick from 14 common food allergens and 49 languages. Preview both sides of your card instantly.',
  },
  {
    title: 'Show, print, or download - free',
    body: 'Open the card fullscreen for staff, print at credit-card size, save a PDF, or download a PNG. No account. No charge.',
  },
  {
    title: 'Optional: order a plastic card',
    body: 'Want something waterproof to wear or keep in a wallet? Order a durable plastic card for a small fee that covers printing and shipping.',
  },
];

export const FOUNDER = {
  title: 'Why We Built Open Allergy',
  paragraphs: [
    'Open Allergy started from our own family journey.',
    'I am a father of a child with a life-threatening milk allergy. Like many families dealing with severe allergies, we love traveling, discovering new places, and experiencing the world - but every trip also came with a lot of worry.',
    'Before every meal, there was always a question in the back of our minds:',
  ],
  questions: [
    'Will they understand his allergy?',
    'Will we be able to explain it correctly?',
    'What happens if there is a misunderstanding?',
  ],
  paragraphsAfter: [
    'A simple meal at a restaurant could turn into a stressful moment. A language barrier could make a dangerous situation even harder.',
    'We searched for a simple solution that would help us communicate clearly anywhere in the world. Something reliable that could speak for our child when we cannot.',
    'We could not find the solution we needed, so we decided to create it ourselves.',
    'That is how Open Allergy was born.',
    'We create personalized allergy cards designed to help people communicate their allergies clearly and confidently - wherever they are. The cards are protected, easy to carry, and attached to a durable necklace so the information is always available when it matters most.',
  ],
  missionLabel: 'Our mission is simple:',
  mission:
    'To help families with allergies enjoy traveling, eating, and exploring the world with more confidence and less fear.',
  closing: 'Because an allergy should not stop anyone from experiencing life.',
};

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: '🌍',
    title: 'Worldwide shipping',
    body: 'Physical cards can ship to supported countries at checkout.',
  },
  {
    icon: '💧',
    title: 'Waterproof cards',
    body: 'Plastic cards are built for bags, pockets, and busy travel days.',
  },
  {
    icon: '🔗',
    title: 'Durable necklace',
    body: 'Keep the card close when ordering a physical card with a necklace.',
  },
  {
    icon: '🔒',
    title: 'Secure checkout',
    body: 'Paid orders use Stripe. We do not store your card number.',
  },
  {
    icon: '✏️',
    title: 'Personalized design',
    body: 'Your allergen, language, and optional name on a double-sided card.',
  },
  {
    icon: '⚡',
    title: 'Fast production',
    body: 'We produce and ship physical orders as quickly as our print partner allows. Exact timing is confirmed by email after checkout.',
  },
];

/** Sample testimonials for conversion layout until real reviews replace them. */
export const TESTIMONIALS: Testimonial[] = [
  {
    stars: 5,
    name: 'Sarah M.',
    country: 'United States',
    quote:
      'Restaurant staff understood my daughter\'s peanut allergy immediately. The card gave us peace of mind while traveling in Japan.',
  },
  {
    stars: 5,
    name: 'Daniel K.',
    country: 'Germany',
    quote:
      'I used to panic every time we ate out abroad. Showing the Greek milk allergy card on my phone changed that overnight.',
  },
  {
    stars: 5,
    name: 'Amira H.',
    country: 'United Kingdom',
    quote:
      'Clear, serious, and easy for waiters to read. We finally felt like we could explain the allergy without fighting a language barrier.',
  },
  {
    stars: 5,
    name: 'Noah R.',
    country: 'Canada',
    quote:
      'Printed one for our trip to Italy and ordered a plastic copy for the next vacation. Simple tool, huge relief for our family.',
  },
  {
    stars: 5,
    name: 'Elena P.',
    country: 'Spain',
    quote:
      'The English side helped when staff switched languages. We did not have to argue or guess - the card did the talking.',
  },
  {
    stars: 5,
    name: 'Tomáš V.',
    country: 'Czech Republic',
    quote:
      'As a parent of a child with a severe egg allergy, this is the first free tool that actually felt built for real travel stress.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How many allergies can I include?',
    answer:
      'Each free card focuses on one allergen so the message stays clear for kitchen staff. You can create and print as many single-allergen cards as you need.',
  },
  {
    question: 'How many languages are supported?',
    answer:
      'We currently support 49 languages, with English always available on the back of the card. The community can add more through GitHub.',
  },
  {
    question: 'Can I customize both sides?',
    answer:
      'The front is your chosen language. The back is always English so staff who speak English can still help. You can optionally add a name on the card.',
  },
  {
    question: 'Is the card waterproof?',
    answer:
      'Free downloads are for paper or phone use. Optional plastic cards are waterproof and built for everyday travel.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Shipping time depends on destination and our print partner. After you order, we confirm production and shipping details by email. We do not publish fake countdown timers or guaranteed same-day claims.',
  },
  {
    question: 'Do you ship worldwide?',
    answer:
      'We ship physical cards to the countries enabled in Stripe checkout. If your country is missing, you can still download and print for free.',
  },
  {
    question: 'Can I reorder later?',
    answer:
      'Yes. Come back anytime, choose the same allergen and language, and order again - or just re-download the free card.',
  },
  {
    question: 'How durable is the necklace?',
    answer:
      'Physical orders can include a durable necklace so the card stays with you. Treat it like everyday travel gear - sturdy for daily use, not indestructible industrial equipment.',
  },
  {
    question: 'Can restaurants understand the translations?',
    answer:
      'Cards are written for kitchen staff, not literal machine-speak. Many translations are still awaiting native-speaker review and are clearly marked until verified. Always confirm when you can, and carry emergency medication.',
  },
  {
    question: 'What happens if I make a mistake?',
    answer:
      'For free cards, just change the options and download again. For physical orders, contact us as soon as possible after checkout - once a card is printed and shipped, changes may not be possible.',
  },
];

export const URGENCY = {
  title: 'Protect your next trip before the stress starts',
  body: 'Never rely on Google Translate in an emergency. Create your free allergy travel card now - while you still have time to check the wording.',
};

export const FINAL_CTA = {
  title: 'Ready to Travel With Confidence?',
  button: 'Create My Allergy Card',
  href: '/cards/milk/english',
};

export function socialProofStats(allergenCount: number, languageCount: number) {
  return [
    { label: `${languageCount} languages` },
    { label: `${allergenCount} allergens` },
    { label: 'Free forever' },
    { label: 'Open source' },
    { label: 'Designed by an allergy parent' },
  ];
}
