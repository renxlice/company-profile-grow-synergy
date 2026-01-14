/**
 * Content Automation API Routes
 * Automatically generates and publishes fresh content
 */

const express = require('express');
const router = express.Router();
const ContentFreshnessManager = require('../utils/content-freshness');
const BacklinkGenerator = require('../utils/backlink-generator');

const contentManager = new ContentFreshnessManager();
const backlinkGenerator = new BacklinkGenerator();

// Auto-generate blog content
router.post('/generate-blog', async (req, res) => {
    try {
        const { topic, type = 'blog', frequency = 'weekly' } = req.body;
        
        // Generate content based on topic
        const content = contentManager.createAutoContent([topic], frequency);
        
        // Generate SEO-optimized HTML
        const generatedContent = contentManager.generateContentTemplate(type, content[0].idea, {
            author: 'Grow Synergy Team',
            authorUrl: 'https://growsynergy.id/about',
            readTime: Math.ceil(Math.random() * 5 + 3)
        });

        res.json({
            success: true,
            content: generatedContent,
            scheduledDate: content[0].scheduledDate,
            seo: generatedContent.seo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate trending content calendar
router.get('/content-calendar', (req, res) => {
    try {
        const calendar = contentManager.scheduleContent();
        const freshnessScore = contentManager.updateFreshnessScore();
        
        res.json({
            success: true,
            calendar: calendar,
            freshnessScore: freshnessScore,
            recommendations: freshnessScore.recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Auto-publish content (for scheduled publishing)
router.post('/publish-content', async (req, res) => {
    try {
        const { contentId, publishDate } = req.body;
        
        // Logic to publish content to database
        // This would integrate with your CMS or database
        
        // Generate backlink opportunities
        const backlinks = backlinkGenerator.generateBacklinkPlan();
        
        // Update freshness score
        const freshnessScore = contentManager.updateFreshnessScore();
        
        res.json({
            success: true,
            published: true,
            contentId: contentId,
            publishDate: publishDate,
            backlinkOpportunities: backlinks,
            freshnessScore: freshnessScore
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate backlink outreach templates
router.get('/backlink-templates', (req, res) => {
    try {
        const templates = {};
        
        // Generate templates for different blog types
        contentManager.techBlogs.forEach(blog => {
            templates[blog.name] = {
                guestPost: backlinkGenerator.generateBacklinkContent('guestPost', blog),
                partnership: backlinkGenerator.createPartnershipProposal(blog)
            };
        });
        
        res.json({
            success: true,
            templates: templates,
            totalOpportunities: Object.keys(templates).length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate trending topics
router.get('/trending-topics', (req, res) => {
    try {
        const topics = contentManager.getTrendingTopics();
        
        res.json({
            success: true,
            topics: topics,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
