import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: "Trinium Energy System | Civis Tech Global" }],
  }),
});

const MODELS = [
  {
    to: "/unit",
    index: "01",
    title: "Unit",
    meta: "40 ft high-cube",
    body: "Four hubs, shared tanks, utility zone.",
    image: "/home/unit.jpg",
  },
  {
    to: "/facility",
    index: "02",
    title: "Facility",
    meta: "120 × 100 ft hall",
    body: "Seven 10-hub banks, water, power, operations.",
    image: "/home/facility.jpg",
  },
  {
    to: "/teardown",
    index: "03",
    title: "Teardown",
    meta: "One hub",
    body: "Labeled parts, including the control board.",
    image: "/home/teardown.jpg",
  },
] as const;

function Home() {
  return (
    <div className="site-home">
      <header className="sheet-head">
        <img src="/brand/civis-mark.svg" alt="" className="mark" />
        <div>
          <p className="sheet-co">Civis Tech Global</p>
          <a href="https://www.civistechglobal.com/">www.civistechglobal.com</a>
        </div>
        <p className="sheet-doc">
          TES-VIS-001
          <br />
          System model
        </p>
      </header>
      <section className="sheet-title">
        <p>Trinium Energy System</p>
        <h1>TES</h1>
        <p>Interactive model of the standard unit, the industrial facility, and one hub taken apart.</p>
      </section>
      <ol className="sheet-index">
        {MODELS.map((item) => (
          <li key={item.to}>
            <Link to={item.to}>
              <span>{item.index}</span>
              <img src={item.image} alt="" />
              <strong>{item.title}</strong>
              <em>{item.meta}</em>
              <p>{item.body}</p>
              <b>Open</b>
            </Link>
          </li>
        ))}
      </ol>
      <footer className="sheet-block">
        <p>Illustrative system model. Preliminary visual representation. Not a fabrication drawing.</p>
        <p>Civis Tech Global · Confidential visual</p>
      </footer>
    </div>
  );
}
