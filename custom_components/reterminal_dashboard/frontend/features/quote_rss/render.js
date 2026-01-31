(function () {
    function render(element, widget, helpers) {
        const props = widget.props || {};
        const { getColorStyle } = helpers;

        const showAuthor = props.show_author !== false;
        const quoteFontSize = parseInt(props.quote_font_size || 18, 10);
        const authorFontSize = parseInt(props.author_font_size || 14, 10);
        const fontFamily = props.font_family || "Roboto";
        const fontWeight = parseInt(props.font_weight || 400, 10);
        const color = props.color || "black";
        const colorStyle = getColorStyle(color);
        const textAlign = props.text_align || "TOP_LEFT";
        const italicQuote = props.italic_quote !== false;

        // Sample quotes for fallback/loading
        const sampleQuotes = [
            { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
            { quote: "Two things are infinite: the universe and human stupidity.", author: "Albert Einstein" },
            { quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" }
        ];

        // Live Fetch Logic
        const feedUrl = props.feed_url || "https://www.brainyquote.com/link/quotebr.rss";

        // Use feed URL + widget ID hash to pick a sample (so changing URL changes the sample)
        const hashInput = (feedUrl || "") + (widget.id || "default");
        const hash = hashInput.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
        const sample = sampleQuotes[Math.abs(hash) % sampleQuotes.length];

        // Detect offline mode - file:// protocol or no HA backend
        const isOfflineMode = window.location.protocol === "file:" ||
            (typeof window.hasHaBackend === "function" && !window.hasHaBackend());

        window.quoteCache = window.quoteCache || {};
        window.quoteFetchTimers = window.quoteFetchTimers || {};

        // Use widget ID + feed URL as cache key to properly handle URL changes
        const cacheKey = widget.id + "|" + feedUrl;
        const fetchingKey = cacheKey + "_fetching";

        // Track the current feed URL for this widget to detect changes
        const lastUrlKey = widget.id + "_lastUrl";
        if (window.quoteCache[lastUrlKey] !== feedUrl) {
            // Feed URL changed - clear the old cache entry for this widget
            console.log("[Quote Widget] Feed URL changed for", widget.id, ":", window.quoteCache[lastUrlKey], "->", feedUrl);
            window.quoteCache[lastUrlKey] = feedUrl;
            // Cancel any pending fetch for this widget
            if (window.quoteFetchTimers[widget.id]) {
                clearTimeout(window.quoteFetchTimers[widget.id]);
                window.quoteFetchTimers[widget.id] = null;
            }
        }

        // If not cached and not fetching, fetch it
        if (!window.quoteCache[cacheKey] && !window.quoteCache[fetchingKey]) {
            console.log("[Quote Widget] Starting fetch for", feedUrl);
            window.quoteCache[fetchingKey] = true;
            // Capture values for the closure
            const fetchFeedUrl = feedUrl;
            const fetchCacheKey = cacheKey;
            const fetchFetchingKey = fetchingKey;

            // Debounce slightly to avoid rapid typing fetches
            window.quoteFetchTimers[widget.id] = setTimeout(async () => {
                console.log("[Quote Widget] Fetching:", fetchFeedUrl, "offline:", isOfflineMode);

                try {
                    let data;

                    if (isOfflineMode) {
                        // Use public CORS proxy for offline mode
                        const corsProxy = "https://api.allorigins.win/get?url=";
                        const response = await fetch(corsProxy + encodeURIComponent(fetchFeedUrl));
                        const result = await response.json();

                        if (result.contents) {
                            // Parse RSS XML
                            const parser = new DOMParser();
                            const xml = parser.parseFromString(result.contents, "text/xml");
                            const items = xml.querySelectorAll("item");

                            if (items.length > 0) {
                                // Pick a random item
                                const item = items[Math.floor(Math.random() * items.length)];
                                let quoteText = item.querySelector("title")?.textContent || "";
                                let author = "";

                                // Try to extract author
                                const creator = item.querySelector("creator");
                                if (creator) author = creator.textContent || "";

                                // Parse author from " - Author" pattern in title
                                if (!author && quoteText.includes(" - ")) {
                                    const parts = quoteText.split(" - ");
                                    if (parts.length >= 2) {
                                        author = parts.pop();
                                        quoteText = parts.join(" - ");
                                    }
                                }

                                data = { success: true, quote: { quote: quoteText.trim(), author: author.trim() } };
                            }
                        }
                    } else {
                        // Use Home Assistant backend proxy
                        const response = await fetch(`/api/reterminal_dashboard/rss_proxy?url=${encodeURIComponent(fetchFeedUrl)}`);
                        data = await response.json();
                    }

                    console.log("[Quote Widget] Response:", data);
                    if (data && data.success && data.quote) {
                        window.quoteCache[fetchCacheKey] = data.quote;
                        console.log("[Quote Widget] Cached quote:", data.quote);
                        // Trigger re-render
                        if (typeof window.emit === "function" && window.EVENTS) {
                            window.emit(window.EVENTS.STATE_CHANGED);
                        }
                    } else {
                        console.warn("[Quote Widget] No quote in response:", data);
                    }
                } catch (e) {
                    console.warn("[Quote Widget] Fetch Error:", e);
                } finally {
                    window.quoteCache[fetchFetchingKey] = false;
                    window.quoteFetchTimers[widget.id] = null;
                }
            }, 500);
        } else {
            console.log("[Quote Widget] Skipping fetch - cached:", !!window.quoteCache[cacheKey], "fetching:", !!window.quoteCache[fetchingKey]);
        }

        // Use cached data if available, otherwise sample
        const quoteData = window.quoteCache[cacheKey] || sample;
        const isLive = !!window.quoteCache[cacheKey];
        console.log("[Quote Widget] Using data:", isLive ? "LIVE" : "SAMPLE", quoteData);

        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.boxSizing = "border-box";
        element.style.padding = "8px";
        element.style.overflow = "hidden";
        element.style.fontFamily = fontFamily + ", serif";
        element.style.fontWeight = String(fontWeight);
        element.style.color = colorStyle;
        element.style.lineHeight = "1.3";

        // Horizontal Alignment
        if (textAlign.includes("CENTER")) {
            element.style.textAlign = "center";
            element.style.alignItems = "center";
        } else if (textAlign.includes("RIGHT")) {
            element.style.textAlign = "right";
            element.style.alignItems = "flex-end";
        } else {
            element.style.textAlign = "left";
            element.style.alignItems = "flex-start";
        }

        // Vertical Alignment
        if (textAlign.startsWith("CENTER")) {
            element.style.justifyContent = "center";
        } else if (textAlign.startsWith("BOTTOM")) {
            element.style.justifyContent = "flex-end";
        } else {
            element.style.justifyContent = "flex-start";
        }

        element.innerHTML = "";

        // Quote text
        const wordWrap = props.word_wrap !== false;
        const quoteDiv = document.createElement("div");
        quoteDiv.style.fontSize = quoteFontSize + "px";
        quoteDiv.style.fontStyle = italicQuote ? "italic" : "normal";
        quoteDiv.style.marginBottom = "8px";
        if (wordWrap) {
            quoteDiv.style.wordWrap = "break-word";
            quoteDiv.style.overflowWrap = "break-word";
            quoteDiv.style.whiteSpace = "normal";
        } else {
            quoteDiv.style.whiteSpace = "nowrap";
            quoteDiv.style.overflow = "hidden";
            quoteDiv.style.textOverflow = "ellipsis";
        }
        quoteDiv.textContent = '"' + quoteData.quote + '"';
        element.appendChild(quoteDiv);

        // Author
        if (showAuthor) {
            const authorDiv = document.createElement("div");
            authorDiv.style.fontSize = authorFontSize + "px";
            authorDiv.style.fontStyle = "normal";
            authorDiv.style.opacity = "0.8";
            authorDiv.textContent = "— " + quoteData.author;
            element.appendChild(authorDiv);
        }

        // Feed indicator
        const feedDiv = document.createElement("div");
        feedDiv.style.fontSize = "9px";
        feedDiv.style.opacity = "0.5";
        feedDiv.style.marginTop = "auto";
        feedDiv.style.paddingTop = "4px";
        try {
            const url = new URL(feedUrl);
            if (isOfflineMode) {
                feedDiv.textContent = "🔌 OFFLINE - " + url.hostname;
                feedDiv.title = "Live preview requires Home Assistant. Showing sample quote.";
            } else if (isLive) {
                feedDiv.textContent = "🟢 " + url.hostname;
                feedDiv.title = "Live from Feed";
            } else {
                feedDiv.textContent = "⚪ " + url.hostname;
                feedDiv.title = "Preview (Sample) - fetching...";
            }
        } catch {
            feedDiv.textContent = isOfflineMode ? "🔌 OFFLINE" : "📰 RSS Feed";
        }
        element.appendChild(feedDiv);
    }

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register('quote_rss', { render: render });
    }
})();
