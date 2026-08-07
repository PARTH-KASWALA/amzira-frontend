/**
 * Amzira South Indian Lehenga Choli Mock Catalog Data & Fallback Service
 */
(function (global) {
    'use strict';

    const SOUTH_INDIAN_CATEGORIES = [
        {
            id: 'half-saree',
            name: 'Traditional Half Sarees (Langa Voni)',
            slug: 'half-saree',
            description: 'Timeless Kanjeevaram & Tissue silk half sarees with pleated skirts and contrast vonis.',
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            displayOrder: 1,
            isActive: true
        },
        {
            id: 'kanjeevaram-lehenga',
            name: 'Kanjeevaram Silk Lehengas',
            slug: 'kanjeevaram-lehenga',
            description: 'Handwoven pure Kanchipuram silk lehengas with authentic temple borders.',
            imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
            displayOrder: 2,
            isActive: true
        },
        {
            id: 'bridal-lehenga',
            name: 'Bridal Pattu Lehengas',
            slug: 'bridal-lehenga',
            description: 'Opulent South Indian bridal lehengas featuring heavy Zardozi & pure gold zari work.',
            imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
            displayOrder: 3,
            isActive: true
        },
        {
            id: 'tissue-organza',
            name: 'Tissue & Organza Lehengas',
            slug: 'tissue-organza',
            description: 'Lightweight shimmering tissue silk and hand-painted organza lehengas for Sangeet & Reception.',
            imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
            displayOrder: 4,
            isActive: true
        },
        {
            id: 'kids-pattu-pavadai',
            name: 'Kids Pattu Pavadai',
            slug: 'kids-pattu-pavadai',
            description: 'Adorable silk pavadai sets for young girls, crafted with soft cotton silk & zari borders.',
            imageUrl: 'https://images.unsplash.com/photo-1621644860680-d168b37c65b3?auto=format&fit=crop&w=800&q=80',
            displayOrder: 5,
            isActive: true
        }
    ];

    const SOUTH_INDIAN_PRODUCTS = [
        {
            id: 'sil-001',
            name: 'Meenakshi Temple Border Kanjeevaram Silk Half Saree',
            slug: 'meenakshi-temple-border-kanjeevaram-half-saree',
            category: 'half-saree',
            categoryName: 'Traditional Half Sarees',
            price: 24999,
            basePrice: 32999,
            discount: 24,
            mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            images: [
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
            ],
            fabric: 'Pure Kanjeevaram Silk',
            borderType: 'Temple Korvai Border',
            workType: 'Gold Zari Weave & Brocade',
            occasion: 'Half Saree Function (Ritu Kala Samskaram), Wedding',
            colors: [
                { name: 'Kanjivaram Magenta & Gold', hex: '#9A1750' },
                { name: 'Peacock Green & Crimson', hex: '#0B4F6C' }
            ],
            sizes: ['Unstitched', 'S', 'M', 'L', 'XL', 'Custom Stitching'],
            inStock: true,
            badge: 'Bestseller',
            rating: 4.9,
            reviews: 128,
            description: 'Handcrafted in Kanchipuram with pure mulberry silk. Features a pleated magenta lehenga skirt with traditional temple korvai zari borders, paired with an embroidered raw silk blouse and a contrasting tissue voni/dupatta.'
        },
        {
            id: 'sil-002',
            name: 'Rukumani Pure Tissue Silk Shimmering Langa Voni',
            slug: 'rukumani-pure-tissue-silk-shimmering-langa-voni',
            category: 'tissue-organza',
            categoryName: 'Tissue & Organza Lehengas',
            price: 18499,
            basePrice: 22999,
            discount: 19,
            mainImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
            images: [
                'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
            ],
            fabric: 'Golden Tissue Silk & Organza',
            borderType: 'Zari Cutwork Border',
            workType: 'Gota Patti & Sequin Embroidery',
            occasion: 'Engagement, Sangeet, Haldi',
            colors: [
                { name: 'Sun Gold & Mustard', hex: '#D4AF37' },
                { name: 'Pastel Peach', hex: '#FFDAB9' }
            ],
            sizes: ['Unstitched', 'S', 'M', 'L', 'XL', 'Custom Stitching'],
            inStock: true,
            badge: 'Trending',
            rating: 4.8,
            reviews: 94,
            description: 'A radiant golden tissue silk langa voni with lightweight organza dupatta draped effortlessly. Embellished with fine zardozi work along the waist belt (vaddanam) and blouse sleeves.'
        },
        {
            id: 'sil-003',
            name: 'Valli Royal Red Kanjivaram Bridal Pattu Lehenga Set',
            slug: 'valli-royal-red-kanjivaram-bridal-pattu-lehenga',
            category: 'bridal-lehenga',
            categoryName: 'Bridal Pattu Lehengas',
            price: 45999,
            basePrice: 59999,
            discount: 23,
            mainImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
            images: [
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
            ],
            fabric: 'Heavy Kanjeevaram Mulberry Silk',
            borderType: 'Heavy Peacock Zari Border',
            workType: 'Pure Antique Gold Zardozi & Maggam Work',
            occasion: 'South Indian Wedding, Muhurtham',
            colors: [
                { name: 'Bridal Crimson Red & Antique Gold', hex: '#700018' }
            ],
            sizes: ['Unstitched', 'S', 'M', 'L', 'XL', 'Custom Stitching'],
            inStock: true,
            badge: 'Bridal Choice',
            rating: 5.0,
            reviews: 156,
            description: 'Designed for the regal South Indian bride. Woven with heavy 3-ply Kanchipuram silk thread, carrying intricate peacock motifs, temple towers (gopuram), and hand-stitched maggam work blouse.'
        },
        {
            id: 'sil-004',
            name: 'Kamala Emerald & Yellow Brocade Langa Voni Set',
            slug: 'kamala-emerald-yellow-brocade-langa-voni',
            category: 'half-saree',
            categoryName: 'Traditional Half Sarees',
            price: 15999,
            basePrice: 19999,
            discount: 20,
            mainImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
            images: [
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
            ],
            fabric: 'Chanderi Silk & Brocade',
            borderType: 'Gota Patti Border',
            workType: 'Jacquard Weave & Thread Work',
            occasion: 'Mehendi, Festival, Family Function',
            colors: [
                { name: 'Emerald Green & Turmeric Yellow', hex: '#1B4D3E' }
            ],
            sizes: ['Unstitched', 'S', 'M', 'L', 'XL', 'Custom Stitching'],
            inStock: true,
            badge: 'Popular',
            rating: 4.7,
            reviews: 62,
            description: 'Vibrant emerald green skirt with broad yellow gold brocade border. Paired with a contrast yellow silk voni and embroidered blouse.'
        },
        {
            id: 'sil-005',
            name: 'Subhadra Handloom Kanchipuram Silk Lehenga',
            slug: 'subhadra-handloom-kanchipuram-silk-lehenga',
            category: 'kanjeevaram-lehenga',
            categoryName: 'Kanjeevaram Silk Lehengas',
            price: 28999,
            basePrice: 34999,
            discount: 17,
            mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            images: [
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
            ],
            fabric: 'Pure Kanchipuram Silk',
            borderType: 'Traditional Annam (Swan) Border',
            workType: 'Handloom Zari Jacquard',
            occasion: 'Reception, Festive Celebrations',
            colors: [
                { name: 'Royal Violet & Antique Gold', hex: '#4B0082' }
            ],
            sizes: ['Unstitched', 'S', 'M', 'L', 'XL', 'Custom Stitching'],
            inStock: true,
            badge: 'Handloom Authentic',
            rating: 4.9,
            reviews: 87,
            description: 'Authentic Silk Mark certified Kanchipuram handloom lehenga. Soft silk lining inside with dense gold zari weave all over.'
        },
        {
            id: 'sil-006',
            name: 'Sri Valli Girls Traditional Pattu Pavadai Set',
            slug: 'sri-valli-girls-traditional-pattu-pavadai',
            category: 'kids-pattu-pavadai',
            categoryName: 'Kids Pattu Pavadai',
            price: 6499,
            basePrice: 7999,
            discount: 18,
            mainImage: 'https://images.unsplash.com/photo-1621644860680-d168b37c65b3?auto=format&fit=crop&w=800&q=80',
            images: [
                'https://images.unsplash.com/photo-1621644860680-d168b37c65b3?auto=format&fit=crop&w=800&q=80'
            ],
            fabric: 'Soft Cotton Silk & Zari',
            borderType: 'Traditional Zari Border',
            workType: 'Brocade & Soft Lining',
            occasion: 'Festivals, Puja, Weddings',
            colors: [
                { name: 'Rani Pink & Gold', hex: '#FF007F' },
                { name: 'Mango Yellow & Green', hex: '#FFC800' }
            ],
            sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y'],
            inStock: true,
            badge: 'Kids Favorite',
            rating: 4.9,
            reviews: 142,
            description: 'Comfortable, kid-friendly pure soft silk pavadai with cotton inner lining. Stitched ready to wear for family celebrations.'
        }
    ];

    global.AMZIRA_MOCK_DATA = {
        categories: SOUTH_INDIAN_CATEGORIES,
        products: SOUTH_INDIAN_PRODUCTS,
        getProductsByCategory: function (categorySlug) {
            if (!categorySlug || categorySlug === 'all' || categorySlug === 'women') {
                return SOUTH_INDIAN_PRODUCTS;
            }
            return SOUTH_INDIAN_PRODUCTS.filter(p => p.category === categorySlug);
        },
        getProductBySlugOrId: function (identifier) {
            if (!identifier) return SOUTH_INDIAN_PRODUCTS[0];
            return SOUTH_INDIAN_PRODUCTS.find(p => p.slug === identifier || p.id === identifier) || SOUTH_INDIAN_PRODUCTS[0];
        }
    };
})(typeof window !== 'undefined' ? window : this);
