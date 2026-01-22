import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? 'set' : 'not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoSite() {
  const demoSite = {
    name: 'Smith for Senate 2025',
    components: [
      {
        id: 'hero-demo',
        type: 'hero',
        order: 0,
        props: {
          title: 'Fighting for American Values',
          subtitle: 'John Smith for U.S. Senate',
          ctaText: 'Join Our Movement',
          ctaLink: '#',
        },
      },
      {
        id: 'text-demo',
        type: 'text',
        order: 1,
        props: {
          content: '<h2 class="text-3xl font-bold mb-4">Trusted by thousands of conservative Americans</h2><p>From Main Street to Capitol Hill, we are building a movement for common-sense conservative values.</p>',
          alignment: 'center',
          fontSize: 'lg',
        },
      },
      {
        id: 'gallery-demo',
        type: 'gallery',
        order: 2,
        props: {
          title: 'Our Conservative Priorities',
          images: [
            { url: 'https://images.unsplash.com/photo-1509715513011-e394f0cb20c4?w=400', alt: 'American Flag' },
            { url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400', alt: 'Community' },
            { url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400', alt: 'Leadership' },
          ],
          columns: 3,
        },
      },
      {
        id: 'about-demo',
        type: 'about',
        order: 3,
        props: {
          candidateName: 'Senator John Smith',
          candidateTitle: 'Candidate for U.S. Senate',
          bio: 'A lifelong conservative and dedicated public servant with over 20 years of experience fighting for American values.\n\nJohn has worked tirelessly to defend freedom, protect our constitutional rights, and ensure prosperity for all Americans.',
          imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600',
          flagEmoji: true,
        },
      },
      {
        id: 'volunteer-demo',
        type: 'volunteer-form',
        order: 4,
        props: {
          title: 'Join Our Team',
          description: 'Help us make a difference. Sign up to volunteer for our campaign.',
          buttonText: 'Sign Me Up',
          backgroundColor: '#f3f4f6',
        },
      },
      {
        id: 'cta-demo',
        type: 'cta',
        order: 5,
        props: {
          heading: 'Donate to Our Campaign',
          description: 'Every contribution helps us fight for conservative values',
          buttonText: 'Donate Now',
          buttonLink: '#donate',
          backgroundColor: '#DC2626',
        },
      },
      {
        id: 'footer-demo',
        type: 'footer',
        order: 6,
        props: {
          companyName: 'Smith for Senate',
          tagline: 'Fighting for American Values',
          links: [
            { title: 'About', url: '#about' },
            { title: 'Volunteer', url: '#volunteer' },
            { title: 'Donate', url: '#donate' },
            { title: 'Contact', url: '#contact' },
          ],
          socialLinks: [
            { platform: 'Facebook', url: 'https://facebook.com', icon: 'f' },
            { platform: 'Twitter/X', url: 'https://twitter.com', icon: '𝕏' },
          ],
        },
      },
      {
        id: 'disclaimer-demo',
        type: 'disclaimer',
        order: 7,
        props: {
          paidForBy: 'Smith for Senate Committee',
          pacId: 'C00789456',
          textColor: '#6b7280',
          backgroundColor: '#f9fafb',
        },
      },
    ],
    theme: {
      colors: {
        primary: '#DC2626',
        secondary: '#1D4ED8',
        background: '#ffffff',
        text: '#1f2937',
        accent: '#F59E0B',
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      mode: 'light',
    },
  };

  const { data, error } = await supabase
    .from('pages')
    .insert(demoSite)
    .select()
    .single();

  if (error) {
    console.error('Error creating demo site:', error);
    throw error;
  }

  console.log('✅ Demo political site created successfully!');
  console.log('Site ID:', data.id);
  console.log('Site Name:', data.name);

  return data;
}

createDemoSite()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create demo site:', error);
    process.exit(1);
  });
