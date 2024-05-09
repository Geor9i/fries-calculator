export const patterns = {
    whitespace: /\s/,
    element: /<(?<tagName>\w+)[^<>]*[\/\s]?>[\s\S]*?<\/\k<tagName>>|<(?<tagname>\w+)[^<>\/]*[\/\s]?>/g,
    text: /[^<>]/g,
    tag: /<\/?(?<tagName>\w+)[^<>]*?>/g,
    openingTag: /<(?<tagName>\w+)[^<>\/]*?>/,
    closingTag: /<\/(?<tagName>\w+)\s*>/,
    selfClosingTag: /<(?<tagName>\w+)[^<>]*[\/\s]?>/,
    commentTag: /<!--.+?-->/g,
    attribute: /\s+(?<attribute>[-@%&$£*#a-z]+)(?:\s*="(?<value>[^"]*)")?/g
  }
  export const selfClosingTags = [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ];

    export const validHTMLElements = [
      "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button",
      "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt",
      "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html",
      "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", "nav", "noscript",
      "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s",
      "samp", "script", "section", "select", "slot", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody",
      "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"
  ];
  