import { useEffect } from "react";

function ensureDescriptionTag() {
  let tag = document.querySelector('meta[name="description"]');

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }

  return tag;
}

export function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      ensureDescriptionTag().setAttribute("content", description);
    }
  }, [title, description]);
}
