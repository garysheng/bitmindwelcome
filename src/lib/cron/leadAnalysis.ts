import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { BusinessCardSubmissionDB, Identity } from '@/types';

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

interface LeadAnalysis {
  relevanceScore: number; // 0-100
  suggestedIdentities: Identity[];
  analysis: string;
  lastAnalyzed: Timestamp;
}

async function searchPerplexity(prompt: string): Promise<string> {
  try {
    // Step 1: Research the lead
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are a lead analysis expert for BitMind, a company building decentralized Deepfake Detection Systems leveraging the Bittensor Network. 
            When analyzing leads:
            1. If an X (Twitter) handle is provided, research their profile and recent activity to understand their background and interests
            2. Search for any public information about the person and their organization
            3. Analyze their potential fit with BitMind based on:
               - Their background in AI, blockchain, or related technologies
               - Their organization's relevance to deepfake detection
               - Their potential role (investor, developer, etc.)
               - Their influence in relevant communities
            4. Suggest specific collaboration opportunities with BitMind
            5. Assign identity categories (investor, developer, student, founder, potential_partner, other)
            6. Give a relevance score (0-100) based on their potential value to BitMind
            
            Format with clear sections and be specific about why they might be valuable to BitMind.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9
      })
    });

    if (!response.ok) throw new Error('Failed to get Perplexity response');
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('Perplexity search error:', err);
    throw err;
  }
}

async function parseAnalysisResponse(response: string): Promise<LeadAnalysis> {
  try {
    // Use Perplexity to parse the analysis into structured data
    const parseResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `Parse the following lead analysis and return a JSON object with:
            {
              "relevanceScore": number (1-5, rounded to nearest integer),
              "suggestedIdentities": string[] (from: ["investor", "developer", "student", "founder", "potential_partner", "other"]),
              "analysis": string (summary of key points)
            }`
          },
          {
            role: "user",
            content: response
          }
        ],
        temperature: 0.1
      })
    });

    if (!parseResponse.ok) throw new Error('Failed to parse analysis');
    const data = await parseResponse.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      ...parsed,
      lastAnalyzed: Timestamp.now()
    };
  } catch (err) {
    console.error('Analysis parsing error:', err);
    throw err;
  }
}

export async function analyzeLead(lead: BusinessCardSubmissionDB & { id: string }) {
  try {
    // Construct the research prompt
    const prompt = `
      Analyze this potential lead for BitMind:
      Name: ${lead.name || 'Unknown'}
      Email: ${lead.email}
      Organization: ${lead.organization || 'Unknown'}
      X Handle: ${lead.xHandle || 'None provided'}
      Note: ${lead.note || 'No notes provided'}

      ${lead.xHandle ? `Please research their X profile at ${lead.xHandle} and include insights from their recent activity and public information.` : ''}
      
      Based on this information and your research, provide a comprehensive analysis of their potential value to BitMind.
    `;

    // Get Perplexity analysis
    const analysisResponse = await searchPerplexity(prompt);
    
    // Parse the analysis into structured data
    const analysis = await parseAnalysisResponse(analysisResponse);

    // Update the lead document with the analysis
    await updateDoc(doc(db, 'leads', lead.id), {
      aiAnalysis: analysis
    });

    return analysis;
  } catch (err) {
    console.error('Lead analysis error:', err);
    throw err;
  }
}

export async function runLeadAnalysisCron() {
  try {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const leadsRef = collection(db, 'leads');
    const q = query(
      leadsRef,
      where('aiAnalysis', '==', null)
      // Add additional query for leads not analyzed in last 24 hours if needed
    );

    const snapshot = await getDocs(q);
    const analysisPromises = snapshot.docs.map(doc => 
      analyzeLead({ id: doc.id, ...doc.data() as BusinessCardSubmissionDB })
    );

    await Promise.all(analysisPromises);
    console.log(`Analyzed ${analysisPromises.length} leads`);
  } catch (err) {
    console.error('Cron job error:', err);
  }
} 