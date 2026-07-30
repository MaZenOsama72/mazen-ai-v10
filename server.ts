import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Server-side Gemini Client Initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Identity instruction for Gemini API requests
const IDENTITY_INSTRUCTION = `
IMPORTANT APPLICATION IDENTITY:
If the user asks who created, developed, programmed, or built you in English or Arabic (e.g., "Who created you?", "Who built you?", "Who programmed you?", "Who developed you?", "مين عملك؟", "مين برمجك؟", "مين مطورك؟", "انت من صنع مين؟"), you MUST answer EXACTLY with the following sentence:
"I am MAZEN AI, a custom AI assistant developed by Eng. Mazen Osama, a third-year Computer Science student at Nahda University."
Do NOT use this identity response for unrelated questions.
`;

// Helper to translate raw errors into clean, friendly error objects
function parseApiError(error: any): { status: number; message: string; type: string } {
  const str = (error?.message || String(error)).toLowerCase();
  const code = error?.status || error?.statusCode || error?.code;

  if (code === 429 || str.includes("429") || str.includes("resource_exhausted") || str.includes("quota")) {
    return {
      status: 429,
      message: "The AI model rate limit or daily quota has been reached. Please wait a moment and try again.",
      type: "RATE_LIMIT",
    };
  }
  if (code === 503 || str.includes("503") || str.includes("unavailable") || str.includes("overloaded")) {
    return {
      status: 503,
      message: "The selected AI model is currently busy or overloaded.",
      type: "OVERLOADED",
    };
  }
  if (code === 504 || str.includes("504") || str.includes("timeout") || str.includes("etimedout")) {
    return {
      status: 504,
      message: "The AI service request timed out.",
      type: "TIMEOUT",
    };
  }
  if (code === 502 || str.includes("502") || str.includes("econnrefused") || str.includes("enotfound")) {
    return {
      status: 502,
      message: "Unable to establish network connection to the AI service.",
      type: "NETWORK_ERROR",
    };
  }
  if (code === 500 || str.includes("500") || str.includes("internal")) {
    return {
      status: 500,
      message: "The AI service encountered an internal server error.",
      type: "SERVER_ERROR",
    };
  }

  return {
    status: 500,
    message: "The AI service is currently unavailable.",
    type: "UNKNOWN_ERROR",
  };
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Multi-provider real web search function (Tavily, Serper, Brave Search, DuckDuckGo, Wikipedia)
async function performRealWebSearch(query: string): Promise<{ results: SearchResult[]; provider: string } | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  // 1. Tavily API (preferred provider)
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: cleanQuery,
          search_depth: "basic",
          include_answer: true,
          max_results: 5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const results: SearchResult[] = (data.results || []).map((r: any) => ({
          title: r.title || r.url,
          url: r.url,
          snippet: r.content || r.snippet || "",
        }));
        if (results.length > 0) {
          return { results, provider: "Tavily API" };
        }
      }
    } catch (e) {
      console.warn("Tavily search error:", e);
    }
  }

  // 2. Serper API
  const serperKey = process.env.SERPER_API_KEY;
  if (serperKey) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: cleanQuery, num: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        const results: SearchResult[] = (data.organic || []).map((r: any) => ({
          title: r.title || r.link,
          url: r.link,
          snippet: r.snippet || "",
        }));
        if (results.length > 0) {
          return { results, provider: "Serper API" };
        }
      }
    } catch (e) {
      console.warn("Serper search error:", e);
    }
  }

  // 3. Brave Search API
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  if (braveKey) {
    try {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(cleanQuery)}&count=5`,
        {
          headers: {
            "Accept": "application/json",
            "X-Subscription-Token": braveKey,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const results: SearchResult[] = (data.web?.results || []).map((r: any) => ({
          title: r.title || r.url,
          url: r.url,
          snippet: r.description || "",
        }));
        if (results.length > 0) {
          return { results, provider: "Brave Search API" };
        }
      }
    } catch (e) {
      console.warn("Brave search error:", e);
    }
  }

  // 4. DuckDuckGo Instant Answer API Fallback
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const results: SearchResult[] = [];

      if (data.AbstractText && data.AbstractURL) {
        results.push({
          title: data.Heading || cleanQuery,
          url: data.AbstractURL,
          snippet: data.AbstractText,
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics) {
          if (topic.Text && topic.FirstURL && results.length < 5) {
            results.push({
              title: topic.Text.slice(0, 60) + "...",
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }

      if (results.length > 0) {
        return { results, provider: "DuckDuckGo Instant Answer" };
      }
    }
  } catch (e) {
    console.warn("DuckDuckGo Instant Answer error:", e);
  }

  // 5. DuckDuckGo HTML Scraper Fallback
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const results: SearchResult[] = [];

      const linkRegex = /<a class="result__url" href="([^"]+)">/g;
      const titleRegex = /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/g;
      const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

      const links: string[] = [];
      const titles: string[] = [];
      const snippets: string[] = [];

      let match;
      while ((match = linkRegex.exec(html)) !== null && links.length < 5) {
        let url = match[1].trim();
        if (url.startsWith("//")) url = "https:" + url;
        if (url.includes("uddg=")) {
          try {
            const params = new URLSearchParams(url.split("?")[1]);
            url = params.get("uddg") || url;
          } catch {
            /* ignore */
          }
        }
        links.push(url);
      }
      while ((match = titleRegex.exec(html)) !== null && titles.length < links.length) {
        titles.push(match[1].replace(/<[^>]+>/g, "").trim());
      }
      while ((match = snippetRegex.exec(html)) !== null && snippets.length < links.length) {
        snippets.push(match[1].replace(/<[^>]+>/g, "").trim());
      }

      for (let i = 0; i < links.length; i++) {
        if (links[i] && !links[i].includes("duckduckgo.com")) {
          results.push({
            title: titles[i] || links[i],
            url: links[i],
            snippet: snippets[i] || "",
          });
        }
      }
      if (results.length > 0) {
        return { results, provider: "Live Web Search" };
      }
    }
  } catch (e) {
    console.warn("DuckDuckGo HTML search error:", e);
  }

  // 6. Wikipedia Knowledge Search Fallback
  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        cleanQuery
      )}&format=json&utf8=1&origin=*`
    );
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      const searchItems = data.query?.search || [];
      const results: SearchResult[] = searchItems.slice(0, 5).map((item: any) => ({
        title: item.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: item.snippet.replace(/<[^>]+>/g, ""),
      }));
      if (results.length > 0) {
        return { results, provider: "Wikipedia Knowledge API" };
      }
    }
  } catch (e) {
    console.warn("Wikipedia fallback error:", e);
  }

  return null;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY });
});

// Dedicated Web Search API Endpoint
app.post("/api/search", async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query string is required." });
  }

  try {
    const searchData = await performRealWebSearch(query);
    if (!searchData || searchData.results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No search results found for the given query.",
        results: [],
      });
    }
    return res.json({
      success: true,
      provider: searchData.provider,
      results: searchData.results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to perform web search." });
  }
});

// Fallback chain for Gemini API models when rate limited or unavailable
function getModelFallbackChain(requestedModel: string): string[] {
  const chain = [
    requestedModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-3.1-pro-preview",
  ];
  return Array.from(new Set(chain.filter(Boolean)));
}

// Streaming Chat Endpoint using Gemini API with Real Web Search Integration
app.post("/api/chat", async (req, res) => {
  const { messages, model, systemInstruction, temperature, maxTokens, webSearchMode } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array provided." });
  }

  try {
    const ai = getGeminiClient();

    // Set SSE headers early
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    let webSearchContextPrompt = "";

    const isGreeting =
      lastUserMessage.trim().length <= 3 ||
      /^(hi|hello|hey|hola|مرحبا|سلام|أهلا|شكرا|thanks|thank you)$/i.test(lastUserMessage.trim());

    // Web Search is ONLY triggered if explicitly activated by the user ('on' / 'always')
    const isSearchRequested =
      webSearchMode === "on" ||
      webSearchMode === "always" ||
      webSearchMode === "true" ||
      webSearchMode === true;

    if (isSearchRequested && lastUserMessage) {
      res.write(`data: ${JSON.stringify({ statusText: "Web Search Active · Searching the web..." })}\n\n`);

      const searchResult = await performRealWebSearch(lastUserMessage);

      if (searchResult && searchResult.results.length > 0) {
        res.write(`data: ${JSON.stringify({ statusText: "Generating response..." })}\n\n`);

        const formattedResults = searchResult.results
          .map(
            (r, idx) =>
              `[Source ${idx + 1}]: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`
          )
          .join("\n\n");

        webSearchContextPrompt = `\n\n### REAL-TIME WEB SEARCH RESULTS (Provider: ${searchResult.provider}):\n${formattedResults}\n\nINSTRUCTIONS FOR RESPONSE:\n- Synthesize the above verified web search results to answer the query accurately.\n- Filter out unverified information.\n- At the end of your response, MUST include a section titled "### 🌐 Sources & References" listing the source URLs with descriptive titles as Markdown links: [Title](URL).`;
      } else {
        res.write(
          `data: ${JSON.stringify({
            statusText: "Generating response...",
            notice: "⚠️ Live web search was unavailable or returned no results. Continuing answer using model knowledge.",
          })}\n\n`
        );
      }
    } else {
      res.write(`data: ${JSON.stringify({ statusText: "Generating response..." })}\n\n`);
    }

    // Map roles: 'assistant' -> 'model', 'user' -> 'user'
    const formattedContents = messages.map((msg: { role: string; content: string }, idx: number) => {
      let mainText = msg.content || "";

      if (idx === messages.length - 1 && msg.role === "user" && webSearchContextPrompt) {
        mainText += webSearchContextPrompt;
      }

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: mainText || "Hello" }],
      };
    });

    // Combine custom identity prompt with skill system instruction & web search rules
    const combinedSystemInstruction = `${IDENTITY_INSTRUCTION}

INTELLIGENT WEB SEARCH & TRUSTED SOURCE MANDATE:
1. When performing web searches or providing real-time/technical info:
   - Filter and prioritize information ONLY from trusted, authoritative sources:
     * Official documentation & company sites (e.g., react.dev, developer.mozilla.org, learn.microsoft.com, cloud.google.com, docs.python.org, nodejs.org)
     * GitHub (github.com)
     * Stack Overflow (stackoverflow.com)
     * MDN Web Docs & W3C (w3.org)
     * Microsoft Learn & Google Documentation
     * Official package registries: npm (npmjs.com), PyPI (pypi.org)
     * Academic portals & peer-reviewed research (arxiv.org, IEEE, Google Scholar)
2. FACT VERIFICATION: Always verify information across multiple trusted sources before answering.
3. TRUTHFULNESS & ZERO HALLUCINATION: Never invent facts. If reliable, verified information cannot be found, explicitly state: "I could not find reliable information regarding [topic]."
4. CITATION REQUIREMENT: When external web information is retrieved, format and attach clear source links at the end of the response under a "### 🌐 Sources & References" section with title and URL (e.g., [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)).
5. SPEED & EFFICIENCY: For standard questions that do not require real-time verification, answer directly from model knowledge without unnecessary searches.

${systemInstruction || ""}`;

    const config: Record<string, unknown> = {
      systemInstruction: combinedSystemInstruction,
    };

    if (typeof temperature === "number") {
      config.temperature = temperature;
    }
    if (typeof maxTokens === "number" && maxTokens > 0) {
      config.maxOutputTokens = maxTokens;
    }

    const primaryModel = model || "gemini-3.6-flash";
    const fallbackChain = getModelFallbackChain(primaryModel);

    let streamSuccess = false;
    let lastError: any = null;

    for (let i = 0; i < fallbackChain.length; i++) {
      const candidateModel = fallbackChain[i];
      try {
        if (i > 0) {
          res.write(
            `data: ${JSON.stringify({
              notice: `Model ${fallbackChain[i - 1]} rate limited. Retrying with ${candidateModel}...`,
            })}\n\n`
          );
        }

        const responseStream = await ai.models.generateContentStream({
          model: candidateModel,
          contents: formattedContents,
          config,
        });

        for await (const chunk of responseStream) {
          try {
            const text = chunk.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          } catch (e) {
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
              const text = chunk.candidates[0].content.parts[0].text;
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }
        }

        streamSuccess = true;
        break;
      } catch (err: any) {
        console.warn(`Model candidate ${candidateModel} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (streamSuccess) {
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      const parsed = parseApiError(lastError);
      res.write(
        `data: ${JSON.stringify({
          error: parsed.message,
          errorType: parsed.type,
          status: parsed.status,
        })}\n\n`
      );
      res.end();
    }
  } catch (error: any) {
    console.error("Gemini API endpoint error:", error);
    const parsed = parseApiError(error);

    if (!res.headersSent) {
      return res.status(parsed.status).json({
        error: parsed.message,
        errorType: parsed.type,
        status: parsed.status,
      });
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: parsed.message,
          errorType: parsed.type,
          status: parsed.status,
        })}\n\n`
      );
      res.end();
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
