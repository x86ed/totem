import React from "react";
import Avatar from "boring-avatars";

// /icon?value=SomeName or /icon#SomeName
const AvatarIconRoute: React.FC = () => {
  // Try query param first, then hash
  let value = "";
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    value = params.get("value") || decodeURIComponent(window.location.hash.replace(/^#/, "")) || "";
  }
  if (!value) value = "totem";

  // Render only the SVG, no extra chrome
  return (
    <div style={{ display: "inline-block", background: "none" }}>
      <Avatar
        name={value}
        colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
        variant="pixel"
        style={{ width: "2em", height: "2em", verticalAlign: "middle", margin: ".25em", background: "none" }}
        square
      />
    </div>
  );
};

export default AvatarIconRoute;
