import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a84215708d7de5f6c35e173/58214a172_11.jpg";

export default function Logo({ height = 120, className = "" }) {
  return (
    <img
      src={LOGO_URL}
      alt="Chevillette.fr"
      style={{ height: `${height}px`, width: "auto" }}
      className={className}
    />
  );
}