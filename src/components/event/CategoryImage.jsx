import { useState } from "react";
import { Image } from "@/components/ui/image";
import { categoryImage } from "@/lib/eventTypes";

/**
 * Renders a celebration photo and, if the stored image is missing or fails to
 * load, swaps in that specific event category's own photo instead of a generic
 * placeholder.
 */
export default function CategoryImage({ src, eventType, alt, ...rest }) {
  const fallback = categoryImage(eventType);
  const source = src || fallback;
  const [override, setOverride] = useState(null);
  const value = override && override.source === source ? override.value : source;

  return (
    <Image
      {...rest}
      src={value}
      alt={alt}
      onError={() => {
        if (fallback && fallback !== source) {
          setOverride({ source, value: fallback });
        }
      }}
    />
  );
}