const SPARK_COUNT = 18;

export function PortalAtmosphere() {
  return (
    <div className="portal-atmosphere" aria-hidden>
      <div className="portal-atmosphere__orb portal-atmosphere__orb--emerald" />
      <div className="portal-atmosphere__orb portal-atmosphere__orb--gold" />
      <div className="portal-atmosphere__orb portal-atmosphere__orb--blue" />
      <div className="portal-glitter">
        {Array.from({ length: SPARK_COUNT }, (_, i) => (
          <span key={i} className="portal-glitter__spark" />
        ))}
      </div>
    </div>
  );
}
