import { useEffect } from "react";

const SITE_URL = "https://chevillette.fr";
const SITE_NAME = "Chevillette.fr";

function setMeta(doc, attr, key, content) {
  let el = doc.head.querySelector("meta[" + attr + '="' + key + '"]');
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = doc.createElement("meta");
    el.setAttribute(attr, key);
    doc.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(doc, href) {
  let el = doc.head.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = doc.createElement("link");
    el.setAttribute("rel", "canonical");
    doc.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applySeo(doc, { title, description = "", path = "/", noindex = false }) {
  doc.title = title;
  setMeta(doc, "name", "description", description);
  setMeta(doc, "name", "robots", noindex ? "noindex, nofollow" : "");
  const url = SITE_URL && !noindex ? SITE_URL + path : "";
  setCanonical(doc, url);
  setMeta(doc, "property", "og:title", title);
  setMeta(doc, "property", "og:description", description);
  setMeta(doc, "property", "og:url", url);
  setMeta(doc, "property", "og:type", "website");
  setMeta(doc, "property", "og:locale", "fr_FR");
  setMeta(doc, "property", "og:site_name", SITE_NAME);
  setMeta(doc, "name", "twitter:card", "summary");
}

export default function useSeo({ title, description, path, noindex }) {
  useEffect(() => {
    applySeo(document, { title, description, path, noindex });
  }, [title, description, path, noindex]);
}