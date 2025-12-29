import React from 'react';

const Gallery: React.FC = () => {
  // Using different aspect ratios via picsum dimensions to simulate masonry feel
  const images = [
    { url: "https://picsum.photos/id/225/400/600", caption: "Interactive Stories" },
    { url: "https://picsum.photos/id/292/400/300", caption: "Dilly Doubles" },
    { url: "https://picsum.photos/id/364/400/400", caption: "Cultural Flashcards" },
    { url: "https://picsum.photos/id/106/400/500", caption: "Fun Facts" },
    { url: "https://picsum.photos/id/40/400/300", caption: "Coloring Pages" },
    { url: "https://picsum.photos/id/249/400/400", caption: "Stickers & Badges" },
  ];

  return (
    <section id="examples" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-deep font-bold tracking-widest text-sm uppercase mb-2 block">Real Content Examples</span>
          <h2 className="font-heading font-bold text-4xl text-text mb-4">
            See What's Inside!
          </h2>
          <p className="text-textLight text-lg">
            Real pages from our magical storybooks and collectible cultural flashcards.
          </p>
        </div>

        {/* Masonry-style grid using columns */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, idx) => (
            <div key={idx} className="break-inside-avoid relative group overflow-hidden rounded-2xl shadow-lg bg-white">
              <img 
                src={img.url} 
                alt={img.caption} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-heading font-bold text-lg">{img.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;