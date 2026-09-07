export default function BlogHomeFeedItemThumbnailLayout({ thumbnailUrl }) {
  if (!thumbnailUrl) return null;

  return (
    <img
      src={thumbnailUrl}
      alt=""
      className="aspect-[16/10] h-auto w-full rounded-2xl object-cover"
    />
  );
}
