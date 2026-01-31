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

        // Sample quotes for preview
        const sampleQuotes = [
            { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
        ];

        // Pick a random sample quote for preview
        const sample = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];

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
        const quoteDiv = document.createElement("div");
        quoteDiv.style.fontSize = quoteFontSize + "px";
        quoteDiv.style.fontStyle = italicQuote ? "italic" : "normal";
        quoteDiv.style.marginBottom = "8px";
        quoteDiv.style.wordWrap = "break-word";
        quoteDiv.style.overflowWrap = "break-word";
        quoteDiv.textContent = '"' + sample.quote + '"';
        element.appendChild(quoteDiv);

        // Author
        if (showAuthor) {
            const authorDiv = document.createElement("div");
            authorDiv.style.fontSize = authorFontSize + "px";
            authorDiv.style.fontStyle = "normal";
            authorDiv.style.opacity = "0.8";
            authorDiv.textContent = "— " + sample.author;
            element.appendChild(authorDiv);
        }

        // Feed indicator
        const feedUrl = props.feed_url || "https://www.brainyquote.com/link/quotebr.rss";
        const feedDiv = document.createElement("div");
        feedDiv.style.fontSize = "9px";
        feedDiv.style.opacity = "0.5";
        feedDiv.style.marginTop = "auto";
        feedDiv.style.paddingTop = "4px";
        try {
            const url = new URL(feedUrl);
            feedDiv.textContent = "📰 " + url.hostname;
        } catch {
            feedDiv.textContent = "📰 RSS Feed";
        }
        element.appendChild(feedDiv);
    }

    // Register with FeatureRegistry
    if (window.FeatureRegistry) {
        window.FeatureRegistry.register('quote_rss', { render: render });
    }
})();
