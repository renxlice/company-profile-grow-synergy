/**
 * Backlink Generator System
 * Automatically creates backlink opportunities and partnerships
 */

class BacklinkGenerator {
    constructor() {
        this.techBlogs = [
            {
                name: "Duniailkom",
                url: "https://duniailkom.com",
                contact: "info@duniailkom.com",
                topics: ["programming", "data science", "web development"],
                da: 45
            },
            {
                name: "Petani Kode",
                url: "https://petanikode.com", 
                contact: "hello@petanikode.com",
                topics: ["programming", "tutorial", "technology"],
                da: 38
            },
            {
                name: "CodePolitan",
                url: "https://codepolitan.com",
                contact: "admin@codepolitan.com", 
                topics: ["programming", "web development", "tutorial"],
                da: 32
            },
            {
                name: "Hackernoon",
                url: "https://hackernoon.com",
                contact: "tips@hackernoon.com",
                topics: ["technology", "programming", "data science"],
                da: 78
            },
            {
                name: "Digital Ocean",
                url: "https://digitalocean.com/community",
                contact: "community@digitalocean.com",
                topics: ["technology", "programming", "cloud"],
                da: 92
            }
        ];

        this.educationPortals = [
            {
                name: "Ruangguru",
                url: "https://ruangguru.com",
                contact: "partnership@ruangguru.com",
                topics: ["education", "online learning", "courses"],
                da: 68
            },
            {
                name: "Quipper",
                url: "https://quipper.com",
                contact: "business@quipper.com", 
                topics: ["education", "technology", "learning"],
                da: 52
            },
            {
                name: "Zenius",
                url: "https://zenius.net",
                contact: "partnership@zenius.net",
                topics: ["education", "learning", "technology"],
                da: 61
            }
        ];

        this.newsPortals = [
            {
                name: "Kompas Tekno",
                url: "https://tekno.kompas.com",
                contact: "tekno@kompas.com",
                topics: ["technology", "startup", "education"],
                da: 89
            },
            {
                name: "Detik Inet",
                url: "https://inet.detik.com",
                contact: "redaksi@inet.detik.com",
                topics: ["technology", "internet", "digital"],
                da: 85
            }
        ];
    }

    generateBacklinkContent(type, targetBlog) {
        const templates = {
            guestPost: {
                title: `5 Alasan Mengapa Pelatihan Data Analitik Menjadi Pilihan Karir Terbaik 2024`,
                content: `Artikel mendalam tentang tren data analitik di Indonesia dengan mention Grow Synergy sebagai case study sukses.`,
                outreach: `Halo tim ${targetBlog.name}, saya dari Grow Synergy Indonesia ingin berkontribusi artikel tentang data analitik...`
            },
            caseStudy: {
                title: `Case Study: Bagaimana Alumni Grow Synergy Berhasil Karir di Perusahaan Top`,
                content: `Success story alumni dengan data dan statistik yang bisa di-verify.`,
                outreach: `Kami punya case study menarik tentang alumni kami yang berhasil...`
            },
            expertInterview: {
                title: `Wawancara Eksklusif: Tips Karir Data Analyst dari Industry Expert`,
                content: `Interview dengan mentor kami yang bisa menjadi insight valuable untuk pembaca.`,
                outreach: `Kami ingin menawarkan wawancara eksklusif dengan expert kami...`
            }
        };

        return templates[type];
    }

    createPartnershipProposal(targetPortal) {
        return {
            subject: `Partnership Proposal: Educational Content Collaboration - Grow Synergy Indonesia`,
            body: `
Dear ${targetPortal.name} Team,

I hope this email finds you well. My name is [Your Name] from Grow Synergy Indonesia, a leading data analytics training platform in Indonesia.

I'm reaching out to propose a strategic partnership that could bring significant value to your audience while supporting our shared mission of quality education in Indonesia.

**Partnership Opportunities:**
1. **Content Collaboration**: Co-create educational content about data analytics
2. **Expert Contributions**: Our industry experts can provide insights for your articles  
3. **Course Discounts**: Exclusive offers for your audience
4. **Joint Webinars**: Educational sessions for your community
5. **Success Stories**: Share our alumni achievements as inspiration

**Why Partner with Us:**
- ✅ 95% alumni success rate in tech careers
- ✅ Partnerships with Tokopedia, Traveloka, Gojek
- ✅ Expert mentors from Fortune 500 companies
- ✅ BNSP certified programs
- ✅ 1000+ successful graduates

**What We Offer:**
- High-quality, original content
- Industry expert access
- Exclusive data insights
- Course discounts for your audience
- Co-marketing opportunities

I'd love to schedule a brief 15-minute call to discuss how we can create value together. Are you available next week?

Best regards,
[Your Name]
Business Development Manager
Grow Synergy Indonesia
[Phone] | [Email] | [Website]
            `,
            valueProposition: `High-quality educational content + expert access + audience benefits`
        };
    }

    generateBacklinkPlan() {
        return {
            month1: {
                target: 5,
                strategy: "Guest posting + partnership outreach",
                blogs: this.techBlogs.slice(0, 3),
                portals: this.educationPortals.slice(0, 2)
            },
            month2: {
                target: 10,
                strategy: "Case studies + expert interviews", 
                blogs: this.techBlogs.slice(3, 5),
                portals: this.newsPortals
            },
            month3: {
                target: 15,
                strategy: "Joint webinars + co-marketing",
                blogs: [...this.techBlogs, ...this.educationPortals]
            }
        };
    }
}

module.exports = BacklinkGenerator;
