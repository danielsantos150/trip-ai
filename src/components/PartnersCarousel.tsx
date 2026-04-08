const partners = [
  "LATAM", "GOL", "Azul", "Iberia", "TAP",
  "Accor", "Marriott", "Hilton", "IHG", "Booking",
];

const PartnersCarousel = () => (
  <section className="py-12 bg-background border-t">
    <div className="container mx-auto px-4">
      <p className="text-center text-sm text-muted-foreground mb-6">
        Parceiros e companhias
      </p>
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {partners.map((name) => (
          <div
            key={name}
            className="px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm font-medium hover:bg-muted transition-colors cursor-default"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersCarousel;
