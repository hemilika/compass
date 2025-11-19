import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { WeeklyContributor, ChallengeData } from './types/culture-builder.types';

@Injectable()
export class CultureAiService {
    private readonly logger = new Logger(CultureAiService.name);
    private readonly llm: ChatOpenAI;

    constructor(private readonly configService: ConfigService) {
        this.llm = new ChatOpenAI({
            modelName: this.configService.get('OPENAI_MODEL', 'gpt-5-nano'),
            openAIApiKey: this.configService.get('OPENAI_API_KEY'),
        });
    }

    async generateAppreciationContent(contributors: WeeklyContributor[]): Promise<string> {
        try {
            // Analyze and sort contributors
            const topContributors = this.analyzeContributors(contributors);

            // Generate appreciation post using LLM
            const generatedContent = await this.generateAppreciationPost(topContributors);

            return generatedContent;
        } catch (error) {
            this.logger.error('Failed to generate appreciation content', error);
            return this.getFallbackAppreciationContent(contributors);
        }
    }

    async generateChallengeContent(challengeData: ChallengeData): Promise<string> {
        try {
            const prompt = `Create an engaging community challenge post for Compass platform.

Challenge Type: ${challengeData.type}
Title: ${challengeData.title}
Description: ${challengeData.description}

Requirements:
1. Write in a friendly, motivating tone
2. Clearly explain the challenge and how to participate
3. Include specific goals or metrics if provided
4. Add a call-to-action
5. Use emojis appropriately (🎯 🚀 💪 🌟)
6. Keep it under 500 words
7. Format with markdown for readability

Generate the challenge post content:`;

            const response = await this.llm.invoke(prompt);
            return response.content.toString();
        } catch (error) {
            this.logger.error('Failed to generate challenge content', error);
            return this.getFallbackChallengeContent(challengeData);
        }
    }

    private analyzeContributors(contributors: WeeklyContributor[]): WeeklyContributor[] {
        // Validate and prepare contributor data
        if (!contributors || contributors.length === 0) {
            return [];
        }

        // Sort by total contribution (posts + replies + upvotes)
        const sorted = contributors.sort((a, b) => {
            const scoreA = a.postCount * 2 + a.replyCount + a.totalUpvotes * 0.5;
            const scoreB = b.postCount * 2 + b.replyCount + b.totalUpvotes * 0.5;
            return scoreB - scoreA;
        });

        return sorted.slice(0, 5); // Top 5
    }

    private async generateAppreciationPost(contributors: WeeklyContributor[]): Promise<string> {
        if (!contributors || contributors.length === 0) {
            throw new Error('No contributors to appreciate');
        }

        const contributorsList = contributors.map((c, idx) => {
            const name = `${c.firstname} ${c.lastname}`.trim() || c.email;
            const bu = c.buName ? ` (${c.buName})` : '';
            return `${idx + 1}. **${name}**${bu} - ${c.postCount} posts, ${c.replyCount} replies, ${c.totalUpvotes} upvotes`;
        }).join('\n');

        const topPost = contributors[0]?.topPost;
        const topPostHighlight = topPost
            ? `\n\n🏆 **Spotlight:** <a href="/posts/${topPost.id}" class="post-link" data-post-id="${topPost.id}">${topPost.title}</a> by ${contributors[0].firstname} received ${topPost.upvotes} upvotes!`
            : '';

        const prompt = `Create a warm, appreciative weekly recognition post for our internal community platform.

Top Contributors This Week:
${contributorsList}
${topPostHighlight}

Requirements:
1. Start with an engaging opening that celebrates the community
2. Recognize the top contributors naturally (don't just list them)
3. Highlight specific achievements (like the top post)
4. Keep it genuine and not overly corporate
5. Include relevant emojis (🌟 🎉 👏 🚀 💪)
6. End with motivation for the upcoming week
7. Keep it under 400 words
8. Use HTML links format for post references
9. Mark this clearly as an AI-generated post with 🤖 emoji at the start

Generate the appreciation post:`;

        try {
            const response = await this.llm.invoke(prompt);
            return response.content.toString();
        } catch (error) {
            this.logger.error('LLM generation failed', error);
            return this.getFallbackAppreciationContent(contributors);
        }
    }

    private getFallbackAppreciationContent(contributors: WeeklyContributor[]): string {
        const top3 = contributors.slice(0, 3);
        const names = top3.map(c => `${c.firstname} ${c.lastname}`.trim()).join(', ');

        return `🤖 🌟 **Weekly Recognition**

This week was amazing! Big shoutout to our top contributors: ${names}.

Together, our community created ${contributors.reduce((sum, c) => sum + c.postCount, 0)} posts and ${contributors.reduce((sum, c) => sum + c.replyCount, 0)} helpful replies.

Thank you for making Compass a vibrant place to share knowledge and connect!

Let's keep the momentum going next week! 🚀

_This is an AI-generated appreciation thread based on community activity._`;
    }

    private getFallbackChallengeContent(challengeData: ChallengeData): string {
        return `🤖 🎯 **${challengeData.title}**

${challengeData.description}

**How to participate:**
Join this thread and share your thoughts, experiences, or questions related to this challenge!

Let's grow together as a community! 💪

_This is an AI-generated challenge post._`;
    }
}
