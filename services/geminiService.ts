import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ImageCopy } from "../types";

const SYSTEM_INSTRUCTION = `
# NDTV Profit Social Content Engine v4.3

## ROLE
You are the Social Content Director for NDTV Profit. You transform breaking business news into platform-optimized content that drives massive reach while maintaining journalistic rigor.

## CORE MISSION
Evaluate incoming stories, then CREATE ready-to-publish social content for:
- Twitter (X)
- LinkedIn
- Instagram & Facebook
- Telegram & Whatsapp

## PHASE 1: VIRALITY SCORING (0-100 TOTAL)
Score dimensions (0-10): IMPACT, EMOTIONAL TRIGGER, THUMB-STOP POWER, SHAREABILITY, PROXIMITY, TIMELINESS, VISUAL PUNCH, CONTROVERSY, UTILITY, HOOK STRENGTH.

VERDICTS: 80-100: PRIORITY | 60-79: PUBLISH | 40-59: STORIES ONLY | 0-39: SKIP.

## CONTENT RESTRICTIONS & RECOMMENDATION LOGIC:
- You are strictly analyzing BUSINESS, FINANCIAL, and STOCK MARKET intelligence. 
- NEVER suggest off-topic domains like nightlife, lifestyle, or anything taboo. 
- Your follow-up suggestions and analyses MUST be identical and fully deterministic given the same inputs.


## PHASE 2: CONTENT FORMAT & PLATFORM STRATEGY
### UNIVERSAL FORMAT: ONE IMAGE
The image design (Title + Subtitle) is IDENTICAL across all social platforms. 
The headline MUST be a punchy, capitalized news headline (e.g. "ADANI GROWTH STOCKS DAILY").
Provide 3-4 highly dense data points or key takeaways in the 'bullets' array.
DO NOT INCLUDE the word "image" in your output for image copy.

#### CAPTION STRATEGIES:

**1. TWITTER (X)**
- **Style**: Punchy, news-heavy, urgent. 
- **Structure**: News peg (Who + What + Why) + Impact/Data Point. 
- **Constraint**: Max 280 characters. No fluff. 
- **Hashtags**: 2-3 max.

**2. LINKEDIN**
- **Style**: Professional, analytical, authoritative.
- **Structure**: Hook line -> Spacer -> Setup -> Spacer -> Details -> Spacer -> Bulleted Breakdown -> Spacer -> Takeaway -> Engagement Question.
- **Length**: 150-250 words.

**3. INSTAGRAM & FACEBOOK (Combined)**
- **Rule**: Use the EXACT SAME caption for both platforms. 
- **Structure**: 
  - Part 1: THE LEAD (20-40 words, news peg + attribution).
  - Part 2: THE CONTEXT (60-120 words, specific data + quotes).
  - Part 3: ENGAGEMENT QUESTION (8-15 words).
- **Hashtags**: 5-7 total.

**4. TELEGRAM & WHATSAPP (Combined)**
- **Style**: Direct, broadcast-friendly, scannable summary.
- **Structure**: 
  - Bold Headline.
  - 2-3 Scannable bullet points.
  - "Bottom Line" significance.
  - Call to action.
- **Constraint**: No hashtags. 

## EDITORIAL STANDARDS
- **Tone**: Newsroom Wire Service (Reuters/Bloomberg style).
- **Style**: NO emojis, NO editorializing, NO exclamation marks. Use "said" (AP Style).
- **Numbers**: Indian Standard (₹ lakh, ₹ crore).
- **TV Schedule / TV Shed**: If there is no data for the TV shed, or if there is zero data, just write 'No data'. Do NOT make three columns under any circumstance.

OUTPUT: Return valid JSON matching the exact schema requirements for the frontend dashboard.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    platforms: {
      type: Type.OBJECT,
      properties: {
        X: {
          type: Type.OBJECT,
          properties: { platform: { type: Type.STRING }, postCopy: { type: Type.STRING }, score: { type: Type.NUMBER } },
          required: ["platform", "postCopy", "score"]
        },
        FacebookInstagram: {
          type: Type.OBJECT,
          properties: { platform: { type: Type.STRING }, postCopy: { type: Type.STRING }, score: { type: Type.NUMBER } },
          required: ["platform", "postCopy", "score"]
        },
        LinkedIn: {
          type: Type.OBJECT,
          properties: { platform: { type: Type.STRING }, postCopy: { type: Type.STRING }, score: { type: Type.NUMBER } },
          required: ["platform", "postCopy", "score"]
        },
        WhatsApp: {
          type: Type.OBJECT,
          properties: { platform: { type: Type.STRING }, postCopy: { type: Type.STRING }, score: { type: Type.NUMBER } },
          required: ["platform", "postCopy", "score"]
        },
        Telegram: {
          type: Type.OBJECT,
          properties: { platform: { type: Type.STRING }, postCopy: { type: Type.STRING }, score: { type: Type.NUMBER } },
          required: ["platform", "postCopy", "score"]
        },
        YouTube: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, thumbnailText: { type: Type.STRING } },
        }
      },
      required: ["X", "FacebookInstagram", "LinkedIn", "WhatsApp", "Telegram"]
    },
    imageCopy: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        subtext: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["headline", "subtext", "bullets"]
    },
    storyTreatment: {
      type: Type.OBJECT,
      properties: {
        angle: { type: Type.STRING },
        followUpSuggestions: { type: Type.STRING }
      },
      required: ["angle", "followUpSuggestions"]
    },
    jacketText: { type: Type.STRING },
    followUpContentAllPlatforms: { type: Type.STRING }
  },
  required: ["platforms", "imageCopy", "storyTreatment", "jacketText", "followUpContentAllPlatforms"]
};

export const analyzeContent = async (input: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined' || process.env.API_KEY.length === 0) {
    console.warn("API Key is missing or invalid. Returning fallback mock data.");
    return generateFallbackMock(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "models/gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `INPUT TEXT FOR PROCESSING:\n\n${input}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.0,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response.");

    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis failed:", error?.message || error);
    throw new Error(error.message || "Failed to generate AI content.");
  }
};

const generateFallbackMock = async (input: string): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    platforms: {
      X: {
        platform: 'X',
        postCopy: "BREAKING: Market momentum shifts as tech stocks pull back today.\n\nInflation data remains sticky. What this means for your portfolio:\n\n#NDTVProfit #MarketsToday",
        score: 82
      },
      FacebookInstagram: {
        platform: 'FacebookInstagram',
        postCopy: "The market landscape is shifting rapidly today.\n\nFollowing the recent earnings reports, we are seeing a significant realignment in tech equities. Inflation numbers released this morning suggest rate cuts might be further off.\n\nSwipe for the breakdown.\n\nHow are you adjusting your holdings? 👇",
        score: 88
      },
      LinkedIn: {
        platform: 'LinkedIn',
        postCopy: "Earnings highlight a critical divergence in sector performance.\n\nWhile traditional defensive stocks are holding ground, tech valuations are processing under the weight of sustained interest rates.\n\nKey takeaways:\n• Inflation proving stickier\n• Tech sector facing highest multiple contraction\n• Institutional money flowing into value/dividend plays\n\nAre we witnessing a long-term sector rotation? Thoughts in the comments.",
        score: 94
      },
      WhatsApp: {
        platform: 'WhatsApp',
        postCopy: "*MARKET UPDATE: Tech Stocks Take a Hit*\n\n• Earnings miss expectations.\n• Inflation data delays expected rate cuts.\n• Shift towards defensive stocks.\n\n*Bottom Line:* Volatility expected to continue through the week.\n\nTap the link below for the full analysis.",
        score: 75
      },
      Telegram: {
        platform: 'Telegram',
        postCopy: "🚨 **MARKET ALERT**\n\nTech sector facing heavy selloff today. Sticky inflation data is the primary driver.\n\n📌 **Key Action:** Analysts suggest rotating to value stocks in the near term.\n\nRead the full report on NDTV Profit.",
        score: 78
      },
      YouTube: {
        title: "Why Tech Stocks Are Pulling Back",
        description: "A deep dive into today's market sell-off, analyzing why major tech firms missed estimates.",
        thumbnailText: "TECH CRASH"
      }
    },
    imageCopy: {
      headline: "Markets React: Tech Sector Under Pressure as Inflation Persists",
      subtext: "Dalal Street feels the heat following global tech selloff."
    },
    storyTreatment: {
      angle: "Focus on the macro-economic factors triggering the tech selloff.",
      followUpSuggestions: "Interview a prominent fund manager in the evening show."
    },
    jacketText: "The unyielding grip of inflation forces a market-wide reality check on tech valuations.",
    followUpContentAllPlatforms: "Tomorrow morning: Share a poll regarding 'Which defensive sector are you buying into?'."
  };
};

export const regenerateSpecificSection = async (input: string, section: 'X' | 'FacebookInstagram' | 'LinkedIn' | 'WhatsApp' | 'Telegram' | 'ImageCopy'): Promise<any> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined' || process.env.API_KEY.length === 0) {
    return section === 'ImageCopy' ? { headline: "NEW HEADLINE", subtext: "New mock subtext for this generation." } : `[MOCK REGENERATED] Content rewritten for ${section}. This offers a fresh business angle.`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let targetInstruction = `You are rewriting the content strictly for: ${section}. Adhere to the same editorial guidelines (Business/Finance strict, AP style, no emojis, NO nightlife/taboo).\n\n`;
  let schema: any;

  if (section === 'ImageCopy') {
    targetInstruction += `Return a punchy, capitalized news headline, subtext, and a list of 3-4 dense data-driven bullets. Do NOT include 'image' word.`;
    schema = { type: Type.OBJECT, properties: { headline: { type: Type.STRING }, subtext: { type: Type.STRING }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["headline", "subtext", "bullets"] };
  } else {
    targetInstruction += `Return ONLY the raw caption text payload for ${section}. Ensure it is different from a typical first-draft, providing a fresh alternate angle. Do not wrap in JSON.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `INPUT TEXT:\n\n${input}` }] }],
      config: {
        systemInstruction: targetInstruction,
        temperature: 0.3,
        ...(schema && { responseMimeType: "application/json", responseSchema: schema })
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response.");

    if (section === 'ImageCopy') {
      return JSON.parse(text) as ImageCopy;
    }
    return text.trim();
  } catch (error: any) {
    console.error("Gemini Regeneration failed:", error);
    throw new Error(error.message || "Failed to regenerate.");
  }
};

export const getAIRecommendation = async (title: string, url: string): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined' || process.env.API_KEY.length === 0) {
    return "YES - High viral potential based on keyword strength.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `ARTICLE TITLE: ${title}\nURL: ${url}` }] }],
      config: {
        systemInstruction: "You are a senior social media editor at NDTV Profit. Analyze the given finance/business news title. Determine if it has high social media potential (viral, clickable, or highly informative). ALWAYS start your response with high-level categorization: '[GO]' for high priority/viral, '[HOLD]' for medium importance, or '[NO]' for low social value stories. Follow with exactly one sentence of justification. Example: '[GO] Directly impacts retail investor sentiment.'",
        temperature: 0.2,
      },
    });

    const text = response.text;
    return text || "YES - Market trending topic.";
  } catch (error) {
    console.error("AI Recommendation failed:", error);
    return "YES - Market momentum indicator.";
  }
};

// Legacy stubs — kept for build compatibility with unused StrategyCard component
export const refineStrategy = async (_: string, __: string, copy: string, ___: string): Promise<string> => copy;
export const regenerateStrategy = async (_: string, __: string, copy: string): Promise<string> => copy;
