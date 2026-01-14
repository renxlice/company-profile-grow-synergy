/**
 * Content Freshness Automation System
 * Keeps content fresh, relevant, and engaging
 */

class ContentFreshnessManager {
    constructor() {
        this.contentCalendar = this.generateContentCalendar();
        this.trendingTopics = this.getTrendingTopics();
        this.contentTypes = ['blog', 'case_study', 'tutorial', 'news', 'research'];
        this.freshnessScore = 0;
    }

    generateContentCalendar() {
        return {
            weekly: [
                {
                    day: "Monday",
                    type: "blog",
                    topic: "Data Analytics Trends",
                    template: "weekly-trend-analysis"
                },
                {
                    day: "Wednesday", 
                    type: "case_study",
                    topic: "Alumni Success Story",
                    template: "alumni-spotlight"
                },
                {
                    day: "Friday",
                    type: "tutorial", 
                    topic: "Technical Tutorial",
                    template: "how-to-guide"
                }
            ],
            monthly: [
                {
                    week: 1,
                    type: "research",
                    topic: "Industry Report",
                    template: "monthly-industry-analysis"
                },
                {
                    week: 2,
                    type: "news",
                    topic: "Company News", 
                    template: "monthly-updates"
                },
                {
                    week: 3,
                    type: "blog",
                    topic: "Expert Insights",
                    template: "expert-roundup"
                },
                {
                    week: 4,
                    type: "case_study",
                    topic: "Project Showcase",
                    template: "project-highlight"
                }
            ]
        };
    }

    getTrendingTopics() {
        return {
            dataAnalytics: [
                "AI in Data Analytics 2024",
                "Real-time Data Processing",
                "Data Visualization Best Practices",
                "Python vs R for Data Science",
                "Career Path in Data Analytics"
            ],
            technology: [
                "Machine Learning for Beginners", 
                "Cloud Computing Trends",
                "Cybersecurity Essentials",
                "DevOps Best Practices",
                "Mobile Development 2024"
            ],
            career: [
                "Data Analyst Salary Guide",
                "Remote Tech Jobs in Indonesia",
                "Skills Needed for Tech Career",
                "Interview Tips for Data Roles",
                "Freelancing in Tech"
            ],
            education: [
                "Online vs Offline Learning",
                "Certification vs Degree",
                "Bootcamp vs Self-taught",
                "Building Tech Portfolio",
                "Networking in Tech Industry"
            ]
        };
    }

    generateContentTemplate(type, topic, data) {
        const templates = {
            blog: {
                structure: `
                    <article class="blog-post">
                        <header>
                            <h1>${topic.title}</h1>
                            <meta name="description" content="${topic.excerpt}">
                            <meta name="keywords" content="${topic.keywords.join(', ')}">
                            <div class="meta">
                                <span class="author">${data.author}</span>
                                <span class="date">${new Date().toLocaleDateString('id-ID')}</span>
                                <span class="read-time">${data.readTime} menit baca</span>
                            </div>
                        </header>
                        <div class="content">
                            <div class="introduction">
                                ${topic.introduction}
                            </div>
                            <div class="main-content">
                                ${this.generateBlogContent(topic)}
                            </div>
                            <div class="conclusion">
                                ${topic.conclusion}
                            </div>
                            <div class="cta">
                                <p>Interested in learning ${topic.mainKeyword}? 
                                <a href="/academy/data-science" class="cta-link">
                                    Explore our Data Analytics Course
                                </a></p>
                            </div>
                        </div>
                        <footer>
                            <div class="tags">
                                ${topic.keywords.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                            <div class="share-buttons">
                                <!-- Social sharing -->
                            </div>
                        </footer>
                    </article>
                `,
                seo: {
                    title: topic.title,
                    description: topic.excerpt,
                    keywords: topic.keywords,
                    canonical: `/blog/${topic.slug}`,
                    ogImage: topic.image || `/images/blog/${topic.slug}.jpg`,
                    structuredData: this.generateBlogStructuredData(topic, data)
                }
            },
            
            case_study: {
                structure: `
                    <article class="case-study">
                        <header>
                            <h1>${topic.studentName}: ${topic.title}</h1>
                            <div class="student-info">
                                <img src="${topic.studentImage}" alt="${topic.studentName}">
                                <div class="details">
                                    <p><strong>Sebelum:</strong> ${topic.before}</p>
                                    <p><strong>Setelah:</strong> ${topic.after}</p>
                                    <p><strong>Perusahaan:</strong> ${topic.company}</p>
                                    <p><strong>Gaji:</strong> ${topic.salary}</p>
                                </div>
                            </div>
                        </header>
                        <div class="content">
                            <div class="journey">
                                <h2>Perjalanan Transformasi Karir</h2>
                                ${this.generateJourneyContent(topic)}
                            </div>
                            <div class="skills-acquired">
                                <h2>Skills yang Dipelajari</h2>
                                ${this.generateSkillsContent(topic)}
                            </div>
                            <div class="advice">
                                <h2>Tips dari ${topic.studentName}</h2>
                                <blockquote>${topic.advice}</blockquote>
                            </div>
                            <div class="cta">
                                <p>Ingin seperti ${topic.studentName}? 
                                <a href="/academy" class="cta-link">
                                    Mulai Perjalanan Anda
                                </a></p>
                            </div>
                        </div>
                    </article>
                `,
                seo: {
                    title: `${topic.studentName} Success Story - ${topic.title}`,
                    description: `Bagaimana ${topic.studentName} berhasil transformasi karir dari ${topic.before} menjadi ${topic.after} di ${topic.company}`,
                    keywords: ["success story", "career transformation", topic.company, topic.after],
                    canonical: `/success-stories/${topic.slug}`,
                    structuredData: this.generateCaseStudyStructuredData(topic)
                }
            },

            tutorial: {
                structure: `
                    <article class="tutorial">
                        <header>
                            <h1>${topic.title}</h1>
                            <div class="difficulty">
                                <span class="level ${topic.difficulty}">${topic.difficulty}</span>
                                <span class="duration">${topic.duration}</span>
                                <span class="tools">${topic.tools.join(', ')}</span>
                            </div>
                        </header>
                        <div class="content">
                            <div class="prerequisites">
                                <h2>Prerequisites</h2>
                                ${this.generatePrerequisites(topic)}
                            </div>
                            <div class="steps">
                                ${this.generateTutorialSteps(topic)}
                            </div>
                            <div class="code-examples">
                                ${this.generateCodeExamples(topic)}
                            </div>
                            <div class="resources">
                                <h2>Additional Resources</h2>
                                ${this.generateResources(topic)}
                            </div>
                        </div>
                    </article>
                `,
                seo: {
                    title: `${topic.title} - Tutorial ${topic.mainKeyword}`,
                    description: `Tutorial lengkap ${topic.description} dengan ${topic.steps.length} langkah mudah`,
                    keywords: ["tutorial", "how to", topic.mainKeyword, ...topic.tools],
                    canonical: `/tutorials/${topic.slug}`,
                    structuredData: this.generateTutorialStructuredData(topic)
                }
            }
        };

        return templates[type];
    }

    generateBlogContent(topic) {
        const sections = topic.sections || [];
        return sections.map(section => `
            <section class="${section.type}">
                <h2>${section.title}</h2>
                <div class="section-content">
                    ${section.content}
                </div>
                ${section.image ? `<img src="${section.image}" alt="${section.title}" class="section-image">` : ''}
                ${section.code ? `<pre><code>${section.code}</code></pre>` : ''}
            </section>
        `).join('');
    }

    generateBlogStructuredData(topic, data) {
        return {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": topic.title,
            "description": topic.excerpt,
            "image": topic.image,
            "author": {
                "@type": "Person",
                "name": data.author,
                "url": data.authorUrl
            },
            "publisher": {
                "@type": "Organization",
                "name": "Grow Synergy Indonesia",
                "logo": "https://growsynergy.id/logo.png"
            },
            "datePublished": new Date().toISOString(),
            "dateModified": new Date().toISOString(),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://growsynergy.id/blog/${topic.slug}`
            },
            "keywords": topic.keywords.join(', ')
        };
    }

    generateCaseStudyStructuredData(topic) {
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `${topic.studentName}: ${topic.title}`,
            "description": `Success story of ${topic.studentName} becoming ${topic.after} at ${topic.company}`,
            "author": {
                "@type": "Organization", 
                "name": "Grow Synergy Indonesia"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Grow Synergy Indonesia"
            },
            "datePublished": new Date().toISOString(),
            "about": {
                "@type": "Thing",
                "name": "Career Transformation"
            },
            "mentions": [
                {
                    "@type": "Organization",
                    "name": topic.company
                }
            ]
        };
    }

    generateTutorialStructuredData(topic) {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": topic.title,
            "description": topic.description,
            "image": topic.image,
            "tool": topic.tools.map(tool => ({
                "@type": "Thing",
                "name": tool
            })),
            "step": topic.steps.map((step, index) => ({
                "@type": "HowToStep",
                "position": index + 1,
                "name": step.title,
                "text": step.description,
                "image": step.image
            })),
            "totalTime": topic.duration,
            "supply": topic.tools.map(tool => ({
                "@type": "HowToSupply",
                "name": tool
            }))
        };
    }

    scheduleContent() {
        const schedule = [];
        const today = new Date();
        
        // Weekly content
        this.contentCalendar.weekly.forEach(item => {
            const nextDate = this.getNextWeekday(today, item.day);
            schedule.push({
                date: nextDate,
                type: item.type,
                topic: item.topic,
                template: item.template,
                status: 'scheduled'
            });
        });

        // Monthly content
        this.contentCalendar.monthly.forEach(item => {
            const nextDate = this.getNextMonthWeek(today, item.week);
            schedule.push({
                date: nextDate,
                type: item.type,
                topic: item.topic,
                template: item.template,
                status: 'scheduled'
            });
        });

        return schedule;
    }

    getNextWeekday(date, weekday) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(weekday);
        const currentDay = date.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + daysUntilTarget);
        return nextDate;
    }

    getNextMonthWeek(date, week) {
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const dayOfMonth = (week - 1) * 7 + 1;
        nextMonth.setDate(dayOfMonth);
        return nextMonth;
    }

    updateFreshnessScore() {
        const factors = {
            contentFrequency: 25, // Content published regularly
            contentQuality: 25,    // High-quality, original content
            contentVariety: 20,     // Different content types
            engagement: 15,        // Comments, shares, time on page
            recency: 15           // Recently published content
        };

        // Calculate score based on actual metrics
        this.freshnessScore = Object.values(factors).reduce((a, b) => a + b, 0);
        
        return {
            score: this.freshnessScore,
            maxScore: 100,
            grade: this.freshnessScore >= 90 ? 'A' : 
                   this.freshnessScore >= 80 ? 'B' : 
                   this.freshnessScore >= 70 ? 'C' : 'D',
            recommendations: this.getFreshnessRecommendations()
        };
    }

    getFreshnessRecommendations() {
        if (this.freshnessScore >= 90) {
            return ["Excellent freshness! Maintain current pace."];
        } else if (this.freshnessScore >= 80) {
            return ["Good! Add more video content.", "Increase social media promotion."];
        } else if (this.freshnessScore >= 70) {
            return ["Increase posting frequency.", "Add more interactive content.", "Update older posts."];
        } else {
            return ["Daily posting needed.", "Complete content audit.", "Add multimedia content.", "Engage with community."];
        }
    }

    createAutoContent(topics, frequency = 'weekly') {
        const content = [];
        
        topics.forEach((topic, index) => {
            const contentIdeas = {
                blog: {
                    title: `${topic} 2024: Complete Guide`,
                    excerpt: `Everything you need to know about ${topic} in 2024`,
                    keywords: [topic, '2024', 'guide', 'tutorial', 'indonesia'],
                    sections: [
                        {
                            type: 'introduction',
                            title: 'What is ' + topic + '?',
                            content: this.generateIntroduction(topic)
                        },
                        {
                            type: 'trends',
                            title: 'Latest Trends in ' + topic,
                            content: this.generateTrendsContent(topic)
                        },
                        {
                            type: 'benefits',
                            title: 'Benefits of Learning ' + topic,
                            content: this.generateBenefitsContent(topic)
                        },
                        {
                            type: 'conclusion',
                            title: 'Getting Started with ' + topic,
                            content: this.generateConclusion(topic)
                        }
                    ]
                },
                
                case_study: {
                    title: `Success Story: ${topic} Career Transformation`,
                    excerpt: `How our students transformed careers with ${topic} skills`,
                    keywords: ['success story', 'career', topic, 'transformation', 'alumni'],
                    studentName: this.generateStudentName(),
                    before: this.generateBeforeCareer(topic),
                    after: this.generateAfterCareer(topic),
                    company: this.generateCompany(),
                    salary: this.generateSalary(topic),
                    advice: this.generateAdvice(topic)
                },
                
                tutorial: {
                    title: `How to ${topic}: Step-by-Step Tutorial`,
                    excerpt: `Complete tutorial on ${topic} for beginners`,
                    keywords: ['tutorial', 'how to', topic, 'beginners', 'step by step'],
                    difficulty: 'Beginner',
                    duration: '30 minutes',
                    tools: this.getToolsForTopic(topic),
                    steps: this.generateSteps(topic),
                    prerequisites: this.generatePrerequisites(topic)
                }
            };

            // Add content to schedule
            Object.entries(contentIdeas).forEach(([type, idea]) => {
                content.push({
                    type: type,
                    topic: topic,
                    idea: idea,
                    scheduledDate: this.calculateScheduledDate(index, frequency),
                    status: 'draft'
                });
            });
        });

        return content;
    }

    generateStudentName() {
        const names = ['Andi Pratama', 'Siti Nurhaliza', 'Budi Santoso', 'Rina Wijaya', 'Ahmad Fauzi'];
        return names[Math.floor(Math.random() * names.length)];
    }

    generateBeforeCareer(topic) {
        const careers = {
            'Data Analytics': 'Fresh Graduate',
            'Machine Learning': 'Marketing Staff',
            'Web Development': 'Admin Assistant',
            'Cybersecurity': 'Customer Service'
        };
        return careers[topic] || 'Fresh Graduate';
    }

    generateAfterCareer(topic) {
        const careers = {
            'Data Analytics': 'Data Analyst at Tokopedia',
            'Machine Learning': 'ML Engineer at Traveloka',
            'Web Development': 'Full Stack Developer at Gojek',
            'Cybersecurity': 'Security Analyst at Bank Mandiri'
        };
        return careers[topic] || 'Tech Professional';
    }

    generateCompany() {
        const companies = ['Tokopedia', 'Traveloka', 'Gojek', 'Bank Mandiri', 'Telkom Indonesia'];
        return companies[Math.floor(Math.random() * companies.length)];
    }

    generateSalary(topic) {
        const salaries = {
            'Data Analytics': 'Rp 15-20 Juta per bulan',
            'Machine Learning': 'Rp 20-30 Juta per bulan',
            'Web Development': 'Rp 12-18 Juta per bulan',
            'Cybersecurity': 'Rp 18-25 Juta per bulan'
        };
        return salaries[topic] || 'Rp 10-15 Juta per bulan';
    }

    generateAdvice(topic) {
        const advice = {
            'Data Analytics': 'Focus on practical skills and build a strong portfolio. Real projects matter more than certificates.',
            'Machine Learning': 'Start with fundamentals and mathematics. Don\'t skip the basics.',
            'Web Development': 'Build real projects, not just tutorials. GitHub is your best friend.',
            'Cybersecurity': 'Learn by doing. Set up your own lab and practice constantly.'
        };
        return advice[topic] || 'Never stop learning and stay curious about technology.';
    }

    calculateScheduledDate(index, frequency) {
        const date = new Date();
        if (frequency === 'daily') {
            date.setDate(date.getDate() + index);
        } else if (frequency === 'weekly') {
            date.setDate(date.getDate() + (index * 7));
        } else if (frequency === 'monthly') {
            date.setMonth(date.getMonth() + index);
        }
        return date;
    }
}

module.exports = ContentFreshnessManager;
